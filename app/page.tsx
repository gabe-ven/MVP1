"use client";

import { useEffect, useState, useCallback } from "react";
import LoadTable from "@/components/LoadTable";
import Metrics from "@/components/Metrics";
import Charts from "@/components/Charts";
import EmailDrafter from "@/components/EmailDrafter";
import GmailAuthButton from "@/components/GmailAuthButton";
import GmailStatus from "@/components/GmailStatus";
import Features from "@/components/Features";
import FAQs from "@/components/FAQs";
import { LoadData } from "@/lib/schema";
import { TruckIcon } from "lucide-react";

export default function Home() {
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoads = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await fetch("/api/loads");
      const data = await response.json();
      
      // Update loads - React will handle re-renders efficiently
      setLoads(prevLoads => {
        const newLoadsJson = JSON.stringify(data.loads || []);
        const prevLoadsJson = JSON.stringify(prevLoads);
        
        // Only update if data has actually changed
        if (newLoadsJson !== prevLoadsJson) {
          return data.loads || [];
        }
        return prevLoads;
      });
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load existing data on mount and when returning from detail page
  useEffect(() => {
    fetchLoads();
    
    // Auto-refresh when window regains focus
    const handleFocus = () => fetchLoads(false);
    window.addEventListener('focus', handleFocus);
    
    // Light polling for manual uploads only (every 30 seconds)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLoads(false); // Don't show loading spinner
      }
    }, 30000); // Reduced from 3s to 30s since Gmail auto-syncs
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchLoads]);

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

    // Calculate average RPM
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

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-gray-800/30 sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/90">
        <div className="custom-screen py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/50">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Load Insights
                </h1>
                <p className="text-xs text-gray-400">
                  AI-Powered Rate Analysis
                </p>
              </div>
            </div>
            
            {/* Gmail Status */}
            <GmailStatus onSyncComplete={fetchLoads} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative">
        {/* Hero Section */}
        {loads.length === 0 && (
          <section className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10">
              {/* Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1f_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
              
              {/* Gradient Orbs */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>

            <div className="custom-screen py-28">
              <div className="space-y-5 max-w-3xl mx-auto text-center">
                <h1 
                  className="text-4xl bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-6xl"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)"
                  }}
                >
                  Analyze Your Freight Business In Seconds
                </h1>
                <p className="max-w-xl mx-auto text-gray-100 text-lg">
                  Connect your Gmail to get AI-powered insights from your rate confirmations: revenue analytics, RPM trends, broker performance, and detailed load tracking.
                </p>
              </div>
              
              {/* Gmail Sign In Section */}
              <div className="mt-12">
                <GmailAuthButton />
              </div>
              
              {/* Hero Image with Glow Effect */}
              <div className="relative mt-16 sm:mt-20">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent blur-3xl" />
                <div className="relative max-w-6xl mx-auto">
                  <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-orange-500/30">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-amber-500/10" />
                    <img
                      src="/preview.png"
                      className="relative"
                      alt="Load Insights Dashboard Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {loads.length === 0 && (
          <Features />
        )}

        {/* FAQs Section - Only on landing page */}
        {loads.length === 0 && (
          <FAQs />
        )}

        {/* Dashboard Content */}
        {loads.length > 0 && (
          <div className="custom-screen py-12 space-y-20">
            <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-white text-3xl font-bold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                  Key Metrics
                </h2>
                <p className="mt-3 text-gray-300">
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

            {/* Charts Section */}
            <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-white text-3xl font-bold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                  Analytics
                </h2>
                <p className="mt-3 text-gray-300">
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
                <h2 className="text-white text-3xl font-bold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                  Broker Outreach
                </h2>
                <p className="mt-3 text-gray-300">
                  Analyze your top brokers and generate personalized emails
                </p>
              </div>
              <EmailDrafter />
            </section>

            {/* Loads Table Section */}
            <section className="space-y-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-white text-3xl font-bold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                  All Loads <span className="text-gray-300">({loads.length})</span>
                </h2>
                <p className="mt-3 text-gray-300">
                  Complete history of your rate confirmations
                </p>
              </div>
              <LoadTable loads={loads} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

