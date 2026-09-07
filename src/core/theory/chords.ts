import { 
  ChordQuality, 
  Inversion, 
  NoteLetter, 
  Accidental, 
  NotePitch, 
  Clef, 
  ChordDefinition 
} from '../../types';
import { 
  transposePitch, 
  getDefaultRootOctave, 
  formatNoteName, 
  NOTE_LETTERS 
} from './notes';

export interface ChordFormula {
  quality: ChordQuality;
  displayName: string;
  shortName: string;
  intervals: number[]; // Semitone intervals from root
  degreeSteps: number[]; // Scale degree steps from root (0=root, 2=3rd, 4=5th, 6=7th, etc.)
  maxInversion: Inversion;
  category: 'triad' | 'altered_triad' | 'seventh' | 'extension';
}

export const CHORD_FORMULAS: Record<ChordQuality, ChordFormula> = {
  major: {
    quality: 'major',
    displayName: 'Major',
    shortName: 'Maj',
    intervals: [0, 4, 7],
    degreeSteps: [0, 2, 4],
    maxInversion: '2nd',
    category: 'triad'
  },
  minor: {
    quality: 'minor',
    displayName: 'Minor',
    shortName: 'm',
    intervals: [0, 3, 7],
    degreeSteps: [0, 2, 4],
    maxInversion: '2nd',
    category: 'triad'
  },
  diminished: {
    quality: 'diminished',
    displayName: 'Diminished',
    shortName: 'dim',
    intervals: [0, 3, 6],
    degreeSteps: [0, 2, 4],
    maxInversion: '2nd',
    category: 'altered_triad'
  },
  augmented: {
    quality: 'augmented',
    displayName: 'Augmented',
    shortName: 'aug',
    intervals: [0, 4, 8],
    degreeSteps: [0, 2, 4],
    maxInversion: '2nd',
    category: 'altered_triad'
  },
  sus4: {
    quality: 'sus4',
    displayName: 'Suspended 4th',
    shortName: 'sus4',
    intervals: [0, 5, 7],
    degreeSteps: [0, 3, 4],
    maxInversion: '2nd',
    category: 'altered_triad'
  },
  sus2: {
    quality: 'sus2',
    displayName: 'Suspended 2nd',
    shortName: 'sus2',
    intervals: [0, 2, 7],
    degreeSteps: [0, 1, 4],
    maxInversion: '2nd',
    category: 'altered_triad'
  },
  dom7: {
    quality: 'dom7',
    displayName: 'Dominant 7th',
    shortName: '7',
    intervals: [0, 4, 7, 10],
    degreeSteps: [0, 2, 4, 6],
    maxInversion: '3rd',
    category: 'seventh'
  },
  maj7: {
    quality: 'maj7',
    displayName: 'Major 7th',
    shortName: 'Maj7',
    intervals: [0, 4, 7, 11],
    degreeSteps: [0, 2, 4, 6],
    maxInversion: '3rd',
    category: 'seventh'
  },
  min7: {
    quality: 'min7',
    displayName: 'Minor 7th',
    shortName: 'm7',
    intervals: [0, 3, 7, 10],
    degreeSteps: [0, 2, 4, 6],
    maxInversion: '3rd',
    category: 'seventh'
  },
  half_dim7: {
    quality: 'half_dim7',
    displayName: 'Half-Diminished 7th',
    shortName: 'ø7',
    intervals: [0, 3, 6, 10],
    degreeSteps: [0, 2, 4, 6],
    maxInversion: '3rd',
    category: 'seventh'
  },
  dim7: {
    quality: 'dim7',
    displayName: 'Diminished 7th',
    shortName: '°7',
    intervals: [0, 3, 6, 9],
    degreeSteps: [0, 2, 4, 6],
    maxInversion: '3rd',
    category: 'seventh'
  },
  add9: {
    quality: 'add9',
    displayName: 'Add 9',
    shortName: 'add9',
    intervals: [0, 4, 7, 14],
    degreeSteps: [0, 2, 4, 8],
    maxInversion: 'root',
    category: 'extension'
  },
  '6': {
    quality: '6',
    displayName: 'Major 6th',
    shortName: '6',
    intervals: [0, 4, 7, 9],
    degreeSteps: [0, 2, 4, 5],
    maxInversion: 'root',
    category: 'extension'
  },
  m6: {
    quality: 'm6',
    displayName: 'Minor 6th',
    shortName: 'm6',
    intervals: [0, 3, 7, 9],
    degreeSteps: [0, 2, 4, 5],
    maxInversion: 'root',
    category: 'extension'
  },
  '9': {
    quality: '9',
    displayName: 'Dominant 9th',
    shortName: '9',
    intervals: [0, 4, 7, 10, 14],
    degreeSteps: [0, 2, 4, 6, 8],
    maxInversion: 'root',
    category: 'extension'
  },
  '7s9': {
    quality: '7s9',
    displayName: '7th (Sharp 9)',
    shortName: '7♯9',
    intervals: [0, 4, 7, 10, 15],
    degreeSteps: [0, 2, 4, 6, 8],
    maxInversion: 'root',
    category: 'extension'
  },
  '7b9': {
    quality: '7b9',
    displayName: '7th (Flat 9)',
    shortName: '7♭9',
    intervals: [0, 4, 7, 10, 13],
    degreeSteps: [0, 2, 4, 6, 8],
    maxInversion: 'root',
    category: 'extension'
  }
};

