import Phaser from 'phaser';
import { TEX } from '../art/textureKeys';
import type { CustomerLookOptions } from '../config/customerTypes';
import { PALETTE } from '../config/palette';
import type { CharacterLook } from '../types';

export const RASMUS_LOOK: CharacterLook = {
  skin: PALETTE.skins[1],
  hairStyle: 'quiff',
  hairColor: PALETTE.rasmusHair,
  bodyTexture: TEX.rasmusBody,
  bodyTint: 0xffffff,
  legsTint: PALETTE.rasmusPants,
};

/** Player 2: Rasmus's colleague. */
export const KARL_LOOK: CharacterLook = {
  skin: PALETTE.skins[2],
  hairStyle: 'bun',
  hairColor: PALETTE.karlHair,
  bodyTexture: TEX.karlBody,
  bodyTint: 0xffffff,
  legsTint: PALETTE.karlPants,
};

/** Looks and marker colors by player index. */
export const PLAYER_LOOKS: CharacterLook[] = [RASMUS_LOOK, KARL_LOOK];
export const PLAYER_COLORS: number[] = [PALETTE.rasmusApron, PALETTE.karlApron];

const pick = <T>(list: readonly T[]): T => Phaser.Utils.Array.GetRandom(list as T[]);

export function randomCustomerLook(options: CustomerLookOptions): CharacterLook {
  return {
    skin: pick(options.skins),
    hairStyle: pick(options.hairStyles),
    hairColor: pick(options.hairColors),
    bodyTexture: TEX.body,
    bodyTint: pick(options.clothes),
    legsTint: pick(options.pants),
    accessory: options.accessory,
    faceAccessory: options.faceAccessory,
  };
}
