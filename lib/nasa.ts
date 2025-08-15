import { format } from "date-fns";
import { z } from "zod";
import { NEO, DayGroup, Approach, SortOrder } from "@/types/neo";

// NASA API base URL
const NASA_API_BASE = "https://api.nasa.gov/neo/rest/v1";

/**
 * Schema for validating NASA API response structure
 */
const NasaApproachSchema = z.object({
  close_approach_date: z.string(),
  close_approach_date_full: z.string().nullable().optional(),
  epoch_date_close_approach: z.number().nullable().optional(),
  relative_velocity: z.object({
    kilometers_per_second: z.string().nullable().optional(),
  }).optional(),
  miss_distance: z.object({
    kilometers: z.string().nullable().optional(),
  }).optional(),
  orbiting_body: z.string().nullable().optional(),
});

const NasaNeoSchema = z.object({
  id: z.string(),
  neo_reference_id: z.string(),
  name: z.string(),
  nasa_jpl_url: z.string().url().nullable().optional(),
  is_potentially_hazardous_asteroid: z.boolean(),
  estimated_diameter: z.object({
    kilometers: z.object({
      estimated_diameter_min: z.number(),
      estimated_diameter_max: z.number(),
    }),
  }),
  close_approach_data: z.array(NasaApproachSchema),
});

const NasaFeedSchema = z.object({
  element_count: z.number(),
  near_earth_objects: z.record(z.string(), z.array(NasaNeoSchema)),
});

const NasaDetailSchema = NasaNeoSchema.extend({
  orbital_data: z.record(z.string(), z.any()).optional(),
});

/**
 * Fetches NEO feed data from NASA API for a given date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Raw NASA API response
 */
export async function fetchNeoFeed(startDate: string, endDate: string): Promise<z.infer<typeof NasaFeedSchema>> {
  const apiKey = process.env.NASA_API_KEY;
  
  if (!apiKey) {
    throw new Error("NASA_API_KEY is not defined in environment variables");
  }
  
  const url = `${NASA_API_BASE}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error(`NASA API error: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).headers = response.headers;
    throw error;
  }
  
  const data = await response.json();
  
  // Validate response structure
  const validationResult = NasaFeedSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("NASA API response validation failed:", validationResult.error);
    throw new Error("Invalid response format from NASA API");
  }
  
  return data;
}

/**
 * Fetches detailed information about a specific NEO
 * @param id - NEO ID
 * @param withOrbit - Whether to include orbital data
 * @returns Normalized NEO detail
 */
export async function fetchNeoDetail(id: string, withOrbit: boolean): Promise<NEO> {
  const apiKey = process.env.NASA_API_KEY;
  
  if (!apiKey) {
    throw new Error("NASA_API_KEY is not defined in environment variables");
  }
  
  const url = `${NASA_API_BASE}/neo/${id}?api_key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error(`NASA API error: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).headers = response.headers;
    throw error;
  }
  
  const data = await response.json();
  
  // Validate response structure
  const validationResult = NasaDetailSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("NASA API response validation failed:", validationResult.error);
    throw new Error("Invalid response format from NASA API");
  }
  
  // Convert to our normalized format
  const neo = normalizeNeo(data);
  
  // Include all approaches
  neo.approaches = data.close_approach_data.map(normalizeApproach);
  
  // Include orbital data if requested
  if (withOrbit && data.orbital_data) {
    neo.orbital_data = data.orbital_data;
  }
  
  return neo;
}

/**
 * Normalizes NASA API response into our application format
 * @param data - Raw NASA API response
 * @param hazardousOnly - Filter to only hazardous NEOs
 * @param sortOrder - Sort order for approaches
 * @returns Array of day groups with normalized NEOs
 */
export function normalizeNeoData(
  data: z.infer<typeof NasaFeedSchema>, 
  hazardousOnly: boolean = false,
  sortOrder: SortOrder = "approach_asc"
): DayGroup[] {
  const { near_earth_objects } = data;
  
  // Convert to day groups
  const dayGroups: DayGroup[] = Object.entries(near_earth_objects)
    .map(([date, neos]: [string, z.infer<typeof NasaNeoSchema>[]])=> {
      // Filter and normalize NEOs
      const normalizedNeos = neos
        .filter((neo: z.infer<typeof NasaNeoSchema>) => !hazardousOnly || neo.is_potentially_hazardous_asteroid)
        .map(normalizeNeo);
      
      // Sort NEOs by approach date if requested
      if (sortOrder === "approach_asc") {
        normalizedNeos.sort((a: NEO, b: NEO) => {
          if (!a.nearestApproach?.epoch) return 1;
          if (!b.nearestApproach?.epoch) return -1;
          return a.nearestApproach.epoch - b.nearestApproach.epoch;
        });
      } else if (sortOrder === "approach_desc") {
        normalizedNeos.sort((a: NEO, b: NEO) => {
          if (!a.nearestApproach?.epoch) return 1;
          if (!b.nearestApproach?.epoch) return -1;
          return b.nearestApproach.epoch - a.nearestApproach.epoch;
        });
      }
      
      return {
        date,
        count: normalizedNeos.length,
        neos: normalizedNeos,
      };
    })
    // Sort day groups by date (ascending)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return dayGroups;
}

/**
 * Normalizes a single NEO from NASA API format to our application format
 * @param neo - Raw NEO data from NASA API
 * @returns Normalized NEO object
 */
export function normalizeNeo(neo: any): NEO {
  // Calculate average diameter
  const minDiameter = neo.estimated_diameter?.kilometers?.estimated_diameter_min;
  const maxDiameter = neo.estimated_diameter?.kilometers?.estimated_diameter_max;
  const avgDiameterKm = minDiameter && maxDiameter 
    ? (minDiameter + maxDiameter) / 2 
    : null;
  
  // Find nearest approach (earliest by epoch)
  const approaches = neo.close_approach_data || [];
  let nearestApproach: Approach | null = null;
  
  if (approaches.length > 0) {
    // Sort by epoch and take the earliest
    const sortedApproaches = [...approaches].sort((a, b) => {
      const epochA = a.epoch_date_close_approach || Number.MAX_SAFE_INTEGER;
      const epochB = b.epoch_date_close_approach || Number.MAX_SAFE_INTEGER;
      return epochA - epochB;
    });
    
    nearestApproach = normalizeApproach(sortedApproaches[0]);
  }
  
  return {
    id: neo.id,
    name: neo.name,
    hazardous: neo.is_potentially_hazardous_asteroid,
    avgDiameterKm,
    nearestApproach,
    approachesCount: approaches.length,
    nasaUrl: neo.nasa_jpl_url || "",
  };
}

/**
 * Normalizes approach data from NASA API format
 * @param approach - Raw approach data from NASA API
 * @returns Normalized approach object
 */
export function normalizeApproach(approach: any): Approach {
  return {
    datetime: approach.close_approach_date_full || approach.close_approach_date || null,
    epoch: approach.epoch_date_close_approach,
    velocityKps: approach.relative_velocity?.kilometers_per_second 
      ? parseFloat(approach.relative_velocity.kilometers_per_second)
      : null,
    missDistanceKm: approach.miss_distance?.kilometers 
      ? parseFloat(approach.miss_distance.kilometers)
      : null,
    orbitingBody: approach.orbiting_body || null,
  };
}
