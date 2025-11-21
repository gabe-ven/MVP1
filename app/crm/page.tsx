"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrokerTable from "@/components/crm/BrokerTable";
import { Broker, BrokerTask } from "@/lib/crm-storage";
import { TruckIcon, RefreshCw, Building2, Users, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";

export default function CRMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // CRM state
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);
  const [tasks, setTasks] = useState<BrokerTask[]>([]);
  const [syncingBrokers, setSyncingBrokers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "prospect">("all");
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "loads" | "lastContact">("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Redirect unauthenticated users to landing
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch CRM data
  const fetchCRMData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const brokersResponse = await fetch(`/api/crm/brokers?${params}`);
      const brokersData = await brokersResponse.json();
      setAllBrokers(brokersData.brokers || []);

      const tasksResponse = await fetch("/api/crm/tasks?status=pending");
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error("Error fetching CRM data:", error);
    }
  }, [statusFilter, sortBy, sortOrder]);

  const handleSyncBrokers = async () => {
    setSyncingBrokers(true);
    try {
      const response = await fetch("/api/crm/sync", { method: "POST" });
      if (response.ok) {
        await fetchCRMData();
      }
    } catch (error) {
      console.error("Error syncing brokers:", error);
    } finally {
      setSyncingBrokers(false);
    }
  };

  // Fetch CRM data on mount
  useEffect(() => {
    if (session) {
      fetchCRMData();
    }
  }, [session, fetchCRMData]);

  // Filter brokers client-side for search
  const filteredBrokers = searchTerm
    ? allBrokers.filter((broker) => {
        const search = searchTerm.toLowerCase();
        return (
          broker.broker_name.toLowerCase().includes(search) ||
          broker.broker_email?.toLowerCase().includes(search)
        );
      })
    : allBrokers;

  const overdueTasks = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) < new Date()
  );

  const totalRevenue = allBrokers.reduce((sum, broker) => sum + broker.total_revenue, 0);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="custom-screen py-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Header />

      <div className="custom-screen py-12 space-y-8">
        {/* CRM Stats */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden glass-effect rounded-xl p-6 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl animate-pulse-glow" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-gray-400">Total Brokers</p>
                </div>
                <p className="text-3xl font-bold text-white">{allBrokers.length}</p>
              </div>
            </div>

            <div className="relative overflow-hidden glass-effect rounded-xl p-6 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-xl animate-pulse-glow" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <TruckIcon className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-400">Total Revenue</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${(totalRevenue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden glass-effect rounded-xl p-6 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl blur-xl animate-pulse-glow" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-gray-400">Pending Tasks</p>
                </div>
                <p className="text-3xl font-bold text-white">{tasks.length}</p>
              </div>
            </div>

            <div className="relative overflow-hidden glass-effect rounded-xl p-6 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl blur-xl animate-pulse-glow" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-gray-400">Overdue Tasks</p>
                </div>
                <p className="text-3xl font-bold text-white">{overdueTasks.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="space-y-6">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search brokers..."
                    className="w-full pl-10 pr-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                >
                  <option value="revenue">Revenue</option>
                  <option value="loads">Loads</option>
                  <option value="name">Name</option>
                  <option value="lastContact">Last Contact</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-white/[0.02] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>

                <button
                  onClick={handleSyncBrokers}
                  disabled={syncingBrokers}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingBrokers ? "animate-spin" : ""}`} />
                  <span>{syncingBrokers ? "Syncing..." : "Sync"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Brokers Table */}
        <section className="space-y-6">
          {allBrokers.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Brokers Yet</h3>
              <p className="text-gray-400 mb-6">
                Click "Sync" to import brokers from your loads
              </p>
              <button
                onClick={handleSyncBrokers}
                disabled={syncingBrokers}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${syncingBrokers ? "animate-spin" : ""}`} />
                <span>{syncingBrokers ? "Syncing..." : "Sync Brokers Now"}</span>
              </button>
            </div>
          ) : filteredBrokers.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Brokers Found</h3>
              <p className="text-gray-400 mb-6">
                No brokers match your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all border border-white/10"
              >
                <span>Clear Search</span>
              </button>
            </div>
          ) : (
            <BrokerTable brokers={filteredBrokers} />
          )}
        </section>
      </div>
    </main>
  );
}

