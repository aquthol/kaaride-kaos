import Phaser from 'phaser';
import { PALETTE as P, css } from '../config/palette';
import { textStyle } from './textStyle';

/** A rounded keyboard-key label, left-aligned at (x, y center). */
export function keyCap(scene: Phaser.Scene, x: number, y: number, label: string): Phaser.GameObjects.Container {
  const text = scene.add.text(0, -1, label, textStyle(15, css(P.text), '900')).setOrigin(0.5);
  const w = Math.max(34, text.width + 20);
  const h = 28;
  const g = scene.add.graphics();
  g.fillStyle(P.panelEdge, 1);
  g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, 7);
  g.fillStyle(P.white, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 7);
  g.lineStyle(2, P.panelEdge, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 7);
  return scene.add.container(x + w / 2, y, [g, text]);
}
