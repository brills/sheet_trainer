import React, { useEffect, useRef } from 'react';
import { ChordDefinition, ArpeggioDefinition, TrackType } from '../types';
import { renderChordToSvg, renderArpeggioToSvg } from '../core/theory/vexflowAdapter';
import { FlashState } from '../core/engines/timingEngine';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface NotationStageProps {
  track: TrackType;
  chord?: ChordDefinition;
  arpeggio?: ArpeggioDefinition;
  flashState: FlashState;
  lastResult?: { isCorrect: boolean; message?: string } | null;
  flashDurationMs: number;
  darkMode?: boolean;
}

export const NotationStage: React.FC<NotationStageProps> = ({
  track,
  chord,
  arpeggio,
  flashState,
  lastResult,
  flashDurationMs,
  darkMode = true
}) => {
  const visibleRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);

  // Pre-render and update visible display
  useEffect(() => {
    if (!offscreenRef.current || !visibleRef.current) return;

    // Render offscreen first (Double-buffering)
    if (track === 'chords' && chord) {
      renderChordToSvg(offscreenRef.current, chord, { width: 340, height: 180, darkMode });
    } else if (track === 'arpeggios' && arpeggio) {
      renderArpeggioToSvg(offscreenRef.current, arpeggio, { width: 360, height: 180, darkMode });
    }

    // Instant swap to visible container
    visibleRef.current.innerHTML = offscreenRef.current.innerHTML;
  }, [track, chord, arpeggio, darkMode]);

  const isMasked = flashState === 'masked';
  const isFlashing = flashState === 'flashing';
  const isFeedback = flashState === 'feedback';

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      {/* Off-screen double buffer (hidden from DOM flow) */}
      <div 
        ref={offscreenRef} 
        className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Notation Card */}
      <div className={`
        relative w-full h-[220px] rounded-2xl border transition-all duration-200
        flex items-center justify-center overflow-hidden
        ${darkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-xl'}
        ${isFeedback && lastResult?.isCorrect ? 'border-emerald-500/80 ring-2 ring-emerald-500/20' : ''}
        ${isFeedback && lastResult && !lastResult.isCorrect ? 'border-rose-500/80 ring-2 ring-rose-500/20' : ''}
      `}>
        {/* Active Notation Render Container */}
        <div 
          ref={visibleRef}
          className={`
            transition-all duration-150 transform flex items-center justify-center
            ${isMasked ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        />

        {/* Masked State Overlay */}
        {isMasked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 mb-2 shadow-inner">
              <EyeOff className="w-6 h-6 text-slate-400 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-300">Image Masked</p>
            <p className="text-xs text-slate-500 mt-0.5">Recall pattern from memory</p>
          </div>
        )}

        {/* Feedback Overlay (Revealed on Submission) */}
        {isFeedback && lastResult && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all animate-in fade-in zoom-in-95">
            {lastResult.isCorrect ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Correct
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 rounded-full">
                <XCircle className="w-4 h-4" /> {lastResult.message || 'Incorrect'}
              </span>
            )}
          </div>
        )}

        {/* Flash Indicator Pill */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          {isFlashing ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Eye className="w-3.5 h-3.5 animate-pulse" /> Flash ({flashDurationMs}ms)
            </span>
          ) : isMasked ? (
            <span className="text-slate-400">Captured (Iconic Memory)</span>
          ) : (
            <span>Ready</span>
          )}
        </div>
      </div>
    </div>
  );
};
