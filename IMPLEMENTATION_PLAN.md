# Sheet Trainer — Step-by-Step Implementation Plan

> [!NOTE]
> This plan breaks down the construction of **Sheet Trainer** into 7 verifiable, modular phases. Each phase builds upon the previous one, ensuring zero regressions and continuous testability.

---

## Phase 1: Project Scaffolding & Environment Setup
* [x] **1.1 Initialize Vite Project:** Scaffold a clean React + TypeScript project in `/home/developer/agy_workdir/sheet_trainer`.
* [x] **1.2 Install Core Dependencies:**
  * `vexflow` (v4/v5 for SVG notation rendering)
  * `lucide-react` (icons for navigation, settings, stats)
  * `idb-keyval` (lightweight Promise-based IndexedDB wrapper)
  * `tailwindcss`, `postcss`, `autoprefixer` (modern responsive styling)
* [x] **1.3 Configure Styling & Typography:**
  * Configure Tailwind with dark/light themes and custom music notation sizing.
  * Add CSS `touch-action: manipulation` rules to eliminate mobile 300ms tap delay and prevent double-tap zoom.
* [x] **1.4 Setup Directory Structure:**
  * `src/core/theory/` (music theory logic & VexFlow adapter)
  * `src/core/engines/` (timing, adaptive weighting, input state machine)
  * `src/storage/` (LocalStorage, IndexedDB, export/import)
  * `src/components/` (UI stages, response pads, HUDs, charts)
  * `src/types/` (TypeScript definitions for AppState, Chords, Arpeggios, Telemetry)

---

## Phase 2: Music Theory Core & VexFlow Notation Engine
* [x] **2.1 Pitch & Clef Models (`src/core/theory/notes.ts`):**
  * Define pitch classes (`C`, `C#`, `Db`, `D`... `B`), accidentals, and octave registers.
  * Define staff line/space mapping for **Treble Clef** and **Bass Clef**.
* [x] **2.2 Chord Theory & Inversion Calculator (`src/core/theory/chords.ts`):**
  * Triad formulas: Major, Minor, Diminished ($°$), Augmented ($+$), $\text{Sus4}$, $\text{Sus2}$.
  * 7th chord formulas: Dom7, Maj7, Min7, Half-Dim ($ø7$), Dim7 ($°7$).
  * Extension formulas: $\text{add9}, 6, \text{m6}, 9\text{th}, 11\text{th}, 13\text{th}, 7\sharp9, 7\flat9$.
  * Inversion voice-leading calculator: Compute exact pitch octave offsets for Root, 1st, 2nd, and 3rd inversions.
* [x] **2.3 Arpeggio Theory & Contour Models (`src/core/theory/arpeggios.ts`):**
  * Contour generators: Linear Ascending ($\nearrow$), Linear Descending ($\searrow$), Arch ($\Lambda$), Alberti/Wave ($\sim$).
  * Inversion starting anchors ($1\text{-}3\text{-}5$, $3\text{-}5\text{-}1$, $5\text{-}1\text{-}3$).
  * Metric beam groupings (triplets vs. 16th-note 4-packs).
* [x] **2.4 VexFlow SVG Adapter (`src/core/theory/vexflowAdapter.ts`):**
  * Translate chord notes into `Vex.Flow.StaveNote` with proper accidentals and stem directions.
  * Translate arpeggio sequences into beamed `Vex.Flow.Beam` groups.
  * Render crisp, responsive, centered SVGs with zero layout shifts.

---

## Phase 3: Precision Timing Engine & Double-Buffered Stage
* [x] **3.1 Timing Engine (`src/core/engines/timingEngine.ts`):**
  * Implement monotonic high-resolution timer using `performance.now()`.
  * Flash controller supporting sub-second durations (**150ms – 800ms**) and untimed study mode.
  * Reaction latency tracker (time from reveal to user submission).
* [x] **3.2 Double-Buffered Notation Stage (`src/components/NotationStage.tsx`):**
  * Off-screen SVG rendering container: Pre-render the upcoming problem before revealing.
  * Instantaneous swap ($<1\text{ms}$) into view when flash starts.
  * Fixed-dimension masking stage to guarantee zero Cumulative Layout Shift (CLS).

---

## Phase 4: Input UX & 4-Slot Auto-Advancing State Machine
* [x] **4.1 Auto-Advancing Input State Machine (`src/core/engines/stateMachine.ts`):**
  * Implement slot transitions: `[1. Root] ──► [2. Accidental / Auto-Skip] ──► [3. Quality] ──► [4. Inversion / Auto-Submit]`.
  * Smart-skip natural accidentals when quality key is typed.
  * Auto-submit immediately upon typing the inversion digit (`0`–`3`).
* [x] **4.2 Slot Buffer Component (`src/components/SlotBufferInput.tsx`):**
  * Render the 4 visual slots with active focus indicator.
  * Desktop keyboard event listener with `event.repeat` protection.
  * Mobile touch buttons for single-tap slot input.
* [x] **4.3 Alternative Input Modes:**
  * `MultipleChoicePad.tsx`: 4-card rapid distractor selector (`1`–`4`).
  * `ShapeReflexPad.tsx`: Inversion-only speed reflex selector (`0`–`3`).
* [x] **4.4 Persistent Desktop Keymap Legend HUD (`src/components/KeymapLegendHUD.tsx`):**
  * Dynamic tier-aware cheat sheet bar.
  * Highlight keys in real-time as the user types.

---

