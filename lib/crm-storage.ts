import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { LoadData } from "./schema";

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured."
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
      }
    );
  }

  return supabaseClient;
}

function resolveUserEmail(userEmail?: string): string {
  return userEmail ?? "default";
}

// Types
export interface Broker {
  id: string;
  user_email: string;
  broker_name: string;
  broker_email?: string;
  broker_phone?: string;
  first_load_date?: string;
  last_load_date?: string;
  total_loads: number;
  total_revenue: number;
  avg_rate: number;
  avg_rpm: number;
  notes?: string;
  status: "active" | "inactive" | "prospect";
  created_at: string;
  updated_at: string;
}

export interface BrokerInteraction {
  id: string;
  user_email: string;
  broker_id: string;
  interaction_type: "email" | "call" | "meeting" | "note";
  subject?: string;
  notes?: string;
  interaction_date: string;
  created_at: string;
}

export interface BrokerTask {
  id: string;
  user_email: string;
  broker_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: "pending" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BrokerWithDetails extends Broker {
  interactions?: BrokerInteraction[];
  tasks?: BrokerTask[];
  loads?: LoadData[];
}

export interface BrokerFilters {
  status?: "active" | "inactive" | "prospect";
  search?: string;
  sortBy?: "name" | "revenue" | "loads" | "lastContact";
  sortOrder?: "asc" | "desc";
}

export interface TaskFilters {
  brokerId?: string;
  status?: "pending" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high";
  overdue?: boolean;
}

/**
 * Sync brokers from load data
 * Creates/updates broker profiles based on loads
 */
export async function syncBrokersFromLoads(
  loads: LoadData[],
  userEmail?: string
): Promise<{ synced: number; updated: number }> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  console.log(`[CRM Sync] Starting sync for ${email}, processing ${loads.length} loads`);

  // Group loads by broker
  const brokerMap = new Map<string, LoadData[]>();
  
  loads.forEach((load) => {
    if (load.broker_name && load.broker_email) {
      const key = load.broker_email.toLowerCase();
      if (!brokerMap.has(key)) {
        brokerMap.set(key, []);
      }
      brokerMap.get(key)!.push(load);
    }
  });

  console.log(`[CRM Sync] Found ${brokerMap.size} unique brokers to sync`);

  let synced = 0;
  let updated = 0;

