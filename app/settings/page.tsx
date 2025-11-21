"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Lock, 
  User, 
  Mail,
  Phone,
  Building,
  CreditCard,
  Globe,
  Palette,
  Save
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const DEV_MODE = true;

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Lock },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "preferences", name: "Preferences", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
              
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Information</h2>
                    <p className="text-sm text-gray-600">Update your personal details and company information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={session?.user?.name || "John Doe"}
                        className="w-full px-4 py-3 border-[1.5px] border-neutral-200 rounded-xl focus:ring-3 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={session?.user?.email || "john@example.com"}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        placeholder="Your Trucking Co."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="flex items-center gap-2 btn-gradient-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-600">Choose what updates you want to receive</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "New Load Offers", desc: "Get notified when new loads match your preferences" },
                      { title: "Payment Updates", desc: "Receive alerts about payment status changes" },
                      { title: "Broker Messages", desc: "Get notified when brokers send you messages" },
                      { title: "Weekly Reports", desc: "Receive weekly performance summaries" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h2>
                    <p className="text-sm text-gray-600">Manage your password and security preferences</p>
                  </div>

                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Two-Factor Authentication</p>
                        <p className="text-sm text-blue-700 mt-1">Add an extra layer of security to your account</p>
                        <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">Enable 2FA →</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Billing & Subscription</h2>
                    <p className="text-sm text-gray-600">Manage your subscription and payment methods</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Plan</p>
                        <p className="text-2xl font-bold text-gray-900">Pro Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Monthly</p>
                        <p className="text-2xl font-bold text-gray-900">$99/mo</p>
                      </div>
                    </div>
                    <button className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">App Preferences</h2>
                    <p className="text-sm text-gray-600">Customize your experience</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Light Mode</option>
                      <option>Dark Mode</option>
                      <option>Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

