/**
 * Shared itinerary utilities.
 * Reads/writes the same storage key as TaskManager so items appear in the Itinerary tab.
 */

import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'tuzla_task_manager_v1';

export interface ItineraryItem {
  id: number;
  name: string;
  address: string;
  type: 'Hotel' | 'Restaurant' | 'Attraction';
  checked: boolean;
}

interface StorageState {
  expenses?: any[];
  tasks?: any[];
  itinerary?: ItineraryItem[];
}

async function readStorage(): Promise<StorageState> {
  try {
    const { value: raw } = await Preferences.get({ key: STORAGE_KEY });
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeStorage(state: StorageState): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) });
}

/**
 * Add a venue to the itinerary (stored in TaskManager's persistent storage).
 * Returns true if added, false if already exists.
 */
export async function addToItinerary(
  name: string,
  address: string,
  type: 'Hotel' | 'Restaurant' | 'Attraction'
): Promise<boolean> {
  const state = await readStorage();
  const itinerary = state.itinerary ?? [];

  // Prevent duplicates
  if (itinerary.some(item => item.name === name)) {
    return false;
  }

  itinerary.push({
    id: Date.now(),
    name,
    address,
    type,
    checked: false,
  });

  await writeStorage({ ...state, itinerary });

  // Dispatch a storage event so TaskManager can pick it up in real-time
  window.dispatchEvent(new Event('itinerary-updated'));
  return true;
}

/**
 * Get the current itinerary count.
 */
export async function getItineraryCount(): Promise<number> {
  const state = await readStorage();
  return (state.itinerary ?? []).length;
}
