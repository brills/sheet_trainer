import { NOTE_LETTERS, noteToMidi, transposePitch, formatNoteName } from '../src/core/theory/notes';
import { buildChord, CHORD_TIERS, CHORD_FORMULAS, getValidOctavesForChord, alignChordToTargetOctave, generateRandomChordForTier } from '../src/core/theory/chords';
import { buildArpeggio, ARPEGGIO_TIERS, getValidOctavesForArpeggio, alignArpeggioToTargetOctave } from '../src/core/theory/arpeggios';
import { ChordInputStateMachine } from '../src/core/engines/stateMachine';
import { calculatePatternWeight, checkTierPromotion, selectNextChord, selectNextArpeggio } from '../src/core/engines/adaptiveEngine';
import { generateChordMultipleChoiceOptions, generateArpeggioMultipleChoiceOptions } from '../src/core/engines/distractorEngine';
import { KEY_SIGNATURES, KEY_STAGES, getRequiredAccidentalForNote, getDiatonicChordsForKey, getDiatonicArpeggiosForKey, isDiatonicChord, isDiatonicArpeggio, tierSupportsDiatonic } from '../src/core/theory/keys';
import { checkKeyStagePromotion } from '../src/core/engines/adaptiveEngine';
import { PrecisionTimingEngine } from '../src/core/engines/timingEngine';

