import { ChordDefinition, ArpeggioDefinition, MultipleChoiceOption, NoteLetter, Inversion, ChordQuality, ArpeggioContour } from '../../types';
import { CHORD_TIERS, CHORD_FORMULAS, formatInversionName } from '../theory/chords';
import { ARPEGGIO_TIERS } from '../theory/arpeggios';
import { NOTE_LETTERS, formatNoteName } from '../theory/notes';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Returns musically plausible distractor roots based on sight-reading perceptual traps:
 * 1. Inversion bass note trap (reading the lowest note as the root)
 * 2. Harmonic neighbors: Dominant (5th) and Subdominant (4th)
 * 3. Relative major/minor (shared notes/dyads)
 * 4. Line / space step neighbors (+1 or -1 scale step)
 */
function getPlausibleDistractorRoots(targetRoot: NoteLetter, targetInversion: Inversion): NoteLetter[] {
  const rootIndex = NOTE_LETTERS.indexOf(targetRoot);
  const candidates: NoteLetter[] = [];

  // 1. Inversion Bass Note Trap: If inverted, the lowest note is a major perceptual trap
  if (targetInversion === '1st') {
    candidates.push(NOTE_LETTERS[(rootIndex + 2) % 7]); // 3rd is in bass
  } else if (targetInversion === '2nd') {
    candidates.push(NOTE_LETTERS[(rootIndex + 4) % 7]); // 5th is in bass
  } else if (targetInversion === '3rd') {
    candidates.push(NOTE_LETTERS[(rootIndex + 6) % 7]); // 7th is in bass
  }

  // 2. Harmonic circle neighbors (5th and 4th)
  candidates.push(NOTE_LETTERS[(rootIndex + 4) % 7]); // 5th
  candidates.push(NOTE_LETTERS[(rootIndex + 3) % 7]); // 4th

  // 3. Relative key / 3rd relation
  candidates.push(NOTE_LETTERS[(rootIndex + 5) % 7]); // 6th (relative minor/major)
  candidates.push(NOTE_LETTERS[(rootIndex + 2) % 7]); // 3rd

  // 4. Line / space step neighbors (+1 / -1 scale step)
  candidates.push(NOTE_LETTERS[(rootIndex + 1) % 7]);
  candidates.push(NOTE_LETTERS[(rootIndex + 6) % 7]);

  // Deduplicate and filter out target root
  const unique = Array.from(new Set(candidates)).filter(r => r !== targetRoot);
  return unique;
}

/**
 * Generates balanced, non-leaking multiple-choice options for chords.
 * Eliminates meta-gaming / option elimination tricks (e.g. counting root frequencies).
 */
