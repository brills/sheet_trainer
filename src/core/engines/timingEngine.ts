import { InputMode } from '../../types';

export type FlashState = 'idle' | 'flashing' | 'masked' | 'feedback';

export function getAutoAdvanceDelayMs(inputMode: InputMode, customDelayMs?: number): number {
  if (customDelayMs === -1) {
    return -1; // Manual acknowledgment required
  }
  if (customDelayMs && customDelayMs > 0) {
    return customDelayMs;
  }
  switch (inputMode) {
    case 'multiple_choice':
      return 1400; // Shorter delay for multiple choice
    case 'direct_entry':
    default:
      return 2600; // Generous delay for direct entry (reading text notation & slot breakdown)
  }
}

export interface FlashTimingConfig {
  durationMs: number; // Flash exposure time (e.g. 300ms, or 0 for untimed)
  onMask?: () => void;
  onTimeout?: () => void;
}

export class PrecisionTimingEngine {
  private startTime: number = 0;
  private revealTime: number = 0;
  private maskTime: number = 0;
  private submitTime: number = 0;
  private timerId: number | null = null;
  private state: FlashState = 'idle';

  public startFlash(config: FlashTimingConfig): void {
    this.cancel();
    this.startTime = performance.now();
    this.revealTime = this.startTime;
    this.state = 'flashing';

    // If durationMs is > 0, schedule masking
    if (config.durationMs > 0) {
      this.timerId = window.setTimeout(() => {
        this.mask();
        config.onMask?.();
      }, config.durationMs);
    }
  }

  public mask(): void {
    if (this.state === 'flashing') {
      this.maskTime = performance.now();
      this.state = 'masked';
    }
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public recordSubmission(): { latencyMs: number; flashExposureMs: number } {
    this.submitTime = performance.now();
    const latencyMs = Math.round(this.submitTime - this.revealTime);
    const flashExposureMs = this.maskTime > 0 
      ? Math.round(this.maskTime - this.revealTime) 
      : latencyMs;

    this.state = 'feedback';
    return { latencyMs, flashExposureMs };
  }

  public cancel(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.state = 'idle';
    this.revealTime = 0;
    this.maskTime = 0;
    this.submitTime = 0;
  }

  public getState(): FlashState {
    return this.state;
  }
}
