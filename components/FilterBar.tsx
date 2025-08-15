"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { SortOrder } from "@/types/neo";

interface FilterBarProps {
  hazardousOnly: boolean;
  onHazardousChange: (checked: boolean) => void;
  sortOrder: SortOrder;
  onSortChange: (value: string) => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export default function FilterBar({
  hazardousOnly,
  onHazardousChange,
  sortOrder,
  onSortChange,
  startDate,
  endDate,
  onDateRangeChange,
}: FilterBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(format(startDate, "yyyy-MM-dd"));
  const [tempEndDate, setTempEndDate] = useState(format(endDate, "yyyy-MM-dd"));
  const [dateError, setDateError] = useState<string | null>(null);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const handleToggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    if (!showDatePicker) {
      setTempStartDate(format(startDate, "yyyy-MM-dd"));
      setTempEndDate(format(endDate, "yyyy-MM-dd"));
    }
  };

  // Validate date range when either date changes
  useEffect(() => {
    try {
      setDateError(null);
      setDateWarning(null);
      
      const newStartDate = new Date(tempStartDate);
      const newEndDate = new Date(tempEndDate);
      
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        setDateError("Invalid date format");
        return;
      }
      
      if (newEndDate < newStartDate) {
        setDateError("End date must be after start date");
        return;
      }
      
      const daysDiff = differenceInDays(newEndDate, newStartDate);
      
      if (daysDiff > 7) {
        setDateWarning("Date range exceeds 7 days. It will be limited to 7 days due to NASA API limitations.");
      }
    } catch (error) {
      console.error("Date validation error:", error);
    }
  }, [tempStartDate, tempEndDate]);

  const handleApplyDateRange = () => {
    try {
      const newStartDate = new Date(tempStartDate);
      const newEndDate = new Date(tempEndDate);
      
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        setDateError("Invalid date format");
        return;
      }
      
      if (newEndDate < newStartDate) {
        setDateError("End date must be after start date");
        return;
      }
      
      // Check if date range exceeds 7 days
      const daysDiff = differenceInDays(newEndDate, newStartDate);
      
      if (daysDiff > 7) {
        // Automatically adjust the end date to be 7 days from start
        const adjustedEndDate = addDays(newStartDate, 7);
        onDateRangeChange(newStartDate, adjustedEndDate);
        setDateWarning(null);
      } else {
        onDateRangeChange(newStartDate, newEndDate);
      }
      
      setShowDatePicker(false);
    } catch (error) {
      console.error("Date range error:", error);
      setDateError("Please enter valid dates in YYYY-MM-DD format");
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        {/* Hazardous Only Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hazardous-toggle"
            checked={hazardousOnly}
            onChange={(e) => onHazardousChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
            aria-label="Show hazardous asteroids only"
          />
          <label htmlFor="hazardous-toggle" className="text-sm font-medium">
            Hazardous Only
          </label>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-order" className="text-sm font-medium">
            Sort by:
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded border-gray-300 text-sm focus:ring-primary focus:border-primary"
            aria-label="Sort order"
          >
            <option value="approach_asc">Closest Approach (Earliest First)</option>
            <option value="approach_desc">Closest Approach (Latest First)</option>
          </select>
        </div>

        {/* Date Range Toggle */}
        <div className="ml-auto">
          <button
            onClick={handleToggleDatePicker}
            className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            aria-expanded={showDatePicker}
            aria-controls="date-range-picker"
          >
            {showDatePicker ? "Hide Date Range" : "Change Date Range"}
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div id="date-range-picker" className="mt-4 p-3 border border-border rounded-md bg-background">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className={`rounded text-sm focus:ring-primary focus:border-primary ${dateError ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className={`rounded text-sm focus:ring-primary focus:border-primary ${dateError ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              <div className="self-end">
                <button
                  onClick={handleApplyDateRange}
                  disabled={!!dateError}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
            
            {dateError && (
              <div className="text-red-500 text-sm mt-1">
                {dateError}
              </div>
            )}
            
            {dateWarning && (
              <div className="text-amber-500 text-sm mt-1">
                {dateWarning}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-1">
              Note: NASA API limits date ranges to a maximum of 7 days.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
