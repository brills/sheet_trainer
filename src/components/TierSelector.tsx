import React from 'react';
import { TrackType } from '../types';
import { CHORD_TIERS } from '../core/theory/chords';
import { ARPEGGIO_TIERS } from '../core/theory/arpeggios';
import { X, CheckCircle2, Lock, Play } from 'lucide-react';

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
  if (!isOpen) return null;

  const tiers = track === 'chords' 
    ? Object.values(CHORD_TIERS)
    : Object.values(ARPEGGIO_TIERS);

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
              Select a tier to drill or review
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {tiers.map(t => {
            const isCurrent = t.tier === currentTier;
            const isMastered = masteredTiers.includes(t.tier);

            return (
              <button
                key={t.tier}
                type="button"
                onClick={() => {
                  onSelectTier(t.tier);
                  onClose();
                }}
                className={`
                  flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all
                  ${isCurrent 
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border
                    ${isMastered 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : isCurrent
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'}
                  `}>
                    {t.tier}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">
                      {t.title}
                    </span>
                    <span className="text-xs text-slate-400 line-clamp-1">
                      {t.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                  {isMastered ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <Play className="w-3 h-3 fill-current" /> Active
                    </span>
                  ) : (
                    <span className="p-1.5 text-slate-600">
                      <Lock className="w-4 h-4 opacity-50" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
