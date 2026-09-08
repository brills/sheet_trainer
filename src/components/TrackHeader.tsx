import React from 'react';
import { TrackType } from '../types';
import { CHORD_TIERS } from '../core/theory/chords';
import { ARPEGGIO_TIERS } from '../core/theory/arpeggios';
import { Layers, CheckCircle2 } from 'lucide-react';

interface TrackHeaderProps {
  track: TrackType;
  currentTier: number;
  isMastered?: boolean;
  onOpenTierModal: () => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  currentTier,
  isMastered = false,
  onOpenTierModal
}) => {
  const tierConfig = track === 'chords' 
    ? CHORD_TIERS[currentTier] || CHORD_TIERS[1.1]
    : ARPEGGIO_TIERS[currentTier] || ARPEGGIO_TIERS[1.1];

  return (
    <div className="w-full max-w-md mx-auto mb-3">
      {/* Tier Selector Ribbon */}
      <button
        type="button"
        onClick={onOpenTierModal}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-md group text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs group-hover:scale-105 transition-transform border
            ${isMastered 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}
          `}>
            {currentTier}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                {tierConfig.title}
              </span>
              {isMastered && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 truncate max-w-[240px]">
              {tierConfig.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          <Layers className="w-3.5 h-3.5" />
          <span>Tiers</span>
        </div>
      </button>
    </div>
  );
};
