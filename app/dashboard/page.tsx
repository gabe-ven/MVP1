"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBot from "@/components/ChatBot";
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Building2,
  TrendingDown,
  Mail,
  RefreshCw
} from "lucide-react";
import { TimeRangePreset, TIME_RANGE_OPTIONS, filterLoadsByDateRange } from "@/lib/date-range";
import { computeMetrics, renderMetric, DashboardMetrics } from "@/lib/dashboard-metrics";
import { LoadData } from "@/lib/schema";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Real data state
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("1m");
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Total stats (not filtered by time range)
  const [totalLoadsCount, setTotalLoadsCount] = useState<number>(0);
  const [totalBrokersCount, setTotalBrokersCount] = useState<number>(0);
  
  // Gmail sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-scroll animation for loads
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPos = prev + 0.5;
        return newPos >= 100 ? 0 : newPos;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetch loads from API when authenticated
  useEffect(() => {
    async function fetchLoads() {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/loads");
        if (!response.ok) throw new Error("Failed to fetch loads");
        
        const data = await response.json();
        const allLoads = data.loads || [];
        setLoads(allLoads);
        
        // Calculate TOTAL stats (not filtered by time range)
        setTotalLoadsCount(allLoads.length);
        const uniqueBrokers = new Set(allLoads.map((l: LoadData) => l.broker_name).filter(Boolean));
        setTotalBrokersCount(uniqueBrokers.size);
        
        // Compute metrics for selected time range
        const calculatedMetrics = computeMetrics(allLoads, timeRange);
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error("Error fetching loads:", error);
        setLoads([]);
        setMetrics(null);
        setTotalLoadsCount(0);
        setTotalBrokersCount(0);
      } finally {
        setIsLoadingData(false);
      }
    }
    
    if (status === "authenticated") {
      fetchLoads();
    }
  }, [status, timeRange]);

  // Gmail sync function
  async function handleGmailSync() {
    setIsSyncing(true);
    setSyncMessage(null);
    
    try {
      console.log(`Starting Gmail sync for time range: ${timeRange}`);
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeRange }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gmail sync failed");
      }
      
      const result = await response.json();
      console.log("Gmail sync result:", result);
      
      // Show success message with stats
      const stats = result.stats || {};
      const extracted = stats.extracted || 0;
      const skipped = stats.skipped || 0;
      const pdfsFound = stats.pdfsFound || 0;
      
      if (extracted > 0) {
        setSyncMessage({
          type: 'success',
          text: `✅ Synced ${extracted} new load${extracted === 1 ? '' : 's'}! ${skipped > 0 ? `(${skipped} already processed)` : ''}`
        });
      } else if (skipped > 0) {
        setSyncMessage({
          type: 'info',
          text: `ℹ️ ${skipped} load${skipped === 1 ? '' : 's'} already processed. No new data.`
        });
      } else if (pdfsFound === 0) {
        setSyncMessage({
          type: 'info',
          text: `ℹ️ No rate confirmation PDFs found in the selected time range.`
        });
      } else {
        setSyncMessage({
          type: 'info',
          text: `ℹ️ Sync complete. ${pdfsFound} PDF${pdfsFound === 1 ? '' : 's'} found but no new loads extracted.`
        });
      }
      
      // Refresh loads after sync if we got new data
      if (extracted > 0) {
        const loadsResponse = await fetch("/api/loads");
        const data = await loadsResponse.json();
        setLoads(data.loads || []);
        setMetrics(computeMetrics(data.loads || [], timeRange));
      }
      
      // Clear message after 10 seconds
      setTimeout(() => setSyncMessage(null), 10000);
      
    } catch (error) {
      console.error("Gmail sync error:", error);
      setSyncMessage({
        type: 'error',
        text: `❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      // Clear error message after 10 seconds
      setTimeout(() => setSyncMessage(null), 10000);
    } finally {
      setIsSyncing(false);
    }
  }

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Get filtered loads for display
  const displayLoads = filterLoadsByDateRange(loads, timeRange).slice(0, 20);

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Dashboard Header with Time Range Selector and Gmail Sync */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          
          {/* Controls: Time Range Selector + Gmail Sync Button */}
          <div className="flex items-center gap-4">
            {/* Gmail Sync Button */}
            <button
              onClick={handleGmailSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              title={`Sync Gmail for ${TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Sync Gmail</span>
                </>
              )}
            </button>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRangePreset)}
                className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {TIME_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Sync Message Toast */}
        {syncMessage && (
          <div className={`p-4 rounded-lg border ${
            syncMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            syncMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm font-medium">{syncMessage.text}</p>
          </div>
        )}
        
        {/* Hero Section - Contracts & Consistency */}
        <section className="text-center py-6 px-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-full border border-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-xs font-medium text-neutral-700">Powered by AI</span>
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Build Consistent Contracts with Your Best Brokers
            </h1>
            
            <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
              Noctem analyzes your freight history to identify your most profitable broker relationships and preferred lanes.
            </p>
            
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => router.push("/contracts")}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Building Contracts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
                <button
                onClick={() => router.push("/crm")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-all duration-200"
                >
                <Building2 className="w-4 h-4" />
                <span>View Broker Analytics</span>
                </button>
            </div>
          </div>
        </section>

        {/* AI Chat Section - Compact */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">AI Assistant</h3>
                <p className="text-sm text-neutral-500">Ask anything about your freight data</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/assistant")}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
            </section>

        {/* KPI Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">
              {totalLoadsCount}
            </p>
            <p className="text-sm text-neutral-500 mb-2">All Loads Uploaded</p>
            {totalLoadsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium">
                <Package className="w-3.5 h-3.5" />
                Total in database
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">
              {renderMetric(metrics?.totalRevenue, "Revenue", (v) => `$${Math.round(v / 1000)}K`)}
            </p>
            <p className="text-sm text-neutral-500 mb-2">Total Revenue</p>
            {metrics?.totalRevenue && metrics.totalRevenue > 0 && (
              <div className="flex items-center gap-1 text-xs text-success font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                ${metrics.totalRevenue.toLocaleString()}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">
              {totalBrokersCount}
            </p>
            <p className="text-sm text-neutral-500 mb-2">Brokers Worked With</p>
            {totalBrokersCount > 0 && (
              <div className="text-xs text-neutral-500 font-medium">
                {totalBrokersCount} unique {totalBrokersCount === 1 ? 'broker' : 'brokers'} in total
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">
              {renderMetric(metrics?.avgPaymentDays, "Payment Days")}
            </p>
            <p className="text-sm text-neutral-500 mb-2">Avg Payment Days</p>
            {metrics?.avgPaymentDays && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
                {metrics.avgPaymentDays} days to payment
              </div>
            )}
          </div>
        </section>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Weekly Revenue Trend</h3>
            {metrics?.weeklyRevenue ? (
              <div className="space-y-4">
                {/* Bar Chart Container */}
                <div className="h-32 flex items-end justify-between gap-2 mb-2">
                  {metrics.weeklyRevenue.map((value, i) => {
                    const maxValue = Math.max(...metrics.weeklyRevenue!);
                    const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                          style={{ height: `${heightPercent}%` }}
                          title={`$${value.toLocaleString()}`}
                        />
                      </div>
                    );
                  })}
              </div>
              {/* Day Labels */}
              <div className="flex justify-between gap-2 px-0.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-xs text-neutral-500 font-medium">{day}</span>
                  </div>
                ))}
              </div>
              {/* Total Revenue */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <span className="text-2xl font-bold text-gray-900">
                  {metrics?.totalRevenue 
                    ? `$${metrics.totalRevenue.toLocaleString()}` 
                    : renderMetric(null, "Revenue")}
                </span>
                {metrics?.weeklyRevenue && (
                  <span className="text-sm text-neutral-500">
                    Last 7 days
                  </span>
                )}
              </div>
            </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
                {renderMetric(null, "Revenue Trend")}
              </div>
            )}
          </div>

          {/* RPM Circle */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold text-neutral-900 mb-6">Average RPM</h3>
            {metrics?.avgRpm ? (
              <>
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="440"
                      strokeDashoffset={440 - (metrics.avgRpm / 4) * 440}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#818CF8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">${metrics.avgRpm.toFixed(2)}</span>
                    <span className="text-sm text-neutral-500">/mile</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-neutral-500">
                    Revenue per mile
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">
                {renderMetric(null, "RPM")}
              </div>
            )}
          </div>

          {/* Top Lane */}
          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Top Performing Lane</h3>
            {metrics?.topLane ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {metrics.topLane.origin} → {metrics.topLane.destination}
                    </p>
                    <p className="text-sm text-neutral-600">Top revenue lane</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-success">
                      ${metrics.topLane.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">From Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push("/loads")}
                  className="w-full mt-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors"
                >
                  Find More on This Lane
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
                {renderMetric(null, "Top Lane")}
              </div>
            )}
          </div>
                </section>

        {/* Loads Section - Side by Side */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left: Recent Load Opportunities (Scrolling List) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Recent Opportunities</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Scraped from Gmail • Live</p>
              </div>
              <button 
                onClick={() => router.push("/loads")}
                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrolling List - 20 Items */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {displayLoads.length > 0 ? (
                displayLoads.map((load) => {
                  const pickupStop = load.stops?.find((s: any) => s.type === "pickup");
                  const deliveryStop = load.stops?.find((s: any) => s.type === "delivery");
                  const origin = pickupStop ? `${pickupStop.city}, ${pickupStop.state}` : "Unknown";
                  const destination = deliveryStop ? `${deliveryStop.city}, ${deliveryStop.state}` : "Unknown";
                  const pickupDate = pickupStop?.date ? new Date(pickupStop.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                  const rpm = load.rpm || (load.rate_total && load.miles ? (load.rate_total / parseFloat(load.miles)).toFixed(2) : "N/A");
                  
                  return (
                    <div 
                      key={load.load_id}
                      className="group bg-white p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => router.push(`/loads?id=${load.load_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-neutral-900 text-sm">{load.load_id}</span>
                          <span className="text-xs text-neutral-500">{pickupDate}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                          Active
                        </span>
                      </div>
                      
                      <p className="text-xs text-neutral-600 mb-2">{load.broker_name}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">
                            <span className="font-medium text-gray-900">{origin}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium text-gray-900">{destination}</span>
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">{load.miles || "N/A"} miles</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900 text-sm">${load.rate_total?.toLocaleString() || "N/A"}</p>
                          <p className="text-xs text-neutral-500">${rpm}/mi</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  {renderMetric(null, `Loads for ${TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}`)}
                </div>
              )}
            </div>
          </div>

          {/* Right: Organized by Date (List View) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Organized by Date</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Most Recent First</p>
              </div>
              <button 
                onClick={() => router.push("/loads")}
                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium flex items-center gap-1"
              >
                See All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List View - 20 Items */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {displayLoads.length > 0 ? (
                displayLoads.map((load) => {
                  const pickupStop = load.stops?.find((s: any) => s.type === "pickup");
                  const deliveryStop = load.stops?.find((s: any) => s.type === "delivery");
                  const origin = pickupStop ? `${pickupStop.city}, ${pickupStop.state}` : "Unknown";
                  const destination = deliveryStop ? `${deliveryStop.city}, ${deliveryStop.state}` : "Unknown";
                  const pickupDate = pickupStop?.date ? new Date(pickupStop.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                  const rpm = load.rpm || (load.rate_total && load.miles ? (load.rate_total / parseFloat(load.miles)).toFixed(2) : "N/A");
                  
                  return (
                    <div 
                      key={load.load_id}
                      className="group bg-white p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => router.push(`/loads?id=${load.load_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-xs font-medium text-neutral-700">{pickupDate}</span>
                        </div>
                        <span className="font-semibold text-neutral-900 text-sm">{load.load_id}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        <p className="text-xs text-neutral-600">{load.broker_name}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">
                            <span className="font-medium text-gray-900">{origin}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium text-gray-900">{destination}</span>
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">{load.miles || "N/A"} miles</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">${load.rate_total?.toLocaleString() || "N/A"}</p>
                          <p className="text-xs text-neutral-500">${rpm}/mi</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  {renderMetric(null, `Loads for ${TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}`)}
                </div>
              )}
            </div>
          </div>
                </section>
      </div>

      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  );
}

