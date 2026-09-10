import { 
  ArpeggioContour, 
  ChordQuality, 
  NoteLetter, 
  Accidental, 
  NotePitch, 
  Clef, 
  ArpeggioDefinition 
} from '../../types';
import { 
  CHORD_FORMULAS 
} from './chords';
import { 
  transposePitch, 
  getDefaultRootOctave, 
  formatNoteName, 
  NOTE_LETTERS,
  noteToMidi,
  CLEF_BOUNDS
} from './notes';

export interface ArpeggioTierConfig {
  tier: number;
  title: string;
  description: string;
  qualities: ChordQuality[];
  contours: ArpeggioContour[];
  startingDegrees: ('root' | '3rd' | '5th')[];
  accidentals: Accidental[];
}

export const ARPEGGIO_TIERS: Record<number, ArpeggioTierConfig> = {
  1.1: {
    tier: 1.1,
    title: 'Linear Sweeps (Triads)',
    description: 'Straight ascending and descending triad runs (Major, Minor, Diminished, Augmented)',
    qualities: ['major', 'minor', 'diminished', 'augmented'],
    contours: ['ascending', 'descending'],
    startingDegrees: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  1.2: {
    tier: 1.2,
    title: 'Inversion Anchors',
    description: 'Arpeggios starting on 3rd (3-5-1) or 5th (5-1-3) across all triad qualities',
    qualities: ['major', 'minor', 'diminished', 'augmented'],
    contours: ['ascending', 'descending'],
    startingDegrees: ['3rd', '5th'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  1.3: {
    tier: 1.3,
    title: 'Arches & Alberti Figures',
    description: 'Arch contours (1-3-5-3-1) and broken Alberti bass figures (1-5-3-5) across all triad qualities',
    qualities: ['major', 'minor', 'diminished', 'augmented'],
    contours: ['arch', 'alberti'],
    startingDegrees: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  2.1: {
    tier: 2.1,
    title: 'Cross-Beaming Patterns',
    description: '3-note triad figures grouped into 4-note beam envelopes',
    qualities: ['major', 'minor', 'diminished', 'augmented'],
    contours: ['ascending', 'descending'],
    startingDegrees: ['root', '3rd', '5th'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.1: {
    tier: 3.1,
    title: '7th Chord Sweeps',
    description: '4-note 7th chord sweeps (Dom7, Maj7, Min7, ø7, °7) across the staff',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7', 'dim7'],
    contours: ['ascending', 'descending', 'arch'],
    startingDegrees: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.2: {
    tier: 3.2,
    title: '7th Inversion Sweeps',
    description: '7th chord arpeggios starting on 3rd, 5th, or 7th degrees across all 7th qualities',
    qualities: ['dom7', 'maj7', 'min7', 'half_dim7', 'dim7'],
    contours: ['ascending', 'descending'],
    startingDegrees: ['3rd', '5th'],
    accidentals: ['natural', 'sharp', 'flat']
  },
  3.3: {
    tier: 3.3,
    title: 'Diminished 7th Cascades',
    description: 'Symmetrical °7 multi-octave arpeggio ladders',
    qualities: ['dim7'],
    contours: ['ascending', 'descending', 'arch'],
    startingDegrees: ['root'],
    accidentals: ['natural', 'sharp', 'flat']
  }
};

export function constructArpeggioNotes(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  contour: ArpeggioContour,
  startingDegree: 'root' | '3rd' | '5th',
  rootOctave: number
): NotePitch[] {
  const formula = CHORD_FORMULAS[quality];
  const rootNote: NotePitch = { letter: root, accidental: rootAccidental, octave: rootOctave };

  // Generate chord tones in root position
  const chordTones: NotePitch[] = formula.intervals.map((semitones, idx) => {
    return transposePitch(rootNote, semitones, formula.degreeSteps[idx]);
  });

  // Re-order based on starting degree
  let baseTones = [...chordTones];
  if (startingDegree === '3rd' && chordTones.length >= 2) {
    baseTones = [
      chordTones[1],
      chordTones[2],
      { ...chordTones[0], octave: chordTones[0].octave + 1 }
    ];
  } else if (startingDegree === '5th' && chordTones.length >= 3) {
    baseTones = [
      chordTones[2],
      { ...chordTones[0], octave: chordTones[0].octave + 1 },
      { ...chordTones[1], octave: chordTones[1].octave + 1 }
    ];
  }

  let finalNotes: NotePitch[] = [];

  switch (contour) {
    case 'ascending':
      // Ascending: e.g. 1 -> 3 -> 5 -> 8
      finalNotes = [
        baseTones[0],
        baseTones[1],
        baseTones[2] || baseTones[1],
        { ...baseTones[0], octave: baseTones[0].octave + 1 }
      ];
      break;

    case 'descending':
      // Descending: High 8 -> 5 -> 3 -> 1
      finalNotes = [
        { ...baseTones[0], octave: baseTones[0].octave + 1 },
        baseTones[2] || baseTones[1],
        baseTones[1],
        baseTones[0]
      ];
      break;

    case 'arch':
      // Arch: 1 -> 3 -> 5 -> 3
      finalNotes = [
        baseTones[0],
        baseTones[1],
        baseTones[2] || baseTones[1],
        baseTones[1]
      ];
      break;

    case 'alberti':
      // Low -> High -> Mid -> High (1 -> 5 -> 3 -> 5)
      finalNotes = [
        baseTones[0],
        baseTones[2] || baseTones[1],
        baseTones[1],
        baseTones[2] || baseTones[1]
      ];
      break;

    case 'valley':
      // High -> Low -> Mid -> Low
      finalNotes = [
        baseTones[2] || baseTones[1],
        baseTones[0],
        baseTones[1],
        baseTones[0]
      ];
      break;
  }

  return finalNotes;
}

export function getValidOctavesForArpeggio(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  contour: ArpeggioContour,
  startingDegree: 'root' | '3rd' | '5th',
  clef: Clef
): number[] {
  const candidateOctaves = clef === 'bass' ? [2, 3] : (clef === 'treble' ? [3, 4, 5] : [2, 3, 4, 5]);
  const bounds = CLEF_BOUNDS[clef] || CLEF_BOUNDS.treble;
  const validOctaves: number[] = [];

  for (const oct of candidateOctaves) {
    const notes = constructArpeggioNotes(root, rootAccidental, quality, contour, startingDegree, oct);
    const inBounds = notes.every(n => {
      const midi = noteToMidi(n);
      return midi >= bounds.minMidi && midi <= bounds.maxMidi;
    });
    if (inBounds) {
      validOctaves.push(oct);
    }
  }

  if (validOctaves.length === 0) {
    validOctaves.push(getDefaultRootOctave(clef, root));
  }

  return validOctaves;
}

export function buildArpeggio(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  contour: ArpeggioContour,
  startingDegree: 'root' | '3rd' | '5th',
  clef: Clef,
  tier: number,
  octave?: number
): ArpeggioDefinition {
  const formula = CHORD_FORMULAS[quality];
  const validOctaves = getValidOctavesForArpeggio(root, rootAccidental, quality, contour, startingDegree, clef);
  const chosenOctave = octave !== undefined
    ? octave
    : validOctaves[Math.floor(Math.random() * validOctaves.length)];

  const finalNotes = constructArpeggioNotes(root, rootAccidental, quality, contour, startingDegree, chosenOctave);

  const rootName = formatNoteName(root, rootAccidental);
  const contourLabel = contour.charAt(0).toUpperCase() + contour.slice(1);
  const displayName = `${rootName}${formula.shortName} (${contourLabel}, ${startingDegree})`;
  const id = `${rootName}_${quality.toUpperCase()}_${contour.toUpperCase()}_${startingDegree.toUpperCase()}_${clef.toUpperCase()}`;

  return {
    id,
    root,
    rootAccidental,
    quality,
    contour,
    startingDegree,
    notes: finalNotes,
    clef,
    tier,
    displayName,
    isBeamed: true
  };
}

export function getValidArpeggioRootsForQuality(quality: ChordQuality, tier: number, clef: Clef = 'treble'): { root: NoteLetter, accidental: Accidental }[] {
  const config = ARPEGGIO_TIERS[tier] || ARPEGGIO_TIERS[1.1];
  const candidates: { root: NoteLetter, accidental: Accidental }[] = [];
  
  for (const root of NOTE_LETTERS) {
    for (const accidental of config.accidentals) {
      const arp = buildArpeggio(root, accidental, quality, 'ascending', 'root', clef, tier);
      if (tier < 3.0) {
        const hasDouble = arp.notes.some(n => n.accidental === 'double_sharp' || n.accidental === 'double_flat');
        if (!hasDouble) {
          candidates.push({ root, accidental });
        }
      } else {
        candidates.push({ root, accidental });
      }
    }
  }

  return candidates.length > 0 ? candidates : [{ root: 'C', accidental: 'natural' }];
}

export function generateRandomArpeggioForTier(tier: number, clef: Clef): ArpeggioDefinition {
  const config = ARPEGGIO_TIERS[tier] || ARPEGGIO_TIERS[1.1];

  const quality = config.qualities[Math.floor(Math.random() * config.qualities.length)];
  const contour = config.contours[Math.floor(Math.random() * config.contours.length)];
  const startingDegree = config.startingDegrees[Math.floor(Math.random() * config.startingDegrees.length)];
  const validRoots = getValidArpeggioRootsForQuality(quality, tier, clef);
  const picked = validRoots[Math.floor(Math.random() * validRoots.length)];

  return buildArpeggio(picked.root, picked.accidental, quality, contour, startingDegree, clef, tier);
}

/**
 * Builds an arpeggio aligned in octave register with a target arpeggio for accurate side-by-side diff.
 */
export function alignArpeggioToTargetOctave(
  root: NoteLetter,
  rootAccidental: Accidental,
  quality: ChordQuality,
  contour: ArpeggioContour,
  startingDegree: 'root' | '3rd' | '5th',
  clef: Clef,
  tier: number,
  targetArpeggio: ArpeggioDefinition
): ArpeggioDefinition {
  const validOctaves = getValidOctavesForArpeggio(root, rootAccidental, quality, contour, startingDegree, clef);
  if (validOctaves.length === 1) {
    const arp = buildArpeggio(root, rootAccidental, quality, contour, startingDegree, clef, tier, validOctaves[0]);
    if (targetArpeggio.keySignature) arp.keySignature = targetArpeggio.keySignature;
    return arp;
  }

  const targetNotes = targetArpeggio.notes;
  const targetLowestMidi = Math.min(...targetNotes.map(n => noteToMidi(n)));
  const targetHighestMidi = Math.max(...targetNotes.map(n => noteToMidi(n)));
  const targetCenterMidi = (targetLowestMidi + targetHighestMidi) / 2;

  let bestOctave = validOctaves[0];
  let minScore = Infinity;

  for (const oct of validOctaves) {
    const candidateNotes = constructArpeggioNotes(root, rootAccidental, quality, contour, startingDegree, oct);
    const candidateLowestMidi = Math.min(...candidateNotes.map(n => noteToMidi(n)));
    const candidateHighestMidi = Math.max(...candidateNotes.map(n => noteToMidi(n)));
    const candidateCenterMidi = (candidateLowestMidi + candidateHighestMidi) / 2;

    const lowestDiff = Math.abs(candidateLowestMidi - targetLowestMidi);
    const centerDiff = Math.abs(candidateCenterMidi - targetCenterMidi);
    const score = lowestDiff + centerDiff;

    if (score < minScore) {
      minScore = score;
      bestOctave = oct;
    }
  }

  const alignedArp = buildArpeggio(root, rootAccidental, quality, contour, startingDegree, clef, tier, bestOctave);
  if (targetArpeggio.keySignature) {
    alignedArp.keySignature = targetArpeggio.keySignature;
  }
  return alignedArp;
}

