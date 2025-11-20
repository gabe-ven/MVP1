"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrokerWithDetails } from "@/lib/crm-storage";
import { LoadData } from "@/lib/schema";
import InteractionForm from "@/components/crm/InteractionForm";
import TaskForm from "@/components/crm/TaskForm";
import TaskList from "@/components/crm/TaskList";
import {
  Building2,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Truck,
  MessageSquare,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  Edit2,
  CheckCircle2,
} from "lucide-react";

export default function BrokerDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [broker, setBroker] = useState<BrokerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchBroker();
    }
  }, [session, params.id]);

  const fetchBroker = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/crm/brokers/${params.id}`);
      const data = await response.json();
      setBroker(data.broker);
      setNotes(data.broker.notes || "");
    } catch (error) {
      console.error("Error fetching broker:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/crm/brokers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setEditingNotes(false);
        fetchBroker();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleSendEmail = () => {
    if (broker?.broker_email) {
      const subject = encodeURIComponent("Load Inquiry");
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${broker.broker_email}&su=${subject}`,
        "_blank"
      );
    }
  };

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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "call":
        return <Phone className="w-4 h-4" />;
      case "meeting":
        return <Building2 className="w-4 h-4" />;
      case "note":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Broker Not Found</h2>
          <button
            onClick={() => router.push("/")}
            className="text-orange-400 hover:text-orange-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-gray-800/30 sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/90">
        <div className="custom-screen py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="custom-screen py-12 space-y-8">
        {/* Broker Info Card */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{broker.broker_name}</h1>
                <div className="space-y-1">
                  {broker.broker_email && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="w-4 h-4" />
                      <span>{broker.broker_email}</span>
                    </div>
                  )}
                  {broker.broker_phone && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Phone className="w-4 h-4" />
                      <span>{broker.broker_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInteractionForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Log Interaction</span>
              </button>
              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              {broker.broker_email && (
                <button
                  onClick={handleSendEmail}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-all border border-white/10"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Total Loads</p>
              </div>
              <p className="text-2xl font-bold text-white">{broker.total_loads}</p>
            </div>

            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(broker.total_revenue)}</p>
            </div>

            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-gray-400">Avg Rate</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(broker.avg_rate)}</p>
            </div>

            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Avg RPM</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatRPM(broker.avg_rpm)}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Notes
              </h3>
              {!editingNotes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveNotes}
                    className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      setNotes(broker.notes || "");
                    }}
                    className="text-gray-400 hover:text-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this broker..."
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">
                {broker.notes || "No notes yet"}
              </p>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
          <TaskList tasks={broker.tasks || []} onTaskUpdate={fetchBroker} />
        </div>

        {/* Interaction Timeline */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Interaction History</h2>
            <button
              onClick={() => setShowInteractionForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Interaction</span>
            </button>
          </div>

          {broker.interactions && broker.interactions.length > 0 ? (
            <div className="space-y-4">
              {broker.interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="bg-white/[0.02] rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      interaction.interaction_type === "email" ? "bg-blue-500/20 text-blue-400" :
                      interaction.interaction_type === "call" ? "bg-green-500/20 text-green-400" :
                      interaction.interaction_type === "meeting" ? "bg-purple-500/20 text-purple-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {getInteractionIcon(interaction.interaction_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white font-medium">
                          {interaction.subject || `${interaction.interaction_type.charAt(0).toUpperCase() + interaction.interaction_type.slice(1)} Interaction`}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(interaction.interaction_date)}
                        </span>
                      </div>
                      {interaction.notes && (
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {interaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No interactions logged yet</p>
            </div>
          )}
        </div>

        {/* Load History */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Load History</h2>
          
          {broker.loads && broker.loads.length > 0 ? (
            <div className="space-y-3">
              {broker.loads.map((load, index) => {
                const firstPickup = load.stops?.find((s) => s.type === "pickup");
                const lastDelivery = [...(load.stops || [])].reverse().find((s) => s.type === "delivery");
                
                return (
                  <div
                    key={index}
                    onClick={() => router.push(`/load/${index}`)}
                    className="bg-white/[0.02] rounded-lg p-4 border border-white/10 hover:border-orange-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-semibold">{load.load_id}</h4>
                          {firstPickup?.date && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{firstPickup.date}</span>
                            </div>
                          )}
                        </div>
                        {firstPickup && lastDelivery && (
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>
                              {firstPickup.city}, {firstPickup.state} → {lastDelivery.city}, {lastDelivery.state}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          {formatCurrency(load.rate_total)}
                        </p>
                        {load.miles && (
                          <p className="text-xs text-gray-400">{load.miles}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No loads found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInteractionForm && (
        <InteractionForm
          brokerId={broker.id}
          onClose={() => setShowInteractionForm(false)}
          onSuccess={fetchBroker}
        />
      )}

      {showTaskForm && (
        <TaskForm
          brokerId={broker.id}
          brokerName={broker.broker_name}
          onClose={() => setShowTaskForm(false)}
          onSuccess={fetchBroker}
        />
      )}
    </div>
  );
}

