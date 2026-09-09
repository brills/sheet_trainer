import { 
  ChordDefinition, 
  ArpeggioDefinition, 
  TrackType, 
  Clef, 
  PatternStats,
  TrackProgress,
  KeySignatureDefinition,
  ChordQuality,
  Inversion,
  ArpeggioContour
} from '../../types';
import { 
  generateRandomChordForTier, 
  buildChord, 
  CHORD_TIERS,
  getValidRootsForQuality
} from '../theory/chords';
import { 
  generateRandomArpeggioForTier, 
  buildArpeggio, 
  ARPEGGIO_TIERS,
  getValidArpeggioRootsForQuality
} from '../theory/arpeggios';
import { 
  getDiatonicChordsForKey, 
  getDiatonicArpeggiosForKey,
  KEY_STAGES 
} from '../theory/keys';

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
  progress: TrackProgress,
  keySignature?: KeySignatureDefinition,
  onlyDiatonic: boolean = false
): ChordDefinition {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  const matrix = progress.weaknessMatrix;

  // 1. If onlyDiatonic is enabled and key signature is present, strictly sample from diatonic chords (if available)
  if (onlyDiatonic && keySignature) {
    const diatonicChords = getDiatonicChordsForKey(keySignature, tier, clef);
    if (diatonicChords.length > 0) {
      const weightedCandidates = diatonicChords.map(chord => {
        const patternKey = `${clef}:${chord.quality}:${chord.inversion}`;
        const stats = matrix[patternKey];
        const weight = calculatePatternWeight(stats);
        return { chord, weight };
      });
      const totalWeight = weightedCandidates.reduce((sum, c) => sum + c.weight, 0);
      let random = Math.random() * totalWeight;
      for (const item of weightedCandidates) {
        random -= item.weight;
        if (random <= 0) {
          item.chord.keySignature = keySignature;
          return item.chord;
        }
      }
      const picked = diatonicChords[Math.floor(Math.random() * diatonicChords.length)];
      picked.keySignature = keySignature;
      return picked;
    }
  }

  // 2. Default: If a key signature is active, 80% chance to sample diatonic chords in this key
  if (keySignature && Math.random() < 0.8) {
    const diatonicChords = getDiatonicChordsForKey(keySignature, tier, clef);
    if (diatonicChords.length > 0) {
      const picked = diatonicChords[Math.floor(Math.random() * diatonicChords.length)];
      picked.keySignature = keySignature;
      return picked;
    }
  }

  // 40% chance of the remaining trials to target a known weakness strictly within this tier's qualities and inversions
  const tierWeaknesses = Object.entries(matrix).filter(([k, stats]) => {
    if (!k.startsWith(clef) || stats.totalSeen === 0 || (stats.correctCount / stats.totalSeen >= 0.85)) {
      return false;
    }
    const parts = k.split(':'); // [clef, quality, inversion]
    if (parts.length < 3) return false;
    const quality = parts[1] as ChordQuality;
    const inversion = parts[2] as Inversion;
    return config.qualities.includes(quality) && config.inversions.includes(inversion);
  });

  if (tierWeaknesses.length > 0 && Math.random() < 0.4) {
    // Pick highest weighted weak spot
    tierWeaknesses.sort((a, b) => calculatePatternWeight(b[1]) - calculatePatternWeight(a[1]));
    const [weakKey] = tierWeaknesses[0];
    const parts = weakKey.split(':'); // [clef, quality, inversion]
    if (parts.length >= 3) {
      const quality = parts[1] as ChordQuality;
      const inversion = parts[2] as Inversion;
      const validRoots = getValidRootsForQuality(quality, tier, clef);
      const picked = validRoots[Math.floor(Math.random() * validRoots.length)];
      const isDropVoicing = config.voicing === 'drop2' || config.voicing === 'drop3';
      const canOmit5 = isDropVoicing && (quality === 'maj7' || quality === 'dom7' || quality === 'min7');
      const omit5 = canOmit5 && Math.random() < 0.45;
      const chord = buildChord(picked.root, picked.accidental, quality, inversion, clef, tier, undefined, undefined, omit5);
      if (keySignature) chord.keySignature = keySignature;
      return chord;
    }
  }

  const randomChord = generateRandomChordForTier(tier, clef);
  if (keySignature) randomChord.keySignature = keySignature;
  return randomChord;
}

