import { AppState, TrackType, PatternStats } from '../types';
import { clearAllTrials } from './telemetryStore';

const STORAGE_KEY = 'sheet_trainer_state_v1';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 768;
  return mobileRegex.test(userAgent) || (isTouch && isSmallScreen);
}

export function getDefaultInputMode(): 'direct_entry' | 'multiple_choice' {
  return isMobileDevice() ? 'multiple_choice' : 'direct_entry';
}

export function getDefaultAppState(): AppState {
  const defaultMode = getDefaultInputMode();
  return {
    version: 1,
    settings: {
      theme: 'dark',
      showKeymapLegend: true,
      chords: {
        clef: 'treble',
        inputMode: defaultMode,
        flashMode: 'fixed',
        flashDurationMs: 400,
        keyMode: 'progressive',
        activeKeyId: 'C'
      },
      arpeggios: {
        clef: 'treble',
        inputMode: defaultMode,
        flashMode: 'fixed',
        flashDurationMs: 500,
        keyMode: 'progressive',
        activeKeyId: 'C'
      }
    },
    progress: {
      chords: {
        currentTier: 1.1,
        highestStreak: 0,
        currentStreak: 0,
        totalTrialsCompleted: 0,
        masteredTiers: [],
        unlockedKeyStages: [0],
        masteredKeys: [],
        weaknessMatrix: {}
      },
      arpeggios: {
        currentTier: 1.1,
        highestStreak: 0,
        currentStreak: 0,
        totalTrialsCompleted: 0,
        masteredTiers: [],
        unlockedKeyStages: [0],
        masteredKeys: [],
        weaknessMatrix: {}
      }
    }
  };
}

export const DEFAULT_APP_STATE: AppState = getDefaultAppState();

export function loadAppState(): AppState {
  const defaultState = getDefaultAppState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
        chords: { ...defaultState.settings.chords, ...(parsed.settings?.chords || {}) },
        arpeggios: { ...defaultState.settings.arpeggios, ...(parsed.settings?.arpeggios || {}) }
      },
      progress: {
        ...defaultState.progress,
        ...(parsed.progress || {}),
        chords: { ...defaultState.progress.chords, ...(parsed.progress?.chords || {}) },
        arpeggios: { ...defaultState.progress.arpeggios, ...(parsed.progress?.arpeggios || {}) }
      }
    };
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return defaultState;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function recordTrialResultInState(
  state: AppState,
  track: TrackType,
  patternKey: string,
  isCorrect: boolean,
  latencyMs: number
): AppState {
  const trackProgress = state.progress[track];
  const matrix = { ...trackProgress.weaknessMatrix };
  const currentStats: PatternStats = matrix[patternKey] || {
    totalSeen: 0,
    correctCount: 0,
    avgLatencyMs: latencyMs,
    lastAttemptTimestamp: Date.now()
  };

  const newTotal = currentStats.totalSeen + 1;
  const newCorrect = currentStats.correctCount + (isCorrect ? 1 : 0);
  // Rolling exponential latency average
  const newAvgLatency = Math.round(
    currentStats.totalSeen === 0 
      ? latencyMs 
      : (currentStats.avgLatencyMs * 0.7) + (latencyMs * 0.3)
  );

  matrix[patternKey] = {
    totalSeen: newTotal,
    correctCount: newCorrect,
    avgLatencyMs: newAvgLatency,
    lastAttemptTimestamp: Date.now()
  };

  const newStreak = isCorrect ? trackProgress.currentStreak + 1 : 0;
  const highestStreak = Math.max(trackProgress.highestStreak, newStreak);

  const updatedState: AppState = {
    ...state,
    progress: {
      ...state.progress,
      [track]: {
        ...trackProgress,
        currentStreak: newStreak,
        highestStreak: highestStreak,
        totalTrialsCompleted: trackProgress.totalTrialsCompleted + 1,
        weaknessMatrix: matrix
      }
    }
  };

  saveAppState(updatedState);
  return updatedState;
}

export async function clearAllAppStorage(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.clear();
    await clearAllTrials();
  } catch (e) {
    console.error('Failed to clear app storage:', e);
  }
}

