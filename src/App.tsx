import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppState, 
  AppRoute, 
  TrackType, 
  ChordDefinition, 
  ArpeggioDefinition, 
  MultipleChoiceOption, 
  Inversion, 
  ArpeggioContour, 
  NoteLetter, 
  Accidental, 
  ChordQuality,
  TrialLog,
  TrialFeedback,
  SlotDiffItem
} from './types';
import { loadAppState, saveAppState, recordTrialResultInState } from './storage/localStore';
import { logTrial } from './storage/telemetryStore';
import { PrecisionTimingEngine, FlashState } from './core/engines/timingEngine';
import { selectNextChord, selectNextArpeggio, checkTierPromotion } from './core/engines/adaptiveEngine';
import { generateChordMultipleChoiceOptions, generateArpeggioMultipleChoiceOptions } from './core/engines/distractorEngine';
import { buildChord, CHORD_FORMULAS } from './core/theory/chords';
import { formatNoteName } from './core/theory/notes';
import { Navigation } from './components/Navigation';
import { TrackHeader } from './components/TrackHeader';
import { NotationStage } from './components/NotationStage';
import { StatsHUD } from './components/StatsHUD';
import { SlotBufferInput } from './components/SlotBufferInput';
import { MultipleChoicePad } from './components/MultipleChoicePad';
import { ShapeReflexPad } from './components/ShapeReflexPad';
import { KeymapLegendHUD } from './components/KeymapLegendHUD';
import { TierSelector } from './components/TierSelector';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('chords');
  const [activeTrack, setActiveTrack] = useState<TrackType>('chords');

  // Question & State
  const [currentChord, setCurrentChord] = useState<ChordDefinition | null>(null);
  const [currentArpeggio, setCurrentArpeggio] = useState<ArpeggioDefinition | null>(null);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<MultipleChoiceOption[]>([]);
  const [flashState, setFlashState] = useState<FlashState>('idle');
  const [lastResult, setLastResult] = useState<TrialFeedback | null>(null);
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);

  // Modals
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [promotionNotification, setPromotionNotification] = useState<string | null>(null);

  // Recent trial memory for rolling HUD stats & promotion checks
  const [recentTrials, setRecentTrials] = useState<{ isCorrect: boolean; latencyMs: number }[]>([]);

  // Engine instance
  const timingEngineRef = useRef<PrecisionTimingEngine>(new PrecisionTimingEngine());

  const trackSettings = appState.settings[activeTrack];
  const trackProgress = appState.progress[activeTrack];

  // Spawn next problem
  const spawnNextProblem = useCallback(() => {
    setLastResult(null);
    const engine = timingEngineRef.current;

    if (activeTrack === 'chords') {
      const chord = selectNextChord(trackProgress.currentTier, trackSettings.clef, trackProgress);
      setCurrentChord(chord);
      setCurrentArpeggio(null);

      if (trackSettings.inputMode === 'multiple_choice') {
        setMultipleChoiceOptions(generateChordMultipleChoiceOptions(chord));
      }
    } else {
      const arpeggio = selectNextArpeggio(trackProgress.currentTier, trackSettings.clef, trackProgress);
      setCurrentArpeggio(arpeggio);
      setCurrentChord(null);

      if (trackSettings.inputMode === 'multiple_choice') {
        setMultipleChoiceOptions(generateArpeggioMultipleChoiceOptions(arpeggio));
      }
    }

    setFlashState('flashing');
    engine.startFlash({
      durationMs: trackSettings.flashDurationMs,
      onMask: () => setFlashState('masked')
    });
  }, [activeTrack, trackSettings, trackProgress]);

  // Initial problem mount
  useEffect(() => {
    if (currentRoute === 'chords' || currentRoute === 'arpeggios') {
      spawnNextProblem();
    }
  }, [activeTrack, trackSettings.clef, trackSettings.inputMode, trackProgress.currentTier, currentRoute, spawnNextProblem]);

  // Handle Trial Evaluation
  const evaluateSubmission = useCallback((
    isCorrect: boolean, 
    userInputStr: string, 
    correctAnswerStr: string,
    feedbackExtra?: Partial<TrialFeedback>
  ) => {
    const engine = timingEngineRef.current;
    const { latencyMs, flashExposureMs } = engine.recordSubmission();
    setFlashState('feedback');

    const patternKey = activeTrack === 'chords' && currentChord
      ? `${trackSettings.clef}:${currentChord.quality}:${currentChord.inversion}`
      : currentArpeggio
        ? `${trackSettings.clef}:${currentArpeggio.quality}:${currentArpeggio.contour}`
        : 'unknown';

    // 1. Update State
    const updatedState = recordTrialResultInState(appState, activeTrack, patternKey, isCorrect, latencyMs);
    setAppState(updatedState);

    // 2. Log Telemetry
    const log: TrialLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      track: activeTrack,
      clef: trackSettings.clef,
      patternId: activeTrack === 'chords' ? (currentChord?.id || '') : (currentArpeggio?.id || ''),
      root: activeTrack === 'chords' ? (currentChord?.root || '') : (currentArpeggio?.root || ''),
      quality: activeTrack === 'chords' ? (currentChord?.quality || '') : (currentArpeggio?.quality || ''),
      inversionOrShape: activeTrack === 'chords' ? (currentChord?.inversion || '') : (currentArpeggio?.contour || ''),
      flashDurationMs: flashExposureMs,
      latencyMs,
      isCorrect,
      userInput: userInputStr,
      correctAnswer: correctAnswerStr
    };
    logTrial(log);

    // 3. Update recent trials & check promotion
    const newRecent = [{ isCorrect, latencyMs }, ...recentTrials.slice(0, 19)];
    setRecentTrials(newRecent);

    const promotion = checkTierPromotion(activeTrack, trackProgress.currentTier, newRecent);
    if (promotion.shouldPromote && promotion.nextTier) {
      setPromotionNotification(`🎉 Mastery Achieved! Unlocked Tier ${promotion.nextTier}`);
      const updatedTiers = Array.from(new Set([...trackProgress.masteredTiers, trackProgress.currentTier]));
      const nextState: AppState = {
        ...updatedState,
        progress: {
          ...updatedState.progress,
          [activeTrack]: {
            ...updatedState.progress[activeTrack],
            currentTier: promotion.nextTier,
            masteredTiers: updatedTiers
          }
        }
      };
      saveAppState(nextState);
      setAppState(nextState);
    }

    setLastResult({
      isCorrect,
      userStr: userInputStr,
      correctStr: correctAnswerStr,
      message: isCorrect ? undefined : `Answer: ${correctAnswerStr}`,
      ...feedbackExtra
    });

    // Advance to next after comfortable feedback (1.1s for correct, 2.5s for incorrect to allow studying)
    const delay = isCorrect ? 1100 : 2500;
    const timeoutId = window.setTimeout(() => {
      spawnNextProblem();
    }, delay);

    // Allow user to hit Space or Enter to skip the wait immediately
    const skipListener = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        window.clearTimeout(timeoutId);
        window.removeEventListener('keydown', skipListener);
        spawnNextProblem();
      }
    };
    window.addEventListener('keydown', skipListener, { once: true });
  }, [activeTrack, appState, currentChord, currentArpeggio, recentTrials, trackProgress, trackSettings.clef, spawnNextProblem]);

  // Input Handlers
  const handleDirectEntrySubmit = (input: { root: NoteLetter; accidental: Accidental; quality: ChordQuality; inversion: Inversion }) => {
    if (!currentChord) return;

    const isRootMatch = input.root === currentChord.root;
    const isAccMatch = input.accidental === currentChord.rootAccidental;
    const isQualityMatch = input.quality === currentChord.quality;
    const isInvMatch = input.inversion === currentChord.inversion;
    const isCorrect = isRootMatch && isAccMatch && isQualityMatch && isInvMatch;

    const userChord = buildChord(
      input.root, 
      input.accidental, 
      input.quality, 
      input.inversion, 
      trackSettings.clef, 
      trackProgress.currentTier
    );

    const slotDiffs: SlotDiffItem[] = [
      {
        slot: 'root',
        label: 'Root',
        userVal: input.root,
        correctVal: currentChord.root,
        isMatch: isRootMatch
      },
      {
        slot: 'accidental',
        label: 'Acc',
        userVal: input.accidental === 'natural' ? '♮' : (input.accidental === 'sharp' ? '♯' : '♭'),
        correctVal: currentChord.rootAccidental === 'natural' ? '♮' : (currentChord.rootAccidental === 'sharp' ? '♯' : '♭'),
        isMatch: isAccMatch
      },
      {
        slot: 'quality',
        label: 'Quality',
        userVal: CHORD_FORMULAS[input.quality].shortName,
        correctVal: CHORD_FORMULAS[currentChord.quality].shortName,
        isMatch: isQualityMatch
      },
      {
        slot: 'inversion',
        label: 'Inv',
        userVal: input.inversion === 'root' ? 'Root' : input.inversion,
        correctVal: currentChord.inversion === 'root' ? 'Root' : currentChord.inversion,
        isMatch: isInvMatch
      }
    ];

    const userStr = `${formatNoteName(input.root, input.accidental)}${CHORD_FORMULAS[input.quality].shortName} (${input.inversion === 'root' ? 'Root' : input.inversion})`;

    evaluateSubmission(isCorrect, userStr, currentChord.displayName, {
      userChord,
      correctChord: currentChord,
      slotDiffs
    });
  };

  const handleMultipleChoiceSelect = (optionId: string) => {
    const selected = multipleChoiceOptions.find(o => o.id === optionId);
    if (!selected) return;
    const correctOption = multipleChoiceOptions.find(o => o.isCorrect);

    evaluateSubmission(selected.isCorrect, selected.label, correctOption?.label || '', {
      correctChord: currentChord || undefined,
      correctArpeggio: currentArpeggio || undefined
    });
  };

  const handleShapeReflexSelect = (value: Inversion | ArpeggioContour) => {
    if (activeTrack === 'chords' && currentChord) {
      const isCorrect = value === currentChord.inversion;
      evaluateSubmission(isCorrect, String(value), currentChord.inversion, {
        correctChord: currentChord
      });
    } else if (activeTrack === 'arpeggios' && currentArpeggio) {
      const isCorrect = value === currentArpeggio.contour;
      evaluateSubmission(isCorrect, String(value), currentArpeggio.contour, {
        correctArpeggio: currentArpeggio
      });
    }
  };

  // State Updates from UI
  const handleClefChange = (clef: any) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          clef
        }
      }
    };
    saveAppState(next);
    setAppState(next);
  };

  const handleInputModeChange = (inputMode: any) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          inputMode
        }
      }
    };
    saveAppState(next);
    setAppState(next);
  };

  const handleFlashDurationChange = (flashDurationMs: number) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          flashDurationMs
        }
      }
    };
    saveAppState(next);
    setAppState(next);
  };

  const handleSelectTier = (tier: number) => {
    const next: AppState = {
      ...appState,
      progress: {
        ...appState.progress,
        [activeTrack]: {
          ...appState.progress[activeTrack],
          currentTier: tier
        }
      }
    };
    saveAppState(next);
    setAppState(next);
  };

  // Calculate rolling accuracy & latency for Stats HUD
  const accuracy = recentTrials.length > 0
    ? Math.round((recentTrials.filter(t => t.isCorrect).length / recentTrials.length) * 100)
    : 0;

  const avgLatencyMs = recentTrials.length > 0
    ? Math.round(recentTrials.reduce((sum, t) => sum + t.latencyMs, 0) / recentTrials.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navigation
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          if (route === 'settings') {
            setIsSettingsModalOpen(true);
          } else {
            setCurrentRoute(route);
          }
        }}
        activeTrack={activeTrack}
        onTrackChange={(track) => {
          setActiveTrack(track);
          setCurrentRoute(track);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col items-center justify-start">
        {currentRoute === 'analytics' ? (
          <AnalyticsView
            state={appState}
            onBack={() => setCurrentRoute(activeTrack)}
            onStateRestored={() => setAppState(loadAppState())}
          />
        ) : (
          <>
            {/* Promotion Notification Banner */}
            {promotionNotification && (
              <div className="w-full max-w-md mb-2 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold text-center flex items-center justify-between shadow-xl animate-in zoom-in-95">
                <span>{promotionNotification}</span>
                <button
                  type="button"
                  onClick={() => setPromotionNotification(null)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-white text-[10px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Track Header & Tier Selector Bar */}
            <TrackHeader
              track={activeTrack}
              clef={trackSettings.clef}
              onClefChange={handleClefChange}
              inputMode={trackSettings.inputMode}
              onInputModeChange={handleInputModeChange}
              flashDurationMs={trackSettings.flashDurationMs}
              onFlashDurationChange={handleFlashDurationChange}
              currentTier={trackProgress.currentTier}
              onOpenTierModal={() => setIsTierModalOpen(true)}
            />

            {/* Notation Flash Stage */}
            <NotationStage
              track={activeTrack}
              chord={currentChord || undefined}
              arpeggio={currentArpeggio || undefined}
              flashState={flashState}
              lastResult={lastResult}
              flashDurationMs={trackSettings.flashDurationMs}
              darkMode={appState.settings.theme !== 'light'}
            />

            {/* Real-Time Stats HUD */}
            <StatsHUD
              currentStreak={trackProgress.currentStreak}
              highestStreak={trackProgress.highestStreak}
              totalTrials={trackProgress.totalTrialsCompleted}
              accuracy={accuracy}
              avgLatencyMs={avgLatencyMs}
            />

            {/* Dynamic Response Pad based on Input Mode */}
            <div className="w-full flex justify-center">
              {trackSettings.inputMode === 'direct_entry' && (
                <SlotBufferInput
                  onSubmit={handleDirectEntrySubmit}
                  disabled={flashState === 'feedback'}
                  onKeyPressFeedback={setLastPressedKey}
                />
              )}

              {trackSettings.inputMode === 'multiple_choice' && (
                <MultipleChoicePad
                  options={multipleChoiceOptions}
                  onSelect={handleMultipleChoiceSelect}
                  disabled={flashState === 'feedback'}
                  onKeyPressFeedback={setLastPressedKey}
                />
              )}

              {trackSettings.inputMode === 'shape_only' && (
                <ShapeReflexPad
                  type={activeTrack === 'chords' ? 'inversion' : 'contour'}
                  onSelect={handleShapeReflexSelect}
                  disabled={flashState === 'feedback'}
                  onKeyPressFeedback={setLastPressedKey}
                />
              )}
            </div>

            {/* Persistent Desktop Keymap Legend HUD */}
            {appState.settings.showKeymapLegend && (
              <KeymapLegendHUD
                lastPressedKey={lastPressedKey}
                mode={trackSettings.inputMode}
              />
            )}
          </>
        )}
      </main>

      {/* Tier Selector Modal */}
      <TierSelector
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        track={activeTrack}
        currentTier={trackProgress.currentTier}
        onSelectTier={handleSelectTier}
        masteredTiers={trackProgress.masteredTiers}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        state={appState}
        onUpdateState={(newState) => {
          saveAppState(newState);
          setAppState(newState);
        }}
      />
    </div>
  );
};

export default App;