export function buildChord(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  inversion: Inversion,
  clef: Clef,
  tier: number
): ChordDefinition {
  const formula = CHORD_FORMULAS[quality];
  const baseOctave = getDefaultRootOctave(clef, root);
  const rootNote: NotePitch = { letter: root, accidental: rootAccidental, octave: baseOctave };

  // Generate root position notes
  const rootPosNotes: NotePitch[] = formula.intervals.map((semitones, idx) => {
    return transposePitch(rootNote, semitones, formula.degreeSteps[idx]);
  });

  // Apply inversion
  let invertedNotes: NotePitch[] = [];
  const count = rootPosNotes.length;

  if (inversion === 'root') {
    invertedNotes = [...rootPosNotes];
  } else if (inversion === '1st') {
    // Note 0 goes up 1 octave, rest stay
    invertedNotes = [
      ...rootPosNotes.slice(1),
      { ...rootPosNotes[0], octave: rootPosNotes[0].octave + 1 }
    ];
  } else if (inversion === '2nd') {
    // Note 0 & 1 go up 1 octave
    invertedNotes = [
      ...rootPosNotes.slice(2),
      { ...rootPosNotes[0], octave: rootPosNotes[0].octave + 1 },
      { ...rootPosNotes[1], octave: rootPosNotes[1].octave + 1 }
    ];
  } else if (inversion === '3rd' && count >= 4) {
    // Note 0, 1, 2 go up 1 octave
    invertedNotes = [
      ...rootPosNotes.slice(3),
      { ...rootPosNotes[0], octave: rootPosNotes[0].octave + 1 },
      { ...rootPosNotes[1], octave: rootPosNotes[1].octave + 1 },
      { ...rootPosNotes[2], octave: rootPosNotes[2].octave + 1 }
    ];
  } else {
    invertedNotes = [...rootPosNotes];
  }

  // Adjust overall chord octave if notes drift too high or low on the staff
  const lowestOctave = Math.min(...invertedNotes.map(n => n.octave));
  if (clef === 'treble' && lowestOctave > 5) {
    invertedNotes = invertedNotes.map(n => ({ ...n, octave: n.octave - 1 }));
  } else if (clef === 'bass' && lowestOctave > 3) {
    invertedNotes = invertedNotes.map(n => ({ ...n, octave: n.octave - 1 }));
  }

  const rootName = formatNoteName(root, rootAccidental);
  const invStr = inversion === 'root' ? 'Root Pos' : `${inversion} Inv`;
  const displayName = `${rootName}${formula.shortName} (${invStr})`;
  const id = `${rootName}_${quality.toUpperCase()}_${inversion.toUpperCase()}_${clef.toUpperCase()}`;

  return {
    id,
    root,
    rootAccidental,
    quality,
    inversion,
    notes: invertedNotes,
    clef,
    tier,
    displayName
  };
}

