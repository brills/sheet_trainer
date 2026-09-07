# Sheet Trainer — Technical Architecture & Implementation Plan

> [!NOTE]
> **Zero-Server Architecture**: This application runs 100% in the user's browser as a static Single Page Application (SPA / PWA). No backend, database, or external tracking is required. All user data, analytics, and weakness profiles persist locally.

---

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph UI ["User Interface (React + Tailwind CSS)"]
        Nav["Navigation Bar (Chords / Arpeggios / Analytics)"]
        NotationBox["Notation Flash Stage (VexFlow SVG)"]
        SlotBuffer["Interactive 4-Slot Input Bar (Root | Acc | Quality | Inv)"]
        KeyLegend["Persistent Desktop Keymap Legend HUD"]
        StatsHUD["Real-Time Latency & Accuracy HUD"]
    end

    subgraph Core ["Core Engine (TypeScript)"]
        InputStateMachine["Input Buffer & Key State Machine"]
        TimingEngine["Precision Timing Engine (performance.now)"]
        TheoryGen["Music Theory & Notation Generator"]
        AdaptiveEngine["Adaptive Weakness & Spaced Repetition Engine"]
    end

    subgraph Storage ["Browser Local Storage"]
        LS["LocalStorage (Settings, Progress & Weakness Matrices)"]
        IDB["IndexedDB (Granular Trial Logs & Telemetry)"]
        ExportImport["JSON Export / Import Bridge"]
    end

    SlotBuffer --> InputStateMachine
    KeyLegend -.-> SlotBuffer
    InputStateMachine --> TimingEngine
    TimingEngine --> AdaptiveEngine
    AdaptiveEngine --> TheoryGen
    TheoryGen --> NotationBox
    AdaptiveEngine --> LS
    TimingEngine --> IDB
    LS --> StatsHUD
    ExportImport <--> LS
    ExportImport <--> IDB
```

---

## 2. Tech Stack & Libraries

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Bundler & Dev Server** | **Vite** | Blazing fast builds, minimal bundle size, instant HMR. |
| **Framework & Language** | **React 18 + TypeScript** | Strong typing for complex music theory entities, predictable state transitions, component modularity. |
| **Styling & Design System** | **Tailwind CSS** | Zero-runtime CSS, mobile-first responsive utility classes, native dark-mode support. |
| **Music Notation Engine** | **VexFlow (v4/v5)** | High-precision vector SVG rendering, robust accidental/stem/beam rules, crisp on Retina/mobile screens. |
| **Icons & UI Extras** | **Lucide React** | Lightweight, clean SVG icons for settings, stats, and navigation. |
| **Persistence Layers** | **LocalStorage + `idb-keyval`** | Synchronous fast reads for app state; asynchronous IndexedDB for heavy telemetry logging. |

---

## 3. Clean Separation of Settings vs. Progress

To maintain a clean architectural boundary:
* **`settings`:** User preferences and configurations (what the user controls).
* **`progress`:** Achievements, streaks, unlocked tiers, and weakness analytics (what the system records).

### Tier 1: `LocalStorage` (`sheet_trainer_state_v1`)

```typescript
interface AppState {
  version: number;
  
  // 1. USER CONFIGURATIONS & PREFERENCES
  settings: {
    theme: 'dark' | 'light' | 'system';
    showKeymapLegend: boolean;          // Default: true on desktop
    chords: TrackSettings;
    arpeggios: TrackSettings;
  };

  // 2. USER ACHIEVEMENTS, STATE & ANALYTICS
  progress: {
    chords: TrackProgress;
    arpeggios: TrackProgress;
  };
}

interface TrackSettings {
  clef: 'treble' | 'bass' | 'grand';    // Default: 'treble'
  inputMode: 'direct_entry' | 'multiple_choice' | 'shape_only';
  flashMode: 'fixed' | 'adaptive';
  flashDurationMs: number;              // e.g. 300ms
  keyMode: 'progressive' | 'locked' | 'all_unlocked';
  activeKeyId: string;                  // e.g. 'C', 'G', 'Am'
}

interface TrackProgress {
  currentTier: number;                  // e.g. 1.1, 1.2, 3.1...
  highestStreak: number;
  currentStreak: number;
  totalTrialsCompleted: number;
  masteredTiers: number[];              // List of completed tier IDs
  unlockedKeyStages: number[];          // Circle of Fifths stages (0 to 4)
  masteredKeys: string[];               // Mastered key signature IDs
  weaknessMatrix: Record<string, PatternStats>;
}

interface PatternStats {
  totalSeen: number;
  correctCount: number;
  avgLatencyMs: number;
  lastAttemptTimestamp: number;
}

