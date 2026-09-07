import React from 'react';
import { AppRoute, TrackType } from '../types';
import { Music, Activity, BarChart2, Settings as SettingsIcon } from 'lucide-react';

interface NavigationProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  activeTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  onRouteChange,
  activeTrack,
  onTrackChange
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* App Title & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Music className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Sheet Trainer
          </span>
        </div>

        {/* Center Track Tabs (Chords / Arpeggios) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              onTrackChange('chords');
              if (currentRoute !== 'chords') onRouteChange('chords');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all
              ${activeTrack === 'chords' && currentRoute === 'chords'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'}
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
              flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all
              ${activeTrack === 'arpeggios' && currentRoute === 'arpeggios'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Arpeggios</span>
          </button>
        </div>

        {/* Right Tools (Analytics & Settings) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRouteChange('analytics')}
            title="Performance Analytics"
            className={`
              p-2 rounded-xl border transition-all
              ${currentRoute === 'analytics'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}
            `}
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('settings')}
            title="App Settings"
            className={`
              p-2 rounded-xl border transition-all
              ${currentRoute === 'settings'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}
            `}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
