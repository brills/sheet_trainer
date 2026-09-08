import { ChordDefinition, ArpeggioDefinition, MultipleChoiceOption } from '../../types';
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

export function generateChordMultipleChoiceOptions(target: ChordDefinition): MultipleChoiceOption[] {
  const options: MultipleChoiceOption[] = [];
  const rootStr = formatNoteName(target.root, target.rootAccidental);
  const qualityStr = CHORD_FORMULAS[target.quality].shortName;
  const isDropVoicing = target.voicing === 'drop2' || target.voicing === 'drop3';
  const invStr = isDropVoicing 
    ? (target.voicing === 'drop2' 
        ? (target.omit5 ? 'Drop-2 (omit 5)' : 'Drop-2 Voicing') 
        : (target.omit5 ? 'Drop-3 (omit 5)' : 'Drop-3 Voicing'))
    : formatInversionName(target.inversion, 'full');

  // 1. Correct Option
  options.push({
    id: target.id,
    label: `${rootStr}${qualityStr}`,
    sublabel: invStr,
    isCorrect: true,
    chordData: {
      root: target.root,
      accidental: target.rootAccidental,
      quality: target.quality,
      inversion: target.inversion,
      voicing: target.voicing,
      omit5: target.omit5
    }
  });

  const tierConfig = CHORD_TIERS[target.tier] || CHORD_TIERS[1.1];
  const allowedInversions = tierConfig.inversions;
  const allowedQualities = tierConfig.qualities;
  const otherInversions = allowedInversions.filter(inv => inv !== target.inversion);
  const otherQualities = allowedQualities.filter(q => q !== target.quality);
  const otherRoots = NOTE_LETTERS.filter(r => r !== target.root);

  const seen = new Set<string>();
  seen.add(`${rootStr}:${target.quality}:${target.inversion}`);

  // Candidate 1: Quality Trap (Same root, different quality from tier, same inversion)
  if (otherQualities.length > 0) {
    const trapQuality = otherQualities[Math.floor(Math.random() * otherQualities.length)];
    const trapQualityStr = CHORD_FORMULAS[trapQuality]?.shortName || 'm';
    const sig = `${rootStr}:${trapQuality}:${target.inversion}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_qual_${trapQuality}_${target.inversion}`,
        label: `${rootStr}${trapQualityStr}`,
        sublabel: invStr,
        isCorrect: false,
        chordData: {
          root: target.root,
          accidental: target.rootAccidental,
          quality: trapQuality,
          inversion: target.inversion,
          voicing: target.voicing,
          omit5: target.omit5
        }
      });
    }
  }

  // Candidate 2: Inversion Trap (ONLY for close-position tiers with multiple inversions)
  if (!isDropVoicing && otherInversions.length > 0) {
    const trapInv = otherInversions[Math.floor(Math.random() * otherInversions.length)];
    const trapInvStr = formatInversionName(trapInv, 'full');
    const sig = `${rootStr}:${target.quality}:${trapInv}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_inv_${trapInv}`,
        label: `${rootStr}${qualityStr}`,
        sublabel: trapInvStr,
        isCorrect: false,
        chordData: {
          root: target.root,
          accidental: target.rootAccidental,
          quality: target.quality,
          inversion: trapInv,
          voicing: target.voicing,
          omit5: target.omit5
        }
      });
    }
  }

  // Candidate 3: Root Traps with valid tier qualities and allowed inversions
  const shuffledRoots = shuffle(otherRoots);
  for (const trapRoot of shuffledRoots) {
    if (options.length >= 4) break;
    const trapRootStr = formatNoteName(trapRoot, target.rootAccidental);
    const trapQual = allowedQualities[Math.floor(Math.random() * allowedQualities.length)];
    const trapQualStr = CHORD_FORMULAS[trapQual]?.shortName || 'Maj';
    const allowedForQuality = allowedInversions.filter(inv => 
      inv !== '3rd' || CHORD_FORMULAS[trapQual]?.maxInversion === '3rd'
    );
    const trapInv = isDropVoicing ? target.inversion : allowedForQuality[Math.floor(Math.random() * allowedForQuality.length)];
    const trapInvStr = isDropVoicing ? invStr : formatInversionName(trapInv, 'full');
    const sig = `${trapRootStr}:${trapQual}:${trapInv}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_root_${trapRoot}_${trapQual}_${trapInv}`,
        label: `${trapRootStr}${trapQualStr}`,
        sublabel: trapInvStr,
        isCorrect: false,
        chordData: {
          root: trapRoot,
          accidental: target.rootAccidental,
          quality: trapQual,
          inversion: trapInv,
          voicing: target.voicing,
          omit5: target.omit5
        }
      });
    }
  }

  // Fallback if needed to guarantee 4 options
  let fallbackIndex = 0;
  while (options.length < 4) {
    const fallbackRoot = NOTE_LETTERS[fallbackIndex % NOTE_LETTERS.length];
    const fallbackRootStr = formatNoteName(fallbackRoot, target.rootAccidental);
    const fallbackQual = allowedQualities[fallbackIndex % allowedQualities.length];
    const fallbackQualStr = CHORD_FORMULAS[fallbackQual]?.shortName || 'Maj';
    const allowedForFallback = allowedInversions.filter(inv => 
      inv !== '3rd' || CHORD_FORMULAS[fallbackQual]?.maxInversion === '3rd'
    );
    const fallbackInv = isDropVoicing ? target.inversion : allowedForFallback[fallbackIndex % allowedForFallback.length];
    const fallbackInvStr = isDropVoicing ? invStr : formatInversionName(fallbackInv, 'full');
    const sig = `${fallbackRootStr}:${fallbackQual}:${fallbackInv}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `fallback_${fallbackIndex}`,
        label: `${fallbackRootStr}${fallbackQualStr}`,
        sublabel: fallbackInvStr,
        isCorrect: false,
        chordData: {
          root: fallbackRoot,
          accidental: target.rootAccidental,
          quality: fallbackQual,
          inversion: fallbackInv,
          voicing: target.voicing,
          omit5: target.omit5
        }
      });
    }
    fallbackIndex++;
  }

  return shuffle(options);
}

export function generateArpeggioMultipleChoiceOptions(target: ArpeggioDefinition): MultipleChoiceOption[] {
  const options: MultipleChoiceOption[] = [];
  const rootStr = formatNoteName(target.root, target.rootAccidental);
  const qualityStr = CHORD_FORMULAS[target.quality].shortName;
  const contourLabel = target.contour.charAt(0).toUpperCase() + target.contour.slice(1);

  // 1. Correct Option
  options.push({
    id: target.id,
    label: `${rootStr}${qualityStr} (${contourLabel})`,
    sublabel: `Starts on ${target.startingDegree}`,
    isCorrect: true,
    arpeggioData: {
      root: target.root,
      accidental: target.rootAccidental,
      quality: target.quality,
      contour: target.contour,
      startingDegree: target.startingDegree
    }
  });

  const tierConfig = ARPEGGIO_TIERS[target.tier] || ARPEGGIO_TIERS[1.1];
  const allowedContours = tierConfig.contours;
  const allowedDegrees = tierConfig.startingDegrees;
  const allowedQualities = tierConfig.qualities;

  const otherContours = allowedContours.filter(c => c !== target.contour);
  const otherDegrees = allowedDegrees.filter(d => d !== target.startingDegree);
  const otherQualities = allowedQualities.filter(q => q !== target.quality);
  const otherRoots = NOTE_LETTERS.filter(r => r !== target.root);

  const seen = new Set<string>();
  seen.add(`${rootStr}:${target.quality}:${target.contour}:${target.startingDegree}`);

  // Trap 1: Quality trap (if tier has multiple qualities)
  if (otherQualities.length > 0) {
    const trapQuality = otherQualities[Math.floor(Math.random() * otherQualities.length)];
    const trapQualityStr = CHORD_FORMULAS[trapQuality]?.shortName || 'm';
    const sig = `${rootStr}:${trapQuality}:${target.contour}:${target.startingDegree}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_qual_${trapQuality}`,
        label: `${rootStr}${trapQualityStr} (${contourLabel})`,
        sublabel: `Starts on ${target.startingDegree}`,
        isCorrect: false,
        arpeggioData: {
          root: target.root,
          accidental: target.rootAccidental,
          quality: trapQuality,
          contour: target.contour,
          startingDegree: target.startingDegree
        }
      });
    }
  }

  // Trap 2: Contour trap (ONLY if tier has multiple contours!)
  if (otherContours.length > 0) {
    const trapContour = otherContours[Math.floor(Math.random() * otherContours.length)];
    const trapContourLabel = trapContour.charAt(0).toUpperCase() + trapContour.slice(1);
    const sig = `${rootStr}:${target.quality}:${trapContour}:${target.startingDegree}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_contour_${trapContour}`,
        label: `${rootStr}${qualityStr} (${trapContourLabel})`,
        sublabel: `Starts on ${target.startingDegree}`,
        isCorrect: false,
        arpeggioData: {
          root: target.root,
          accidental: target.rootAccidental,
          quality: target.quality,
          contour: trapContour,
          startingDegree: target.startingDegree
        }
      });
    }
  }

  // Trap 3: Degree trap (ONLY if tier has multiple starting degrees!)
  if (otherDegrees.length > 0) {
    const trapDegree = otherDegrees[Math.floor(Math.random() * otherDegrees.length)];
    const sig = `${rootStr}:${target.quality}:${target.contour}:${trapDegree}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_degree_${trapDegree}`,
        label: `${rootStr}${qualityStr} (${contourLabel})`,
        sublabel: `Starts on ${trapDegree}`,
        isCorrect: false,
        arpeggioData: {
          root: target.root,
          accidental: target.rootAccidental,
          quality: target.quality,
          contour: target.contour,
          startingDegree: trapDegree
        }
      });
    }
  }

  // Trap 4: Root traps (using allowed qualities, contours, degrees)
  const shuffledRoots = shuffle(otherRoots);
  for (const trapRoot of shuffledRoots) {
    if (options.length >= 4) break;
    const trapRootStr = formatNoteName(trapRoot, target.rootAccidental);
    const trapContour = allowedContours[Math.floor(Math.random() * allowedContours.length)];
    const trapContourLabel = trapContour.charAt(0).toUpperCase() + trapContour.slice(1);
    const trapDegree = allowedDegrees[Math.floor(Math.random() * allowedDegrees.length)];
    const trapQual = allowedQualities[Math.floor(Math.random() * allowedQualities.length)];
    const trapQualStr = CHORD_FORMULAS[trapQual]?.shortName || 'Maj';
    const sig = `${trapRootStr}:${trapQual}:${trapContour}:${trapDegree}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      options.push({
        id: `trap_root_${trapRoot}_${trapQual}`,
        label: `${trapRootStr}${trapQualStr} (${trapContourLabel})`,
        sublabel: `Starts on ${trapDegree}`,
        isCorrect: false,
        arpeggioData: {
          root: trapRoot,
          accidental: target.rootAccidental,
          quality: trapQual,
          contour: trapContour,
          startingDegree: trapDegree
        }
      });
    }
  }

  // Fill up to 4 if needed
  let fallbackIndex = 0;
  while (options.length < 4) {
    const fallbackRoot = NOTE_LETTERS[fallbackIndex % NOTE_LETTERS.length];
    const fallbackRootStr = formatNoteName(fallbackRoot, target.rootAccidental);
    const fallbackContour = target.contour;
    const fallbackContourLabel = fallbackContour.charAt(0).toUpperCase() + fallbackContour.slice(1);
    const fallbackDegree = target.startingDegree;
    options.push({
      id: `trap_arp_fallback_${fallbackIndex}_${target.id}`,
      label: `${fallbackRootStr}${qualityStr} (${fallbackContourLabel})`,
      sublabel: `Starts on ${fallbackDegree}`,
      isCorrect: false,
      arpeggioData: {
        root: fallbackRoot,
        accidental: target.rootAccidental,
        quality: target.quality,
        contour: fallbackContour,
        startingDegree: fallbackDegree
      }
    });
    fallbackIndex++;
  }

  return shuffle(options);
}