export type VoicingType = 'close' | 'drop2' | 'drop3';

export interface ChordDefinition {
  id: string;
  root: NoteLetter;
  rootAccidental: Accidental;
  quality: ChordQuality;
  inversion: Inversion;
  notes: NotePitch[];
  clef: Clef;
  tier: number;
  displayName: string;
  voicing?: VoicingType;
  omit5?: boolean;
  keySignature?: KeySignatureDefinition;
}
```

### Tier 2: `IndexedDB` (Telemetry & Granular Trial Logs)
Every trial creates an immutable log entry in object store `trials`:

```typescript
interface TrialLog {
  id: string;              // UUID
  timestamp: number;       // Epoch ms
  track: 'chords' | 'arpeggios';
  clef: 'treble' | 'bass';
  patternId: string;       // e.g., "C#_MIN_1ST_INV" or "G_MAJ_ASC_ROOT"
  root: string;            // "C#"
  quality: string;         // "minor"
  inversionOrShape: string;// "1st" or "ascending"
  flashDurationMs: number; // Exposure duration
  latencyMs: number;       // Response time from reveal
  isCorrect: boolean;
  userInput: string;
  correctAnswer: string;
}
```

---

## 4. Chord Input UX & State Machine (Direct Entry)

To eliminate key collisions (such as the letter `F` meaning Note **F** vs. **Flat ♭**) and make chord entry lightning-fast ($<0.5\text{s}$), the trainer uses an **Auto-Advancing 4-Slot Buffer**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SLOT BUFFER DISPLAY (UI)                        │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│   [ 1. ROOT ]     │  [ 2. ACCIDENTAL] │   [ 3. QUALITY ]  │ [ 4. INV ] │
│        C          │         ♯         │         m         │    1st     │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

### How the State Machine Handles Input (Zero Friction):

1. **Slot 1 — Root Note:** Press `A`, `B`, `C`, `D`, `E`, `F`, or `G`.
   * *Slot 1 fills immediately.* State advances to Slot 2.
2. **Slot 2 — Accidental (Optional / Auto-Skip):**
   * Press `S` or `#` for **Sharp (♯)**.
   * Press `B` or `-` for **Flat (♭)**. (Since Root is already chosen, `B` safely maps to Flat).
   * *Smart Skip:* If the note is natural, the user **does not need to press anything**—typing a Quality key (like `m` or `M`) fills natural by default and jumps directly to Slot 3!
3. **Slot 3 — Quality / Type:**
   * Press `M` for **Major**, `m` for **Minor**, `d` for **Dim**, `a` for **Aug**, `7` for **Dom7**, `j` for **Maj7**, `k` for **Min7**, `4` for **Sus4**.
   * *Slot 3 fills.* State advances to Slot 4.
4. **Slot 4 — Inversion (Auto-Submit):**
   * Press `0` or `r` for **Root Pos**, `1` for **1st Inv**, `2` for **2nd Inv**, `3` for **3rd Inv**.
   * *Immediate Auto-Submit:* The moment the inversion key is pressed, the answer is checked instantly (no `Enter` required).

> **Real-World Typing Examples:**
> * $C\text{ minor 1st inv} \rightarrow$ Type: `c` $\rightarrow$ `m` $\rightarrow$ `1` (3 keystrokes, $\approx 300\text{ms}$)
> * $F\sharp\text{ Maj root pos} \rightarrow$ Type: `f` $\rightarrow$ `s` $\rightarrow$ `M` $\rightarrow$ `0` (4 keystrokes, $\approx 400\text{ms}$)
> * $B\flat\text{ dim 2nd inv} \rightarrow$ Type: `b` $\rightarrow$ `b` $\rightarrow$ `d` $\rightarrow$ `2` (4 keystrokes)

---

## 5. Input Modes & Desktop Keymap Legend

The user can configure different input modes independently for Chords and Arpeggios:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AVAILABLE INPUT MODES                         │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│ 1. Direct Entry Buffer   │ 2. Rapid Multiple Choice│ 3. Shape Reflex   │
│ (Type full chord in 3-4  │ (Pick from 4 smart      │ (Inversion/contour│
│  instant strokes)        │  distractor cards: 1-4) │  only: keys 0-3)  │
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

### Persistent Desktop Keymap Legend HUD
On desktop, a slim cheat sheet stays visible at the bottom of the screen:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [A-G] Root | [S]♯ [B]♭ | [m]Min [M]Maj [d]Dim [a]Aug [7]Dom7 [j]Maj7 | [0-3] Inversion │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Precision Flash Timing & Double-Buffering

