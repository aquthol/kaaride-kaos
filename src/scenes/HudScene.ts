import Phaser from 'phaser';
import { ICON } from '../art/drawIcons';
import { makeTexture } from '../art/textureUtil';
import { AudioEngine } from '../audio/AudioEngine';
import { VIEW } from '../config/gameConfig';
import { PALETTE as P, css } from '../config/palette';
import { GameEvent } from '../systems/events';
import { createMuteButton } from '../ui/MuteButton';
import { textStyle } from '../ui/textStyle';
import type { GameScene } from './GameScene';

const PILL_H = 44;
/** Seconds left when the timer starts pulsing red. */
const URGENT_AT = 20;
/** Seconds left when the countdown starts ticking. */
const TICK_FROM = 10;

interface Pill {
  root: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Image;
  width: number;
}

/** Overlay scene: money, timer and served/angry counters as rounded pills. */
export class HudScene extends Phaser.Scene {
  private timeText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private servedText!: Phaser.GameObjects.Text;
  private angryText!: Phaser.GameObjects.Text;
  private timePill!: Pill;
  private moneyPill!: Pill;
  private gameScene!: GameScene;
  private lastMoney = 0;
  private lastSecond = -1;
  private urgent = false;

  constructor() {
    super('Hud');
  }

  create(): void {
    this.gameScene = this.scene.get('Game') as GameScene;
    this.lastMoney = 0;
    this.lastSecond = -1;
    this.urgent = false;
    const midY = VIEW.hudHeight / 2;

    this.moneyPill = this.makePill(130, midY, 190, ICON.coin);
    this.moneyText = this.addPillText(this.moneyPill, 24);

    this.timePill = this.makePill(VIEW.width / 2, midY, 170, ICON.clock);
    this.timeText = this.addPillText(this.timePill, 26);

    const counters = this.makePill(VIEW.width - 182, midY, 200, ICON.happy);
    createMuteButton(this, VIEW.width - 44, midY, { size: 30 });
    this.servedText = this.addPillText(counters, 22, -46);
    const angryIcon = this.add.image(18, 0, ICON.angry).setDisplaySize(28, 28);
    counters.root.add(angryIcon);
    this.angryText = this.add.text(38, 0, '0', textStyle(22, css(P.text), '900')).setOrigin(0, 0.5);
    counters.root.add(this.angryText);

    this.gameScene.events.on(GameEvent.ScoreChanged, this.onScore, this);
    const s = this.gameScene.score;
    this.onScore(s.money, s.served, s.angry);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.gameScene.events.off(GameEvent.ScoreChanged, this.onScore, this);
    });

    // Slide the HUD in
    for (const pill of [this.moneyPill, this.timePill, counters]) {
      const y = pill.root.y;
      pill.root.y = -PILL_H;
      this.tweens.add({ targets: pill.root, y, duration: 450, ease: 'Back.easeOut', delay: 150 });
    }
  }

  private makePill(x: number, y: number, width: number, icon: string): Pill {
    const bg = this.add.image(0, 0, this.pillTexture(width, P.panel));
    const root = this.add.container(x, y, [bg]);
    root.add(this.add.image(-width / 2 + 26, 0, icon).setDisplaySize(30, 30));
    return { root, bg, width };
  }

  private drawPill(pill: Pill, fill: number): void {
    pill.bg.setTexture(this.pillTexture(pill.width, fill));
  }

  /** Baked pill background (shadow offset included), centered on the pill. */
  private pillTexture(w: number, fill: number): string {
    const key = `hud-pill-${w}-${fill.toString(16)}`;
    // Symmetric padding keeps the texture center on the pill center
    const pad = 6;
    makeTexture(this, key, w + pad * 2, PILL_H + pad * 2, (g) => {
      g.translateCanvas(pad, pad);
      g.fillStyle(P.shadow, 0.35);
      g.fillRoundedRect(2, 4, w, PILL_H, PILL_H / 2);
      g.fillStyle(fill, 1);
      g.fillRoundedRect(0, 0, w, PILL_H, PILL_H / 2);
      g.lineStyle(2.5, P.outline, 1);
      g.strokeRoundedRect(0, 0, w, PILL_H, PILL_H / 2);
    });
    return key;
  }

  private addPillText(pill: Pill, size: number, x = 14): Phaser.GameObjects.Text {
    const t = this.add.text(x, 1, '', textStyle(size, css(P.text), '900')).setOrigin(0.5);
    pill.root.add(t);
    return t;
  }

  private onScore(money: number, served: number, angry: number): void {
    this.moneyText.setText(`€${money}`);
    this.servedText.setText(`${served}`);
    this.angryText.setText(`${angry}`);
    if (money !== this.lastMoney) {
      const gained = money > this.lastMoney;
      this.lastMoney = money;
      this.moneyText.setColor(css(gained ? 0x2f9e57 : P.bad));
      this.tweens.killTweensOf(this.moneyPill.root);
      this.moneyPill.root.setScale(gained ? 1.18 : 0.9);
      this.tweens.add({ targets: this.moneyPill.root, scale: 1, duration: 380, ease: 'Elastic.easeOut' });
      this.time.delayedCall(450, () => this.moneyText.setColor(css(P.text)));
    }
  }

  update(): void {
    const remaining = Math.ceil(this.gameScene.remaining);
    if (remaining === this.lastSecond) return;
    this.lastSecond = remaining;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    this.timeText.setText(`${m}:${s.toString().padStart(2, '0')}`);

    // Soft tick for each of the final seconds
    if (remaining <= TICK_FROM && remaining > 0) AudioEngine.get().play('tick');

    const urgent = remaining <= URGENT_AT;
    if (urgent !== this.urgent) {
      this.urgent = urgent;
      this.drawPill(this.timePill, urgent ? P.bad : P.panel);
      this.timeText.setColor(css(urgent ? P.textLight : P.text));
    }
    if (urgent && remaining > 0) {
      this.timePill.root.setScale(1.15);
      this.tweens.add({ targets: this.timePill.root, scale: 1, duration: 300, ease: 'Quad.easeOut' });
    }
  }
}
