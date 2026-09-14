import type { TypingAttempt } from "./metrics";

export class AttemptTracker {
  private started: number | null = null;
  private corrections = 0;
  private assisted = false;
  private hadError = false;

  begin(now: number) { this.started ??= now; }
  change(now: number) {
    // Input with no physical key/composition start (autofill, bulk insertion).
    if (this.started === null) { this.assisted = true; this.begin(now); }
  }
  correct() { if (this.started !== null) this.corrections++; }
  assist() { this.assisted = true; }
  committed(value: string, candidates: readonly string[]) {
    if (value && !candidates.some((name) => name.startsWith(value))) this.hadError = true;
  }
  finish(now: number): TypingAttempt {
    const result = { duration: this.started === null ? 0 : Math.max(0, now - this.started), corrections: this.corrections, assisted: this.assisted, hadError: this.hadError };
    this.started = null; this.corrections = 0; this.assisted = false; this.hadError = false;
    return result;
  }
}
