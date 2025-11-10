/**
 * Universal schema for rate confirmation extraction
 * This defines the structure of data we extract from each PDF
 */

export interface Stop {
  type: "pickup" | "delivery";
  location_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  time: string;
  appointment_type: string;
}

export interface Accessorial {
  name: string;
  amount: number;
}

export interface LoadData {
  load_id: string;
  broker_name: string;
  broker_email: string;
  broker_phone: string;
  carrier_name: string;
  carrier_mc: string;
  carrier_email: string;
  carrier_phone: string;
  carrier_address: string;
  rate_total: number;
  linehaul_rate: number;
  accessorials: Accessorial[];
  equipment_type: string;
  temp_min: string;
  temp_max: string;
  stops: Stop[];
  commodity: string;
  weight: string;
  miles: string;
  notes: string;
  // Auto-calculated fields
  rpm?: number;
  source_file?: string;
  extracted_at?: string;
}

/**
 * OpenAI function schema for structured extraction
 * This tells GPT exactly what format we expect
 */
export const extractionFunctionSchema = {
  name: "extract_load_data",
  description: "Extract structured load data from a rate confirmation document",
  parameters: {
    type: "object",
    properties: {
      load_id: {
        type: "string",
        description: "Load ID, trip number, order number, or reference number - ALWAYS extract this unique identifier",
      },
      broker_name: {
        type: "string",
        description: "Name of the broker/freight company",
      },
      broker_email: {
        type: "string",
        description: "Broker's email address",
      },
      broker_phone: {
        type: "string",
        description: "Broker's phone number",
      },
      carrier_name: {
        type: "string",
        description: "Name of the carrier",
      },
      carrier_mc: {
        type: "string",
        description: "Carrier MC number",
      },
      carrier_email: {
        type: "string",
        description: "Carrier's email address",
      },
      carrier_phone: {
        type: "string",
        description: "Carrier's phone number",
      },
        carrier_address: {
          type: "string",
          description: "Carrier's full address (street, city, state, zip)",
        },
      rate_total: {
        type: "number",
        description: "Total rate/payment amount - the final amount to be paid",
      },
      linehaul_rate: {
        type: "number",
        description: "Base linehaul rate (also called 'Base Rate' or 'Transportation Charge') - the transportation cost BEFORE accessorials. Look for 'Linehaul', 'Base Rate', or the largest rate before additional charges.",
      },
      accessorials: {
        type: "array",
        description: "List of additional charges",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            amount: { type: "number" },
          },
        },
      },
      equipment_type: {
        type: "string",
        description: "Type of equipment (e.g., Dry Van, Reefer, Flatbed)",
      },
      temp_min: {
        type: "string",
        description: "Minimum temperature (if applicable)",
      },
      temp_max: {
        type: "string",
        description: "Maximum temperature (if applicable)",
      },
      stops: {
        type: "array",
        description: "List of pickup and delivery stops. MUST include at least one pickup and one delivery stop. City and State are REQUIRED for route display.",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["pickup", "delivery"],
              description: "Stop type: 'pickup' for origin, 'delivery' for destination",
            },
            location_name: { 
              type: "string",
              description: "Company/facility name at this location",
            },
            address: { 
              type: "string",
              description: "COMPLETE street address including street number and name (e.g., '123 Main St', '4500 Industrial Blvd'). ALWAYS extract if available - needed for accurate mileage calculation.",
            },
            city: { 
              type: "string",
              description: "City name - REQUIRED, never leave blank. Look for city in pickup/delivery sections.",
            },
            state: { 
              type: "string",
              description: "State abbreviation (2 letters: CA, TX, NY, etc.) - REQUIRED, never leave blank.",
            },
            zip: { 
              type: "string",
              description: "ZIP/postal code",
            },
            date: { 
              type: "string",
              description: "Pickup or delivery date",
            },
            time: { 
              type: "string",
              description: "Pickup or delivery time window",
            },
            appointment_type: { 
              type: "string",
              description: "FCFS, appointment, etc.",
            },
          },
          required: ["type", "city", "state"],
        },
      },
      commodity: {
        type: "string",
        description: "Type of goods being transported",
      },
      weight: {
        type: "string",
        description: "Weight of the load",
      },
      miles: {
        type: "string",
        description: "Total miles for the trip (will be auto-calculated from addresses). Leave empty, this field is not needed from PDF.",
      },
      notes: {
        type: "string",
        description: "Comprehensive notes combining ALL special instructions, requirements, and important details. Include: special handling instructions, loading/unloading requirements, detention policies, contact instructions, appointment requirements, tarping needs, dock hours, hazmat info, BOL numbers, reference numbers, equipment specifications, temperature monitoring, and any other important information mentioned in the document. Format as a clear, organized list.",
      },
    },
    required: ["load_id", "broker_name", "rate_total"],
  },
};

