import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import type { StepKind } from '../types';
import { starPoints } from './drawFx';
import { arcStroke, circle, ellipse, makeTexture, poly, rrect } from './textureUtil';

type G = Phaser.GameObjects.Graphics;

export const ICON = {
  wash: 'icon-wash',
  cut: 'icon-cut',
  colour: 'icon-colour',
  dry: 'icon-dry',
  coin: 'icon-coin',
  check: 'icon-check',
  cross: 'icon-cross',
  warn: 'icon-warn',
  clock: 'icon-clock',
  happy: 'icon-happy',
  angry: 'icon-angry',
  star: 'icon-star',
  starEmpty: 'icon-star-empty',
  soundOn: 'icon-sound-on',
  soundOff: 'icon-sound-off',
} as const;

export const STEP_ICON: Record<StepKind, string> = {
  wash: ICON.wash,
  cut: ICON.cut,
  colour: ICON.colour,
  dry: ICON.dry,
};

export const STEP_COLOR: Record<StepKind, number> = {
  wash: P.wash,
  cut: P.cut,
  colour: P.colour,
  dry: P.dry,
};

const S = 32;
const M = S / 2;

function badge(g: G, fill: number): void {
  circle(g, M, M, 14, fill, P.outline, 2);
  g.fillStyle(0xffffff, 0.3);
  g.fillEllipse(M - 3, M - 7, 14, 6);
}

