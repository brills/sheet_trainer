import React from 'react';
import { Clef, InputMode, TrackType } from '../types';
import { CHORD_TIERS } from '../core/theory/chords';
import { ARPEGGIO_TIERS } from '../core/theory/arpeggios';
import { Layers } from 'lucide-react';

interface TrackHeaderProps {
  track: TrackType;
  clef: Clef;
  onClefChange: (clef: Clef) => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  currentTier: number;
  onOpenTierModal: () => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  clef,
  onClefChange,
  inputMode,
  onInputModeChange,
  currentTier,
  onOpenTierModal
}) => {
  const tierConfig = track === 'chords' 
    ? CHORD_TIERS[currentTier] || CHORD_TIERS[1.1]
    : ARPEGGIO_TIERS[currentTier] || ARPEGGIO_TIERS[1.1];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2.5 mb-3">
      {/* Tier Selector Ribbon */}
      <button
        type="button"
        onClick={onOpenTierModal}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-md group text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs group-hover:scale-105 transition-transform">
            {currentTier}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
              {tierConfig.title}
            </span>
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

      {/* Control Bar: Clef Toggle + Input Mode Selector */}
      <div className="grid grid-cols-2 gap-2">
        {/* 1. Clef Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            type="button"
            onClick={() => onClefChange('treble')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              clef === 'treble' 
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            𝄞 Treble
          </button>
          <button
            type="button"
            onClick={() => onClefChange('bass')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              clef === 'bass' 
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            𝄢 Bass
          </button>
        </div>

        {/* 2. Input Mode Selector */}
        <div className="flex p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <select
            value={inputMode}
            onChange={e => onInputModeChange(e.target.value as InputMode)}
            className="w-full bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer px-2"
          >
            <option value="direct_entry" className="bg-slate-900 text-slate-200">⌨️ Direct Entry</option>
            <option value="multiple_choice" className="bg-slate-900 text-slate-200">🎴 Multiple Choice</option>
          </select>
        </div>
      </div>
    </div>
  );
};
