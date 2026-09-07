import { AppState, TrialLog } from '../types';
import { loadAppState, saveAppState } from './localStore';
import { getAllTrials } from './telemetryStore';
import { set, createStore } from 'idb-keyval';

const isIndexedDBAvailable = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
const customStore = isIndexedDBAvailable ? createStore('sheet_trainer_db', 'trial_logs') : undefined;
const LOGS_KEY = 'all_trials';

export interface ExportData {
  version: number;
  exportedAt: string;
  appState: AppState;
  trials: TrialLog[];
}

export async function exportAllDataToJson(): Promise<string> {
  const appState = loadAppState();
  const trials = await getAllTrials();

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appState,
    trials
  };

  return JSON.stringify(data, null, 2);
}

export function downloadBackupFile(jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sheet-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDataFromJson(jsonString: string): Promise<boolean> {
  try {
    const data: ExportData = JSON.parse(jsonString);
    if (!data.appState) {
      throw new Error('Invalid backup file: Missing app state');
    }

    saveAppState(data.appState);
    if (Array.isArray(data.trials)) {
      await set(LOGS_KEY, data.trials, customStore);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
