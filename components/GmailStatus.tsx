"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Mail, RefreshCw, CheckCircle, LogOut, AlertCircle } from "lucide-react";

interface GmailStatusProps {
  onSyncComplete?: () => void;
}

export default function GmailStatus({ onSyncComplete }: GmailStatusProps) {
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [newLoadsCount, setNewLoadsCount] = useState(0);
  const [syncStats, setSyncStats] = useState<any>(null);

  // Check for token refresh errors
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      setSyncError("Your session has expired. Please sign out and sign in again.");
    }
  }, [session]);

  // DISABLED: Auto-sync on mount if signed in
  // useEffect(() => {
  //   if (session) {
  //     handleSync(true); // Initial sync, silent
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [session]);

  // DISABLED: Auto-sync every 5 minutes
  // useEffect(() => {
  //   if (!session) return;

  //   const interval = setInterval(() => {
  //     handleSync(true); // Background sync, silent
  //   }, 5 * 60 * 1000); // 5 minutes

  //   return () => clearInterval(interval);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [session]);

  const handleSync = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    setSyncError(null);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a quota error
        if (response.status === 429 && data.error) {
          throw new Error(data.error);
        }
        throw new Error(data.error || "Failed to sync Gmail");
      }

      setLastSync(new Date());
      setSyncStats(data.stats);
      setNewLoadsCount((data.stats.extracted || 0) + (data.stats.refreshed || 0));
      
      // Show warning if quota exceeded but some loads were processed
      if (data.warning === "QUOTA_EXCEEDED" && data.message) {
        setSyncError(data.message);
        setTimeout(() => setSyncError(null), 15000); // Show for 15 seconds
      } else if (data.message) {
        // Show info message (e.g., PDF limit reached, already processed, etc.)
        setSyncMessage(data.message);
        setTimeout(() => setSyncMessage(null), 10000); // Show for 10 seconds
      }
      
      if (onSyncComplete) {
        onSyncComplete();
      }

      // Clear new loads count and stats after 8 seconds
      if ((data.stats.extracted || 0) + (data.stats.refreshed || 0) > 0) {
        setTimeout(() => {
          setNewLoadsCount(0);
          setSyncStats(null);
        }, 8000);
      }
    } catch (error: any) {
      setSyncError(error.message);
      setTimeout(() => setSyncError(null), 10000); // Show errors for 10 seconds
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* Sync Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{session.user?.email}</span>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            ) : lastSync ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : syncError ? (
              <AlertCircle className="w-3 h-3 text-red-400" />
            ) : null}
          </div>
        </div>

        {/* New Loads Badge */}
        {newLoadsCount > 0 && (
          <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-md border border-green-500/30 animate-pulse">
            +{newLoadsCount} new
          </div>
        )}

        {/* Sync Stats Badge */}
        {syncStats && !newLoadsCount && (
          <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-md border border-blue-500/30">
            {syncStats.pdfsProcessed || 0} processed, {syncStats.skipped || 0} skipped
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={() => handleSync(false)}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
          title="Sync now"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg hover:bg-white/10 transition-all border border-white/10"
          title="Sign out"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Error/Warning Toast */}
      {syncError && (
        <div className="absolute top-full mt-2 right-0 max-w-md p-3 bg-red-500/5 border border-red-500/20 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{syncError}</p>
          </div>
        </div>
      )}

      {/* Info Message Toast */}
      {syncMessage && !syncError && (
        <div className="absolute top-full mt-2 right-0 max-w-md p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">{syncMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

