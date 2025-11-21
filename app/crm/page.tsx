"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  Search,
  Filter
} from "lucide-react";

interface Broker {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  rating: number;
  totalLoads: number;
  totalRevenue: number;
  avgPaymentDays: number;
  lastContact: string;
  status: "active" | "watch" | "blocked";
}

const MOCK_BROKERS: Broker[] = [
  {
    id: "1",
    name: "TQL (Total Quality Logistics)",
    contact: "Sarah Johnson",
    email: "sarah.j@tql.com",
    phone: "+1 (513) 831-2600",
    city: "Cincinnati",
    state: "OH",
    rating: 4.5,
    totalLoads: 45,
    totalRevenue: 125000,
    avgPaymentDays: 30,
    lastContact: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "CH Robinson",
    contact: "Michael Chen",
    email: "m.chen@chrobinson.com",
    phone: "+1 (952) 937-8500",
    city: "Eden Prairie",
    state: "MN",
    rating: 4.8,
    totalLoads: 67,
    totalRevenue: 198000,
    avgPaymentDays: 28,
    lastContact: "1 day ago",
    status: "active",
  },
  {
    id: "3",
    name: "Coyote Logistics",
    contact: "Emma Davis",
    email: "emma.d@coyote.com",
    phone: "+1 (877) 658-4898",
    city: "Chicago",
    state: "IL",
    rating: 3.8,
    totalLoads: 23,
    totalRevenue: 67500,
    avgPaymentDays: 45,
    lastContact: "3 days ago",
    status: "watch",
  },
  {
    id: "4",
    name: "Landstar",
    contact: "Robert Williams",
    email: "r.williams@landstar.com",
    phone: "+1 (904) 398-9400",
    city: "Jacksonville",
    state: "FL",
    rating: 4.2,
    totalLoads: 34,
    totalRevenue: 92000,
    avgPaymentDays: 38,
    lastContact: "5 days ago",
    status: "active",
  },
  {
    id: "5",
    name: "XPO Logistics",
    contact: "Jennifer Martinez",
    email: "j.martinez@xpo.com",
    phone: "+1 (855) 976-6951",
    city: "Greenwich",
    state: "CT",
    rating: 4.0,
    totalLoads: 28,
    totalRevenue: 78000,
    avgPaymentDays: 32,
    lastContact: "1 week ago",
    status: "active",
  },
];

export default function CRMPage() {
  const { data: session } = useSession();
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const DEV_MODE = true;

  const filteredBrokers = MOCK_BROKERS.filter((broker) =>
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title text-gray-900">Broker CRM</h1>
            <p className="text-base text-neutral-600 mt-2">Manage your broker relationships and performance</p>
          </div>
          <button className="flex items-center gap-2 btn-gradient-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
            <Plus className="w-5 h-5" />
            <span>Add Broker</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="relative bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-6 shadow-card border-l-4 border-primary hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-sm text-neutral-600 mt-1">Active Brokers</p>
          </div>

          <div className="relative bg-gradient-to-br from-success/5 to-white rounded-xl p-6 shadow-card border-l-4 border-success hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-success/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">$560K</p>
            <p className="text-sm text-neutral-600 mt-1">Total Revenue</p>
          </div>

          <div className="relative bg-gradient-to-br from-purple-50/50 to-white rounded-xl p-6 shadow-card border-l-4 border-purple-500 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">4.3</p>
            <p className="text-sm text-neutral-600 mt-1">Avg Rating</p>
          </div>

          <div className="relative bg-gradient-to-br from-warning/5 to-white rounded-xl p-6 shadow-card border-l-4 border-warning hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-warning/10 rounded-xl">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">35 days</p>
            <p className="text-sm text-neutral-600 mt-1">Avg Payment</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search brokers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-[1.5px] border-neutral-200 rounded-xl focus:ring-3 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border-[1.5px] border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all duration-200">
              <Filter className="w-5 h-5 text-neutral-600" />
              <span className="font-medium text-neutral-700">Filters</span>
            </button>
          </div>
        </div>

        {/* Brokers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBrokers.map((broker) => (
            <div
              key={broker.id}
              onClick={() => setSelectedBroker(broker)}
              className="bg-white rounded-xl p-6 shadow-card border border-neutral-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              {/* Broker Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                    {broker.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors tracking-tight">
                      {broker.name}
                    </h3>
                    <p className="text-sm text-neutral-600">{broker.contact}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(broker.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{broker.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{broker.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>{broker.city}, {broker.state}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-[11px] uppercase text-neutral-400 font-medium tracking-wide mb-1">Loads</p>
                  <p className="text-xl font-semibold text-gray-900">{broker.totalLoads}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-neutral-400 font-medium tracking-wide mb-1">Revenue</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${(broker.totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-neutral-400 font-medium tracking-wide mb-1">Payment</p>
                  <p className="text-xl font-semibold text-gray-900">{broker.avgPaymentDays}d</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                    broker.status === "active"
                      ? "bg-success/10 text-success"
                      : broker.status === "watch"
                      ? "bg-warning/10 text-warning"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                </span>
                <span className="text-xs text-neutral-500">Last contact: {broker.lastContact}</span>
              </div>
            </div>
          ))}
          </div>

        {/* Empty State */}
        {filteredBrokers.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No brokers found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or add a new broker</p>
            <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30">
              <Plus className="w-5 h-5" />
              <span>Add Your First Broker</span>
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
