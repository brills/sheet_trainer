import React from 'react';
import { AppState } from '../types';
import { X, Moon, Sun, Monitor, Keyboard, RotateCcw, Compass } from 'lucide-react';
import { DEFAULT_APP_STATE } from '../storage/localStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onOpenKeyModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onOpenKeyModal
}) => {
  if (!isOpen) return null;

  const onSetTheme = (theme: 'dark' | 'light' | 'system') => {
    onUpdateState({
      ...state,
      settings: {
        ...state.settings,
        theme
      }
    });
  };

  const onToggleKeyLegend = () => {
    onUpdateState({
      ...state,
      settings: {
        ...state.settings,
        showKeymapLegend: !state.settings.showKeymapLegend
      }
    });
  };

  const onResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress and weakness stats?')) {
      onUpdateState({
        ...state,
        progress: DEFAULT_APP_STATE.progress
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100">App Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-300">Theme</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'system', label: 'System', icon: Monitor },
            ].map(t => {
              const Icon = t.icon;
              const active = state.settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSetTheme(t.id as any)}
                  className={`
                    flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${active ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Desktop Keymap HUD Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Desktop Keymap Legend</span>
              <span className="text-[10px] text-slate-400">Show keyboard cheat sheet on screen</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleKeyLegend}
            className={`
              w-11 h-6 flex items-center rounded-full p-1 transition-colors
              ${state.settings.showKeymapLegend ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <div className={`
              bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
              ${state.settings.showKeymapLegend ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {/* 3. Reading / Feedback Delay Speed */}
        <div className="flex flex-col gap-2 border-t border-slate-800 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Reading / Feedback Delay</span>
            <span className="text-[10px] text-slate-400">Time to parse unmasked notation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { val: 0, label: 'Optimal', sub: 'Mode-tuned' },
              { val: 3500, label: 'Relaxed', sub: '3.5s' },
              { val: 1200, label: 'Fast', sub: '1.2s' },
              { val: -1, label: 'Manual', sub: 'Space/Enter' }
            ].map(opt => {
              const currentVal = state.settings.chords.feedbackDelayMs ?? 0;
              const isActive = (opt.val === 0 && (currentVal === 0 || currentVal === undefined)) || currentVal === opt.val;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    onUpdateState({
                      ...state,
                      settings: {
                        ...state.settings,
                        chords: { ...state.settings.chords, feedbackDelayMs: opt.val },
                        arpeggios: { ...state.settings.arpeggios, feedbackDelayMs: opt.val }
                      }
                    });
                  }}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold border transition-all
                    ${isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'}
                  `}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] font-normal ${isActive ? 'text-slate-900/80' : 'text-slate-400'}`}>
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Key Signatures & Circle of Fifths */}
        {onOpenKeyModal && (
          <div className="flex items-center justify-between py-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Circle of Fifths & Keys</span>
                <span className="text-[10px] text-slate-400">Configure key progression & stage unlock</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenKeyModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all border border-slate-700"
            >
              Configure
            </button>
          </div>
        )}

        {/* 3. Danger Zone / Reset */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onResetProgress}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Progress & Weaknesses
          </button>
        </div>
      </div>
    </div>
  );
};