Sub-second visual training (150ms–500ms) requires strict frame-budget management to avoid visual jitter or inaccurate flash durations.

```mermaid
sequenceDiagram
    participant Generator as Problem Generator
    participant Offscreen as Off-Screen SVG Buffer
    participant Stage as Visible Flash Stage
    participant User as User Input
    participant Engine as Timing Engine

    Generator->>Offscreen: 1. Pre-render next chord/arpeggio SVG off-screen
    Note over Stage: Ready state (idle / countdown)
    Engine->>Stage: 2. Swap pre-rendered SVG to visible (t0 = performance.now())
    Note over Stage: Visible for Duration (e.g. 300ms)
    Engine->>Stage: 3. Mask / Blank the SVG (t1 = performance.now())
    User->>Engine: 4. Single-stroke keypress / Touch input (t2 = performance.now())
    Engine->>Engine: 5. Calculate Latency = (t2 - t0)
    Engine->>Generator: 6. Trigger next off-screen pre-render
```

1. **Pre-rendering (Double-Buffering):** Notation SVGs are generated ahead of time in an off-screen container. Swapping them into view takes $<1\text{ms}$ with zero DOM recalculation lag.
2. **High-Resolution Timers:** All timestamps use `performance.now()` (monotonic sub-millisecond precision) rather than `Date.now()`.
3. **Fixed Stage Dimensions:** The notation stage has a locked aspect ratio and height, eliminating Cumulative Layout Shift (CLS).

---

## 7. Adaptive Problem Generation Algorithm

The generator selects the next pattern using a weighted probability distribution derived from the user's historical error rates and reaction latency within the **active track**:

$$\text{Weight}(p) = 1.0 + \left(2.5 \times \text{ErrorRate}(p)\right) + \left(\frac{\text{AvgLatencyMs}(p)}{1000}\right) + \text{RecencyDecay}(p)$$

* **Weakness Amplification:** A chord inversion or arpeggio contour with a $40\%$ error rate is generated $\approx 3\times$ more frequently than a mastered one.
* **Speed Adaptation:** If the user maintains $>90\%$ accuracy with latency $<400\text{ms}$ over the last 15 trials in a tier, flash duration decreases automatically ($500\text{ms} \rightarrow 350\text{ms} \rightarrow 200\text{ms}$).
* **Tier Promotion Gate:** Achieving $\ge 90\%$ accuracy and $<600\text{ms}$ average latency over 20 consecutive trials unlocks the next curriculum tier.

---

## 8. Component & File Hierarchy

```
sheet_trainer/
├── public/
│   ├── favicon.ico
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── Navigation.tsx         # Top-level route switch (Chords / Arpeggios / Analytics)
│   │   ├── TrackHeader.tsx        # Track-specific settings bar (clef, input mode, flash duration)
│   │   ├── NotationStage.tsx      # VexFlow SVG renderer with double-buffer
│   │   ├── SlotBufferInput.tsx    # 4-slot visual buffer & touch/keyboard handler
│   │   ├── MultipleChoicePad.tsx  # 4-card rapid distractor pad
│   │   ├── ShapeReflexPad.tsx     # Inversion/contour speed reflex pad
│   │   ├── KeymapLegendHUD.tsx    # Persistent on-screen desktop keymap cheat sheet
│   │   ├── StatsHUD.tsx           # Real-time latency, streak, accuracy
│   │   ├── AnalyticsView.tsx      # Track-specific weakness heatmap & progress charts
│   │   └── TierSelector.tsx       # Curriculum roadmap & progress tracker
│   ├── core/
│   │   ├── theory/
│   │   │   ├── notes.ts           # Pitch, clef, and accidental definitions
│   │   │   ├── chords.ts          # Triads, 7ths, inversions, and voicings
│   │   │   ├── arpeggios.ts       # Contour patterns, beams, Alberti figures
│   │   │   └── vexflowAdapter.ts  # Converts theory models into VexFlow SVG primitives
│   │   ├── stateMachine.ts        # 4-slot buffer input state machine
│   │   ├── adaptiveEngine.ts      # Track-isolated weakness weighting & spaced repetition
│   │   ├── distractorEngine.ts    # Cognitive trap distractor generator
│   │   └── timingEngine.ts        # Sub-millisecond flash & latency timers
│   ├── storage/
│   │   ├── localStore.ts          # LocalStorage state management (chords/arpeggios)
│   │   ├── telemetryStore.ts      # IndexedDB trial logging
│   │   └── exportImport.ts        # JSON backup and restore utilities
│   ├── App.tsx                    # Main router & app container
│   └── main.tsx                   # React root mount
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```
