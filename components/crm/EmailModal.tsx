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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
            <p className="text-sm text-gray-600 mt-1">To: {recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-white">
          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="email"
                value={recipientEmail}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-[400px] px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50/50">
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2 shadow-md"
          >
            <Send className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
            <span>{sending ? "Sending..." : "Send Email"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-200 shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

