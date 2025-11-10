"use client";

import { useState } from "react";
import { Mail, Copy, Check, Loader2, TrendingUp, MapPin, Truck } from "lucide-react";

interface BrokerInfo {
  name: string;
  email: string;
  phone: string;
  loadCount: number;
  avgRate: string;
  avgRPM: string;
  topRoutes: string[];
  topEquipment: string[];
}

interface EmailDraftResponse {
  broker: BrokerInfo;
  draftEmail: string;
}

export default function EmailDrafter() {
  const [isLoadingBroker, setIsLoadingBroker] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [brokerInfo, setBrokerInfo] = useState<BrokerInfo | null>(null);
  const [draftedEmail, setDraftedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyzeBroker = async () => {
    setIsLoadingBroker(true);
    setError(null);
    setBrokerInfo(null);
    setDraftedEmail(null);
    
    try {
      const response = await fetch("/api/draft-email");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze broker");
      }

      setBrokerInfo(data.broker);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingBroker(false);
    }
  };

  const handleDraftEmail = async () => {
    if (!brokerInfo) return;
    
    setIsLoadingEmail(true);
    
    try {
      const response = await fetch("/api/draft-email");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to draft email");
      }

      setDraftedEmail(data.draftEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    if (draftedEmail) {
      navigator.clipboard.writeText(draftedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenGmail = () => {
    if (brokerInfo?.email && draftedEmail) {
      const subject = encodeURIComponent(`Load Inquiry - Available Freight`);
      const body = encodeURIComponent(draftedEmail);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${brokerInfo.email}&su=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <div className="glass-effect rounded-xl p-8 border border-white/5">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start space-x-4 flex-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1.5">Top Broker Analysis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Identify your best broker and draft outreach emails</p>
          </div>
        </div>
        
        {!brokerInfo && (
          <button
            onClick={handleAnalyzeBroker}
            disabled={isLoadingBroker}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-shrink-0"
          >
            {isLoadingBroker ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Analyze Broker</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {brokerInfo && (
        <div className="space-y-6">
          {/* Broker Info Card */}
          <div className="bg-white/[0.02] rounded-lg p-6 border border-white/10">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              Top Broker Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-base font-semibold text-white">{brokerInfo.name}</p>
              </div>
              
              {brokerInfo.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-300 break-all">{brokerInfo.email}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Loads Completed</p>
                <p className="text-base font-semibold text-white">{brokerInfo.loadCount}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg Rate</p>
                <p className="text-base font-semibold text-white">${brokerInfo.avgRate}</p>
              </div>
              
              {parseFloat(brokerInfo.avgRPM) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg RPM</p>
                  <p className="text-base font-semibold text-white">${brokerInfo.avgRPM}/mi</p>
                </div>
              )}
            </div>

            {brokerInfo.topRoutes.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-3 flex items-center font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  Common Routes
                </p>
                <div className="space-y-2">
                  {brokerInfo.topRoutes.map((route, idx) => (
                    <p key={idx} className="text-sm text-gray-300">• {route}</p>
                  ))}
                </div>
              </div>
            )}

            {brokerInfo.topEquipment.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-3 flex items-center font-medium">
                  <Truck className="w-3.5 h-3.5 mr-1.5" />
                  Equipment Types
                </p>
                <p className="text-sm text-gray-300">{brokerInfo.topEquipment.join(', ')}</p>
              </div>
            )}
          </div>
          
          {/* Draft Email Button */}
          {!draftedEmail && (
            <div className="flex justify-center">
              <button
                onClick={handleDraftEmail}
                disabled={isLoadingEmail}
                className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoadingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Drafting Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Draft Email for {brokerInfo.name}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Email Draft */}
          {draftedEmail && (
            <>
              <div className="bg-white/[0.02] rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Drafted Email</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-all border border-white/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    
                    {brokerInfo.email && (
                      <button
                        onClick={handleOpenGmail}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open in Gmail</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-5 border border-white/5">
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-white/10">
                      <p className="text-xs text-gray-500 mb-1">To:</p>
                      <p className="text-sm text-white">{brokerInfo.email || 'No email available'}</p>
                    </div>
                    
                    <div className="pb-3 border-b border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Subject:</p>
                      <p className="text-sm text-white">Load Inquiry - Available Freight</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {draftedEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setBrokerInfo(null);
                  setDraftedEmail(null);
                }}
                className="w-full px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 transition-all border border-white/10"
              >
                Analyze Another Broker
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

