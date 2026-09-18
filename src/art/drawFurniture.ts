import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import { TEX } from './textureKeys';
import { circle, ellipse, leaf, makeTexture, poly, rrect } from './textureUtil';

type G = Phaser.GameObjects.Graphics;

/** Highlight strip for a glossy look. */
function gloss(g: G, x: number, y: number, w: number, h: number, alpha = 0.3): void {
  g.fillStyle(0xffffff, alpha);
  g.fillRoundedRect(x, y, w, h, Math.min(h / 2, 4));
}

export function generateFurnitureTextures(scene: Phaser.Scene): void {
  // Backwash sink: basin at the back, reclined chair in front. Base line = bottom edge.
  makeTexture(scene, TEX.sink, 100, 124, (g) => {
    rrect(g, 10, 12, 80, 48, 12, P.woodLight);
    rrect(g, 10, 40, 80, 20, 8, P.wood);
    ellipse(g, 50, 30, 74, 36, P.ceramic);
    ellipse(g, 50, 32, 56, 24, P.ceramicShade, null);
    ellipse(g, 50, 35, 40, 13, P.ceramicDeep, null);
    rrect(g, 46, 6, 8, 18, 3, P.chrome);
    rrect(g, 38, 3, 24, 7, 3, P.chrome);
    rrect(g, 20, 50, 60, 26, 10, P.washDark);
    rrect(g, 14, 66, 72, 34, 12, P.wash);
    gloss(g, 22, 70, 56, 7);
    rrect(g, 6, 70, 13, 28, 6, P.washDark);
    rrect(g, 81, 70, 13, 28, 6, P.washDark);
    rrect(g, 38, 98, 24, 12, 4, P.chromeDark);
    ellipse(g, 50, 114, 56, 14, P.chrome);
    gloss(g, 34, 109, 30, 4, 0.5);
  });

  // Barber chair
  makeTexture(scene, TEX.cutChair, 92, 118, (g) => {
    rrect(g, 20, 4, 52, 62, 18, P.cut);
    rrect(g, 30, 14, 32, 40, 12, P.cutDark, null);
    circle(g, 38, 26, 2, P.outline, null);
    circle(g, 54, 26, 2, P.outline, null);
    circle(g, 46, 40, 2, P.outline, null);
    gloss(g, 26, 8, 38, 6);
    rrect(g, 12, 58, 68, 30, 12, P.cut);
    gloss(g, 20, 62, 50, 6);
    rrect(g, 3, 52, 15, 30, 6, P.chrome);
    rrect(g, 74, 52, 15, 30, 6, P.chrome);
    rrect(g, 41, 86, 10, 16, 3, P.chromeDark);
    rrect(g, 28, 90, 36, 6, 3, P.chromeDark);
    ellipse(g, 46, 106, 66, 18, P.chrome);
    gloss(g, 26, 100, 40, 4, 0.55);
  });

  // Dryer chair with pole (the hood is a separate texture drawn above the customer)
  makeTexture(scene, TEX.dryer, 100, 132, (g) => {
    rrect(g, 80, 16, 9, 104, 3, P.chromeDark);
    ellipse(g, 84, 122, 30, 12, P.chrome);
    rrect(g, 20, 44, 56, 44, 14, P.dryDark);
    rrect(g, 12, 78, 72, 30, 12, P.dry);
    gloss(g, 20, 82, 54, 6);
    rrect(g, 4, 72, 13, 28, 6, P.dryDark);
    rrect(g, 79, 72, 13, 28, 6, P.dryDark);
    rrect(g, 20, 106, 8, 18, 3, P.woodDark);
    rrect(g, 68, 106, 8, 18, 3, P.woodDark);
  });

  makeTexture(scene, TEX.dryerHood, 96, 56, (g) => {
    rrect(g, 72, 20, 22, 9, 4, P.chromeDark);
    ellipse(g, 44, 26, 80, 50, P.dry);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(36, 16, 40, 16);
    rrect(g, 3, 34, 82, 16, 8, P.dryDark);
    g.fillStyle(0x3d2f63, 0.45);
    g.fillEllipse(44, 44, 60, 7);
    g.lineStyle(2, P.dryDark, 0.8);
    g.lineBetween(20, 22, 30, 12);
    g.lineBetween(58, 12, 68, 22);
  });

  // Checkout counter with register
  makeTexture(scene, TEX.counter, 176, 112, (g) => {
    rrect(g, 104, 6, 54, 36, 8, P.checkout);
    rrect(g, 110, 10, 42, 12, 4, 0x6c9a8f);
    g.fillStyle(0xd6fff2, 0.9);
    g.fillRect(114, 14, 20, 4);
    rrect(g, 14, 18, 26, 20, 5, 0x6d6a80);
    rrect(g, 18, 22, 18, 7, 2, 0xa9d6f5, null);
    rrect(g, 4, 32, 168, 24, 10, P.woodLight);
    rrect(g, 8, 48, 160, 60, 10, P.wood);
    rrect(g, 20, 58, 64, 40, 6, P.woodDark, null, 0, 0.45);
    rrect(g, 92, 58, 64, 40, 6, P.woodDark, null, 0, 0.45);
    gloss(g, 12, 35, 150, 5, 0.45);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        rrect(g, 114 + i * 11, 26 + j * 7, 8, 5, 2, P.white, null);
      }
    }
    circle(g, 62, 24, 7, P.coin, P.coinDark, 1.5);
    circle(g, 72, 28, 7, P.coin, P.coinDark, 1.5);
  });

  // Colour station: stool with a dye trolley and bowls of colour
  makeTexture(scene, TEX.colourStation, 104, 118, (g) => {
    // Trolley behind the stool
    rrect(g, 56, 26, 44, 46, 8, P.chrome);
    rrect(g, 60, 34, 36, 12, 4, P.chromeDark, null);
    rrect(g, 60, 52, 36, 12, 4, P.chromeDark, null);
    // Three bowls of dye on top of the trolley
    [P.cut, P.dry, P.colour].forEach((dye, i) => {
      const x = 66 + i * 14;
      ellipse(g, x, 24, 15, 9, P.white, P.outline, 1.5);
      ellipse(g, x, 24, 10, 5.5, dye, null);
    });
    rrect(g, 74, 70, 8, 30, 3, P.chromeDark);
    ellipse(g, 78, 102, 26, 9, P.chrome);
    // Stool in front
    rrect(g, 10, 44, 50, 22, 10, P.colourDark);
    rrect(g, 6, 58, 58, 28, 12, P.colour);
    gloss(g, 14, 62, 42, 6);
    rrect(g, 14, 84, 8, 20, 3, P.woodDark);
    rrect(g, 48, 84, 8, 20, 3, P.woodDark);
    rrect(g, 12, 100, 46, 7, 3, P.woodDark);
    // Brush resting on the stool
    rrect(g, 24, 38, 5, 18, 2, P.woodLight, P.outline, 1.5);
    poly(g, [[22, 34], [31, 34], [29, 42], [24, 42]], P.cutDark, P.outline, 1.5);
  });

  // Dust sheet for stations that are closed on this level
  makeTexture(scene, TEX.cover, 120, 96, (g) => {
    poly(
      g,
      [
        [8, 26],
        [24, 12],
        [60, 6],
        [96, 12],
        [112, 26],
        [112, 78],
        [96, 90],
        [60, 94],
        [24, 90],
        [8, 78],
      ],
      0xe7e2dc,
      P.outline,
      2.5,
    );
    g.fillStyle(0xd3ccc4, 0.9);
    g.fillEllipse(60, 84, 88, 16);
    g.lineStyle(2, 0xc9c1b8, 1);
    g.lineBetween(30, 26, 26, 82);
    g.lineBetween(60, 20, 60, 88);
    g.lineBetween(90, 26, 94, 82);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(44, 30, 34, 10);
  });

  // Waiting armchair
  makeTexture(scene, TEX.waitChair, 76, 88, (g) => {
    rrect(g, 12, 6, 52, 48, 16, P.wait);
    g.lineStyle(2, P.waitDark, 0.8);
    g.lineBetween(38, 14, 38, 44);
    gloss(g, 18, 10, 40, 6);
    rrect(g, 12, 44, 52, 28, 10, P.waitLight);
    rrect(g, 2, 30, 16, 44, 8, P.waitDark);
    rrect(g, 58, 30, 16, 44, 8, P.waitDark);
    rrect(g, 12, 72, 7, 14, 3, P.woodDark);
    rrect(g, 57, 72, 7, 14, 3, P.woodDark);
  });

  makeTexture(scene, TEX.plant, 64, 100, (g) => {
    const leaves: [number, number, number][] = [
      [-2.2, 40, 14],
      [-1.9, 46, 16],
      [-1.57, 50, 16],
      [-1.25, 46, 16],
      [-0.9, 40, 14],
      [-2.6, 30, 12],
      [-0.5, 30, 12],
    ];
    leaves.forEach(([a, len, w], i) =>
      leaf(g, 32, 64, len, w, a, i % 2 === 0 ? P.plantLeaf : P.plantLeafDark),
    );
    rrect(g, 12, 58, 40, 10, 4, P.potDark);
    poly(g, [[15, 66], [49, 66], [44, 96], [20, 96]], P.pot);
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(21, 70, 4, 20);
  });

  makeTexture(scene, TEX.bigPlant, 84, 136, (g) => {
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI + 0.25 + (i / 10) * (Math.PI - 0.5);
      const len = 50 + Math.sin(i * 1.7) * 12 + (Math.abs(a + Math.PI / 2) < 0.6 ? 20 : 0);
      leaf(g, 42, 94, len, 18, a, i % 2 === 0 ? P.plantLeafDark : P.plantLeaf);
    }
    rrect(g, 16, 88, 52, 12, 5, 0xe6ddd2);
    poly(g, [[20, 98], [64, 98], [58, 132], [26, 132]], 0xf6efe6);
    g.lineStyle(2, P.cut, 0.8);
    g.lineBetween(24, 110, 60, 110);
  });

  // Small round coffee table with magazines
  makeTexture(scene, TEX.table, 92, 70, (g) => {
    rrect(g, 42, 30, 8, 30, 3, P.woodDark);
    ellipse(g, 46, 62, 44, 12, P.woodDark);
    ellipse(g, 46, 28, 86, 44, P.woodLight);
    ellipse(g, 46, 25, 76, 34, P.wood, null, 0, 0.25);
    poly(g, [[22, 20], [46, 14], [52, 30], [28, 36]], P.cut, P.outline, 1.5);
    poly(g, [[44, 22], [66, 16], [72, 30], [50, 36]], P.wash, P.outline, 1.5);
    g.lineStyle(1.5, P.white, 0.9);
    g.lineBetween(49, 25, 64, 21);
    g.lineBetween(51, 29, 66, 25);
  });

  // Central product display island
  makeTexture(scene, TEX.display, 124, 110, (g) => {
    const products: [number, number, number][] = [
      [24, 34, P.cut],
      [40, 26, P.wash],
      [56, 38, P.dry],
      [72, 30, P.checkout],
      [88, 34, 0xa8e0a0],
    ];
    for (const [x, h, c] of products) {
      rrect(g, x, 50 - h, 14, h, 5, c, P.outline, 1.5);
      rrect(g, x + 4, 46 - h, 6, 6, 2, P.white, P.outline, 1.5);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(x + 3, 54 - h, 2, h - 12);
    }
    ellipse(g, 62, 54, 116, 40, P.white);
    ellipse(g, 62, 52, 96, 26, P.panelShade, null);
    rrect(g, 14, 56, 96, 40, 12, P.accent);
    g.fillStyle(P.accentDark, 1);
    g.fillRect(16, 80, 92, 4);
    ellipse(g, 62, 98, 96, 18, P.accentDark);
    gloss(g, 22, 62, 12, 26, 0.35);
  });

  // Pearl necklace accessory for Proua Helgi
  makeTexture(scene, TEX.pearls, 30, 16, (g) => {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = 3 + t * 24;
      const y = 3 + Math.sin(t * Math.PI) * 9;
      circle(g, x, y, 2.4, 0xfff8f0, 0xbfa9b8, 1);
    }
  });
}
