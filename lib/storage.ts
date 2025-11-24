import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { LoadData } from "./schema";

type LoadRow = {
  user_email: string;
  load_id: string;
  data: LoadData;
  created_at?: string;
  updated_at?: string;
};

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

function mergeLoadData(existing: LoadData, incoming: LoadData): LoadData {
  const merged = { ...existing } as LoadData & Record<string, any>;

  (Object.keys(incoming) as (keyof LoadData)[]).forEach((key) => {
    const incomingValue = incoming[key];

    if (incomingValue === undefined || incomingValue === null) {
      return;
    }

    if (Array.isArray(incomingValue)) {
      merged[key as string] =
        (incomingValue as unknown[]).length > 0
          ? incomingValue
          : merged[key as string];
      return;
    }

    if (typeof incomingValue === "string") {
      merged[key as string] =
        incomingValue.trim().length > 0
          ? incomingValue
          : merged[key as string];
      return;
    }

    if (typeof incomingValue === "object") {
      const existingValue = merged[key as string];
      const incomingObject = incomingValue as Record<string, unknown>;
      const existingObject =
        typeof existingValue === "object" && existingValue
          ? (existingValue as Record<string, unknown>)
          : {};

      merged[key as string] = {
        ...existingObject,
        ...incomingObject,
      } as typeof incomingValue;
      return;
    }

    merged[key as string] = incomingValue;
  });

  return merged;
}

export async function loadLoads(userEmail?: string): Promise<LoadData[]> {
  try {
    const supabase = getSupabaseClient();
    const email = resolveUserEmail(userEmail);

    const { data, error } = await supabase
      .from("loads")
      .select("data")
      .eq("user_email", email)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading loads from Supabase:", error);
      return [];
    }

    return data?.map((row: any) => row.data) ?? [];
  } catch (error) {
    console.error("Unexpected error loading loads:", error);
    return [];
  }
}

export async function saveLoads(
  loads: LoadData[],
  userEmail?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { error: deleteError } = await supabase
    .from("loads")
    .delete()
    .eq("user_email", email);

  if (deleteError) {
    throw deleteError;
  }

  if (loads.length === 0) {
    return;
  }

  const rows: LoadRow[] = loads.map((load) => ({
    user_email: email,
    load_id: load.load_id,
    data: load,
  }));

  const { error } = await supabase.from("loads").insert(rows);
  if (error) {
    throw error;
  }
}

export async function addLoad(
  load: LoadData,
  userEmail?: string
): Promise<void> {
  await addLoads([load], userEmail);
}

export async function addLoads(
  newLoads: LoadData[],
  userEmail?: string
): Promise<{ addedCount: number; duplicateCount: number; updatedCount: number }> {
  if (newLoads.length === 0) {
    return { addedCount: 0, duplicateCount: 0, updatedCount: 0 };
  }

  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const existingLoads = await loadLoads(email);
  const existingMap = new Map(
    existingLoads
      .filter((load) => load.load_id)
      .map((load) => [load.load_id as string, load])
  );

  const rowsToUpsert: LoadRow[] = [];
  let addedCount = 0;
  let updatedCount = 0;

  for (const load of newLoads) {
    if (!load.load_id) {
      continue;
    }

    const existing = existingMap.get(load.load_id);

    if (existing) {
      const merged = mergeLoadData(existing, load);
      rowsToUpsert.push({
        user_email: email,
        load_id: merged.load_id,
        data: merged,
      });
      existingMap.set(load.load_id, merged);
      updatedCount += 1;
    } else {
      rowsToUpsert.push({
        user_email: email,
        load_id: load.load_id,
        data: load,
      });
      existingMap.set(load.load_id, load);
      addedCount += 1;
    }
  }

  if (rowsToUpsert.length > 0) {
    // Deduplicate rows by load_id to avoid "cannot affect row a second time" error
    const uniqueRows = Array.from(
      new Map(rowsToUpsert.map(row => [row.load_id, row])).values()
    );
    
    const { error } = await supabase
      .from("loads")
      .upsert(uniqueRows, { onConflict: "user_email,load_id" });

    if (error) {
      throw error;
    }
  }

  const duplicateCount = updatedCount;

  return { addedCount, duplicateCount, updatedCount };
}

export async function clearLoads(userEmail?: string): Promise<void> {
  const supabase = getSupabaseClient();
  const email = resolveUserEmail(userEmail);

  const { error } = await supabase
    .from("loads")
    .delete()
    .eq("user_email", email);

  if (error) {
    throw error;
  }
}

