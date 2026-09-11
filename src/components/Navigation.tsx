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
    <header className="w-full max-w-md mx-auto mb-3 rounded-2xl border border-theme-border bg-theme-panel/95 backdrop-blur-md shadow-sm">
      <div className="w-full px-2.5 h-12 flex items-center justify-between">
        {/* Track Tabs (Chords / Arpeggios) */}
        <div className="flex items-center p-0.5 rounded-xl bg-theme-card border border-theme-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => {
              onTrackChange('chords');
              if (currentRoute !== 'chords') onRouteChange('chords');
            }}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer
              ${activeTrack === 'chords' && currentRoute === 'chords'
                ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-xs font-bold'
                : 'text-theme-muted hover:text-theme-primary border border-transparent'}
            `}
          >
            <Music className="w-3 h-3" />
            <span>Chords</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onTrackChange('arpeggios');
              if (currentRoute !== 'arpeggios') onRouteChange('arpeggios');
            }}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer
              ${activeTrack === 'arpeggios' && currentRoute === 'arpeggios'
                ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-xs font-bold'
                : 'text-theme-muted hover:text-theme-primary border border-transparent'}
            `}
          >
            <Activity className="w-3 h-3" />
            <span>Arpeggios</span>
          </button>
        </div>

        {/* Right Tools (Key Selector, Analytics & Settings) */}
        <div className="flex items-center gap-1">
          {onOpenKeyModal && activeKey && (
            <button
              type="button"
              onClick={onOpenKeyModal}
              title="Open Circle of Fifths & Key Selector"
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-theme-card hover:bg-theme-panelElevated border border-theme-border text-theme-primary text-xs font-serif font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3 h-3 text-theme-accent" />
              <span className="text-[11px] font-bold text-theme-primary">{activeKey.id}</span>
              {isKeyMastered && (
                <CheckCircle2 className="w-3 h-3 text-theme-success" />
              )}
              <span className="text-[9px] font-mono px-1 rounded bg-theme-accent-tint border border-theme-accent-border text-theme-accent font-bold">
                {accCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onRouteChange('analytics')}
            title="Performance Analytics"
            className={`
              p-1.5 rounded-xl border transition-all cursor-pointer
              ${currentRoute === 'analytics'
                ? 'bg-theme-accent-tint border-theme-accent-border text-theme-accent'
                : 'bg-theme-card border-theme-border text-theme-muted hover:text-theme-primary hover:bg-theme-panelElevated shadow-xs'}
            `}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('settings')}
            title="App Settings"
            className={`
              p-1.5 rounded-xl border transition-all cursor-pointer
              ${currentRoute === 'settings'
                ? 'bg-theme-accent-tint border-theme-accent-border text-theme-accent'
                : 'bg-theme-card border-theme-border text-theme-muted hover:text-theme-primary hover:bg-theme-panelElevated shadow-xs'}
            `}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
