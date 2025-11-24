"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Send, 
  Mic, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  Package,
  DollarSign
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // DEVELOPMENT MODE
  const DEV_MODE = false;

  // Check if voice mode requested
  const voiceMode = searchParams?.get("mode") === "voice";

  // Redirect unauthenticated users
  useEffect(() => {
    if (!DEV_MODE && status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm Noctem, your AI dispatch assistant. I can help you with:\n\n• Analyzing loads and finding the best opportunities\n• Understanding broker performance and reliability\n• Optimizing routes and lanes\n• Answering questions about your freight data\n• Finding patterns and trends in your operations\n\nWhat would you like to know?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const suggestedPrompts = [
    {
      icon: TrendingUp,
      text: "Which lanes are most profitable this week?",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: AlertCircle,
      text: "Show me risky loads from today",
      gradient: "from-red-500 to-orange-600",
    },
    {
      icon: DollarSign,
      text: "Which brokers are paying the slowest?",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: Package,
      text: "Find more freight on my Fresno → Dallas lane",
      gradient: "from-blue-500 to-cyan-600",
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("profitable") || lowerQuery.includes("lane")) {
      return "Based on your data, here are your top 3 most profitable lanes this week:\n\n1. **Los Angeles, CA → Phoenix, AZ**\n   - Avg RPM: $2.94/mi\n   - Loads: 5\n   - Total Revenue: $12,500\n\n2. **Dallas, TX → Atlanta, GA**\n   - Avg RPM: $2.91/mi\n   - Loads: 3\n   - Total Revenue: $9,600\n\n3. **Chicago, IL → Memphis, TN**\n   - Avg RPM: $3.00/mi\n   - Loads: 2\n   - Total Revenue: $3,600\n\nThe LA → Phoenix lane has the best volume and consistency. Would you like me to find more opportunities on this route?";
    }
    
    if (lowerQuery.includes("risky") || lowerQuery.includes("risk")) {
      return "I found 2 loads today that need attention:\n\n⚠️ **LOAD-12347** - Coyote Logistics\n- Lane: Chicago → Memphis\n- Risk: Possible HOS violation (600mi in 12hrs)\n- Rate: $1,800 ($3.00/mi)\n\n⚠️ **LOAD-12350** - Unknown Broker\n- Lane: Miami → New York  \n- Risk: Double broker pattern detected\n- Rate: Suspiciously high at $5.50/mi\n\nI recommend declining LOAD-12350 and negotiating extended pickup time for LOAD-12347.";
    }
    
    if (lowerQuery.includes("broker") && lowerQuery.includes("slow")) {
      return "Here are your brokers with the slowest payment times:\n\n1. **Coyote Logistics**\n   - Avg Payment: 45 days\n   - Status: ⚠️ Watch\n   - Recommendation: Request quick pay\n\n2. **Landstar**\n   - Avg Payment: 38 days\n   - Status: ⚠️ Watch\n   - Recommendation: Factor these loads\n\n3. **TQL**\n   - Avg Payment: 30 days (Net 30)\n   - Status: ✅ Normal\n   - Recommendation: Continue as is\n\nWould you like me to draft an email to request quick pay terms?";
    }
    
    if (lowerQuery.includes("fresno") || lowerQuery.includes("dallas")) {
      return "I analyzed the Fresno → Dallas lane for you:\n\n📊 **Current Performance**\n- Your avg rate: $2.65/mi (~1,550 miles)\n- Market avg: $2.45/mi\n- You're getting 8% above market ✅\n\n🎯 **Finding More Freight**\n\nI found 3 brokers posting this lane regularly:\n1. CH Robinson - posts 2-3x/week\n2. TQL - posts 1-2x/week  \n3. Coyote - posts 1x/week\n\nRecommendation: Contact CH Robinson and mention your reliability on this lane. Your on-time delivery rate is 100%, which they value highly.\n\nWould you like me to draft an introduction email?";
    }
    
    return "I understand your question. Let me analyze your data and provide insights. Based on what I see, I recommend focusing on your high-performing lanes and maintaining good relationships with reliable brokers.\n\nIs there something specific you'd like me to dive deeper into?";
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!DEV_MODE && status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Noctem AI Dispatcher</h1>
                  <p className="text-sm text-neutral-600">Ask anything about your loads, lanes, and brokers</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => alert("Voice mode coming soon!")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                voiceMode
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice Mode</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-card"
                    : "bg-white border border-neutral-100 shadow-card"
                } rounded-2xl px-6 py-4`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Noctem AI</span>
                  </div>
                )}
                <div className={`prose prose-sm ${message.role === "user" ? "prose-invert" : ""} max-w-none`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-100 rounded-2xl px-6 py-4 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-sm text-neutral-600">Noctem is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (show only when no user messages yet) */}
        {messages.filter(m => m.role === "user").length === 0 && (
          <div className="px-8 py-4">
            <p className="text-sm font-medium text-gray-600 mb-3">Suggested questions:</p>
            <div className="grid grid-cols-2 gap-3">
              {suggestedPrompts.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="flex items-center gap-3 p-4 bg-white border border-neutral-100 rounded-xl hover:shadow-card transition-all duration-200 text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${prompt.gradient} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-neutral-200 shadow-sm px-8 py-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a custom question..."
                rows={1}
                className="w-full px-4 py-3 border-[1.5px] border-neutral-200 rounded-xl focus:ring-3 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 btn-gradient-primary text-white rounded-xl hover:shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Right Sidebar - Context Panel (Optional) */}
      <div className="hidden xl:block w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Today's KPIs</h3>
        
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Active Loads</span>
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-green-600 mt-1">+3 this week</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Weekly Revenue</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">$28,450</p>
            <p className="text-xs text-blue-600 mt-1">+12.5% vs last week</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Avg RPM</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">$2.34</p>
            <p className="text-xs text-purple-600 mt-1">Above target</p>
          </div>
        </div>

        {/* Recent Context */}
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">New load offer from TQL</p>
              <p className="text-gray-500 mt-1">2 minutes ago</p>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">LOAD-12345 delivered</p>
              <p className="text-gray-500 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

