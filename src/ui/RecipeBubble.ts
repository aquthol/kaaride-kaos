import Phaser from 'phaser';
import { ICON, STEP_COLOR, STEP_ICON } from '../art/drawIcons';
import { makeTexture } from '../art/textureUtil';
import { PALETTE as P, css } from '../config/palette';
import type { StepKind } from '../types';
import { DEPTH } from '../world/depth';
import { textStyle } from './textStyle';

const ICON_SIZE = 22;
const GAP = 2;
const PAD = 7;
const TAIL = 7;

/**
 * Speech bubble listing the recipe steps. Done steps are dimmed and ticked,
 * the next step pulses. When everything is done it shows a coin (go to checkout).
 * The container origin is the tail tip.
 */
export class RecipeBubble extends Phaser.GameObjects.Container {
  private readonly highlight: Phaser.GameObjects.Arc;
  private readonly icons: Phaser.GameObjects.Image[] = [];
  private readonly ticks: Phaser.GameObjects.Image[] = [];
  private readonly coin: Phaser.GameObjects.Image;
  private readonly iconY: number;
  private stepIndex = 0;
  /** Height of the bubble body (without tail); extra rows can be added below the icons. */
  readonly bodyHeight: number;
  readonly bodyWidth: number;

  constructor(
    scene: Phaser.Scene,
    private readonly steps: readonly StepKind[],
    name?: string,
    extraHeight = 0,
    /** Tints the colour step with the shade the customer wants. */
    dyeColor: number | null = null,
  ) {
    super(scene, 0, 0);
    const n = steps.length;
    this.bodyWidth = PAD * 2 + n * ICON_SIZE + (n - 1) * GAP;
    this.bodyHeight = PAD * 2 + ICON_SIZE + extraHeight;
    const top = -TAIL - this.bodyHeight;
    this.iconY = top + PAD + ICON_SIZE / 2;

    this.add(this.createBackground(scene, top));

    this.highlight = scene.add.circle(0, this.iconY, ICON_SIZE / 2 + 3, P.white, 0.8);
    this.add(this.highlight);

    steps.forEach((step, i) => {
      const x = -this.bodyWidth / 2 + PAD + ICON_SIZE / 2 + i * (ICON_SIZE + GAP);
      const icon = scene.add.image(x, this.iconY, STEP_ICON[step]).setDisplaySize(ICON_SIZE, ICON_SIZE);
      // A dot of the requested shade, rather than tinting the whole icon (which reads muddy)
      if (step === 'colour' && dyeColor !== null) {
        this.add(scene.add.circle(x + 8, this.iconY - 7, 4.5, dyeColor).setStrokeStyle(1.5, P.outline));
      }
      const tick = scene.add
        .image(x + 7, this.iconY + 6, ICON.check)
        .setDisplaySize(13, 13)
        .setVisible(false);
      this.icons.push(icon);
      this.ticks.push(tick);
    });
    this.add(this.icons);
    this.add(this.ticks);

    this.coin = scene.add.image(0, this.iconY, ICON.coin).setDisplaySize(ICON_SIZE + 2, ICON_SIZE + 2);
    this.coin.setVisible(false);
    this.add(this.coin);

    if (name) {
      const tag = scene.add
        .text(0, top - 3, name, textStyle(12, css(P.textLight), '900'))
        .setOrigin(0.5, 1)
        .setStroke(css(P.outline), 4);
      this.add(tag);
    }

    this.setDepth(DEPTH.bubble);
    this.setProgress(0);
    scene.add.existing(this);
  }

  /** Y of the first free row below the icons (for patience bars etc.). */
  get extraRowY(): number {
    return this.iconY + ICON_SIZE / 2 + 4;
  }

  /** The bubble shape is baked once per size and shared by all bubbles of that size. */
  private createBackground(scene: Phaser.Scene, top: number): Phaser.GameObjects.Image {
    const w = this.bodyWidth;
    const ox = w / 2 + 2;
    const oy = 2 - top;
    const key = `bubble-${w}x${this.bodyHeight}`;
    makeTexture(scene, key, w + 6, this.bodyHeight + TAIL + 6, (g) => {
      g.translateCanvas(ox, oy);
      this.drawBackground(g, top);
    });
    return scene.add.image(-ox, -oy, key).setOrigin(0);
  }

  private drawBackground(g: Phaser.GameObjects.Graphics, top: number): void {
    const w = this.bodyWidth;
    g.fillStyle(P.shadow, 0.18);
    g.fillRoundedRect(-w / 2 + 1, top + 3, w, this.bodyHeight, 10);
    g.fillStyle(P.panel, 1);
    g.lineStyle(2, P.outline, 1);
    g.fillRoundedRect(-w / 2, top, w, this.bodyHeight, 10);
    g.strokeRoundedRect(-w / 2, top, w, this.bodyHeight, 10);
    g.fillTriangle(-6, -TAIL - 1, 6, -TAIL - 1, 0, 0);
    g.beginPath();
    g.moveTo(-6, -TAIL);
    g.lineTo(0, 0);
    g.lineTo(6, -TAIL);
    g.strokePath();
    g.fillStyle(P.panel, 1);
    g.fillRect(-5, -TAIL - 2, 10, 3);
  }

  setProgress(stepIndex: number): void {
    this.stepIndex = stepIndex;
    const finished = stepIndex >= this.steps.length;
    this.icons.forEach((icon, i) => {
      icon.setVisible(!finished);
      icon.setAlpha(i < stepIndex ? 0.4 : 1);
      this.ticks[i].setVisible(!finished && i < stepIndex);
    });
    this.coin.setVisible(finished);
    if (finished) {
      this.highlight.setPosition(0, this.iconY).setFillStyle(P.coin, 0.6);
    } else {
      const next = this.icons[stepIndex];
      this.highlight.setPosition(next.x, this.iconY).setFillStyle(STEP_COLOR[this.steps[stepIndex]], 0.55);
    }
  }

  /** Pulse the next-step highlight. */
  tick(time: number): void {
    const s = 1 + Math.sin(time * 0.009) * 0.14;
    this.highlight.setScale(s);
    const target = this.stepIndex >= this.steps.length ? this.coin : this.icons[this.stepIndex];
    const base = ICON_SIZE + (target === this.coin ? 2 : 0);
    target.setDisplaySize(base * (1 + (s - 1) * 0.5), base * (1 + (s - 1) * 0.5));
  }
}
