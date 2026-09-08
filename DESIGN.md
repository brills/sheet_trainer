# Sheet Trainer — System & Pedagogical Design Document

> [!NOTE]
> **Client-Side Only Architecture**: This application runs 100% in the user's browser as a static Single Page Application (SPA / PWA). No backend server, database, or external tracking is required. All user preferences, progress milestones, and weakness analytics persist locally in browser storage.

---

## 1. Executive Summary & Vision

**Sheet Trainer** is a specialized sight-reading trainer engineered to train musicians to read sheet music through **gestalt pattern recognition (chunking)** rather than serial, note-by-note decoding.

### Core Philosophy
* **Language Analogy:** Beginners decode letter-by-letter ($c-a-t \rightarrow$ "cat"); fluent readers recognize word silhouettes instantly.
* **Music Reading Reality:** Proficient sight-readers recognize visual chord stacks ("snowmen", interval gaps, step clashes) and horizontal arpeggio contours ($\nearrow, \searrow, \Lambda, \sim$) as unified cognitive units without verbally naming individual notes.
* **Cognitive Chunking:** By presenting notation patterns cleanly, the trainer trains the visual cortex to capture entire chord stacks and arpeggio contours into iconic working memory and respond with sub-second reaction times.

---

## 2. Scope & Defaults

| Dimension | Specification |
| :--- | :--- |
| **Default Clef** | **Treble Clef** (G Clef) by default; **Bass Clef** available as an independent opt-in toggle per track. |
| **Input Modalities** | **Mobile Touch:** Responsive multiple-choice pads and touch matrix.<br>**Desktop Keyboard:** 4-slot auto-advancing direct entry buffer & multiple choice hotkeys. |
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
* **3rd Inversion ($\text{4/2}$):** The 2nd interval is at the **bottom** $\rightarrow$ Root is the top note of that clash (the bass note is the 7th degree).

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
│ Tier 3: 7th Chords & Voicings │             │ Tier 3: 7th Sweeps & Cascades │
│ Tier 4: Extensions & Altered  │             │                               │
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
* **Tier 3.4 — 7th Chords (3rd Inversion):** $\text{4/2}$ inversions (spotting the **bottom 2nd clash** $\rightarrow$ top note of clash is root).
* **Tier 3.5 — 7th Inversion Mastery:** Mixed close-position 7th chords across all 4 inversions.
* **Tier 3.6 — Drop-2 Voicings:** Open 4-part voicings (2nd voice from top dropped $8\text{va}$), blending in 3-note **5th omitted shell voicings** ($\text{Root} + \text{3rd} + \text{7th}$).
* **Tier 3.7 — Drop-3 Voicings:** Wide open voicings (3rd voice from top dropped $8\text{va}$), blending in 3-note **5th omitted shell voicings**.
* **Tier 3.8 — Diminished 7ths:** Half-Diminished ($ø7$) and Fully Diminished ($°7$) across all inversions.
* **Tier 4.1 — Added Tone & 6th Chords:** $\text{add9}$, $6$, $\text{m6}$.
* **Tier 4.2 — Compound & Altered Chords:** $9\text{th}$, $7\sharp9$, $7\flat9$.

### Track B: Arpeggios & Contours Tiers

* **Tier 1.1 — Linear Sweeps:** Ascending ($\nearrow$) and Descending ($\searrow$) 4-note triad runs.
* **Tier 1.2 — Inversion Anchors:** Arpeggios starting on 3rd ($3\text{-}5\text{-}1\text{-}3$) or 5th ($5\text{-}1\text{-}3\text{-}5$).
* **Tier 1.3 — Arches & Alberti Figures:** Arches ($1\text{-}3\text{-}5\text{-}3$) and Alberti bass figures ($1\text{-}5\text{-}3\text{-}5$).
* **Tier 2.1 — Altered Sweeps:** Diminished & Augmented sweeps.
* **Tier 2.2 — Cross-Beaming Patterns:** 3-note patterns grouped into 4-note beam envelopes.
* **Tier 3.1 — 7th Chord Sweeps:** 4-note Dom7, Maj7, Min7 sweeps.
* **Tier 3.2 — 7th Inversion Sweeps:** 7th chord arpeggios starting on 3rd or 5th degrees.
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
   * Press `M` (Maj), `m` (Min), `7` (Dom7), `j` (Maj7), `k` (Min7), `h` (Half-Dim $ø7$), `d` (Dim), `a` (Aug), `4` (Sus4), `2` (Sus2), `9` (9), `6` (6).