## Phase 5: Storage Layer & Adaptive Analytics Engine
* [x] **5.1 Local Storage State Manager (`src/storage/localStore.ts`):**
  * Implement clean schema separation: `settings` (configurations) vs. `progress` (achievements & weakness matrix).
  * Independent storage trees for `chords` and `arpeggios`.
* [x] **5.2 Telemetry Store (`src/storage/telemetryStore.ts`):**
  * IndexedDB store logging every individual trial with sub-millisecond latency timestamps.
* [x] **5.3 Backup & Migration (`src/storage/exportImport.ts`):**
  * 1-click **Export Progress (JSON)** and **Restore Backup** utilities.
* [x] **5.4 Adaptive Problem Generator (`src/core/engines/adaptiveEngine.ts`):**
  * Implement formula-driven weakness weighting:
    $$P(p) \propto 1.0 + 2.5 \times \text{ErrorRate}(p) + \left(\frac{\text{AvgLatencyMs}(p)}{1000}\right)$$
  * Dynamic flash duration scaling ($800\text{ms} \rightarrow 400\text{ms} \rightarrow 250\text{ms} \rightarrow 150\text{ms}$).
  * Tier promotion gate evaluation ($\ge 85\%$ accuracy, $\le 2000\text{ms}$ average latency over 20 trials).
* [x] **5.5 Cognitive Distractor Engine (`src/core/engines/distractorEngine.ts`):**
  * Generates 3 intelligent trap distractors (Inversion Trap, Visual Shape Trap, Quality Trap) respecting tier constraints.

---

## Phase 6: Navigation, Dashboards & Curriculum Views
* [x] **6.1 Top-Level Navigation (`src/components/Navigation.tsx`):**
  * Route switches for **🎼 Chords**, **〰️ Arpeggios**, and **📊 Analytics**.
* [x] **6.2 Track Header & Config Bar (`src/components/TrackHeader.tsx`):**
  * Track-specific clef selector (`Treble` / `Bass`), input mode selector, and flash speed slider.
* [x] **6.3 Real-Time Stats HUD (`src/components/StatsHUD.tsx`):**
  * Display current streak, best streak, rolling accuracy percentage, and average latency.
* [x] **6.4 Curriculum Roadmap & Tier Selector (`src/components/TierSelector.tsx`):**
  * Visual tier selector showing unlocked and mastered tiers (Tiers 1.1 to 4.2).
* [x] **6.5 Analytics Dashboard (`src/components/AnalyticsView.tsx`):**
  * Weakness heatmaps by Inversion, Quality, and Clef.
  * Reaction time distribution and accuracy trend charts.

---

## Phase 7: Verification, Polish & PWA Manifest
* [x] **7.1 Unit & Logic Tests:**
  * Comprehensive automated test suite in `scripts/verify.ts` (99 tests covering music theory, state machine, adaptive engine, timing, storage, keys, and drop voicings).
* [x] **7.2 Offline PWA Setup:**
  * Configured `manifest.webmanifest` and Service Worker for full home-screen offline installation.
* [x] **7.3 Cross-Device Verification:**
  * Verified responsive layouts on desktop, tablet, and mobile viewport sizes.

---

## Phase 8: Advanced Harmony & Curriculum Enhancements
* [x] **8.1 7th Chord Inversion Sub-Tiers (Tiers 3.1–3.5):**
  * Deconstructed 7th inversions into individual sub-tiers matching Triad Tier 1 depth:
    * Tier 3.1: Root Position
    * Tier 3.2: 1st Inversion ($\text{6/5}$, top 2nd clash)
    * Tier 3.3: 2nd Inversion ($\text{4/3}$, middle 2nd clash)
    * Tier 3.4: 3rd Inversion ($\text{4/2}$, bottom 2nd clash)
    * Tier 3.5: 7th Inversion Mastery (mixed close inversions)
  * Integrated Half-Diminished ($ø7 / \text{m7}\flat5$) across all 7th tiers as one of the 4 diatonic qualities.
* [x] **8.2 Drop-2 & Drop-3 Voicings (Tiers 3.6–3.7):**
  * Open 4-part voicings (Drop-2 lowers 2nd voice from top $8\text{va}$; Drop-3 lowers 3rd voice from top $8\text{va}$).
  * Auto-bypasses inversion slot in Direct Entry mode (evaluating Root + Quality).
  * Multiple choice distractors generate uniform `Drop-2 Voicing` / `Drop-3 Voicing` sublabels without close inversion traps.
* [x] **8.3 Shell Voicings with 5th Omitted (`omit5`):**
  * Blends 3-note shell voicings ($\text{Root} + \text{3rd} + \text{7th}$) in Drop-2 and Drop-3 tiers.
  * Displays `Drop-2 (omit 5)` / `Drop-3 (omit 5)` in slot diffs and multiple choice sublabels.
* [x] **8.4 15 Paired Key Signatures & Circle of Fifths Progression:**
  * 15 key signatures organized into 5 progressive stages with paired Major / Relative Minor naming ($C / \text{Am}$, $G / \text{Em}$, $F / \text{Dm}$, etc.).
  * Interactive Circle of Fifths modal and key stage unlock gates ($\ge 85\%$ accuracy, $\le 2000\text{ms}$ latency over 20 trials).
* [x] **8.5 Side-by-Side Dual Stave Notation Diff:**
  * Reconstructs user's guess on a red stave in the exact octave register, voicing spread, and `omit5` state alongside the green target stave.

