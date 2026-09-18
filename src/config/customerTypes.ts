import type { HairStyle } from '../types';
import { PALETTE } from './palette';

export interface CustomerLookOptions {
  skins: readonly number[];
  hairStyles: readonly HairStyle[];
  hairColors: readonly number[];
  clothes: readonly number[];
  pants: readonly number[];
  accessory?: string;
}

export interface CustomerTypeDef {
  id: string;
  /** Optional name tag shown above the customer (Estonian). */
  displayName?: string;
  /** Base patience in seconds (recipe bonus is added on top). */
  patience: number;
  tipMultiplier: number;
  spawnWeight: number;
  /** Seconds into the round before this type can appear. */
  unlockAt: number;
  look: CustomerLookOptions;
}

export const CUSTOMER_TYPES: CustomerTypeDef[] = [
  {
    id: 'normal',
    patience: 55,
    tipMultiplier: 1,
    spawnWeight: 5,
    unlockAt: 0,
    look: {
      skins: PALETTE.skins,
      hairStyles: ['short', 'bob', 'bun', 'curly', 'long', 'bald'],
      hairColors: PALETTE.hairColors,
      clothes: PALETTE.clothes,
      pants: PALETTE.pants,
    },
  },
  {
    id: 'helgi',
    displayName: 'Proua Helgi',
    patience: 32,
    tipMultiplier: 2.5,
    spawnWeight: 1.4,
    unlockAt: 20,
    look: {
      skins: [PALETTE.skins[0], PALETTE.skins[1]],
      hairStyles: ['perm'],
      hairColors: [PALETTE.helgiHair],
      clothes: [PALETTE.helgiCardigan],
      pants: [0x4a3a55],
      accessory: 'acc-pearls',
    },
  },
];
