"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadData } from "@/lib/schema";
import { ArrowLeft, DollarSign, Info, Truck, Mail, Phone, Package, Thermometer, FileText, MapPin, Calendar, Building2, Hash, ExternalLink } from "lucide-react";

export default function LoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [load, setLoad] = useState<LoadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brokerId, setBrokerId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoad() {
      try {
        const response = await fetch("/api/loads");
        const data = await response.json();
        const foundLoad = data.loads?.find((l: LoadData, index: number) => 
          l.load_id === params.id || index.toString() === params.id
        );
        setLoad(foundLoad || null);
        
        // Try to fetch broker ID if broker email exists
        if (foundLoad?.broker_email) {
          try {
            const brokersResponse = await fetch("/api/crm/brokers");
            const brokersData = await brokersResponse.json();
            const broker = brokersData.brokers?.find(
              (b: any) => b.broker_email?.toLowerCase() === foundLoad.broker_email?.toLowerCase()
            );
            if (broker) {
              setBrokerId(broker.id);
            }
          } catch (error) {
            console.error("Error fetching broker:", error);
          }
        }
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-lg">Loading...</div>
      </main>
    );
  }

  if (!load) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">Load Not Found</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 px-4 py-2 bg-white/50 hover:bg-gray-50 rounded-lg transition-all border border-gray-200 text-sm font-medium text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Load Details
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {load.load_id || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rate Information */}
        <section className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
            Rate Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Total Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(load.rate_total || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Linehaul</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(load.linehaul_rate || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Miles</p>
              <p className="text-lg font-semibold text-gray-900">
                {load.miles || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">RPM</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatRPM(load)}
              </p>
            </div>
          </div>
          
          {/* Accessorials */}
          {load.accessorials && load.accessorials.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3 font-medium">Accessorials</p>
              <div className="space-y-2">
                {load.accessorials.map((acc, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{acc.name}</span>
                    <span className="font-medium text-gray-900">
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
          <section className="glass-card rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                Broker Information
              </h3>
              {brokerId && (
                <button
                  onClick={() => router.push(`/crm/brokers/${brokerId}`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-all border border-blue-200"
                >
                  <span>View in CRM</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <Building2 className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Company Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {load.broker_name || "N/A"}
                  </p>
                </div>
              </div>
              {load.broker_email && (
                <div className="flex items-start">
                  <Mail className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {load.broker_email}
                    </p>
                  </div>
                </div>
              )}
              {load.broker_phone && (
                <div className="flex items-start">
                  <Phone className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {load.broker_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Carrier Information */}
          {(load.carrier_name || load.carrier_mc) && (
            <section className="glass-card rounded-xl p-6 border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-blue-600" />
                Carrier Information
              </h3>
              <div className="space-y-3">
                {load.carrier_name && (
                  <div className="flex items-start">
                    <Building2 className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Company Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {load.carrier_name}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_mc && (
                  <div className="flex items-start">
                    <Hash className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">MC Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {load.carrier_mc}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_address && (
                  <div className="flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {load.carrier_address}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_phone && (
                  <div className="flex items-start">
                    <Phone className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {load.carrier_phone}
                      </p>
                    </div>
                  </div>
                )}
                {load.carrier_email && (
                  <div className="flex items-start">
                    <Mail className="w-3.5 h-3.5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">
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
          <section className="glass-card rounded-xl p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Stops ({load.stops.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {load.stops.map((stop, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      px-2.5 py-1 rounded-md text-xs font-medium uppercase
                      ${stop.type === 'pickup' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }
                    `}>
                      {stop.type}
                    </span>
                    <span className="text-xs text-gray-600">
                      Stop #{idx + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {stop.location_name && (
                      <p className="text-sm font-semibold text-gray-900">
                        {stop.location_name}
                      </p>
                    )}
                    {stop.address && (
                      <p className="text-sm text-gray-600">
                        {stop.address}
                      </p>
                    )}
                    {(stop.city || stop.state) && (
                      <p className="text-sm text-gray-600">
                        {stop.city}, {stop.state}{stop.zip ? ` ${stop.zip}` : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      {stop.date && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {stop.date}
                        </div>
                      )}
                      {stop.time && (
                        <span className="text-xs text-gray-600">
                          {stop.time}
                        </span>
                      )}
                    </div>
                    {stop.appointment_type && (
                      <p className="text-xs text-gray-600 mt-1">
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
        <section className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
            <Package className="w-4 h-4 mr-2 text-blue-600" />
            Load Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {load.equipment_type && (
              <div>
                <p className="text-xs text-gray-600 mb-1.5">Equipment Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {load.equipment_type}
                </p>
              </div>
            )}
            {(load.temp_min || load.temp_max) && (
              <div className="flex items-start">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">Temperature</p>
                  <p className="text-sm font-medium text-gray-900">
                    {load.temp_min}° - {load.temp_max}°
                  </p>
                </div>
              </div>
            )}
            {load.commodity && (
              <div>
                <p className="text-xs text-gray-600 mb-1.5">Commodity</p>
                <p className="text-sm font-medium text-gray-900">
                  {load.commodity}
                </p>
              </div>
            )}
            {load.weight && (
              <div>
                <p className="text-xs text-gray-600 mb-1.5">Weight</p>
                <p className="text-sm font-medium text-gray-900">
                  {load.weight}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        {load.notes && (
          <section className="glass-card rounded-xl p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Special Instructions & Notes
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white/50 rounded-lg p-4 border border-gray-200">
              {load.notes}
            </div>
          </section>
        )}

        {/* Metadata */}
        {(load.source_file || load.extracted_at) && (
          <section className="glass-card rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Metadata
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
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

