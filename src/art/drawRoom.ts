import Phaser from 'phaser';
import { PALETTE } from '../config/palette';
import { TEX } from './textureKeys';
import { circle, ellipse, makeTexture, rrect, seededRandom } from './textureUtil';

export function generateRoomTextures(scene: Phaser.Scene): void {
  makeTexture(scene, TEX.pixel, 4, 4, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
  });

  // 2x2 checker tile with grout and speckles
  makeTexture(scene, TEX.floor, 128, 128, (g) => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        g.fillStyle((i + j) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB, 1);
        g.fillRect(i * 64, j * 64, 64, 64);
        g.fillStyle(0xffffff, 0.35);
        g.fillRect(i * 64 + 2, j * 64 + 2, 60, 2);
      }
    }
    for (let k = 0; k < 46; k++) {
      g.fillStyle(PALETTE.floorSpeck, 0.25 + rnd() * 0.3);
      g.fillCircle(rnd() * 128, rnd() * 128, 0.8 + rnd() * 1.1);
    }
    g.lineStyle(2, PALETTE.floorGrout, 0.7);
    g.strokeRect(0, 0, 64, 64);
    g.strokeRect(64, 64, 64, 64);
    g.strokeRect(64, 0, 64, 64);
    g.strokeRect(0, 64, 64, 64);
  });

  // soft layered shadow
  makeTexture(scene, TEX.shadow, 96, 36, (g) => {
    for (let i = 0; i < 7; i++) {
      const f = 1 - i * 0.12;
      g.fillStyle(PALETTE.shadow, 0.055);
      g.fillEllipse(48, 18, 94 * f, 34 * f);
    }
  });

  makeTexture(scene, TEX.doormat, 104, 40, (g) => {
    rrect(g, 2, 2, 100, 36, 8, PALETTE.doormat, PALETTE.doormatDark, 2);
    g.lineStyle(2, PALETTE.doormatDark, 0.8);
    for (let x = 12; x < 96; x += 8) g.lineBetween(x, 8, x, 32);
  });

  makeTexture(scene, 'rug-wait', 250, 250, (g) => {
    rrect(g, 3, 3, 244, 244, 40, PALETTE.rug, PALETTE.rugBorder, 5);
    g.lineStyle(2, PALETTE.rugBorder, 0.8);
    g.strokeRoundedRect(18, 18, 214, 214, 30);
    const rnd = seededRandom(3);
    for (let x = 36; x < 220; x += 26) {
      for (let y = 36; y < 220; y += 26) {
        g.fillStyle(PALETTE.rugDot, 0.5 + rnd() * 0.3);
        g.fillCircle(x, y, 2.5);
      }
    }
  });

  makeTexture(scene, 'rug-round', 260, 150, (g) => {
    ellipse(g, 130, 75, 254, 144, 0xf8d9e4, 0xe7a9c0, 5);
    ellipse(g, 130, 75, 200, 104, 0xfbe7ee, 0xe7a9c0, 2);
    ellipse(g, 130, 75, 120, 56, 0xf8d9e4, 0xe7a9c0, 2);
  });

  generateWallTextures(scene);
}

function generateWallTextures(scene: Phaser.Scene): void {
  makeTexture(scene, 'wall-mirror', 76, 96, (g) => {
    ellipse(g, 38, 48, 70, 90, PALETTE.gold, PALETTE.outline, 2);
    ellipse(g, 38, 48, 56, 76, PALETTE.glass, PALETTE.goldDark, 2);
    g.lineStyle(4, PALETTE.glassShine, 0.8);
    g.lineBetween(22, 40, 36, 22);
    g.lineStyle(2, PALETTE.glassShine, 0.7);
    g.lineBetween(26, 52, 46, 26);
    circle(g, 38, 5, 4, PALETTE.gold, PALETTE.outline, 1.5);
  });

  makeTexture(scene, 'wall-shelf', 160, 64, (g) => {
    const bottles: [number, number, number][] = [
      [14, 24, PALETTE.wash],
      [30, 30, PALETTE.cut],
      [46, 20, PALETTE.checkout],
      [70, 28, PALETTE.dry],
      [86, 22, 0xa8e0a0],
      [108, 30, PALETTE.wash],
      [124, 24, PALETTE.cut],
      [140, 18, 0xffb98a],
    ];
    for (const [x, h, c] of bottles) {
      rrect(g, x, 44 - h, 12, h, 4, c, PALETTE.outline, 1.5);
      rrect(g, x + 3, 40 - h, 6, 6, 2, PALETTE.white, PALETTE.outline, 1.5);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(x + 3, 48 - h, 2, h - 10);
    }
    rrect(g, 2, 44, 156, 10, 3, PALETTE.woodLight, PALETTE.outline, 2);
    rrect(g, 14, 54, 8, 8, 2, PALETTE.woodDark, PALETTE.outline, 1.5);
    rrect(g, 138, 54, 8, 8, 2, PALETTE.woodDark, PALETTE.outline, 1.5);
  });

  makeTexture(scene, 'wall-shelf-small', 90, 64, (g) => {
    rrect(g, 10, 20, 14, 24, 4, PALETTE.dry, PALETTE.outline, 1.5);
    rrect(g, 30, 14, 12, 30, 4, PALETTE.checkout, PALETTE.outline, 1.5);
    circle(g, 60, 30, 12, PALETTE.plantLeaf, PALETTE.outline, 1.5);
    rrect(g, 52, 32, 16, 12, 3, PALETTE.pot, PALETTE.outline, 1.5);
    rrect(g, 2, 44, 86, 10, 3, PALETTE.woodLight, PALETTE.outline, 2);
  });

  makeTexture(scene, 'wall-clock', 56, 56, (g) => {
    circle(g, 28, 28, 25, PALETTE.white, PALETTE.outline, 3);
    circle(g, 28, 28, 20, 0xfff3e0, null);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillStyle(PALETTE.outline, 1);
      g.fillCircle(28 + Math.cos(a) * 17, 28 + Math.sin(a) * 17, i % 3 === 0 ? 2 : 1);
    }
    g.lineStyle(3, PALETTE.outline, 1);
    g.lineBetween(28, 28, 28, 16);
    g.lineStyle(2, PALETTE.accent, 1);
    g.lineBetween(28, 28, 38, 32);
    circle(g, 28, 28, 2.5, PALETTE.outline, null);
  });

  makeTexture(scene, 'wall-window', 120, 84, (g) => {
    rrect(g, 2, 2, 116, 80, 10, PALETTE.wallTrim, PALETTE.outline, 2);
    rrect(g, 10, 10, 100, 64, 6, 0xbfe3f5, PALETTE.outline, 2);
    g.fillStyle(0xffffff, 0.8);
    g.fillEllipse(34, 30, 34, 12);
    g.fillEllipse(48, 26, 26, 12);
    g.fillEllipse(84, 50, 30, 10);
    g.lineStyle(3, PALETTE.wallTrim, 1);
    g.lineBetween(60, 10, 60, 74);
    g.lineBetween(10, 42, 110, 42);
    g.lineStyle(2, PALETTE.outline, 0.5);
    g.lineBetween(20, 64, 40, 20);
  });

  makeTexture(scene, 'wall-sign-wait', 150, 52, (g) => {
    g.lineStyle(2, PALETTE.outline, 1);
    g.lineBetween(40, 0, 40, 10);
    g.lineBetween(110, 0, 110, 10);
    rrect(g, 3, 8, 144, 40, 14, PALETTE.wait, PALETTE.outline, 2.5);
    rrect(g, 9, 13, 132, 8, 4, 0xffffff, null, 0, 0.35);
  });
}
