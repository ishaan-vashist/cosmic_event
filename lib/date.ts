import { format, addDays, parseISO, isValid } from "date-fns";

/**
 * Formats a date to YYYY-MM-DD format (UTC)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateForAPI(date: Date): string {
  // Ensure we're working with a valid date
  if (!isValid(date)) {
    throw new Error("Invalid date provided");
  }
  
  // Format date to YYYY-MM-DD in UTC
  return format(date, "yyyy-MM-dd");
}

/**
 * Creates a date range array between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  
  // Ensure dates are valid
  if (!isValid(startDate) || !isValid(endDate)) {
    throw new Error("Invalid date range provided");
  }
  
  // Generate dates in the range
  while (currentDate <= endDate) {
    dates.push(formatDateForAPI(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

/**
 * Formats a datetime string for display (converts from UTC to local)
 * @param dateTimeStr - ISO datetime string
 * @returns Formatted datetime string for display
 */
export function formatDateTimeForDisplay(dateTimeStr: string | null): string {
  if (!dateTimeStr) return "Unknown";
  
  try {
    const date = parseISO(dateTimeStr);
    
    if (!isValid(date)) {
      return "Invalid Date";
    }
    
    // Format with date and time
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid Date";
  }
}

/**
 * Formats a date string for display
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    
    if (!isValid(date)) {
      return "Invalid Date";
    }
    
    // Format with just the date
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid Date";
  }
}
