# Sheet Trainer — System & Pedagogical Design Document

> [!NOTE]
> **Client-Side Only Architecture**: This application runs 100% in the user's browser as a static Single Page Application (SPA / PWA). No backend server, database, or external tracking is required. All user preferences, progress milestones, and weakness analytics persist locally in browser storage.

---

## 1. Executive Summary & Vision

**Sheet Trainer** is a specialized sight-reading trainer engineered to train musicians to read sheet music through **gestalt pattern recognition (chunking)** rather than serial, note-by-note decoding.

### Core Philosophy
* **Language Analogy:** Beginners decode letter-by-letter ($c-a-t \rightarrow$ "cat"); fluent readers recognize word silhouettes instantly.
* **Music Reading Reality:** Proficient sight-readers recognize visual chord stacks ("snowmen", interval gaps, step clashes) and horizontal arpeggio contours ($\nearrow, \searrow, \Lambda, \sim$) as unified cognitive units without verbally naming individual notes.
* **Tachistoscopic Training:** By flashing notation for sub-second durations (**150ms – 800ms**), the trainer disables sequential eye-scanning and forces the visual cortex to capture the entire pattern into iconic working memory.

---

## 2. Scope & Defaults

| Dimension | Specification |
| :--- | :--- |
| **Default Clef** | **Treble Clef** (G Clef) by default; **Bass Clef** available as an independent opt-in toggle per track. |
| **Input Modalities** | **Mobile Touch:** Ergonomic bottom thumb-pads.<br>**Desktop Keyboard:** 1-key rapid hotkeys & 4-slot auto-advancing buffer. |
| **Audio** | Excluded in initial version to maintain focus on visual-cognitive reflex. |
| **Virtual Keyboard** | Excluded in initial version (no piano keys) to maximize rapid-fire testing throughput. |
| **Analytics & Adaptation** | Real-time latency (ms) and error tracking; dynamically biases problem generation toward identified weak spots. |

---

## 3. Visual Geometry & Cognitive Cue System

Musicians identify chord types and inversions through geometric landmarks:

### A. Triad Inversion Geometry
```
Root Position (5/3)         1st Inversion (6/3)         2nd Inversion (6/4)
     [ 5th ]                     [ Root ] ◄── Top note!      [ 5th ]
        │ (3rd)                     │ (4th GAP)                 │ (3rd)
     [ 3rd ]                     [ 5th ]                     [ 3rd ]
        │ (3rd)                     │ (3rd)                     │ (4th GAP)
     [ Root ]                    [ 3rd ]                     [ Root ] ◄── Middle note!

 (Uniform Snowman)          (Wide gap at TOP)           (Wide gap at BOTTOM)
```

### B. 7th Chord Inversion Geometry (The "2nd Clash" Rule)
In all four-note 7th chord inversions, there is exactly one **interval of a 2nd** (adjacent line/space step). The position of this visual clash immediately exposes the root:
* **Root Position ($7$):** No 2nd interval; clean 4-tier stack (*L-L-L-L* or *S-S-S-S*).
* **1st Inversion ($\text{6/5}$):** The 2nd interval is at the **top** $\rightarrow$ Root is the top note of that clash.
* **2nd Inversion ($\text{4/3}$):** The 2nd interval is in the **middle** $\rightarrow$ Root is the top note of that clash.
* **3rd Inversion ($\text{4/2}$):** The 2nd interval is at the **bottom** $\rightarrow$ Root is the bottom note of the stack.

---

## 4. Curriculum Tiers & Progression

A **Tier** is a curriculum milestone grouping a specific category of musical patterns. Material progresses from basic geometric stacks to complex compound structures.

```
                    ┌───────────────────────────────────────┐
                    │             SHEET TRAINER             │
                    └──────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│ TRACK A: CHORDS & INVERSIONS  │             │ TRACK B: ARPEGGIOS & CONTOURS │
│ (Vertical Chunking)           │             │ (Horizontal Chunking)         │
├───────────────────────────────┤             ├───────────────────────────────┤
│ Tier 1: Major & Minor Triads  │             │ Tier 1: Basic Triad Sweeps    │
│ Tier 2: Dim, Aug, & Sus       │             │ Tier 2: Altered & Cross-Beam  │
│ Tier 3: 7th Chords (4 Invs)   │             │ Tier 3: 7th Sweeps & Cascades │
│ Tier 4: Extensions & Modifiers│             │ Tier 4: Grand Staff Patterns  │
└───────────────────────────────┘             └───────────────────────────────┘
```

