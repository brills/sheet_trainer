import { NoteLetter, Accidental, ChordQuality, Inversion } from '../../types';
import { CHORD_FORMULAS } from '../theory/chords';

export interface ChordSlotState {
  root: NoteLetter | null;
  accidental: Accidental | null;
  quality: ChordQuality | null;
  inversion: Inversion | null;
}

export type SlotIndex = 0 | 1 | 2 | 3;

export const QUALITY_KEY_MAP: Record<string, ChordQuality> = {
  'm': 'minor',
  'M': 'major',
  'j': 'maj7',
  'J': 'maj7',
  'd': 'diminished',
  'D': 'dim7',
  'a': 'augmented',
  'A': 'augmented',
  '7': 'dom7',
  'k': 'min7',
  'K': 'min7',
  'h': 'half_dim7',
  'H': 'half_dim7',
  'o': 'half_dim7',
  'O': 'dim7',
  '4': 'sus4',
  '2': 'sus2',
  '9': '9',
  '6': '6'
};

export function resolveQualityKey(key: string, tier?: number | null): ChordQuality | undefined {
  if (tier !== null && tier !== undefined) {
    if (tier >= 3.0 && tier < 4.0) {
      if (tier === 3.8) {
        if (key === 'd' || key === 'D' || key === 'o' || key === 'O') return 'dim7';
        if (key === 'h' || key === 'H') return 'half_dim7';
        if (key === 'm' || key === 'k' || key === 'K') return 'min7';
        if (key === 'M' || key === 'j' || key === 'J') return 'maj7';
        if (key === '7') return 'dom7';
      } else {
        // Tiers 3.1 - 3.7 (7th chords close, Drop-2, Drop-3)
        if (key === 'm' || key === 'k' || key === 'K') return 'min7';
        if (key === 'M' || key === 'j' || key === 'J') return 'maj7';
        if (key === '7') return 'dom7';
        if (key === 'h' || key === 'H' || key === 'o' || key === 'O') return 'half_dim7';
        if (key === 'd' || key === 'D') return 'dim7';
      }
    } else if (tier >= 2.0 && tier < 3.0) {
      if (key === '4') return 'sus4';
      if (key === '2') return 'sus2';
      if (key === 'm') return 'minor';
      if (key === 'M') return 'major';
      if (key === 'd' || key === 'D') return 'diminished';
      if (key === 'a' || key === 'A') return 'augmented';
    } else if (tier >= 4.0 && tier < 4.2) {
      if (key === '9' || key === 'a' || key === 'A') return 'add9';
      if (key === '6') return '6';
      if (key === 'm') return 'm6';
      if (key === 'M') return '6';
    } else if (tier >= 4.2) {
      if (key === '9') return '9';
      if (key === '7') return '7s9';
      if (key === 'm') return 'min7';
      if (key === 'M') return 'maj7';
    } else {
      // Triad Tiers (1.1 - 1.4)
      if (key === 'm') return 'minor';
      if (key === 'M') return 'major';
      if (key === 'd' || key === 'D') return 'diminished';
      if (key === 'a' || key === 'A') return 'augmented';
      if (key === 'j' || key === 'J') return 'major';
      if (key === 'k' || key === 'K') return 'minor';
      if (key === '7') return 'dom7';
      if (key === 'h' || key === 'H' || key === 'o' || key === 'O') return 'half_dim7';
    }
  }
  return QUALITY_KEY_MAP[key];
}

export const INVERSION_KEY_MAP: Record<string, Inversion> = {
  '0': 'root',
  'r': 'root',
  'R': 'root',
  '1': '1st',
  '2': '2nd',
  '3': '3rd'
};

export class ChordInputStateMachine {
  private state: ChordSlotState = {
    root: null,
    accidental: null,
    quality: null,
    inversion: null
  };

  private activeSlot: SlotIndex = 0;
  private onCompleteCallback?: (result: ChordSlotState) => void;
  private fixedInversion: Inversion | null = null;
  private tier: number | null = null;

  constructor(
    onComplete?: (result: ChordSlotState) => void,
    fixedInversion?: Inversion | null,
    tier?: number | null
  ) {
    this.onCompleteCallback = onComplete;
    this.fixedInversion = fixedInversion || null;
    this.tier = tier !== undefined ? tier : null;
    if (this.fixedInversion) {
      this.state.inversion = this.fixedInversion;
    }
  }

  public setTier(tier: number | null | undefined): void {
    this.tier = tier !== undefined ? tier : null;
  }

  public setFixedInversion(inv: Inversion | null): void {
    this.fixedInversion = inv;
    if (this.fixedInversion) {
      this.state.inversion = this.fixedInversion;
    }
  }

  public getState(): ChordSlotState {
    return { ...this.state };
  }

  public getActiveSlot(): SlotIndex {
    return this.activeSlot;
  }

  public reset(): void {
    this.state = {
      root: null,
      accidental: null,
      quality: null,
      inversion: this.fixedInversion
    };
    this.activeSlot = 0;
  }

