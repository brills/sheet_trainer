import React, { useEffect, useState, useCallback } from 'react';
import { NoteLetter, Accidental, ChordQuality, Inversion } from '../types';
import { ChordInputStateMachine, ChordSlotState, SlotIndex } from '../core/engines/stateMachine';
import { accidentalSymbol, NOTE_LETTERS } from '../core/theory/notes';
import { CHORD_FORMULAS, CHORD_TIERS } from '../core/theory/chords';
import { Delete } from 'lucide-react';

interface SlotBufferInputProps {
  onSubmit: (state: { root: NoteLetter; accidental: Accidental; quality: ChordQuality; inversion: Inversion }) => void;
  disabled?: boolean;
  onKeyPressFeedback?: (key: string) => void;
  tier?: number;
  onBufferChange?: (hasInput: boolean) => void;
}

export const SlotBufferInput: React.FC<SlotBufferInputProps> = ({
  onSubmit,
  disabled = false,
  onKeyPressFeedback,
  tier,
  onBufferChange
}) => {
  const tierConfig = tier !== undefined ? CHORD_TIERS[tier] : undefined;
  const isDropVoicing = tierConfig?.voicing === 'drop2' || tierConfig?.voicing === 'drop3';
  const isFixedInversion = (tierConfig !== undefined && tierConfig.inversions.length === 1) || isDropVoicing;
  const fixedInversion = isDropVoicing 
    ? 'root' 
    : (tierConfig !== undefined && tierConfig.inversions.length === 1 ? tierConfig.inversions[0] : null);

  const [stateMachine] = useState(() => new ChordInputStateMachine(undefined, fixedInversion, tier));
  const [slotState, setSlotState] = useState<ChordSlotState>(stateMachine.getState());
  const [activeSlot, setActiveSlot] = useState<SlotIndex>(0);

  const syncState = useCallback(() => {
    setSlotState(stateMachine.getState());
    setActiveSlot(stateMachine.getActiveSlot());
    onBufferChange?.(stateMachine.hasInput());
  }, [stateMachine, onBufferChange]);

  const handleComplete = useCallback((res: ChordSlotState) => {
    if (res.root && res.quality && res.inversion) {
      onSubmit({
        root: res.root,
        accidental: res.accidental || 'natural',
        quality: res.quality,
        inversion: res.inversion
      });
    }
  }, [onSubmit]);

  useEffect(() => {
    (stateMachine as any).onCompleteCallback = handleComplete;
  }, [stateMachine, handleComplete]);

  // Update fixed inversion & tier when tier changes
  useEffect(() => {
    stateMachine.setTier(tier);
    stateMachine.setFixedInversion(fixedInversion);
    stateMachine.reset();
    syncState();
  }, [tier, fixedInversion, stateMachine, syncState]);

  // Reset when disabled changes or a new problem starts
  useEffect(() => {
    if (!disabled) {
      stateMachine.reset();
      syncState();
    }
  }, [disabled, stateMachine, syncState]);

  // Global keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;

      onKeyPressFeedback?.(e.key);
      const res = stateMachine.handleKey(e.key);
      if (res.updated) {
        e.preventDefault();
        syncState();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, stateMachine, syncState, onKeyPressFeedback]);

  const onSelectRoot = (root: NoteLetter) => {
    if (disabled) return;
    stateMachine.setSlotManually(0, root);
    syncState();
  };

  const onSelectAccidental = (acc: Accidental) => {
    if (disabled) return;
    stateMachine.setSlotManually(1, acc);
    syncState();
  };

  const onSelectQuality = (q: ChordQuality) => {
    if (disabled) return;
    stateMachine.setSlotManually(2, q);
    syncState();
  };

  const onSelectInversion = (inv: Inversion) => {
    if (disabled) return;
    stateMachine.setSlotManually(3, inv);
    syncState();
  };

  const onClear = () => {
    if (disabled) return;
    stateMachine.reset();
    syncState();
  };

  // Determine quality buttons to display
  const standardQualities: ChordQuality[] = ['major', 'minor', 'dom7', 'maj7', 'min7', 'half_dim7', 'diminished', 'augmented'];
  const displayQualities: ChordQuality[] = tierConfig && tierConfig.qualities.length > 0
    ? Array.from(new Set([...tierConfig.qualities, ...standardQualities])).slice(0, 8)
    : standardQualities;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 mt-2">
      {/* 4-Slot Visual Display */}
      <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-theme-panel border border-theme-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Slot 1: Root */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 0 ? 'border-theme-accent-border bg-theme-accent-tint ring-1 ring-theme-accent-border shadow-xs' : 'border-theme-border bg-theme-card'}
        `}>
          <span className="text-[9px] uppercase font-serif font-bold tracking-wider text-theme-dim mb-0.5">1. Root</span>
          <span className="text-xl font-bold font-serif text-theme-accent">
            {slotState.root || <span className="text-theme-borderStrong font-normal">_</span>}
          </span>
        </div>

        {/* Slot 2: Accidental */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 1 ? 'border-theme-accent-border bg-theme-accent-tint ring-1 ring-theme-accent-border shadow-xs' : 'border-theme-border bg-theme-card'}
        `}>
          <span className="text-[9px] uppercase font-serif font-bold tracking-wider text-theme-dim mb-0.5">2. Acc</span>
          <span className="text-xl font-bold font-mono text-theme-accent">
            {slotState.accidental ? (slotState.accidental === 'natural' ? '♮' : accidentalSymbol(slotState.accidental)) : <span className="text-theme-borderStrong font-normal">♮</span>}
          </span>
        </div>

        {/* Slot 3: Quality */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 2 ? 'border-theme-accent-border bg-theme-accent-tint ring-1 ring-theme-accent-border shadow-xs' : 'border-theme-border bg-theme-card'}
        `}>
          <span className="text-[9px] uppercase font-serif font-bold tracking-wider text-theme-dim mb-0.5">3. Quality</span>
          <span className="text-base font-bold font-serif text-theme-accent truncate max-w-[80px]">
            {slotState.quality ? CHORD_FORMULAS[slotState.quality].shortName : <span className="text-theme-borderStrong font-normal">_</span>}
          </span>
        </div>

        {/* Slot 4: Inversion / Voicing */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${isFixedInversion 
            ? 'border-theme-border bg-theme-card/80 text-theme-accent'
            : (activeSlot === 3 ? 'border-theme-accent-border bg-theme-accent-tint ring-1 ring-theme-accent-border shadow-xs' : 'border-theme-border bg-theme-card')}
        `}>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] uppercase font-serif font-bold tracking-wider text-theme-dim">
              {isDropVoicing ? '4. Voicing' : '4. Inv'}
            </span>
            {isFixedInversion && (
              <span className="text-[8px] font-serif px-1 py-0.2 rounded bg-theme-panel text-theme-muted border border-theme-border">Tier</span>
            )}
          </div>
          {isDropVoicing ? (
            <span className="text-xs font-bold font-serif text-theme-accent">
              {tierConfig?.voicing === 'drop2' ? 'Drop-2' : 'Drop-3'}
            </span>
          ) : (
            <span className="text-base font-bold font-serif text-theme-accent">
              {slotState.inversion ? (slotState.inversion === 'root' ? 'Root' : slotState.inversion) : <span className="text-theme-borderStrong font-normal">_</span>}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Touch Pad Matrix */}
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-theme-panel border border-theme-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Row 1: Root Notes */}
        <div className="flex items-center justify-between gap-1.5">
          {NOTE_LETTERS.map(letter => (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRoot(letter)}
              className={`
                flex-1 h-11 rounded-xl font-bold font-serif text-sm border transition-all
                active:scale-95 touch-manipulation cursor-pointer
                ${slotState.root === letter 
                  ? 'bg-theme-accent-tint text-theme-accent border-[1.5px] border-theme-accent-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' 
                  : 'bg-theme-card text-theme-primary border-theme-border hover:bg-theme-panelElevated hover:border-theme-borderStrong shadow-[0_1px_2px_rgba(0,0,0,0.02),0_1px_0_#d5ccba]'}
              `}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Row 2: Accidentals + Inversions */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Accidentals (3 buttons) */}
          {(['natural', 'sharp', 'flat'] as Accidental[]).map(acc => {
            const sym = acc === 'natural' ? '♮' : (acc === 'sharp' ? '♯' : '♭');
            const isSelected = slotState.accidental === acc || (!slotState.accidental && acc === 'natural');

            return (
              <button
                key={acc}
                type="button"
                disabled={disabled}
                onClick={() => onSelectAccidental(acc)}
                className={`
                  h-10 rounded-xl font-mono text-sm font-semibold border active:scale-95 cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-theme-accent-tint text-theme-accent border-[1.5px] border-theme-accent-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] font-bold'
                    : 'bg-theme-card text-theme-primary border-theme-border hover:bg-theme-panelElevated shadow-[0_1px_2px_rgba(0,0,0,0.02),0_1px_0_#d5ccba]'}
                `}
              >
                {sym}
              </button>
            );
          })}

          {/* Inversions (4 buttons) */}
          {(['root', '1st', '2nd', '3rd'] as Inversion[]).map(inv => {
            const isThisFixed = isFixedInversion && fixedInversion === inv;
            const isAllowedInTier = !tierConfig || tierConfig.inversions.includes(inv);
            const isDisallowedForQuality = inv === '3rd' && (
              (slotState.quality && CHORD_FORMULAS[slotState.quality]?.maxInversion !== '3rd') ||
              (tierConfig && !tierConfig.inversions.includes('3rd'))
            );
            const isAllowed = isAllowedInTier && !isDisallowedForQuality;
            const label = inv === 'root' ? 'Root' : inv;
            const isSelected = slotState.inversion === inv;

            return (
              <button
                key={inv}
                type="button"
                disabled={disabled || isFixedInversion || !isAllowed || isDropVoicing}
                onClick={() => onSelectInversion(inv)}
                className={`
                  h-10 rounded-xl font-serif text-xs font-bold border active:scale-95 transition-all cursor-pointer
                  ${isThisFixed || isDropVoicing
                    ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border'
                    : isAllowed
                      ? (isSelected
                          ? 'bg-theme-accent-tint text-theme-accent border-[1.5px] border-theme-accent-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
                          : 'bg-theme-card text-theme-primary border-theme-border hover:bg-theme-panelElevated shadow-[0_1px_2px_rgba(0,0,0,0.02),0_1px_0_#d5ccba]')
                      : 'bg-theme-panel/40 text-theme-borderStrong border-theme-border/40 opacity-40 cursor-not-allowed'}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Qualities */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {displayQualities.map(q => {
            const isAllowedInTier = !tierConfig || tierConfig.qualities.includes(q);
            const isSelected = slotState.quality === q;

            return (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => onSelectQuality(q)}
                className={`
                  h-10 rounded-xl font-serif text-xs font-semibold border transition-all active:scale-95 cursor-pointer
                  ${isSelected
                    ? 'bg-theme-accent-tint text-theme-accent border-[1.5px] border-theme-accent-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] font-bold'
                    : isAllowedInTier
                      ? 'bg-theme-card text-theme-primary border-theme-border hover:bg-theme-panelElevated shadow-[0_1px_2px_rgba(0,0,0,0.02),0_1px_0_#d5ccba]'
                      : 'bg-theme-card/60 text-theme-dim border-theme-border hover:bg-theme-panelElevated'}
                `}
              >
                {CHORD_FORMULAS[q].shortName}
              </button>
            );
          })}
        </div>

        {/* Clear Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="w-full mt-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-serif font-medium text-theme-dim hover:text-theme-primary active:scale-95 cursor-pointer"
        >
          <Delete className="w-3.5 h-3.5" /> Clear / Backspace
        </button>
      </div>
    </div>
  );
};
