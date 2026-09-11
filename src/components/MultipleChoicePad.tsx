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
            bg-[#fcfbfa] border-[#ddd6c8] text-[#38332d] shadow-sm
            hover:border-[#d4bda8] hover:bg-[#f5ede1] hover:text-[#8c531b]
            active:scale-95 transition-all touch-manipulation group cursor-pointer
            disabled:opacity-60 disabled:pointer-events-none
          `}
        >
          {/* Key badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#eee9df] border border-[#ddd6c8] text-[10px] font-mono font-bold text-[#6b6358] group-hover:text-[#8c531b] group-hover:border-[#d4bda8]">
            {idx + 1}
          </div>

          <span className="text-base font-serif font-bold tracking-tight mt-1 text-[#38332d] group-hover:text-[#8c531b] transition-colors">
            {option.label}
          </span>
          {option.sublabel && (
            <span className="text-xs text-[#6b6358] mt-0.5 font-sans">
              {option.sublabel}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
