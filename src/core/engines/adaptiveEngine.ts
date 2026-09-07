import { 
  ChordDefinition, 
  ArpeggioDefinition, 
  TrackType, 
  Clef, 
  PatternStats,
  TrackProgress
} from '../../types';
import { 
  generateRandomChordForTier, 
  buildChord, 
  CHORD_TIERS 
} from '../theory/chords';
import { 
  generateRandomArpeggioForTier, 
  buildArpeggio, 
  ARPEGGIO_TIERS 
} from '../theory/arpeggios';
import { NOTE_LETTERS } from '../theory/notes';

export function calculatePatternWeight(stats?: PatternStats): number {
  if (!stats || stats.totalSeen === 0) {
    return 1.5; // Slightly boosted weight for unseen patterns
  }
  const errorRate = 1.0 - (stats.correctCount / stats.totalSeen);
  const latencyBoost = Math.min(stats.avgLatencyMs / 1000, 2.0);
  return 1.0 + (errorRate * 2.5) + latencyBoost;
}

export function selectNextChord(
  tier: number,
  clef: Clef,
  progress: TrackProgress
): ChordDefinition {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  const matrix = progress.weaknessMatrix;

  // 40% chance to target a known weakness in this tier if available
  const tierWeaknesses = Object.entries(matrix).filter(([k, stats]) => {
    return k.startsWith(clef) && stats.totalSeen > 0 && (stats.correctCount / stats.totalSeen < 0.85);
  });

  if (tierWeaknesses.length > 0 && Math.random() < 0.4) {
    // Pick highest weighted weak spot
    tierWeaknesses.sort((a, b) => calculatePatternWeight(b[1]) - calculatePatternWeight(a[1]));
    const [weakKey] = tierWeaknesses[0];
    const parts = weakKey.split(':'); // [clef, quality, inversion]
    if (parts.length >= 3) {
      const quality = parts[1] as any;
      const inversion = parts[2] as any;
      const root = NOTE_LETTERS[Math.floor(Math.random() * NOTE_LETTERS.length)];
      const rootAccidental = config.accidentals[Math.floor(Math.random() * config.accidentals.length)];
      return buildChord(root, rootAccidental, quality, inversion, clef, tier);
    }
  }

  return generateRandomChordForTier(tier, clef);
}

export function selectNextArpeggio(
  tier: number,
  clef: Clef,
  progress: TrackProgress
): ArpeggioDefinition {
  const config = ARPEGGIO_TIERS[tier] || ARPEGGIO_TIERS[1.1];
  const matrix = progress.weaknessMatrix;

  const tierWeaknesses = Object.entries(matrix).filter(([k, stats]) => {
    return k.startsWith(clef) && stats.totalSeen > 0 && (stats.correctCount / stats.totalSeen < 0.85);
  });

  if (tierWeaknesses.length > 0 && Math.random() < 0.4) {
    tierWeaknesses.sort((a, b) => calculatePatternWeight(b[1]) - calculatePatternWeight(a[1]));
    const [weakKey] = tierWeaknesses[0];
    const parts = weakKey.split(':'); // [clef, quality, contour]
    if (parts.length >= 3) {
      const quality = parts[1] as any;
      const contour = parts[2] as any;
      const root = NOTE_LETTERS[Math.floor(Math.random() * NOTE_LETTERS.length)];
      const rootAccidental = config.accidentals[Math.floor(Math.random() * config.accidentals.length)];
      const startingDegree = config.startingDegrees[Math.floor(Math.random() * config.startingDegrees.length)];
      return buildArpeggio(root, rootAccidental, quality, contour, startingDegree, clef, tier);
    }
  }

  return generateRandomArpeggioForTier(tier, clef);
}

export interface PromotionCheckResult {
  shouldPromote: boolean;
  currentTier: number;
  nextTier: number | null;
  accuracy: number;
  avgLatencyMs: number;
  message?: string;
}

export function checkTierPromotion(
  track: TrackType,
  currentTier: number,
  recentTrials: { isCorrect: boolean; latencyMs: number }[]
): PromotionCheckResult {
  if (recentTrials.length < 15) {
    return {
      shouldPromote: false,
      currentTier,
      nextTier: null,
      accuracy: 0,
      avgLatencyMs: 0
    };
  }

  const last15 = recentTrials.slice(0, 15);
  const correctCount = last15.filter(t => t.isCorrect).length;
  const accuracy = correctCount / last15.length;
  const avgLatency = Math.round(last15.reduce((sum, t) => sum + t.latencyMs, 0) / last15.length);

  // Criteria: >= 87% accuracy and < 700ms latency
  const passed = accuracy >= 0.87 && avgLatency < 700;

  const tiersList = track === 'chords' 
    ? Object.keys(CHORD_TIERS).map(Number).sort((a, b) => a - b)
    : Object.keys(ARPEGGIO_TIERS).map(Number).sort((a, b) => a - b);

  const currentIndex = tiersList.indexOf(currentTier);
  const nextTier = currentIndex >= 0 && currentIndex < tiersList.length - 1 
    ? tiersList[currentIndex + 1] 
    : null;

  return {
    shouldPromote: passed && nextTier !== null,
    currentTier,
    nextTier,
    accuracy: Math.round(accuracy * 100),
    avgLatencyMs: avgLatency,
    message: passed && nextTier !== null 
      ? `Mastery achieved! Tier ${nextTier} unlocked.` 
      : undefined
  };
}
