export interface TierHint {
  visualCue: string;
  cheatCode: string;
  formula: string;
}

export const ARPEGGIO_TIER_HINTS: Record<number, TierHint> = {
  1.1: {
    visualCue: 'Straight staircase slope. First 3 notes share line/space parity.',
    cheatCode: 'Ascending: lowest note is Root. Descending: bottom/last note is Root (Maj, Min, Dim, Aug).',
    formula: 'Ascending: 1 → 3 → 5 → 8 | Descending: 8 → 5 → 3 → 1'
  },
  1.2: {
    visualCue: 'Spot the interval of a 4th (line-to-space skip) among the 3rds.',
    cheatCode: 'The note right after the 4th gap (5 → 1) is the Root! At top = starts on 3rd; at bottom = starts on 5th.',
    formula: 'Starts on 3rd: 3 → 5 → 1 → 3 | Starts on 5th: 5 → 1 → 3 → 5'
  },
  1.3: {
    visualCue: 'Arch = tent pyramid shape. Alberti = zig-zag shape (low → high → mid → high).',
    cheatCode: 'First note is always the Root (1). Outer peak is the 5th (5), inner note is the 3rd (3).',
    formula: 'Arch: 1 → 3 → 5 → 3 | Alberti: 1 → 5 → 3 → 5'
  },
  2.1: {
    visualCue: '3-note triad figures grouped into a 4-note metric beam envelope.',
    cheatCode: 'Find the repeating pitch class at the boundaries to lock in the root cycle.',
    formula: 'Metric displacements: 1-3-5-1, 3-5-1-3, or 5-1-3-5'
  },
  3.1: {
    visualCue: 'All 4 notes are consecutive lines (L-L-L-L) or spaces (S-S-S-S).',
    cheatCode: 'Lowest note is Root. Top note is 7th: Maj7 (half-step below 8), Dom7 (whole-step below 8), Min7 (m3 + ♭7).',
    formula: 'Maj7: 1-3-5-7 | Dom7: 1-3-5-♭7 | Min7: 1-♭3-5-♭7'
  },
  3.2: {
    visualCue: 'Spot the interval of a 2nd (adjacent line-to-space step clash).',
    cheatCode: 'The upper note of that 2nd step (7 → 1) is always the Root! Step at end = starts on 3rd; step in middle = starts on 5th.',
    formula: 'Starts on 3rd: 3-5-7-1 | Starts on 5th: 5-7-1-3'
  },
  3.3: {
    visualCue: 'Symmetrical, equidistant ladder where every step is an identical minor 3rd gap.',
    cheatCode: 'Look for double-flats (𝄫) or uniform 3-semitone leaps across the entire chain.',
    formula: '1 → ♭3 → ♭5 → 𝄫7'
  }
};

