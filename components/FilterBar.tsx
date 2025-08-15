"use client";

import { useState } from "react";
import { format } from "date-fns";
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

  const handleToggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    if (!showDatePicker) {
      setTempStartDate(format(startDate, "yyyy-MM-dd"));
      setTempEndDate(format(endDate, "yyyy-MM-dd"));
    }
  };

  const handleApplyDateRange = () => {
    try {
      const newStartDate = new Date(tempStartDate);
      const newEndDate = new Date(tempEndDate);
      
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        throw new Error("Invalid date format");
      }
      
      if (newEndDate < newStartDate) {
        throw new Error("End date must be after start date");
      }
      
      onDateRangeChange(newStartDate, newEndDate);
      setShowDatePicker(false);
    } catch (error) {
      console.error("Date range error:", error);
      alert("Please enter valid dates in YYYY-MM-DD format");
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
                className="rounded border-gray-300 text-sm focus:ring-primary focus:border-primary"
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
                className="rounded border-gray-300 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="self-end">
              <button
                onClick={handleApplyDateRange}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