  // Process each broker
  for (const [brokerEmail, brokerLoads] of Array.from(brokerMap.entries())) {
    // Calculate stats
    const totalRevenue = brokerLoads.reduce((sum: number, load: LoadData) => sum + (load.rate_total || 0), 0);
    const totalLoads = brokerLoads.length;
    const avgRate = totalRevenue / totalLoads;

    // Calculate average RPM
    const loadsWithMiles = brokerLoads.filter((load: LoadData) => {
      const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
      return miles > 0;
    });

    let avgRpm = 0;
    if (loadsWithMiles.length > 0) {
      const totalRpm = loadsWithMiles.reduce((sum: number, load: LoadData) => {
        const miles = parseFloat(load.miles?.replace(/[^0-9.]/g, "") || "0");
        return sum + (load.rate_total / miles);
      }, 0);
      avgRpm = totalRpm / loadsWithMiles.length;
    }

    // Get first and last load dates
    const sortedLoads = [...brokerLoads].sort((a, b) => {
      const dateA = a.stops?.[0]?.date || "";
      const dateB = b.stops?.[0]?.date || "";
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    const firstLoadDate = sortedLoads[0]?.stops?.[0]?.date;
    const lastLoadDate = sortedLoads[sortedLoads.length - 1]?.stops?.[0]?.date;

    // Upsert broker
    const brokerData = {
      user_email: email,
      broker_name: brokerLoads[0].broker_name,
      broker_email: brokerEmail,
      broker_phone: brokerLoads[0].broker_phone,
      first_load_date: firstLoadDate,
      last_load_date: lastLoadDate,
      total_loads: totalLoads,
      total_revenue: totalRevenue,
      avg_rate: avgRate,
      avg_rpm: avgRpm,
      status: "active" as const,
    };

    const { error, data } = await supabase
      .from("brokers")
      .upsert(brokerData, {
        onConflict: "user_email,broker_email",
      })
      .select();

    if (error) {
      console.error(`[CRM Sync] Error syncing broker ${brokerEmail}:`, error);
      continue;
    }

    console.log(`[CRM Sync] Successfully synced broker: ${brokerData.broker_name}`);
    synced++;
  }

  console.log(`[CRM Sync] Sync complete: ${synced} brokers synced`);
  return { synced, updated };
}

/**
 * Get all brokers for a user
 */
export async function getBrokers(
  userEmail?: string,
  filters?: BrokerFilters
): Promise<Broker[]> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  let query = supabase
    .from("brokers")
    .select("*")
    .eq("user_email", email);

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(
      `broker_name.ilike.%${filters.search}%,broker_email.ilike.%${filters.search}%`
    );
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "broker_name";
  const sortOrder = filters?.sortOrder || "asc";

  switch (sortBy) {
    case "revenue":
      query = query.order("total_revenue", { ascending: sortOrder === "asc" });
      break;
    case "loads":
      query = query.order("total_loads", { ascending: sortOrder === "asc" });
      break;
    case "lastContact":
      query = query.order("last_load_date", { ascending: sortOrder === "asc", nullsFirst: false });
      break;
    default:
      query = query.order("broker_name", { ascending: sortOrder === "asc" });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching brokers:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single broker with details
 */
export async function getBrokerById(
  brokerId: string,
  userEmail?: string
): Promise<BrokerWithDetails | null> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  // Get broker
  const { data: broker, error: brokerError } = await supabase
    .from("brokers")
    .select("*")
    .eq("id", brokerId)
    .eq("user_email", email)
    .single();

  if (brokerError || !broker) {
    console.error("Error fetching broker:", brokerError);
    return null;
  }

  // Get interactions
  const { data: interactions } = await supabase
    .from("broker_interactions")
    .select("*")
    .eq("broker_id", brokerId)
    .eq("user_email", email)
    .order("interaction_date", { ascending: false });

  // Get tasks
  const { data: tasks } = await supabase
    .from("broker_tasks")
    .select("*")
    .eq("broker_id", brokerId)
    .eq("user_email", email)
    .order("due_date", { ascending: true, nullsFirst: false });

  return {
    ...broker,
    interactions: interactions || [],
    tasks: tasks || [],
  };
}

/**
 * Update a broker
 */
export async function updateBroker(
  brokerId: string,
  updates: Partial<Broker>,
  userEmail?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { error } = await supabase
    .from("brokers")
    .update(updates)
    .eq("id", brokerId)
    .eq("user_email", email);

  if (error) {
    console.error("Error updating broker:", error);
    return false;
  }

  return true;
}

/**
 * Add an interaction
 */
export async function addInteraction(
  brokerId: string,
  interaction: Omit<BrokerInteraction, "id" | "user_email" | "broker_id" | "created_at">,
  userEmail?: string
): Promise<BrokerInteraction | null> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { data, error } = await supabase
    .from("broker_interactions")
    .insert({
      user_email: email,
      broker_id: brokerId,
      ...interaction,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding interaction:", error);
    return null;
  }

  return data;
}

/**
 * Get interactions for a broker
 */
export async function getInteractions(
  brokerId: string,
  userEmail?: string
): Promise<BrokerInteraction[]> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { data, error } = await supabase
    .from("broker_interactions")
    .select("*")
    .eq("broker_id", brokerId)
    .eq("user_email", email)
    .order("interaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching interactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a task
 */
export async function addTask(
  brokerId: string,
  task: Omit<BrokerTask, "id" | "user_email" | "broker_id" | "created_at" | "updated_at">,
  userEmail?: string
): Promise<BrokerTask | null> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { data, error } = await supabase
    .from("broker_tasks")
    .insert({
      user_email: email,
      broker_id: brokerId,
      ...task,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding task:", error);
    return null;
  }

  return data;
}

/**
 * Get tasks
 */
export async function getTasks(
  userEmail?: string,
  filters?: TaskFilters
): Promise<BrokerTask[]> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  let query = supabase
    .from("broker_tasks")
    .select("*")
    .eq("user_email", email);

  // Apply filters
  if (filters?.brokerId) {
    query = query.eq("broker_id", filters.brokerId);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.overdue) {
    query = query.lt("due_date", new Date().toISOString()).eq("status", "pending");
  }

  query = query.order("due_date", { ascending: true, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<BrokerTask>,
  userEmail?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  // If marking as completed, set completed_at
  if (updates.status === "completed" && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("broker_tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("user_email", email);

  if (error) {
    console.error("Error updating task:", error);
    return false;
  }

  return true;
}

/**
 * Get broker by email (for linking from loads)
 */
export async function getBrokerByEmail(
  brokerEmail: string,
  userEmail?: string
): Promise<Broker | null> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { data, error } = await supabase
    .from("brokers")
    .select("*")
    .eq("user_email", email)
    .eq("broker_email", brokerEmail.toLowerCase())
    .single();

  if (error) {
    return null;
  }

  return data;
}

