export type Action = 'up' | 'down' | 'left' | 'right' | 'grab' | 'work' | 'dash';

export interface InputProfile {
  id: string;
  /** Player name shown in the menu. */
  name: string;
  /**
   * `KeyboardEvent.code` values per action. Codes (not Phaser KeyCodes) are used
   * because co-op needs ShiftLeft/ShiftRight told apart and NumpadEnter bound.
   */
  keys: Record<Action, string[]>;
}

export const PLAYER_ONE: InputProfile = {
  id: 'p1',
  name: 'Rasmus',
  keys: {
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],
    grab: ['Space'],
    work: ['KeyE'],
    dash: ['ShiftLeft'],
  },
};

export const PLAYER_TWO: InputProfile = {
  id: 'p2',
  name: 'Karl',
  keys: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    grab: ['Enter', 'NumpadEnter'],
    work: ['ShiftRight'],
    dash: ['Numpad0'],
  },
};

export const PLAYER_PROFILES: InputProfile[] = [PLAYER_ONE, PLAYER_TWO];

export const MAX_PLAYERS = PLAYER_PROFILES.length;

/** The profiles for a round with `count` players. */
export function profilesFor(count: number): InputProfile[] {
  return PLAYER_PROFILES.slice(0, Math.min(Math.max(count, 1), MAX_PLAYERS));
}
