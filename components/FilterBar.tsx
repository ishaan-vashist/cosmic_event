"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface FilterBarProps {
  hazardousOnly: boolean;
  onHazardousChange: (checked: boolean) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  onApplyFilters: () => void;
}

export default function FilterBar({
  hazardousOnly,
  onHazardousChange,
  sortOrder,
  onSortChange,
  startDate,
  endDate,
  onDateRangeChange,
  onApplyFilters
}: FilterBarProps) {

  // Component implementation

  // Local state for date warnings
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  
  // Open state for popovers
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Check date range validity and update warning
  useEffect(() => {
    if (startDate && endDate) {
      // Check if date range is valid
      if (startDate > endDate) {
        setDateWarning("Start date must be before end date.");
        return;
      }
      
      // Check if date range is within 7 days (NASA API limitation)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        setDateWarning("Date range exceeds 7 days. Results may be limited.");
      } else {
        setDateWarning(null);
      }
    }
  }, [startDate, endDate]);

  // Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange(date, endDate);
    }
    setStartDateOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange(startDate, date);
    }
    setEndDateOpen(false);
  };

  // Apply filters
  const applyFilters = () => {
    // Check if we have valid dates
    if (!startDate || !endDate) {
      setDateWarning("Please select both start and end dates.");
      return;
    }
    
    // Check if date range is valid
    if (startDate > endDate) {
      setDateWarning("Start date must be before end date.");
      return;
    }
    
    // Call the parent's onApplyFilters function
    onApplyFilters();
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg border border-border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Start Date</label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setStartDateOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">End Date</label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setEndDateOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
                disabled={(date: Date) => {
                  // Disable dates before start date
                  return startDate ? date < startDate : false;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Sort By</label>
          <Select value={sortOrder} onValueChange={onSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="size_desc">Size (Largest First)</SelectItem>
              <SelectItem value="size_asc">Size (Smallest First)</SelectItem>
              <SelectItem value="approach_desc">Closest Approach (Nearest First)</SelectItem>
              <SelectItem value="approach_asc">Closest Approach (Furthest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Filter Options</label>
            <Toggle
              pressed={hazardousOnly}
              onPressedChange={onHazardousChange}
              variant="outline"
              className="w-full justify-start data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:border-destructive/50"
              aria-label="Toggle hazardous objects only"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z"
                  clipRule="evenodd"
                />
              </svg>
              Hazardous Objects Only
            </Toggle>
          </div>
          
          <Button
            onClick={applyFilters}
            className="mt-6"
          >
            Apply Filters
          </Button>
        </div>
      </div>
      
      {dateWarning && (
        <div className="text-amber-500 text-sm mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2 flex-shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z"
              clipRule="evenodd"
            />
            <path d="M10 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
          {dateWarning}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 mr-1 text-muted-foreground/70"
        >
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        Note: NASA API limits date ranges to a maximum of 7 days.
      </div>
    </div>
  );
}
