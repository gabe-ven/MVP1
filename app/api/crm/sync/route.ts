export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncBrokersFromLoads } from "@/lib/crm-storage";
import { loadLoads } from "@/lib/storage";

/**
 * POST /api/crm/sync
 * Sync brokers from load data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all loads
    const loads = await loadLoads(userEmail);

    // Sync brokers
    const result = await syncBrokersFromLoads(loads, userEmail);

    return NextResponse.json({
      success: true,
      synced: result.synced,
      updated: result.updated,
    });
  } catch (error: any) {
    console.error("Error syncing brokers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync brokers" },
      { status: 500 }
    );
  }
}

