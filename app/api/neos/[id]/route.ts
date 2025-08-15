import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchNeoDetail } from "@/lib/nasa";

// In-memory cache with TTL of 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
type CacheEntry = {
  data: unknown;
  timestamp: number;
};
const cache = new Map<string, CacheEntry>();

// Query parameters schema
const QuerySchema = z.object({
  orbital: z.enum(["true", "false"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get and validate the asteroid ID
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Asteroid ID is required" },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const orbital = searchParams.get("orbital") === "true";

    const validationResult = QuerySchema.safeParse({
      orbital: orbital ? "true" : "false",
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `${id}|${orbital}`;
    
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
    const neoDetail = await fetchNeoDetail(id, orbital);
    
    // Cache the result
    cache.set(cacheKey, {
      data: neoDetail,
      timestamp: Date.now(),
    });

    // Return the data
    return NextResponse.json(neoDetail, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching NEO detail:", error);
    
    // Handle NASA API specific errors
    const err = error as { status?: number; headers?: { get: (name: string) => string | null }; message?: string };
    
    if (err.status === 401) {
      return NextResponse.json(
        { error: "NASA API key is invalid or missing" },
        { status: 401 }
      );
    } else if (err.status === 404) {
      return NextResponse.json(
        { error: "Asteroid not found" },
        { status: 404 }
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
      { error: "Failed to fetch NEO detail", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
