import { 
  ChordQuality, 
  Inversion, 
  NoteLetter, 
  Accidental, 
  NotePitch, 
  Clef, 
  ChordDefinition,
  VoicingType
} from '../../types';
import { 
  transposePitch, 
  formatNoteName, 
  NOTE_LETTERS,
  noteToMidi,
  CLEF_BOUNDS
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
    displayName: 'Half-Diminished 7th (m7♭5)',
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

interface NoteWithDegree {
  note: NotePitch;
  degreeStep: number;
}

export function constructChordNotes(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  inversion: Inversion,
  rootOctave: number,
  voicing: VoicingType = 'close',
  omit5: boolean = false
): NotePitch[] {
  const formula = CHORD_FORMULAS[quality];
  const rootNote: NotePitch = { letter: root, accidental: rootAccidental, octave: rootOctave };

  // Generate root position notes paired with scale degree steps
  const rootPosNotes: NoteWithDegree[] = formula.intervals.map((semitones, idx) => {
    return {
      note: transposePitch(rootNote, semitones, formula.degreeSteps[idx]),
      degreeStep: formula.degreeSteps[idx]
    };
  });

  // Apply close inversion
  const count = rootPosNotes.length;
  let closeNotes: NoteWithDegree[];
  if (inversion === 'root') {
    closeNotes = [...rootPosNotes];
  } else if (inversion === '1st') {
    closeNotes = [
      ...rootPosNotes.slice(1),
      { ...rootPosNotes[0], note: { ...rootPosNotes[0].note, octave: rootPosNotes[0].note.octave + 1 } }
    ];
  } else if (inversion === '2nd') {
    closeNotes = [
      ...rootPosNotes.slice(2),
      { ...rootPosNotes[0], note: { ...rootPosNotes[0].note, octave: rootPosNotes[0].note.octave + 1 } },
      { ...rootPosNotes[1], note: { ...rootPosNotes[1].note, octave: rootPosNotes[1].note.octave + 1 } }
    ];
  } else if (inversion === '3rd' && count >= 4) {
    closeNotes = [
      ...rootPosNotes.slice(3),
      { ...rootPosNotes[0], note: { ...rootPosNotes[0].note, octave: rootPosNotes[0].note.octave + 1 } },
      { ...rootPosNotes[1], note: { ...rootPosNotes[1].note, octave: rootPosNotes[1].note.octave + 1 } },
      { ...rootPosNotes[2], note: { ...rootPosNotes[2].note, octave: rootPosNotes[2].note.octave + 1 } }
    ];
  } else {
    closeNotes = [...rootPosNotes];
  }

  let spreadNotes: NoteWithDegree[] = closeNotes;

  // Open / Spread Voicings for 4-note collections
  // closeNotes: [N0 (bass), N1 (tenor), N2 (alto), N3 (soprano)]
  if (closeNotes.length >= 4) {
    if (voicing === 'drop2') {
      // Drop 2nd voice from top (alto = index 2) down 1 octave
      const droppedN2: NoteWithDegree = {
        ...closeNotes[2],
        note: { ...closeNotes[2].note, octave: closeNotes[2].note.octave - 1 }
      };
      spreadNotes = [droppedN2, closeNotes[0], closeNotes[1], closeNotes[3]];
    } else if (voicing === 'drop3') {
      // Drop 3rd voice from top (tenor = index 1) down 1 octave
      const droppedN1: NoteWithDegree = {
        ...closeNotes[1],
        note: { ...closeNotes[1].note, octave: closeNotes[1].note.octave - 1 }
      };
      spreadNotes = [droppedN1, closeNotes[0], closeNotes[2], closeNotes[3]];
    }
  }

  // If omit5 is requested, omit the 5th scale degree (degreeStep === 4)
  if (omit5 && formula.degreeSteps.includes(4)) {
    spreadNotes = spreadNotes.filter(n => n.degreeStep !== 4);
  }

  return spreadNotes.map(n => n.note);
}

export function getValidOctavesForChord(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  inversion: Inversion,
  clef: Clef,
  voicing: VoicingType = 'close',
  omit5: boolean = false
): number[] {
  const candidateOctaves = clef === 'bass' ? [2, 3] : (clef === 'treble' ? [3, 4, 5] : [2, 3, 4, 5]);
  const bounds = CLEF_BOUNDS[clef] || CLEF_BOUNDS.treble;
  const validOctaves: number[] = [];

  for (const oct of candidateOctaves) {
    const notes = constructChordNotes(root, rootAccidental, quality, inversion, oct, voicing, omit5);
    const inBounds = notes.every(n => {
      const midi = noteToMidi(n);
      return midi >= bounds.minMidi && midi <= bounds.maxMidi;
    });
    if (inBounds) {
      validOctaves.push(oct);
    }
  }

  if (validOctaves.length === 0) {
    // Find octave with minimum boundary overflow
    let bestOct = candidateOctaves[0];
    let minOverflow = Infinity;
    for (const oct of candidateOctaves) {
      const notes = constructChordNotes(root, rootAccidental, quality, inversion, oct, voicing, omit5);
      const overflow = notes.reduce((sum, n) => {
        const midi = noteToMidi(n);
        if (midi < bounds.minMidi) return sum + (bounds.minMidi - midi);
        if (midi > bounds.maxMidi) return sum + (midi - bounds.maxMidi);
        return sum;
      }, 0);
      if (overflow < minOverflow) {
        minOverflow = overflow;
        bestOct = oct;
      }
    }
    validOctaves.push(bestOct);
  }

  return validOctaves;
}

export function formatInversionName(inversion: Inversion, style: 'short' | 'full' = 'short'): string {
  if (style === 'full') {
    return inversion === 'root' ? 'Root Position' : `${inversion} Inversion`;
  }
  return inversion === 'root' ? 'Root Pos' : `${inversion} Inv`;
}

export function buildChord(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  inversion: Inversion,
  clef: Clef,
  tier: number,
  octave?: number,
  voicing?: VoicingType,
  omit5?: boolean
): ChordDefinition {
  const formula = CHORD_FORMULAS[quality];
  const tierConfig = CHORD_TIERS[tier];
  const effectiveVoicing: VoicingType = voicing || tierConfig?.voicing || 'close';
  const effectiveOmit5 = omit5 !== undefined ? omit5 : false;

  const validOctaves = getValidOctavesForChord(root, rootAccidental, quality, inversion, clef, effectiveVoicing, effectiveOmit5);
  const chosenOctave = octave !== undefined
    ? octave
    : validOctaves[Math.floor(Math.random() * validOctaves.length)];

  const invertedNotes = constructChordNotes(root, rootAccidental, quality, inversion, chosenOctave, effectiveVoicing, effectiveOmit5);

  const rootName = formatNoteName(root, rootAccidental);
  let displayName: string;
  if (effectiveVoicing === 'drop2') {
    displayName = effectiveOmit5
      ? `${rootName}${formula.shortName} (Drop-2, omit 5)`
      : `${rootName}${formula.shortName} (Drop-2)`;
  } else if (effectiveVoicing === 'drop3') {
    displayName = effectiveOmit5
      ? `${rootName}${formula.shortName} (Drop-3, omit 5)`
      : `${rootName}${formula.shortName} (Drop-3)`;
  } else {
    const invStr = formatInversionName(inversion, 'short');
    displayName = effectiveOmit5
      ? `${rootName}${formula.shortName} (${invStr}, omit 5)`
      : `${rootName}${formula.shortName} (${invStr})`;
  }

  const id = `${rootName}_${quality.toUpperCase()}_${inversion.toUpperCase()}_${effectiveVoicing.toUpperCase()}${effectiveOmit5 ? '_OMIT5' : ''}_${clef.toUpperCase()}`;

  return {
    id,
    root,
    rootAccidental,
    quality,
    inversion,
    notes: invertedNotes,
    clef,
    tier,
    displayName,
    voicing: effectiveVoicing,
    omit5: effectiveOmit5
  };
}

export interface TierConfig {
  tier: number;
  title: string;
  description: string;
  qualities: ChordQuality[];
  inversions: Inversion[];
  accidentals: Accidental[];
  voicing?: VoicingType;
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
    description: 'Dominant 7th, Major 7th, Minor 7th, and Half-Diminished (ø7 / m7♭5) in root position',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['root'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'close'
  },
  3.2: {
    tier: 3.2,
    title: '7th Chords (1st Inversion)',
    description: '6/5 7th inversions (identifying top 2nd clash where top note is Root)',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['1st'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'close'
  },
  3.3: {
    tier: 3.3,
    title: '7th Chords (2nd Inversion)',
    description: '4/3 7th inversions (identifying middle 2nd clash)',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['2nd'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'close'
  },
  3.4: {
    tier: 3.4,
    title: '7th Chords (3rd Inversion)',
    description: '4/2 7th inversions (identifying bottom 2nd clash)',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['3rd'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'close'
  },
  3.5: {
    tier: 3.5,
    title: '7th Inversion Mastery',
    description: 'Mixed Close 7th Chords across Root, 1st, 2nd, and 3rd Inversions',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['root', '1st', '2nd', '3rd'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'close'
  },
  3.6: {
    tier: 3.6,
    title: 'Drop-2 Voicings',
    description: 'Open 4-part voicings (2nd voice from top dropped an octave)',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['root', '1st', '2nd', '3rd'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'drop2'
  },
  3.7: {
    tier: 3.7,
    title: 'Drop-3 Voicings',
    description: 'Wide open voicings (3rd voice from top dropped an octave)',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7'],
    inversions: ['root', '1st', '2nd', '3rd'],
    accidentals: ['natural', 'sharp', 'flat'],
    voicing: 'drop3'
  },
  3.8: {
    tier: 3.8,
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

export function getValidRootsForQuality(quality: ChordQuality, tier: number, clef: Clef = 'treble'): { root: NoteLetter, accidental: Accidental }[] {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  const candidates: { root: NoteLetter, accidental: Accidental }[] = [];
  
  for (const root of NOTE_LETTERS) {
    for (const accidental of config.accidentals) {
      const chord = buildChord(root, accidental, quality, 'root', clef, tier);
      if (tier < 3.0) {
        // For basic triads (Tiers 1 & 2), maintain standard single-accidental notation
        const hasDouble = chord.notes.some(n => n.accidental === 'double_sharp' || n.accidental === 'double_flat');
        if (!hasDouble) {
          candidates.push({ root, accidental });
        }
      } else {
        // For advanced/7th tiers, allow double accidentals (like C°7)
        candidates.push({ root, accidental });
      }
    }
  }

  // Fallback if empty
  return candidates.length > 0 ? candidates : [{ root: 'C', accidental: 'natural' }];
}

export function generateRandomChordForTier(tier: number, clef: Clef): ChordDefinition {
  const config = CHORD_TIERS[tier] || CHORD_TIERS[1.1];
  
  const quality = config.qualities[Math.floor(Math.random() * config.qualities.length)];
  const inversion = config.inversions[Math.floor(Math.random() * config.inversions.length)];
  const validRoots = getValidRootsForQuality(quality, tier, clef);
  const picked = validRoots[Math.floor(Math.random() * validRoots.length)];

  const isDropVoicing = config.voicing === 'drop2' || config.voicing === 'drop3';
  // Blend in omit 5 for ~45% of drop voicings on qualities that have a standard 5th (maj7, dom7, min7)
  const canOmit5 = isDropVoicing && (quality === 'maj7' || quality === 'dom7' || quality === 'min7');
  const omit5 = canOmit5 && Math.random() < 0.45;

  return buildChord(picked.root, picked.accidental, quality, inversion, clef, tier, undefined, undefined, omit5);
}

/**
 * Builds a chord aligned in octave register with a target chord for accurate side-by-side diff.
 */
export function alignChordToTargetOctave(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  inversion: Inversion,
  clef: Clef,
  tier: number,
  targetChord: ChordDefinition
): ChordDefinition {
  const voicing = targetChord.voicing || 'close';
  const omit5 = targetChord.omit5 || false;
  const validOctaves = getValidOctavesForChord(root, rootAccidental, quality, inversion, clef, voicing, omit5);
  if (validOctaves.length === 1) {
    const chord = buildChord(root, rootAccidental, quality, inversion, clef, tier, validOctaves[0], voicing, omit5);
    if (targetChord.keySignature) chord.keySignature = targetChord.keySignature;
    return chord;
  }

  const targetNotes = targetChord.notes;
  const targetLowestMidi = noteToMidi(targetNotes[0]);
  const targetHighestMidi = noteToMidi(targetNotes[targetNotes.length - 1]);
  const targetCenterMidi = (targetLowestMidi + targetHighestMidi) / 2;

  let bestOctave = validOctaves[0];
  let minScore = Infinity;

  for (const oct of validOctaves) {
    const candidateNotes = constructChordNotes(root, rootAccidental, quality, inversion, oct, voicing, omit5);
    const candidateLowestMidi = noteToMidi(candidateNotes[0]);
    const candidateHighestMidi = noteToMidi(candidateNotes[candidateNotes.length - 1]);
    const candidateCenterMidi = (candidateLowestMidi + candidateHighestMidi) / 2;

    const lowestDiff = Math.abs(candidateLowestMidi - targetLowestMidi);
    const centerDiff = Math.abs(candidateCenterMidi - targetCenterMidi);
    const score = lowestDiff + centerDiff;

    if (score < minScore) {
      minScore = score;
      bestOctave = oct;
    }
  }

  const alignedChord = buildChord(root, rootAccidental, quality, inversion, clef, tier, bestOctave, voicing, omit5);
  if (targetChord.keySignature) {
    alignedChord.keySignature = targetChord.keySignature;
  }
  return alignedChord;
}