### Track A: Chords & Inversions Tiers

* **Tier 1.1 — Triads (Root Position):** Major & Minor triads in root position (uniform "snowman" shape).
* **Tier 1.2 — Triads (1st Inversion):** Major & Minor in 1st inversion ($\text{6/3}$) (top 4th gap $\rightarrow$ root is on top).
* **Tier 1.3 — Triads (2nd Inversion):** Major & Minor in 2nd inversion ($\text{6/4}$) (bottom 4th gap $\rightarrow$ root is in middle).
* **Tier 1.4 — Triad Mastery:** Mixed root, 1st, and 2nd inversion triads.
* **Tier 2.1 — Altered Triads:** Diminished ($°$) and Augmented ($+$) in all inversions.
* **Tier 2.2 — Suspended Chords:** $\text{Sus4}$ and $\text{Sus2}$ (spotting 2nd/4th step clashes replacing the 3rd).
* **Tier 3.1 — 7th Chords (Root Position):** Dom7, Maj7, Min7, and Half-Diminished ($ø7 / \text{m7}\flat5$) in root position (4-tier towers).
* **Tier 3.2 — 7th Chords (1st Inversion):** $\text{6/5}$ inversions across Dom7, Maj7, Min7, and $ø7$ (spotting the **top 2nd clash** $\rightarrow$ top note of clash is root).
* **Tier 3.3 — 7th Chords (2nd Inversion):** $\text{4/3}$ inversions (spotting the **middle 2nd clash** $\rightarrow$ top note of clash is root).
* **Tier 3.4 — 7th Chords (3rd Inversion):** $\text{4/2}$ inversions (spotting the **bottom 2nd clash** $\rightarrow$ bottom note is root).
* **Tier 3.5 — 7th Inversion Mastery:** Mixed close-position 7th chords across all 4 inversions.
* **Tier 3.6 — Drop-2 Voicings:** Open 4-part voicings (2nd voice from top dropped $8\text{va}$), blending in 3-note **5th omitted shell voicings** ($\text{Root} + \text{3rd} + \text{7th}$).
* **Tier 3.7 — Drop-3 Voicings:** Wide open voicings (3rd voice from top dropped $8\text{va}$), blending in 3-note **5th omitted shell voicings**.
* **Tier 3.8 — Diminished 7ths:** Half-Diminished ($ø7$) and Fully Diminished ($°7$) across all inversions.
* **Tier 4.1 — Added Tone & 6th Chords:** $\text{add9}$, $6$, $\text{m6}$.
* **Tier 4.2 — Compound & Altered Chords:** $9\text{th}$, $7\sharp9$, $7\flat9$.

### Track B: Arpeggios & Contours Tiers

* **Tier 1.1 — Linear Sweeps:** Ascending ($\nearrow$) and Descending ($\searrow$) 3–4 note triad runs.
* **Tier 1.2 — Inverted Starting Anchors:** Arpeggios starting on 3rd ($3\text{-}5\text{-}1$) or 5th ($5\text{-}1\text{-}3$).
* **Tier 1.3 — Triad Contours:** Arches ($1\text{-}3\text{-}5\text{-}3\text{-}1$) and Alberti bass figures ($1\text{-}5\text{-}3\text{-}5$).
* **Tier 2.1 — Altered Arpeggios:** Diminished & Augmented sweeps.
* **Tier 2.2 — Metric Displacements:** 3-note patterns beamed across 4-note 16th groups.
* **Tier 3.1 — 7th Chord Sweeps:** 4-note Dom7, Maj7, Min7 sweeps.
* **Tier 3.2 — Inversion Spotting in Arpeggios:** Spotting the step-leap in broken sequences.
* **Tier 3.3 — Diminished 7th Cascades:** Symmetrical multi-octave ladders.

---

## 5. Input Mechanics & UX State Machine

### A. Direct Entry Mode (Auto-Advancing 4-Slot Buffer)
For typing full chord answers with zero key conflicts:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SLOT BUFFER DISPLAY (UI)                        │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│   [ 1. ROOT ]     │  [ 2. ACCIDENTAL] │   [ 3. QUALITY ]  │ [ 4. INV ] │
│        C          │         ♯         │         m         │    1st     │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

