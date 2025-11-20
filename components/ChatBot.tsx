"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, X, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className = "" }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Load Insights assistant. I can help you analyze your freight data, answer questions about your loads, brokers, routes, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare conversation history (exclude system message)
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
        // Handle specific error codes
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating button (when closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all hover:scale-110 ${className}`}
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  // Chat window (when open)
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Load Insights AI</h3>
            <p className="text-xs text-gray-400">Ask me anything about your loads</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-orange-500 to-amber-500"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`flex-1 rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500/20 text-white border border-blue-500/30"
                  : "bg-white/5 text-gray-200 border border-white/10"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 rounded-lg p-3 bg-white/5 border border-white/10">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your loads, brokers, routes..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2.5 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}

