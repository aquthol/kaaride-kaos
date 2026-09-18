import Phaser from 'phaser';
import { generateCharacterTextures } from './drawCharacters';
import { generateFaceTextures } from './drawFaces';
import { generateFurnitureTextures } from './drawFurniture';
import { generateFxTextures } from './drawFx';
import { generateIconTextures } from './drawIcons';
import { generateRoomTextures } from './drawRoom';

/** Bake every procedural texture once at boot. */
export function generateAllTextures(scene: Phaser.Scene): void {
  generateRoomTextures(scene);
  generateFurnitureTextures(scene);
  generateCharacterTextures(scene);
  generateFaceTextures(scene);
  generateIconTextures(scene);
  generateFxTextures(scene);
}
