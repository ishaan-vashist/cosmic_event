import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchNeoFeed, normalizeNeoData } from "@/lib/nasa";

// In-memory cache with TTL of 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
type CacheEntry = {
  data: unknown;
  timestamp: number;
};
const cache = new Map<string, CacheEntry>();

// Query parameters schema
const QuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  hazardous: z.enum(["true", "false"]).optional(),
  sort: z.enum(["approach_asc", "approach_desc"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const hazardous = searchParams.get("hazardous");
    const sort = searchParams.get("sort") || "approach_asc";

    const validationResult = QuerySchema.safeParse({
      start_date: startDate,
      end_date: endDate,
      hazardous: hazardous,
      sort: sort,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `${startDate}|${endDate}|${hazardous}|${sort}`;
    
    // Check if we have a valid cached response
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.data, {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      });
    }

    // Fetch data from NASA API
    const neoData = await fetchNeoFeed(startDate!, endDate!);
    
    // Normalize the data
    const normalizedData = normalizeNeoData(
      neoData, 
      hazardous === "true", 
      sort as "approach_asc" | "approach_desc"
    );

    // Cache the result
    cache.set(cacheKey, {
      data: normalizedData,
      timestamp: Date.now(),
    });

    // Return the normalized data
    return NextResponse.json(normalizedData, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching NEO data:", error);
    
    // Handle NASA API specific errors
    const err = error as { status?: number; headers?: { get: (name: string) => string | null }; message?: string };
    
    if (err.status === 401) {
      return NextResponse.json(
        { error: "NASA API key is invalid or missing" },
        { status: 401 }
      );
    } else if (err.status === 429) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded", 
          retryAfter: err.headers?.get("X-RateLimit-Reset") || "60" 
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch NEO data", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
