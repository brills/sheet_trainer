import { NOTE_LETTERS, noteToMidi, transposePitch, formatNoteName } from '../src/core/theory/notes';
import { buildChord, CHORD_TIERS, CHORD_FORMULAS } from '../src/core/theory/chords';
import { buildArpeggio, ARPEGGIO_TIERS } from '../src/core/theory/arpeggios';
import { ChordInputStateMachine } from '../src/core/engines/stateMachine';
import { calculatePatternWeight, checkTierPromotion } from '../src/core/engines/adaptiveEngine';
import { generateChordMultipleChoiceOptions } from '../src/core/engines/distractorEngine';

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

// 2. Chord Inversion Tests
console.log('\n--- 2. Chord Inversions ---');
const cMajRoot = buildChord('C', 'natural', 'major', 'root', 'treble', 1.1);
assert(cMajRoot.notes.length === 3, 'C Major triad has 3 notes');
assert(cMajRoot.notes[0].letter === 'C' && cMajRoot.notes[1].letter === 'E' && cMajRoot.notes[2].letter === 'G', 'C Maj Root is C-E-G');

const cMaj1st = buildChord('C', 'natural', 'major', '1st', 'treble', 1.2);
assert(cMaj1st.notes[0].letter === 'E' && cMaj1st.notes[1].letter === 'G' && cMaj1st.notes[2].letter === 'C', 'C Maj 1st Inv is E-G-C (top 4th gap)');
assert(cMaj1st.notes[2].octave > cMaj1st.notes[0].octave, '1st Inv root C is on top');

const cMaj2nd = buildChord('C', 'natural', 'major', '2nd', 'treble', 1.3);
assert(cMaj2nd.notes[0].letter === 'G' && cMaj2nd.notes[1].letter === 'C' && cMaj2nd.notes[2].letter === 'E', 'C Maj 2nd Inv is G-C-E (bottom 4th gap)');

const c7th3rd = buildChord('C', 'natural', 'dom7', '3rd', 'treble', 3.2);
assert(c7th3rd.notes[0].letter === 'B' && c7th3rd.notes[0].accidental === 'flat', 'C7 3rd Inv has Bb in bass');

// Gb Maj vs G min vs Gb min tests
const gbMaj = buildChord('G', 'flat', 'major', 'root', 'treble', 1.1);
assert(
  gbMaj.notes[0].letter === 'G' && gbMaj.notes[0].accidental === 'flat' &&
  gbMaj.notes[1].letter === 'B' && gbMaj.notes[1].accidental === 'flat' &&
  gbMaj.notes[2].letter === 'D' && gbMaj.notes[2].accidental === 'flat',
  'Gb Major triad is Gb - Bb - Db'
);

const gMin = buildChord('G', 'natural', 'minor', 'root', 'treble', 1.1);
assert(
  gMin.notes[0].letter === 'G' && gMin.notes[0].accidental === 'natural' &&
  gMin.notes[1].letter === 'B' && gMin.notes[1].accidental === 'flat' &&
  gMin.notes[2].letter === 'D' && gMin.notes[2].accidental === 'natural',
  'G minor triad is G - Bb - D'
);

const gbMin = buildChord('G', 'flat', 'minor', 'root', 'treble', 1.1);
assert(
  gbMin.notes[0].letter === 'G' && gbMin.notes[0].accidental === 'flat' &&
  gbMin.notes[1].letter === 'B' && gbMin.notes[1].accidental === 'double_flat' &&
  gbMin.notes[2].letter === 'D' && gbMin.notes[2].accidental === 'flat',
  'Gb minor triad has B double-flat (Gb - Bbb - Db)'
);

// 3. Arpeggio Tests
console.log('\n--- 3. Arpeggio Contours ---');
const gAsc = buildArpeggio('G', 'natural', 'major', 'ascending', 'root', 'treble', 1.1);
assert(gAsc.notes.length === 4, 'Ascending arpeggio generates 4 notes');
assert(gAsc.notes[0].letter === 'G' && gAsc.notes[3].letter === 'G' && gAsc.notes[3].octave > gAsc.notes[0].octave, 'Ascending completes full octave');

// 4. Input State Machine Tests
console.log('\n--- 4. Input State Machine ---');
let completedResult: any = null;
const sm = new ChordInputStateMachine((res) => {
  completedResult = res;
});

// Test typing C -> m -> 1 (Cm 1st inv with auto-skip natural)
sm.handleKey('c');
assert(sm.getActiveSlot() === 1 && sm.getState().root === 'C', 'Typed "c": Root set to C, advanced to Slot 1');

sm.handleKey('m'); // Auto-skips accidental slot to quality
assert(sm.getActiveSlot() === 3 && sm.getState().accidental === 'natural' && sm.getState().quality === 'minor', 'Typed "m": Natural auto-filled, Quality set to minor, advanced to Slot 3');

sm.handleKey('1'); // Auto-submits
assert(completedResult !== null && completedResult.inversion === '1st', 'Typed "1": Auto-submitted 1st inversion');

