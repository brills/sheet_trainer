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
}

export const SlotBufferInput: React.FC<SlotBufferInputProps> = ({
  onSubmit,
  disabled = false,
  onKeyPressFeedback,
  tier
}) => {
  const tierConfig = tier !== undefined ? CHORD_TIERS[tier] : undefined;
  const isDropVoicing = tierConfig?.voicing === 'drop2' || tierConfig?.voicing === 'drop3';
  const isFixedInversion = (tierConfig !== undefined && tierConfig.inversions.length === 1) || isDropVoicing;
  const fixedInversion = isDropVoicing 
    ? 'root' 
    : (tierConfig !== undefined && tierConfig.inversions.length === 1 ? tierConfig.inversions[0] : null);

  const [stateMachine] = useState(() => new ChordInputStateMachine(undefined, fixedInversion));
  const [slotState, setSlotState] = useState<ChordSlotState>(stateMachine.getState());
  const [activeSlot, setActiveSlot] = useState<SlotIndex>(0);

  const syncState = useCallback(() => {
    setSlotState(stateMachine.getState());
    setActiveSlot(stateMachine.getActiveSlot());
  }, [stateMachine]);

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

  // Update fixed inversion when tier changes
  useEffect(() => {
    stateMachine.setFixedInversion(fixedInversion);
    stateMachine.reset();
    syncState();
  }, [fixedInversion, stateMachine, syncState]);

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
    <div className="w-full max-w-md mx-auto flex flex-col gap-4 mt-2">
      {/* 4-Slot Visual Display */}
      <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Slot 1: Root */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 0 ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60'}
        `}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">1. Root</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {slotState.root || <span className="text-slate-700 font-normal">_</span>}
          </span>
        </div>

        {/* Slot 2: Accidental */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 1 ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60'}
        `}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">2. Acc</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {slotState.accidental ? (slotState.accidental === 'natural' ? '♮' : accidentalSymbol(slotState.accidental)) : <span className="text-slate-700 font-normal">♮</span>}
          </span>
        </div>

        {/* Slot 3: Quality */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 2 ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60'}
        `}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">3. Quality</span>
          <span className="text-base font-bold font-mono text-emerald-400 truncate max-w-[80px]">
            {slotState.quality ? CHORD_FORMULAS[slotState.quality].shortName : <span className="text-slate-700 font-normal">_</span>}
          </span>
        </div>

        {/* Slot 4: Inversion / Voicing */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${isFixedInversion 
            ? 'border-slate-800/80 bg-slate-950/40 text-slate-400'
            : (activeSlot === 3 ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60')}
        `}>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {isDropVoicing ? '4. Voicing' : '4. Inv'}
            </span>
            {isFixedInversion && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">Tier</span>
            )}
          </div>
          {isDropVoicing ? (
            <span className="text-xs font-bold font-mono text-emerald-400/90">
              {tierConfig?.voicing === 'drop2' ? 'Drop-2' : 'Drop-3'}
            </span>
          ) : (
            <span className={`text-base font-bold font-mono ${isFixedInversion ? 'text-emerald-400/80' : 'text-emerald-400'}`}>
              {slotState.inversion ? (slotState.inversion === 'root' ? 'Root' : slotState.inversion) : <span className="text-slate-700 font-normal">_</span>}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Touch Pad Matrix */}
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        {/* Row 1: Root Notes */}
        <div className="flex items-center justify-between gap-1.5">
          {NOTE_LETTERS.map(letter => (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRoot(letter)}
              className={`
                flex-1 h-11 rounded-xl font-bold font-mono text-sm border transition-all
                active:scale-95 touch-manipulation
                ${slotState.root === letter 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30' 
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750 hover:border-slate-600'}
              `}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Row 2: Accidentals + Inversions */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Accidentals (3 buttons) */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectAccidental('natural')}
            className="h-10 rounded-xl font-mono text-sm font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 active:scale-95"
          >
            ♮
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectAccidental('sharp')}
            className="h-10 rounded-xl font-mono text-sm font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 active:scale-95"
          >
            ♯
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectAccidental('flat')}
            className="h-10 rounded-xl font-mono text-sm font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 active:scale-95"
          >
            ♭
          </button>

          {/* Inversions (4 buttons) */}
          {(['root', '1st', '2nd', '3rd'] as Inversion[]).map(inv => {
            const isThisFixed = isFixedInversion && fixedInversion === inv;
            const isAllowedInTier = !tierConfig || tierConfig.inversions.includes(inv);
            const label = inv === 'root' ? 'Root' : inv;

            return (
              <button
                key={inv}
                type="button"
                disabled={disabled || isFixedInversion || !isAllowedInTier || isDropVoicing}
                onClick={() => onSelectInversion(inv)}
                className={`
                  h-10 rounded-xl font-mono text-xs font-bold border active:scale-95 transition-all
                  ${isThisFixed || isDropVoicing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isAllowedInTier
                      ? (slotState.inversion === inv
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-800/90 text-emerald-400 border-slate-700 hover:bg-slate-750')
                      : 'bg-slate-900/40 text-slate-600 border-slate-800/40 opacity-40 cursor-not-allowed'}
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

            return (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => onSelectQuality(q)}
                className={`
                  h-10 rounded-xl font-mono text-xs font-semibold border transition-all active:scale-95
                  ${slotState.quality === q
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : isAllowedInTier
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-850'}
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
          className="w-full mt-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <Delete className="w-3.5 h-3.5" /> Clear / Backspace
        </button>
      </div>
    </div>
  );
};
