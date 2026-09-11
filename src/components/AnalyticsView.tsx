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
    <div className="w-full max-w-md mx-auto p-1 sm:p-2 flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-theme-border">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-panel border border-theme-border text-xs font-serif font-semibold text-theme-primary hover:bg-theme-panelElevated transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </button>

        <h1 className="text-lg font-serif font-bold text-theme-primary flex items-center gap-2">
          Performance Analytics
        </h1>

        {/* Export / Import / Clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            title="Download JSON backup"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-theme-panel border border-theme-border text-xs font-serif font-medium text-theme-accent hover:bg-theme-accent-tint hover:border-theme-accent-border transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-theme-panel border border-theme-border text-xs font-serif font-medium text-theme-accent hover:bg-theme-accent-tint hover:border-theme-accent-border cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear trial logs"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-theme-error-tint border border-theme-error-border text-xs font-serif font-medium text-theme-error hover:bg-theme-error-border/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-theme-success-tint border border-theme-success-border text-theme-success text-xs text-center font-medium font-serif">
          {importStatus}
        </div>
      )}

      {/* Track Filter Tabs */}
      <div className="flex p-1 rounded-2xl bg-theme-panel border border-theme-border">
        <button
          type="button"
          onClick={() => setSelectedTrack('chords')}
          className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
            selectedTrack === 'chords' 
              ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm' 
              : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          🎼 Chords Track
        </button>
        <button
          type="button"
          onClick={() => setSelectedTrack('arpeggios')}
          className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
            selectedTrack === 'arpeggios' 
              ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border shadow-sm' 
              : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          〰️ Arpeggios Track
        </button>
      </div>

      {/* High-level Scorecard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-theme-muted uppercase">Total Trials</span>
          <span className="text-2xl font-bold font-mono text-theme-primary mt-1">{totalTrials}</span>
        </div>

        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-theme-muted uppercase flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-theme-success" /> Accuracy
          </span>
          <span className="text-2xl font-bold font-mono text-theme-success mt-1">{overallAccuracy}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border flex flex-col items-center shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-theme-muted uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-theme-accent" /> Avg Latency
          </span>
          <span className="text-2xl font-bold font-mono text-theme-accent mt-1">{avgLatency}ms</span>
        </div>
      </div>

      {/* Weakness Matrix Breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-serif font-bold text-theme-primary flex items-center justify-between">
          <span>Pattern Weakness Profile</span>
          <span className="text-xs font-sans font-normal text-theme-muted">Targeted by Adaptive Engine</span>
        </h2>

        {weaknessEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-theme-card border border-theme-border text-center text-xs text-theme-dim">
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
                    isWeak ? 'bg-theme-error-tint border-theme-error-border' : 'bg-theme-card border-theme-border'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-theme-primary">{key}</span>
                    <span className="text-[10px] text-theme-muted font-sans">
                      Seen {stats.totalSeen} times | Latency: {stats.avgLatencyMs}ms
                    </span>
                  </div>

                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${
                    acc >= 90 ? 'bg-theme-success-tint text-theme-success border-theme-success-border' :
                    acc >= 75 ? 'bg-theme-accent-tint text-theme-accent border-theme-accent-border' :
                    'bg-theme-error-tint text-theme-error border-theme-error-border'
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
        <h2 className="text-sm font-serif font-bold text-theme-primary">
          Recent Trial Activity (Last 20)
        </h2>

        {trials.length === 0 ? (
          <div className="p-6 rounded-2xl bg-theme-card border border-theme-border text-center text-xs text-theme-dim">
            No trial history recorded yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-theme-border bg-theme-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-theme-panel text-theme-muted uppercase font-mono text-[10px] border-b border-theme-border">
                  <tr>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Pattern</th>
                    <th className="p-3 font-semibold">Clef</th>
                    <th className="p-3 font-semibold">Latency</th>
                    <th className="p-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-panel font-mono text-theme-primary">
                  {trials.slice(0, 20).map(t => (
                    <tr key={t.id} className="hover:bg-theme-canvas">
                      <td className="p-3">
                        {t.isCorrect ? (
                          <span className="flex items-center gap-1 text-theme-success font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-theme-error font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Miss
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-serif font-bold text-theme-primary">{t.patternId}</td>
                      <td className="p-3 text-theme-muted">{t.clef === 'treble' ? '𝄞 Treble' : '𝄢 Bass'}</td>
                      <td className="p-3 text-theme-accent font-bold">{t.latencyMs}ms</td>
                      <td className="p-3 text-theme-dim text-[10px]">
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
