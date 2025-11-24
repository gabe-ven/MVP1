"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Mail,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { LoadData } from "@/lib/schema";

// Enhanced load type with additional fields for loads page
interface EnhancedLoad extends LoadData {
  score: "Good" | "Risky" | "Bad";
  status: "Offered" | "Accepted" | "Declined" | "In Transit" | "Delivered";
  dateDetected: string;
  hosFeasible: boolean;
  doubleBrokerRisk: boolean;
}

export default function LoadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<EnhancedLoad[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<EnhancedLoad[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<EnhancedLoad | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    score: "All",
    broker: "All",
  });
  const [isLoading, setIsLoading] = useState(true);

  // DEVELOPMENT MODE
  const DEV_MODE = false;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!DEV_MODE && status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Load REAL data from API
  useEffect(() => {
    async function fetchLoads() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/loads");
        if (!response.ok) throw new Error("Failed to fetch loads");
        
        const data = await response.json();
        const allLoads = data.loads || [];
        
        // Enhance loads with additional metadata for the loads page
        const enhancedLoads: EnhancedLoad[] = allLoads.map((load: LoadData) => ({
          ...load,
          // For now, assign default values - you can enhance this logic later
          score: "Good" as "Good" | "Risky" | "Bad", // TODO: Calculate based on broker history, RPM, etc.
          status: "Offered" as any, // TODO: Track actual status
          dateDetected: load.stops?.find(s => s.type === "pickup")?.date || new Date().toISOString().split('T')[0],
          hosFeasible: true, // TODO: Calculate based on distance and time windows
          doubleBrokerRisk: false, // TODO: Check against known double-broker patterns
        }));
        
        setLoads(enhancedLoads);
        setFilteredLoads(enhancedLoads);
      } catch (error) {
        console.error("Error fetching loads:", error);
        setLoads([]);
        setFilteredLoads([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (status === "authenticated" || DEV_MODE) {
      fetchLoads();
    }
  }, [status, DEV_MODE]);

  // Apply filters
  useEffect(() => {
    let filtered = loads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(load => 
        load.broker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.load_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.stops.some(stop => 
          stop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stop.state.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Status filter
    if (filters.status !== "All") {
      filtered = filtered.filter(load => load.status === filters.status);
    }

    // Score filter
    if (filters.score !== "All") {
      filtered = filtered.filter(load => load.score === filters.score);
    }

    // Broker filter
    if (filters.broker !== "All") {
      filtered = filtered.filter(load => load.broker_name === filters.broker);
    }

    setFilteredLoads(filtered);
  }, [searchQuery, filters, loads]);

  const calculateRPM = (load: EnhancedLoad) => {
    const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
    return miles > 0 ? (load.rate_total / miles).toFixed(2) : "0.00";
  };

  const getScoreBadge = (score: string) => {
    const styles = {
      Good: "bg-green-100 text-green-700 border-green-200",
      Risky: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Bad: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[score as keyof typeof styles] || styles.Good;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Offered: "bg-blue-100 text-blue-700",
      Accepted: "bg-green-100 text-green-700",
      Declined: "bg-gray-100 text-gray-700",
      "In Transit": "bg-purple-100 text-purple-700",
      Delivered: "bg-emerald-100 text-emerald-700",
    };
    return styles[status as keyof typeof styles] || styles.Offered;
  };

  const uniqueBrokers = ["All", ...Array.from(new Set(loads.map(l => l.broker_name)))];

  if ((!DEV_MODE && status === "loading") || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-page-title text-gray-900 mb-2">Load Management</h1>
          <p className="text-base text-neutral-600">
            All loads detected by Noctem and used for dashboards and decision-making
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by broker, lane, or load ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-[1.5px] border-neutral-200 rounded-xl focus:ring-3 focus:ring-primary/10 focus:border-primary transition-all text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all duration-200">
              <Filter className="w-4 h-4" />
              <span className="font-medium">More Filters</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-600 mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="min-w-[180px] px-4 py-2.5 bg-white border-[1.5px] border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option>All</option>
                <option>Offered</option>
                <option>Accepted</option>
                <option>Declined</option>
                <option>In Transit</option>
                <option>Delivered</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-600 mb-1.5">Score</label>
              <select
                value={filters.score}
                onChange={(e) => setFilters({...filters, score: e.target.value})}
                className="min-w-[180px] px-4 py-2.5 bg-white border-[1.5px] border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option>All</option>
                <option>Good</option>
                <option>Risky</option>
                <option>Bad</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-600 mb-1.5">Broker</label>
              <select
                value={filters.broker}
                onChange={(e) => setFilters({...filters, broker: e.target.value})}
                className="min-w-[180px] px-4 py-2.5 bg-white border-[1.5px] border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {uniqueBrokers.map(broker => (
                  <option key={broker}>{broker}</option>
                ))}
              </select>
            </div>

            {/* Active Filter Count */}
            {(searchQuery || filters.status !== "All" || filters.score !== "All" || filters.broker !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: "All", score: "All", broker: "All" });
                }}
                className="flex items-center gap-2 px-4 py-2.5 mt-auto bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-sm text-neutral-600 font-medium">
              Showing <span className="font-semibold text-gray-900">{filteredLoads.length}</span> of {loads.length} loads
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Load ID
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Lane
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Broker
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    RPM
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLoads.map((load) => {
                  const pickup = load.stops.find(s => s.type === "pickup");
                  const delivery = load.stops.find(s => s.type === "delivery");
                  const rpm = calculateRPM(load);

                  return (
                    <tr
                      key={load.load_id}
                      onClick={() => setSelectedLoad(load)}
                      className="hover:bg-neutral-50 cursor-pointer transition-all duration-200"
                    >
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="font-semibold text-primary hover:underline">{load.load_id}</div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap text-sm text-neutral-600">
                        {load.dateDetected}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {pickup?.city}, {pickup?.state}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                              <ArrowRight className="w-3 h-3 text-neutral-400" />
                              <span>{delivery?.city}, {delivery?.state}</span>
                              <span className="text-neutral-400">• {load.miles}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{load.broker_name}</div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-success" />
                          <span className="text-lg font-bold text-success">
                            ${load.rate_total.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">${rpm}/mi</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getScoreBadge(load.score)}`}>
                          {load.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(load.status)}`}>
                          {load.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {!load.hosFeasible && (
                            <div className="group relative">
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                HOS Risk
                              </div>
                            </div>
                          )}
                          {load.doubleBrokerRisk && (
                            <div className="group relative">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Double Broker Risk
                              </div>
                            </div>
                          )}
                          {load.hosFeasible && !load.doubleBrokerRisk && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLoads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No loads found matching your filters</p>
            </div>
          )}
        </div>

      </div>

      {/* Side Drawer for Load Details */}
      {selectedLoad && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={() => setSelectedLoad(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedLoad.load_id}</h2>
                <p className="text-sm text-gray-500 mt-1">Detected on {selectedLoad.dateDetected}</p>
              </div>
              <button
                onClick={() => setSelectedLoad(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Score</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreBadge(selectedLoad.score)}`}>
                    {selectedLoad.score}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedLoad.status)}`}>
                    {selectedLoad.status}
                  </span>
                </div>
              </div>

              {/* Route Info */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
                <div className="space-y-4">
                  {selectedLoad.stops.map((stop, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stop.type === "pickup" ? "bg-green-500" : "bg-blue-500"
                      }`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">{stop.type}</p>
                        <p className="text-gray-700">{stop.city}, {stop.state}</p>
                        <p className="text-xs text-gray-500">{stop.address}</p>
                        <p className="text-sm text-gray-500">{stop.date} at {stop.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Rate</p>
                    <p className="text-2xl font-bold text-gray-900">${selectedLoad.rate_total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rate per Mile</p>
                    <p className="text-2xl font-bold text-gray-900">${calculateRPM(selectedLoad)}/mi</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Distance</p>
                    <p className="text-lg font-medium text-gray-900">{selectedLoad.miles}</p>
                  </div>
                </div>
              </div>

              {/* Broker Info */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Broker Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-gray-900 font-medium">{selectedLoad.broker_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{selectedLoad.broker_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{selectedLoad.broker_phone}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                  <Mail className="w-5 h-5" />
                  <span>Open in Gmail</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold">
                  <MessageSquare className="w-5 h-5" />
                  <span>Ask Noctem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