export function generateChordMultipleChoiceOptions(target: ChordDefinition): MultipleChoiceOption[] {
  const isDropVoicing = target.voicing === 'drop2' || target.voicing === 'drop3';
  const invStr = isDropVoicing 
    ? (target.voicing === 'drop2' 
        ? (target.omit5 ? 'Drop-2 (omit 5)' : 'Drop-2 Voicing') 
        : (target.omit5 ? 'Drop-3 (omit 5)' : 'Drop-3 Voicing'))
    : formatInversionName(target.inversion, 'full');

  const tierConfig = CHORD_TIERS[target.tier] || CHORD_TIERS[1.1];
  const allowedInversions = tierConfig.inversions;
  const allowedQualities = tierConfig.qualities;
  const otherQualities = allowedQualities.filter(q => q !== target.quality);
  const otherInversions = allowedInversions.filter(inv => inv !== target.inversion);
  const plausibleRoots = getPlausibleDistractorRoots(target.root, target.inversion);

  // Helper to construct a MultipleChoiceOption
  const makeOption = (
    root: NoteLetter,
    qual: ChordQuality,
    inv: Inversion,
    isTarget: boolean
  ): MultipleChoiceOption => {
    const rStr = formatNoteName(root, target.rootAccidental);
    const qStr = CHORD_FORMULAS[qual]?.shortName || 'Maj';
    const iStr = isDropVoicing ? invStr : formatInversionName(inv, 'full');

    return {
      id: isTarget ? target.id : `dist_${root}_${qual}_${inv}_${Math.random().toString(36).substring(2, 7)}`,
      label: `${rStr}${qStr}`,
      sublabel: iStr,
      isCorrect: isTarget,
      chordData: {
        root,
        accidental: target.rootAccidental,
        quality: qual,
        inversion: inv,
        voicing: target.voicing,
        omit5: target.omit5
      }
    };
  };

  const options: MultipleChoiceOption[] = [];
  const seen = new Set<string>();

  const addOpt = (root: NoteLetter, qual: ChordQuality, inv: Inversion, isTarget: boolean) => {
    // Inversion sanity check for triads (no 3rd inversion allowed on triads)
    const validInv = (inv === '3rd' && CHORD_FORMULAS[qual]?.maxInversion !== '3rd') ? 'root' : inv;
    const key = `${root}:${qual}:${validInv}`;
    if (!seen.has(key) && options.length < 4) {
      seen.add(key);
      options.push(makeOption(root, qual, validInv, isTarget));
    }
  };

  // Always add correct option first
  addOpt(target.root, target.quality, target.inversion, true);

  // Available Balanced Strategies:
  // Strategy 1: Symmetrical 2x2 Matrix (2 of Root A, 2 of Root B with balanced qualities/inversions)
  // Strategy 2: 4 All-Distinct Roots (Each root appears exactly once)
  // Strategy 3: 4 All-Same Root (Pure Quality / Inversion discrimination)

  const canDoMode3_Qual = otherQualities.length >= 3 && !isDropVoicing && allowedInversions.length === 1;
  const canDoMode1_Qual = otherQualities.length >= 1;
  const canDoMode1_Inv = !isDropVoicing && otherInversions.length >= 1;

  // Random strategy selection
  const roll = Math.random();

  if (canDoMode3_Qual && roll < 0.25) {
    // Strategy 3: 4 All-Same Root (Pure Quality Test)
    const shuffledQuals = shuffle(otherQualities);
    for (const q of shuffledQuals) {
      addOpt(target.root, q, target.inversion, false);
      if (options.length === 4) break;
    }
  } else if (canDoMode1_Qual && (roll < 0.65 || (allowedQualities.length >= 2 && allowedInversions.length === 1))) {
    // Strategy 1A: Symmetrical 2x2 Matrix across Qualities
    // [RootA Qual1, RootA Qual2, RootB Qual1, RootB Qual2]
    const pairedRoot = plausibleRoots[0] || (target.root === 'C' ? 'G' : 'C');
    const trapQuality = otherQualities[Math.floor(Math.random() * otherQualities.length)];

    // Option 2: Root A with trap quality
    addOpt(target.root, trapQuality, target.inversion, false);
    // Option 3: Root B with target quality
    addOpt(pairedRoot, target.quality, target.inversion, false);
    // Option 4: Root B with trap quality
    addOpt(pairedRoot, trapQuality, target.inversion, false);
  } else if (canDoMode1_Inv && roll < 0.85) {
    // Strategy 1B: Symmetrical 2x2 Matrix across Inversions
    // [RootA Inv1, RootA Inv2, RootB Inv1, RootB Inv2]
    const pairedRoot = plausibleRoots[0] || (target.root === 'C' ? 'G' : 'C');
    const trapInv = otherInversions[Math.floor(Math.random() * otherInversions.length)];

    // Option 2: Root A with trap inversion
    addOpt(target.root, target.quality, trapInv, false);
    // Option 3: Root B with target inversion
    addOpt(pairedRoot, target.quality, target.inversion, false);
    // Option 4: Root B with trap inversion
    addOpt(pairedRoot, target.quality, trapInv, false);
  } else {
    // Strategy 2: 4 All-Distinct Roots (Every root appears exactly once!)
    // [Root A, Root B, Root C, Root D]
    const distinctRoots = plausibleRoots.slice(0, 3);
    for (const dRoot of distinctRoots) {
      // Pick allowed quality / inversion consistent with tier
      const dQual = allowedQualities.length > 1 && Math.random() > 0.5 
        ? allowedQualities[Math.floor(Math.random() * allowedQualities.length)] 
        : target.quality;
      const dInv = isDropVoicing ? target.inversion : (allowedInversions.length > 1 && Math.random() > 0.5
        ? allowedInversions[Math.floor(Math.random() * allowedInversions.length)]
        : target.inversion);
      addOpt(dRoot, dQual, dInv, false);
      if (options.length === 4) break;
    }
  }

  // Robust Fallback: Guarantee exactly 4 options under any restricted tier
  let fallbackIdx = 0;
  while (options.length < 4) {
    const fRoot = plausibleRoots[fallbackIdx % plausibleRoots.length] || NOTE_LETTERS[fallbackIdx % NOTE_LETTERS.length];
    const fQual = allowedQualities[fallbackIdx % allowedQualities.length];
    const fInv = isDropVoicing ? target.inversion : allowedInversions[fallbackIdx % allowedInversions.length];
    addOpt(fRoot, fQual, fInv, false);
    fallbackIdx++;
  }

  return shuffle(options);
}

/**
 * Generates balanced, non-leaking multiple-choice options for arpeggios.
 */
