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
  TrendingDown
} from "lucide-react";

// Mock loads data - 20 items sorted by date
const MOCK_DASHBOARD_LOADS = Array.from({ length: 20 }, (_, i) => {
  const date = new Date(2024, 10, 22 - i);
  return {
    id: `LOAD-${12345 + i}`,
    broker: ["TQL", "CH Robinson", "Coyote", "Landstar", "XPO"][i % 5],
    origin: ["Los Angeles, CA", "Dallas, TX", "Chicago, IL", "Miami, FL", "Phoenix, AZ"][i % 5],
    destination: ["Phoenix, AZ", "Atlanta, GA", "Memphis, TN", "New York, NY", "Denver, CO"][i % 5],
    rate: 2500 + (i * 150),
    miles: 850 + (i * 50),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: date,
    rpm: ((2500 + (i * 150)) / (850 + (i * 50))).toFixed(2),
    status: ["Offered", "Accepted", "In Transit"][i % 3]
  };
}).sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const DEV_MODE = true;

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

  if (!DEV_MODE && status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
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
            <p className="text-3xl font-bold text-neutral-900 mb-1">24</p>
            <p className="text-sm text-neutral-500 mb-2">Active Loads</p>
            <div className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              +8 this week
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">$45K</p>
            <p className="text-sm text-neutral-500 mb-2">Monthly Revenue</p>
            <div className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              +15% vs last month
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">8</p>
            <p className="text-sm text-neutral-500 mb-2">Active Brokers</p>
            <div className="text-xs text-neutral-500 font-medium">
              2 new this month
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">28</p>
            <p className="text-sm text-neutral-500 mb-2">Avg Payment Days</p>
            <div className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              -3 days improved
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Weekly Revenue Trend</h3>
            <div className="space-y-4">
              {/* Bar Chart Container */}
              <div className="h-32 flex items-end justify-between gap-2 mb-2">
                {[2100, 2400, 1800, 2800, 3200, 2900, 3400].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                      style={{ height: `${(value / 3400) * 100}%` }}
                      title={`$${value.toLocaleString()}`}
                    />
                  </div>
                ))}
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
                <span className="text-2xl font-bold text-gray-900">$18,600</span>
                <span className="flex items-center gap-1 text-success text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +23%
                </span>
              </div>
            </div>
          </div>

          {/* RPM Circle */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold text-neutral-900 mb-6">Average RPM</h3>
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
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">$2.94</span>
                <span className="text-sm text-neutral-500">/mile</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-success font-semibold">75% of target</span>
            </div>
          </div>

          {/* Top Lane */}
          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Top Performing Lane</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">LA → Phoenix</p>
                  <p className="text-sm text-neutral-600">850 miles avg</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Loads</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Avg Rate</p>
                  <p className="text-2xl font-bold text-success">$2,500</p>
                </div>
              </div>
              
              <button 
                onClick={() => router.push("/loads")}
                className="w-full mt-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors"
              >
                Find More on This Lane
              </button>
            </div>
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
              {MOCK_DASHBOARD_LOADS.map((load) => (
                <div 
                  key={load.id}
                  className="group bg-white p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => router.push(`/loads?id=${load.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-neutral-900 text-sm">{load.id}</span>
                      <span className="text-xs text-neutral-500">{load.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      load.status === 'Offered' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      load.status === 'Accepted' ? 'bg-green-50 text-green-600 border border-green-200' :
                      'bg-purple-50 text-purple-600 border border-purple-200'
                    }`}>
                      {load.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-neutral-600 mb-2">{load.broker}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500">
                        <span className="font-medium text-gray-900">{load.origin}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium text-gray-900">{load.destination}</span>
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">{load.miles} miles</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900 text-sm">${load.rate.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">${load.rpm}/mi</p>
                    </div>
                  </div>
                </div>
              ))}
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
              {MOCK_DASHBOARD_LOADS.map((load) => (
                <div 
                  key={load.id}
                  className="group bg-white p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => router.push(`/loads?id=${load.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-xs font-medium text-neutral-700">{load.date}</span>
                    </div>
                    <span className="font-semibold text-neutral-900 text-sm">{load.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-xs text-neutral-600">{load.broker}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500">
                        <span className="font-medium text-gray-900">{load.origin}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium text-gray-900">{load.destination}</span>
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">{load.miles} miles</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">${load.rate.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">${load.rpm}/mi</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
                </section>
      </div>

      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  );
}
