import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import { TEX } from './textureKeys';
import { circle, ellipse, makeTexture, poly, rrect } from './textureUtil';

/**
 * The dog that follows its owner around the salon. Drawn in the same
 * chunky-outline style as the people, anchored at its feet (bottom center).
 */
export function generatePetTextures(scene: Phaser.Scene): void {
  makeTexture(scene, TEX.dog, 46, 38, (g) => {
    // Tail
    poly(g, [[3, 20], [10, 16], [12, 22], [6, 26]], P.dogFurDark, P.outline, 2);
    // Body and legs
    rrect(g, 7, 16, 26, 14, 7, P.dogFur);
    rrect(g, 10, 26, 6, 10, 3, P.dogFurDark);
    rrect(g, 24, 26, 6, 10, 3, P.dogFurDark);
    // Head
    circle(g, 33, 16, 10, P.dogFur);
    // Ears
    poly(g, [[27, 8], [33, 6], [31, 16]], P.dogFurDark, P.outline, 2);
    poly(g, [[39, 6], [44, 10], [38, 16]], P.dogFurDark, P.outline, 2);
    // Muzzle and face
    ellipse(g, 37, 20, 14, 9, 0xf2ddc4);
    circle(g, 41, 18, 2.4, P.dogNose, null);
    circle(g, 31, 13, 1.9, P.dogNose, null);
    circle(g, 38, 13, 1.9, P.dogNose, null);
    g.lineStyle(1.6, P.outline, 1);
    g.lineBetween(37, 22, 37, 24);
    // Collar
    rrect(g, 24, 13, 5, 10, 2, P.accent, P.outline, 1.5);
  });
}
