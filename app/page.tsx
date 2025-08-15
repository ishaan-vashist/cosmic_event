"use client";

import { useState, useEffect, useCallback } from "react";
import FilterBar from "@/components/FilterBar";
import EventList from "@/components/EventList";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";
import { SortOrder, DayGroup } from "@/types/neo";
import { useNeoFeed } from "@/hooks/useNeoFeed";
import { useSearchParams, useRouter } from "next/navigation";
import { addDays, format, differenceInDays } from "date-fns";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get filter parameters from URL
  const hazardousParam = searchParams.get("hazardous");
  const sortParam = searchParams.get("sort") || "approach_asc";
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");

  // Set initial filter states
  const [hazardousOnly, setHazardousOnly] = useState(hazardousParam === "true");
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    sortParam === "approach_desc" ? "approach_desc" : "approach_asc"
  );
  
  // Set initial date range (today to +7 days)
  const today = new Date();
  const [startDate, setStartDate] = useState(
    startDateParam ? new Date(startDateParam) : today
  );
  const [endDate, setEndDate] = useState(
    endDateParam ? new Date(endDateParam) : addDays(today, 7)
  );

  // Fetch NEO data using custom hook
  const { 
    data, 
    isLoading, 
    error, 
    loadMore, 
    isLoadingMore, 
    refetch 
  } = useNeoFeed({
    startDate,
    endDate,
    hazardousOnly,
    sortOrder,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (hazardousOnly) params.set("hazardous", "true");
    params.set("sort", sortOrder);
    params.set("start_date", format(startDate, "yyyy-MM-dd"));
    params.set("end_date", format(endDate, "yyyy-MM-dd"));
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [hazardousOnly, sortOrder, startDate, endDate, router]);

  // Handle filter changes
  const handleHazardousChange = (checked: boolean) => {
    setHazardousOnly(checked);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value as SortOrder);
  };

  // Validate date range against NASA API limitations
  const validateDateRange = useCallback((start: Date, end: Date): boolean => {
    // Calculate difference in days
    const daysDiff = differenceInDays(end, start);
    
    // NASA API has a 7-day limit
    return daysDiff >= 0 && daysDiff <= 7;
  }, []);

  // Handle date range changes
  const handleDateRangeChange = (start: Date, end: Date) => {
    // Enforce the 7-day limit
    if (!validateDateRange(start, end)) {
      // If range exceeds 7 days, adjust the end date
      const adjustedEnd = addDays(start, 7);
      setStartDate(start);
      setEndDate(adjustedEnd);
      // Show a notification or alert here if desired
      alert("Date range limited to 7 days due to NASA API limitations");
    } else {
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    // Load exactly 7 more days to stay within API limits
    const newEndDate = addDays(endDate, 7);
    setEndDate(newEndDate);
    loadMore(newEndDate);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Near-Earth Objects Tracker</h1>
      
      <FilterBar 
        hazardousOnly={hazardousOnly}
        onHazardousChange={handleHazardousChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />
      
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState 
          message={error.message || "Failed to load data"} 
          onRetry={refetch}
          suggestion={error.suggestion}
          errorType={error.type}
        />
      ) : (
        <>
          <EventList dayGroups={data} />
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
