import { LoadData } from "./schema";
import { TimeRangePreset, filterLoadsByDateRange } from "./date-range";

/**
 * All dashboard metrics - null means data is missing/not computable
 */
export interface DashboardMetrics {
  totalLoads: number | null;
  totalRevenue: number | null;
  avgRpm: number | null;
  activeBrokers: number | null;
  avgPaymentDays: number | null;
  weeklyRevenue: number[] | null; // For the bar chart (7 days)
  topLane: { origin: string; destination: string; revenue: number } | null;
}

/**
 * Compute dashboard metrics from real loads
 * Returns null for metrics that can't be computed (missing data, zero loads, etc.)
 * 
 * @param loads - Array of LoadData from /api/loads
 * @param preset - Time range preset ("1m" | "3m" | "6m" | "12m")
 * @returns DashboardMetrics object with calculated values or nulls
 */
export function computeMetrics(
  loads: LoadData[],
  preset: TimeRangePreset
): DashboardMetrics {
  // Filter loads to the selected time range
  const filteredLoads = filterLoadsByDateRange(loads, preset);
  
  // If no loads in range, return all nulls
  if (filteredLoads.length === 0) {
    return {
      totalLoads: null,
      totalRevenue: null,
      avgRpm: null,
      activeBrokers: null,
      avgPaymentDays: null,
      weeklyRevenue: null,
      topLane: null,
    };
  }
  
  // Total Loads
  const totalLoads = filteredLoads.length;
  
  // Total Revenue (sum of rate_total)
  const totalRevenue = filteredLoads.reduce((sum, load) => {
    return sum + (load.rate_total || 0);
  }, 0);
  
  // Average RPM (revenue per mile)
  let avgRpm: number | null = null;
  const loadsWithMiles = filteredLoads.filter((l) => {
    const miles = parseFloat(l.miles || "0");
    return miles > 0;
  });
  
  if (loadsWithMiles.length > 0) {
    const totalMiles = loadsWithMiles.reduce((sum, load) => {
      return sum + parseFloat(load.miles || "0");
    }, 0);
    const rpmRevenue = loadsWithMiles.reduce((sum, load) => {
      return sum + (load.rate_total || 0);
    }, 0);
    avgRpm = totalMiles > 0 ? rpmRevenue / totalMiles : null;
  }
  
  // Active Brokers (unique broker_name count)
  const uniqueBrokers = new Set(
    filteredLoads.map((l) => l.broker_name).filter(Boolean)
  );
  const activeBrokers = uniqueBrokers.size > 0 ? uniqueBrokers.size : null;
  
  // Avg Payment Days - MOCK for now (requires more data tracking)
  // TODO: Implement when you have delivery -> payment date tracking
  const avgPaymentDays = null;
  
  // Weekly Revenue (last 7 days for bar chart)
  const weeklyRevenue = calculateWeeklyRevenue(filteredLoads);
  
  // Top Performing Lane
  const topLane = calculateTopLane(filteredLoads);
  
  return {
    totalLoads,
    totalRevenue: totalRevenue > 0 ? totalRevenue : null,
    avgRpm,
    activeBrokers,
    avgPaymentDays,
    weeklyRevenue,
    topLane,
  };
}

/**
 * Calculate revenue for the last 7 days (for bar chart)
 * Returns array of 7 numbers representing daily revenue
 */
function calculateWeeklyRevenue(loads: LoadData[]): number[] | null {
  if (loads.length === 0) return null;
  
  const today = new Date();
  const dailyRevenue: number[] = [0, 0, 0, 0, 0, 0, 0];
  
  // Calculate revenue for each of the last 7 days
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - (6 - i));
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    // Sum revenue for loads on this day
    const dayRevenue = loads.reduce((sum, load) => {
      const pickupStop = load.stops?.find(s => s.type === "pickup");
      if (!pickupStop?.date) return sum;
      
      try {
        const loadDateStr = new Date(pickupStop.date).toISOString().split('T')[0];
        if (loadDateStr === targetDateStr) {
          return sum + (load.rate_total || 0);
        }
      } catch (error) {
        // Skip invalid dates
      }
      
      return sum;
    }, 0);
    
    dailyRevenue[i] = dayRevenue;
  }
  
  return dailyRevenue;
}

/**
 * Calculate the top performing lane by total revenue
 */
function calculateTopLane(loads: LoadData[]): { origin: string; destination: string; revenue: number } | null {
  if (loads.length === 0) return null;
  
  // Group loads by lane (origin -> destination)
  const laneMap = new Map<string, { origin: string; destination: string; revenue: number }>();
  
  loads.forEach((load) => {
    const pickupStop = load.stops?.find(s => s.type === "pickup");
    const deliveryStop = load.stops?.find(s => s.type === "delivery");
    
    if (!pickupStop || !deliveryStop) return;
    
    const origin = `${pickupStop.city}, ${pickupStop.state}`;
    const destination = `${deliveryStop.city}, ${deliveryStop.state}`;
    const laneKey = `${origin} → ${destination}`;
    
    const existing = laneMap.get(laneKey);
    if (existing) {
      existing.revenue += load.rate_total || 0;
    } else {
      laneMap.set(laneKey, {
        origin,
        destination,
        revenue: load.rate_total || 0,
      });
    }
  });
  
  // Find the lane with highest revenue
  let topLane: { origin: string; destination: string; revenue: number } | null = null;
  let maxRevenue = 0;
  
  laneMap.forEach((lane) => {
    if (lane.revenue > maxRevenue) {
      maxRevenue = lane.revenue;
      topLane = lane;
    }
  });
  
  return topLane;
}

/**
 * Render a metric value or "missing data" message
 * 
 * @param value - The metric value (number or null)
 * @param dataName - Human-readable name for error messages (e.g., "Revenue", "RPM")
 * @param formatter - Optional function to format the value (e.g., v => `$${v.toLocaleString()}`)
 * @returns Formatted string
 * 
 * @example
 * renderMetric(45000, "Revenue", v => `$${v.toLocaleString()}`)
 * // Returns: "$45,000"
 * 
 * @example
 * renderMetric(null, "Revenue")
 * // Returns: "missing data (Revenue)"
 */
export function renderMetric(
  value: number | null | undefined,
  dataName: string,
  formatter?: (v: number) => string
): string {
  if (value === null || value === undefined) {
    return `missing data (${dataName})`;
  }
  if (formatter) {
    return formatter(value);
  }
  return value.toLocaleString();
}
