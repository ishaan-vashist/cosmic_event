"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { DayGroup, NeoFeedParams } from "@/types/neo";

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
  const [error, setError] = useState<Error | null>(null);

  /**
   * Formats dates for API requests
   */
  const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

  /**
   * Fetches NEO data from the API
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch NEO data"));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, hazardousOnly, sortOrder]);

  /**
   * Loads more data by extending the date range
   */
  const loadMore = useCallback(async (newEndDate: Date) => {
    try {
      setIsLoadingMore(true);
      setError(null);

      const params = new URLSearchParams({
        start_date: formatDate(endDate),
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
        throw new Error(`Failed to fetch more data: ${response.statusText}`);
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
      setError(err instanceof Error ? err : new Error("Failed to load more data"));
    } finally {
      setIsLoadingMore(false);
    }
  }, [endDate, hazardousOnly, sortOrder]);

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
