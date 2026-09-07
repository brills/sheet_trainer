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
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className={`p-1.5 rounded-lg ${currentStreak >= 5 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Streak</span>
          <span className="text-sm font-bold font-mono text-slate-100">{currentStreak}</span>
        </div>
      </div>

      {/* 2. Accuracy (Recent 20) */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className={`p-1.5 rounded-lg ${isAccuracyPassing && recentCount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
          <Target className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-slate-500 font-mono">({recentCount}/20)</span>
            )}
          </div>
          <span className={`text-sm font-bold font-mono ${isAccuracyPassing && recentCount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
            {recentCount > 0 ? `${accuracy}%` : '--'}
          </span>
        </div>
      </div>

      {/* 3. Recent Average Latency */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className={`p-1.5 rounded-lg ${isLatencyPassing ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Latency</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-slate-500 font-mono">({recentCount}/20)</span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold font-mono ${isLatencyPassing ? 'text-emerald-400' : 'text-sky-300'}`}>
              {avgLatencyMs > 0 ? `${(avgLatencyMs / 1000).toFixed(2)}s` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