export const CHORD_TIER_HINTS: Record<number, TierHint> = {
  1.1: {
    visualCue: 'Snowman shape (Line-Line-Line or Space-Space-Space) with equal 3rd intervals.',
    cheatCode: 'Lowest note is Root. Maj (M3+m3), Min (m3+M3), Dim (compressed m3+m3 / ♭5), Aug (expanded M3+M3 / ♯5).',
    formula: 'Root Position (5/3): Root - 3rd - 5th'
  },
  1.2: {
    visualCue: 'Interval of a 4th at the top of the chord stack (6/3 inversion).',
    cheatCode: 'The top note (above the 4th gap) is the Root! Bottom note is the 3rd (Maj, Min, Dim, Aug).',
    formula: '1st Inversion (6/3): 3rd - 5th - Root'
  },
  1.3: {
    visualCue: 'Interval of a 4th at the bottom of the chord stack (6/4 inversion).',
    cheatCode: 'The middle note (above the 4th gap) is the Root! Bottom note is the 5th (Maj, Min, Dim, Aug).',
    formula: '2nd Inversion (6/4): 5th - Root - 3rd'
  },
  1.4: {
    visualCue: 'Identify the 4th gap across all triad qualities: none (Root), top gap (1st Inv), or bottom gap (2nd Inv).',
    cheatCode: 'No gap = Root is at bottom. Top gap = Root is on top. Bottom gap = Root is in middle.',
    formula: 'Triad Mastery: Root (5/3), 1st Inv (6/3), 2nd Inv (6/4) across Maj, Min, Dim, Aug'
  },
  2.1: {
    visualCue: 'Sus4 = 4th on bottom (Root-4th-5th). Sus2 = 2nd clash on bottom (Root-2nd-5th).',
    cheatCode: 'No 3rd present! Sus4 replaces 3rd with 4th; Sus2 replaces 3rd with 2nd.',
    formula: 'Sus4: 1 - 4 - 5 | Sus2: 1 - 2 - 5'
  },
  3.1: {
    visualCue: '4-note snowman stack (all lines or all spaces).',
    cheatCode: 'Lowest note is Root. Check 7th: Maj7 (half-step below octave), Dom7 (whole-step below), ø7 (♭5 + ♭7).',
    formula: 'Root Position 7ths (7): 1 - 3 - 5 - 7'
  },
  3.2: {
    visualCue: '2nd step clash at the top of the stack (6/5 inversion).',
    cheatCode: 'The top note of the 2nd clash is the Root! Bass note is the 3rd.',
    formula: '1st Inversion 7th (6/5): 3 - 5 - 7 - 1'
  },
  3.3: {
    visualCue: '2nd step clash in the middle of the stack (4/3 inversion).',
    cheatCode: 'The upper note of the middle 2nd clash is the Root! Bass note is the 5th.',
    formula: '2nd Inversion 7th (4/3): 5 - 7 - 1 - 3'
  },
  3.4: {
    visualCue: '2nd step clash at the bottom of the stack (4/2 inversion).',
    cheatCode: 'The upper note of the bottom 2nd clash is the Root! Bass note is the 7th.',
    formula: '3rd Inversion 7th (4/2): 7 - 1 - 3 - 5'
  },
  3.5: {
    visualCue: 'Spot the 2nd clash position: none (Root), top (6/5), middle (4/3), or bottom (4/2).',
    cheatCode: 'The upper note of the 2nd clash is ALWAYS the Root in any 7th inversion!',
    formula: 'Close 7ths: Root (7), 1st (6/5), 2nd (4/3), 3rd (4/2)'
  },
  3.6: {
    visualCue: 'Open 4-voice spacing with 2nd voice from top dropped an octave into the bass.',
    cheatCode: 'Standard jazz guitar & piano drop-2 voicing. Wide spread with tight inner voicings.',
    formula: 'Drop-2: [Drop 2nd voice down 1 octave]'
  },
  3.7: {
    visualCue: 'Wide open 4-voice spacing with 3rd voice from top dropped an octave into the bass.',
    cheatCode: 'Deep bass note with tight 3-voice cluster above.',
    formula: 'Drop-3: [Drop 3rd voice down 1 octave]'
  },
  3.8: {
    visualCue: 'ø7 (Half-diminished) vs °7 (Fully diminished).',
    cheatCode: 'ø7 has minor 7th (♭7). °7 has diminished 7th (𝄫7, symmetrical minor 3rds).',
    formula: 'ø7: 1 - ♭3 - ♭5 - ♭7 | °7: 1 - ♭3 - ♭5 - 𝄫7'
  },
  4.1: {
    visualCue: 'Add9, Major 6th, and Minor 6th chords in root position.',
    cheatCode: 'Add9 includes natural 9 (2nd octave). 6th chords feature the major 6th degree.',
    formula: 'Add9: 1-3-5-9 | 6: 1-3-5-6 | m6: 1-♭3-5-6'
  },
  4.2: {
    visualCue: 'Altered dominant and 9th chord extensions.',
    cheatCode: '9th has natural 9. 7♯9 has sharp 9 (Hendrix chord). 7♭9 has flat 9.',
    formula: '9: 1-3-5-♭7-9 | 7♯9: 1-3-5-♭7-♯9 | 7♭9: 1-3-5-♭7-♭9'
  }
};
