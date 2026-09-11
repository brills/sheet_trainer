import React from 'react';
import { AppState, Clef, InputMode, TrackType } from '../types';
import { X, Keyboard, RotateCcw, Compass, Trash2, Music2, Layers, Sparkles } from 'lucide-react';
import { DEFAULT_APP_STATE } from '../storage/localStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  activeTrack?: TrackType;
  onOpenKeyModal?: () => void;
  onClearAllStorage?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  activeTrack = 'chords',
  onOpenKeyModal,
  onClearAllStorage
}) => {
  if (!isOpen) return null;

  const currentSettings = state.settings[activeTrack] || state.settings.chords;

  const onClefChange = (clef: Clef) => {
    onUpdateState({
      ...state,
      settings: {
        ...state.settings,
        [activeTrack]: {
          ...currentSettings,
          clef
        }
      }
    });
  };

  const onInputModeChange = (inputMode: InputMode) => {
    onUpdateState({
      ...state,
      settings: {
        ...state.settings,
        [activeTrack]: {
          ...currentSettings,
          inputMode
        }
      }
    });
  };

  const onToggleOnlyDiatonic = () => {
    onUpdateState({
      ...state,
      settings: {
        ...state.settings,
        [activeTrack]: {
          ...currentSettings,
          onlyDiatonic: !currentSettings.onlyDiatonic
        }
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
    if (window.confirm('Are you sure you want to reset all tier progress and weakness matrix stats?')) {
      onUpdateState({
        ...state,
        progress: DEFAULT_APP_STATE.progress
      });
      onClose();
    }
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to completely wipe all app storage, settings, custom preferences, and trial telemetry? This cannot be undone.')) {
      onClearAllStorage?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-backdrop backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-theme-canvas border border-theme-border shadow-2xl overflow-y-auto p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-theme-primary">Settings</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-theme-panel border border-theme-border text-theme-accent font-bold">
              {activeTrack === 'chords' ? 'Chords' : 'Arpeggios'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-primary hover:bg-theme-panelElevated transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Clef Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-theme-accent" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-theme-primary">Clef (Staff Notation)</span>
              <span className="text-[10px] text-theme-muted">Select active clef for {activeTrack}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-theme-panel border border-theme-border">
            <button
              type="button"
              onClick={() => onClefChange('treble')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.clef === 'treble'
                  ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <span>𝄞</span>
              <span>Treble Clef</span>
            </button>
            <button
              type="button"
              onClick={() => onClefChange('bass')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.clef === 'bass'
                  ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <span>𝄢</span>
              <span>Bass Clef</span>
            </button>
          </div>
        </div>

        {/* 2. Entry Method / Input Mode */}
        <div className="flex flex-col gap-2 border-t border-theme-border pt-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-theme-accent" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-theme-primary">Entry Method</span>
              <span className="text-[10px] text-theme-muted">Default: Direct Entry on computer, Multi-Choice on mobile</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-theme-panel border border-theme-border">
            <button
              type="button"
              onClick={() => onInputModeChange('direct_entry')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.inputMode === 'direct_entry'
                  ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <span>⌨️</span>
              <span>Direct Entry</span>
            </button>
            <button
              type="button"
              onClick={() => onInputModeChange('multiple_choice')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.inputMode === 'multiple_choice'
                  ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <span>🎴</span>
              <span>Multiple Choice</span>
            </button>
          </div>
        </div>

        {/* 3. Only Diatonic Questions Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-theme-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-theme-accent shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-theme-primary">Only Diatonic Questions</span>
              <span className="text-[10px] text-theme-muted">Strictly sample from the active key signature (in applicable tiers)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleOnlyDiatonic}
            className={`
              w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0
              ${currentSettings.onlyDiatonic ? 'bg-theme-accent' : 'bg-theme-border'}
            `}
          >
            <div className={`
              bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
              ${currentSettings.onlyDiatonic ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {/* 4. Desktop Keymap HUD Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-theme-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-theme-accent" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-theme-primary">Desktop Keymap Legend</span>
              <span className="text-[10px] text-theme-muted">Show keyboard cheat sheet HUD during Direct Entry</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleKeyLegend}
            className={`
              w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer
              ${state.settings.showKeymapLegend ? 'bg-theme-accent' : 'bg-theme-border'}
            `}
          >
            <div className={`
              bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
              ${state.settings.showKeymapLegend ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {/* 5. Key Signatures & Circle of Fifths */}
        {onOpenKeyModal && (
          <div className="flex items-center justify-between py-2 border-t border-theme-border">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-theme-accent" />
              <div className="flex flex-col">
                <span className="text-xs font-serif font-semibold text-theme-primary">Circle of Fifths & Keys</span>
                <span className="text-[10px] text-theme-muted">Select key signature & view mastery</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenKeyModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-theme-panel hover:bg-theme-panelElevated text-xs font-serif font-bold text-theme-primary transition-all border border-theme-border cursor-pointer"
            >
              Select Key
            </button>
          </div>
        )}

        {/* 6. Mastery Criteria Info */}
        <div className="flex flex-col gap-1.5 border-t border-theme-border pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-serif font-semibold text-theme-primary">Mastery Criteria</span>
            <span className="text-[10px] text-theme-accent font-mono font-bold">20 trials · ≤ 2.0s · ≥ 85%</span>
          </div>
          <p className="text-[11px] text-theme-muted leading-relaxed">
            Take as much time as needed on every problem. Tier and Key mastery is achieved when your rolling average latency across 20 consecutive trials reaches ≤ 2.0s with ≥ 85% accuracy.
          </p>
        </div>

        {/* 7. Danger Zone: Reset & Clear Storage */}
        <div className="flex flex-col gap-2 border-t border-theme-border pt-3">
          <button
            type="button"
            onClick={onResetProgress}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-theme-border bg-theme-panel hover:bg-theme-panelElevated text-theme-primary text-xs font-serif font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-theme-accent" /> Reset Progress & Weaknesses
          </button>

          {onClearAllStorage && (
            <button
              type="button"
              onClick={handleClearStorage}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-theme-error-border bg-theme-error-tint hover:bg-theme-error-border/30 text-theme-error text-xs font-serif font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All App Storage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
