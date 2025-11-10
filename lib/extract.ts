import OpenAI from "openai";
import { extractionFunctionSchema, LoadData } from "./schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate distance between two addresses using Google Maps API
 * @param origin - Starting address
 * @param destination - Ending address
 * @returns Distance in miles, or null if calculation fails
 */
async function calculateDistance(origin: string, destination: string): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️  Google Maps API key not found. Cannot calculate miles.");
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceInMeters = route.legs[0].distance.value;
      const distanceInMiles = Math.round(distanceInMeters * 0.000621371); // Convert meters to miles
      console.log(`✓ Google Maps: ${distanceInMiles} miles from ${origin} to ${destination}`);
      return distanceInMiles;
    }
    
    console.log(`⚠️  Google Maps API returned status: ${data.status}`);
    return null;
  } catch (error) {
    console.error("Error calculating distance:", error);
    return null;
  }
}

/**
 * Extract structured load data from raw PDF text using OpenAI
 * @param pdfText - Raw text extracted from PDF
 * @returns Structured LoadData object
 */
export async function extractLoadData(pdfText: string): Promise<LoadData> {
  try {
    // Call OpenAI with function calling to extract structured data
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured data from rate confirmation documents. 
Extract all relevant information from the provided text. If a field is not found, use empty string or 0 for numbers.
Be precise with numbers and dates. For stops, identify pickups and deliveries in order.

CRITICAL EXTRACTION RULES (IN ORDER OF IMPORTANCE):

1. LOAD ID - ALWAYS extract the load/trip/order number. This is REQUIRED.

2. STOPS (HIGHEST PRIORITY) - ALWAYS extract pickup and delivery locations:
   ** PICKUP STOP (type: "pickup"):
      - Look for: "Origin", "Pickup", "Ship From", "Shipper", "PU"
      - Extract COMPLETE information:
        * ADDRESS: Full street address (street number + street name) - REQUIRED
        * CITY: City name - REQUIRED
        * STATE: State abbreviation (2 letters) - REQUIRED
        * ZIP: Postal code
        * DATE: Pickup date
        * TIME: Pickup time or window
      - Look for address in pickup/origin section, often listed with location name
   
   ** DELIVERY STOP (type: "delivery"):
      - Look for: "Destination", "Delivery", "Ship To", "Consignee", "Del"
      - Extract COMPLETE information:
        * ADDRESS: Full street address (street number + street name) - REQUIRED
        * CITY: City name - REQUIRED
        * STATE: State abbreviation (2 letters) - REQUIRED
        * ZIP: Postal code
        * DATE: Delivery date
        * TIME: Delivery time or window
      - Look for address in delivery/destination section, often listed with consignee name
   
   ** CRITICAL ADDRESS EXTRACTION:
      - ALWAYS extract the complete street address (e.g., "123 Main St", "4500 Industrial Blvd")
      - Look for address lines near location names or company names
      - If multiple lines, combine them (e.g., "Building 5" + "1000 Park Ave" = "Building 5, 1000 Park Ave")
      - These full addresses are essential for Google Maps distance calculation

3. RATE BREAKDOWN - Extract carefully:
   - TOTAL RATE: The final total payment amount (REQUIRED)
   - LINEHAUL RATE (Base Rate): The base transportation charge BEFORE any additional fees
     * Look for: "Linehaul", "Base Rate", "Rate", "Transportation Charge"
   - ACCESSORIALS: All additional charges (fuel, detention, lumper, etc.)
   
4. BROKER INFO - Extract:
   - Broker/company name (REQUIRED)
   - Email address
   - Phone number
   
5. CARRIER INFO - Extract ALL details when available:
   - Carrier name (company name)
   - MC number or DOT number
   - Complete address (street, city, state, zip)
   - Phone number (and fax if shown)
   - Email address
   
6. OTHER DETAILS:
   - Equipment type
   - Temperature requirements
   - Commodity
   - Weight
   - Dates and times

7. NOTES (VERY IMPORTANT) - Capture ALL special instructions and requirements:
   ** Look in these sections:
      - "Notes", "Special Instructions", "Important Info", "Additional Information"
      - "Terms and Conditions", "Requirements", "Instructions"
      - Footer sections, comment boxes, remarks sections
   
   ** Extract and combine ALL of the following (when present):
      - Loading/unloading instructions (live load, drop trailer, etc.)
      - Detention and layover policies (free time, hourly rates)
      - Appointment requirements (call ahead, schedule in advance)
      - Contact information for scheduling or issues
      - Equipment requirements (tarps, straps, chains, seals)
      - Temperature monitoring requirements
      - Dock hours and availability
      - Special handling (no touch freight, team required, etc.)
      - BOL numbers, reference numbers, PO numbers
      - Hazmat information and requirements
      - Any liability or insurance requirements
      - Delivery restrictions or special conditions
   
   ** Format clearly with line breaks between different types of information
   
   ** Example format for notes:
      "Loading: Live load, arrive 8am-10am window
      Detention: $50/hr after 2 hours free time
      Unloading: Drop trailer, 24hr notice required
      Contact: John Smith 555-1234 for scheduling
      Equipment: Tarps and load locks required
      Temperature: Continuous monitoring, must maintain 34-38°F"`,
        },
        {
          role: "user",
          content: `Extract structured load data from this rate confirmation:\n\n${pdfText}`,
        },
      ],
      functions: [extractionFunctionSchema],
      function_call: { name: "extract_load_data" },
      temperature: 0.1, // Low temperature for consistent extraction
    });

    // Parse the function call response
    const functionCall = response.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error("No function call response from OpenAI");
    }

    const extractedData = JSON.parse(functionCall.arguments) as LoadData;

    // Always calculate miles using Google Maps API from first pickup to last delivery
    const pickups = extractedData.stops?.filter(s => s.type === "pickup") || [];
    const deliveries = extractedData.stops?.filter(s => s.type === "delivery") || [];
    
    const firstPickup = pickups[0];
    const lastDelivery = deliveries[deliveries.length - 1];
    
    if (firstPickup && lastDelivery) {
      // Build full address strings (first pickup to last delivery)
      const originAddress = `${firstPickup.address || ""}, ${firstPickup.city || ""}, ${firstPickup.state || ""}`.trim();
      const destAddress = `${lastDelivery.address || ""}, ${lastDelivery.city || ""}, ${lastDelivery.state || ""}`.trim();
      
      if (originAddress && destAddress) {
        const calculatedMiles = await calculateDistance(originAddress, destAddress);
        
        if (calculatedMiles) {
          extractedData.miles = calculatedMiles.toString();
        }
      }
    }

    // Calculate RPM if miles and rate are available
    if (extractedData.miles && extractedData.rate_total) {
      const miles = parseFloat(extractedData.miles.replace(/[^0-9.]/g, ""));
      if (miles > 0) {
        extractedData.rpm = extractedData.rate_total / miles;
      }
    }

    return extractedData;
  } catch (error) {
    console.error("Error extracting load data:", error);
    throw new Error("Failed to extract load data from PDF");
  }
}

