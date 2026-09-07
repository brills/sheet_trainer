export type Clef = 'treble' | 'bass' | 'grand';
export type InputMode = 'direct_entry' | 'multiple_choice' | 'shape_only';
export type FlashMode = 'fixed' | 'adaptive';
export type TrackType = 'chords' | 'arpeggios';
export type AppRoute = 'chords' | 'arpeggios' | 'analytics' | 'settings';

export type Accidental = 'natural' | 'sharp' | 'flat' | 'double_sharp' | 'double_flat';
export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type ChordQuality = 
  | 'major' 
  | 'minor' 
  | 'diminished' 
  | 'augmented' 
  | 'sus4' 
  | 'sus2' 
  | 'dom7' 
  | 'maj7' 
  | 'min7' 
  | 'half_dim7' 
  | 'dim7'
  | 'add9'
  | '6'
  | 'm6'
  | '9'
  | '7s9'
  | '7b9';

export type Inversion = 'root' | '1st' | '2nd' | '3rd';

export type ArpeggioContour = 'ascending' | 'descending' | 'arch' | 'valley' | 'alberti';
export type KeyMode = 'progressive' | 'locked' | 'all_unlocked';

export interface KeySignatureDefinition {
  id: string; // e.g. "C", "G", "F", "Am", "Eb"
  name: string; // e.g. "G Major", "E Minor"
  vexKey: string; // e.g. "G", "F", "Am", "Eb"
  mode: 'major' | 'minor';
  sharpsCount: number;
  flatsCount: number;
  stage: number; // 0 to 4
  accidentals: Partial<Record<NoteLetter, Accidental>>;
  scalePitches?: NotePitch[];
}

export interface NotePitch {
  letter: NoteLetter;
  accidental: Accidental; // 'natural' | 'sharp' | 'flat' | 'double_sharp' | 'double_flat'
  octave: number; // e.g. 4 for C4
}

export interface ChordDefinition {
  id: string; // e.g. "C_MIN_1ST_INV"
  root: NoteLetter;
  rootAccidental: Accidental;
  quality: ChordQuality;
  inversion: Inversion;
  notes: NotePitch[];
  clef: Clef;
  tier: number; // e.g. 1.1, 1.2, 3.1
  displayName: string; // e.g. "Cm / 1st Inv"
  keySignature?: KeySignatureDefinition;
}

export interface ArpeggioDefinition {
  id: string; // e.g. "C_MAJ_ASC_ROOT"
  root: NoteLetter;
  rootAccidental: Accidental;
  quality: ChordQuality;
  contour: ArpeggioContour;
  startingDegree: 'root' | '3rd' | '5th';
  notes: NotePitch[];
  clef: Clef;
  tier: number;
  displayName: string; // e.g. "C Maj (Ascending, Root)"
  isBeamed: boolean;
  keySignature?: KeySignatureDefinition;
}

export interface PatternStats {
  totalSeen: number;
  correctCount: number;
  avgLatencyMs: number;
  lastAttemptTimestamp: number;
}

export interface TrackSettings {
  clef: Clef;
  inputMode: InputMode;
  flashMode: FlashMode;
  flashDurationMs: number;
  feedbackDelayMs?: number;
  keyMode: KeyMode;
  activeKeyId: string;
}

export interface TrackProgress {
  currentTier: number;
  highestStreak: number;
  currentStreak: number;
  totalTrialsCompleted: number;
  masteredTiers: number[];
  unlockedKeyStages: number[];
  masteredKeys: string[];
  weaknessMatrix: Record<string, PatternStats>;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  showKeymapLegend: boolean;
  chords: TrackSettings;
  arpeggios: TrackSettings;
}

export interface AppState {
  version: number;
  settings: AppSettings;
  progress: {
    chords: TrackProgress;
    arpeggios: TrackProgress;
  };
}

export interface TrialLog {
  id: string;
  timestamp: number;
  track: TrackType;
  clef: Clef;
  patternId: string;
  root: string;
  quality: string;
  inversionOrShape: string;
  flashDurationMs: number;
  latencyMs: number;
  isCorrect: boolean;
  userInput: string;
  correctAnswer: string;
  keySignature?: string;
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
  isCorrect: boolean;
}

export interface SlotDiffItem {
  slot: 'root' | 'accidental' | 'quality' | 'inversion';
  label: string;
  userVal: string;
  correctVal: string;
  isMatch: boolean;
}

export interface TrialFeedback {
  isCorrect: boolean;
  userStr: string;
  correctStr: string;
  userChord?: ChordDefinition;
  correctChord?: ChordDefinition;
  userArpeggio?: ArpeggioDefinition;
  correctArpeggio?: ArpeggioDefinition;
  slotDiffs?: SlotDiffItem[];
  message?: string;
}
