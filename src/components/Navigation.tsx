import React from 'react';
import { AppRoute, TrackType, KeySignatureDefinition } from '../types';
import { Music, Activity, BarChart2, Settings as SettingsIcon, Compass, CheckCircle2 } from 'lucide-react';

interface NavigationProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  activeTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
  activeKey?: KeySignatureDefinition;
  isKeyMastered?: boolean;
  onOpenKeyModal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  onRouteChange,
  activeTrack,
  onTrackChange,
  activeKey,
  isKeyMastered = false,
  onOpenKeyModal
}) => {
  const accCount = activeKey
    ? (activeKey.sharpsCount > 0 ? `${activeKey.sharpsCount}♯` : (activeKey.flatsCount > 0 ? `${activeKey.flatsCount}♭` : '0♮'))
    : '0♮';

  return (
    <header className="w-full border-b border-[#ddd6c8] bg-[#eee9df]/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* App Title & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fcfbfa] border border-[#ddd6c8] flex items-center justify-center text-[#8c531b] shadow-sm">
            <Music className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base tracking-tight text-[#38332d]">
            Sheet Trainer
          </span>
        </div>

        {/* Center Track Tabs (Chords / Arpeggios) */}
        <div className="flex items-center p-1 rounded-xl bg-[#fcfbfa] border border-[#ddd6c8] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => {
              onTrackChange('chords');
              if (currentRoute !== 'chords') onRouteChange('chords');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all
              ${activeTrack === 'chords' && currentRoute === 'chords'
                ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm font-bold'
                : 'text-[#6b6358] hover:text-[#38332d] border border-transparent'}
            `}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Chords</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onTrackChange('arpeggios');
              if (currentRoute !== 'arpeggios') onRouteChange('arpeggios');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all
              ${activeTrack === 'arpeggios' && currentRoute === 'arpeggios'
                ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm font-bold'
                : 'text-[#6b6358] hover:text-[#38332d] border border-transparent'}
            `}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Arpeggios</span>
          </button>
        </div>

        {/* Right Tools (Key Selector, Analytics & Settings) */}
        <div className="flex items-center gap-1.5">
          {onOpenKeyModal && activeKey && (
            <button
              type="button"
              onClick={onOpenKeyModal}
              title="Open Circle of Fifths & Key Selector"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#fcfbfa] hover:bg-[#e4ddcf] border border-[#ddd6c8] text-[#38332d] text-xs font-serif font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-[#8c531b]" />
              <span className="hidden sm:inline">{activeKey.name}</span>
              <span className="sm:hidden">{activeKey.id}</span>
              {isKeyMastered && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d5b]" />
              )}
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#f5ede1] border border-[#d4bda8] text-[#8c531b] font-bold">
                {accCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onRouteChange('analytics')}
            title="Performance Analytics"
            className={`
              p-2 rounded-xl border transition-all cursor-pointer
              ${currentRoute === 'analytics'
                ? 'bg-[#f5ede1] border-[#d4bda8] text-[#8c531b]'
                : 'bg-[#fcfbfa] border-[#ddd6c8] text-[#6b6358] hover:text-[#38332d] hover:bg-[#e4ddcf] shadow-sm'}
            `}
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('settings')}
            title="App Settings"
            className={`
              p-2 rounded-xl border transition-all cursor-pointer
              ${currentRoute === 'settings'
                ? 'bg-[#f5ede1] border-[#d4bda8] text-[#8c531b]'
                : 'bg-[#fcfbfa] border-[#ddd6c8] text-[#6b6358] hover:text-[#38332d] hover:bg-[#e4ddcf] shadow-sm'}
            `}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
