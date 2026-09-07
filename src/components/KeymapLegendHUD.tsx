import React, { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { CHORD_TIERS } from '../core/theory/chords';
import { ChordQuality } from '../types';

interface KeymapLegendHUDProps {
  lastPressedKey?: string | null;
  mode?: 'direct_entry' | 'multiple_choice';
  tier?: number;
}

const QUALITY_LEGEND_MAP: Record<string, { key: string; label: string }> = {
  minor: { key: 'm', label: 'Min' },
  major: { key: 'M', label: 'Maj' },
  dom7: { key: '7', label: '7th' },
  maj7: { key: 'j', label: 'Maj7' },
  min7: { key: 'k', label: 'm7' },
  half_dim7: { key: 'h', label: 'ø7' },
  diminished: { key: 'd', label: 'Dim' },
  augmented: { key: 'a', label: 'Aug' },
  sus4: { key: '4', label: 'Sus4' },
  sus2: { key: '2', label: 'Sus2' },
  dim7: { key: 'o', label: '°7' },
  add9: { key: '9', label: 'Add9' },
  '6': { key: '6', label: '6' },
  m6: { key: 'm', label: 'm6' },
  '9': { key: '9', label: '9' },
  '7s9': { key: '7', label: '7♯9' },
  '7b9': { key: '7', label: '7♭9' }
};

export const KeymapLegendHUD: React.FC<KeymapLegendHUDProps> = ({
  lastPressedKey,
  mode = 'direct_entry',
  tier
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (lastPressedKey) {
      setActiveKey(lastPressedKey.toLowerCase());
      const timer = setTimeout(() => setActiveKey(null), 300);
      return () => clearTimeout(timer);
    }
  }, [lastPressedKey]);

  const isKeyActive = (key: string) => activeKey === key.toLowerCase();

  const tierConfig = tier ? CHORD_TIERS[tier] : undefined;
  const activeQualities: ChordQuality[] = tierConfig?.qualities || ['major', 'minor', 'dom7', 'maj7', 'min7', 'half_dim7'];

  return (
    <div className="hidden md:flex items-center justify-center gap-4 px-4 py-2 mt-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono text-slate-400 select-none shadow-lg">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold pr-2 border-r border-slate-800">
        <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
        <span>Keys:</span>
      </div>

      {mode === 'direct_entry' && (
        <>
          {/* Root Notes */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-0.5">Root:</span>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(k => (
              <span
                key={k}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  isKeyActive(k) 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' 
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                }`}
              >
                {k}
              </span>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          {/* Accidentals */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-0.5">Acc:</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('s') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[S] ♯</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('b') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[B] ♭</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive(' ') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[Space] ♮</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Qualities */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-0.5">Quality:</span>
            {activeQualities.map(q => {
              const info = QUALITY_LEGEND_MAP[q];
              if (!info) return null;
              return (
                <span
                  key={q}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    isKeyActive(info.key)
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                  }`}
                >
                  [{info.key}] {info.label}
                </span>
              );
            })}
          </div>

          <span className="text-slate-700">|</span>

          {/* Inversion / Voicing */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-0.5">Inv:</span>
            {tier && (tier === 1.1 || tier === 1.2 || tier === 1.3 || tier === 3.1 || tier === 3.2 || tier === 3.3 || tier === 3.4 || tier === 3.6 || tier === 3.7 || tier === 4.1 || tier === 4.2) ? (
              <span className="px-2 py-0.5 rounded border bg-slate-800/50 border-slate-700/40 text-emerald-400/80 text-[10px]">
                {tier === 3.6 ? 'Drop-2 (Auto)' : (tier === 3.7 ? 'Drop-3 (Auto)' : 'Auto (Fixed in Tier)')}
              </span>
            ) : (
              <>
                <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('0') || isKeyActive('r') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[0] Root</span>
                <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('1') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[1] 1st</span>
                <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('2') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[2] 2nd</span>
                <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('3') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[3] 3rd</span>
              </>
            )}
          </div>
        </>
      )}

      {mode === 'multiple_choice' && (
        <div className="flex items-center gap-2">
          <span>Choose option:</span>
          {['1 / A', '2 / S', '3 / D', '4 / F'].map((k, i) => (
            <span key={k} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
              Option [{i + 1}]
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