export interface TierConfig {
  tier: number;
  title: string;
  description: string;
  qualities: ChordQuality[];
  inversions: Inversion[];
  accidentals: Accidental[];
}

export const CHORD_TIERS: Record<number, TierConfig> = {
  1.1: {
    tier: 1.1,
    title: 'Triads (Root Position)',
    description: 'Major and Minor triads in root position ("Snowman" shapes)',
    qualities: ['major', 'minor'],
    inversions: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  1.2: {
    tier: 1.2,
    title: 'Triads (1st Inversion)',
    description: '1st Inversion (6/3) triads with top 4th gap',
    qualities: ['major', 'minor'],
    inversions: ['1st'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  1.3: {
    tier: 1.3,
    title: 'Triads (2nd Inversion)',
    description: '2nd Inversion (6/4) triads with bottom 4th gap',
    qualities: ['major', 'minor'],
    inversions: ['2nd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  1.4: {
    tier: 1.4,
    title: 'Triad Mastery',
    description: 'Mixed Root, 1st, and 2nd Inversion Major & Minor Triads',
    qualities: ['major', 'minor'],
    inversions: ['root', '1st', '2nd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  2.1: {
    tier: 2.1,
    title: 'Altered Triads (Dim & Aug)',
    description: 'Diminished and Augmented triads across all inversions',
    qualities: ['diminished', 'augmented'],
    inversions: ['root', '1st', '2nd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  2.2: {
    tier: 2.2,
    title: 'Suspended Chords (Sus4 & Sus2)',
    description: 'Sus4 and Sus2 chords (spotting 2nd/4th step clashes)',
    qualities: ['sus4', 'sus2'],
    inversions: ['root', '1st', '2nd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.1: {
    tier: 3.1,
    title: '7th Chords (Root Position)',
    description: 'Dominant 7th, Major 7th, Minor 7th (4-tier towers)',
    qualities: ['dom7', 'maj7', 'min7'],
    inversions: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.2: {
    tier: 3.2,
    title: '7th Chord Inversions',
    description: '7th chord inversions (6/5, 4/3, 4/2) using the 2nd clash rule',
    qualities: ['dom7', 'maj7', 'min7'],
    inversions: ['1st', '2nd', '3rd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.3: {
    tier: 3.3,
    title: 'Diminished 7ths (ø7 & °7)',
    description: 'Half-Diminished and Fully Diminished 7th chords',
    qualities: ['half_dim7', 'dim7'],
    inversions: ['root', '1st', '2nd', '3rd'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  4.1: {
    tier: 4.1,
    title: 'Added Tone & 6th Chords',
    description: 'Add9, 6th, and Minor 6th chords',
    qualities: ['add9', '6', 'm6'],
    inversions: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  4.2: {
    tier: 4.2,
    title: 'Compound & Altered Chords',
    description: '9th, 7♯9, and 7♭9 altered chords',
    qualities: ['9', '7s9', '7b9'],
    inversions: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  }
};

export function generateRandomChordForTier(tier: number, clef: Clef): ChordDefinition {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  
  const root = NOTE_LETTERS[Math.floor(Math.random() * NOTE_LETTERS.length)];
  const rootAccidental = config.accidentals[Math.floor(Math.random() * config.accidentals.length)];
  const quality = config.qualities[Math.floor(Math.random() * config.qualities.length)];
  const inversion = config.inversions[Math.floor(Math.random() * config.inversions.length)];

  return buildChord(root, rootAccidental, quality, inversion, clef, tier);
}
