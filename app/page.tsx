"use client";

import { useState, useEffect } from "react";
import FilterBar from "@/components/FilterBar";
import EventList from "@/components/EventList";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";
import { SortOrder, DayGroup } from "@/types/neo";
import { useNeoFeed } from "@/hooks/useNeoFeed";
import { useSearchParams, useRouter } from "next/navigation";
import { addDays, format } from "date-fns";

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
  }: {
    data: DayGroup[];
    isLoading: boolean;
    error: Error | null;
    loadMore: (newEndDate: Date) => Promise<void>;
    isLoadingMore: boolean;
    refetch: () => Promise<void>;
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

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Handle load more
  const handleLoadMore = () => {
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
