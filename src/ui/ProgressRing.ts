import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import { DEPTH } from '../world/depth';

const R = 15;

/** Circular progress indicator with an optional icon in the middle. Pops when it appears or changes icon. */
export class ProgressRing extends Phaser.GameObjects.Container {
  /** Holds the visuals; scaled for the pop so the outer scale stays free for pulsing. */
  private readonly inner: Phaser.GameObjects.Container;
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly icon: Phaser.GameObjects.Image;
  private lastKey = '';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.g = scene.add.graphics();
    this.icon = scene.add.image(0, 0, '__DEFAULT').setVisible(false);
    this.inner = scene.add.container(0, 0, [this.g, this.icon]);
    this.add(this.inner);
    this.setDepth(DEPTH.bubble - 1).setVisible(false);
    scene.add.existing(this);
  }

  /** Show a filling ring (ratio 0..1). */
  showProgress(ratio: number, color: number = P.ringFill): void {
    const key = `p${ratio.toFixed(3)}${color}`;
    this.reveal(false);
    this.icon.setVisible(false);
    if (key === this.lastKey) return;
    this.lastKey = key;
    const g = this.g;
    g.clear();
    g.fillStyle(P.shadow, 0.2);
    g.fillCircle(1, 2, R + 3);
    g.fillStyle(P.panel, 1);
    g.fillCircle(0, 0, R + 3);
    g.lineStyle(2, P.outline, 1);
    g.strokeCircle(0, 0, R + 3);
    g.lineStyle(6, P.panelShade, 1);
    g.strokeCircle(0, 0, R - 3);
    g.lineStyle(6, color, 1);
    g.beginPath();
    g.arc(0, 0, R - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Phaser.Math.Clamp(ratio, 0, 1), false);
    g.strokePath();
  }

  /** Show only an icon (e.g. a check mark or a warning). */
  showIcon(textureKey: string, size = 30): void {
    const changed = this.lastKey !== textureKey;
    this.reveal(changed);
    if (changed) {
      this.lastKey = textureKey;
      this.g.clear();
      this.icon.setTexture(textureKey).setDisplaySize(size, size);
    }
    this.icon.setVisible(true);
  }

  hide(): void {
    if (!this.visible) return;
    this.setVisible(false);
    this.lastKey = '';
  }

  private reveal(forcePop: boolean): void {
    if (this.visible && !forcePop) return;
    this.setVisible(true);
    this.scene.tweens.killTweensOf(this.inner);
    this.inner.setScale(0.3);
    this.scene.tweens.add({ targets: this.inner, scale: 1, duration: 260, ease: 'Back.easeOut' });
  }
}
