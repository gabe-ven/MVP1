"use client";

import { useSession, signIn } from "next-auth/react";
import { Bell, RefreshCw } from "lucide-react";
import AccountMenu from "./AccountMenu";

interface HeaderProps {
  onSyncComplete?: () => void;
}

export default function Header({ onSyncComplete }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-18 border-b border-neutral-200 bg-white sticky top-0 z-40 shadow-sm">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Center - App Title */}
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            Noctem AI Dispatch OS
          </h2>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-neutral-50 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-neutral-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
          </button>

          {/* Sync Gmail Button */}
          {session && (
            <button
              onClick={() => onSyncComplete?.()}
              className="flex items-center gap-2 px-6 py-2.5 btn-gradient-primary text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Gmail</span>
            </button>
          )}

          {/* Account Menu */}
          {session ? (
            <AccountMenu onSyncComplete={onSyncComplete} />
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

