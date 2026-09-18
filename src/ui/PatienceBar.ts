import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import { lerpColor } from '../utils/color';

const H = 7;

/** Small rounded bar that shifts green → yellow → red as `ratio` drops. */
export class PatienceBar extends Phaser.GameObjects.Container {
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly barWidth: number) {
    super(scene, x, y);
    const bg = scene.add
      .rectangle(0, 0, barWidth, H, P.ringBg)
      .setStrokeStyle(1.5, P.outline);
    this.fill = scene.add
      .rectangle(-barWidth / 2 + 1, 0, barWidth - 2, H - 3, P.good)
      .setOrigin(0, 0.5);
    this.add([bg, this.fill]);
    scene.add.existing(this);
  }

  setRatio(ratio: number): void {
    const r = Phaser.Math.Clamp(ratio, 0, 1);
    this.fill.width = Math.max(1, (this.barWidth - 2) * r);
    const color = r > 0.5 ? lerpColor(P.warn, P.good, (r - 0.5) * 2) : lerpColor(P.bad, P.warn, r * 2);
    this.fill.setFillStyle(color);
  }
}