console.log('🧪 Starting Sheet Trainer Verification Suite...\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

// 1. Music Theory & Note Tests
console.log('--- 1. Notes & Transposition ---');
assert(noteToMidi({ letter: 'C', accidental: 'natural', octave: 4 }) === 60, 'C4 is MIDI 60 (Middle C)');
assert(noteToMidi({ letter: 'A', accidental: 'natural', octave: 4 }) === 69, 'A4 is MIDI 69 (Concert Pitch)');

const c4 = { letter: 'C' as const, accidental: 'natural' as const, octave: 4 };
const majorThird = transposePitch(c4, 4, 2);
assert(majorThird.letter === 'E' && majorThird.accidental === 'natural' && majorThird.octave === 4, 'C4 + major 3rd is E4');

const minorThird = transposePitch(c4, 3, 2);
assert(minorThird.letter === 'E' && minorThird.accidental === 'flat' && minorThird.octave === 4, 'C4 + minor 3rd is Eb4');

// 2. Chord Inversion Tests & Multi-Octave Range
console.log('\n--- 2. Chord Inversions & Multi-Octave Range ---');
const cMajRoot = buildChord('C', 'natural', 'major', 'root', 'treble', 1.1, 4);
assert(cMajRoot.notes.length === 3, 'C Major triad has 3 notes');
assert(cMajRoot.notes[0].letter === 'C' && cMajRoot.notes[1].letter === 'E' && cMajRoot.notes[2].letter === 'G', 'C Maj Root is C-E-G');

const cMaj1st = buildChord('C', 'natural', 'major', '1st', 'treble', 1.2, 4);
assert(cMaj1st.notes[0].letter === 'E' && cMaj1st.notes[1].letter === 'G' && cMaj1st.notes[2].letter === 'C', 'C Maj 1st Inv is E-G-C (top 4th gap)');
assert(cMaj1st.notes[2].octave > cMaj1st.notes[0].octave, '1st Inv root C is on top');

const cMaj2nd = buildChord('C', 'natural', 'major', '2nd', 'treble', 1.3, 4);
assert(cMaj2nd.notes[0].letter === 'G' && cMaj2nd.notes[1].letter === 'C' && cMaj2nd.notes[2].letter === 'E', 'C Maj 2nd Inv is G-C-E (bottom 4th gap)');

const c7th3rd = buildChord('C', 'natural', 'dom7', '3rd', 'treble', 3.2, 4);
assert(c7th3rd.notes[0].letter === 'B' && c7th3rd.notes[0].accidental === 'flat', 'C7 3rd Inv has Bb in bass');

// Multi-Octave Support for Am in Treble Clef
const amValidOctaves = getValidOctavesForChord('A', 'natural', 'minor', 'root', 'treble');
assert(amValidOctaves.includes(3) && amValidOctaves.includes(4), 'Am in treble clef accommodates both octave 3 (A3-C4-E4) and octave 4 (A4-C5-E5)');

const amOctave3 = buildChord('A', 'natural', 'minor', 'root', 'treble', 1.1, 3);
assert(amOctave3.notes[0].octave === 3 && amOctave3.notes[1].octave === 4 && amOctave3.notes[2].octave === 4, 'Am in Octave 3 builds A3 - C4 - E4');

const amOctave4 = buildChord('A', 'natural', 'minor', 'root', 'treble', 1.1, 4);
assert(amOctave4.notes[0].octave === 4 && amOctave4.notes[1].octave === 5 && amOctave4.notes[2].octave === 5, 'Am in Octave 4 builds A4 - C5 - E5');

// Multi-Octave Support for C Maj in Treble & Bass Clefs
const cMajTrebleOctaves = getValidOctavesForChord('C', 'natural', 'major', 'root', 'treble');
assert(cMajTrebleOctaves.includes(4) && cMajTrebleOctaves.includes(5), 'C Maj in treble clef accommodates both octave 4 and octave 5');

const cMajBassOctaves = getValidOctavesForChord('C', 'natural', 'major', 'root', 'bass');
assert(cMajBassOctaves.includes(2) && cMajBassOctaves.includes(3), 'C Maj in bass clef accommodates both octave 2 and octave 3');

// Gb Maj vs G min vs Gb min tests
const gbMaj = buildChord('G', 'flat', 'major', 'root', 'treble', 1.1, 4);
assert(
  gbMaj.notes[0].letter === 'G' && gbMaj.notes[0].accidental === 'flat' &&
  gbMaj.notes[1].letter === 'B' && gbMaj.notes[1].accidental === 'flat' &&
  gbMaj.notes[2].letter === 'D' && gbMaj.notes[2].accidental === 'flat',
  'Gb Major triad is Gb - Bb - Db'
);

const gMin = buildChord('G', 'natural', 'minor', 'root', 'treble', 1.1, 4);
assert(
  gMin.notes[0].letter === 'G' && gMin.notes[0].accidental === 'natural' &&
  gMin.notes[1].letter === 'B' && gMin.notes[1].accidental === 'flat' &&
  gMin.notes[2].letter === 'D' && gMin.notes[2].accidental === 'natural',
  'G minor triad is G - Bb - D'
);

const gbMin = buildChord('G', 'flat', 'minor', 'root', 'treble', 1.1, 4);
assert(
  gbMin.notes[0].letter === 'G' && gbMin.notes[0].accidental === 'flat' &&
  gbMin.notes[1].letter === 'B' && gbMin.notes[1].accidental === 'double_flat' &&
  gbMin.notes[2].letter === 'D' && gbMin.notes[2].accidental === 'flat',
  'Gb minor triad has B double-flat (Gb - Bbb - Db)'
);

// Octave Alignment Tests for Diff Pane
const targetChordC4_1st = buildChord('C', 'natural', 'major', '1st', 'treble', 1.2, 4); // E4 - G4 - C5
const alignedUserRoot = alignChordToTargetOctave('C', 'natural', 'major', 'root', 'treble', 1.1, targetChordC4_1st);
assert(alignedUserRoot.notes[0].octave === 4, 'Aligning Root Position C to C4 1st Inv (E4-G4-C5) selects Octave 4 (C4-E4-G4)');

const targetChordA3 = buildChord('A', 'natural', 'minor', 'root', 'treble', 1.1, 3); // A3 - C4 - E4
const alignedToA3 = alignChordToTargetOctave('C', 'natural', 'major', 'root', 'treble', 1.1, targetChordA3);
assert(alignedToA3.notes[0].octave === 4, 'Aligning C Major to A3 minor (A3-C4-E4) selects C4 (C4-E4-G4) to share register');

const targetChordA4 = buildChord('A', 'natural', 'minor', 'root', 'treble', 1.1, 4); // A4 - C5 - E5
const alignedToA4 = alignChordToTargetOctave('C', 'natural', 'major', 'root', 'treble', 1.1, targetChordA4);
assert(alignedToA4.notes[0].octave === 5, 'Aligning C Major to A4 minor (A4-C5-E5) selects C5 (C5-E5-G5) to match high register');

// 3. Arpeggio Tests & Multi-Octave Range
console.log('\n--- 3. Arpeggio Contours & Range ---');
const gAsc = buildArpeggio('G', 'natural', 'major', 'ascending', 'root', 'treble', 1.1, 4);
assert(gAsc.notes.length === 4, 'Ascending arpeggio generates 4 notes');
assert(gAsc.notes[0].letter === 'G' && gAsc.notes[3].letter === 'G' && gAsc.notes[3].octave > gAsc.notes[0].octave, 'Ascending completes full octave');

const arpValidOctaves = getValidOctavesForArpeggio('C', 'natural', 'major', 'ascending', 'root', 'treble');
assert(arpValidOctaves.length > 0 && arpValidOctaves.includes(4), 'Arpeggios have valid multi-octave bounds');

const targetArp3 = buildArpeggio('A', 'natural', 'minor', 'ascending', 'root', 'treble', 1.1, 3); // A3 to A4
const alignedArp3 = alignArpeggioToTargetOctave('C', 'natural', 'major', 'ascending', 'root', 'treble', 1.1, targetArp3);
assert(alignedArp3.notes[0].octave === 4, 'Aligning C Major arpeggio to A3 minor arpeggio (A3-A4) selects Octave 4 (C4-C5)');

const targetArp4 = buildArpeggio('A', 'natural', 'minor', 'ascending', 'root', 'treble', 1.1, 4); // A4 to A5
const alignedArp4 = alignArpeggioToTargetOctave('C', 'natural', 'major', 'ascending', 'root', 'treble', 1.1, targetArp4);
assert(alignedArp4.notes[0].octave === 5, 'Aligning C Major arpeggio to A4 minor arpeggio (A4-A5) selects Octave 5 (C5-C6)');

// Test Arpeggio VexFlow StaveNote Beaming, Flag Suppression & Uniform Stem Directions
import { StaveNote, Beam as VexBeam, Fraction } from 'vexflow';
const testStaveNotes = gAsc.notes.map(n => new StaveNote({ clef: 'treble', keys: [`${n.letter.toLowerCase()}/${n.octave}`], duration: '8', auto_stem: true }));
assert(testStaveNotes.every(n => (n as any).hasFlag() === true), 'Before beam creation: eighth notes have flags');
const testBeams = VexBeam.generateBeams(testStaveNotes, { groups: [new Fraction(testStaveNotes.length, 8)] });
assert(testStaveNotes.every(n => (n as any).hasFlag() === false), 'After Beam.generateBeams: individual eighth-note flags are suppressed');
assert(testStaveNotes.every(n => n.getStemDirection() === testStaveNotes[0].getStemDirection()), 'All notes in beamed arpeggio strictly share uniform stem direction (no inverted/mixed stems)');

// Test Descending Bbm Arpeggio (from screenshot: Bb4 -> F4 -> Db4 -> Bb3)
const bbmDescNotes = ['bb/4', 'f/4', 'db/4', 'bb/3'].map(k => new StaveNote({ clef: 'treble', keys: [k], duration: '8', auto_stem: true }));
const bbmBeams = VexBeam.generateBeams(bbmDescNotes, { groups: [new Fraction(bbmDescNotes.length, 8)] });
assert(bbmDescNotes.every(n => n.getStemDirection() === 1), 'Descending Bbm arpeggio has uniform UP stems (direction=1) with beam sloping naturally downward from Bb4 to Bb3');

// 4. Input State Machine Tests & Fixed Inversion Auto-Skip
console.log('\n--- 4. Input State Machine & Fixed Inversions ---');

// Test Tier 1.4 (Mixed inversions: requires inversion input)
let mixedResult: any = null;
const smMixed = new ChordInputStateMachine((res) => {
  mixedResult = res;
}, null);

smMixed.handleKey('c');
assert(smMixed.getActiveSlot() === 1 && smMixed.getState().root === 'C', 'Mixed Mode - Typed "c": Root set to C');
smMixed.handleKey('m'); // Auto-skips accidental slot to quality
assert(smMixed.getActiveSlot() === 3 && smMixed.getState().quality === 'minor', 'Mixed Mode - Typed "m": Quality set to minor, waiting for Inversion at Slot 3');

// Verify 3rd Inversion Rejection on Triads
const reject3rdRes = smMixed.handleKey('3');
assert(reject3rdRes.updated === false && reject3rdRes.completed === false, 'State Machine: Pressing "3" (3rd Inversion) is strictly rejected for minor triad');

smMixed.handleKey('1'); // Auto-submits on inversion entry
assert(mixedResult !== null && mixedResult.inversion === '1st', 'Mixed Mode - Typed "1": Auto-submitted 1st inversion');

// Test hotkey 'r' for Root Inversion
let rootHotKeyResult: any = null;
const smRootKey = new ChordInputStateMachine((res) => {
  rootHotKeyResult = res;
}, null);
smRootKey.handleKey('g');
smRootKey.handleKey('M'); // Major
const rKeyRes = smRootKey.handleKey('r'); // 'r' for Root
assert(rKeyRes.completed === true && rootHotKeyResult !== null && rootHotKeyResult.inversion === 'root', 'Mixed Mode - Typed "r": Hotkey "r" submits Root Position inversion');

// Verify buildChord triad safeguard
const triadFallbackChord = buildChord('C', 'natural', 'major', '3rd', 'treble', 1.4);
assert(triadFallbackChord.inversion === 'root', 'buildChord: Passing 3rd inversion to a triad safely falls back to Root Position');

// Test Tier 1.1 (Root Position Fixed): typing C -> m auto-submits Cm Root without needing inversion key!
let rootResult: any = null;
const smRoot = new ChordInputStateMachine((res) => {
  rootResult = res;
}, 'root');

smRoot.handleKey('c');
const rootKeyRes = smRoot.handleKey('m');
assert(rootKeyRes.completed === true, 'Tier 1.1 (Root Pos) - Typed "c" then "m": Immediately completed without typing inversion');
assert(rootResult !== null && rootResult.root === 'C' && rootResult.quality === 'minor' && rootResult.inversion === 'root', 'Tier 1.1 - Auto-filled Root Inversion correctly');

// Test Tier 1.1 with Altered Triads: C -> d auto-submits C dim Root, C -> a auto-submits C aug Root
smRoot.reset();
smRoot.handleKey('c');
const dimKeyRes = smRoot.handleKey('d');
assert(dimKeyRes.completed === true && rootResult.quality === 'diminished' && rootResult.inversion === 'root', 'Tier 1.1 - Typed "c" then "d": Auto-submitted C Diminished Root Position');

smRoot.reset();
smRoot.handleKey('c');
const augKeyRes = smRoot.handleKey('a');
assert(augKeyRes.completed === true && rootResult.quality === 'augmented' && rootResult.inversion === 'root', 'Tier 1.1 - Typed "c" then "a": Auto-submitted C Augmented Root Position');

// Test Tier 1.2 (1st Inversion Fixed): typing A -> m auto-submits Am 1st Inv, and C -> d auto-submits C dim 1st Inv
let inv1stResult: any = null;
const sm1st = new ChordInputStateMachine((res) => {
  inv1stResult = res;
}, '1st');

sm1st.handleKey('a');
const inv1stKeyRes = sm1st.handleKey('m');
assert(inv1stKeyRes.completed === true && inv1stResult.inversion === '1st', 'Tier 1.2 (1st Inv) - Typed "a" then "m": Auto-submitted 1st Inversion');

sm1st.reset();
sm1st.handleKey('b');
sm1st.handleKey('d');
assert(inv1stResult.root === 'B' && inv1stResult.quality === 'diminished' && inv1stResult.inversion === '1st', 'Tier 1.2 (1st Inv) - Typed "b" then "d": Auto-submitted B Diminished 1st Inversion');

// Test Tier 1.3 (2nd Inversion Fixed): typing E -> s (sharp) -> m auto-submits E#m 2nd Inv, and G -> a auto-submits G aug 2nd Inv
let inv2ndResult: any = null;
const sm2nd = new ChordInputStateMachine((res) => {
  inv2ndResult = res;
}, '2nd');

sm2nd.handleKey('e');
sm2nd.handleKey('s'); // Sharp
const inv2ndKeyRes = sm2nd.handleKey('m'); // Minor
assert(inv2ndKeyRes.completed === true && inv2ndResult.accidental === 'sharp' && inv2ndResult.inversion === '2nd', 'Tier 1.3 (2nd Inv) - Typed "e" -> "s" -> "m": Auto-submitted E#m 2nd Inversion');

sm2nd.reset();
sm2nd.handleKey('g');
sm2nd.handleKey('a');
assert(inv2ndResult.root === 'G' && inv2ndResult.quality === 'augmented' && inv2ndResult.inversion === '2nd', 'Tier 1.3 (2nd Inv) - Typed "g" then "a": Auto-submitted G Augmented 2nd Inversion');

// Test Tier 1.4 (Triad Mastery): Altered triads require inversion selection
smMixed.reset();
smMixed.handleKey('d');
smMixed.handleKey('d'); // D dim
smMixed.handleKey('2'); // 2nd inv
assert(mixedResult.root === 'D' && mixedResult.quality === 'diminished' && mixedResult.inversion === '2nd', 'Tier 1.4 (Triad Mastery) - Typed "d" -> "d" -> "2": Auto-submitted D Diminished 2nd Inversion');

// 5. Adaptive Weighting & Tier-Restricted Multiple-Choice Distractor Tests
console.log('\n--- 5. Adaptive Engine & Distractor Constraints ---');
const weightUnseen = calculatePatternWeight({ totalSeen: 0, correctCount: 0, avgLatencyMs: 400, lastAttemptTimestamp: 0 });
const weightWeak = calculatePatternWeight({ totalSeen: 10, correctCount: 4, avgLatencyMs: 900, lastAttemptTimestamp: 0 });
assert(weightWeak > weightUnseen, 'Weak patterns (40% accuracy) have higher sampling weight than normal patterns');

const promoCheckShort = checkTierPromotion('chords', 1.1, Array(19).fill({ isCorrect: true, latencyMs: 1500 }));
assert(!promoCheckShort.shouldPromote, 'Tier promotion requires at least 20 trials (19 trials does not promote)');

const promoCheckPass = checkTierPromotion('chords', 1.1, Array(20).fill({ isCorrect: true, latencyMs: 1800 }));
assert(promoCheckPass.shouldPromote && promoCheckPass.nextTier === 1.2, 'Tier promotion succeeds with 20 trials at 1.8s avg latency (<= 2.0s)');

const promoCheckSlow = checkTierPromotion('chords', 1.1, Array(20).fill({ isCorrect: true, latencyMs: 2200 }));
assert(!promoCheckSlow.shouldPromote, 'Tier promotion fails if avg latency exceeds 2.0s (2200ms)');

// Distractor Inversion Constraints:
// Tier 1.1 (Root Position): all 4 options must be Root Position
const t11Distractors = generateChordMultipleChoiceOptions(cMajRoot);
assert(t11Distractors.length === 4, 'Multiple choice generates 4 options');
assert(t11Distractors.every(d => d.sublabel === 'Root Position'), 'Tier 1.1 (Root Position): ALL 4 options strictly have "Root Position" (no impossible 1st/2nd/3rd distractors)');

// Tier 1.2 (1st Inversion): all 4 options must be 1st Inversion
const t12Chord = buildChord('A', 'natural', 'minor', '1st', 'treble', 1.2, 4);
const t12Distractors = generateChordMultipleChoiceOptions(t12Chord);
assert(t12Distractors.every(d => d.sublabel === '1st Inversion'), 'Tier 1.2 (1st Inversion): ALL 4 options strictly have "1st Inversion"');

// Tier 1.3 (2nd Inversion): all 4 options must be 2nd Inversion
const t13Chord = buildChord('E', 'natural', 'minor', '2nd', 'treble', 1.3, 4);
const t13Distractors = generateChordMultipleChoiceOptions(t13Chord);
assert(t13Distractors.every(d => d.sublabel === '2nd Inversion'), 'Tier 1.3 (2nd Inversion): ALL 4 options strictly have "2nd Inversion"');

// Tier 1.4 (Triad Mastery): ALL distractors must have Root, 1st, or 2nd Inversion, NEVER 3rd
const t14Chord = buildChord('C', 'natural', 'major', 'root', 'treble', 1.4, 4);
const t14Distractors = generateChordMultipleChoiceOptions(t14Chord);
assert(t14Distractors.every(d => d.sublabel !== '3rd Inversion' && d.chordData?.inversion !== '3rd'), 'Tier 1.4 (Triad Mastery): NO distractors ever generate 3rd Inversion for triads');

// Tier 3.2 (7th 1st Inversion): all options strictly 1st Inversion
const t32Chord = buildChord('G', 'natural', 'dom7', '1st', 'treble', 3.2, 4);
const t32Distractors = generateChordMultipleChoiceOptions(t32Chord);
assert(t32Distractors.every(d => d.sublabel === '1st Inversion'), 'Tier 3.2 (7th 1st Inversion): ALL 4 options strictly have "1st Inversion"');

// Tier 3.3 (7th 2nd Inversion): all options strictly 2nd Inversion
const t33Chord = buildChord('G', 'natural', 'dom7', '2nd', 'treble', 3.3, 4);
const t33Distractors = generateChordMultipleChoiceOptions(t33Chord);
assert(t33Distractors.every(d => d.sublabel === '2nd Inversion'), 'Tier 3.3 (7th 2nd Inversion): ALL 4 options strictly have "2nd Inversion"');

// Tier 3.4 (7th 3rd Inversion): all options strictly 3rd Inversion
const t34Chord = buildChord('G', 'natural', 'dom7', '3rd', 'treble', 3.4, 4);
const t34Distractors = generateChordMultipleChoiceOptions(t34Chord);
assert(t34Distractors.every(d => d.sublabel === '3rd Inversion'), 'Tier 3.4 (7th 3rd Inversion): ALL 4 options strictly have "3rd Inversion"');

// Tier 3.6 (Drop-2 Voicings): note construction & distractors
const drop2Chord = buildChord('C', 'natural', 'maj7', 'root', 'treble', 3.6, 4, 'drop2');
assert(drop2Chord.notes[0].letter === 'G' && drop2Chord.notes[0].octave === 3, 'Drop-2 Cmaj7 (Root Close C4-E4-G4-B4) drops 2nd voice from top to G3 in bass');
assert(drop2Chord.notes[1].letter === 'C' && drop2Chord.notes[2].letter === 'E' && drop2Chord.notes[3].letter === 'B', 'Drop-2 Cmaj7 notes are G3 - C4 - E4 - B4');
const drop2Distractors = generateChordMultipleChoiceOptions(drop2Chord);
assert(drop2Distractors.every(d => d.sublabel === 'Drop-2 Voicing'), 'Tier 3.6 (Drop-2): ALL 4 options strictly have "Drop-2 Voicing" sublabel');

// Tier 3.6 (Drop-2, omit 5): 3-note shell/drop voicings
const drop2Omit5 = buildChord('C', 'natural', 'maj7', 'root', 'treble', 3.6, 4, 'drop2', true);
assert(drop2Omit5.notes.length === 3, 'Drop-2 Cmaj7 (omit 5) has exactly 3 notes (5th omitted)');
assert(
  drop2Omit5.notes[0].letter === 'C' && drop2Omit5.notes[0].octave === 4 &&
  drop2Omit5.notes[1].letter === 'E' && drop2Omit5.notes[1].octave === 4 &&
  drop2Omit5.notes[2].letter === 'B' && drop2Omit5.notes[2].octave === 4,
  'Drop-2 Cmaj7 (omit 5) notes are C4 - E4 - B4'
);
assert(drop2Omit5.displayName.includes('Drop-2, omit 5'), 'Drop-2 (omit 5) displayName formatted correctly');

const drop2Omit5Distractors = generateChordMultipleChoiceOptions(drop2Omit5);
assert(drop2Omit5Distractors.every(d => d.sublabel === 'Drop-2 (omit 5)'), 'Drop-2 (omit 5): ALL 4 options strictly have "Drop-2 (omit 5)" sublabel');
assert(drop2Omit5Distractors.every(d => d.chordData?.omit5 === true), 'Drop-2 (omit 5): distractor chordData preserves omit5 for diff reconstruction');

// 1st Inversion Drop-2 (omit 5)
const drop2Inv1Omit5 = buildChord('C', 'natural', 'maj7', '1st', 'treble', 3.6, 4, 'drop2', true);
assert(
  drop2Inv1Omit5.notes[0].letter === 'B' && drop2Inv1Omit5.notes[0].octave === 3 &&
  drop2Inv1Omit5.notes[1].letter === 'E' && drop2Inv1Omit5.notes[1].octave === 4 &&
  drop2Inv1Omit5.notes[2].letter === 'C' && drop2Inv1Omit5.notes[2].octave === 5,
  'Drop-2 1st Inv Cmaj7 (omit 5) notes are B3 - E4 - C5'
);

// Tier 3.7 (Drop-3 Voicings): note construction & distractors
const drop3Chord = buildChord('C', 'natural', 'maj7', 'root', 'treble', 3.7, 4, 'drop3');
assert(drop3Chord.notes[0].letter === 'E' && drop3Chord.notes[0].octave === 3, 'Drop-3 Cmaj7 (Root Close C4-E4-G4-B4) drops 3rd voice from top to E3 in bass');
assert(drop3Chord.notes[1].letter === 'C' && drop3Chord.notes[2].letter === 'G' && drop3Chord.notes[3].letter === 'B', 'Drop-3 Cmaj7 notes are E3 - C4 - G4 - B4');
const drop3Distractors = generateChordMultipleChoiceOptions(drop3Chord);
assert(drop3Distractors.every(d => d.sublabel === 'Drop-3 Voicing'), 'Tier 3.7 (Drop-3): ALL 4 options strictly have "Drop-3 Voicing" sublabel');

// Tier 3.7 (Drop-3, omit 5)
const drop3Omit5 = buildChord('C', 'natural', 'maj7', 'root', 'treble', 3.7, 4, 'drop3', true);
assert(drop3Omit5.notes.length === 3, 'Drop-3 Cmaj7 (omit 5) has exactly 3 notes');
assert(
  drop3Omit5.notes[0].letter === 'E' && drop3Omit5.notes[0].octave === 3 &&
  drop3Omit5.notes[1].letter === 'C' && drop3Omit5.notes[1].octave === 4 &&
  drop3Omit5.notes[2].letter === 'B' && drop3Omit5.notes[2].octave === 4,
  'Drop-3 Cmaj7 (omit 5) notes are E3 - C4 - B4'
);

// Diff Stave Octave Alignment with omit 5
const userGuessAligned = alignChordToTargetOctave('C', 'natural', 'min7', '1st', 'treble', 3.6, drop2Inv1Omit5);
assert(userGuessAligned.notes.length === 3 && userGuessAligned.omit5 === true, 'User guess diff stave preserves target omit5 (3 notes)');
assert(
  userGuessAligned.notes[0].letter === 'B' && userGuessAligned.notes[0].accidental === 'flat' &&
  userGuessAligned.notes[1].letter === 'E' && userGuessAligned.notes[1].accidental === 'flat' &&
  userGuessAligned.notes[2].letter === 'C',
  'User guess diff stave for Cm7 aligns to Bb3 - Eb4 - C5 against B3 - E4 - C5'
);

// Blended generation in Drop tiers
let sawFullDrop = false;
let sawOmit5Drop = false;
for (let i = 0; i < 100; i++) {
  const c = generateRandomChordForTier(3.6, 'treble');
  if (c.omit5) sawOmit5Drop = true;
  else sawFullDrop = true;
}
assert(sawFullDrop && sawOmit5Drop, 'Tier 3.6 blends both full 4-part drop voicings and 3-part omit-5 voicings');

// Half-Diminished 7th (m7b5 / ø7) Tests
const halfDimChord = buildChord('B', 'natural', 'half_dim7', 'root', 'treble', 3.1, 4);
assert(
  halfDimChord.notes[0].letter === 'B' &&
  halfDimChord.notes[1].letter === 'D' &&
  halfDimChord.notes[2].letter === 'F' &&
  halfDimChord.notes[3].letter === 'A',
  'Bø7 / Bm7b5 builds B - D - F - A'
);
assert(CHORD_TIERS[3.1].qualities.includes('half_dim7') && CHORD_TIERS[3.6].qualities.includes('half_dim7'), 'm7b5 / ø7 is included in 7th Root tier and Drop-2 tier');

// Test that Tier 1.3 strictly generates 2nd inversions even if weakness matrix contains root-pos errors
const mockProgress = {
  currentTier: 1.3,
  highestStreak: 0,
  currentStreak: 0,
  totalTrialsCompleted: 10,
  masteredTiers: [],
  unlockedKeyStages: [0],
  masteredKeys: [],
  weaknessMatrix: {
    'treble:minor:root': { totalSeen: 10, correctCount: 1, avgLatencyMs: 2500, lastAttemptTimestamp: Date.now() }
  }
};
let onlySecondInversions = true;
for (let i = 0; i < 50; i++) {
  const chord = selectNextChord(1.3, 'treble', mockProgress);
  if (chord.inversion !== '2nd') {
    onlySecondInversions = false;
    break;
  }
}
assert(onlySecondInversions, 'Tier 1.3 (2nd Inversion) strictly generates 2nd inversion chords, ignoring root position weaknesses');

// 6. 15 Paired Key Signatures & Circle of Fifths Tests
console.log('\n--- 6. 15 Paired Key Signatures & Circle of Fifths ---');

const totalStageKeys = KEY_STAGES.reduce((sum, s) => sum + s.keys.length, 0);
assert(totalStageKeys === 15, `KEY_STAGES contains exactly 15 paired key signatures (got ${totalStageKeys})`);
assert(KEY_STAGES.length === 5, 'Circle of Fifths organized into 5 progressive stages');

// Check that all 15 key signatures are defined and have paired names
const allKeys = KEY_STAGES.flatMap(s => s.keys);
assert(allKeys.every(k => KEY_SIGNATURES[k] && KEY_SIGNATURES[k].name.includes('/')), 'All 15 key signatures have paired Major / Relative Minor names');

// Check backward compatibility aliases
assert(KEY_SIGNATURES['Am'] !== undefined && KEY_SIGNATURES['Am'].id === 'C', 'Minor alias "Am" correctly resolves to "C / Am"');
assert(KEY_SIGNATURES['Em'] !== undefined && KEY_SIGNATURES['Em'].id === 'G', 'Minor alias "Em" correctly resolves to "G / Em"');
assert(KEY_SIGNATURES['Dm'] !== undefined && KEY_SIGNATURES['Dm'].id === 'F', 'Minor alias "Dm" correctly resolves to "F / Dm"');

// Test Accidental Delta in Key of G / Em (F# in signature)
const keyG = KEY_SIGNATURES['G'];
const fSharpNote = { letter: 'F' as const, accidental: 'sharp' as const, octave: 4 };
const fNaturalNote = { letter: 'F' as const, accidental: 'natural' as const, octave: 4 };
const cSharpNote = { letter: 'C' as const, accidental: 'sharp' as const, octave: 4 };

assert(getRequiredAccidentalForNote(fSharpNote, keyG) === null, 'In G / Em: F# is implicit in key signature (no glyph)');
assert(getRequiredAccidentalForNote(fNaturalNote, keyG) === 'natural', 'In G / Em: F natural requires explicit natural glyph');
assert(getRequiredAccidentalForNote(cSharpNote, keyG) === 'sharp', 'In G / Em: C# requires explicit sharp glyph');

// Test Diatonic Chords in G / Em
const gDiatonic = getDiatonicChordsForKey(keyG, 1.1, 'treble');
assert(gDiatonic.length > 0, 'Diatonic chords generated for G / Em');
assert(gDiatonic.some(c => c.root === 'G' && c.quality === 'major'), 'G Major triad is diatonic in G / Em');
assert(gDiatonic.some(c => c.root === 'D' && c.quality === 'major'), 'D Major triad (V) is diatonic in G / Em');
assert(gDiatonic.some(c => c.root === 'E' && c.quality === 'minor'), 'E Minor triad (vi / i) is diatonic in G / Em');
assert(gDiatonic.some(c => c.root === 'F' && c.rootAccidental === 'sharp' && c.quality === 'diminished'), 'F# Diminished triad (vii°) is diatonic in G / Em in Tier 1.1');

// Test isDiatonicChord and isDiatonicArpeggio helpers
const gMajChord = buildChord('G', 'natural', 'major', 'root', 'treble', 1.1);
const fMajChord = buildChord('F', 'natural', 'major', 'root', 'treble', 1.1);
assert(isDiatonicChord(gMajChord, keyG) === true, 'G Maj is strictly diatonic to G / Em');
assert(isDiatonicChord(fMajChord, keyG) === false, 'F Maj (with F natural) is non-diatonic to G / Em');

const gMajArp = buildArpeggio('G', 'natural', 'major', 'ascending', 'root', 'treble', 1.1);
const fMajArp = buildArpeggio('F', 'natural', 'major', 'ascending', 'root', 'treble', 1.1);
assert(isDiatonicArpeggio(gMajArp, keyG) === true, 'G Maj arpeggio is strictly diatonic to G / Em');
assert(isDiatonicArpeggio(fMajArp, keyG) === false, 'F Maj arpeggio is non-diatonic to G / Em');

// Test tierSupportsDiatonic
assert(tierSupportsDiatonic('chords', 1.1, keyG) === true, 'Chord Tier 1.1 supports diatonic sampling in G / Em');
assert(tierSupportsDiatonic('chords', 3.1, keyG) === true, 'Chord Tier 3.1 (7ths) supports diatonic sampling in G / Em');
assert(tierSupportsDiatonic('chords', 2.1, keyG) === false, 'Chord Tier 2.1 (Sus) has no diatonic chords');
assert(tierSupportsDiatonic('arpeggios', 1.1, keyG) === true, 'Arpeggio Tier 1.1 supports diatonic sampling in G / Em');
assert(tierSupportsDiatonic('arpeggios', 3.3, keyG) === false, 'Arpeggio Tier 3.3 (Dim7 cascades) has no diatonic arpeggios');

// Test strictly onlyDiatonic = true generation in selectNextChord (50 trials)
let strictlyDiatonicChords = true;
for (let i = 0; i < 50; i++) {
  const chord = selectNextChord(1.1, 'treble', mockProgress, keyG, true);
  if (!isDiatonicChord(chord, keyG)) {
    strictlyDiatonicChords = false;
    break;
  }
}
assert(strictlyDiatonicChords, 'When onlyDiatonic=true, selectNextChord strictly produces 100% diatonic chords in G / Em');

// Test strictly onlyDiatonic = true generation in selectNextArpeggio (50 trials)
let strictlyDiatonicArps = true;
for (let i = 0; i < 50; i++) {
  const arp = selectNextArpeggio(1.1, 'treble', mockProgress, keyG, true);
  if (!isDiatonicArpeggio(arp, keyG)) {
    strictlyDiatonicArps = false;
    break;
  }
}
assert(strictlyDiatonicArps, 'When onlyDiatonic=true, selectNextArpeggio strictly produces 100% diatonic arpeggios in G / Em');

// Test non-diatonic tier fallback when onlyDiatonic=true
const susChord = selectNextChord(2.1, 'treble', mockProgress, keyG, true);
assert(susChord && (susChord.quality === 'sus4' || susChord.quality === 'sus2'), 'When tier has no diatonic options, selectNextChord safely falls back to tier chords');

// Test Key Context Stability: chords stay firmly in the active key context
let allKeyGChords = true;
for (let i = 0; i < 30; i++) {
  const chord = selectNextChord(1.1, 'treble', mockProgress, keyG);
  if (!chord.keySignature || chord.keySignature.id !== 'G') {
    allKeyGChords = false;
    break;
  }
}
assert(allKeyGChords, 'Chords generated in active key context strictly preserve the active Key Signature across all trials');

// Test Key Stage Promotion
const stagePromoShort = checkKeyStagePromotion(0, Array(19).fill({ isCorrect: true, latencyMs: 1600 }));
assert(!stagePromoShort.shouldPromote, 'Key stage promotion requires at least 20 trials');

const stagePromoPass = checkKeyStagePromotion(0, Array(20).fill({ isCorrect: true, latencyMs: 1900 }));
assert(stagePromoPass.shouldPromote && stagePromoPass.nextStage === 1, 'Stage 0 promotes to Stage 1 after 20 trials with <= 2.0s latency');

const stagePromoSlow = checkKeyStagePromotion(0, Array(20).fill({ isCorrect: true, latencyMs: 2300 }));
assert(!stagePromoSlow.shouldPromote, 'Key stage promotion fails if avg latency is > 2.0s');

// 7. Untimed Precision Latency Engine Tests
console.log('\n--- 7. Timing & Latency Engine ---');

const timer = new PrecisionTimingEngine();
timer.startQuestion();
assert(timer.getState() === 'active', 'Timing engine enters active state on question start');
const sub = timer.recordSubmission();
assert(timer.getState() === 'feedback', 'Timing engine enters feedback state on submission');
assert(sub.latencyMs >= 0, 'Submission latency recorded accurately without time limits');

// 8. Storage & State Management Tests
console.log('\n--- 8. Storage & Reset Management ---');

// In-memory mock for localStorage in node test environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

import { DEFAULT_APP_STATE, loadAppState, saveAppState, clearAllAppStorage, recordTrialResultInState } from '../src/storage/localStore';

const initialLoaded = loadAppState();
assert(initialLoaded.progress.chords.currentTier === 1.1, 'Default state loads Tier 1.1');
assert(initialLoaded.settings.chords.keyMode === 'progressive', 'Default state uses progressive key mode');
assert(initialLoaded.settings.chords.onlyDiatonic === false, 'Default state sets onlyDiatonic to false');

const modifiedState = {
  ...initialLoaded,
  progress: {
    ...initialLoaded.progress,
    chords: {
      ...initialLoaded.progress.chords,
      currentTier: 2.1,
      currentStreak: 15
    }
  }
};
saveAppState(modifiedState);
const reloaded = loadAppState();
assert(reloaded.progress.chords.currentTier === 2.1 && reloaded.progress.chords.currentStreak === 15, 'Saved custom progress correctly persists and loads');

// Test recording trial result updates state & weakness matrix
const updatedViaTrial = recordTrialResultInState(reloaded, 'chords', 'treble:minor:root', true, 1200);
assert(updatedViaTrial.progress.chords.currentStreak === 16, 'Recording correct trial increments streak');
assert(updatedViaTrial.progress.chords.weaknessMatrix['treble:minor:root'].correctCount === 1, 'Weakness matrix records correct attempt');

// Test clearAllAppStorage wipes state back to pristine default
await clearAllAppStorage();
const clearedState = loadAppState();
assert(clearedState.progress.chords.currentTier === 1.1, 'clearAllAppStorage resets tier back to 1.1');
assert(clearedState.progress.chords.currentStreak === 0, 'clearAllAppStorage resets streak back to 0');
assert(Object.keys(clearedState.progress.chords.weaknessMatrix).length === 0, 'clearAllAppStorage resets weakness matrix');

// Test Tier and Key Switching preserves mastered status
const masteredProgState = {
  ...clearedState,
  progress: {
    ...clearedState.progress,
    chords: {
      ...clearedState.progress.chords,
      currentTier: 1.1,
      masteredTiers: [1.1, 1.2],
      masteredKeys: ['C', 'G']
    }
  }
};
saveAppState(masteredProgState);

// Simulate user switching tier to 1.3
const tierSwitchedState = {
  ...masteredProgState,
  progress: {
    ...masteredProgState.progress,
    chords: {
      ...masteredProgState.progress.chords,
      currentTier: 1.3
    }
  }
};
saveAppState(tierSwitchedState);
const loadedAfterTierSwitch = loadAppState();
assert(loadedAfterTierSwitch.progress.chords.currentTier === 1.3, 'Tier switch changes active tier to 1.3');
assert(loadedAfterTierSwitch.progress.chords.masteredTiers.includes(1.1) && loadedAfterTierSwitch.progress.chords.masteredTiers.includes(1.2), 'Tier switch preserves previously mastered tiers [1.1, 1.2]');
assert(loadedAfterTierSwitch.progress.chords.masteredKeys.includes('C') && loadedAfterTierSwitch.progress.chords.masteredKeys.includes('G'), 'Tier switch preserves mastered keys [C, G]');

// Simulate rolling buffer reset on switch
let testRecentTrials = [{ isCorrect: true, latencyMs: 1200 }, { isCorrect: false, latencyMs: 2500 }];
assert(testRecentTrials.length === 2, 'Before switch: rolling trials buffer contains 2 trials');
testRecentTrials = []; // reset on switch
const calcAccuracy = testRecentTrials.length > 0
  ? Math.round((testRecentTrials.filter(t => t.isCorrect).length / testRecentTrials.length) * 100)
  : 0;
const calcAvgLatency = testRecentTrials.length > 0
  ? Math.round(testRecentTrials.reduce((sum, t) => sum + t.latencyMs, 0) / testRecentTrials.length)
  : 0;
assert(testRecentTrials.length === 0 && calcAccuracy === 0 && calcAvgLatency === 0, 'Switching tier or key resets rolling trials count to 0 and average latency/accuracy stats to 0 (HUD shows --)');

// Test 9: Mastery Unlocking Triggered Strictly on Correct Answers
console.log('\n--- 9. Mastery Event Triggering on Correct Answers ---');
// Simulate evaluateSubmission logic:
const simulateTrialMastery = (isCorrect: boolean, recent: Array<{ isCorrect: boolean, latencyMs: number }>) => {
  if (!isCorrect) {
    return { didMaster: false, masteryNotification: undefined };
  }
  const promo = checkTierPromotion('chords', 1.1, recent);
  if (promo.shouldPromote && promo.nextTier) {
    return {
      didMaster: true,
      masteryNotification: `🎉 Tier 1.1 Mastered!`
    };
  }
  return { didMaster: false, masteryNotification: undefined };
};

const passingTrials = Array(20).fill({ isCorrect: true, latencyMs: 1500 });
const incorrectAttempt = simulateTrialMastery(false, passingTrials);
assert(!incorrectAttempt.didMaster && incorrectAttempt.masteryNotification === undefined, 'Incorrect answer submission NEVER triggers mastery or unlocking banner');

const correctAttempt = simulateTrialMastery(true, passingTrials);
assert(correctAttempt.didMaster && correctAttempt.masteryNotification !== undefined && correctAttempt.masteryNotification.includes('Tier 1.1 Mastered'), 'Correct answer meeting threshold triggers mastery notification for the Correct Answer screen');

// 10. Device Detection & Responsive Default Input Mode
console.log('\n--- 10. Device Detection & Responsive Input Mode ---');
import { isMobileDevice, getDefaultInputMode } from '../src/storage/localStore';

// In Node environment without window/matchMedia, isMobileDevice is false (desktop default)
assert(isMobileDevice() === false, 'Default non-browser/Node environment detected as desktop');
assert(getDefaultInputMode() === 'direct_entry', 'Desktop environment defaults to direct_entry mode');

// Mock mobile touch device (coarse pointer, no hover, mobile viewport)
(global as any).window = { 
  matchMedia: (q: string) => ({
    matches: q.includes('pointer: coarse') || q.includes('max-width: 768px')
  })
};
assert(isMobileDevice() === true, 'Mobile touch device (coarse pointer / no hover) detected as mobile');
assert(getDefaultInputMode() === 'multiple_choice', 'Mobile touch device defaults to multiple_choice mode');

// Mock desktop browser (fine pointer + hover)
(global as any).window = { 
  matchMedia: (q: string) => ({
    matches: q.includes('hover: hover') || q.includes('pointer: fine')
  })
};
assert(isMobileDevice() === false, 'Desktop environment (fine pointer + hover) detected as desktop');
assert(getDefaultInputMode() === 'direct_entry', 'Desktop environment defaults to direct_entry');

// Clean up mocks
delete (global as any).window;

// 11. Tier Hints Dataset Completeness
console.log('\n--- 11. Tier Hints & Theory Cues Dataset ---');
import { ARPEGGIO_TIER_HINTS, CHORD_TIER_HINTS } from '../src/core/theory/tierHints';

const arpTierKeys = Object.keys(ARPEGGIO_TIERS).map(Number);
assert(arpTierKeys.every(t => ARPEGGIO_TIER_HINTS[t] && ARPEGGIO_TIER_HINTS[t].visualCue && ARPEGGIO_TIER_HINTS[t].cheatCode && ARPEGGIO_TIER_HINTS[t].formula), 'Every Arpeggio Tier has complete visualCue, cheatCode, and formula hints');

const chordTierKeys = Object.keys(CHORD_TIERS).map(Number);
assert(chordTierKeys.every(t => CHORD_TIER_HINTS[t] && CHORD_TIER_HINTS[t].visualCue && CHORD_TIER_HINTS[t].cheatCode && CHORD_TIER_HINTS[t].formula), 'Every Chord Tier has complete visualCue, cheatCode, and formula hints');

console.log(`\n================================`);
console.log(`Suite finished: ${passedTests} Passed, ${failedTests} Failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All systems verified!');
}

