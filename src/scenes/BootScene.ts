import Phaser from 'phaser';
import { generateAllTextures } from '../art/generateTextures';
import { DEMO } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateAllTextures(this);
    // ?demo skips the menu for quick visual checks.
    this.scene.start(DEMO ? 'Game' : 'Menu');
  }
}