export function generateArpeggioMultipleChoiceOptions(target: ArpeggioDefinition): MultipleChoiceOption[] {
  const tierConfig = ARPEGGIO_TIERS[target.tier] || ARPEGGIO_TIERS[1.1];
  const allowedContours = tierConfig.contours;
  const allowedDegrees = tierConfig.startingDegrees;
  const allowedQualities = tierConfig.qualities;

  const otherContours = allowedContours.filter(c => c !== target.contour);
  const otherDegrees = allowedDegrees.filter(d => d !== target.startingDegree);
  const otherQualities = allowedQualities.filter(q => q !== target.quality);
  const plausibleRoots = getPlausibleDistractorRoots(target.root, 'root');

  const makeArpOption = (
    root: NoteLetter,
    qual: ChordQuality,
    contour: ArpeggioContour,
    degree: 'root' | '3rd' | '5th',
    isTarget: boolean
  ): MultipleChoiceOption => {
    const rStr = formatNoteName(root, target.rootAccidental);
    const qStr = CHORD_FORMULAS[qual]?.shortName || 'Maj';
    const cLabel = contour.charAt(0).toUpperCase() + contour.slice(1);

    return {
      id: isTarget ? target.id : `dist_arp_${root}_${qual}_${contour}_${degree}_${Math.random().toString(36).substring(2, 7)}`,
      label: `${rStr}${qStr} (${cLabel})`,
      sublabel: `Starts on ${degree}`,
      isCorrect: isTarget,
      arpeggioData: {
        root,
        accidental: target.rootAccidental,
        quality: qual,
        contour,
        startingDegree: degree
      }
    };
  };

  const options: MultipleChoiceOption[] = [];
  const seen = new Set<string>();

  const addArpOpt = (root: NoteLetter, qual: ChordQuality, contour: ArpeggioContour, degree: 'root' | '3rd' | '5th', isTarget: boolean) => {
    const key = `${root}:${qual}:${contour}:${degree}`;
    if (!seen.has(key) && options.length < 4) {
      seen.add(key);
      options.push(makeArpOption(root, qual, contour, degree, isTarget));
    }
  };

  // Add target first
  addArpOpt(target.root, target.quality, target.contour, target.startingDegree, true);

  const canDo2x2Contour = otherContours.length >= 1;
  const canDo2x2Qual = otherQualities.length >= 1;
  const canDo2x2Degree = otherDegrees.length >= 1;
  const roll = Math.random();

  if (canDo2x2Contour && roll < 0.4) {
    // Symmetrical 2x2 Matrix across Contours
    const pairedRoot = plausibleRoots[0] || (target.root === 'C' ? 'G' : 'C');
    const trapContour = otherContours[Math.floor(Math.random() * otherContours.length)];

    addArpOpt(target.root, target.quality, trapContour, target.startingDegree, false);
    addArpOpt(pairedRoot, target.quality, target.contour, target.startingDegree, false);
    addArpOpt(pairedRoot, target.quality, trapContour, target.startingDegree, false);
  } else if (canDo2x2Qual && roll < 0.7) {
    // Symmetrical 2x2 Matrix across Qualities
    const pairedRoot = plausibleRoots[0] || (target.root === 'C' ? 'G' : 'C');
    const trapQual = otherQualities[Math.floor(Math.random() * otherQualities.length)];

    addArpOpt(target.root, trapQual, target.contour, target.startingDegree, false);
    addArpOpt(pairedRoot, target.quality, target.contour, target.startingDegree, false);
    addArpOpt(pairedRoot, trapQual, target.contour, target.startingDegree, false);
  } else if (canDo2x2Degree && roll < 0.85) {
    // Symmetrical 2x2 Matrix across Starting Degrees
    const pairedRoot = plausibleRoots[0] || (target.root === 'C' ? 'G' : 'C');
    const trapDegree = otherDegrees[Math.floor(Math.random() * otherDegrees.length)];

    addArpOpt(target.root, target.quality, target.contour, trapDegree, false);
    addArpOpt(pairedRoot, target.quality, target.contour, target.startingDegree, false);
    addArpOpt(pairedRoot, target.quality, target.contour, trapDegree, false);
  } else {
    // 4 All-Distinct Roots
    const distinctRoots = plausibleRoots.slice(0, 3);
    for (const dRoot of distinctRoots) {
      addArpOpt(dRoot, target.quality, target.contour, target.startingDegree, false);
      if (options.length === 4) break;
    }
  }

  // Fallback if needed
  let fallbackIdx = 0;
  while (options.length < 4) {
    const fRoot = plausibleRoots[fallbackIdx % plausibleRoots.length] || NOTE_LETTERS[fallbackIdx % NOTE_LETTERS.length];
    const fQual = allowedQualities[fallbackIdx % allowedQualities.length];
    const fContour = allowedContours[fallbackIdx % allowedContours.length];
    const fDegree = allowedDegrees[fallbackIdx % allowedDegrees.length];
    addArpOpt(fRoot, fQual, fContour, fDegree, false);
    fallbackIdx++;
  }

  return shuffle(options);
}
