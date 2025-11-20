import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clearLoads } from "@/lib/storage";

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/clear
 * Clears all stored loads for the authenticated user (or default data if not authenticated)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    await clearLoads(userEmail || undefined);
    return NextResponse.json({ success: true, message: "All loads cleared" });
  } catch (error: any) {
    console.error("Error clearing loads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear loads" },
      { status: 500 }
    );
  }
}

