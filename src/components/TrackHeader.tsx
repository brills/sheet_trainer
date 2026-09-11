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
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-theme-panel border border-theme-border hover:border-theme-borderStrong transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] group text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center font-serif font-bold text-xs group-hover:scale-105 transition-transform border
            ${isMastered 
              ? 'bg-theme-success-tint border-theme-success-border text-theme-success' 
              : 'bg-theme-accent-tint border-theme-accent-border text-theme-accent'}
          `}>
            {currentTier}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                {tierConfig.title}
              </span>
              {isMastered && (
                <span className="flex items-center gap-0.5 text-[10px] font-serif font-bold text-theme-success bg-theme-success-tint border border-theme-success-border px-1.5 py-0.2 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>
            <span className="text-[11px] font-cormorant italic text-theme-muted truncate max-w-[240px]">
              {tierConfig.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-serif font-medium text-theme-accent bg-theme-accent-tint border border-theme-accent-border px-2.5 py-1 rounded-full">
          <Layers className="w-3.5 h-3.5" />
          <span>Tiers</span>
        </div>
      </button>
    </div>
  );
};
