/**
 * Time range presets for analytics filtering
 * Default: "1m" (last 30 days from today)
 */
export type TimeRangePreset = "1m" | "3m" | "6m" | "12m";

export interface TimeRangeResult {
  preset: TimeRangePreset;
  startDate: Date;
  endDate: Date;
  label: string; // e.g., "Last Month", "Last 3 Months"
}

/**
 * Calculate start/end dates for a given preset
 * @param preset - "1m" | "3m" | "6m" | "12m"
 * @returns TimeRangeResult with startDate, endDate, and human-readable label
 */
export function getTimeRange(preset: TimeRangePreset): TimeRangeResult {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  let startDate: Date;
  let label: string;
  
  switch (preset) {
    case "1m":
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1);
      label = "Last Month";
      break;
    case "3m":
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 3);
      label = "Last 3 Months";
      break;
    case "6m":
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 6);
      label = "Last 6 Months";
      break;
    case "12m":
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      label = "Last Year";
      break;
    default:
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1);
      label = "Last Month";
  }
  
  return { preset, startDate, endDate, label };
}

/**
 * Filter loads by date range using pickup date
 * @param loads - Array of LoadData from /api/loads
 * @param preset - Time range preset
 * @returns Filtered loads within the date range
 */
export function filterLoadsByDateRange(loads: any[], preset: TimeRangePreset) {
  const { startDate, endDate } = getTimeRange(preset);
  
  return loads.filter((load) => {
    // Use the first pickup stop's date
    const pickupStop = load.stops?.find((s: any) => s.type === "pickup");
    if (!pickupStop?.date) return false;
    
    try {
      const loadDate = new Date(pickupStop.date);
      // Check if date is valid
      if (isNaN(loadDate.getTime())) return false;
      
      return loadDate >= startDate && loadDate <= endDate;
    } catch (error) {
      console.warn("Invalid date format for load:", load.load_id, pickupStop.date);
      return false;
    }
  });
}

/**
 * All available preset options for UI dropdowns
 */
export const TIME_RANGE_OPTIONS: { value: TimeRangePreset; label: string }[] = [
  { value: "1m", label: "Last Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last Year" },
];

