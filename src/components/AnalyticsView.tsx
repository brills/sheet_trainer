import React, { useEffect, useState } from 'react';
import { AppState, TrackType, TrialLog } from '../types';
import { getTrialsForTrack, clearAllTrials } from '../storage/telemetryStore';
import { exportAllDataToJson, downloadBackupFile, importDataFromJson } from '../storage/exportImport';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target, 
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
  onBack: () => void;
  onStateRestored: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  onBack,
  onStateRestored
}) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackType>('chords');
  const [trials, setTrials] = useState<TrialLog[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    getTrialsForTrack(selectedTrack).then(setTrials);
  }, [selectedTrack]);

  const trackProgress = state.progress[selectedTrack];
  const matrix = trackProgress.weaknessMatrix;
  const weaknessEntries = Object.entries(matrix);

  // Calculate stats
  const totalTrials = trials.length;
  const correctTrials = trials.filter(t => t.isCorrect).length;
  const overallAccuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
  const avgLatency = totalTrials > 0 
    ? Math.round(trials.reduce((sum, t) => sum + t.latencyMs, 0) / totalTrials) 
    : 0;

  const handleExport = async () => {
    const json = await exportAllDataToJson();
    downloadBackupFile(json);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importDataFromJson(content);
      if (success) {
        setImportStatus('Backup successfully restored!');
        onStateRestored();
        getTrialsForTrack(selectedTrack).then(setTrials);
      } else {
        setImportStatus('Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all trial history logs? This cannot be undone.')) {
      await clearAllTrials();
      setTrials([]);
      setImportStatus('Trial logs cleared.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ddd6c8]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eee9df] border border-[#ddd6c8] text-xs font-serif font-semibold text-[#38332d] hover:bg-[#e4ddcf] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </button>

        <h1 className="text-lg font-serif font-bold text-[#38332d] flex items-center gap-2">
          Performance Analytics
        </h1>

        {/* Export / Import / Clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            title="Download JSON backup"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#eee9df] border border-[#ddd6c8] text-xs font-serif font-medium text-[#8c531b] hover:bg-[#f5ede1] hover:border-[#d4bda8] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#eee9df] border border-[#ddd6c8] text-xs font-serif font-medium text-[#8c531b] hover:bg-[#f5ede1] hover:border-[#d4bda8] cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear trial logs"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#fbeeed] border border-[#e2bdb8] text-xs font-serif font-medium text-[#9c382e] hover:bg-[#f8deda] transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-[#eef5ef] border border-[#bcd4bf] text-[#2d5736] text-xs text-center font-medium font-serif">
          {importStatus}
        </div>
      )}

      {/* Track Filter Tabs */}
      <div className="flex p-1 rounded-2xl bg-[#eee9df] border border-[#ddd6c8]">
        <button
          type="button"
          onClick={() => setSelectedTrack('chords')}
          className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
            selectedTrack === 'chords' 
              ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm' 
              : 'text-[#6b6358] hover:text-[#38332d]'
          }`}
        >
          🎼 Chords Track
        </button>
        <button
          type="button"
          onClick={() => setSelectedTrack('arpeggios')}
          className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
            selectedTrack === 'arpeggios' 
              ? 'bg-[#f5ede1] text-[#8c531b] border border-[#d4bda8] shadow-sm' 
              : 'text-[#6b6358] hover:text-[#38332d]'
          }`}
        >
          〰️ Arpeggios Track
        </button>
      </div>

      {/* High-level Scorecard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-[#ddd6c8] flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-[#6b6358] uppercase">Total Trials</span>
          <span className="text-2xl font-bold font-mono text-[#38332d] mt-1">{totalTrials}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-[#ddd6c8] flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-[#6b6358] uppercase flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-[#2d5736]" /> Accuracy
          </span>
          <span className="text-2xl font-bold font-mono text-[#2d5736] mt-1">{overallAccuracy}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#fcfbfa] border border-[#ddd6c8] flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-[#6b6358] uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#8c531b]" /> Avg Latency
          </span>
          <span className="text-2xl font-bold font-mono text-[#8c531b] mt-1">{avgLatency}ms</span>
        </div>
      </div>

      {/* Weakness Matrix Breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-serif font-bold text-[#38332d] flex items-center justify-between">
          <span>Pattern Weakness Profile</span>
          <span className="text-xs font-sans font-normal text-[#6b6358]">Targeted by Adaptive Engine</span>
        </h2>

        {weaknessEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#fcfbfa] border border-[#ddd6c8] text-center text-xs text-[#8a8275]">
            No pattern stats recorded yet. Complete more trials to build your profile!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {weaknessEntries.slice(0, 10).map(([key, stats]) => {
              const acc = stats.totalSeen > 0 ? Math.round((stats.correctCount / stats.totalSeen) * 100) : 0;
              const isWeak = acc < 80;

              return (
                <div 
                  key={key} 
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isWeak ? 'bg-[#fbeeed] border-[#e2bdb8]' : 'bg-[#fcfbfa] border-[#ddd6c8]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-[#38332d]">{key}</span>
                    <span className="text-[10px] text-[#6b6358] font-sans">
                      Seen {stats.totalSeen} times | Latency: {stats.avgLatencyMs}ms
                    </span>
                  </div>

                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${
                    acc >= 90 ? 'bg-[#eef5ef] text-[#2d5736] border-[#bcd4bf]' :
                    acc >= 75 ? 'bg-[#f5ede1] text-[#8c531b] border-[#d4bda8]' :
                    'bg-[#fbeeed] text-[#9c382e] border-[#e2bdb8]'
                  }`}>
                    {acc}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Trial Logs Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-serif font-bold text-[#38332d]">
          Recent Trial Activity (Last 20)
        </h2>

        {trials.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#fcfbfa] border border-[#ddd6c8] text-center text-xs text-[#8a8275]">
            No trial history recorded yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ddd6c8] bg-[#fcfbfa] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#eee9df] text-[#6b6358] uppercase font-mono text-[10px] border-b border-[#ddd6c8]">
                  <tr>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Pattern</th>
                    <th className="p-3 font-semibold">Clef</th>
                    <th className="p-3 font-semibold">Latency</th>
                    <th className="p-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee9df] font-mono text-[#38332d]">
                  {trials.slice(0, 20).map(t => (
                    <tr key={t.id} className="hover:bg-[#f7f4ee]">
                      <td className="p-3">
                        {t.isCorrect ? (
                          <span className="flex items-center gap-1 text-[#2d5736] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#9c382e] font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Miss
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-serif font-bold text-[#38332d]">{t.patternId}</td>
                      <td className="p-3 text-[#6b6358]">{t.clef === 'treble' ? '𝄞 Treble' : '𝄢 Bass'}</td>
                      <td className="p-3 text-[#8c531b] font-bold">{t.latencyMs}ms</td>
                      <td className="p-3 text-[#8a8275] text-[10px]">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
