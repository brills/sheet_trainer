import React, { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';

interface KeymapLegendHUDProps {
  lastPressedKey?: string | null;
  mode?: 'direct_entry' | 'multiple_choice';
}

export const KeymapLegendHUD: React.FC<KeymapLegendHUDProps> = ({
  lastPressedKey,
  mode = 'direct_entry'
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
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('m') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[m] Min</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('M') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[M] Maj</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('d') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[d] Dim</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('7') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[7] 7th</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Inversion */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-0.5">Inv:</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('0') || isKeyActive('r') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[0] Root</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('1') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[1] 1st</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('2') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[2] 2nd</span>
            <span className={`px-1.5 py-0.5 rounded border ${isKeyActive('3') ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'}`}>[3] 3rd</span>
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
