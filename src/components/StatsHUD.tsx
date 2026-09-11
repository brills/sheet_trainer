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
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#eee9df] border border-[#ddd6c8] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${currentStreak >= 5 ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8]' : 'bg-[#fcfbfa] border border-[#ddd6c8] text-[#948b7e]'}`}>
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-serif font-bold text-[#948b7e] uppercase tracking-wider">Streak</span>
          <span className="text-sm font-bold font-mono text-[#8c531b]">{currentStreak}</span>
        </div>
      </div>

      {/* 2. Accuracy (Recent 20) */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#eee9df] border border-[#ddd6c8] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${isAccuracyPassing && recentCount > 0 ? 'bg-[#e4eee5] text-[#2e7d5b] border border-[#b8ceba]' : 'bg-[#fcfbfa] border border-[#ddd6c8] text-[#948b7e]'}`}>
          <Target className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-serif font-bold text-[#948b7e] uppercase tracking-wider">Accuracy</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-[#948b7e] font-mono">({recentCount}/20)</span>
            )}
          </div>
          <span className={`text-sm font-bold font-mono ${isAccuracyPassing && recentCount > 0 ? 'text-[#2e7d5b]' : 'text-[#38332d]'}`}>
            {recentCount > 0 ? `${accuracy}%` : '--'}
          </span>
        </div>
      </div>

      {/* 3. Recent Average Latency */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#eee9df] border border-[#ddd6c8] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className={`p-1.5 rounded-lg ${isLatencyPassing ? 'bg-[#e4eee5] text-[#2e7d5b] border border-[#b8ceba]' : 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8]'}`}>
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-serif font-bold text-[#948b7e] uppercase tracking-wider">Avg Latency</span>
            {recentCount > 0 && (
              <span className="text-[9px] text-[#948b7e] font-mono">({recentCount}/20)</span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold font-mono ${isLatencyPassing ? 'text-[#2e7d5b]' : 'text-[#8c531b]'}`}>
              {avgLatencyMs > 0 ? `${(avgLatencyMs / 1000).toFixed(2)}s` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
