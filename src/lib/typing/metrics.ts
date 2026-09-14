export type TypingAttempt = { duration: number; corrections: number; assisted: boolean; hadError: boolean };
export type CastResult = { skillId: string; duration: number; accuracy: number; isPerfect: boolean };

export function calculateAccuracy(correct: number, total: number): number {
  return total > 0 ? Math.max(0, Math.min(100, correct / total * 100)) : 100;
}

// Game WPM: five completed Korean syllables/characters count as one word.
export function calculateWpm(characters: number, durationMs: number): number {
  return durationMs > 0 && Number.isFinite(durationMs) ? Math.round(Math.max(0, characters) / 5 * 60_000 / durationMs) : 0;
}

export function calculatePerfect(attempt: TypingAttempt, target: number): boolean {
  return Number.isFinite(attempt.duration) && attempt.duration > 0 && attempt.duration <= target && attempt.corrections === 0 && !attempt.hadError && !attempt.assisted;
}

export function calculateDamage(base: number, perfect: boolean): number {
  return Math.round(base * (perfect ? 1.5 : 1));
}

// Positional comparison is intentionally replaceable with edit distance later.
export function countCorrectCharacters(input: string, candidates: readonly string[]): number {
  return Math.max(0, ...candidates.map((name) => [...input].filter((char, index) => char === [...name][index]).length));
}
