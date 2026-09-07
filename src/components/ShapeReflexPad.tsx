import React, { useEffect } from 'react';
import { Inversion, ArpeggioContour } from '../types';
import { ArrowUp, ArrowDown, MoveUpRight, Waves } from 'lucide-react';

interface ShapeReflexPadProps {
  type: 'inversion' | 'contour';
  onSelect: (value: Inversion | ArpeggioContour) => void;
  disabled?: boolean;
  onKeyPressFeedback?: (key: string) => void;
}

export const ShapeReflexPad: React.FC<ShapeReflexPadProps> = ({
  type,
  onSelect,
  disabled = false,
  onKeyPressFeedback
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat) return;
      const key = e.key;
      onKeyPressFeedback?.(key);

      if (type === 'inversion') {
        if (key === '0' || key === 'r' || key === 'R') {
          e.preventDefault();
          onSelect('root');
        } else if (key === '1') {
          e.preventDefault();
          onSelect('1st');
        } else if (key === '2') {
          e.preventDefault();
          onSelect('2nd');
        } else if (key === '3') {
          e.preventDefault();
          onSelect('3rd');
        }
      } else {
        if (key === 'ArrowUp' || key === 'u' || key === '1') {
          e.preventDefault();
          onSelect('ascending');
        } else if (key === 'ArrowDown' || key === 'n' || key === '2') {
          e.preventDefault();
          onSelect('descending');
        } else if (key === 'a' || key === '3') {
          e.preventDefault();
          onSelect('arch');
        } else if (key === 'w' || key === '4') {
          e.preventDefault();
          onSelect('alberti');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [type, disabled, onSelect, onKeyPressFeedback]);

  if (type === 'inversion') {
    const items: { label: string; sub: string; inv: Inversion; key: string }[] = [
      { label: 'Root Position', sub: 'Snowman Stack', inv: 'root', key: '0 / r' },
      { label: '1st Inversion', sub: 'Top 4th Gap', inv: '1st', key: '1' },
      { label: '2nd Inversion', sub: 'Bottom 4th Gap', inv: '2nd', key: '2' },
      { label: '3rd Inversion', sub: 'Bottom 2nd Clash', inv: '3rd', key: '3' },
    ];

    return (
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 mt-4">
        {items.map(item => (
          <button
            key={item.inv}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item.inv)}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-2xl border
              bg-slate-900/80 border-slate-800 text-slate-100 shadow-xl backdrop-blur-sm
              hover:border-emerald-500/60 hover:bg-slate-850 hover:shadow-emerald-500/10
              active:scale-95 transition-all touch-manipulation group
            `}
          >
            <div className="absolute top-2 left-2.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40">
              {item.key}
            </div>
            <span className="text-base font-bold font-mono tracking-tight mt-1 text-slate-100 group-hover:text-emerald-300">
              {item.label}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              {item.sub}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Contour mode
  const contours: { label: string; sub: string; val: ArpeggioContour; key: string; icon: any }[] = [
    { label: 'Ascending', sub: 'Ramp Up ↗', val: 'ascending', key: '↑ / u', icon: ArrowUp },
    { label: 'Descending', sub: 'Ramp Down ↘', val: 'descending', key: '↓ / n', icon: ArrowDown },
    { label: 'Arch', sub: 'Peak Sweep Λ', val: 'arch', key: 'a / 3', icon: MoveUpRight },
    { label: 'Alberti / Wave', sub: 'Rolling Figure ~', val: 'alberti', key: 'w / 4', icon: Waves },
  ];

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 mt-4">
      {contours.map(c => {
        const Icon = c.icon;
        return (
          <button
            key={c.val}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c.val)}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-2xl border
              bg-slate-900/80 border-slate-800 text-slate-100 shadow-xl backdrop-blur-sm
              hover:border-emerald-500/60 hover:bg-slate-850 hover:shadow-emerald-500/10
              active:scale-95 transition-all touch-manipulation group
            `}
          >
            <div className="absolute top-2 left-2.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-400">
              {c.key}
            </div>
            <Icon className="w-5 h-5 text-emerald-400 mt-1 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold font-mono tracking-tight text-slate-100 group-hover:text-emerald-300">
              {c.label}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {c.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
};
