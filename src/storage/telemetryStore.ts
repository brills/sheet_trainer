import { get, set, createStore } from 'idb-keyval';
import { TrialLog, TrackType } from '../types';

const isIndexedDBAvailable = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
const customStore = isIndexedDBAvailable ? createStore('sheet_trainer_db', 'trial_logs') : undefined;
const LOGS_KEY = 'all_trials';

export async function logTrial(log: TrialLog): Promise<void> {
  if (!isIndexedDBAvailable || !customStore) return;
  try {
    const existingLogs: TrialLog[] = (await get(LOGS_KEY, customStore)) || [];
    // Keep max 2000 trials locally for performance
    const updated = [log, ...existingLogs.slice(0, 1999)];
    await set(LOGS_KEY, updated, customStore);
  } catch (e) {
    console.error('Failed to log trial to IndexedDB:', e);
  }
}

export async function getAllTrials(): Promise<TrialLog[]> {
  if (!isIndexedDBAvailable || !customStore) return [];
  try {
    return (await get(LOGS_KEY, customStore)) || [];
  } catch (e) {
    console.error('Failed to fetch trials from IndexedDB:', e);
    return [];
  }
}

export async function getTrialsForTrack(track: TrackType): Promise<TrialLog[]> {
  const all = await getAllTrials();
  return all.filter(t => t.track === track);
}

export async function clearAllTrials(): Promise<void> {
  if (!isIndexedDBAvailable || !customStore) return;
  try {
    await set(LOGS_KEY, [], customStore);
  } catch (e) {
    console.error('Failed to clear trials from IndexedDB:', e);
  }
}

