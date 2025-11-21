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
          'from-blue-500 to-blue-600',
          'from-emerald-500 to-teal-600',
          'from-purple-500 to-indigo-600',
          'from-orange-500 to-amber-500'
        ];
        const iconBgs = [
          'bg-blue-50',
          'bg-emerald-50',
          'bg-purple-50',
          'bg-orange-50'
        ];
        return (
          <div
            key={metric.name}
            className="glass-card rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-center mb-4">
              <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${gradients[idx]} rounded-xl text-white shadow-lg`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {metric.name}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {metric.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
