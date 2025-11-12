"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Mail, LogOut, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function GmailAuth() {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStats(null);

    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync Gmail");
      }

      setSyncStats(data.stats);
      
      // Trigger page reload to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="glass-effect rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/5">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Auto-Import from Gmail
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Sign in with Google to automatically scan your Gmail for rate confirmations from the last 30 days
            </p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all font-medium shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {session.user?.email}
              </p>
              <p className="text-xs text-gray-500">Connected to Gmail</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 transition-all border border-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning Gmail...</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Sync from Gmail (Last 30 Days)</span>
            </>
          )}
        </button>

        {syncError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{syncError}</p>
            </div>
          </div>
        )}

        {syncStats && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-green-400">
                  Gmail sync completed!
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="text-gray-500">Emails scanned:</span>{" "}
                    <span className="font-medium text-white">
                      {syncStats.emailsScanned}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">PDFs found:</span>{" "}
                    <span className="font-medium text-white">
                      {syncStats.pdfsFound}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Loads added:</span>{" "}
                    <span className="font-medium text-green-400">
                      {syncStats.extracted}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Loads refreshed:</span>{" "}
                    <span className="font-medium text-blue-400">
                      {syncStats.refreshed || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duplicates detected:</span>{" "}
                    <span className="font-medium text-gray-400">
                      {syncStats.duplicates}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Failed:</span>{" "}
                    <span className="font-medium text-red-400">
                      {syncStats.failed || 0}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Refreshing page...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

