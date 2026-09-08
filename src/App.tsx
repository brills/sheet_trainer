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
import { loadAppState, saveAppState, recordTrialResultInState, clearAllAppStorage, DEFAULT_APP_STATE } from './storage/localStore';
import { logTrial } from './storage/telemetryStore';
import { PrecisionTimingEngine } from './core/engines/timingEngine';
import { selectNextChord, selectNextArpeggio, checkTierPromotion } from './core/engines/adaptiveEngine';
import { generateChordMultipleChoiceOptions, generateArpeggioMultipleChoiceOptions } from './core/engines/distractorEngine';
import { CHORD_FORMULAS, formatInversionName, alignChordToTargetOctave } from './core/theory/chords';
import { alignArpeggioToTargetOctave } from './core/theory/arpeggios';
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
  const [recentKeyTrials, setRecentKeyTrials] = useState<{ isCorrect: boolean; latencyMs: number }[]>([]);

  // Engine instance & Timers
  const timingEngineRef = useRef<PrecisionTimingEngine>(new PrecisionTimingEngine());
  const ackListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const nextProblemTimeoutRef = useRef<number | null>(null);

  const trackSettings = appState.settings[activeTrack];
  const trackProgress = appState.progress[activeTrack];

  // Helper to determine active key for next problem (maintains stable key context)
  const getActiveKeyForSampling = useCallback((): KeySignatureDefinition => {
    const settings = appStateRef.current.settings[activeTrack];
    const keyId = settings.activeKeyId || 'C';
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

  // Synchronize rolling stats memory per-track (starts fresh on session / track switch)
  useEffect(() => {
    setRecentTrials([]);
    setRecentKeyTrials([]);
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

    // 3. Update recent tier trials
    const newRecent = [{ isCorrect, latencyMs }, ...recentTrials.slice(0, 19)];
    setRecentTrials(newRecent);

    // 4. Update recent key trials
    const newKeyRecent = [{ isCorrect, latencyMs }, ...recentKeyTrials.slice(0, 19)];
    setRecentKeyTrials(newKeyRecent);

    let nextProgState = updatedState;
    let masteryNotification: string | undefined = undefined;

    // Unlocking & Mastery events ONLY trigger upon a correct submission (presented on the Correct Answer screen)
    if (isCorrect) {
      const masteryParts: string[] = [];

      // Check Tier Mastery (NO auto-promotion)
      const promotion = checkTierPromotion(activeTrack, trackProgress.currentTier, newRecent);
      if (promotion.shouldPromote && promotion.nextTier) {
        const isNewlyMastered = !trackProgress.masteredTiers.includes(trackProgress.currentTier);
        if (isNewlyMastered) {
          const updatedTiers = Array.from(new Set([...trackProgress.masteredTiers, trackProgress.currentTier]));
          // Keep currentTier unchanged! Add to masteredTiers.
          nextProgState = {
            ...nextProgState,
            progress: {
              ...nextProgState.progress,
              [activeTrack]: {
                ...nextProgState.progress[activeTrack],
                masteredTiers: updatedTiers
              }
            }
          };
          masteryParts.push(`🎉 Tier ${trackProgress.currentTier} Mastered! Tier ${promotion.nextTier} is now unlocked.`);
        }
      }

      // Check Key Stage Progression & Mastery (NO auto-promotion)
      if (newKeyRecent.length >= 20) {
        const correctCount = newKeyRecent.filter(t => t.isCorrect).length;
        const keyAccuracy = correctCount / newKeyRecent.length;
        const keyAvgLatency = Math.round(newKeyRecent.reduce((sum, t) => sum + t.latencyMs, 0) / newKeyRecent.length);

        if (keyAccuracy >= 0.85 && keyAvgLatency <= 2000) {
          const currentKeyId = currentKey.id;
          const currentMasteredKeys = trackProgress.masteredKeys || [];
          if (!currentMasteredKeys.includes(currentKeyId)) {
            const updatedMasteredKeys = [...currentMasteredKeys, currentKeyId];
            const unlockedStages = trackProgress.unlockedKeyStages || [0];
            const currentStage = currentKey.stage;
            const nextStage = currentStage < KEY_STAGES.length - 1 ? currentStage + 1 : null;

            let updatedUnlockedStages = unlockedStages;
            let unlockedNewStage = false;

            if (nextStage !== null && !unlockedStages.includes(nextStage)) {
              const currentStageKeys = KEY_STAGES[currentStage]?.keys || [];
              const allStageKeysMastered = currentStageKeys.every(k => updatedMasteredKeys.includes(k));
              if (allStageKeysMastered || currentStageKeys.length <= 1) {
                updatedUnlockedStages = Array.from(new Set([...unlockedStages, nextStage]));
                unlockedNewStage = true;
              }
            }

            nextProgState = {
              ...nextProgState,
              progress: {
                ...nextProgState.progress,
                [activeTrack]: {
                  ...nextProgState.progress[activeTrack],
                  masteredKeys: updatedMasteredKeys,
                  unlockedKeyStages: updatedUnlockedStages
                }
              }
            };

            if (unlockedNewStage && nextStage !== null) {
              masteryParts.push(`🎉 Key Mastered: ${currentKey.name}! Unlocked ${KEY_STAGES[nextStage].title} in Circle of Fifths.`);
            } else {
              masteryParts.push(`🎉 Key Mastered: ${currentKey.name}!`);
            }
          }
        }
      }

      if (masteryParts.length > 0) {
        masteryNotification = masteryParts.join(' • ');
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
      masteryNotification,
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
  }, [activeTrack, currentChord, currentArpeggio, currentKey, recentTrials, recentKeyTrials, trackProgress, trackSettings.clef, trackSettings.inputMode, trackSettings.keyMode, spawnNextProblem]);

  // Input Handlers
  const handleDirectEntrySubmit = (input: { root: NoteLetter; accidental: Accidental; quality: ChordQuality; inversion: Inversion }) => {
    if (!currentChord) return;

    const isDrop = currentChord.voicing === 'drop2' || currentChord.voicing === 'drop3';
    const dropLabel = isDrop 
      ? (currentChord.voicing === 'drop2' 
          ? (currentChord.omit5 ? 'Drop-2 (omit 5)' : 'Drop-2') 
          : (currentChord.omit5 ? 'Drop-3 (omit 5)' : 'Drop-3'))
      : '';
    const isRootMatch = input.root === currentChord.root;
    const isAccMatch = input.accidental === currentChord.rootAccidental;
    const isQualityMatch = input.quality === currentChord.quality;
    const isInvMatch = isDrop ? true : (input.inversion === currentChord.inversion);
    const isCorrect = isRootMatch && isAccMatch && isQualityMatch && isInvMatch;

    const userChord = alignChordToTargetOctave(
      input.root, 
      input.accidental, 
      input.quality, 
      input.inversion, 
      trackSettings.clef, 
      trackProgress.currentTier,
      currentChord
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
        label: isDrop ? 'Voicing' : 'Inv',
        userVal: isDrop ? dropLabel : formatInversionName(input.inversion, 'short'),
        correctVal: isDrop ? dropLabel : formatInversionName(currentChord.inversion, 'short'),
        isMatch: isInvMatch
      }
    ];

    const userStr = isDrop
      ? `${formatNoteName(input.root, input.accidental)}${CHORD_FORMULAS[input.quality].shortName} (${dropLabel})`
      : `${formatNoteName(input.root, input.accidental)}${CHORD_FORMULAS[input.quality].shortName} (${formatInversionName(input.inversion, 'short')})`;

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

    let userChord: ChordDefinition | undefined;
    let userArpeggio: ArpeggioDefinition | undefined;

    if (!selected.isCorrect) {
      if (activeTrack === 'chords' && currentChord && selected.chordData) {
        userChord = alignChordToTargetOctave(
          selected.chordData.root,
          selected.chordData.accidental,
          selected.chordData.quality,
          selected.chordData.inversion,
          trackSettings.clef,
          trackProgress.currentTier,
          currentChord
        );
      } else if (activeTrack === 'arpeggios' && currentArpeggio && selected.arpeggioData) {
        userArpeggio = alignArpeggioToTargetOctave(
          selected.arpeggioData.root,
          selected.arpeggioData.accidental,
          selected.arpeggioData.quality,
          selected.arpeggioData.contour,
          selected.arpeggioData.startingDegree,
          trackSettings.clef,
          trackProgress.currentTier,
          currentArpeggio
        );
      }
    }

    evaluateSubmission(selected.isCorrect, selected.label, correctOption?.label || '', {
      userChord,
      userArpeggio,
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
    setRecentTrials([]);
    setRecentKeyTrials([]);
    setLastResult(null);
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
    setRecentTrials([]);
    setRecentKeyTrials([]);
    setLastResult(null);
    spawnNextProblem();
  };

  const handleSelectKey = (keyId: string) => {
    const next: AppState = {
      ...appState,
      settings: {
        ...appState.settings,
        [activeTrack]: {
          ...appState.settings[activeTrack],
          activeKeyId: keyId
        }
      }
    };
    saveAppState(next);
    setAppState(next);
    setCurrentKey(KEY_SIGNATURES[keyId] || KEY_SIGNATURES['C']);
    setRecentTrials([]);
    setRecentKeyTrials([]);
    setLastResult(null);
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
    setRecentTrials([]);
    setRecentKeyTrials([]);
    setLastResult(null);
  };

  const handleClearAllStorage = async () => {
    await clearAllAppStorage();
    setAppState(DEFAULT_APP_STATE);
    setCurrentKey(KEY_SIGNATURES['C']);
    setRecentTrials([]);
    setRecentKeyTrials([]);
    setLastResult(null);
    setIsSettingsModalOpen(false);
    setPromotionNotification('All app storage and trial history have been cleared.');
    spawnNextProblem();
  };

  // Calculate rolling accuracy & latency for Stats HUD
  const accuracy = recentTrials.length > 0
    ? Math.round((recentTrials.filter(t => t.isCorrect).length / recentTrials.length) * 100)
    : 0;

  const avgLatencyMs = recentTrials.length > 0
    ? Math.round(recentTrials.reduce((sum, t) => sum + t.latencyMs, 0) / recentTrials.length)
    : 0;

  const isTierMastered = (trackProgress.masteredTiers || []).includes(trackProgress.currentTier);
  const isKeyMastered = (trackProgress.masteredKeys || []).includes(currentKey.id);

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
          setRecentTrials([]);
          setRecentKeyTrials([]);
          setLastResult(null);
        }}
        activeKey={currentKey}
        isKeyMastered={isKeyMastered}
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
              isMastered={isTierMastered}
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
              darkMode={true}
              onContinue={spawnNextProblem}
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
        onClearAllStorage={handleClearAllStorage}
      />
    </div>
  );
};

export default App;
