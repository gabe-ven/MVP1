"use client";

import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    period: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  gradient: string;
  trend?: number[]; // Sparkline data
}

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  gradient,
  trend 
}: KPICardProps) {
  
  const renderSparkline = () => {
    if (!trend || trend.length === 0) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min;
    
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 100;
      const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="relative bg-white rounded-xl p-6 shadow-card border border-neutral-100 overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Sparkline Background */}
      {renderSparkline()}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              change.isPositive !== false
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}>
              <span>{change.isPositive !== false ? '↑' : '↓'}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
            <span className="text-xs text-neutral-500">{change.period}</span>
          </div>
        )}
      </div>
    </div>
  );
}

