"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import LoadTable from "@/components/LoadTable";
import Metrics from "@/components/Metrics";
import Charts from "@/components/Charts";
import EmailDrafter from "@/components/EmailDrafter";
import GmailAuthButton from "@/components/GmailAuthButton";
import GmailStatus from "@/components/GmailStatus";
import Features from "@/components/Features";
import FAQs from "@/components/FAQs";
import AnimatedTrucks from "@/components/AnimatedTrucks";
import { LoadData } from "@/lib/schema";
import { TruckIcon } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

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
  }, []);

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
          const newLoads = data.loads || [];
          // Cache loads in sessionStorage
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

  const showLanding = !session;
  const showDashboard = session;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-gray-800/30 sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/90">
        <div className="custom-screen py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - Left */}
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

            {/* Navigation Links - Center (only show on hero page) */}
            {showLanding && (
              <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                <a
                  href="#features"
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#faq"
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors"
                >
                  FAQ
                </a>
              </nav>
            )}
            
            {/* Right Side - Gmail Status or Sign In */}
            <div className="flex items-center gap-3">
              {session ? (
                <GmailStatus onSyncComplete={fetchLoads} />
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all ${
                    showLanding 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/50' 
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/50'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && !hasLoadedOnce && (
          <div className="custom-screen py-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Hero Section */}
        {!isLoading && showLanding && (
          <section className="relative overflow-hidden min-h-screen">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Base gradient - smooth */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 via-slate-800/10 to-transparent" />
              
              {/* Sophisticated grid with perspective - Subtle with smooth FADE */}
              <div 
                className="absolute inset-0 h-[100vh] opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(148, 163, 184, 0.6) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(148, 163, 184, 0.6) 1px, transparent 1px)
                  `,
                  backgroundSize: '80px 80px',
                  transform: 'perspective(1000px) rotateX(60deg) scale(2)',
                  transformOrigin: 'center top',
                  maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.01) 85%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.01) 85%, transparent 90%)',
                }}
              />
              
              {/* Dot pattern overlay - Subtle with smooth FADE */}
              <div 
                className="absolute inset-0 h-[100vh] opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(251, 146, 60, 0.5) 1.5px, transparent 1.5px)',
                  backgroundSize: '60px 60px',
                  maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.02) 85%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.02) 85%, transparent 90%)',
                }}
              />
              
              {/* Diagonal accent lines - Subtle with smooth FADE */}
              <div className="absolute top-0 left-0 w-full h-full opacity-40">
                <div className="absolute top-1/4 -left-1/4 w-3/4 h-0.5 rotate-45 transform origin-left" style={{
                  background: 'linear-gradient(to right, transparent 0%, rgba(249, 115, 22, 0.6) 20%, rgba(249, 115, 22, 0.6) 40%, rgba(249, 115, 22, 0.4) 60%, rgba(249, 115, 22, 0.2) 80%, transparent 100%)',
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
                }} />
                <div className="absolute top-1/3 right-0 w-2/3 h-0.5 -rotate-45 transform origin-right" style={{
                  background: 'linear-gradient(to left, transparent 0%, rgba(251, 191, 36, 0.6) 20%, rgba(251, 191, 36, 0.6) 40%, rgba(251, 191, 36, 0.4) 60%, rgba(251, 191, 36, 0.2) 80%, transparent 100%)',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
                }} />
                <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 rotate-45 transform" style={{
                  background: 'linear-gradient(to right, transparent 0%, rgba(251, 146, 60, 0.5) 20%, rgba(251, 146, 60, 0.5) 40%, rgba(251, 146, 60, 0.3) 65%, rgba(251, 146, 60, 0.15) 85%, transparent 100%)',
                  boxShadow: '0 0 15px rgba(251, 146, 60, 0.2)',
                }} />
              </div>
              
              {/* Animated gradient mesh - Subtle with smooth FADE */}
              <div className="absolute inset-0 h-[100vh]" style={{
                maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.92) 18%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.24) 67%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 87%, transparent 92%)',
                WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.92) 18%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.24) 67%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 87%, transparent 92%)',
              }}>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
              </div>
              
              {/* Scan line effect - Subtle with smooth FADE */}
              <div className="absolute inset-0 h-[100vh] opacity-10" style={{
                maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 73%, rgba(0,0,0,0.05) 84%, rgba(0,0,0,0.01) 92%, transparent 95%)',
                WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 73%, rgba(0,0,0,0.05) 84%, rgba(0,0,0,0.01) 92%, transparent 95%)',
              }}>
                <div className="h-full w-full animate-[scan_8s_linear_infinite]" style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(251, 146, 60, 0.4) 50%, transparent 100%)',
                  backgroundSize: '100% 200px',
                }} />
              </div>
            </div>

            {/* Animated Trucks */}
            <AnimatedTrucks />

            <div className="custom-screen py-28 relative z-10">
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
        {!isLoading && showLanding && (
          <Features />
        )}

        {/* FAQs Section - Only on landing page */}
        {!isLoading && showLanding && (
          <FAQs />
        )}

        {/* Dashboard Content */}
        {showDashboard && (
          <div className="custom-screen py-12 space-y-20">
            {loads.length === 0 ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg shadow-orange-500/50 w-20 h-20 mx-auto flex items-center justify-center">
                    <TruckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-white text-3xl font-bold sm:text-4xl">
                    Welcome to Load Insights
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Click the <span className="text-orange-400 font-semibold">Sync</span> button in the header to import your rate confirmations from Gmail
                  </p>
                  <div className="bg-black/40 backdrop-blur-sm border border-gray-800/30 rounded-xl p-6 text-left space-y-3">
                    <p className="text-gray-300 text-sm">
                      <span className="text-orange-400 font-semibold">What happens next:</span>
                    </p>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>We'll scan your Gmail for rate confirmation PDFs from the last 30 days</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>AI will extract key data (broker, carrier, rates, routes, etc.)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>Your dashboard will populate with metrics, charts, and load history</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

