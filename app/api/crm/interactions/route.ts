export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addInteraction } from "@/lib/crm-storage";

/**
 * POST /api/crm/interactions
 * Create a new interaction log
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

    const body = await request.json();
    const { broker_id, interaction_type, subject, notes, interaction_date } = body;

    if (!broker_id || !interaction_type) {
      return NextResponse.json(
        { error: "broker_id and interaction_type are required" },
        { status: 400 }
      );
    }

    const interaction = await addInteraction(
      broker_id,
      {
        interaction_type,
        subject,
        notes,
        interaction_date: interaction_date || new Date().toISOString(),
      },
      userEmail
    );

    if (!interaction) {
      return NextResponse.json(
        { error: "Failed to create interaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ interaction });
  } catch (error: any) {
    console.error("Error creating interaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create interaction" },
      { status: 500 }
    );
  }
}

