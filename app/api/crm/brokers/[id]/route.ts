export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBrokerById, updateBroker } from "@/lib/crm-storage";
import { loadLoads } from "@/lib/storage";

/**
 * GET /api/crm/brokers/[id]
 * Get broker details with interactions, tasks, and loads
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const broker = await getBrokerById(params.id, userEmail);

    if (!broker) {
      return NextResponse.json(
        { error: "Broker not found" },
        { status: 404 }
      );
    }

    // Get loads for this broker
    const allLoads = await loadLoads(userEmail);
    const brokerLoads = allLoads.filter(
      (load) => load.broker_email?.toLowerCase() === broker.broker_email?.toLowerCase()
    );

    return NextResponse.json({
      broker: {
        ...broker,
        loads: brokerLoads,
      },
    });
  } catch (error: any) {
    console.error("Error fetching broker:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch broker" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/crm/brokers/[id]
 * Update broker information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates = await request.json();

    const success = await updateBroker(params.id, updates, userEmail);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update broker" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating broker:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update broker" },
      { status: 500 }
    );
  }
}

