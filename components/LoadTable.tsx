"use client";

import { LoadData } from "@/lib/schema";
import { MapPin, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoadTableProps {
  loads: LoadData[];
}

export default function LoadTable({ loads }: LoadTableProps) {
  const router = useRouter();
  
  if (loads.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-gray-400">
          No loads yet. Upload some rate confirmation PDFs to get started.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatRPM = (load: LoadData) => {
    const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
    if (miles > 0) {
      const rpm = load.rate_total / miles;
      return `$${rpm.toFixed(2)}`;
    }
    return "N/A";
  };

  return (
    <div className="glass-effect rounded-2xl overflow-hidden border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Load ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Broker
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Miles
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                RPM
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loads.map((load, index) => {
              // Get FIRST pickup and LAST delivery for route display
              const pickups = load.stops?.filter((s) => s.type === "pickup") || [];
              const deliveries = load.stops?.filter((s) => s.type === "delivery") || [];
              
              const firstPickup = pickups[0];
              const lastDelivery = deliveries[deliveries.length - 1];
              
              // Build origin string with fallback to location_name or address
              const origin = firstPickup?.city && firstPickup?.state 
                ? `${firstPickup.city}, ${firstPickup.state}`
                : (firstPickup?.location_name || firstPickup?.address || "Unknown origin");
              
              // Build destination string with fallback (use LAST delivery)
              const destination = lastDelivery?.city && lastDelivery?.state
                ? `${lastDelivery.city}, ${lastDelivery.state}`
                : (lastDelivery?.location_name || lastDelivery?.address || "Unknown destination");
              
              const route = `${origin} → ${destination}`;

              return (
                <tr 
                  key={index} 
                  className="hover:bg-white/5 cursor-pointer transition-all"
                  onClick={() => router.push(`/load/${index}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {load.load_id || "N/A"}
                    </div>
                    {firstPickup?.date && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {firstPickup.date}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {load.broker_name || "N/A"}
                    </div>
                    {load.broker_email && (
                      <div className="text-xs text-gray-400">
                        {load.broker_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white flex items-start">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{route}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {load.equipment_type || "N/A"}
                    </div>
                    {load.temp_min && load.temp_max && (
                      <div className="text-xs text-gray-400">
                        {load.temp_min}° - {load.temp_max}°
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {load.miles || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-400">
                      {formatCurrency(load.rate_total || 0)}
                    </div>
                    {load.linehaul_rate > 0 && (
                      <div className="text-xs text-gray-400">
                        Base: {formatCurrency(load.linehaul_rate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">
                    {formatRPM(load)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
