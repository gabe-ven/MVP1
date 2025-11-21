export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadLoads } from "@/lib/storage";
import { syncBrokersFromLoads } from "@/lib/crm-storage";

/**
 * GET /api/loads
 * Returns all stored loads for the authenticated user (or default data if not authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    // Load user-specific data if authenticated, otherwise load default data
    const loads = await loadLoads(userEmail || undefined);
    
    // Auto-sync brokers from loads in the background (don't wait for it)
    if (userEmail && loads.length > 0) {
      syncBrokersFromLoads(loads, userEmail).catch((error) => {
        console.error("Background broker sync failed:", error);
      });
    }
    
    return NextResponse.json({ 
      loads,
      userEmail: userEmail || null,
    });
  } catch (error: any) {
    console.error("Error loading loads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load loads" },
      { status: 500 }
    );
  }
}

