import { FIRST_LEVEL_ID, LEVELS, levelIndex } from '../config/levels';

const STORAGE_KEY = 'rkk.progress';

export interface LevelResult {
  stars: number;
  bestMoney: number;
}

type ProgressData = Record<string, LevelResult>;

function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressData) : {};
  } catch {
    return {};
  }
}

function save(data: ProgressData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode); progress just won't persist.
  }
}

export function starsFor(levelId: string): number {
  return load()[levelId]?.stars ?? 0;
}

export function bestMoneyFor(levelId: string): number {
  return load()[levelId]?.bestMoney ?? 0;
}

/** The first level is always open; the rest need at least one star on the previous one. */
export function isUnlocked(levelId: string): boolean {
  if (levelId === FIRST_LEVEL_ID) return true;
  const previous = LEVELS[levelIndex(levelId) - 1];
  return previous ? starsFor(previous.id) >= 1 : false;
}

/** Store a finished round, keeping the best result. */
export function recordResult(levelId: string, stars: number, money: number): void {
  const data = load();
  const current = data[levelId];
  data[levelId] = {
    stars: Math.max(stars, current?.stars ?? 0),
    bestMoney: Math.max(money, current?.bestMoney ?? 0),
  };
  save(data);
}

/** Used by the tests and the "clear progress" path. */
export function resetProgress(): void {
  save({});
}
