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
    description: 'Natural Keys (0 Sharps / Flats)',
    keys: ['C', 'Am']
  },
  {
    stage: 1,
    title: 'Stage 1: Step One',
    description: '1 Sharp or 1 Flat (G Maj, F Maj, E Min, D Min)',
    keys: ['G', 'F', 'Em', 'Dm']
  },
  {
    stage: 2,
    title: 'Stage 2: Intermediate',
    description: '2 Sharps or 2 Flats (D Maj, B♭ Maj, B Min, G Min)',
    keys: ['D', 'Bb', 'Bm', 'Gm']
  },
  {
    stage: 3,
    title: 'Stage 3: Advanced',
    description: '3–4 Sharps & Flats (A, E♭, E, A♭ Maj & relatives)',
    keys: ['A', 'Eb', 'E', 'Ab', 'F#m', 'Cm', 'C#m', 'Fm']
  },
  {
    stage: 4,
    title: 'Stage 4: Circle Mastery',
    description: '5–7 Sharps & Flats (B, D♭, F♯, G♭, C♯, C♭ & relatives)',
    keys: ['B', 'Db', 'F#', 'Gb', 'C#', 'Cb', 'G#m', 'Bbm', 'D#m', 'Ebm', 'A#m', 'Abm']
  }
];

export const KEY_SIGNATURES: Record<string, KeySignatureDefinition> = {
  // --- Stage 0: 0 Accidentals ---
  C: {
    id: 'C',
    name: 'C Major',
    vexKey: 'C',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 0,
    stage: 0,
    accidentals: {}
  },
  Am: {
    id: 'Am',
    name: 'A Minor',
    vexKey: 'Am',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 0,
    stage: 0,
    accidentals: {}
  },

  // --- Stage 1: 1 Accidental ---
  G: {
    id: 'G',
    name: 'G Major',
    vexKey: 'G',
    mode: 'major',
    sharpsCount: 1,
    flatsCount: 0,
    stage: 1,
    accidentals: { F: 'sharp' }
  },
  Em: {
    id: 'Em',
    name: 'E Minor',
    vexKey: 'Em',
    mode: 'minor',
    sharpsCount: 1,
    flatsCount: 0,
    stage: 1,
    accidentals: { F: 'sharp' }
  },
  F: {
    id: 'F',
    name: 'F Major',
    vexKey: 'F',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 1,
    stage: 1,
    accidentals: { B: 'flat' }
  },
  Dm: {
    id: 'Dm',
    name: 'D Minor',
    vexKey: 'Dm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 1,
    stage: 1,
    accidentals: { B: 'flat' }
  },

  // --- Stage 2: 2 Accidentals ---
  D: {
    id: 'D',
    name: 'D Major',
    vexKey: 'D',
    mode: 'major',
    sharpsCount: 2,
    flatsCount: 0,
    stage: 2,
    accidentals: { F: 'sharp', C: 'sharp' }
  },
  Bm: {
    id: 'Bm',
    name: 'B Minor',
    vexKey: 'Bm',
    mode: 'minor',
    sharpsCount: 2,
    flatsCount: 0,
    stage: 2,
    accidentals: { F: 'sharp', C: 'sharp' }
  },
  Bb: {
    id: 'Bb',
    name: 'B♭ Major',
    vexKey: 'Bb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 2,
    stage: 2,
    accidentals: { B: 'flat', E: 'flat' }
  },
  Gm: {
    id: 'Gm',
    name: 'G Minor',
    vexKey: 'Gm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 2,
    stage: 2,
    accidentals: { B: 'flat', E: 'flat' }
  },

  // --- Stage 3: 3–4 Accidentals ---
  A: {
    id: 'A',
    name: 'A Major',
    vexKey: 'A',
    mode: 'major',
    sharpsCount: 3,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp' }
  },
  'F#m': {
    id: 'F#m',
    name: 'F♯ Minor',
    vexKey: 'F#m',
    mode: 'minor',
    sharpsCount: 3,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp' }
  },
  Eb: {
    id: 'Eb',
    name: 'E♭ Major',
    vexKey: 'Eb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 3,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat' }
  },
  Cm: {
    id: 'Cm',
    name: 'C Minor',
    vexKey: 'Cm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 3,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat' }
  },
  E: {
    id: 'E',
    name: 'E Major',
    vexKey: 'E',
    mode: 'major',
    sharpsCount: 4,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp' }
  },
  'C#m': {
    id: 'C#m',
    name: 'C♯ Minor',
    vexKey: 'C#m',
    mode: 'minor',
    sharpsCount: 4,
    flatsCount: 0,
    stage: 3,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp' }
  },
  Ab: {
    id: 'Ab',
    name: 'A♭ Major',
    vexKey: 'Ab',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 4,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat' }
  },
  Fm: {
    id: 'Fm',
    name: 'F Minor',
    vexKey: 'Fm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 4,
    stage: 3,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat' }
  },

  // --- Stage 4: 5–7 Accidentals ---
  B: {
    id: 'B',
    name: 'B Major',
    vexKey: 'B',
    mode: 'major',
    sharpsCount: 5,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp' }
  },
  'G#m': {
    id: 'G#m',
    name: 'G♯ Minor',
    vexKey: 'G#m',
    mode: 'minor',
    sharpsCount: 5,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp' }
  },
  Db: {
    id: 'Db',
    name: 'D♭ Major',
    vexKey: 'Db',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 5,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat' }
  },
  Bbm: {
    id: 'Bbm',
    name: 'B♭ Minor',
    vexKey: 'Bbm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 5,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat' }
  },
  'F#': {
    id: 'F#',
    name: 'F♯ Major',
    vexKey: 'F#',
    mode: 'major',
    sharpsCount: 6,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp' }
  },
  'D#m': {
    id: 'D#m',
    name: 'D♯ Minor',
    vexKey: 'D#m',
    mode: 'minor',
    sharpsCount: 6,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp' }
  },
  Gb: {
    id: 'Gb',
    name: 'G♭ Major',
    vexKey: 'Gb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 6,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat' }
  },
  Ebm: {
    id: 'Ebm',
    name: 'E♭ Minor',
    vexKey: 'Ebm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 6,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat' }
  },
  'C#': {
    id: 'C#',
    name: 'C♯ Major',
    vexKey: 'C#',
    mode: 'major',
    sharpsCount: 7,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp', B: 'sharp' }
  },
  'A#m': {
    id: 'A#m',
    name: 'A♯ Minor',
    vexKey: 'A#m',
    mode: 'minor',
    sharpsCount: 7,
    flatsCount: 0,
    stage: 4,
    accidentals: { F: 'sharp', C: 'sharp', G: 'sharp', D: 'sharp', A: 'sharp', E: 'sharp', B: 'sharp' }
  },
  Cb: {
    id: 'Cb',
    name: 'C♭ Major',
    vexKey: 'Cb',
    mode: 'major',
    sharpsCount: 0,
    flatsCount: 7,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat', F: 'flat' }
  },
  Abm: {
    id: 'Abm',
    name: 'A♭ Minor',
    vexKey: 'Abm',
    mode: 'minor',
    sharpsCount: 0,
    flatsCount: 7,
    stage: 4,
    accidentals: { B: 'flat', E: 'flat', A: 'flat', D: 'flat', G: 'flat', C: 'flat', F: 'flat' }
  }
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
