"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { TruckIcon } from "lucide-react";
import GmailStatus from "./GmailStatus";

interface HeaderProps {
  onSyncComplete?: () => void;
}

export default function Header({ onSyncComplete }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="border-b border-gray-800/30 sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/90">
      <div className="custom-screen py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Left */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/50">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Load Insights
              </h1>
              <p className="text-xs text-gray-400">
                AI-Powered Rate Analysis
              </p>
            </div>
          </button>

          {/* Navigation Links - Center (only show on landing page) */}
          {isLandingPage && (
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a
                href="#features"
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#faq"
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors"
              >
                FAQ
              </a>
            </nav>
          )}

          {/* Dashboard Navigation (show when authenticated and not on landing) */}
          {session && !isLandingPage && (
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => router.push("/dashboard")}
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-orange-400"
                    : "text-gray-300 hover:text-orange-400"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/crm")}
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/crm")
                    ? "text-orange-400"
                    : "text-gray-300 hover:text-orange-400"
                }`}
              >
                CRM
              </button>
            </nav>
          )}
          
          {/* Right Side - Gmail Status or Sign In */}
          <div className="flex items-center gap-3">
            {session ? (
              <GmailStatus onSyncComplete={onSyncComplete} />
            ) : (
              <button
                onClick={() => signIn("google")}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all ${
                  isLandingPage
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/50' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/50'
                }`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

