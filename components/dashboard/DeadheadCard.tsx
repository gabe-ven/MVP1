"use client";

import { TrendingDown } from "lucide-react";

interface DeadheadCardProps {
  percentage: number;
  target?: number;
}

export default function DeadheadCard({ percentage, target = 15 }: DeadheadCardProps) {
  const getColor = () => {
    if (percentage < 15) return { bg: 'bg-green-500', text: 'text-green-700', label: 'Excellent' };
    if (percentage < 25) return { bg: 'bg-yellow-500', text: 'text-yellow-700', label: 'Good' };
    return { bg: 'bg-red-500', text: 'text-red-700', label: 'Needs Work' };
  };

  const color = getColor();
  const progressWidth = Math.min(percentage, 100);

  return (
    <div className="relative bg-white rounded-xl p-6 shadow-card border border-neutral-100 overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-neutral-600">Deadhead Percentage</p>
          <div className="p-3 rounded-xl bg-orange-100">
            <TrendingDown className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{percentage}%</h3>
          <p className="text-xs text-neutral-500 mt-1">Target: &lt; {target}%</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${color.bg} rounded-full transition-all duration-500`}
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-neutral-400">0%</span>
            <span className="text-xs text-neutral-400">50%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          percentage < 15 ? 'bg-success/10 text-success' :
          percentage < 25 ? 'bg-warning/10 text-warning' :
          'bg-error/10 text-error'
        }`}>
          {color.label}
        </div>
      </div>
    </div>
  );
}

