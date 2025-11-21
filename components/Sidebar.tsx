"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  TruckIcon, 
  LayoutDashboard, 
  Building2, 
  Package, 
  MessageSquare,
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed

  const primaryNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contracts", href: "/contracts", icon: FileText },
    { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
    { name: "CRM", href: "/crm", icon: Building2 },
    { name: "Loads", href: "/loads", icon: Package },
  ];

  const generalNav = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-70'} bg-white border-r border-neutral-200 flex flex-col z-50 transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-center">
        <button
          onClick={() => router.push("/")}
          className="hover:opacity-80 transition-opacity"
        >
          <div className="bg-neutral-900 p-3 rounded-xl">
            <TruckIcon className="w-6 h-6 text-white" />
          </div>
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-white border border-neutral-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-neutral-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-neutral-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Primary Section */}
        <div>
          {!isCollapsed && (
            <p className="px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-3 opacity-50">
              Primary
            </p>
          )}
          <div className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* General Section */}
        <div>
          {!isCollapsed && (
            <p className="px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-3 opacity-50">
              General
            </p>
          )}
          <div className="space-y-1">
            {generalNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
            
            {/* Logout */}
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200`}
                title={isCollapsed ? 'Logout' : ''}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Footer - User Info */}
      {session && !isCollapsed && (
        <div className="p-4 border-t border-neutral-100 bg-neutral-50">
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-10 h-10 rounded-full ring-2 ring-neutral-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Collapsed User Avatar */}
      {session && isCollapsed && (
        <div className="p-3 border-t border-neutral-100">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-10 h-10 rounded-full ring-2 ring-neutral-200 mx-auto"
            />
          )}
        </div>
      )}
    </aside>
  );
}

