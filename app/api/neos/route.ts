import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchNeoFeed, normalizeNeoData } from "@/lib/nasa";

// Configure this route as dynamic since it needs to handle query parameters
export const dynamic = 'force-dynamic';

// Add runtime configuration
export const runtime = 'nodejs';

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

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
  sort: z.enum(["approach_asc", "approach_desc", "size_asc", "size_desc"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check if NASA API key is set
    if (!process.env.NASA_API_KEY) {
      console.error("NASA_API_KEY is missing in environment variables");
      return NextResponse.json(
        { error: "NASA API key is not configured" },
        { status: 500 }
      );
    }
    
    // Get default dates
    const today = new Date();
    const defaultStartDate = formatDate(today);
    
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    const defaultEndDate = formatDate(weekLater);
    
    // Extract parameters from URL or use defaults
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start_date") || defaultStartDate;
    const endDate = url.searchParams.get("end_date") || defaultEndDate;
    const hazardousParam = url.searchParams.get("hazardous") ?? undefined;
    const sortParam = (url.searchParams.get("sort") as "approach_asc" | "approach_desc" | "size_asc" | "size_desc" | null) ?? "approach_asc";

    const validationResult = QuerySchema.safeParse({
      start_date: startDate,
      end_date: endDate,
      hazardous: hazardousParam,
      sort: sortParam,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Use validated values
    const { start_date, end_date, hazardous, sort } = validationResult.data;
    
    // Validate date range (NASA API limits to 7 days)
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const daysDiff = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
    
    if (daysDiff < 0) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }
    
    if (daysDiff > 7) {
      return NextResponse.json(
        { error: "Date range cannot exceed 7 days (NASA API limitation)" },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `${start_date}|${end_date}|${hazardous ?? ""}|${sort}`;
    
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
    const neoData = await fetchNeoFeed(start_date, end_date);
    
    // Normalize the data
    const normalizedData = normalizeNeoData(
      neoData, 
      hazardous === "true", 
      sort as "approach_asc" | "approach_desc" | "size_asc" | "size_desc"
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
    // Detailed error logging
    console.error("Error fetching NEO data:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Handle NASA API specific errors
    const err = error as { status?: number; code?: string; cause?: Error; headers?: { get: (name: string) => string | null }; message?: string };
    
    // Handle network connectivity errors
    if (err.message?.includes('fetch failed') || 
        err.code === 'ENOTFOUND' || 
        err.code === 'ECONNREFUSED' ||
        err.cause?.message?.includes('getaddrinfo')) {
      
      console.warn("Network connectivity issue detected, using fallback data");
      
      // The fetchNeoFeed function should have already used fallback data
      // This code should not be reached, but just in case:
      return NextResponse.json(
        { 
          error: "Network connectivity issue", 
          message: "Using cached or fallback data",
          warning: "Limited or potentially outdated data available due to network issues"
        },
        { status: 200 } // Still return 200 since we're providing data
      );
    }
    
    // Handle API authentication errors
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
