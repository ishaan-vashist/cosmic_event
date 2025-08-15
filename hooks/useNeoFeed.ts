"use client";

import { useState, useEffect, useCallback } from "react";
import { format, differenceInDays } from "date-fns";
import { DayGroup, NeoFeedParams } from "@/types/neo";

interface ApiError {
  message: string;
  type: 'api' | 'date' | 'network' | 'general';
  suggestion?: string;
}

/**
 * Custom hook for fetching and managing NEO feed data
 */
export function useNeoFeed({
  startDate,
  endDate,
  hazardousOnly,
  sortOrder,
}: NeoFeedParams) {
  const [data, setData] = useState<DayGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Formats dates for API requests
   */
  const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

  /**
   * Validates date range against NASA API limitations
   */
  const validateDateRange = useCallback((start: Date, end: Date): { valid: boolean; reason?: string } => {
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, reason: "Invalid date format" };
    }
    
    // Check if end date is after start date
    if (end < start) {
      return { valid: false, reason: "End date must be after start date" };
    }
    
    // Calculate difference in days
    const daysDiff = differenceInDays(end, start);
    
    // NASA API has a 7-day limit
    if (daysDiff > 7) {
      return { valid: false, reason: "Date range exceeds NASA API's 7-day limit" };
    }
    
    return { valid: true };
  }, []);

  /**
   * Fetches NEO data from the API
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate date range
      const validation = validateDateRange(startDate, endDate);
      if (!validation.valid) {
        throw {
          message: validation.reason || "Invalid date range",
          type: 'date',
          suggestion: "Try selecting a date range of 7 days or less"
        } as ApiError;
      }

      const params = new URLSearchParams({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      });

      if (hazardousOnly) {
        params.append("hazardous", "true");
      }

      if (sortOrder) {
        params.append("sort", sortOrder);
      }

      const response = await fetch(`/api/neos?${params.toString()}`);

      if (!response.ok) {
        // Try to get more detailed error information
        let errorMessage = `Failed to fetch data: ${response.statusText}`;
        let errorType: 'api' | 'date' | 'network' | 'general' = 'api';
        let suggestion: string | undefined;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
            
            // Determine error type based on status code or message content
            if (response.status === 400 && errorMessage.toLowerCase().includes('date')) {
              errorType = 'date';
              suggestion = "Check that your date range is valid and doesn't exceed 7 days";
            } else if (response.status === 500) {
              errorType = 'api';
              suggestion = "The NASA API might be experiencing issues. Try again later.";
            } else if (response.status === 404) {
              errorType = 'api';
              suggestion = "The requested resource was not found.";
            }
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
          if (response.status === 0 || !navigator.onLine) {
            errorType = 'network';
            suggestion = "Check your internet connection and try again.";
          }
        }
        
        throw {
          message: errorMessage,
          type: errorType,
          suggestion
        } as ApiError;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err && typeof err === 'object' && 'type' in err) {
        setError(err as ApiError);
      } else if (err instanceof Error) {
        setError({
          message: err.message,
          type: 'general'
        });
      } else {
        setError({
          message: "Failed to fetch NEO data",
          type: 'general'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, hazardousOnly, sortOrder, validateDateRange]);

  /**
   * Loads more data by extending the date range
   */
  const loadMore = useCallback(async (newEndDate: Date) => {
    try {
      setIsLoadingMore(true);
      setError(null);
      
      // Use current endDate as new startDate
      const newStartDate = new Date(endDate);
      
      // Validate the new date range
      const validation = validateDateRange(newStartDate, newEndDate);
      if (!validation.valid) {
        throw {
          message: validation.reason || "Invalid date range for loading more data",
          type: 'date',
          suggestion: "Try loading smaller chunks of data (7 days or less)"
        } as ApiError;
      }

      const params = new URLSearchParams({
        start_date: formatDate(newStartDate),
        end_date: formatDate(newEndDate),
      });

      if (hazardousOnly) {
        params.append("hazardous", "true");
      }

      if (sortOrder) {
        params.append("sort", sortOrder);
      }

      const response = await fetch(`/api/neos?${params.toString()}`);

      if (!response.ok) {
        // Try to get more detailed error information
        let errorMessage = `Failed to fetch more data: ${response.statusText}`;
        let errorType: 'api' | 'date' | 'network' | 'general' = 'api';
        let suggestion: string | undefined;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
            
            // Determine error type based on status code or message content
            if (response.status === 400 && errorMessage.toLowerCase().includes('date')) {
              errorType = 'date';
              suggestion = "Check that your date range is valid and doesn't exceed 7 days";
            } else if (response.status === 500) {
              errorType = 'api';
              suggestion = "The NASA API might be experiencing issues. Try again later.";
            }
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
          if (response.status === 0 || !navigator.onLine) {
            errorType = 'network';
            suggestion = "Check your internet connection and try again.";
          }
        }
        
        throw {
          message: errorMessage,
          type: errorType,
          suggestion
        } as ApiError;
      }

      const newData = await response.json();
      
      // Merge new data with existing data
      setData(prevData => {
        // Create a map of existing dates to avoid duplicates
        const existingDates = new Map(prevData.map(group => [group.date, group]));
        
        // Merge new data
        newData.forEach((group: DayGroup) => {
          if (existingDates.has(group.date)) {
            // Merge NEOs for existing dates
            const existingGroup = existingDates.get(group.date)!;
            const existingIds = new Set(existingGroup.neos.map(neo => neo.id));
            
            // Add only new NEOs
            group.neos.forEach(neo => {
              if (!existingIds.has(neo.id)) {
                existingGroup.neos.push(neo);
                existingGroup.count++;
              }
            });
            
            // Re-sort if needed
            if (sortOrder === "approach_asc") {
              existingGroup.neos.sort((a, b) => {
                if (!a.nearestApproach?.epoch) return 1;
                if (!b.nearestApproach?.epoch) return -1;
                return a.nearestApproach.epoch - b.nearestApproach.epoch;
              });
            } else if (sortOrder === "approach_desc") {
              existingGroup.neos.sort((a, b) => {
                if (!a.nearestApproach?.epoch) return 1;
                if (!b.nearestApproach?.epoch) return -1;
                return b.nearestApproach.epoch - a.nearestApproach.epoch;
              });
            } else if (sortOrder === "size_asc") {
              existingGroup.neos.sort((a, b) => {
                if (a.avgDiameterKm === null) return 1;
                if (b.avgDiameterKm === null) return -1;
                return a.avgDiameterKm - b.avgDiameterKm;
              });
            } else if (sortOrder === "size_desc") {
              existingGroup.neos.sort((a, b) => {
                if (a.avgDiameterKm === null) return 1;
                if (b.avgDiameterKm === null) return -1;
                return b.avgDiameterKm - a.avgDiameterKm;
              });
            }
          } else {
            // Add new date group
            existingDates.set(group.date, group);
          }
        });
        
        // Convert map back to array and sort by date
        return Array.from(existingDates.values()).sort((a, b) => 
          a.date.localeCompare(b.date)
        );
      });
    } catch (err) {
      if (err && typeof err === 'object' && 'type' in err) {
        setError(err as ApiError);
      } else if (err instanceof Error) {
        setError({
          message: err.message,
          type: 'general'
        });
      } else {
        setError({
          message: "Failed to load more data",
          type: 'general'
        });
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [endDate, hazardousOnly, sortOrder, validateDateRange]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    refetch: fetchData,
    loadMore,
  };
}
