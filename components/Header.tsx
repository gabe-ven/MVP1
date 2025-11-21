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
    <header className="border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
      <div className="custom-screen py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Left */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Load Insights
              </h1>
              <p className="text-xs text-gray-500">
                AI-Powered Rate Analysis
              </p>
            </div>
          </button>

          {/* Navigation Links - Center (only show on landing page) */}
          {isLandingPage && (
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a
                href="#features"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#faq"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
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
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/crm")}
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/crm")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
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
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 hover:shadow-lg transition-all"
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

