"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartsProps {
  revenueByBroker: Array<{ name: string; revenue: number }>;
  rpmTrend: Array<{ date: string; rpm: number; loadId: string }>;
}

export default function Charts({ revenueByBroker, rpmTrend }: ChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue by Broker Bar Chart */}
      <div className="glass-effect rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
        <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 w-1 h-6 mr-3 rounded-full"></span>
          Revenue by Broker
        </h3>
        {revenueByBroker.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={revenueByBroker}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="rgba(255,255,255,0.2)"
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "rgba(10, 14, 26, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
                labelStyle={{ color: "#9ca3af" }}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af' }}
              />
              <Bar
                dataKey="revenue"
                fill="url(#colorRevenue)"
                radius={[8, 8, 0, 0]}
                name="Revenue"
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* RPM Trend Line Chart */}
      <div className="glass-effect rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all">
        <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center">
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 w-1 h-6 mr-3 rounded-full"></span>
          RPM Trend Over Time
        </h3>
        {rpmTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={rpmTrend}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="rgba(255,255,255,0.2)"
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: "rgba(10, 14, 26, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
                labelStyle={{ color: "#9ca3af" }}
                cursor={{ stroke: "rgba(59, 130, 246, 0.3)", strokeWidth: 2 }}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af' }}
              />
              <Line
                type="monotone"
                dataKey="rpm"
                stroke="url(#colorRPM)"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7 }}
                name="RPM"
              />
              <defs>
                <linearGradient id="colorRPM" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-center px-4">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400 font-medium mb-2">No RPM data available</p>
            <p className="text-sm text-gray-500 max-w-xs">
              Your PDFs have "NA" for miles. RPM requires valid mileage to calculate rate per mile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
