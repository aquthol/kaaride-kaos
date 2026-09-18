import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import type { Mood } from '../types';
import { faceKey } from './textureKeys';
import { arcStroke, makeTexture } from './textureUtil';

type G = Phaser.GameObjects.Graphics;

/** Faces are 32x22; eyes sit at (10,10) and (22,10). */
function eyes(g: G, dy = 0): void {
  for (const x of [10, 22]) {
    g.fillStyle(P.eye, 1);
    g.fillEllipse(x, 10 + dy, 4.5, 5.5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x + 0.8, 8.8 + dy, 1);
  }
}

function blush(g: G, color: number, alpha: number): void {
  g.fillStyle(color, alpha);
  g.fillEllipse(4, 15, 6, 3.5);
  g.fillEllipse(28, 15, 6, 3.5);
}

const FACE_DRAWERS: Record<Mood, (g: G) => void> = {
  happy: (g) => {
    blush(g, P.blush, 0.55);
    eyes(g);
    arcStroke(g, 16, 13, 4.5, 0.15 * Math.PI, 0.85 * Math.PI, P.eye, 2);
  },
  neutral: (g) => {
    eyes(g);
    g.lineStyle(2, P.eye, 1);
    g.lineBetween(13, 17, 19, 17);
  },
  angry: (g) => {
    blush(g, P.angryBlush, 0.7);
    eyes(g, 1);
    g.lineStyle(2.2, P.eye, 1);
    g.lineBetween(6, 4, 13, 7);
    g.lineBetween(26, 4, 19, 7);
    arcStroke(g, 16, 21, 4, 1.15 * Math.PI, 1.85 * Math.PI, P.eye, 2);
  },
  burnt: (g) => {
    g.fillStyle(P.soot, 0.35);
    g.fillEllipse(7, 14, 10, 6);
    g.fillEllipse(25, 5, 8, 5);
    g.lineStyle(2, P.eye, 1);
    for (const x of [10, 22]) {
      g.lineBetween(x - 2.5, 7.5, x + 2.5, 12.5);
      g.lineBetween(x + 2.5, 7.5, x - 2.5, 12.5);
    }
    g.strokeCircle(16, 17, 2.5);
  },
};

export function generateFaceTextures(scene: Phaser.Scene): void {
  for (const [mood, draw] of Object.entries(FACE_DRAWERS)) {
    makeTexture(scene, faceKey(mood), 32, 22, draw);
  }
}
