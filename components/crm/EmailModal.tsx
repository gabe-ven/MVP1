"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface EmailModalProps {
  recipientEmail: string;
  recipientName: string;
  onClose: () => void;
}

export default function EmailModal({ recipientEmail, recipientName, onClose }: EmailModalProps) {
  const [subject, setSubject] = useState("Load Inquiry");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    
    // Here you would typically call an API to send the email
    // For now, we'll simulate sending and open Gmail as fallback
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, open Gmail with the composed message
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(message);
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodedSubject}&body=${encodedBody}`,
        "_blank"
      );
      
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0f] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Send Email</h2>
            <p className="text-sm text-gray-400 mt-1">To: {recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To
              </label>
              <input
                type="email"
                value={recipientEmail}
                disabled
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-[400px] px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-3 p-6 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            <Send className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
            <span>{sending ? "Sending..." : "Send Email"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

