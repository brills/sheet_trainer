import { 
  KeySignatureDefinition, 
  NoteLetter, 
  Accidental, 
  NotePitch, 
  Clef, 
  ChordDefinition, 
  ArpeggioDefinition,
  ChordQuality
} from '../../types';

export type { KeySignatureDefinition };
import { NOTE_LETTERS } from './notes';
import { buildChord, CHORD_TIERS } from './chords';
import { buildArpeggio, ARPEGGIO_TIERS } from './arpeggios';

export interface KeyStageInfo {
  stage: number;
  title: string;
  description: string;
  keys: string[]; // key ids
}

export const KEY_STAGES: KeyStageInfo[] = [
  {
    stage: 0,
    title: 'Stage 0: Foundation',
    description: 'Natural Keys (0 Accidentals)',
    keys: ['C']
  },
  {
    stage: 1,
    title: 'Stage 1: Step One',
    description: '1 Sharp or 1 Flat (G / Em, F / Dm)',
    keys: ['G', 'F']
  },
  {
    stage: 2,
    title: 'Stage 2: Intermediate',
    description: '2 Sharps or 2 Flats (D / Bm, B♭ / Gm)',
    keys: ['D', 'Bb']
  },
  {
    stage: 3,
    title: 'Stage 3: Advanced',
    description: '3–4 Sharps & Flats (A / F♯m, E♭ / Cm, E / C♯m, A♭ / Fm)',
    keys: ['A', 'Eb', 'E', 'Ab']
  },
  {
    stage: 4,
    title: 'Stage 4: Circle Mastery',
    description: '5–7 Sharps & Flats (B, D♭, F♯, G♭, C♯, C♭ & relatives)',
    keys: ['B', 'Db', 'F#', 'Gb', 'C#', 'Cb']
  }
];

const PRIMARY_KEY_SIGNATURES: Record<string, KeySignatureDefinition> = {
  // --- Stage 0: 0 Accidentals ---
  C: {
    id: 'C',
    name: 'C / Am',
    vexKey: 'C',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 0,
    stage: 0,
    accidentals: {}
  },

  // --- Stage 1: 1 Accidental ---
  G: {
    id: 'G',
    name: 'G / Em',
    vexKey: 'G',
    mode: 'major',
    sharpsCount: 1,
    flatsCount: 0,
    stage: 1,
    accidentals: { F: 'sharp' }
  },
  F: {
    id: 'F',
    name: 'F / Dm',
    vexKey: 'F',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 1,
    stage: 1,
    accidentals: { B: 'flat' }
  },

  // --- Stage 2: 2 Accidentals ---
  D: {
    id: 'D',
    name: 'D / Bm',
    vexKey: 'D',
    mode: 'major',
    sharpsCount: 2,
    flatsCount: 0,
    stage: 2,
    accidentals: { F: 'sharp', C: 'sharp' }
  },
  Bb: {
    id: 'Bb',
    name: 'B♭ / Gm',
    vexKey: 'Bb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 2,
    stage: 2,
    accidentals: { B: 'flat', E: 'flat' }
  },

  // --- Stage 3: 3–4 Accidentals ---
  A: {
    id: 'A',
    name: 'A / F♯m',
    vexKey: 'A',
    mode: 'major',
    sharpsCount: 3,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp' }
  },
  Eb: {
    id: 'Eb',
    name: 'E♭ / Cm',
    vexKey: 'Eb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 3,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat' }
  },
  E: {
    id: 'E',
    name: 'E / C♯m',
    vexKey: 'E',
    mode: 'major',
    sharpsCount: 4,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp' }
  },
  Ab: {
    id: 'Ab',
    name: 'A♭ / Fm',
    vexKey: 'Ab',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 4,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat' }
  },

  // --- Stage 4: 5–7 Accidentals ---
  B: {
    id: 'B',
    name: 'B / G♯m',
    vexKey: 'B',
    mode: 'major',
    sharpsCount: 5,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp' }
  },
  Db: {
    id: 'Db',
    name: 'D♭ / B♭m',
    vexKey: 'Db',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 5,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat' }
  },
  'F#': {
    id: 'F#',
    name: 'F♯ / D♯m',
    vexKey: 'F#',
    mode: 'major',
    sharpsCount: 6,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp' }
  },
  Gb: {
    id: 'Gb',
    name: 'G♭ / E♭m',
    vexKey: 'Gb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 6,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat' }
  },
  'C#': {
    id: 'C#',
    name: 'C♯ / A♯m',
    vexKey: 'C#',
    mode: 'major',
    sharpsCount: 7,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp', B: 'sharp' }
  },
  Cb: {
    id: 'Cb',
    name: 'C♭ / A♭m',
    vexKey: 'Cb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 7,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat', F: 'flat' }
  }
};

// Aliases for relative minors and alternate ids to guarantee backward compatibility
export const KEY_SIGNATURES: Record<string, KeySignatureDefinition> = {
  ...PRIMARY_KEY_SIGNATURES,
  Am: PRIMARY_KEY_SIGNATURES.C,
  Em: PRIMARY_KEY_SIGNATURES.G,
  Dm: PRIMARY_KEY_SIGNATURES.F,
  Bm: PRIMARY_KEY_SIGNATURES.D,
  Gm: PRIMARY_KEY_SIGNATURES.Bb,
  'F#m': PRIMARY_KEY_SIGNATURES.A,
  Cm: PRIMARY_KEY_SIGNATURES.Eb,
  'C#m': PRIMARY_KEY_SIGNATURES.E,
  Fm: PRIMARY_KEY_SIGNATURES.Ab,
  'G#m': PRIMARY_KEY_SIGNATURES.B,
  Bbm: PRIMARY_KEY_SIGNATURES.Db,
  'D#m': PRIMARY_KEY_SIGNATURES['F#'],
  Ebm: PRIMARY_KEY_SIGNATURES.Gb,
  'A#m': PRIMARY_KEY_SIGNATURES['C#'],
  Abm: PRIMARY_KEY_SIGNATURES.Cb
};

