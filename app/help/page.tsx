"use client";

import { useState } from "react";
import { 
  Book, 
  MessageCircle, 
  Video, 
  FileText,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      title: "Getting Started",
      icon: Book,
      articles: [
        "Setting up your account",
        "Connecting Gmail",
        "Understanding the dashboard",
        "Your first load",
      ],
    },
    {
      title: "Load Management",
      icon: FileText,
      articles: [
        "Finding loads",
        "Accepting and declining loads",
        "Tracking deliveries",
        "Managing deadhead miles",
      ],
    },
    {
      title: "CRM & Brokers",
      icon: MessageCircle,
      articles: [
        "Adding brokers",
        "Rating brokers",
        "Communication history",
        "Payment tracking",
      ],
    },
    {
      title: "AI Assistant",
      icon: HelpCircle,
      articles: [
        "How to use Noctem AI",
        "Voice commands",
        "Custom queries",
        "Understanding insights",
      ],
    },
  ];

  const quickActions = [
    {
      title: "Watch Tutorial Videos",
      desc: "Learn how to use Noctem with video guides",
      icon: Video,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Contact Support",
      desc: "Get help from our support team",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Documentation",
      desc: "Read detailed guides and API docs",
      icon: Book,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">How can we help you?</h1>
          <p className="text-gray-600">Search for answers or browse help topics below</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-left group"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-xl mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{action.desc}</p>
                <span className="text-sm font-medium text-blue-600 flex items-center">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Help Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIdx) => (
                      <li key={articleIdx}>
                        <a
                          href="#"
                          className="text-sm text-gray-600 hover:text-blue-600 flex items-center space-x-2 py-2 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                          <span>{article}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-center text-white shadow-xl shadow-primary/20">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2 tracking-tight">Still need help?</h3>
          <p className="text-blue-100 mb-6">Our support team is available 24/7</p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
              Chat with us
            </button>
            <button className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-all duration-200">
              Email support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

