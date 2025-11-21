"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { RefreshCw, LogOut, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";

interface AccountMenuProps {
  onSyncComplete?: () => void;
}

export default function AccountMenu({ onSyncComplete }: AccountMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [newLoadsCount, setNewLoadsCount] = useState(0);
  const [syncStats, setSyncStats] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.error) {
          throw new Error(data.error);
        }
        throw new Error(data.error || "Failed to sync Gmail");
      }

      setLastSync(new Date());
      setSyncStats(data.stats);
      setNewLoadsCount((data.stats.extracted || 0) + (data.stats.refreshed || 0));
      
      if (data.warning === "QUOTA_EXCEEDED" && data.message) {
        setSyncError(data.message);
        setTimeout(() => setSyncError(null), 15000);
      } else if (data.message) {
        setSyncMessage(data.message);
        setTimeout(() => setSyncMessage(null), 10000);
      }
      
      if (onSyncComplete) {
        onSyncComplete();
      }

      if ((data.stats.extracted || 0) + (data.stats.refreshed || 0) > 0) {
        setTimeout(() => {
          setNewLoadsCount(0);
          setSyncStats(null);
        }, 8000);
      }
    } catch (error: any) {
      setSyncError(error.message);
      setTimeout(() => setSyncError(null), 10000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!session) {
    return null;
  }

  const userName = session.user?.name || session.user?.email || "";
  const userEmail = session.user?.email || "";
  const userImage = session.user?.image || null;
  const displayName = userName.length > 20 ? userName.substring(0, 17) + "..." : userName;

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/50 hover:bg-gray-50 rounded-lg transition-all border border-gray-200 shadow-sm"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-900 leading-tight">
              {displayName}
            </p>
            {newLoadsCount > 0 && (
              <p className="text-xs text-emerald-600 font-medium">
                +{newLoadsCount} new
              </p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {userEmail}
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                      <span className="text-xs text-blue-600">Syncing...</span>
                    </>
                  ) : lastSync ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs text-gray-600">
                        Synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Not synced yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Stats */}
          {newLoadsCount > 0 && (
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">
                  +{newLoadsCount} new loads added
                </p>
              </div>
            </div>
          )}

          {syncStats && !newLoadsCount && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
              <p className="text-xs text-blue-700">
                {syncStats.pdfsProcessed || 0} processed, {syncStats.skipped || 0} skipped
              </p>
            </div>
          )}

          {/* Error/Warning Message */}
          {syncError && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{syncError}</p>
              </div>
            </div>
          )}

          {/* Info Message */}
          {syncMessage && !syncError && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">{syncMessage}</p>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="flex-1 text-left font-medium">
                {isSyncing ? "Syncing..." : "Sync Gmail"}
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-left font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