/**
 * Calculate metrics from an array of loads
 * @param loads - Array of LoadData objects
 * @returns Calculated metrics
 */
export function calculateMetrics(loads: LoadData[]) {
  if (loads.length === 0) {
    return {
      totalLoads: 0,
      totalRevenue: 0,
      averageRate: 0,
      averageRPM: 0,
    };
  }

  const totalRevenue = loads.reduce((sum, load) => sum + (load.rate_total || 0), 0);
  const averageRate = totalRevenue / loads.length;

  // Calculate average RPM
  const loadsWithMiles = loads.filter((load) => {
    const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
    return miles > 0;
  });

  let averageRPM = 0;
  if (loadsWithMiles.length > 0) {
    const totalRPM = loadsWithMiles.reduce((sum, load) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      return sum + (load.rate_total / miles);
    }, 0);
    averageRPM = totalRPM / loadsWithMiles.length;
  }

  return {
    totalLoads: loads.length,
    totalRevenue,
    averageRate,
    averageRPM,
  };
}

/**
 * Group loads by broker for chart data
 * @param loads - Array of LoadData objects
 * @returns Array of broker revenue data
 */
export function getRevenueByBroker(loads: LoadData[]) {
  const brokerMap = new Map<string, number>();

  loads.forEach((load) => {
    const broker = load.broker_name || "Unknown";
    const current = brokerMap.get(broker) || 0;
    brokerMap.set(broker, current + (load.rate_total || 0));
  });

  return Array.from(brokerMap.entries())
    .map(([name, revenue]) => ({
      name,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get RPM trend over time
 * @param loads - Array of LoadData objects
 * @returns Array of RPM data points sorted by date
 */
export function getRPMTrend(loads: LoadData[]) {
  return loads
    .filter((load) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      return miles > 0 && load.stops && load.stops.length > 0;
    })
    .map((load) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      const rpm = load.rate_total / miles;
      // Get pickup date from first stop
      const date = load.stops[0]?.date || "";
      return {
        date,
        rpm,
        loadId: load.load_id,
      };
    })
    .sort((a, b) => {
      // Sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}

