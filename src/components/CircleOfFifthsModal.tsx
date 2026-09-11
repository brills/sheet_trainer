import React from 'react';
import { X, CheckCircle2, Compass } from 'lucide-react';
import { KeySignatureDefinition } from '../types';
import { KEY_STAGES, KEY_SIGNATURES } from '../core/theory/keys';

interface CircleOfFifthsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeKeyId: string;
  onSelectKey: (keyId: string) => void;
  masteredKeys: string[];
}

export const CircleOfFifthsModal: React.FC<CircleOfFifthsModalProps> = ({
  isOpen,
  onClose,
  activeKeyId,
  onSelectKey,
  masteredKeys
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b2620]/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#f7f4ee] border border-[#ddd6c8] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ddd6c8]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#f5ede1] border border-[#d4bda8] text-[#8c531b]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#38332d] flex items-center gap-2">
                Circle of Fifths & Key Signatures
              </h2>
              <p className="text-xs text-[#6b6358]">
                Select any key signature to practice. Master keys with 20 trials (≤ 2.0s latency, ≥ 85% accuracy).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6b6358] hover:text-[#38332d] hover:bg-[#e4ddcf] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stages & Keys Grid */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
          {KEY_STAGES.map((stage) => {
            const stageMasteredCount = stage.keys.filter(k => masteredKeys.includes(k)).length;
            const isAllStageMastered = stageMasteredCount === stage.keys.length;

            return (
              <div
                key={stage.stage}
                className="p-4 rounded-2xl border bg-[#eee9df]/70 border-[#ddd6c8] transition-all"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs font-serif font-bold px-2.5 py-0.5 rounded-full border
                      ${isAllStageMastered
                        ? 'bg-[#eef5ef] border-[#bcd4bf] text-[#2d5736]'
                        : 'bg-[#f5ede1] border-[#d4bda8] text-[#8c531b]'}
                    `}>
                      {stage.title}
                    </span>
                    <span className="text-xs text-[#6b6358] font-medium font-sans">
                      {stage.description}
                    </span>
                  </div>

                  {isAllStageMastered && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2d5736] bg-[#eef5ef] border border-[#bcd4bf] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Mastered
                    </span>
                  )}
                </div>

                {/* Key Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stage.keys.map((keyId) => {
                    const keyDef = KEY_SIGNATURES[keyId] as KeySignatureDefinition;
                    if (!keyDef) return null;

                    const isSelected = activeKeyId === keyId;
                    const isMastered = masteredKeys.includes(keyId);
                    const accCountStr = keyDef.sharpsCount > 0 
                      ? `${keyDef.sharpsCount}♯` 
                      : (keyDef.flatsCount > 0 ? `${keyDef.flatsCount}♭` : '0♮');

                    return (
                      <button
                        key={keyId}
                        onClick={() => onSelectKey(keyId)}
                        className={`
                          p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative cursor-pointer group
                          ${isSelected
                            ? 'bg-[#f5ede1] border-[#d4bda8] shadow-sm ring-2 ring-[#d4bda8]/50'
                            : 'bg-[#fcfbfa] hover:bg-[#f5ede1] hover:border-[#d4bda8] border-[#ddd6c8] text-[#38332d]'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-serif font-bold ${isSelected ? 'text-[#8c531b]' : 'text-[#38332d]'}`}>
                            {keyDef.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#eee9df] border border-[#ddd6c8] text-[#6b6358]">
                            {accCountStr}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-[#8a8275]">
                            {keyDef.sharpsCount === 0 && keyDef.flatsCount === 0 
                              ? 'Natural' 
                              : (keyDef.sharpsCount > 0 
                                  ? `${keyDef.sharpsCount} ${keyDef.sharpsCount === 1 ? 'Sharp' : 'Sharps'}` 
                                  : `${keyDef.flatsCount} ${keyDef.flatsCount === 1 ? 'Flat' : 'Flats'}`)}
                          </span>
                          {isMastered && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#2d5736] bg-[#eef5ef] border border-[#bcd4bf] px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Mastered
                            </span>
                          )}
                          {isSelected && !isMastered && (
                            <span className="text-[10px] text-[#8c531b] font-bold">Active</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#ddd6c8] flex items-center justify-between text-xs text-[#6b6358]">
          <span>Active Key: <strong className="text-[#38332d] font-serif">{KEY_SIGNATURES[activeKeyId]?.name || activeKeyId}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#eee9df] hover:bg-[#e4ddcf] border border-[#ddd6c8] text-[#38332d] font-serif font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