/**
 * Returns whether a note requires an explicit visual accidental on the stave
 * when a key signature is active.
 */
export function getRequiredAccidentalForNote(
  note: NotePitch,
  keySignature?: KeySignatureDefinition
): Accidental | null {
  if (!keySignature) {
    return note.accidental === 'natural' ? null : note.accidental;
  }
  const keyAcc = keySignature.accidentals[note.letter] || 'natural';
  if (note.accidental === keyAcc) {
    return null; // Implicit in key signature, no glyph needed
  }
  return note.accidental; // Explicit glyph required (including natural)
}

interface DiatonicDegreeInfo {
  degree: number; // 0 to 6
  triadQuality: ChordQuality;
  seventhQuality: ChordQuality;
}

const MAJOR_DIATONIC_DEGREES: DiatonicDegreeInfo[] = [
  { degree: 0, triadQuality: 'major', seventhQuality: 'maj7' },      // I
  { degree: 1, triadQuality: 'minor', seventhQuality: 'min7' },      // ii
  { degree: 2, triadQuality: 'minor', seventhQuality: 'min7' },      // iii
  { degree: 3, triadQuality: 'major', seventhQuality: 'maj7' },      // IV
  { degree: 4, triadQuality: 'major', seventhQuality: 'dom7' },      // V
  { degree: 5, triadQuality: 'minor', seventhQuality: 'min7' },      // vi
  { degree: 6, triadQuality: 'diminished', seventhQuality: 'half_dim7' } // vii°
];

const MINOR_DIATONIC_DEGREES: DiatonicDegreeInfo[] = [
  { degree: 0, triadQuality: 'minor', seventhQuality: 'min7' },      // i
  { degree: 1, triadQuality: 'diminished', seventhQuality: 'half_dim7' }, // ii°
  { degree: 2, triadQuality: 'major', seventhQuality: 'maj7' },      // III
  { degree: 3, triadQuality: 'minor', seventhQuality: 'min7' },      // iv
  { degree: 4, triadQuality: 'minor', seventhQuality: 'min7' },      // v
  { degree: 5, triadQuality: 'major', seventhQuality: 'maj7' },      // VI
  { degree: 6, triadQuality: 'major', seventhQuality: 'dom7' }       // VII
];

/**
 * Generates diatonic chord definitions for the specified Key and Tier.
 */
export function getDiatonicChordsForKey(
  key: KeySignatureDefinition,
  tier: number,
  clef: Clef
): ChordDefinition[] {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  const degrees = key.mode === 'major' ? MAJOR_DIATONIC_DEGREES : MINOR_DIATONIC_DEGREES;
  
  const tonicLetter = key.id.charAt(0) as NoteLetter;
  const tonicIndex = NOTE_LETTERS.indexOf(tonicLetter);
  const chords: ChordDefinition[] = [];

  for (const d of degrees) {
    const rootIndex = (tonicIndex + d.degree) % 7;
    const rootLetter = NOTE_LETTERS[rootIndex];
    const rootAccidental = key.accidentals[rootLetter] || 'natural';

    const targetQualities = config.qualities.filter(q => 
      q === d.triadQuality || q === d.seventhQuality
    );

    for (const quality of targetQualities) {
      for (const inversion of config.inversions) {
        const chord = buildChord(rootLetter, rootAccidental, quality, inversion, clef, tier);
        chord.keySignature = key;
        chords.push(chord);

        const isDrop = config.voicing === 'drop2' || config.voicing === 'drop3';
        if (isDrop && (quality === 'maj7' || quality === 'dom7' || quality === 'min7')) {
          const omit5Chord = buildChord(rootLetter, rootAccidental, quality, inversion, clef, tier, undefined, undefined, true);
          omit5Chord.keySignature = key;
          chords.push(omit5Chord);
        }
      }
    }
  }

  return chords;
}

/**
 * Generates diatonic arpeggio definitions for the specified Key and Tier.
 */
export function getDiatonicArpeggiosForKey(
  key: KeySignatureDefinition,
  tier: number,
  clef: Clef
): ArpeggioDefinition[] {
  const config = ARPEGGIO_TIERS[tier] || ARPEGGIO_TIERS[1.1];
  const degrees = key.mode === 'major' ? MAJOR_DIATONIC_DEGREES : MINOR_DIATONIC_DEGREES;

  const tonicLetter = key.id.charAt(0) as NoteLetter;
  const tonicIndex = NOTE_LETTERS.indexOf(tonicLetter);
  const arpeggios: ArpeggioDefinition[] = [];

  for (const d of degrees) {
    const rootIndex = (tonicIndex + d.degree) % 7;
    const rootLetter = NOTE_LETTERS[rootIndex];
    const rootAccidental = key.accidentals[rootLetter] || 'natural';

    const targetQualities = config.qualities.filter(q => 
      q === d.triadQuality || q === d.seventhQuality
    );

    for (const quality of targetQualities) {
      for (const contour of config.contours) {
        for (const startingDegree of config.startingDegrees) {
          const arp = buildArpeggio(rootLetter, rootAccidental, quality, contour, startingDegree, clef, tier);
          arp.keySignature = key;
          arpeggios.push(arp);
        }
      }
    }
  }

  return arpeggios;
}
