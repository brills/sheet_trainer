import { ChordDefinition, ArpeggioDefinition, MultipleChoiceOption, Inversion } from '../../types';
import { CHORD_TIERS, CHORD_FORMULAS } from '../theory/chords';
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
  const invStr = target.inversion === 'root' ? 'Root' : target.inversion;

  // 1. Correct Option
  options.push({
    id: target.id,
    label: `${rootStr}${qualityStr}`,
    sublabel: `${invStr} Inversion`,
    isCorrect: true
  });

  const tierConfig = CHORD_TIERS[target.tier] || CHORD_TIERS[1.1];

  // 2. Inversion Trap: Same root, different inversion
  const otherInversions: Inversion[] = (['root', '1st', '2nd', '3rd'] as Inversion[]).filter(inv => inv !== target.inversion);
  const trapInv = otherInversions[Math.floor(Math.random() * otherInversions.length)];
  const trapInvStr = trapInv === 'root' ? 'Root' : trapInv;
  options.push({
    id: `trap_inv_${trapInv}`,
    label: `${rootStr}${qualityStr}`,
    sublabel: `${trapInvStr} Inversion`,
    isCorrect: false
  });

  // 3. Visual Shape Trap: Different root, same inversion
  const otherRoots = NOTE_LETTERS.filter(r => r !== target.root);
  const trapRoot = otherRoots[Math.floor(Math.random() * otherRoots.length)];
  const trapRootStr = formatNoteName(trapRoot, target.rootAccidental);
  options.push({
    id: `trap_root_${trapRoot}`,
    label: `${trapRootStr}${qualityStr}`,
    sublabel: `${invStr} Inversion`,
    isCorrect: false
  });

  // 4. Quality Trap: Same root, opposite/different quality
  const otherQualities = tierConfig.qualities.filter(q => q !== target.quality);
  const trapQuality = otherQualities.length > 0 
    ? otherQualities[Math.floor(Math.random() * otherQualities.length)]
    : (target.quality === 'major' ? 'minor' : 'major');
  const trapQualityStr = CHORD_FORMULAS[trapQuality]?.shortName || 'm';

  options.push({
    id: `trap_qual_${trapQuality}`,
    label: `${rootStr}${trapQualityStr}`,
    sublabel: `${invStr} Inversion`,
    isCorrect: false
  });

  return shuffle(options);
}

export function generateArpeggioMultipleChoiceOptions(target: ArpeggioDefinition): MultipleChoiceOption[] {
  const options: MultipleChoiceOption[] = [];
  const rootStr = formatNoteName(target.root, target.rootAccidental);
  const qualityStr = CHORD_FORMULAS[target.quality].shortName;
  const contourLabel = target.contour.charAt(0).toUpperCase() + target.contour.slice(1);

  // Correct
  options.push({
    id: target.id,
    label: `${rootStr}${qualityStr} (${contourLabel})`,
    sublabel: `Starts on ${target.startingDegree}`,
    isCorrect: true
  });

  // Trap 1: Opposite contour
  const otherContours = ['ascending', 'descending', 'arch', 'alberti'].filter(c => c !== target.contour);
  const trapContour = otherContours[0];
  const trapContourLabel = trapContour.charAt(0).toUpperCase() + trapContour.slice(1);
  options.push({
    id: `trap_contour_${trapContour}`,
    label: `${rootStr}${qualityStr} (${trapContourLabel})`,
    sublabel: `Starts on ${target.startingDegree}`,
    isCorrect: false
  });

  // Trap 2: Different starting degree
  const otherDegrees = ['root', '3rd', '5th'].filter(d => d !== target.startingDegree);
  const trapDegree = otherDegrees[0] || '3rd';
  options.push({
    id: `trap_degree_${trapDegree}`,
    label: `${rootStr}${qualityStr} (${contourLabel})`,
    sublabel: `Starts on ${trapDegree}`,
    isCorrect: false
  });

  // Trap 3: Different root
  const otherRoots = NOTE_LETTERS.filter(r => r !== target.root);
  const trapRoot = otherRoots[0];
  const trapRootStr = formatNoteName(trapRoot, target.rootAccidental);
  options.push({
    id: `trap_root_${trapRoot}`,
    label: `${trapRootStr}${qualityStr} (${contourLabel})`,
    sublabel: `Starts on ${target.startingDegree}`,
    isCorrect: false
  });

  return shuffle(options);
}