  public handleKey(key: string): { updated: boolean; completed: boolean } {
    const trimmed = key.trim();

    // Backspace / Delete handling
    if (key === 'Backspace' || key === 'Delete') {
      if (this.activeSlot > 0) {
        if (this.activeSlot === 3 && this.state.inversion !== null && !this.fixedInversion) {
          this.state.inversion = null;
        } else if (this.activeSlot === 2 && this.state.quality !== null) {
          this.state.quality = null;
        } else if (this.activeSlot === 1 && this.state.accidental !== null) {
          this.state.accidental = null;
        } else {
          this.activeSlot = (this.activeSlot - 1) as SlotIndex;
          if (this.activeSlot === 2) this.state.quality = null;
          else if (this.activeSlot === 1) this.state.accidental = null;
          else if (this.activeSlot === 0) this.state.root = null;
        }
        return { updated: true, completed: false };
      }
      return { updated: false, completed: false };
    }

    // Space key: sets natural if at accidental slot
    if (key === ' ' || key === 'Spacebar') {
      if (this.activeSlot === 1) {
        this.state.accidental = 'natural';
        this.activeSlot = 2;
        return { updated: true, completed: false };
      }
    }

    // Slot 0: Root Note (A-G)
    const upper = trimmed.toUpperCase();
    if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(upper)) {
      if (this.activeSlot === 0) {
        this.state.root = upper as NoteLetter;
        this.activeSlot = 1;
        return { updated: true, completed: false };
      }
      // If at Slot 1 and typed 'b', treat as Flat (♭)
      if (this.activeSlot === 1 && (key === 'b' || key === 'B')) {
        this.state.accidental = 'flat';
        this.activeSlot = 2;
        return { updated: true, completed: false };
      }
    }

    // Slot 1: Accidental (S/s for sharp, B/b for flat)
    if (this.activeSlot === 1) {
      if (key === 's' || key === 'S' || key === '#') {
        this.state.accidental = 'sharp';
        this.activeSlot = 2;
        return { updated: true, completed: false };
      }
      if (key === 'b' || key === 'B' || key === '-') {
        this.state.accidental = 'flat';
        this.activeSlot = 2;
        return { updated: true, completed: false };
      }

      // Smart-skip: If user typed a quality key directly, auto-fill natural
      const qSkip = resolveQualityKey(key, this.tier);
      if (qSkip !== undefined) {
        this.state.accidental = 'natural';
        this.state.quality = qSkip;
        if (this.state.inversion === '3rd' && CHORD_FORMULAS[qSkip]?.maxInversion !== '3rd') {
          this.state.inversion = null;
        }
        
        if (this.fixedInversion) {
          this.state.inversion = this.fixedInversion;
          this.onCompleteCallback?.(this.state);
          return { updated: true, completed: true };
        } else {
          this.activeSlot = 3;
          return { updated: true, completed: false };
        }
      }
    }

    // Slot 2: Quality
    if (this.activeSlot === 2) {
      const q = resolveQualityKey(key, this.tier);
      if (q !== undefined) {
        this.state.quality = q;
        if (this.state.inversion === '3rd' && CHORD_FORMULAS[q]?.maxInversion !== '3rd') {
          this.state.inversion = null;
        }

        if (this.fixedInversion) {
          this.state.inversion = this.fixedInversion;
          this.onCompleteCallback?.(this.state);
          return { updated: true, completed: true };
        } else {
          this.activeSlot = 3;
          return { updated: true, completed: false };
        }
      }
    }

    // Slot 3: Inversion (Auto-submits on entry)
    if (this.activeSlot === 3) {
      if (INVERSION_KEY_MAP[key] !== undefined) {
        const inv = INVERSION_KEY_MAP[key];
        // 3rd inversion is strictly disallowed for triads (maxInversion !== '3rd')
        if (inv === '3rd' && this.state.quality && CHORD_FORMULAS[this.state.quality]?.maxInversion !== '3rd') {
          return { updated: false, completed: false };
        }
        this.state.inversion = inv;
        this.onCompleteCallback?.(this.state);
        return { updated: true, completed: true };
      }
    }

    return { updated: false, completed: false };
  }

  public setSlotManually(slot: SlotIndex, value: any): boolean {
    if (slot === 0) {
      this.state.root = value;
      this.activeSlot = 1;
    } else if (slot === 1) {
      this.state.accidental = value;
      this.activeSlot = 2;
    } else if (slot === 2) {
      this.state.quality = value;
      if (this.state.inversion === '3rd' && CHORD_FORMULAS[value as ChordQuality]?.maxInversion !== '3rd') {
        this.state.inversion = null;
      }
      if (this.fixedInversion && this.state.root) {
        if (!this.state.accidental) this.state.accidental = 'natural';
        this.state.inversion = this.fixedInversion;
        this.onCompleteCallback?.(this.state);
        return true;
      } else {
        this.activeSlot = 3;
      }
    } else if (slot === 3) {
      if (value === '3rd' && this.state.quality && CHORD_FORMULAS[this.state.quality]?.maxInversion !== '3rd') {
        return false;
      }
      this.state.inversion = value;
      if (this.state.root && this.state.quality && this.state.inversion) {
        if (!this.state.accidental) this.state.accidental = 'natural';
        this.onCompleteCallback?.(this.state);
        return true;
      }
    }
    return false;
  }
}
