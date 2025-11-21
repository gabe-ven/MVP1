export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadLoads } from "@/lib/storage";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/crm/debug
 * Debug endpoint to check CRM setup
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "default";

    // Check Supabase connection
    let supabaseConnected = false;
    let brokersTableExists = false;
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseConnected = true;
      
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Try to query the brokers table
        const { error } = await supabase
          .from("brokers")
          .select("id")
          .limit(1);
        
        brokersTableExists = !error;
        
        if (error) {
          console.error("Brokers table error:", error);
        }
      } catch (e) {
        console.error("Supabase query error:", e);
      }
    }

    // Get loads and check broker data
    const loads = await loadLoads(userEmail);
    const loadsWithBrokerEmail = loads.filter(load => load.broker_email);
    const uniqueBrokers = new Set(
      loadsWithBrokerEmail.map(load => load.broker_email?.toLowerCase())
    );

    return NextResponse.json({
      setup: {
        supabaseConfigured: supabaseConnected,
        brokersTableExists,
      },
      user: {
        email: userEmail,
        authenticated: !!session,
      },
      loads: {
        total: loads.length,
        withBrokerEmail: loadsWithBrokerEmail.length,
        withoutBrokerEmail: loads.length - loadsWithBrokerEmail.length,
        uniqueBrokers: uniqueBrokers.size,
      },
      sampleBrokers: Array.from(uniqueBrokers).slice(0, 5),
      recommendations: [
        !supabaseConnected && "❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
        !brokersTableExists && "❌ Brokers table not found. Run supabase-crm-schema.sql in your Supabase database",
        loads.length === 0 && "⚠️ No loads found. Sync Gmail or add loads first",
        loadsWithBrokerEmail.length === 0 && loads.length > 0 && "⚠️ Loads exist but none have broker_email populated",
        supabaseConnected && brokersTableExists && loadsWithBrokerEmail.length > 0 && "✅ Setup looks good! Click 'Sync' button to create brokers",
      ].filter(Boolean),
    });

  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run diagnostics" },
      { status: 500 }
    );
  }
}

