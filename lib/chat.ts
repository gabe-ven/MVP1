import { LoadData } from "./schema";
import { calculateMetrics, getRevenueByBroker, getRPMTrend } from "./extract";

/**
 * Format loads data into a concise summary for AI context
 */
export function formatLoadsSummary(loads: LoadData[]): string {
  if (loads.length === 0) {
    return "No loads available.";
  }

  const metrics = calculateMetrics(loads);
  const revenueByBroker = getRevenueByBroker(loads);
  const rpmTrend = getRPMTrend(loads);

  let summary = `You have ${metrics.totalLoads} loads with the following metrics:\n`;
  summary += `- Total Revenue: $${metrics.totalRevenue.toLocaleString()}\n`;
  summary += `- Average Rate: $${metrics.averageRate.toFixed(2)}\n`;
  summary += `- Average RPM: $${metrics.averageRPM.toFixed(2)}\n\n`;

  if (revenueByBroker.length > 0) {
    summary += `Top Brokers by Revenue:\n`;
    revenueByBroker.slice(0, 5).forEach((broker, idx) => {
      summary += `${idx + 1}. ${broker.name}: $${broker.revenue.toLocaleString()}\n`;
    });
    summary += `\n`;
  }

  // Recent loads summary
  const recentLoads = loads.slice(-10).reverse();
  summary += `Recent Loads (last 10):\n`;
  recentLoads.forEach((load, idx) => {
    const pickups = load.stops?.filter((s) => s.type === "pickup") || [];
    const deliveries = load.stops?.filter((s) => s.type === "delivery") || [];
    const origin = pickups[0]?.city && pickups[0]?.state
      ? `${pickups[0].city}, ${pickups[0].state}`
      : "Unknown";
    const destination = deliveries[deliveries.length - 1]?.city && deliveries[deliveries.length - 1]?.state
      ? `${deliveries[deliveries.length - 1].city}, ${deliveries[deliveries.length - 1].state}`
      : "Unknown";
    
    summary += `${idx + 1}. Load ${load.load_id}: ${origin} → ${destination}, $${load.rate_total.toLocaleString()}, ${load.miles || "N/A"} miles\n`;
  });

  return summary;
}

/**
 * Format detailed load information for AI context
 */
export function formatLoadDetails(loads: LoadData[]): string {
  if (loads.length === 0) {
    return "No loads available.";
  }

  let details = `Detailed Load Information:\n\n`;
  
  loads.forEach((load, idx) => {
    details += `Load ${idx + 1}:\n`;
    details += `- Load ID: ${load.load_id}\n`;
    details += `- Broker: ${load.broker_name || "N/A"}\n`;
    details += `- Rate: $${load.rate_total.toLocaleString()}\n`;
    details += `- Miles: ${load.miles || "N/A"}\n`;
    details += `- Equipment: ${load.equipment_type || "N/A"}\n`;
    
    if (load.stops && load.stops.length > 0) {
      details += `- Stops:\n`;
      load.stops.forEach((stop, stopIdx) => {
        details += `  ${stopIdx + 1}. ${stop.type}: ${stop.location_name || "N/A"} - ${stop.city || ""}, ${stop.state || ""} (${stop.date || "N/A"})\n`;
      });
    }
    
    details += `\n`;
  });

  return details;
}

/**
 * Get system prompt for the chatbot
 */
export function getSystemPrompt(): string {
  return `You are an AI assistant for Load Insights, a freight rate confirmation analysis platform. You help users understand their freight business data.

Your capabilities:
- Answer questions about load metrics (total loads, revenue, RPM, averages)
- Provide insights about brokers, routes, and equipment
- Analyze trends and patterns in the data
- Help users understand their freight operations

Be helpful, concise, and data-driven. When providing numbers, format them clearly (e.g., $1,234.56). If you don't have enough information to answer a question, say so clearly.

Always be professional and focus on actionable insights.`;
}

