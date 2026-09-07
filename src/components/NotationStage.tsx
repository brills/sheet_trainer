import React, { useEffect, useRef } from 'react';
import { ChordDefinition, ArpeggioDefinition, TrackType, TrialFeedback } from '../types';
import { renderChordToSvg, renderArpeggioToSvg } from '../core/theory/vexflowAdapter';
import { FlashState } from '../core/engines/timingEngine';
import { formatNoteName } from '../core/theory/notes';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface NotationStageProps {
  track: TrackType;
  chord?: ChordDefinition;
  arpeggio?: ArpeggioDefinition;
  flashState: FlashState;
  lastResult?: TrialFeedback | null;
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
  
  // Side-by-side comparison refs for incorrect answers
  const userDiffRef = useRef<HTMLDivElement>(null);
  const targetDiffRef = useRef<HTMLDivElement>(null);

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

  // Render side-by-side comparison staves when feedback is active and incorrect
  useEffect(() => {
    if (flashState !== 'feedback' || !lastResult || lastResult.isCorrect) return;

    if (track === 'chords') {
      if (lastResult.userChord && userDiffRef.current) {
        renderChordToSvg(userDiffRef.current, lastResult.userChord, { 
          width: 170, 
          height: 150, 
          darkMode,
          strokeColor: '#f43f5e' // rose-500 for user error
        });
      }
      if (lastResult.correctChord && targetDiffRef.current) {
        renderChordToSvg(targetDiffRef.current, lastResult.correctChord, { 
          width: 170, 
          height: 150, 
          darkMode,
          strokeColor: '#10b981' // emerald-500 for correct target
        });
      }
    } else if (track === 'arpeggios') {
      if (lastResult.userArpeggio && userDiffRef.current) {
        renderArpeggioToSvg(userDiffRef.current, lastResult.userArpeggio, { 
          width: 175, 
          height: 150, 
          darkMode,
          strokeColor: '#f43f5e' 
        });
      }
      if (lastResult.correctArpeggio && targetDiffRef.current) {
        renderArpeggioToSvg(targetDiffRef.current, lastResult.correctArpeggio, { 
          width: 175, 
          height: 150, 
          darkMode,
          strokeColor: '#10b981' 
        });
      }
    }
  }, [flashState, lastResult, track, darkMode]);

  const isMasked = flashState === 'masked';
  const isFlashing = flashState === 'flashing';
  const isFeedback = flashState === 'feedback';
  const isIncorrect = isFeedback && lastResult && !lastResult.isCorrect;
  const hasSideBySide = isIncorrect && ((lastResult.userChord && lastResult.correctChord) || (lastResult.userArpeggio && lastResult.correctArpeggio));

  // Format notes list for display during feedback
  const notesSummary = track === 'chords' && chord
    ? chord.notes.map(n => formatNoteName(n.letter, n.accidental, true, n.octave)).join(' - ')
    : arpeggio
      ? arpeggio.notes.map(n => formatNoteName(n.letter, n.accidental, true, n.octave)).join(' → ')
      : '';

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
        relative w-full min-h-[230px] rounded-3xl border transition-all duration-300
        flex flex-col items-center justify-center overflow-hidden p-2
        ${darkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'}
        ${isFeedback && lastResult?.isCorrect ? 'border-emerald-500 ring-4 ring-emerald-500/20' : ''}
        ${isIncorrect ? 'border-rose-500/80 ring-4 ring-rose-500/20' : ''}
      `}>
        {/* Regular Single Stave (shown when flashing, masked, or when answer is correct) */}
        {!hasSideBySide && (
          <div 
            ref={visibleRef}
            className={`
              transition-all duration-200 transform flex items-center justify-center
              ${isMasked ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
            `}
          />
        )}

        {/* Side-by-Side Comparison Staves (shown on incorrect answer) */}
        {hasSideBySide && (
          <div className="w-full flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full grid grid-cols-2 gap-2 pt-6">
              {/* Left: User Answer */}
              <div className="flex flex-col items-center rounded-2xl bg-rose-950/20 border border-rose-900/40 p-1.5 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">
                  Your Answer
                </span>
                <div ref={userDiffRef} className="flex items-center justify-center min-h-[120px]" />
                <span className="text-[11px] font-mono font-bold text-rose-300 truncate max-w-[150px]">
                  {lastResult.userStr}
                </span>
              </div>

              {/* Right: Correct Answer */}
              <div className="flex flex-col items-center rounded-2xl bg-emerald-950/20 border border-emerald-900/40 p-1.5 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                  Correct Pattern
                </span>
                <div ref={targetDiffRef} className="flex items-center justify-center min-h-[120px]" />
                <span className="text-[11px] font-mono font-bold text-emerald-300 truncate max-w-[150px]">
                  {lastResult.correctStr}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Masked State Overlay */}
        {isMasked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 mb-2 shadow-inner">
              <EyeOff className="w-6 h-6 text-slate-400 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-200">Image Masked</p>
            <p className="text-xs text-slate-400 mt-0.5">Recall pattern from iconic memory</p>
          </div>
        )}

        {/* Feedback Top Pill Overlay */}
        {isFeedback && lastResult && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all animate-in fade-in zoom-in-95 z-10">
            {lastResult.isCorrect ? (
              <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 rounded-full font-bold shadow-md shadow-emerald-950/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Correct!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-300 bg-rose-950/90 border border-rose-500/40 px-3 py-1 rounded-full font-bold shadow-md shadow-rose-950/50">
                <XCircle className="w-4 h-4 text-rose-400" /> Incorrect
              </span>
            )}
          </div>
        )}

        {/* Feedback Bottom Solution Banner & Slot Mismatch Chips */}
        {isFeedback && (
          <div className={`
            w-full mt-2 py-2 px-3 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center animate-in slide-in-from-bottom-2 duration-200
            ${lastResult?.isCorrect 
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
              : 'bg-slate-950/80 border-rose-500/30 text-slate-200'}
          `}>
            {/* Slot Diff Chips (if in direct entry mode) */}
            {lastResult?.slotDiffs && lastResult.slotDiffs.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
                {lastResult.slotDiffs.map(slot => (
                  <div
                    key={slot.slot}
                    className={`
                      px-2.5 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1
                      ${slot.isMatch 
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                        : 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-900/40'}
                    `}
                  >
                    <span className="text-[10px] uppercase text-slate-400">{slot.label}:</span>
                    <span>{slot.userVal}</span>
                    {!slot.isMatch && (
                      <span className="text-emerald-400 text-[11px]">→ {slot.correctVal}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-xs font-bold">
                <span>{track === 'chords' ? (chord?.displayName) : (arpeggio?.displayName)}</span>
              </div>
            )}

            {notesSummary && (
              <span className="text-[11px] font-mono text-slate-300">
                Notes: {notesSummary}
              </span>
            )}

            <span className="text-[10px] text-slate-400 mt-1 font-sans">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Enter</kbd> to continue
            </span>
          </div>
        )}

        {/* Flash Indicator Pill (shown when not in feedback) */}
        {!isFeedback && (
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            {isFlashing ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Eye className="w-3.5 h-3.5 animate-pulse" /> Flash ({flashDurationMs}ms)
              </span>
            ) : isMasked ? (
              <span className="text-slate-400">Captured</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
