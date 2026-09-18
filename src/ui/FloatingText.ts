import Phaser from 'phaser';
import { css } from '../config/palette';
import { DEPTH } from '../world/depth';
import { textStyle } from './textStyle';

/** A short-lived rising, fading label (e.g. "+€12"). */
export function showFloatingText(scene: Phaser.Scene, x: number, y: number, text: string, color: number): void {
  const t = scene.add
    .text(x, y, text, textStyle(24, css(color), '900'))
    .setOrigin(0.5)
    .setDepth(DEPTH.floating)
    .setStroke('#ffffff', 4)
    .setScale(0.6);
  scene.tweens.add({ targets: t, scale: 1, duration: 140, ease: 'Back.easeOut' });
  scene.tweens.add({
    targets: t,
    y: y - 50,
    alpha: 0,
    duration: 850,
    delay: 150,
    ease: 'Cubic.easeIn',
    onComplete: () => t.destroy(),
  });
}
