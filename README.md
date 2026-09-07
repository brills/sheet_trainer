# 🎼 Sheet Trainer

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Built with Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-10b981.svg)](https://web.dev/progressive-web-apps/)

> **Fast Sight-Reading Pattern Chunking & Reflex Trainer**
> Master sheet music sight-reading through cognitive pattern chunking, sub-second flash exposure, and adaptive analytics. 100% serverless, client-side, and offline-capable.

---

## 🎯 The Philosophy: Chunking vs. Serial Decoding

When beginner musicians read sheet music, they decode **letter-by-letter** (e.g. counting lines and naming *C... E... G*). Proficient sight-readers do not read this way—they recognize **gestalt shapes (chunks)** such as vertical triad stacks ("snowmen"), inversion interval gaps, adjacent 2nd clashes in 7th chords, and horizontal arpeggio contours ($\nearrow, \searrow, \Lambda, \sim$).

**Sheet Trainer** uses **tachistoscopic sub-second flash exposure (150ms – 800ms)** to disable sequential note-scanning, forcing the visual cortex to capture entire patterns into iconic working memory.

---

## ✨ Features

* **🎼 Track A: Chords & Inversions (Vertical Chunking):**
  * **Tiers 1.1 – 1.4 (Triads):** Root Position ("snowmen"), 1st Inversion ($\text{6/3}$, top 4th gap), 2nd Inversion ($\text{6/4}$, bottom 4th gap), and Triad Mastery.
  * **Tiers 2.1 – 2.2 (Altered & Suspended Triads):** Diminished ($°$), Augmented ($+$), $\text{Sus4}$, and $\text{Sus2}$.
  * **Tiers 3.1 – 3.5 (7th Chords by Inversion):** Deconstructed by clash geometry—Root Position, 1st Inversion ($\text{6/5}$, top clash), 2nd Inversion ($\text{4/3}$, middle clash), 3rd Inversion ($\text{4/2}$, bottom clash), and 7th Inversion Mastery. Standardized across all 4 diatonic qualities ($\text{Dom7}, \text{Maj7}, \text{Min7}, \text{Half-Dim } ø7 / \text{m7}\flat5$).
  * **Tiers 3.6 – 3.7 (Drop Voicings & Shell Voicings):** Open 4-part **Drop-2** (2nd voice from top dropped $8\text{va}$) and **Drop-3** (3rd voice from top dropped $8\text{va}$) voicings, blending in 3-note **5th omitted shell voicings** ($\text{Root} + \text{3rd} + \text{7th}$).
  * **Tier 3.8 (Diminished 7ths):** Half-Diminished ($ø7$) and Fully Diminished ($°7$) chords.
  * **Tiers 4.1 – 4.2 (Extensions & Alterations):** $\text{add9}, 6, \text{m6}, 9\text{th}, 7\sharp9, 7\flat9$.

* **〰️ Track B: Arpeggios & Contours (Horizontal Chunking):**
  * Linear Ascending ($\nearrow$) and Descending ($\searrow$) sweeps.
  * Inversion Starting Anchors ($1\text{-}3\text{-}5, 3\text{-}5\text{-}1, 5\text{-}1\text{-}3$).
  * Arch Contours ($\Lambda$) and Alberti / Wave accompaniment figures ($\sim$).
  * Symmetrical Diminished 7th Cascades & Cross-beamed 16th-note groupings.

* **⭕ 15 Paired Key Signatures & Circle of Fifths Progression:**
  * Master all 15 key signatures organized into 5 progressive Circle of Fifths stages (0 to 7 sharps/flats) with paired Major and Relative Minor naming ($C / \text{Am}$, $G / \text{Em}$, $F / \text{Dm}$, etc.).
  * Practice with diatonic chord biasing and realistic implicit sheet music accidentals.

* **⚡ Auto-Advancing 4-Slot Chord Entry & Drop Inversion Bypass:**
  * Type full chords in $<350\text{ms}$ with zero collision between note names and accidentals:
  * `[1. Root (A-G)] ──► [2. Accidental (S/B or Auto-Skip)] ──► [3. Quality (m/M/j/7/k/h)] ──► [4. Inversion (0-3)]`
  * Fixed-inversion and Drop Voicing tiers automatically bypass Slot 4 to evaluate Root + Quality instantaneously.

* **🔍 Side-by-Side Dual Stave Notation Diff:**
  * Incorrect submissions immediately render a side-by-side visual diff:
  * User's guessed chord (in red) reconstructed in the exact same octave register, voicing spread, and `omit5` structure alongside the correct target chord (in green), immediately highlighting pitch errors without visual distortion.

* **🎴 Multiple Training Modes:**
  * **⌨️ Direct Entry:** Full chord keyboard type-in buffer.
  * **🎴 Multiple Choice:** 4 rapid distractor cards featuring intelligent quality, inversion, and drop voicing traps.
  * **⚡ Shape Reflex:** Sub-second pure inversion/contour classification.

---

## ⌨️ Desktop Keybindings Cheat Sheet

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              UNIFIED SINGLE-STROKE KEYMAP                              │
├───────────────────┬───────────────────┬───────────────────────┬────────────────────────┤
│ 1. ROOT NOTES     │ 2. ACCIDENTALS    │ 3. QUALITY / TYPE     │ 4. INVERSIONS / NUMS   │
├───────────────────┼───────────────────┼───────────────────────┼────────────────────────┤
│ C : Key [ C ]     │ Natural : [ Space ]│ Major     : [ M ]     │ Root Pos  : [ 0 ] / [ r ]│
│ D : Key [ D ]     │ Sharp ♯ : [ S ]   │ Minor     : [ m ]     │ 1st Inv   : [ 1 ]      │
│ E : Key [ E ]     │ Flat ♭  : [ B ]   │ Diminished: [ d ]     │ 2nd Inv   : [ 2 ]      │
│ F : Key [ F ]     │ (or smart skip)   │ Augmented : [ a ]     │ 3rd Inv   : [ 3 ]      │
│ G : Key [ G ]     │                   │ Dom 7th   : [ 7 ]     │                        │
│ A : Key [ A ]     │                   │ Maj 7th   : [ j ]     │ 5. ARPEGGIO CONTOURS   │
│ B : Key [ B ]     │                   │ Min 7th   : [ k ]     │ Ascending : [ ↑ ] / [ u ]│
│                   │                   │ Half-Dim ø: [ h ]     │ Descending: [ ↓ ] / [ n ]│
│                   │                   │ Sus4      : [ 4 ]     │ Arch (Λ)  : [ a ]      │
│                   │                   │ Sus2      : [ 2 ]     │ Alberti(~) : [ w ]      │
└───────────────────┴───────────────────┴───────────────────────┴────────────────────────┘
```

---

## 🚀 Quick Start & Development

### Prerequisites
* Node.js 18+
* npm or pnpm

### Installation
```bash
# Clone repository
git clone https://github.com/<your-username>/sheet_trainer.git
cd sheet_trainer

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```
The production bundle is generated in the **`dist/`** directory.

---

## 🌐 Deploying to GitHub Pages

This repository includes an automated GitHub Actions deployment workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push the repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/sheet_trainer.git
   git push -u origin main
   ```
2. In your GitHub repository:
   * Go to **Settings** $\rightarrow$ **Pages**.
   * Under **Build and deployment $\rightarrow$ Source**, select **GitHub Actions**.
3. Your site will automatically build and deploy to `https://<your-username>.github.io/sheet_trainer/`.

---

## 📄 License

This project is free software licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for the full license text.
