"use client";

import { Broker } from "@/lib/crm-storage";
import { Building2, Mail, Phone, DollarSign, TrendingUp, Truck, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BrokerCardProps {
  broker: Broker;
}

export default function BrokerCard({ broker }: BrokerCardProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRPM = (rpm: number) => {
    if (rpm === 0) return "N/A";
    return `$${rpm.toFixed(2)}/mi`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "prospect":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div
      onClick={() => router.push(`/crm/brokers/${broker.id}`)}
      className="glass-effect rounded-xl p-6 border border-white/10 hover:border-orange-500/50 transition-all cursor-pointer group"
    >
      {/* Header with name and status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0 max-w-[70%]">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 rounded-lg flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
              {broker.broker_name}
            </h3>
            {broker.broker_email && (
              <div className="flex items-center space-x-1.5 mt-1 text-xs text-gray-400">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{broker.broker_email}</span>
              </div>
            )}
            {broker.broker_phone && (
              <div className="flex items-center space-x-1.5 mt-1 text-xs text-gray-400">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{broker.broker_phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${getStatusColor(broker.status)} flex-shrink-0 ml-auto`}>
          <Circle className="w-2 h-2 fill-current" />
          <span className="capitalize">{broker.status}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center space-x-2 mb-1">
            <Truck className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Total Loads</p>
          </div>
          <p className="text-xl font-bold text-white">{broker.total_loads}</p>
        </div>

        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Total Revenue</p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(broker.total_revenue)}</p>
        </div>

        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-gray-400">Avg Rate</p>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(broker.avg_rate)}</p>
        </div>

        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Avg RPM</p>
          </div>
          <p className="text-lg font-bold text-white">{formatRPM(broker.avg_rpm)}</p>
        </div>
      </div>

      {/* Last Contact Date */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Last Load:</span>
          <span className="text-white font-medium">{formatDate(broker.last_load_date)}</span>
        </div>
      </div>
    </div>
  );
}

