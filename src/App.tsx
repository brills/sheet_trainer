import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppState, 
  AppRoute, 
  TrackType, 
  ChordDefinition, 
  ArpeggioDefinition, 
  MultipleChoiceOption, 
  Inversion, 
  NoteLetter, 
  Accidental, 
  ChordQuality,
  TrialLog,
  TrialFeedback,
  SlotDiffItem,
  KeyMode,
  KeySignatureDefinition
} from './types';
import { loadAppState, saveAppState, recordTrialResultInState } from './storage/localStore';
import { logTrial, getTrialsForTrack } from './storage/telemetryStore';
import { PrecisionTimingEngine } from './core/engines/timingEngine';
import { selectNextChord, selectNextArpeggio, checkTierPromotion, checkKeyStagePromotion } from './core/engines/adaptiveEngine';
import { generateChordMultipleChoiceOptions, generateArpeggioMultipleChoiceOptions } from './core/engines/distractorEngine';
import { buildChord, CHORD_FORMULAS, formatInversionName } from './core/theory/chords';
import { formatNoteName } from './core/theory/notes';
import { KEY_SIGNATURES, KEY_STAGES } from './core/theory/keys';
import { Navigation } from './components/Navigation';
import { TrackHeader } from './components/TrackHeader';
import { NotationStage } from './components/NotationStage';
import { StatsHUD } from './components/StatsHUD';
import { SlotBufferInput } from './components/SlotBufferInput';
import { MultipleChoicePad } from './components/MultipleChoicePad';
import { KeymapLegendHUD } from './components/KeymapLegendHUD';
import { TierSelector } from './components/TierSelector';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { CircleOfFifthsModal } from './components/CircleOfFifthsModal';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('chords');
  const [activeTrack, setActiveTrack] = useState<TrackType>('chords');

  // Ref to always access current appState without re-triggering effects
  const appStateRef = useRef<AppState>(appState);
  appStateRef.current = appState;

  // Question & State
  const [currentChord, setCurrentChord] = useState<ChordDefinition | null>(null);
  const [currentArpeggio, setCurrentArpeggio] = useState<ArpeggioDefinition | null>(null);
  const [currentKey, setCurrentKey] = useState<KeySignatureDefinition>(KEY_SIGNATURES['C']);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<MultipleChoiceOption[]>([]);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<TrialFeedback | null>(null);
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);

  // Modals
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [promotionNotification, setPromotionNotification] = useState<string | null>(null);

  // Recent trial memory for rolling HUD stats & promotion checks
  const [recentTrials, setRecentTrials] = useState<{ isCorrect: boolean; latencyMs: number }[]>([]);
  const [recentStageTrials, setRecentStageTrials] = useState<{ isCorrect: boolean; latencyMs: number }[]>([]);

  // Engine instance & Timers
  const timingEngineRef = useRef<PrecisionTimingEngine>(new PrecisionTimingEngine());
  const ackListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const nextProblemTimeoutRef = useRef<number | null>(null);

  const trackSettings = appState.settings[activeTrack];
  const trackProgress = appState.progress[activeTrack];

  // Helper to determine active key for next problem
  const getActiveKeyForSampling = useCallback((): KeySignatureDefinition => {
    const settings = appStateRef.current.settings[activeTrack];
    const progress = appStateRef.current.progress[activeTrack];

    if (settings.keyMode === 'locked') {
      return KEY_SIGNATURES[settings.activeKeyId] || KEY_SIGNATURES['C'];
    }

    if (settings.keyMode === 'all_unlocked') {
      const allKeys = Object.keys(KEY_SIGNATURES);
      const pickedKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      return KEY_SIGNATURES[pickedKey] || KEY_SIGNATURES['C'];
    }

    // Progressive mode: sample from unlocked stages
    const unlocked = progress.unlockedKeyStages && progress.unlockedKeyStages.length > 0 
      ? progress.unlockedKeyStages 
      : [0];
    const highestStage = Math.max(...unlocked);
    // 60% chance to focus on current highest stage, 40% on previous unlocked stages
    const stageToSample = Math.random() < 0.6 || unlocked.length === 1 
      ? highestStage 
      : unlocked[Math.floor(Math.random() * unlocked.length)];

    const stageKeys = KEY_STAGES[stageToSample]?.keys || ['C'];
    const keyId = stageKeys[Math.floor(Math.random() * stageKeys.length)];
    return KEY_SIGNATURES[keyId] || KEY_SIGNATURES['C'];
  }, [activeTrack]);

  // Spawn next problem cleanly (single point of truth)
  const spawnNextProblem = useCallback(() => {
    // Clear any pending listener or timeout
    if (ackListenerRef.current) {
      window.removeEventListener('keydown', ackListenerRef.current);
      ackListenerRef.current = null;
    }
    if (nextProblemTimeoutRef.current !== null) {
      window.clearTimeout(nextProblemTimeoutRef.current);
      nextProblemTimeoutRef.current = null;
    }

    setLastResult(null);
    const engine = timingEngineRef.current;
    const currentState = appStateRef.current;
    const currentTrack = currentState.progress[activeTrack];
    const currentSettings = currentState.settings[activeTrack];

    const activeKeyDef = getActiveKeyForSampling();
    setCurrentKey(activeKeyDef);

    if (activeTrack === 'chords') {
      const chord = selectNextChord(currentTrack.currentTier, currentSettings.clef, currentTrack, activeKeyDef);
      setCurrentChord(chord);
      setCurrentArpeggio(null);

      if (currentSettings.inputMode === 'multiple_choice') {
        setMultipleChoiceOptions(generateChordMultipleChoiceOptions(chord));
      }
    } else {
      const arpeggio = selectNextArpeggio(currentTrack.currentTier, currentSettings.clef, currentTrack, activeKeyDef);
      setCurrentArpeggio(arpeggio);
      setCurrentChord(null);

      if (currentSettings.inputMode === 'multiple_choice') {
        setMultipleChoiceOptions(generateArpeggioMultipleChoiceOptions(arpeggio));
      }
    }

    setIsFeedback(false);
    engine.startQuestion();
  }, [activeTrack, getActiveKeyForSampling]);

  // Cleanup timers & listeners on unmount
  useEffect(() => {
    return () => {
      if (ackListenerRef.current) {
        window.removeEventListener('keydown', ackListenerRef.current);
        ackListenerRef.current = null;
      }
      if (nextProblemTimeoutRef.current !== null) {
        window.clearTimeout(nextProblemTimeoutRef.current);
        nextProblemTimeoutRef.current = null;
      }
    };
  }, []);

  // Synchronize rolling stats memory per-track from telemetry store
  useEffect(() => {
    let isMounted = true;
    getTrialsForTrack(activeTrack).then(logs => {
      if (!isMounted) return;
      if (logs && logs.length > 0) {
        const recent = logs.slice(0, 20).map(l => ({ isCorrect: l.isCorrect, latencyMs: l.latencyMs }));
        setRecentTrials(recent);
      } else {
        setRecentTrials([]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeTrack]);

  // Track initial mounting and explicit configuration changes ONLY
  const prevConfigRef = useRef<string>('');
  useEffect(() => {
    const configKey = `${activeTrack}-${trackSettings.clef}-${trackSettings.inputMode}-${trackSettings.keyMode}-${trackSettings.activeKeyId}-${trackProgress.currentTier}-${currentRoute}`;
    if (prevConfigRef.current !== configKey) {
      prevConfigRef.current = configKey;
      if (currentRoute === 'chords' || currentRoute === 'arpeggios') {
        spawnNextProblem();
      }
    }
  }, [activeTrack, trackSettings.clef, trackSettings.inputMode, trackSettings.keyMode, trackSettings.activeKeyId, trackProgress.currentTier, currentRoute, spawnNextProblem]);

  // Handle Trial Evaluation
  const evaluateSubmission = useCallback((
    isCorrect: boolean, 
    userInputStr: string, 
    correctAnswerStr: string,
    feedbackExtra?: Partial<TrialFeedback>
  ) => {
    const engine = timingEngineRef.current;
    const { latencyMs } = engine.recordSubmission();
    setIsFeedback(true);

    const patternKey = activeTrack === 'chords' && currentChord
      ? `${trackSettings.clef}:${currentChord.quality}:${currentChord.inversion}`
      : currentArpeggio
        ? `${trackSettings.clef}:${currentArpeggio.quality}:${currentArpeggio.contour}`
        : 'unknown';

    // 1. Update State
    const updatedState = recordTrialResultInState(appStateRef.current, activeTrack, patternKey, isCorrect, latencyMs);
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
      flashDurationMs: 0,
      latencyMs,
      isCorrect,
      userInput: userInputStr,
      correctAnswer: correctAnswerStr
    };
    logTrial(log);

    // 3. Update recent trials & check tier promotion
    const newRecent = [{ isCorrect, latencyMs }, ...recentTrials.slice(0, 19)];
    setRecentTrials(newRecent);

    let nextProgState = updatedState;

    const promotion = checkTierPromotion(activeTrack, trackProgress.currentTier, newRecent);
    if (promotion.shouldPromote && promotion.nextTier) {
      setPromotionNotification(`🎉 Tier Mastery Achieved! Unlocked Tier ${promotion.nextTier}`);
      const updatedTiers = Array.from(new Set([...trackProgress.masteredTiers, trackProgress.currentTier]));
      nextProgState = {
        ...nextProgState,
        progress: {
          ...nextProgState.progress,
          [activeTrack]: {
            ...nextProgState.progress[activeTrack],
            currentTier: promotion.nextTier,
            masteredTiers: updatedTiers
          }
        }
      };
    }

    // 4. Check Key Stage Promotion (in progressive mode)
    if (trackSettings.keyMode === 'progressive') {
      const newStageRecent = [{ isCorrect, latencyMs }, ...recentStageTrials.slice(0, 19)];
      setRecentStageTrials(newStageRecent);

      const unlocked = trackProgress.unlockedKeyStages || [0];
      const highestStage = Math.max(...unlocked);
      const keyPromo = checkKeyStagePromotion(highestStage, newStageRecent);

      if (keyPromo.shouldPromote && keyPromo.nextStage !== null) {
        setPromotionNotification(keyPromo.message || `🎉 Key Mastery Achieved! Unlocked Stage ${keyPromo.nextStage}`);
        const newUnlockedStages = Array.from(new Set([...unlocked, keyPromo.nextStage]));
        nextProgState = {
          ...nextProgState,
          progress: {
            ...nextProgState.progress,
            [activeTrack]: {
              ...nextProgState.progress[activeTrack],
              unlockedKeyStages: newUnlockedStages
            }
          }
        };
      }
    }

    if (nextProgState !== updatedState) {
      saveAppState(nextProgState);
      setAppState(nextProgState);
    }

    const rollingAvgLatencyMs = Math.round(newRecent.reduce((sum, t) => sum + t.latencyMs, 0) / newRecent.length);

    setLastResult({
      isCorrect,
      userStr: userInputStr,
      correctStr: correctAnswerStr,
      latencyMs,
      rollingAvgLatencyMs,
      message: isCorrect ? undefined : `Answer: ${correctAnswerStr}`,
      ...feedbackExtra
    });

    // Clear any existing ack listener
    if (ackListenerRef.current) {
      window.removeEventListener('keydown', ackListenerRef.current);
      ackListenerRef.current = null;
    }

    // Both correct & incorrect answers: DO NOT auto-advance.
    // Wait for explicit user acknowledgment (Space, Enter, or Click)
    const ackListener = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (ackListenerRef.current) {
          window.removeEventListener('keydown', ackListenerRef.current);
          ackListenerRef.current = null;
        }
        spawnNextProblem();
      }
    };
    ackListenerRef.current = ackListener;
    window.addEventListener('keydown', ackListener, { once: true });
  }, [activeTrack, currentChord, currentArpeggio, recentTrials, recentStageTrials, trackProgress, trackSettings.clef, trackSettings.inputMode, trackSettings.keyMode, spawnNextProblem]);

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
        userVal: formatInversionName(input.inversion, 'short'),
        correctVal: formatInversionName(currentChord.inversion, 'short'),
        isMatch: isInvMatch
      }
    ];

    const userStr = `${formatNoteName(input.root, input.accidental)}${CHORD_FORMULAS[input.quality].shortName} (${formatInversionName(input.inversion, 'short')})`;

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

  const handleKeyModeChange = (keyMode: KeyMode) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          keyMode
        }
      }
    };
    saveAppState(next);
    setAppState(next);
    spawnNextProblem();
  };

  const handleSelectKey = (keyId: string) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          activeKeyId: keyId,
          keyMode: 'locked' // lock to selected key when explicitly tapped
        }
      }
    };
    saveAppState(next);
    setAppState(next);
    setIsKeyModalOpen(false);
    spawnNextProblem();
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
        activeKey={currentKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
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
              currentTier={trackProgress.currentTier}
              onOpenTierModal={() => setIsTierModalOpen(true)}
            />

            {/* Notation Stage */}
            <NotationStage
              track={activeTrack}
              chord={currentChord || undefined}
              arpeggio={currentArpeggio || undefined}
              keySignature={currentKey}
              isFeedback={isFeedback}
              lastResult={lastResult}
              darkMode={appState.settings.theme !== 'light'}
              onContinue={spawnNextProblem}
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
            />

            {/* Real-Time Stats HUD */}
            <StatsHUD
              currentStreak={trackProgress.currentStreak}
              highestStreak={trackProgress.highestStreak}
              totalTrials={trackProgress.totalTrialsCompleted}
              accuracy={accuracy}
              avgLatencyMs={avgLatencyMs}
              recentCount={recentTrials.length}
            />

            {/* Dynamic Response Pad based on Input Mode */}
            <div className="w-full flex justify-center">
              {trackSettings.inputMode === 'direct_entry' && (
                <SlotBufferInput
                  onSubmit={handleDirectEntrySubmit}
                  disabled={isFeedback}
                  onKeyPressFeedback={setLastPressedKey}
                  tier={trackProgress.currentTier}
                />
              )}

              {trackSettings.inputMode === 'multiple_choice' && (
                <MultipleChoicePad
                  options={multipleChoiceOptions}
                  onSelect={handleMultipleChoiceSelect}
                  disabled={isFeedback}
                  onKeyPressFeedback={setLastPressedKey}
                />
              )}
            </div>

            {/* Persistent Desktop Keymap Legend HUD */}
            {appState.settings.showKeymapLegend && (
              <KeymapLegendHUD
                lastPressedKey={lastPressedKey}
                mode={trackSettings.inputMode}
                tier={trackProgress.currentTier}
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

      {/* Circle of Fifths & Key Selector Modal */}
      <CircleOfFifthsModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        keyMode={trackSettings.keyMode || 'progressive'}
        onKeyModeChange={handleKeyModeChange}
        activeKeyId={currentKey.id}
        onSelectKey={handleSelectKey}
        unlockedStages={trackProgress.unlockedKeyStages || [0]}
        masteredKeys={trackProgress.masteredKeys || []}
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
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />
    </div>
  );
};

export default App;