1. **Slot 1 (Root):** Press `A`, `B`, `C`, `D`, `E`, `F`, or `G`. (Advances to Slot 2).
2. **Slot 2 (Accidental / Smart Skip):**
   * Press `S` or `#` for **Sharp (♯)**.
   * Press `B` or `-` for **Flat (♭)**.
   * *Smart Skip:* If natural, typing a Quality key (e.g. `m`, `M`, `j`, `k`, `h`) **skips Slot 2 automatically** and fills Slot 3.
3. **Slot 3 (Quality):**
   * Press `M` (Maj), `m` (Min), `7` (Dom7), `j` (Maj7), `k` (Min7), `h` (Half-Dim $ø7$), `d` (Dim), `a` (Aug), `4` (Sus4), `2` (Sus2).
4. **Slot 4 (Inversion & Auto-Submit):**
   * Press `0` or `r` (Root Pos), `1` (1st Inv), `2` (2nd Inv), `3` (3rd Inv).
   * *Fixed Inversion & Drop Voicing Auto-Bypass:* In fixed-inversion tiers (e.g. 1.1, 1.2, 3.2) and Drop Voicing tiers (3.6, 3.7), Slot 4 is auto-populated and bypassed, evaluating immediately once Root + Quality are entered.

### B. Persistent Desktop Keymap Legend HUD
A dynamic, tier-aware cheat sheet stays permanently visible on desktop screens, displaying only the qualities relevant to the active tier with uniform, compact dimensions (`[h] ø7`, `[j] Maj7`, `[k] m7`, etc.).

### C. Side-by-Side Dual Stave Notation Diff
When a submission is incorrect, the feedback screen renders:
1. **User Guessed Stave (Red `#f43f5e`):** Reconstructed in the exact same octave register, voicing spread (`drop2`/`drop3`), and `omit5` state as the target chord.
2. **Target Stave (Green `#10b981`):** Shows the correct notation.
3. **Slot Diff Chips:** Displays per-slot chips (`Root`, `Acc`, `Quality`, `Voicing / Inv`) to pinpoint exact error locations.

### D. Multiple Choice & Shape Reflex Modes
* **Multiple Choice:** 4 smart distractor cards (keys `1`, `2`, `3`, `4`) with uniform voicing sublabels (e.g., `Drop-2 (omit 5)`).
* **Shape Reflex:** Inversion-only flash mode (keys `0`, `1`, `2`, `3`).

---

## 6. Storage Architecture & Decoupling

`LocalStorage` cleanly separates user preferences (**`settings`**) from performance and analytics (**`progress`**):

```typescript
interface AppState {
  version: number;
  
  // 1. USER CONFIGURATIONS & PREFERENCES (What the user controls)
  settings: {
    theme: 'dark' | 'light' | 'system';
    showKeymapLegend: boolean;
    chords: TrackSettings;
    arpeggios: TrackSettings;
  };

  // 2. ACHIEVEMENTS, STATE & ANALYTICS (What the system records)
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
}

interface TrackProgress {
  currentTier: number;                  // e.g. 1.1, 1.2, 2.1...
  highestStreak: number;
  currentStreak: number;
  totalTrialsCompleted: number;
  masteredTiers: number[];              // Completed tier IDs
  weaknessMatrix: Record<string, PatternStats>;
}

interface PatternStats {
  totalSeen: number;
  correctCount: number;
  avgLatencyMs: number;
  lastAttemptTimestamp: number;
}
```

### Telemetry Store (`IndexedDB`)
Every trial creates an immutable log entry in object store `trials` with 1-click JSON Export & Import backup.

---

## 7. Adaptive Problem Generation Algorithm

The generator selects the next pattern using a weighted probability distribution derived from historical error rates and reaction latency within the **active track**:

$$\text{Weight}(p) = 1.0 + \left(2.5 \times \text{ErrorRate}(p)\right) + \left(\frac{\text{AvgLatencyMs}(p)}{1000}\right) + \text{RecencyDecay}(p)$$

* **Weakness Amplification:** A pattern with a $40\%$ error rate is generated $\approx 3\times$ more frequently than a mastered one.
* **Speed Adaptation:** If accuracy $>90\%$ with latency $<400\text{ms}$ over the last 15 trials in a tier, flash duration decreases automatically ($500\text{ms} \rightarrow 350\text{ms} \rightarrow 200\text{ms}$).
* **Tier Promotion Gate:** Achieving $\ge 90\%$ accuracy and $<600\text{ms}$ average latency over 20 consecutive trials unlocks the next curriculum tier.
