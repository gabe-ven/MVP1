"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadTable from "@/components/LoadTable";
import Metrics from "@/components/Metrics";
import Charts from "@/components/Charts";
import EmailDrafter from "@/components/EmailDrafter";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";
import { LoadData } from "@/lib/schema";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Redirect unauthenticated users to landing
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Reset cached data when the user signs out
  useEffect(() => {
    if (!session) {
      setLoads([]);
      setHasLoadedOnce(false);
      setIsLoading(false);
      sessionStorage.removeItem("cachedLoads");
      sessionStorage.removeItem("hasLoadedOnce");
    }
  }, [session]);

  // Restore from sessionStorage after hydration (client-side only)
  useEffect(() => {
    if (session) {
      const cached = sessionStorage.getItem('cachedLoads');
      const hasLoaded = sessionStorage.getItem('hasLoadedOnce') === 'true';
      
      if (cached) {
        try {
          setLoads(JSON.parse(cached));
          setIsLoading(false);
        } catch (e) {
          console.error('Failed to restore cached loads:', e);
        }
      }
      
      if (hasLoaded) {
        setHasLoadedOnce(true);
      }
    } else {
      sessionStorage.removeItem("cachedLoads");
      sessionStorage.removeItem("hasLoadedOnce");
      setIsLoading(false);
    }
  }, [session]);

  const fetchLoads = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await fetch("/api/loads");
      const data = await response.json();
      
      setLoads(prevLoads => {
        const newLoadsJson = JSON.stringify(data.loads || []);
        const prevLoadsJson = JSON.stringify(prevLoads);
        
        if (newLoadsJson !== prevLoadsJson) {
          const newLoads = data.loads || [];
          sessionStorage.setItem('cachedLoads', JSON.stringify(newLoads));
          return newLoads;
        }
        return prevLoads;
      });
      setHasLoadedOnce(true);
      sessionStorage.setItem('hasLoadedOnce', 'true');
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load existing data on mount
  useEffect(() => {
    if (session) {
      fetchLoads();
      
      const handleFocus = () => fetchLoads(false);
      window.addEventListener('focus', handleFocus);
      
      const pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchLoads(false);
        }
      }, 30000);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        clearInterval(pollInterval);
      };
    }
  }, [fetchLoads, session]);


  // Calculate metrics
  const calculateMetrics = () => {
    if (loads.length === 0) {
      return {
        totalLoads: 0,
        totalRevenue: 0,
        averageRate: 0,
        averageRPM: 0,
      };
    }

    const totalRevenue = loads.reduce(
      (sum, load) => sum + (load.rate_total || 0),
      0
    );
    const averageRate = totalRevenue / loads.length;

    const loadsWithMiles = loads.filter((load) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      return miles > 0;
    });

    let averageRPM = 0;
    if (loadsWithMiles.length > 0) {
      const totalRPM = loadsWithMiles.reduce((sum, load) => {
        const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
        return sum + load.rate_total / miles;
      }, 0);
      averageRPM = totalRPM / loadsWithMiles.length;
    }

    return {
      totalLoads: loads.length,
      totalRevenue,
      averageRate,
      averageRPM,
    };
  };

  // Get revenue by broker
  const getRevenueByBroker = () => {
    const brokerMap = new Map<string, number>();

    loads.forEach((load) => {
      const broker = load.broker_name || "Unknown";
      const current = brokerMap.get(broker) || 0;
      brokerMap.set(broker, current + (load.rate_total || 0));
    });

    return Array.from(brokerMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Get RPM trend
  const getRPMTrend = () => {
    return loads
      .filter((load) => {
        const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
        return miles > 0 && load.stops && load.stops.length > 0;
      })
      .map((load) => {
        const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
        const rpm = load.rate_total / miles;
        const date = load.stops[0]?.date || "";
        return {
          date,
          rpm,
          loadId: load.load_id,
        };
      })
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  };

  const metrics = calculateMetrics();
  const revenueByBroker = getRevenueByBroker();
  const rpmTrend = getRPMTrend();

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header onSyncComplete={fetchLoads} />
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
      <Header onSyncComplete={fetchLoads} />

      <div className="custom-screen py-12 space-y-20">
        {loads.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-gray-900 text-3xl font-bold sm:text-5xl tracking-tight">
                Welcome to Load Insights
              </h2>
              <p className="text-gray-600 text-lg">
                Sync your Gmail and we'll import your recent rate confirmations to build your dashboard.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => fetchLoads(true)}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:scale-95 transition-all font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>{isLoading ? "Syncing..." : "Sync Gmail Now"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <section className="space-y-6 pb-8">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-gray-900 text-3xl font-bold sm:text-4xl">
                  Key Metrics
                </h2>
                <p className="mt-3 text-gray-600">
                  Overview of your freight operations
                </p>
              </div>
              <Metrics
                totalLoads={metrics.totalLoads}
                totalRevenue={metrics.totalRevenue}
                averageRate={metrics.averageRate}
                averageRPM={metrics.averageRPM}
              />
            </section>

            {/* Dashboard Content */}
            <>
                {/* Charts Section */}
                <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-gray-900 text-3xl font-bold sm:text-4xl">
                  Analytics
                </h2>
                <p className="mt-3 text-gray-600">
                  Performance insights and trends
                </p>
              </div>
                  <Charts
                    revenueByBroker={revenueByBroker}
                    rpmTrend={rpmTrend}
                  />
                </section>

                {/* Email Drafter Section */}
                <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-gray-900 text-3xl font-bold sm:text-4xl">
                  Broker Outreach
                </h2>
                <p className="mt-3 text-gray-600">
                  Analyze your top brokers and generate personalized emails
                </p>
              </div>
                  <EmailDrafter />
                </section>

                {/* Loads Table Section */}
                <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-gray-900 text-3xl font-bold sm:text-4xl">
                  All Loads <span className="text-gray-500">({loads.length})</span>
                </h2>
                <p className="mt-3 text-gray-600">
                  Complete history of your rate confirmations
                </p>
              </div>
                  <LoadTable loads={loads} />
                </section>
            </>
          </>
        )}
      </div>

      {/* AI Chatbot */}
      {session && <ChatBot />}
    </main>
  );
}

