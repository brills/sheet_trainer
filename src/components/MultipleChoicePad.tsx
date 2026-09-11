import React, { useEffect } from 'react';
import { MultipleChoiceOption } from '../types';

interface MultipleChoicePadProps {
  options: MultipleChoiceOption[];
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  onKeyPressFeedback?: (key: string) => void;
}

export const MultipleChoicePad: React.FC<MultipleChoicePadProps> = ({
  options,
  onSelect,
  disabled = false,
  onKeyPressFeedback
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat) return;
      const key = e.key;
      onKeyPressFeedback?.(key);

      const digit = parseInt(key, 10);
      if (digit >= 1 && digit <= options.length) {
        e.preventDefault();
        onSelect(options[digit - 1].id);
      } else if (key.toLowerCase() === 'a' && options[0]) {
        e.preventDefault();
        onSelect(options[0].id);
      } else if (key.toLowerCase() === 's' && options[1]) {
        e.preventDefault();
        onSelect(options[1].id);
      } else if (key.toLowerCase() === 'd' && options[2]) {
        e.preventDefault();
        onSelect(options[2].id);
      } else if (key.toLowerCase() === 'f' && options[3]) {
        e.preventDefault();
        onSelect(options[3].id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, options, onSelect, onKeyPressFeedback]);

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 mt-4">
      {options.map((option, idx) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          className={`
            relative flex flex-col items-center justify-center p-4 rounded-2xl border
            bg-theme-card border-theme-border text-theme-primary shadow-sm
            hover:border-theme-accent-border hover:bg-theme-accent-tint hover:text-theme-accent
            active:scale-95 transition-all touch-manipulation group cursor-pointer
            disabled:opacity-60 disabled:pointer-events-none
          `}
        >
          {/* Key badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-theme-panel border border-theme-border text-[10px] font-mono font-bold text-theme-muted group-hover:text-theme-accent group-hover:border-theme-accent-border">
            {idx + 1}
          </div>

          <span className="text-base font-serif font-bold tracking-tight mt-1 text-theme-primary group-hover:text-theme-accent transition-colors">
            {option.label}
          </span>
          {option.sublabel && (
            <span className="text-xs text-theme-muted mt-0.5 font-sans">
              {option.sublabel}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
