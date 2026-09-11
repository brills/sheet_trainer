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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b2620]/45 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#f7f4ee] border border-[#ddd6c8] shadow-2xl overflow-y-auto p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ddd6c8] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#38332d]">Settings</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#eee9df] border border-[#ddd6c8] text-[#8c531b] font-bold">
              {activeTrack === 'chords' ? 'Chords' : 'Arpeggios'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6b6358] hover:text-[#38332d] hover:bg-[#e4ddcf] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Clef Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#8c531b]" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-[#38332d]">Clef (Staff Notation)</span>
              <span className="text-[10px] text-[#6b6358]">Select active clef for {activeTrack}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#eee9df] border border-[#ddd6c8]">
            <button
              type="button"
              onClick={() => onClefChange('treble')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.clef === 'treble'
                  ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm'
                  : 'text-[#6b6358] hover:text-[#38332d]'
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
                  ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm'
                  : 'text-[#6b6358] hover:text-[#38332d]'
              }`}
            >
              <span>𝄢</span>
              <span>Bass Clef</span>
            </button>
          </div>
        </div>

        {/* 2. Entry Method / Input Mode */}
        <div className="flex flex-col gap-2 border-t border-[#ddd6c8] pt-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8c531b]" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-[#38332d]">Entry Method</span>
              <span className="text-[10px] text-[#6b6358]">Default: Direct Entry on computer, Multi-Choice on mobile</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#eee9df] border border-[#ddd6c8]">
            <button
              type="button"
              onClick={() => onInputModeChange('direct_entry')}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentSettings.inputMode === 'direct_entry'
                  ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm'
                  : 'text-[#6b6358] hover:text-[#38332d]'
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
                  ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm'
                  : 'text-[#6b6358] hover:text-[#38332d]'
              }`}
            >
              <span>🎴</span>
              <span>Multiple Choice</span>
            </button>
          </div>
        </div>

        {/* 3. Only Diatonic Questions Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-[#ddd6c8]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8c531b] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-[#38332d]">Only Diatonic Questions</span>
              <span className="text-[10px] text-[#6b6358]">Strictly sample from the active key signature (in applicable tiers)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleOnlyDiatonic}
            className={`
              w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0
              ${currentSettings.onlyDiatonic ? 'bg-[#8c531b]' : 'bg-[#ddd6c8]'}
            `}
          >
            <div className={`
              bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
              ${currentSettings.onlyDiatonic ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {/* 4. Desktop Keymap HUD Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-[#ddd6c8]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#8c531b]" />
            <div className="flex flex-col">
              <span className="text-xs font-serif font-semibold text-[#38332d]">Desktop Keymap Legend</span>
              <span className="text-[10px] text-[#6b6358]">Show keyboard cheat sheet HUD during Direct Entry</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleKeyLegend}
            className={`
              w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer
              ${state.settings.showKeymapLegend ? 'bg-[#8c531b]' : 'bg-[#ddd6c8]'}
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
          <div className="flex items-center justify-between py-2 border-t border-[#ddd6c8]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8c531b]" />
              <div className="flex flex-col">
                <span className="text-xs font-serif font-semibold text-[#38332d]">Circle of Fifths & Keys</span>
                <span className="text-[10px] text-[#6b6358]">Select key signature & view mastery</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenKeyModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#eee9df] hover:bg-[#e4ddcf] text-xs font-serif font-bold text-[#38332d] transition-all border border-[#ddd6c8] cursor-pointer"
            >
              Select Key
            </button>
          </div>
        )}

        {/* 6. Mastery Criteria Info */}
        <div className="flex flex-col gap-1.5 border-t border-[#ddd6c8] pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-serif font-semibold text-[#38332d]">Mastery Criteria</span>
            <span className="text-[10px] text-[#8c531b] font-mono font-bold">20 trials · ≤ 2.0s · ≥ 85%</span>
          </div>
          <p className="text-[11px] text-[#6b6358] leading-relaxed">
            Take as much time as needed on every problem. Tier and Key mastery is achieved when your rolling average latency across 20 consecutive trials reaches ≤ 2.0s with ≥ 85% accuracy.
          </p>
        </div>

        {/* 7. Danger Zone: Reset & Clear Storage */}
        <div className="flex flex-col gap-2 border-t border-[#ddd6c8] pt-3">
          <button
            type="button"
            onClick={onResetProgress}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#ddd6c8] bg-[#eee9df] hover:bg-[#e4ddcf] text-[#38332d] text-xs font-serif font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8c531b]" /> Reset Progress & Weaknesses
          </button>

          {onClearAllStorage && (
            <button
              type="button"
              onClick={handleClearStorage}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#e2bdb8] bg-[#fbeeed] hover:bg-[#f8deda] text-[#9c382e] text-xs font-serif font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All App Storage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
