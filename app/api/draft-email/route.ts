import { NextRequest, NextResponse } from "next/server";
import { loadLoads } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || undefined;
    const loads = await loadLoads(userEmail);

    if (loads.length === 0) {
      return NextResponse.json({
        error: "No loads found. Upload some rate confirmations first.",
      }, { status: 404 });
    }

    // Find most common broker
    const brokerCount = new Map<string, { count: number; email: string; phone: string }>();
    
    loads.forEach((load) => {
      const broker = load.broker_name || "Unknown";
      const existing = brokerCount.get(broker) || { count: 0, email: "", phone: "" };
      brokerCount.set(broker, {
        count: existing.count + 1,
        email: load.broker_email || existing.email,
        phone: load.broker_phone || existing.phone,
      });
    });

    // Get the most common broker
    let mostCommonBroker = { name: "", count: 0, email: "", phone: "" };
    Array.from(brokerCount.entries()).forEach(([name, data]) => {
      if (data.count > mostCommonBroker.count) {
        mostCommonBroker = { name, ...data };
      }
    });

    if (!mostCommonBroker.name || mostCommonBroker.name === "Unknown") {
      return NextResponse.json({
        error: "No valid broker information found in your loads.",
      }, { status: 404 });
    }

    // Get loads from this broker for context
    const brokerLoads = loads.filter((load) => load.broker_name === mostCommonBroker.name);

    // Calculate average metrics for this broker
    const totalRevenue = brokerLoads.reduce((sum, load) => sum + (load.rate_total || 0), 0);
    const avgRate = totalRevenue / brokerLoads.length;
    
    const loadsWithMiles = brokerLoads.filter((load) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      return miles > 0;
    });
    
    let avgRPM = 0;
    if (loadsWithMiles.length > 0) {
      const totalRPM = loadsWithMiles.reduce((sum, load) => {
        const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
        return sum + load.rate_total / miles;
      }, 0);
      avgRPM = totalRPM / loadsWithMiles.length;
    }

    // Get common routes
    const routeCounts = new Map<string, number>();
    brokerLoads.forEach((load) => {
      const pickups = load.stops?.filter((s) => s.type === "pickup") || [];
      const deliveries = load.stops?.filter((s) => s.type === "delivery") || [];
      
      if (pickups.length > 0 && deliveries.length > 0) {
        const route = `${pickups[0].city}, ${pickups[0].state} → ${deliveries[deliveries.length - 1].city}, ${deliveries[deliveries.length - 1].state}`;
        routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
      }
    });

    const topRoutes = Array.from(routeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([route]) => route);

    // Get common equipment types
    const equipmentCounts = new Map<string, number>();
    brokerLoads.forEach((load) => {
      if (load.equipment_type) {
        equipmentCounts.set(load.equipment_type, (equipmentCounts.get(load.equipment_type) || 0) + 1);
      }
    });

    const topEquipment = Array.from(equipmentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([equipment]) => equipment);

    // Generate email using OpenAI
    const prompt = `You are a professional freight carrier writing an email to request more loads from a broker you've worked with successfully.

Broker Information:
- Broker Company: ${mostCommonBroker.name}
- Number of loads completed: ${mostCommonBroker.count}
- Average rate: $${avgRate.toFixed(2)}
- Average RPM: $${avgRPM.toFixed(2)}/mile

Common routes you've run for them:
${topRoutes.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Equipment you typically use:
${topEquipment.join(', ')}

Write a professional, friendly email that:
1. Thanks them for the past business (mention the ${mostCommonBroker.count} loads)
2. Expresses interest in running more loads for them
3. Mentions the specific routes you've successfully completed
4. Mentions your equipment capabilities
5. Asks if they have any available loads on similar routes
6. Keeps it concise and professional (3-4 paragraphs max)
7. Sign off with "Best regards," (no name, just the closing)

Do not include a subject line. Start directly with the greeting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional freight carrier writing business emails to brokers. Be professional, friendly, and concise.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const draftEmail = response.choices[0].message.content || "";

    return NextResponse.json({
      broker: {
        name: mostCommonBroker.name,
        email: mostCommonBroker.email,
        phone: mostCommonBroker.phone,
        loadCount: mostCommonBroker.count,
        avgRate: avgRate.toFixed(2),
        avgRPM: avgRPM.toFixed(2),
        topRoutes,
        topEquipment,
      },
      draftEmail,
    });

  } catch (error: any) {
    console.error("Error drafting email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to draft email" },
      { status: 500 }
    );
  }
}

