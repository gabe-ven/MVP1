"use client";

import { useState } from "react";
import { Send, Sparkles, MessageSquare, TrendingUp, BarChart3, HelpCircle, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const presetPrompts = [
    {
      id: "revenue",
      title: "Revenue Analysis",
      description: "Analyze my revenue trends and provide insights on my most profitable loads.",
      prompt: "Analyze my revenue trends and provide insights on my most profitable loads.",
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "brokers",
      title: "Top Brokers",
      description: "Who are my top performing brokers and what are their key metrics?",
      prompt: "Who are my top performing brokers and what are their key metrics?",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "rpm",
      title: "RPM Insights",
      description: "What are my RPM trends and which routes have the best rates per mile?",
      prompt: "What are my RPM trends and which routes have the best rates per mile?",
      icon: TrendingUp,
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "help",
      title: "General Help",
      description: "Help me understand how to use Load Insights effectively.",
      prompt: "Help me understand how to use Load Insights effectively.",
      icon: HelpCircle,
      gradient: "from-orange-500 to-amber-600",
    },
  ];

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setInput("");
    setActivePrompt(null);
    
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 || data.code === "quota_exceeded") {
          throw new Error("OpenAI quota exceeded. Please add credits to your OpenAI account to continue.");
        }
        if (response.status === 401 || data.code === "invalid_api_key") {
          throw new Error("OpenAI API key is invalid. Please check your configuration.");
        }
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}. Please check the browser console for more details.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (prompt: string, id: string) => {
    setActivePrompt(id);
    sendMessage(prompt);
  };

  const handleCustomSend = () => {
    if (input.trim()) {
      sendMessage(input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCustomSend();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Assistant</h3>
          <p className="text-sm text-gray-600">Ask me anything about your freight data</p>
        </div>
      </div>

      {/* Messages Display - Hidden by default, shown when messages exist */}
      {messages.length > 0 && (
        <div className="space-y-4 max-h-[400px] overflow-y-auto border-t border-gray-200 pt-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Prompt Buttons - Horizontal Stack */}
      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
        {presetPrompts.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePrompt === preset.id && isLoading;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.prompt, preset.id)}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${preset.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-white" />
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                {preset.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Input Field */}
      <div className="flex items-center space-x-3 border-t border-gray-200 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a custom question..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleCustomSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

