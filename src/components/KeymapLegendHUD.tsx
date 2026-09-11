import React, { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { CHORD_TIERS } from '../core/theory/chords';
import { ChordQuality } from '../types';

interface KeymapLegendHUDProps {
  lastPressedKey?: string | null;
  mode?: 'direct_entry' | 'multiple_choice';
  tier?: number;
}

export function getQualityLegendInfo(quality: ChordQuality, tier?: number): { key: string; label: string; activeKeys: string[] } {
  if (tier !== undefined && tier !== null) {
    if (tier >= 3.0 && tier < 4.0) {
      if (quality === 'maj7') return { key: 'M', label: 'Maj7', activeKeys: ['M'] };
      if (quality === 'min7') return { key: 'm', label: 'm7', activeKeys: ['m'] };
      if (quality === 'dom7') return { key: '7', label: '7th', activeKeys: ['7'] };
      if (quality === 'half_dim7') return { key: 'h', label: 'ø7', activeKeys: ['h', 'H'] };
      if (quality === 'dim7') return { key: 'd', label: '°7', activeKeys: ['d', 'D'] };
    } else if (tier >= 2.0 && tier < 3.0) {
      if (quality === 'sus4') return { key: '4', label: 'Sus4', activeKeys: ['4'] };
      if (quality === 'sus2') return { key: '2', label: 'Sus2', activeKeys: ['2'] };
      if (quality === 'minor') return { key: 'm', label: 'Min', activeKeys: ['m'] };
      if (quality === 'major') return { key: 'M', label: 'Maj', activeKeys: ['M'] };
      if (quality === 'diminished') return { key: 'd', label: 'Dim', activeKeys: ['d', 'D'] };
      if (quality === 'augmented') return { key: 'a', label: 'Aug', activeKeys: ['a', 'A'] };
    } else if (tier >= 4.0 && tier < 4.2) {
      if (quality === 'add9') return { key: '9', label: 'Add9', activeKeys: ['9', 'a', 'A'] };
      if (quality === '6') return { key: '6', label: '6', activeKeys: ['6'] };
      if (quality === 'm6') return { key: 'm', label: 'm6', activeKeys: ['m'] };
    } else if (tier >= 4.2) {
      if (quality === '9') return { key: '9', label: '9', activeKeys: ['9'] };
      if (quality === '7s9') return { key: '7', label: '7♯9', activeKeys: ['7'] };
      if (quality === '7b9') return { key: '7', label: '7♭9', activeKeys: ['7'] };
      if (quality === 'min7') return { key: 'm', label: 'm7', activeKeys: ['m'] };
      if (quality === 'maj7') return { key: 'M', label: 'Maj7', activeKeys: ['M'] };
    } else {
      // Triad Tiers (1.1 - 1.4)
      if (quality === 'major') return { key: 'M', label: 'Maj', activeKeys: ['M'] };
      if (quality === 'minor') return { key: 'm', label: 'Min', activeKeys: ['m'] };
      if (quality === 'diminished') return { key: 'd', label: 'Dim', activeKeys: ['d', 'D'] };
      if (quality === 'augmented') return { key: 'a', label: 'Aug', activeKeys: ['a', 'A'] };
    }
  }

  // Fallback defaults
  const defaults: Record<string, { key: string; label: string; activeKeys: string[] }> = {
    minor: { key: 'm', label: 'Min', activeKeys: ['m'] },
    major: { key: 'M', label: 'Maj', activeKeys: ['M'] },
    dom7: { key: '7', label: '7th', activeKeys: ['7'] },
    maj7: { key: 'M', label: 'Maj7', activeKeys: ['M'] },
    min7: { key: 'm', label: 'm7', activeKeys: ['m'] },
    half_dim7: { key: 'h', label: 'ø7', activeKeys: ['h', 'H'] },
    diminished: { key: 'd', label: 'Dim', activeKeys: ['d', 'D'] },
    augmented: { key: 'a', label: 'Aug', activeKeys: ['a', 'A'] },
    sus4: { key: '4', label: 'Sus4', activeKeys: ['4'] },
    sus2: { key: '2', label: 'Sus2', activeKeys: ['2'] },
    dim7: { key: 'd', label: '°7', activeKeys: ['d', 'D'] },
    add9: { key: '9', label: 'Add9', activeKeys: ['9', 'a', 'A'] },
    '6': { key: '6', label: '6', activeKeys: ['6'] },
    m6: { key: 'm', label: 'm6', activeKeys: ['m'] },
    '9': { key: '9', label: '9', activeKeys: ['9'] },
    '7s9': { key: '7', label: '7♯9', activeKeys: ['7'] },
    '7b9': { key: '7', label: '7♭9', activeKeys: ['7'] }
  };

  return defaults[quality] || { key: quality[0], label: quality, activeKeys: [quality[0]] };
}

export const KeymapLegendHUD: React.FC<KeymapLegendHUDProps> = ({
  lastPressedKey,
  mode = 'direct_entry',
  tier
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (lastPressedKey) {
      setActiveKey(lastPressedKey);
      const timer = setTimeout(() => setActiveKey(null), 300);
      return () => clearTimeout(timer);
    }
  }, [lastPressedKey]);

  // Do not show key legend under multiple-choice mode
  if (mode !== 'direct_entry') {
    return null;
  }

  const isRootActive = (k: string) => activeKey !== null && activeKey.toUpperCase() === k.toUpperCase();
  const isSharpActive = activeKey === 's' || activeKey === 'S' || activeKey === '#';
  const isFlatActive = activeKey === 'b' || activeKey === 'B' || activeKey === '-';
  const isNaturalActive = activeKey === ' ' || activeKey === 'Spacebar';

  const tierConfig = tier ? CHORD_TIERS[tier] : undefined;
  const activeQualities: ChordQuality[] = tierConfig?.qualities || ['major', 'minor', 'dom7', 'maj7', 'min7', 'half_dim7'];

  return (
    <div className="hidden md:flex flex-col gap-2 w-full max-w-md mx-auto mt-3 p-2.5 rounded-2xl bg-theme-panel border border-theme-border text-[10px] sm:text-[11px] font-mono text-theme-muted select-none shadow-sm">
      {/* Row 1: Root & Accidentals */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        {/* Roots */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-theme-dim font-bold uppercase text-[9px] mr-0.5">
            <Keyboard className="w-3 h-3 text-theme-accent" />
            <span>Root:</span>
          </div>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(k => (
            <span
              key={k}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                isRootActive(k) 
                  ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' 
                  : 'bg-theme-card border-theme-border text-theme-primary'
              }`}
            >
              {k}
            </span>
          ))}
        </div>

        {/* Accidentals */}
        <div className="flex items-center gap-1">
          <span className="text-theme-dim font-bold uppercase text-[9px] mr-0.5">Acc:</span>
          <span className={`px-1.5 py-0.5 rounded border ${isSharpActive ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[S]♯</span>
          <span className={`px-1.5 py-0.5 rounded border ${isFlatActive ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[B]♭</span>
          <span className={`px-1.5 py-0.5 rounded border ${isNaturalActive ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[⎵]♮</span>
        </div>
      </div>

      {/* Row 2: Qualities & Inversions */}
      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-theme-border/60 flex-wrap">
        {/* Qualities */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-theme-dim font-bold uppercase text-[9px] mr-0.5">Quality:</span>
          {activeQualities.map(q => {
            const info = getQualityLegendInfo(q, tier);
            const isQualityActive = activeKey !== null && info.activeKeys.includes(activeKey);
            return (
              <span
                key={q}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  isQualityActive
                    ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
                    : 'bg-theme-card border-theme-border text-theme-primary'
                }`}
              >
                [{info.key}]{info.label}
              </span>
            );
          })}
        </div>

        {/* Inversions */}
        <div className="flex items-center gap-1">
          <span className="text-theme-dim font-bold uppercase text-[9px] mr-0.5">Inv:</span>
          {tier && (tier === 1.1 || tier === 1.2 || tier === 1.3 || tier === 3.1 || tier === 3.2 || tier === 3.3 || tier === 3.4 || tier === 3.6 || tier === 3.7 || tier === 4.1 || tier === 4.2) ? (
            <span className="px-1.5 py-0.5 rounded border bg-theme-panelElevated border-theme-border text-theme-accent text-[9px] font-medium">
              {tier === 3.6 ? 'Drop-2' : (tier === 3.7 ? 'Drop-3' : 'Auto')}
            </span>
          ) : (
            <>
              {(!tierConfig || tierConfig.inversions.includes('root')) && (
                <span className={`px-1.5 py-0.5 rounded border ${activeKey === 'r' || activeKey === 'R' || activeKey === '0' ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[r]Root</span>
              )}
              {(!tierConfig || tierConfig.inversions.includes('1st')) && (
                <span className={`px-1.5 py-0.5 rounded border ${activeKey === '1' ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[1]1st</span>
              )}
              {(!tierConfig || tierConfig.inversions.includes('2nd')) && (
                <span className={`px-1.5 py-0.5 rounded border ${activeKey === '2' ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[2]2nd</span>
              )}
              {(!tierConfig || tierConfig.inversions.includes('3rd')) && (
                <span className={`px-1.5 py-0.5 rounded border ${activeKey === '3' ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]' : 'bg-theme-card border-theme-border text-theme-primary'}`}>[3]3rd</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
