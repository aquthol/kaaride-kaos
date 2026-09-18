import Phaser from 'phaser';
import { DEPTH } from '../world/depth';

type Scalable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform;

/** Small camera shake for negative events. */
export function shakeCamera(scene: Phaser.Scene, intensity = 0.006, duration = 200): void {
  scene.cameras.main.shake(duration, intensity);
}

/** Squash-and-release bump around the object's current scale. */
export function bump(scene: Phaser.Scene, target: Scalable, amount = 0.12, duration = 90): void {
  // Remember the resting scale so overlapping bumps don't drift
  const baseX: number = target.getData('baseScaleX') ?? target.scaleX;
  const baseY: number = target.getData('baseScaleY') ?? target.scaleY;
  target.setData('baseScaleX', baseX);
  target.setData('baseScaleY', baseY);
  target.setScale(baseX * (1 + amount), baseY * (1 - amount));
  scene.tweens.add({
    targets: target,
    scaleX: baseX,
    scaleY: baseY,
    duration: duration * 3,
    ease: 'Elastic.easeOut',
  });
}

/** Press-photographer flash: a white wash over the screen and a tiny jolt. */
export function cameraFlash(scene: Phaser.Scene): void {
  const cam = scene.cameras.main;
  const flash = scene.add
    .rectangle(0, 0, cam.width, cam.height, 0xffffff, 0.85)
    .setOrigin(0)
    .setDepth(DEPTH.hud + 20)
    .setScrollFactor(0);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 260,
    ease: 'Quad.easeOut',
    onComplete: () => flash.destroy(),
  });
  cam.shake(120, 0.004);
}

/** Scale an object in from zero with an overshoot. */
export function popIn(scene: Phaser.Scene, target: Scalable, delay = 0, duration = 320): Phaser.Tweens.Tween {
  const sx = target.scaleX;
  const sy = target.scaleY;
  target.setScale(0);
  return scene.tweens.add({ targets: target, scaleX: sx, scaleY: sy, delay, duration, ease: 'Back.easeOut' });
}
