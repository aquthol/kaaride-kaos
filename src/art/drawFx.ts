import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import { arcStroke, circle, ellipse, makeTexture, poly } from './textureUtil';

export const FX = {
  snip: 'fx-snip',
  drop: 'fx-drop',
  puff: 'fx-puff',
  coin: 'fx-coin',
  sparkle: 'fx-sparkle',
  anger: 'fx-anger',
  heart: 'fx-heart',
  ring: 'fx-ring',
} as const;

/** Star polygon points with `points` tips. */
export function starPoints(cx: number, cy: number, outer: number, inner: number, points: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export function generateFxTextures(scene: Phaser.Scene): void {
  // Hair clipping (tinted with the customer's hair color)
  makeTexture(scene, FX.snip, 14, 10, (g) => {
    arcStroke(g, 7, 12, 8, 1.2 * Math.PI, 1.8 * Math.PI, 0x8c8c8c, 3.5);
    arcStroke(g, 7, 12, 8, 1.2 * Math.PI, 1.8 * Math.PI, 0xffffff, 2);
  });

  makeTexture(scene, FX.drop, 10, 13, (g) => {
    poly(g, [[5, 1], [8.5, 7], [1.5, 7]], 0x9fd8f5, null);
    circle(g, 5, 8, 3.8, 0x9fd8f5, null);
    g.lineStyle(1.2, 0x4f9cc4, 1);
    g.strokeCircle(5, 8, 3.8);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(3.8, 7.2, 1.1);
  });

  // Soft white puff: steam, foam, dust and (tinted) smoke
  makeTexture(scene, FX.puff, 32, 32, (g) => {
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0xffffff, 0.16);
      g.fillCircle(16, 16, 15 - i * 2.2);
    }
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(13, 13, 4);
  });

  makeTexture(scene, FX.coin, 18, 18, (g) => {
    circle(g, 9, 9, 7.5, P.coin, P.outline, 1.5);
    circle(g, 9, 9, 4.5, P.coin, P.coinDark, 1.2);
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(6.5, 5.5, 5, 2.5);
  });

  makeTexture(scene, FX.sparkle, 18, 18, (g) => {
    poly(g, starPoints(9, 9, 8.5, 2.2, 4), 0xffffff, null);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(9, 9, 2.4);
  });

  // Manga-style anger mark
  makeTexture(scene, FX.anger, 24, 24, (g) => {
    const arms: [number, number, number][] = [
      [6, 6, 0],
      [18, 6, 0.5],
      [18, 18, 1],
      [6, 18, 1.5],
    ];
    for (const [cx, cy, rot] of arms) {
      const a = rot * Math.PI;
      arcStroke(g, cx, cy, 5, a, a + Math.PI / 2, P.outline, 4.5);
      arcStroke(g, cx, cy, 5, a, a + Math.PI / 2, P.bad, 2.6);
    }
  });

  makeTexture(scene, FX.heart, 18, 16, (g) => {
    circle(g, 5.5, 5.5, 4.2, P.cut, null);
    circle(g, 12.5, 5.5, 4.2, P.cut, null);
    poly(g, [[1.6, 7], [16.4, 7], [9, 15]], P.cut, null);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(4.5, 4.5, 1.4);
  });

  // Floor highlight ring under the targeted station (tinted per use)
  makeTexture(scene, FX.ring, 128, 44, (g) => {
    ellipse(g, 64, 22, 122, 38, 0xffffff, null, 0, 0.16);
    g.lineStyle(3, 0xffffff, 0.95);
    g.strokeEllipse(64, 22, 122, 38);
    g.lineStyle(1.5, 0xffffff, 0.5);
    g.strokeEllipse(64, 22, 108, 30);
  });
}
