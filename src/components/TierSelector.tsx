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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b2620]/45 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[#f7f4ee] border border-[#ddd6c8] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ddd6c8] bg-[#eee9df]">
          <div className="flex flex-col">
            <h2 className="text-base font-serif font-bold text-[#38332d]">
              {track === 'chords' ? '🎼 Chords Curriculum' : '〰️ Arpeggios Curriculum'}
            </h2>
            <p className="text-xs text-[#6b6358]">
              Select any tier to practice, or tap <span className="text-[#8c531b] font-semibold">💡 Hint</span> for theory cues
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6b6358] hover:text-[#38332d] hover:bg-[#e4ddcf] transition-all cursor-pointer"
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
                    ? 'bg-[#fcfbfa] border-[#d4bda8] ring-2 ring-[#d4bda8]/50 shadow-sm' 
                    : 'bg-[#fcfbfa] border-[#ddd6c8] hover:border-[#c8bfaa]'}
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
                          ? 'bg-[#eef5ef] border-[#bcd4bf] text-[#2d5736]' 
                          : isCurrent
                            ? 'bg-[#f5ede1] text-[#8c531b] border-[#d4bda8] font-extrabold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
                            : 'bg-[#eee9df] border-[#ddd6c8] text-[#6b6358] group-hover:text-[#38332d]'}
                      `}>
                        {t.tier}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-serif font-bold text-[#38332d] group-hover:text-[#8c531b] transition-colors truncate">
                          {t.title}
                        </span>
                        <span className="text-xs text-[#6b6358] line-clamp-1 font-sans">
                          {t.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      {isMastered ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#2d5736] bg-[#eef5ef] border border-[#bcd4bf] px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                        </span>
                      ) : isCurrent ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#8c531b] bg-[#f5ede1] border border-[#d4bda8] px-2.5 py-1 rounded-full">
                          <Play className="w-3 h-3 fill-current" /> Active
                        </span>
                      ) : (
                        <span className="p-1 text-[#8a8275] group-hover:text-[#38332d] transition-colors">
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
                          ? 'bg-[#f5ede1] text-[#8c531b] border-[#d4bda8] shadow-sm' 
                          : 'bg-[#eee9df] text-[#8c531b] border-[#ddd6c8] hover:bg-[#f5ede1] hover:border-[#d4bda8]'}
                      `}
                    >
                      <Lightbulb className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline font-sans">Hint</span>
                      {isHintExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Expanded Hint Section */}
                {isHintExpanded && hint && (
                  <div className="p-3.5 border-t border-[#ddd6c8] bg-[#f5ede1]/50 flex flex-col gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start gap-2 text-[#8c531b] font-medium">
                      <Sparkles className="w-4 h-4 text-[#8c531b] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#8c531b] uppercase tracking-wider text-[10px] block mb-0.5 font-mono">Visual Shape Cue:</span>
                        <span className="text-[#38332d] leading-relaxed font-sans">{hint.visualCue}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[#2d5736] font-medium pt-1.5 border-t border-[#ddd6c8]/60">
                      <span className="w-4 text-center text-[#2d5736] font-bold">💡</span>
                      <div>
                        <span className="font-bold text-[#2d5736] uppercase tracking-wider text-[10px] block mb-0.5 font-mono">Recognition Cheat Code:</span>
                        <span className="text-[#38332d] leading-relaxed font-sans">{hint.cheatCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#6b6358] pt-1.5 border-t border-[#ddd6c8]/60 font-mono text-[11px] flex-wrap">
                      <span className="text-[#8a8275] font-bold uppercase tracking-wider text-[10px]">Formula:</span>
                      <span className="text-[#8c531b] bg-[#fcfbfa] px-2 py-0.5 rounded border border-[#ddd6c8]">{hint.formula}</span>
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
