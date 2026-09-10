import React, { useEffect, useRef } from 'react';
import { ChordDefinition, ArpeggioDefinition, TrackType, TrialFeedback, KeySignatureDefinition } from '../types';
import { renderChordToSvg, renderArpeggioToSvg } from '../core/theory/vexflowAdapter';
import { formatNoteName } from '../core/theory/notes';
import { CheckCircle2, XCircle, ArrowRight, Award, Compass, Timer } from 'lucide-react';

interface NotationStageProps {
  track: TrackType;
  chord?: ChordDefinition;
  arpeggio?: ArpeggioDefinition;
  keySignature?: KeySignatureDefinition;
  isFeedback: boolean;
  lastResult?: TrialFeedback | null;
  darkMode?: boolean;
  onContinue?: () => void;
  canSkip?: boolean;
}

export const NotationStage: React.FC<NotationStageProps> = ({
  track,
  chord,
  arpeggio,
  keySignature,
  isFeedback,
  lastResult,
  darkMode = true,
  onContinue,
  canSkip = true
}) => {
  const visibleRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);
  
  // Side-by-side comparison refs for incorrect answers
  const userDiffRef = useRef<HTMLDivElement>(null);
  const targetDiffRef = useRef<HTMLDivElement>(null);

  const activeKey = keySignature || chord?.keySignature || arpeggio?.keySignature;

  // Pre-render and update visible display
  useEffect(() => {
    if (!offscreenRef.current || !visibleRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const staveWidth = isMobile ? 310 : (track === 'chords' ? 340 : 360);
    const staveHeight = isMobile ? 150 : 170;

    // Render offscreen first (Double-buffering)
    if (track === 'chords' && chord) {
      renderChordToSvg(offscreenRef.current, chord, { 
        width: staveWidth, 
        height: staveHeight, 
        darkMode,
        keySignature: activeKey 
      });
    } else if (track === 'arpeggios' && arpeggio) {
      renderArpeggioToSvg(offscreenRef.current, arpeggio, { 
        width: staveWidth, 
        height: staveHeight, 
        darkMode,
        keySignature: activeKey 
      });
    }

    // Instant swap to visible container
    visibleRef.current.innerHTML = offscreenRef.current.innerHTML;
  }, [track, chord, arpeggio, darkMode, activeKey]);

  // Render side-by-side comparison staves when feedback is active and incorrect
  useEffect(() => {
    if (!isFeedback || !lastResult || lastResult.isCorrect) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const diffWidth = isMobile ? 140 : 170;
    const diffHeight = isMobile ? 120 : 140;

    if (track === 'chords') {
      if (lastResult.userChord && userDiffRef.current) {
        renderChordToSvg(userDiffRef.current, lastResult.userChord, { 
          width: diffWidth, 
          height: diffHeight, 
          darkMode,
          keySignature: activeKey,
          strokeColor: '#f43f5e' // rose-500 for user error
        });
      }
      if (lastResult.correctChord && targetDiffRef.current) {
        renderChordToSvg(targetDiffRef.current, lastResult.correctChord, { 
          width: diffWidth, 
          height: diffHeight, 
          darkMode,
          keySignature: activeKey,
          strokeColor: '#10b981' // emerald-500 for correct target
        });
      }
    } else if (track === 'arpeggios') {
      if (lastResult.userArpeggio && userDiffRef.current) {
        renderArpeggioToSvg(userDiffRef.current, lastResult.userArpeggio, { 
          width: diffWidth, 
          height: diffHeight, 
          darkMode,
          keySignature: activeKey,
          strokeColor: '#f43f5e' 
        });
      }
      if (lastResult.correctArpeggio && targetDiffRef.current) {
        renderArpeggioToSvg(targetDiffRef.current, lastResult.correctArpeggio, { 
          width: diffWidth, 
          height: diffHeight, 
          darkMode,
          keySignature: activeKey,
          strokeColor: '#10b981' 
        });
      }
    }
  }, [isFeedback, lastResult, track, darkMode, activeKey]);

  const isIncorrect = isFeedback && lastResult && !lastResult.isCorrect;
  const hasSideBySide = isIncorrect && ((lastResult.userChord && lastResult.correctChord) || (lastResult.userArpeggio && lastResult.correctArpeggio));

  // Format notes list for display during feedback
  const notesSummary = track === 'chords' && chord
    ? chord.notes.map(n => formatNoteName(n.letter, n.accidental, true, n.octave)).join(' - ')
    : arpeggio
      ? arpeggio.notes.map(n => formatNoteName(n.letter, n.accidental, true, n.octave)).join(' → ')
      : '';

  const activeClef = track === 'chords' ? (chord?.clef || 'treble') : (arpeggio?.clef || 'treble');

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center select-none">
      {/* Off-screen double buffer (hidden from DOM flow) */}
      <div 
        ref={offscreenRef} 
        className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Notation Card with Strict Constant Responsive Height */}
      <div className={`
        relative w-full h-[295px] sm:h-[350px] rounded-3xl border transition-colors duration-200
        flex flex-col justify-between overflow-hidden
        ${darkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'}
        ${isFeedback && lastResult?.isCorrect ? 'border-emerald-500/80 ring-2 ring-emerald-500/20' : ''}
        ${isIncorrect ? 'border-rose-500/80 ring-2 ring-rose-500/20' : ''}
      `}>
        
        {/* 1. Dedicated Header Bar (Fixed Height: 34px on mobile, 38px on desktop) */}
        <div className="h-[34px] sm:h-[38px] px-3 sm:px-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40 shrink-0 text-xs">
          {/* Left: Clef & Key Signature Indicator */}
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="font-bold text-emerald-400">
              {activeClef === 'bass' ? '𝄢 Bass Clef' : '𝄞 Treble Clef'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-500" />
              <span>{activeKey?.name || 'C / Am'}</span>
            </span>
          </div>

          {/* Right: State-Specific Status Pill */}
          <div className="flex items-center">
            {!isFeedback && (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-mono bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-full">
                <Timer className="w-3 h-3 text-emerald-400/80" />
                <span>Active Trial</span>
              </span>
            )}

            {isFeedback && lastResult?.isCorrect && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Correct!</span>
                {lastResult.latencyMs !== undefined && lastResult.latencyMs > 0 && (
                  <span className="text-[10px] font-mono text-emerald-200/80 font-normal ml-0.5 pl-1 border-l border-emerald-700/60">
                    {(lastResult.latencyMs / 1000).toFixed(2)}s
                  </span>
                )}
              </span>
            )}

            {isFeedback && !lastResult?.isCorrect && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2.5 py-0.5 rounded-full shadow-sm animate-in fade-in">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Incorrect</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Stave Viewport (Fixed Height: 155px on mobile, 175px on desktop) */}
        <div className="h-[155px] sm:h-[175px] w-full flex items-center justify-center shrink-0 relative overflow-hidden">
          {/* Regular Single Stave (Always positioned identically across question & correct feedback) */}
          {!hasSideBySide && (
            <div 
              ref={visibleRef}
              className="flex items-center justify-center w-full h-full"
            />
          )}

          {/* Side-by-Side Comparison Staves (Shown strictly within the same 155px/175px bounds on error) */}
          {hasSideBySide && (
            <div className="w-full h-full flex items-center justify-center px-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-full grid grid-cols-2 gap-2 items-center">
                {/* Left: User Answer */}
                <div className="flex flex-col items-center rounded-2xl bg-rose-950/20 border border-rose-900/40 p-1 relative">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">
                    Your Answer
                  </span>
                  <div ref={userDiffRef} className="flex items-center justify-center min-h-[95px] sm:min-h-[110px]" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-rose-300 truncate max-w-[140px]">
                    {lastResult.userStr}
                  </span>
                </div>

                {/* Right: Correct Answer */}
                <div className="flex flex-col items-center rounded-2xl bg-emerald-950/20 border border-emerald-900/40 p-1 relative">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                    Correct Pattern
                  </span>
                  <div ref={targetDiffRef} className="flex items-center justify-center min-h-[95px] sm:min-h-[110px]" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-300 truncate max-w-[140px]">
                    {lastResult.correctStr}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Dedicated Bottom Panel (Fixed Height: 106px on mobile, 137px on desktop) */}
        <div className="h-[106px] sm:h-[137px] w-full flex flex-col items-center justify-center px-3 py-1.5 sm:py-2 border-t border-slate-800/60 bg-slate-950/50 shrink-0 text-center">
          
          {/* State A: Question Presentation Standby Guide */}
          {!isFeedback && (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full animate-in fade-in">
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Identify the pattern on the staff
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">
                Take as much time as needed · Play along or submit answer
              </span>
              <button
                type="button"
                disabled={!canSkip}
                onClick={onContinue}
                className={`mt-0.5 px-4 py-1.5 sm:py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border shadow-md active:scale-95 transition-all
                  ${canSkip 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer' 
                    : 'bg-slate-900/40 text-slate-600 border-slate-800/40 opacity-40 cursor-not-allowed pointer-events-none'
                  }`}
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Enter / ➔)</span>
              </button>
            </div>
          )}

          {/* State B: Correct Answer Feedback Panel */}
          {isFeedback && lastResult?.isCorrect && (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full animate-in fade-in">
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-emerald-300">
                <span>{track === 'chords' ? (chord?.displayName) : (arpeggio?.displayName)}</span>
              </div>

              {notesSummary && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-slate-300 truncate max-w-full">
                  <span>Notes: {notesSummary}</span>
                </div>
              )}

              {lastResult?.masteryNotification ? (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{lastResult.masteryNotification}</span>
                </div>
              ) : null}

              <button
                type="button"
                onClick={onContinue}
                className="mt-0.5 px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-[10px] opacity-75 font-normal ml-0.5">(Space / Enter)</span>
              </button>
            </div>
          )}

          {/* State C: Incorrect Answer Feedback Panel */}
          {isFeedback && !lastResult?.isCorrect && (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full animate-in fade-in">
              {/* Slot Diff Mismatch Chips */}
              {lastResult?.slotDiffs && lastResult.slotDiffs.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1 max-w-full overflow-hidden">
                  {lastResult.slotDiffs.map(slot => (
                    <div
                      key={slot.slot}
                      className={`
                        px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold border flex items-center gap-1
                        ${slot.isMatch 
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                          : 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-sm'}
                      `}
                    >
                      <span className="text-[9px] uppercase text-slate-400">{slot.label}:</span>
                      <span>{slot.userVal}</span>
                      {!slot.isMatch && (
                        <span className="text-emerald-400 text-[10px]">→ {slot.correctVal}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-full">
                  Target: {track === 'chords' ? (chord?.displayName) : (arpeggio?.displayName)}
                </span>
              )}

              {/* Fully Diminished 7th Grading Clarification Note */}
              {((track === 'chords' && chord?.quality === 'dim7') || (track === 'arpeggios' && arpeggio?.quality === 'dim7')) ? (
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded max-w-full truncate">
                  <span>💡 <strong>°7 Grading:</strong> Graded by spelled notation (stack bottom = Root; 2nd clash top = Root).</span>
                </div>
              ) : (
                notesSummary && (
                  <span className="text-[10px] sm:text-xs font-mono text-slate-300 truncate max-w-full">
                    Correct Notes: {notesSummary}
                  </span>
                )
              )}

              <button
                type="button"
                onClick={onContinue}
                className="mt-0.5 px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue to Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-[10px] opacity-75 font-normal ml-0.5">(Space / Enter)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

