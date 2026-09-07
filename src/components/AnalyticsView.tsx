import React, { useEffect, useState } from 'react';
import { AppState, TrackType, TrialLog } from '../types';
import { getTrialsForTrack } from '../storage/telemetryStore';
import { exportAllDataToJson, downloadBackupFile, importDataFromJson } from '../storage/exportImport';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target, 
  ArrowLeft 
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </button>

        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          Performance Analytics
        </h1>

        {/* Export / Import */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            title="Download JSON backup"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 hover:border-emerald-500/40"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 hover:border-sky-500/40 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs text-center font-medium">
          {importStatus}
        </div>
      )}

      {/* Track Filter Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setSelectedTrack('chords')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedTrack === 'chords' 
              ? 'bg-emerald-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎼 Chords Track
        </button>
        <button
          type="button"
          onClick={() => setSelectedTrack('arpeggios')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedTrack === 'arpeggios' 
              ? 'bg-emerald-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          〰️ Arpeggios Track
        </button>
      </div>

      {/* High-level Scorecard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Trials</span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1">{totalTrials}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">{overallAccuracy}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Avg Latency
          </span>
          <span className="text-2xl font-bold font-mono text-sky-300 mt-1">{avgLatency}ms</span>
        </div>
      </div>

      {/* Weakness Matrix Breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
          <span>Pattern Weakness Profile</span>
          <span className="text-xs font-normal text-slate-400">Targeted by Adaptive Engine</span>
        </h2>

        {weaknessEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
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
                    isWeak ? 'bg-rose-950/20 border-rose-900/40' : 'bg-slate-900/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-slate-200">{key}</span>
                    <span className="text-[10px] text-slate-400">
                      Seen {stats.totalSeen} times | Latency: {stats.avgLatencyMs}ms
                    </span>
                  </div>

                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    acc >= 90 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    acc >= 75 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
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
        <h2 className="text-sm font-bold text-slate-200">
          Recent Trial Activity (Last 20)
        </h2>

        {trials.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            No trial history recorded yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Pattern</th>
                    <th className="p-3">Clef</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {trials.slice(0, 20).map(t => (
                    <tr key={t.id} className="hover:bg-slate-850/50">
                      <td className="p-3">
                        {t.isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Miss
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-100">{t.patternId}</td>
                      <td className="p-3 text-slate-400">{t.clef === 'treble' ? '𝄞 Treble' : '𝄢 Bass'}</td>
                      <td className="p-3 text-sky-300">{t.latencyMs}ms</td>
                      <td className="p-3 text-slate-500 text-[10px]">
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
