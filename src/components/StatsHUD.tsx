import React from 'react';
import { Flame, Target, Clock } from 'lucide-react';

interface StatsHUDProps {
  currentStreak: number;
  highestStreak: number;
  totalTrials: number;
  accuracy: number;
  avgLatencyMs: number;
  recentCount?: number;
}

export const StatsHUD: React.FC<StatsHUDProps> = ({
  currentStreak,
  accuracy,
  avgLatencyMs,
  recentCount = 0
}) => {
  const isLatencyPassing = avgLatencyMs > 0 && avgLatencyMs <= 2000;
  const isAccuracyPassing = accuracy >= 85;

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-2 my-2">
      {/* 1. Streak */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-panel border border-theme-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${currentStreak >= 5 ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border' : 'bg-theme-card border border-theme-border text-theme-dim'}`}>
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-serif font-bold text-theme-dim uppercase tracking-wider">Streak</span>
          <span className="text-sm font-bold font-mono text-theme-accent">{currentStreak}</span>
        </div>
      </div>

      {/* 2. Accuracy (Recent 20) */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-panel border border-theme-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${isAccuracyPassing && recentCount > 0 ? 'bg-theme-success-tint text-theme-success border border-theme-success-border' : 'bg-theme-card border border-theme-border text-theme-dim'}`}>
          <Target className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-serif font-bold text-theme-dim uppercase tracking-wider">Accuracy</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-theme-dim font-mono">({recentCount}/20)</span>
            )}
          </div>
          <span className={`text-sm font-bold font-mono ${isAccuracyPassing && recentCount > 0 ? 'text-theme-success' : 'text-theme-primary'}`}>
            {recentCount > 0 ? `${accuracy}%` : '--'}
          </span>
        </div>
      </div>

      {/* 3. Recent Average Latency */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-panel border border-theme-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${isLatencyPassing ? 'bg-theme-success-tint text-theme-success border border-theme-success-border' : 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border'}`}>
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-serif font-bold text-theme-dim uppercase tracking-wider">Avg Latency</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-theme-dim font-mono">({recentCount}/20)</span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold font-mono ${isLatencyPassing ? 'text-theme-success' : 'text-theme-accent'}`}>
              {avgLatencyMs > 0 ? `${(avgLatencyMs / 1000).toFixed(2)}s` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
