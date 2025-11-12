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
  const [newLoadsCount, setNewLoadsCount] = useState(0);

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

    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync Gmail");
      }

      setLastSync(new Date());
      setNewLoadsCount((data.stats.extracted || 0) + (data.stats.refreshed || 0));
      
      if (onSyncComplete) {
        onSyncComplete();
      }

      // Clear new loads count after 5 seconds
      if ((data.stats.extracted || 0) + (data.stats.refreshed || 0) > 0) {
        setTimeout(() => setNewLoadsCount(0), 5000);
      }
    } catch (error: any) {
      setSyncError(error.message);
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
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
  );
}

