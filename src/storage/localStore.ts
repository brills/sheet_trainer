import { AppState, TrackType, PatternStats } from '../types';

const STORAGE_KEY = 'sheet_trainer_state_v1';

export const DEFAULT_APP_STATE: AppState = {
  version: 1,
  settings: {
    theme: 'dark',
    showKeymapLegend: true,
    chords: {
      clef: 'treble',
      inputMode: 'direct_entry',
      flashMode: 'fixed',
      flashDurationMs: 400
    },
    arpeggios: {
      clef: 'treble',
      inputMode: 'shape_only',
      flashMode: 'fixed',
      flashDurationMs: 500
    }
  },
  progress: {
    chords: {
      currentTier: 1.1,
      highestStreak: 0,
      currentStreak: 0,
      totalTrialsCompleted: 0,
      masteredTiers: [],
      weaknessMatrix: {}
    },
    arpeggios: {
      currentTier: 1.1,
      highestStreak: 0,
      currentStreak: 0,
      totalTrialsCompleted: 0,
      masteredTiers: [],
      weaknessMatrix: {}
    }
  }
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_APP_STATE.settings,
        ...(parsed.settings || {}),
        chords: { ...DEFAULT_APP_STATE.settings.chords, ...(parsed.settings?.chords || {}) },
        arpeggios: { ...DEFAULT_APP_STATE.settings.arpeggios, ...(parsed.settings?.arpeggios || {}) }
      },
      progress: {
        ...DEFAULT_APP_STATE.progress,
        ...(parsed.progress || {}),
        chords: { ...DEFAULT_APP_STATE.progress.chords, ...(parsed.progress?.chords || {}) },
        arpeggios: { ...DEFAULT_APP_STATE.progress.arpeggios, ...(parsed.progress?.arpeggios || {}) }
      }
    };
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return DEFAULT_APP_STATE;
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