export function generateIconTextures(scene: Phaser.Scene): void {
  makeTexture(scene, ICON.wash, S, S, (g) => {
    badge(g, P.wash);
    poly(g, [[M, 6], [M + 6, M + 1], [M - 6, M + 1]], P.white, null);
    circle(g, M, M + 3, 6.5, P.white, null);
    g.lineStyle(1.8, P.outline, 1);
    g.beginPath();
    g.moveTo(M - 6.2, M);
    g.lineTo(M, 6);
    g.lineTo(M + 6.2, M);
    g.strokePath();
    arcStroke(g, M, M + 3, 6.5, -0.15 * Math.PI, 1.15 * Math.PI, P.outline, 1.8);
    circle(g, M - 2, M + 3, 1.6, P.wash, null);
  });

  makeTexture(scene, ICON.cut, S, S, (g) => {
    badge(g, P.cut);
    g.lineStyle(4.5, P.outline, 1);
    g.lineBetween(M - 5, M + 4, M + 6, 6);
    g.lineBetween(M + 5, M + 4, M - 6, 6);
    g.lineStyle(2.5, P.white, 1);
    g.lineBetween(M - 5, M + 4, M + 6, 6);
    g.lineBetween(M + 5, M + 4, M - 6, 6);
    circle(g, M - 6, M + 7, 3.5, P.white, P.outline, 1.8);
    circle(g, M + 6, M + 7, 3.5, P.white, P.outline, 1.8);
  });

  // Colour: a dye brush over a bowl
  makeTexture(scene, ICON.colour, S, S, (g) => {
    badge(g, P.colour);
    rrect(g, M + 1, M - 10, 4.5, 12, 2, P.white, P.outline, 1.6);
    poly(
      g,
      [[M - 1, M + 2], [M + 7, M + 2], [M + 5.5, M + 9], [M + 0.5, M + 9]],
      P.white,
      P.outline,
      1.6,
    );
    ellipse(g, M - 5, M + 6, 14, 8, P.white, P.outline, 1.6);
    ellipse(g, M - 5, M + 6, 9, 4.5, P.colourDark, null);
  });

  makeTexture(scene, ICON.dry, S, S, (g) => {
    badge(g, P.dry);
    rrect(g, M + 1, M + 1, 5, 9, 2, P.white, P.outline, 1.6);
    rrect(g, M - 9, M - 7, 14, 10, 5, P.white, P.outline, 1.6);
    rrect(g, M + 3, M - 5, 7, 6, 2, P.white, P.outline, 1.6);
    g.lineStyle(1.6, P.white, 1);
    g.lineBetween(M + 11, M - 6, M + 13, M - 8);
    g.lineBetween(M + 11, M - 2, M + 13, M - 2);
  });

  makeTexture(scene, ICON.coin, S, S, (g) => {
    circle(g, M, M, 14, P.coin, P.outline, 2);
    circle(g, M, M, 10, P.coin, P.coinDark, 1.5);
    arcStroke(g, M + 1, M, 5.5, 0.3 * Math.PI, 1.7 * Math.PI, P.outline, 2.2);
    g.lineStyle(1.8, P.outline, 1);
    g.lineBetween(M - 7, M - 1.5, M + 1, M - 1.5);
    g.lineBetween(M - 7, M + 1.5, M + 1, M + 1.5);
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(M - 5, M - 8, 8, 4);
  });

  makeTexture(scene, ICON.check, S, S, (g) => {
    circle(g, M, M, 13, P.good, P.outline, 2);
    g.lineStyle(3.5, P.white, 1);
    g.beginPath();
    g.moveTo(M - 6, M);
    g.lineTo(M - 1.5, M + 5);
    g.lineTo(M + 6.5, M - 5);
    g.strokePath();
  });

  makeTexture(scene, ICON.cross, S, S, (g) => {
    circle(g, M, M, 13, P.bad, P.outline, 2);
    g.lineStyle(3.5, P.white, 1);
    g.lineBetween(M - 5, M - 5, M + 5, M + 5);
    g.lineBetween(M + 5, M - 5, M - 5, M + 5);
  });

  makeTexture(scene, ICON.warn, S, S, (g) => {
    poly(g, [[M, 3], [S - 3, S - 4], [3, S - 4]], P.warn, P.outline, 2);
    rrect(g, M - 1.8, 11, 3.6, 10, 1.8, P.outline, null);
    ellipse(g, M, 25, 4, 4, P.outline, null);
  });

  makeTexture(scene, ICON.clock, S, S, (g) => {
    circle(g, M, M + 1, 12.5, P.white, P.outline, 2.2);
    rrect(g, M - 3, 1, 6, 4, 2, P.outline, null);
    g.lineStyle(2.4, P.outline, 1);
    g.lineBetween(M, M + 1, M, M - 6);
    g.lineStyle(2.4, P.accent, 1);
    g.lineBetween(M, M + 1, M + 5, M + 4);
    circle(g, M, M + 1, 1.8, P.outline, null);
  });

  makeTexture(scene, ICON.happy, S, S, (g) => {
    circle(g, M, M, 13, P.good, P.outline, 2);
    g.fillStyle(P.outline, 1);
    g.fillEllipse(M - 4.5, M - 3, 3, 4);
    g.fillEllipse(M + 4.5, M - 3, 3, 4);
    arcStroke(g, M, M + 1, 5.5, 0.15 * Math.PI, 0.85 * Math.PI, P.outline, 2.2);
  });

  makeTexture(scene, ICON.angry, S, S, (g) => {
    circle(g, M, M, 13, P.bad, P.outline, 2);
    g.lineStyle(2.2, P.outline, 1);
    g.lineBetween(M - 8, M - 7, M - 2.5, M - 4.5);
    g.lineBetween(M + 8, M - 7, M + 2.5, M - 4.5);
    g.fillStyle(P.outline, 1);
    g.fillEllipse(M - 4.5, M - 1.5, 3, 3.5);
    g.fillEllipse(M + 4.5, M - 1.5, 3, 3.5);
    arcStroke(g, M, M + 10, 5, 1.2 * Math.PI, 1.8 * Math.PI, P.outline, 2.2);
  });

  // Speaker, with sound waves or a cross
  const speaker = (g: G) => {
    rrect(g, 7, M - 5, 7, 10, 2, P.panel, P.outline, 2);
    poly(g, [[13, M - 4], [21, M - 11], [21, M + 11], [13, M + 4]], P.panel, P.outline, 2);
  };
  makeTexture(scene, ICON.soundOn, S, S, (g) => {
    speaker(g);
    arcStroke(g, 21, M, 6, -0.35 * Math.PI, 0.35 * Math.PI, P.outline, 2.2);
    arcStroke(g, 21, M, 10, -0.35 * Math.PI, 0.35 * Math.PI, P.outline, 2.2);
  });
  makeTexture(scene, ICON.soundOff, S, S, (g) => {
    speaker(g);
    g.lineStyle(2.6, P.bad, 1);
    g.lineBetween(23, M - 6, 30, M + 6);
    g.lineBetween(30, M - 6, 23, M + 6);
  });

  const star = (fill: number, stroke: number) => (g: G) => {
    const pts = starPoints(32, 33, 29, 13, 5);
    poly(g, pts.map(([x, y]) => [x + 1, y + 3] as [number, number]), P.shadow, null, 0, 0.25);
    poly(g, pts, fill, stroke, 3.5);
    if (fill === P.star) {
      g.fillStyle(0xffffff, 0.45);
      g.fillEllipse(24, 22, 12, 7);
    }
  };
  makeTexture(scene, ICON.star, 64, 64, star(P.star, P.outline));
  makeTexture(scene, ICON.starEmpty, 64, 64, star(P.starEmpty, P.outline));
}
