"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadData } from "@/lib/schema";
import { ArrowLeft, DollarSign, Info, Truck, Mail, Phone, Package, Thermometer, FileText, MapPin, Calendar, Building2, Hash } from "lucide-react";

export default function LoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [load, setLoad] = useState<LoadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLoad() {
      try {
        const response = await fetch("/api/loads");
        const data = await response.json();
        const foundLoad = data.loads?.find((l: LoadData, index: number) => 
          l.load_id === params.id || index.toString() === params.id
        );
        setLoad(foundLoad || null);
      } catch (error) {
        console.error("Error fetching load:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLoad();
  }, [params.id]);

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    );
  }

  if (!load) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-white">Load Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all font-medium shadow-lg shadow-orange-500/50"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-gray-800/30 sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 text-sm font-medium text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">
                Load Details
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {load.load_id || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rate Information */}
        <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-orange-400" />
            Rate Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Total Rate</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(load.rate_total || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Linehaul</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(load.linehaul_rate || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Miles</p>
              <p className="text-lg font-semibold text-white">
                {load.miles || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">RPM</p>
              <p className="text-lg font-semibold text-white">
                {formatRPM(load)}
              </p>
            </div>
          </div>
          
          {/* Accessorials */}
          {load.accessorials && load.accessorials.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-800/50">
              <p className="text-xs text-gray-400 mb-3 font-medium">Accessorials</p>
              <div className="space-y-2">
                {load.accessorials.map((acc, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300">{acc.name}</span>
                    <span className="font-medium text-white">
                      {formatCurrency(acc.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Broker Information */}
          <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-amber-400" />
              Broker Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Building2 className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Company Name</p>
                  <p className="text-sm font-medium text-white">
                    {load.broker_name || "N/A"}
                  </p>
                </div>
              </div>
              {load.broker_email && (
                <div className="flex items-start">
                  <Mail className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-white break-all">
                      {load.broker_email}
                    </p>
                  </div>
                </div>
              )}
              {load.broker_phone && (
                <div className="flex items-start">
                  <Phone className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-white">
                      {load.broker_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Carrier Information */}
          {(load.carrier_name || load.carrier_mc) && (
            <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-amber-400" />
                Carrier Information
              </h3>
              <div className="space-y-3">
                {load.carrier_name && (
                  <div className="flex items-start">
                    <Building2 className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Company Name</p>
                      <p className="text-sm font-medium text-white">
                        {load.carrier_name}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_mc && (
                  <div className="flex items-start">
                    <Hash className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">MC Number</p>
                      <p className="text-sm font-medium text-white">
                        {load.carrier_mc}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_address && (
                  <div className="flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Address</p>
                      <p className="text-sm font-medium text-white">
                        {load.carrier_address}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_phone && (
                  <div className="flex items-start">
                    <Phone className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-white">
                        {load.carrier_phone}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_email && (
                  <div className="flex items-start">
                    <Mail className="w-3.5 h-3.5 mr-2 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-white break-all">
                        {load.carrier_email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Stops */}
        {load.stops && load.stops.length > 0 && (
          <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
            <h3 className="text-base font-semibold text-white mb-5 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-orange-400" />
              Stops ({load.stops.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {load.stops.map((stop, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/30 rounded-lg p-4 border border-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      px-2.5 py-1 rounded-md text-xs font-medium uppercase
                      ${stop.type === 'pickup' 
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }
                    `}>
                      {stop.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      Stop #{idx + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {stop.location_name && (
                      <p className="text-sm font-semibold text-white">
                        {stop.location_name}
                      </p>
                    )}
                    {stop.address && (
                      <p className="text-sm text-gray-400">
                        {stop.address}
                      </p>
                    )}
                    {(stop.city || stop.state) && (
                      <p className="text-sm text-gray-400">
                        {stop.city}, {stop.state}{stop.zip ? ` ${stop.zip}` : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800/50">
                      {stop.date && (
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {stop.date}
                        </div>
                      )}
                      {stop.time && (
                        <span className="text-xs text-gray-400">
                          {stop.time}
                        </span>
                      )}
                    </div>
                    {stop.appointment_type && (
                      <p className="text-xs text-gray-400 mt-1">
                        {stop.appointment_type}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Load Details */}
        <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center">
            <Package className="w-4 h-4 mr-2 text-orange-400" />
            Load Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {load.equipment_type && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Equipment Type</p>
                <p className="text-sm font-medium text-white">
                  {load.equipment_type}
                </p>
              </div>
            )}
            {(load.temp_min || load.temp_max) && (
              <div className="flex items-start">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Temperature</p>
                  <p className="text-sm font-medium text-white">
                    {load.temp_min}° - {load.temp_max}°
                  </p>
                </div>
              </div>
            )}
            {load.commodity && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Commodity</p>
                <p className="text-sm font-medium text-white">
                  {load.commodity}
                </p>
              </div>
            )}
            {load.weight && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Weight</p>
                <p className="text-sm font-medium text-white">
                  {load.weight}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        {load.notes && (
          <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-orange-400" />
              Special Instructions & Notes
            </h3>
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-4 border border-gray-800/50">
              {load.notes}
            </div>
          </section>
        )}

        {/* Metadata */}
        {(load.source_file || load.extracted_at) && (
          <section className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-800/30">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Metadata
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {load.source_file && (
                <p>Source: {load.source_file}</p>
              )}
              {load.extracted_at && (
                <p>
                  Extracted: {new Date(load.extracted_at).toLocaleString()}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

