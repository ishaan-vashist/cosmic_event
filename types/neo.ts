/**
 * Represents a close approach of a Near-Earth Object
 */
export interface Approach {
  /** ISO datetime string of the approach */
  datetime: string | null;
  /** Epoch timestamp of the approach */
  epoch?: number | null;
  /** Velocity in kilometers per second */
  velocityKps?: number | null;
  /** Miss distance in kilometers */
  missDistanceKm?: number | null;
  /** The body being orbited */
  orbitingBody?: string | null;
}

/**
 * Represents a Near-Earth Object (asteroid/comet)
 */
export interface NEO {
  /** Unique identifier from NASA */
  id: string;
  /** Name of the NEO */
  name: string;
  /** Whether the NEO is potentially hazardous */
  hazardous: boolean;
  /** Average diameter in kilometers */
  avgDiameterKm: number | null;
  /** The nearest approach data */
  nearestApproach: Approach | null;
  /** Total number of approaches */
  approachesCount: number;
  /** NASA JPL URL for more information */
  nasaUrl: string;
  /** All approaches data (optional) */
  approaches?: Approach[];
  /** Orbital data (optional, fetched separately) */
  orbital_data?: Record<string, string | number | null | undefined>;
}

/**
 * Represents a group of NEOs by date
 */
export interface DayGroup {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Number of NEOs on this date */
  count: number;
  /** List of NEOs for this date */
  neos: NEO[];
}

/**
 * Sort options for NEO listing
 */
export type SortOrder = "approach_asc" | "approach_desc" | "size_asc" | "size_desc";

/**
 * Parameters for NEO feed API
 */
export interface NeoFeedParams {
  startDate: Date;
  endDate: Date;
  hazardousOnly: boolean;
  sortOrder: SortOrder;
}
