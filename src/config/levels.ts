import type { StationKind } from '../types';

export interface LevelDef {
  id: string;
  /** Display name and one-line pitch (Estonian). */
  name: string;
  description: string;
  duration: number;
  spawn: {
    intervalStart: number;
    intervalEnd: number;
    maxConcurrent: number;
    firstSpawnDelay?: number;
  };
  /** Station kinds open on this level; the rest are shown covered. */
  stations: StationKind[];
  /** Recipe ids that can appear. */
  recipes: string[];
  /** Customer type ids that can appear. */
  customerTypes: string[];
  /** Money needed for 1, 2 and 3 stars. */
  starThresholds: [number, number, number];
}

const BASE_STATIONS: StationKind[] = ['wait', 'wash', 'cut', 'dry', 'checkout'];

export const LEVELS: LevelDef[] = [
  {
    id: 'monday',
    name: 'Esmaspäeva hommik',
    description: 'Rahulik algus: pesu, lõikus ja föön.',
    duration: 180,
    spawn: { intervalStart: 13, intervalEnd: 7, maxConcurrent: 5 },
    stations: BASE_STATIONS,
    recipes: ['quick', 'classic', 'festive'],
    customerTypes: ['normal', 'helgi', 'laps'],
    // Measured ideal-play ceiling ≈ €306; the tutorial level keeps 3 stars a touch softer
    starThresholds: [60, 130, 210],
  },
  {
    id: 'colourday',
    name: 'Värvipäev',
    description: 'Värvimisjaam avatud — värvisoengud tulevad.',
    duration: 180,
    spawn: { intervalStart: 11, intervalEnd: 6, maxConcurrent: 6 },
    stations: [...BASE_STATIONS, 'colour'],
    recipes: ['quick', 'classic', 'festive', 'colour'],
    customerTypes: ['normal', 'helgi', 'laps', 'dogowner'],
    // Ceiling ≈ €411
    starThresholds: [80, 180, 280],
  },
  {
    id: 'wedding',
    name: 'Pulmapäev',
    description: 'Kõik jaamad täies hoos ja pruudid ootavad.',
    duration: 180,
    spawn: { intervalStart: 9, intervalEnd: 5, maxConcurrent: 6 },
    stations: [...BASE_STATIONS, 'colour'],
    recipes: ['classic', 'festive', 'colour', 'bridal'],
    customerTypes: ['normal', 'helgi', 'laps', 'dogowner', 'staar'],
    // Ceiling ≈ €435; the hardest three-star target of the three
    starThresholds: [100, 220, 340],
  },
];

export const FIRST_LEVEL_ID = LEVELS[0].id;

export function getLevel(id: string | undefined): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

export function levelIndex(id: string): number {
  return Math.max(0, LEVELS.findIndex((l) => l.id === id));
}

export function nextLevel(id: string): LevelDef | null {
  return LEVELS[levelIndex(id) + 1] ?? null;
}

/** Stars earned for an amount of money on this level. */
export function starsForMoney(level: LevelDef, money: number): number {
  return level.starThresholds.filter((t) => money >= t).length;
}