export function selectNextArpeggio(
  tier: number,
  clef: Clef,
  progress: TrackProgress,
  keySignature?: KeySignatureDefinition,
  onlyDiatonic: boolean = false
): ArpeggioDefinition {
  const config = ARPEGGIO_TIERS[tier] || ARPEGGIO_TIERS[1.1];
  const matrix = progress.weaknessMatrix;

  // 1. If onlyDiatonic is enabled and key signature is present, strictly sample from diatonic arpeggios (if available)
  if (onlyDiatonic && keySignature) {
    const diatonicArps = getDiatonicArpeggiosForKey(keySignature, tier, clef);
    if (diatonicArps.length > 0) {
      const weightedCandidates = diatonicArps.map(arp => {
        const patternKey = `${clef}:${arp.quality}:${arp.contour}`;
        const stats = matrix[patternKey];
        const weight = calculatePatternWeight(stats);
        return { arp, weight };
      });
      const totalWeight = weightedCandidates.reduce((sum, c) => sum + c.weight, 0);
      let random = Math.random() * totalWeight;
      for (const item of weightedCandidates) {
        random -= item.weight;
        if (random <= 0) {
          item.arp.keySignature = keySignature;
          return item.arp;
        }
      }
      const picked = diatonicArps[Math.floor(Math.random() * diatonicArps.length)];
      picked.keySignature = keySignature;
      return picked;
    }
  }

  // 2. Default: 80% chance to sample diatonic arpeggios in the active key
  if (keySignature && Math.random() < 0.8) {
    const diatonicArps = getDiatonicArpeggiosForKey(keySignature, tier, clef);
    if (diatonicArps.length > 0) {
      const picked = diatonicArps[Math.floor(Math.random() * diatonicArps.length)];
      picked.keySignature = keySignature;
      return picked;
    }
  }

  // 40% chance of the remaining trials to target a known weakness strictly within this tier's qualities and contours
  const tierWeaknesses = Object.entries(matrix).filter(([k, stats]) => {
    if (!k.startsWith(clef) || stats.totalSeen === 0 || (stats.correctCount / stats.totalSeen >= 0.85)) {
      return false;
    }
    const parts = k.split(':'); // [clef, quality, contour]
    if (parts.length < 3) return false;
    const quality = parts[1] as ChordQuality;
    const contour = parts[2] as ArpeggioContour;
    return config.qualities.includes(quality) && config.contours.includes(contour);
  });

  if (tierWeaknesses.length > 0 && Math.random() < 0.4) {
    tierWeaknesses.sort((a, b) => calculatePatternWeight(b[1]) - calculatePatternWeight(a[1]));
    const [weakKey] = tierWeaknesses[0];
    const parts = weakKey.split(':'); // [clef, quality, contour]
    if (parts.length >= 3) {
      const quality = parts[1] as ChordQuality;
      const contour = parts[2] as ArpeggioContour;
      const startingDegree = config.startingDegrees[Math.floor(Math.random() * config.startingDegrees.length)];
      const validRoots = getValidArpeggioRootsForQuality(quality, tier, clef);
      const picked = validRoots[Math.floor(Math.random() * validRoots.length)];
      const arp = buildArpeggio(picked.root, picked.accidental, quality, contour, startingDegree, clef, tier);
      if (keySignature) arp.keySignature = keySignature;
      return arp;
    }
  }

  const randomArp = generateRandomArpeggioForTier(tier, clef);
  if (keySignature) randomArp.keySignature = keySignature;
  return randomArp;
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
  if (recentTrials.length < 20) {
    return {
      shouldPromote: false,
      currentTier,
      nextTier: null,
      accuracy: 0,
      avgLatencyMs: 0
    };
  }

  const last20 = recentTrials.slice(0, 20);
  const correctCount = last20.filter(t => t.isCorrect).length;
  const accuracy = correctCount / last20.length;
  const avgLatency = Math.round(last20.reduce((sum, t) => sum + t.latencyMs, 0) / last20.length);

  // Criteria: >= 85% accuracy and <= 2000ms (2.0s) average latency
  const passed = accuracy >= 0.85 && avgLatency <= 2000;

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
      ? `🎉 Tier ${currentTier} Mastered!` 
      : undefined
  };
}

export interface KeyStagePromotionResult {
  shouldPromote: boolean;
  currentStage: number;
  nextStage: number | null;
  accuracy: number;
  avgLatencyMs: number;
  message?: string;
}

export function checkKeyStagePromotion(
  currentStage: number,
  recentTrialsInStage: { isCorrect: boolean; latencyMs: number }[]
): KeyStagePromotionResult {
  if (recentTrialsInStage.length < 20) {
    return {
      shouldPromote: false,
      currentStage,
      nextStage: null,
      accuracy: 0,
      avgLatencyMs: 0
    };
  }

  const last20 = recentTrialsInStage.slice(0, 20);
  const correctCount = last20.filter(t => t.isCorrect).length;
  const accuracy = correctCount / last20.length;
  const avgLatency = Math.round(last20.reduce((sum, t) => sum + t.latencyMs, 0) / last20.length);

  // Criteria: >= 85% accuracy and <= 2000ms (2.0s) average latency
  const passed = accuracy >= 0.85 && avgLatency <= 2000;
  const maxStage = KEY_STAGES.length - 1;
  const nextStage = currentStage < maxStage ? currentStage + 1 : null;

  return {
    shouldPromote: passed && nextStage !== null,
    currentStage,
    nextStage,
    accuracy: Math.round(accuracy * 100),
    avgLatencyMs: avgLatency,
    message: passed && nextStage !== null 
      ? `🎉 Key Mastery Achieved: ${KEY_STAGES[currentStage].title}`
      : undefined
  };
}
