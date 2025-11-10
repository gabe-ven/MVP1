import { LoadData } from "./schema";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "loads.json");

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get user-specific data file path
 */
function getUserDataFile(userEmail?: string): string {
  if (!userEmail) {
    return DATA_FILE; // Default file for backward compatibility
  }
  // Sanitize email for filename
  const sanitized = userEmail.replace(/[^a-zA-Z0-9@._-]/g, '_');
  return path.join(DATA_DIR, `loads_${sanitized}.json`);
}

/**
 * Load all stored loads from JSON file
 * @param userEmail - Optional user email for user-specific data
 * @returns Array of LoadData objects
 */
export async function loadLoads(userEmail?: string): Promise<LoadData[]> {
  try {
    await ensureDataDir();
    const dataFile = getUserDataFile(userEmail);
    const data = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet or is invalid, return empty array
    return [];
  }
}

/**
 * Save loads to JSON file
 * @param loads - Array of LoadData objects to save
 * @param userEmail - Optional user email for user-specific data
 */
export async function saveLoads(loads: LoadData[], userEmail?: string): Promise<void> {
  await ensureDataDir();
  const dataFile = getUserDataFile(userEmail);
  await fs.writeFile(dataFile, JSON.stringify(loads, null, 2), "utf-8");
}

/**
 * Add a new load to storage
 * @param load - LoadData object to add
 * @param userEmail - Optional user email for user-specific data
 */
export async function addLoad(load: LoadData, userEmail?: string): Promise<void> {
  const loads = await loadLoads(userEmail);
  loads.push(load);
  await saveLoads(loads, userEmail);
}

/**
 * Add multiple loads to storage (prevents duplicates by load_id)
 * @param newLoads - Array of LoadData objects to add
 * @param userEmail - Optional user email for user-specific data
 * @returns Object with counts of added and duplicate loads
 */
export async function addLoads(
  newLoads: LoadData[],
  userEmail?: string
): Promise<{ addedCount: number; duplicateCount: number }> {
  const loads = await loadLoads(userEmail);
  
  // Get existing load IDs for duplicate detection
  const existingLoadIds = new Set(loads.map(load => load.load_id));
  
  // Only add loads that don't already exist
  const uniqueNewLoads = newLoads.filter(load => {
    if (existingLoadIds.has(load.load_id)) {
      console.log(`⚠️  Skipping duplicate load: ${load.load_id}`);
      return false;
    }
    return true;
  });
  
  const addedCount = uniqueNewLoads.length;
  const duplicateCount = newLoads.length - addedCount;
  
  if (uniqueNewLoads.length > 0) {
    loads.push(...uniqueNewLoads);
    await saveLoads(loads, userEmail);
    console.log(`✓ Added ${addedCount} new loads (${duplicateCount} duplicates skipped)`);
  } else {
    console.log(`⚠️  No new loads added (all ${newLoads.length} were duplicates)`);
  }
  
  return { addedCount, duplicateCount };
}

/**
 * Clear all loads for a user
 * @param userEmail - Optional user email for user-specific data
 */
export async function clearLoads(userEmail?: string): Promise<void> {
  await saveLoads([], userEmail);
}

