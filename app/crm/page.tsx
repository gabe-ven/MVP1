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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="custom-screen py-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <div className="custom-screen py-12 space-y-8">
        {/* CRM Stats */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Brokers</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{allBrokers.length}</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ${(totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Pending Tasks</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Overdue Tasks</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search brokers..."
                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                  className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                >
                  <option value="revenue">Revenue</option>
                  <option value="loads">Loads</option>
                  <option value="name">Name</option>
                  <option value="lastContact">Last Contact</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-white/50 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>

                <button
                  onClick={handleSyncBrokers}
                  disabled={syncingBrokers}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 font-medium shadow-md"
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
            <div className="glass-card rounded-xl p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brokers Yet</h3>
              <p className="text-gray-600 mb-6">
                Click "Sync" to import brokers from your loads
              </p>
              <button
                onClick={handleSyncBrokers}
                disabled={syncingBrokers}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${syncingBrokers ? "animate-spin" : ""}`} />
                <span>{syncingBrokers ? "Syncing..." : "Sync Brokers Now"}</span>
              </button>
            </div>
          ) : filteredBrokers.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brokers Found</h3>
              <p className="text-gray-600 mb-6">
                No brokers match your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-200"
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

