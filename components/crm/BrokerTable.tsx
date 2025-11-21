"use client";

import { useState } from "react";
import { Broker } from "@/lib/crm-storage";
import { Building2, Mail, Phone, Circle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import EmailModal from "./EmailModal";

interface BrokerTableProps {
  brokers: Broker[];
}

export default function BrokerTable({ brokers }: BrokerTableProps) {
  const router = useRouter();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<{ email: string; name: string } | null>(null);

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
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "inactive":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "prospect":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
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

  const handleSendEmail = (e: React.MouseEvent, brokerEmail: string, brokerName: string) => {
    e.stopPropagation(); // Prevent row click navigation
    setSelectedBroker({ email: brokerEmail, name: brokerName });
    setEmailModalOpen(true);
  };

  const handleRowClick = (brokerId: string) => {
    router.push(`/crm/brokers/${brokerId}`);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedBroker(null);
  };

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Broker
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Loads
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Avg Rate
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Avg RPM
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Load
              </th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker, index) => (
              <tr
                key={broker.id}
                onClick={() => handleRowClick(broker.id)}
                className={`cursor-pointer hover:bg-gray-50/50 transition-colors ${
                  index !== brokers.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Broker Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg flex-shrink-0">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                      {broker.broker_name}
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center space-y-1">
                    {broker.broker_email && (
                      <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-full">{broker.broker_email}</span>
                      </div>
                    )}
                    {broker.broker_phone && (
                      <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{broker.broker_phone}</span>
                      </div>
                    )}
                    {!broker.broker_email && !broker.broker_phone && (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${getStatusColor(
                        broker.status
                      )}`}
                    >
                      <Circle className="w-2 h-2 fill-current" />
                      <span className="capitalize">{broker.status}</span>
                    </div>
                  </div>
                </td>

                {/* Total Loads */}
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-gray-900 text-center">
                    {broker.total_loads}
                  </div>
                </td>

                {/* Total Revenue */}
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-emerald-600 text-center truncate">
                    {formatCurrency(broker.total_revenue)}
                  </div>
                </td>

                {/* Avg Rate */}
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-gray-900 text-center truncate">
                    {formatCurrency(broker.avg_rate)}
                  </div>
                </td>

                {/* Avg RPM */}
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-gray-900 text-center">
                    {formatRPM(broker.avg_rpm)}
                  </div>
                </td>

                {/* Last Load Date */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 text-center whitespace-nowrap">
                    {formatDate(broker.last_load_date)}
                  </div>
                </td>

                {/* Action Button */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    {broker.broker_email ? (
                      <button
                        onClick={(e) => handleSendEmail(e, broker.broker_email!, broker.broker_name)}
                        className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all font-medium whitespace-nowrap shadow-sm"
                        title={`Email ${broker.broker_name}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No Email</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Email Modal - Outside table container for full screen positioning */}
    {emailModalOpen && selectedBroker && (
      <EmailModal
        recipientEmail={selectedBroker.email}
        recipientName={selectedBroker.name}
        onClose={closeEmailModal}
      />
    )}
    </>
  );
}

