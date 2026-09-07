export type TimingState = 'idle' | 'active' | 'feedback';

export class PrecisionTimingEngine {
  private startTime: number = 0;
  private revealTime: number = 0;
  private submitTime: number = 0;
  private state: TimingState = 'idle';

  public startQuestion(): void {
    this.cancel();
    this.startTime = performance.now();
    this.revealTime = this.startTime;
    this.state = 'active';
  }

  public recordSubmission(): { latencyMs: number } {
    this.submitTime = performance.now();
    const latencyMs = Math.max(1, Math.round(this.submitTime - this.revealTime));
    this.state = 'feedback';
    return { latencyMs };
  }

  public cancel(): void {
    this.state = 'idle';
    this.revealTime = 0;
    this.submitTime = 0;
  }

  public getState(): TimingState {
    return this.state;
  }
}

