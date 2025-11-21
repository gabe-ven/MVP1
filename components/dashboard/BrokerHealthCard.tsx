"use client";

import { Star } from "lucide-react";

interface BrokerHealthCardProps {
  rating: number; // 0-5
  subtitle?: string;
}

export default function BrokerHealthCard({ rating, subtitle = "Payment speed, rates, reliability" }: BrokerHealthCardProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const fillPercentage = Math.max(0, Math.min(1, rating - index)) * 100;
      
      return (
        <div key={index} className="relative">
          {/* Background star (gray) */}
          <Star className="w-6 h-6 text-neutral-200" />
          
          {/* Foreground star (colored) with gradient fill and glow */}
          {fillPercentage > 0 && (
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="relative bg-white rounded-xl p-6 shadow-card border border-neutral-100 overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-neutral-600">Broker Health Score</p>
          <div className="p-3 rounded-xl bg-yellow-100">
            <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{rating.toFixed(1)} / 5</h3>
          <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {renderStars()}
        </div>

        {/* Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          rating >= 4.5 ? 'bg-success/10 text-success' :
          rating >= 4.0 ? 'bg-primary/10 text-primary' :
          rating >= 3.5 ? 'bg-warning/10 text-warning' :
          'bg-error/10 text-error'
        }`}>
          {rating >= 4.5 ? 'Excellent' :
           rating >= 4.0 ? 'Very Good' :
           rating >= 3.5 ? 'Good' :
           'Needs Attention'}
        </div>
      </div>
    </div>
  );
}

