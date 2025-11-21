export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBrokers } from "@/lib/crm-storage";

/**
 * GET /api/crm/brokers
 * Returns all brokers for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "active" | "inactive" | "prospect" | null;
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") as "name" | "revenue" | "loads" | "lastContact" | null;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

    const filters = {
      status: status || undefined,
      search,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    };

    const brokers = await getBrokers(userEmail, filters);

    return NextResponse.json({ brokers });
  } catch (error: any) {
    console.error("Error fetching brokers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch brokers" },
      { status: 500 }
    );
  }
}

