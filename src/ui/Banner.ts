import Phaser from 'phaser';
import { VIEW } from '../config/gameConfig';
import { PALETTE as P, css } from '../config/palette';
import { DEPTH } from '../world/depth';
import { textStyle } from './textStyle';

/** Big centered announcement that pops in, holds and fades out. */
export function showBanner(scene: Phaser.Scene, text: string, color: number = P.accent, holdMs = 900): void {
  const label = scene.add
    .text(0, 0, text, textStyle(46, css(P.textLight), '900'))
    .setOrigin(0.5)
    .setStroke(css(P.outline), 8);
  const w = label.width + 70;
  const h = 84;
  const bg = scene.add.graphics();
  bg.fillStyle(P.shadow, 0.3);
  bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, h / 2);
  bg.fillStyle(color, 1);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  bg.lineStyle(4, P.outline, 1);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);

  const banner = scene.add
    .container(VIEW.width / 2, VIEW.height / 2 - 20, [bg, label])
    .setDepth(DEPTH.hud + 10)
    .setScale(0)
    .setAngle(-6);
  scene.tweens.chain({
    targets: banner,
    tweens: [
      { scale: 1, angle: 0, duration: 380, ease: 'Back.easeOut' },
      { scale: 1.04, duration: holdMs / 2, yoyo: true, ease: 'Sine.easeInOut' },
      { alpha: 0, y: banner.y - 40, duration: 260, ease: 'Quad.easeIn' },
    ],
    onComplete: () => banner.destroy(),
  });
}
