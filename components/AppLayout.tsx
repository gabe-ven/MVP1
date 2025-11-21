"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show sidebar/header on public landing page
  const isPublicLandingPage = pathname === "/" && !pathname.includes("/ai-hub");
  
  if (isPublicLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - starts with collapsed sidebar width */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Top Bar */}
        <Header onSyncComplete={() => {}} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

