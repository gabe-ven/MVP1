"use client";

import { DollarSign, TrendingUp, Truck, Activity } from "lucide-react";

interface MetricsProps {
  totalLoads: number;
  totalRevenue: number;
  averageRate: number;
  averageRPM: number;
}

export default function Metrics({
  totalLoads,
  totalRevenue,
  averageRate,
  averageRPM,
}: MetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      name: "Total Loads",
      value: totalLoads.toString(),
      icon: Truck,
    },
    {
      name: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
    },
    {
      name: "Average Rate",
      value: formatCurrency(averageRate),
      icon: TrendingUp,
    },
    {
      name: "Average RPM",
      value: `$${averageRPM.toFixed(2)}`,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const gradients = [
          'from-orange-500 to-amber-500',
          'from-green-500 to-emerald-500',
          'from-violet-500 to-purple-500',
          'from-red-500 to-rose-500'
        ];
        const glows = [
          'from-orange-500/20 to-amber-500/20',
          'from-green-500/20 to-emerald-500/20',
          'from-violet-500/20 to-purple-500/20',
          'from-red-500/20 to-rose-500/20'
        ];
        return (
          <div
            key={metric.name}
            className="relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${glows[idx]} rounded-xl blur-xl animate-pulse-glow`} />
            <div className="relative space-y-4 p-6 rounded-xl border border-gray-800/30 bg-black/40 backdrop-blur-sm text-center">
              <div className="flex justify-center">
                <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${gradients[idx]} rounded-lg text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  {metric.name}
                </p>
                <p className="text-3xl font-bold text-white">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