4. **Slot 4 (Inversion & Auto-Submit):**
   * Press `0` or `r` (Root Pos), `1` (1st Inv), `2` (2nd Inv), `3` (3rd Inv).
   * *Fixed Inversion & Drop Voicing Auto-Bypass:* In fixed-inversion tiers (e.g. 1.1, 1.2, 1.3, 3.1–3.4) and Drop Voicing tiers (3.6, 3.7), Slot 4 is auto-populated and bypassed, evaluating immediately once Root + Quality are entered.

### B. Persistent Desktop Keymap Legend HUD
A dynamic, tier-aware cheat sheet stays visible on desktop screens during direct entry, displaying only the keys and qualities relevant to the active tier (`[h] ø7`, `[j] Maj7`, `[k] m7`, etc.).

### C. Side-by-Side Dual Stave Notation Diff
When a submission is incorrect, the feedback screen renders:
1. **User Guessed Stave (Red `#f43f5e`):** Reconstructed in the exact same octave register, voicing spread (`drop2`/`drop3`), and `omit5` state as the target chord.
2. **Target Stave (Green `#10b981`):** Shows the correct notation.
3. **Slot Diff Chips:** Displays per-slot chips (`Root`, `Acc`, `Quality`, `Voicing / Inv`) to pinpoint exact error locations.

### D. Multiple Choice Mode
* **Multiple Choice:** 4 smart distractor cards (keys `1`, `2`, `3`, `4` or `A`, `S`, `D`, `F`) featuring intelligent quality, inversion, contour, and drop voicing traps.

---

## 6. Storage Architecture & Decoupling

`LocalStorage` cleanly separates user preferences (**`settings`**) from performance and analytics (**`progress`**):

```typescript
interface AppState {
  version: number;
  
  // 1. USER CONFIGURATIONS & PREFERENCES (What the user controls)
  settings: {
    theme?: 'dark' | 'light' | 'system';
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
  inputMode: 'direct_entry' | 'multiple_choice';
  flashMode?: 'fixed' | 'adaptive';
  flashDurationMs?: number;
  feedbackDelayMs?: number;
  keyMode: 'progressive' | 'locked' | 'all_unlocked';
  activeKeyId: string;
}

interface TrackProgress {
  currentTier: number;                  // e.g. 1.1, 1.2, 2.1...
  highestStreak: number;
  currentStreak: number;
  totalTrialsCompleted: number;
  masteredTiers: number[];              // Completed tier IDs
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
```

### Telemetry Store (`IndexedDB`)
Every trial creates an immutable log entry in object store `trials` with 1-click JSON Export & Import backup.

---

## 7. Adaptive Problem Generation Algorithm

The generator selects the next pattern using a weighted probability distribution derived from historical error rates and reaction latency within the **active track**:

$$\text{Weight}(p) = 1.0 + \left(2.5 \times \text{ErrorRate}(p)\right) + \min\left(\frac{\text{AvgLatencyMs}(p)}{1000}, 2.0\right)$$
*(Unseen patterns receive a baseline weight of $1.5$)*

* **Weakness Amplification:** A pattern with a $40\%$ error rate receives higher sampling priority, biasing problem generation toward known weaknesses.
* **Untimed Precision Timing:** Trials are untimed to allow unhurried cognitive processing while recording sub-millisecond response latency.
* **Mastery Criteria:** Achieving $\ge 85\%$ accuracy and $\le 2000\text{ms}$ ($2.0\text{s}$) average latency over 20 consecutive trials achieves Tier and Key Mastery.
