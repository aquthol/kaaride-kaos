import type { HairStyle } from '../types';
import { PALETTE } from './palette';

export interface CustomerLookOptions {
  skins: readonly number[];
  hairStyles: readonly HairStyle[];
  hairColors: readonly number[];
  clothes: readonly number[];
  pants: readonly number[];
  /** Overlay drawn on the torso (e.g. pearls). */
  accessory?: string;
  /** Overlay drawn at head height (e.g. sunglasses). */
  faceAccessory?: string;
}

/** Companions that walk in with a customer. */
export type PetKind = 'dog';

/** One-off effect when the customer walks in. */
export type ArrivalEffect = 'flash';

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
  /** Multiplies the recipe price at the till. */
  priceMultiplier?: number;
  /** Sprite scale; small for children. */
  scale?: number;
  /** Seconds sitting in the waiting area before wandering off on their own. */
  wanderAfter?: number;
  /** Effect played when they arrive. */
  arrival?: ArrivalEffect;
  /** Companion that follows them in and out. */
  pet?: PetKind;
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
  {
    id: 'laps',
    // No name tag: a half-size customer already reads as a child
    // Impatient, and wanders off the waiting chair if nobody takes them
    patience: 34,
    tipMultiplier: 1.1,
    spawnWeight: 1.6,
    unlockAt: 15,
    scale: 0.78,
    wanderAfter: 8,
    look: {
      skins: PALETTE.skins,
      hairStyles: ['pigtails', 'curly', 'bun'],
      hairColors: PALETTE.childHair,
      clothes: PALETTE.childClothes,
      pants: PALETTE.pants,
    },
  },
  {
    id: 'staar',
    displayName: 'Staar',
    // Pays double and tips hugely, but will not wait around
    patience: 26,
    tipMultiplier: 3.2,
    priceMultiplier: 2,
    spawnWeight: 0.9,
    unlockAt: 25,
    arrival: 'flash',
    look: {
      skins: PALETTE.skins,
      hairStyles: ['long', 'bun', 'quiff'],
      hairColors: [PALETTE.starHair, 0x2c2c3a, 0xf2d27a],
      clothes: [PALETTE.starOutfit, 0x2c2c3a, 0xe0578f],
      pants: [0x2c2c3a, 0x4a3a55],
      faceAccessory: 'acc-shades',
    },
  },
  {
    id: 'dogowner',
    // No name tag either: the dog at their heels is the give-away
    patience: 52,
    tipMultiplier: 1.2,
    // A dog underfoot wears thin quickly: aim for one or two per round
    spawnWeight: 0.8,
    unlockAt: 10,
    pet: 'dog',
    look: {
      skins: PALETTE.skins,
      hairStyles: ['short', 'bob', 'long', 'curly'],
      hairColors: PALETTE.hairColors,
      clothes: PALETTE.clothes,
      pants: PALETTE.pants,
    },
  },
];

export function getCustomerTypes(ids: readonly string[]): CustomerTypeDef[] {
  return CUSTOMER_TYPES.filter((c) => ids.includes(c.id));
}
