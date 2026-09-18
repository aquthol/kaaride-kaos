import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';

/** A rounded panel with a soft drop shadow, centered at (x, y). */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, radius = 22): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(P.shadow, 0.25);
  g.fillRoundedRect(x - w / 2 + 4, y - h / 2 + 8, w, h, radius);
  g.fillStyle(P.panel, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
  g.lineStyle(3, P.outline, 1);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
  return g;
}
