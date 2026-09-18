import Phaser from 'phaser';
import { generateAllTextures } from '../art/generateTextures';
import { DEMO, FORCED_LEVEL, FORCED_PLAYERS } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateAllTextures(this);
    // ?demo, ?level= and ?players= are testing shortcuts: drop straight into a
    // round, skipping the menu and the level select (and any level locks).
    const skipMenu = DEMO || FORCED_LEVEL !== '' || FORCED_PLAYERS > 0;
    this.scene.start(skipMenu ? 'Game' : 'Menu');
  }
}
