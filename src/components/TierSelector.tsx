import React, { useState } from 'react';
import { TrackType } from '../types';
import { CHORD_TIERS } from '../core/theory/chords';
import { ARPEGGIO_TIERS } from '../core/theory/arpeggios';
import { ARPEGGIO_TIER_HINTS, CHORD_TIER_HINTS } from '../core/theory/tierHints';
import { X, CheckCircle2, Play, ChevronRight, Lightbulb, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface TierSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackType;
  currentTier: number;
  onSelectTier: (tier: number) => void;
  masteredTiers: number[];
}

export const TierSelector: React.FC<TierSelectorProps> = ({
  isOpen,
  onClose,
  track,
  currentTier,
  onSelectTier,
  masteredTiers
}) => {
  const [expandedHintTier, setExpandedHintTier] = useState<number | null>(null);

  if (!isOpen) return null;

  const tiers = track === 'chords' 
    ? Object.values(CHORD_TIERS)
    : Object.values(ARPEGGIO_TIERS);

  const hintsMap = track === 'chords' ? CHORD_TIER_HINTS : ARPEGGIO_TIER_HINTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-100">
              {track === 'chords' ? '🎼 Chords Curriculum' : '〰️ Arpeggios Curriculum'}
            </h2>
            <p className="text-xs text-slate-400">
              Select any tier to practice, or tap <span className="text-amber-400 font-semibold">💡 Hint</span> for theory cues
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2.5">
          {tiers.map(t => {
            const isCurrent = t.tier === currentTier;
            const isMastered = masteredTiers.includes(t.tier);
            const hint = hintsMap[t.tier];
            const isHintExpanded = expandedHintTier === t.tier;

            return (
              <div
                key={t.tier}
                className={`
                  shrink-0 rounded-2xl border transition-all overflow-hidden
                  ${isCurrent 
                    ? 'bg-slate-900/90 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'}
                `}
              >
                {/* Main Clickable Row */}
                <div className="flex items-center justify-between p-3.5 gap-2">
                  {/* Tier Selection Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTier(t.tier);
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-between text-left cursor-pointer group min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shrink-0
                        ${isMastered 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                          : isCurrent
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                            : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:text-slate-200'}
                      `}>
                        {t.tier}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                          {t.title}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {t.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      {isMastered ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                        </span>
                      ) : isCurrent ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          <Play className="w-3 h-3 fill-current" /> Active
                        </span>
                      ) : (
                        <span className="p-1 text-slate-600 group-hover:text-slate-400 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Hint Toggle Button */}
                  {hint && (
                    <button
                      type="button"
                      title="View sight-reading hints & theory cues"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedHintTier(isHintExpanded ? null : t.tier);
                      }}
                      className={`
                        flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0
                        ${isHintExpanded 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                          : 'bg-slate-800/80 text-amber-400/90 border-slate-700/80 hover:bg-amber-950/30 hover:border-amber-500/40 hover:text-amber-300'}
                      `}
                    >
                      <Lightbulb className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Hint</span>
                      {isHintExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Expanded Hint Section */}
                {isHintExpanded && hint && (
                  <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-col gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start gap-2 text-amber-300 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block mb-0.5">Visual Shape Cue:</span>
                        <span className="text-slate-300 leading-relaxed">{hint.visualCue}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-emerald-300 font-medium pt-1.5 border-t border-slate-800/80">
                      <span className="w-4 text-center text-emerald-400 font-bold">💡</span>
                      <div>
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-0.5">Recognition Cheat Code:</span>
                        <span className="text-slate-300 leading-relaxed">{hint.cheatCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono text-[11px] flex-wrap">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Formula:</span>
                      <span className="text-emerald-400/90 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{hint.formula}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
