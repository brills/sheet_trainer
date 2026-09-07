import React, { useEffect, useState, useCallback } from 'react';
import { NoteLetter, Accidental, ChordQuality, Inversion } from '../types';
import { ChordInputStateMachine, ChordSlotState, SlotIndex } from '../core/engines/stateMachine';
import { accidentalSymbol, NOTE_LETTERS } from '../core/theory/notes';
import { CHORD_FORMULAS } from '../core/theory/chords';
import { Delete } from 'lucide-react';

interface SlotBufferInputProps {
  onSubmit: (state: { root: NoteLetter; accidental: Accidental; quality: ChordQuality; inversion: Inversion }) => void;
  disabled?: boolean;
  onKeyPressFeedback?: (key: string) => void;
}

export const SlotBufferInput: React.FC<SlotBufferInputProps> = ({
  onSubmit,
  disabled = false,
  onKeyPressFeedback
}) => {
  const [stateMachine] = useState(() => new ChordInputStateMachine());
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
    // Register completion listener
    (stateMachine as any).onCompleteCallback = handleComplete;
  }, [stateMachine, handleComplete]);

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

        {/* Slot 4: Inversion */}
        <div className={`
          flex flex-col items-center justify-center h-16 rounded-xl border transition-all
          ${activeSlot === 3 ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60'}
        `}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">4. Inv</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {slotState.inversion ? (slotState.inversion === 'root' ? 'Root' : slotState.inversion) : <span className="text-slate-700 font-normal">_</span>}
          </span>
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
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectInversion('root')}
            className="h-10 rounded-xl font-mono text-xs font-bold bg-slate-800/90 text-emerald-400 border border-slate-700 active:scale-95"
          >
            Root
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectInversion('1st')}
            className="h-10 rounded-xl font-mono text-xs font-bold bg-slate-800/90 text-emerald-400 border border-slate-700 active:scale-95"
          >
            1st
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectInversion('2nd')}
            className="h-10 rounded-xl font-mono text-xs font-bold bg-slate-800/90 text-emerald-400 border border-slate-700 active:scale-95"
          >
            2nd
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectInversion('3rd')}
            className="h-10 rounded-xl font-mono text-xs font-bold bg-slate-800/90 text-emerald-400 border border-slate-700 active:scale-95"
          >
            3rd
          </button>
        </div>

        {/* Row 3: Qualities */}
        <div className="grid grid-cols-6 gap-1.5">
          {(['major', 'minor', 'diminished', 'augmented', 'dom7', 'maj7'] as ChordQuality[]).map(q => (
            <button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuality(q)}
              className={`
                h-10 rounded-xl font-mono text-xs font-semibold border transition-all active:scale-95
                ${slotState.quality === q
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-750'}
              `}
            >
              {CHORD_FORMULAS[q].shortName}
            </button>
          ))}
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
