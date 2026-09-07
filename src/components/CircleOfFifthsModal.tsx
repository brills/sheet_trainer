import React from 'react';
import { X, Lock, CheckCircle2, Award, Zap, Compass } from 'lucide-react';
import { KeyMode, KeySignatureDefinition } from '../types';
import { KEY_STAGES, KEY_SIGNATURES } from '../core/theory/keys';

interface CircleOfFifthsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyMode: KeyMode;
  onKeyModeChange: (mode: KeyMode) => void;
  activeKeyId: string;
  onSelectKey: (keyId: string) => void;
  unlockedStages: number[];
  masteredKeys: string[];
}

export const CircleOfFifthsModal: React.FC<CircleOfFifthsModalProps> = ({
  isOpen,
  onClose,
  keyMode,
  onKeyModeChange,
  activeKeyId,
  onSelectKey,
  unlockedStages,
  masteredKeys
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Circle of Fifths & Key Progression
              </h2>
              <p className="text-xs text-slate-400">
                Master sight-reading across all 15 key signatures with progressive stage gating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 p-1.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-1">
          <button
            onClick={() => onKeyModeChange('progressive')}
            className={`
              flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5
              ${keyMode === 'progressive'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
            `}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Progressive Auto-Unlock</span>
          </button>

          <button
            onClick={() => onKeyModeChange('locked')}
            className={`
              flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5
              ${keyMode === 'locked'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
            `}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Locked Key Mode</span>
          </button>

          <button
            onClick={() => onKeyModeChange('all_unlocked')}
            className={`
              flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5
              ${keyMode === 'all_unlocked'
                ? 'bg-indigo-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
            `}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Free All-Keys Mode</span>
          </button>
        </div>

        {/* Stages & Keys Grid */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
          {KEY_STAGES.map((stage) => {
            const isStageUnlocked = keyMode === 'all_unlocked' || unlockedStages.includes(stage.stage);
            const isCurrentStage = unlockedStages.includes(stage.stage) && (!unlockedStages.includes(stage.stage + 1));

            return (
              <div
                key={stage.stage}
                className={`
                  p-4 rounded-2xl border transition-all
                  ${isStageUnlocked
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-60'}
                `}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs font-bold px-2.5 py-0.5 rounded-full border
                      ${isStageUnlocked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-500'}
                    `}>
                      {stage.title}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {stage.description}
                    </span>
                  </div>

                  {!isStageUnlocked && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400/80">
                      <Lock className="w-3 h-3" />
                      <span>Locked (Complete Stage {stage.stage - 1})</span>
                    </div>
                  )}
                  {isCurrentStage && keyMode === 'progressive' && (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      Current Focus
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
                        disabled={!isStageUnlocked}
                        onClick={() => onSelectKey(keyId)}
                        className={`
                          p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative group
                          ${isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-950/50'
                            : isStageUnlocked
                              ? 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                              : 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-100'}`}>
                            {keyDef.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                            {accCountStr}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            {keyDef.sharpsCount === 0 && keyDef.flatsCount === 0 
                              ? 'Natural' 
                              : (keyDef.sharpsCount > 0 
                                  ? `${keyDef.sharpsCount} ${keyDef.sharpsCount === 1 ? 'Sharp' : 'Sharps'}` 
                                  : `${keyDef.flatsCount} ${keyDef.flatsCount === 1 ? 'Flat' : 'Flats'}`)}
                          </span>
                          {isMastered && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {isSelected && !isMastered && (
                            <span className="text-[10px] text-emerald-400 font-bold">Active</span>
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
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Active Key: <strong className="text-slate-200">{KEY_SIGNATURES[activeKeyId]?.name || activeKeyId}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