// 5. Adaptive Weighting & Distractor Tests
console.log('\n--- 5. Adaptive Engine & Distractors ---');
const weightUnseen = calculatePatternWeight({ totalSeen: 0, correctCount: 0, avgLatencyMs: 400, lastAttemptTimestamp: 0 });
const weightWeak = calculatePatternWeight({ totalSeen: 10, correctCount: 4, avgLatencyMs: 900, lastAttemptTimestamp: 0 });
assert(weightWeak > weightUnseen, 'Weak patterns (40% accuracy) have higher sampling weight than normal patterns');

const promoCheckShort = checkTierPromotion('chords', 1.1, Array(19).fill({ isCorrect: true, latencyMs: 1500 }));
assert(!promoCheckShort.shouldPromote, 'Tier promotion requires at least 20 trials (19 trials does not promote)');

const promoCheckPass = checkTierPromotion('chords', 1.1, Array(20).fill({ isCorrect: true, latencyMs: 1800 }));
assert(promoCheckPass.shouldPromote && promoCheckPass.nextTier === 1.2, 'Tier promotion succeeds with 20 trials at 1.8s avg latency (<= 2.0s)');

const promoCheckSlow = checkTierPromotion('chords', 1.1, Array(20).fill({ isCorrect: true, latencyMs: 2200 }));
assert(!promoCheckSlow.shouldPromote, 'Tier promotion fails if avg latency exceeds 2.0s (2200ms)');

const distractors = generateChordMultipleChoiceOptions(cMajRoot);
assert(distractors.length === 4, 'Multiple choice generates exactly 4 options');
assert(distractors.filter(d => d.isCorrect).length === 1, 'Exactly 1 option is marked correct');

// Test that Tier 1.3 strictly generates 2nd inversions even if weakness matrix contains root-pos errors
import { selectNextChord } from '../src/core/engines/adaptiveEngine';
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

// 6. Key Signatures & Circle of Fifths Tests
console.log('\n--- 6. Key Signatures & Circle of Fifths ---');
import { KEY_SIGNATURES, KEY_STAGES, getRequiredAccidentalForNote, getDiatonicChordsForKey } from '../src/core/theory/keys';
import { checkKeyStagePromotion } from '../src/core/engines/adaptiveEngine';

assert(Object.keys(KEY_SIGNATURES).length >= 15, 'All major and minor key signatures defined');
assert(KEY_STAGES.length === 5, 'Circle of Fifths organized into 5 progressive stages');

// Test Accidental Delta in Key of G Major (F# in signature)
const keyG = KEY_SIGNATURES['G'];
const fSharpNote = { letter: 'F' as const, accidental: 'sharp' as const, octave: 4 };
const fNaturalNote = { letter: 'F' as const, accidental: 'natural' as const, octave: 4 };
const cSharpNote = { letter: 'C' as const, accidental: 'sharp' as const, octave: 4 };

assert(getRequiredAccidentalForNote(fSharpNote, keyG) === null, 'In G Major: F# is implicit in key signature (no glyph)');
assert(getRequiredAccidentalForNote(fNaturalNote, keyG) === 'natural', 'In G Major: F natural requires explicit natural glyph');
assert(getRequiredAccidentalForNote(cSharpNote, keyG) === 'sharp', 'In G Major: C# requires explicit sharp glyph');

// Test Diatonic Chords in G Major
const gDiatonic = getDiatonicChordsForKey(keyG, 1.1, 'treble');
assert(gDiatonic.length > 0, 'Diatonic chords generated for G Major');
assert(gDiatonic.some(c => c.root === 'G' && c.quality === 'major'), 'G Major triad is diatonic in G Major');
assert(gDiatonic.some(c => c.root === 'D' && c.quality === 'major'), 'D Major triad (V) is diatonic in G Major');

// Test Key Stage Promotion
const stagePromoShort = checkKeyStagePromotion(0, Array(19).fill({ isCorrect: true, latencyMs: 1600 }));
assert(!stagePromoShort.shouldPromote, 'Key stage promotion requires at least 20 trials');

const stagePromoPass = checkKeyStagePromotion(0, Array(20).fill({ isCorrect: true, latencyMs: 1900 }));
assert(stagePromoPass.shouldPromote && stagePromoPass.nextStage === 1, 'Stage 0 promotes to Stage 1 after 20 trials with <= 2.0s latency');

const stagePromoSlow = checkKeyStagePromotion(0, Array(20).fill({ isCorrect: true, latencyMs: 2300 }));
assert(!stagePromoSlow.shouldPromote, 'Key stage promotion fails if avg latency is > 2.0s');

// 7. Untimed Precision Latency Engine Tests
console.log('\n--- 7. Timing & Latency Engine ---');
import { PrecisionTimingEngine } from '../src/core/engines/timingEngine';

const timer = new PrecisionTimingEngine();
timer.startQuestion();
assert(timer.getState() === 'active', 'Timing engine enters active state on question start');
const sub = timer.recordSubmission();
assert(timer.getState() === 'feedback', 'Timing engine enters feedback state on submission');
assert(sub.latencyMs >= 0, 'Submission latency recorded accurately without time limits');

console.log(`\n================================`);
console.log(`Suite finished: ${passedTests} Passed, ${failedTests} Failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All systems verified!');
}
