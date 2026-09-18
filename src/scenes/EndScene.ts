import Phaser from 'phaser';
import { FX } from '../art/drawFx';
import { ICON } from '../art/drawIcons';
import { AudioEngine } from '../audio/AudioEngine';
import { TEX } from '../art/textureKeys';
import { VIEW } from '../config/gameConfig';
import { getLevel, nextLevel, starsForMoney } from '../config/levels';
import { PALETTE as P, css } from '../config/palette';
import { TEXT } from '../config/texts';
import { Particles } from '../fx/Particles';
import { isUnlocked, recordResult } from '../systems/progress';
import { createButton } from '../ui/Button';
import { panel } from '../ui/Panel';
import { textStyle } from '../ui/textStyle';
import type { EndData } from './GameScene';

const STAR_DELAY = 650;
const STAR_STEP = 320;

export class EndScene extends Phaser.Scene {
  private leaving = false;

  constructor() {
    super('End');
  }

  create(data: EndData): void {
    this.leaving = false;
    const cx = VIEW.width / 2;
    const cy = VIEW.height / 2;
    const level = getLevel(data.levelId);
    const stars = starsForMoney(level, data.money);
    recordResult(level.id, stars, data.money);
    // The next level may have just unlocked with this result
    const next = nextLevel(level.id);
    const nextOpen = next !== null && isUnlocked(next.id);

    // Layers: background (-3, -2), coin rain (-1), card (0)
    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, TEX.floor).setOrigin(0).setDepth(-3);
    this.add.rectangle(0, 0, VIEW.width, VIEW.height, P.hudBand, 0.6).setOrigin(0).setDepth(-2);
    const fx = Particles.create(this);

    const root = this.add.container(0, 0);
    root.add(panel(this, cx, cy, 540, 560, 30));
    root.add(this.add.text(cx, cy - 244, TEXT.end.title, textStyle(38, css(P.text), '900')).setOrigin(0.5));
    root.add(
      this.add.text(cx, cy - 208, level.name, textStyle(19, css(P.accentDark), '800')).setOrigin(0.5),
    );

    // Stars in a gentle arc; filled ones pop in one by one
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * 84;
      const y = cy - 132 - (i === 1 ? 14 : 0);
      const size = i === 1 ? 84 : 70;
      root.add(this.add.image(x, y, ICON.starEmpty).setDisplaySize(size, size));
      if (i >= stars) continue;
      const star = this.add.image(x, y, ICON.star).setDisplaySize(size, size);
      const sx = star.scaleX;
      star.setScale(0).setAngle(-30);
      root.add(star);
      this.tweens.add({
        targets: star,
        scale: sx,
        angle: 0,
        delay: STAR_DELAY + i * STAR_STEP,
        duration: 420,
        ease: 'Back.easeOut',
        onStart: () => {
          fx.sparkle(x, y, 14);
          this.cameras.main.shake(90, 0.003);
          // One note per star, rising with each one
          AudioEngine.get().play('star', { pitch: 1 + i * 0.26 });
        },
      });
    }

    const rating = this.add
      .text(cx, cy - 64, TEXT.end.ratings[stars], textStyle(22, css(stars > 0 ? P.accentDark : P.starEmpty), '900'))
      .setOrigin(0.5)
      .setAlpha(0);
    root.add(rating);
    this.tweens.add({
      targets: rating,
      alpha: 1,
      y: rating.y - 4,
      delay: STAR_DELAY + stars * STAR_STEP + 150,
      duration: 300,
    });

    const values = [data.money, data.served, data.angry];
    const labels = [TEXT.end.money, TEXT.end.served, TEXT.end.angry];
    labels.forEach((label, i) => {
      const y = cy - 8 + i * 36;
      root.add(this.add.text(cx - 160, y, label, textStyle(20, css(P.text), '700')).setOrigin(0, 0.5));
      const value = this.add
        .text(cx + 160, y, i === 0 ? '€0' : '0', textStyle(22, css(i === 2 && data.angry > 0 ? P.bad : P.text), '900'))
        .setOrigin(1, 0.5);
      root.add(value);
      // Count up
      const counter = { v: 0 };
      this.tweens.add({
        targets: counter,
        v: values[i],
        delay: 250 + i * 120,
        duration: 700,
        ease: 'Cubic.easeOut',
        onUpdate: () => value.setText(`${i === 0 ? '€' : ''}${Math.round(counter.v)}`),
      });
    });

    // Buttons: retry, next level when it is open, and back to the menu
    let buttonY = cy + 122;
    if (nextOpen && next) {
      root.add(
        createButton(this, cx, buttonY, TEXT.nextLevel, () => this.go('Game', data.players, next.id), {
          width: 270,
          height: 54,
          fontSize: 22,
          fill: P.good,
          fillDark: 0x4a9c67,
        }),
      );
      buttonY += 62;
    }
    root.add(
      createButton(this, cx, buttonY, TEXT.retry, () => this.go('Game', data.players, level.id), {
        width: 270,
        height: 54,
        fontSize: 22,
      }),
    );
    buttonY += 62;
    root.add(
      createButton(this, cx, buttonY, TEXT.toMenu, () => this.go('Menu'), {
        width: 270,
        height: 54,
        fontSize: 20,
        fill: P.wash,
        fillDark: P.washDark,
      }),
    );
    root.add(
      this.add
        .text(cx, buttonY + 44, TEXT.end.keysHint, textStyle(13, css(P.starEmpty), '700'))
        .setOrigin(0.5),
    );

    // Slide the whole card in
    root.y = 60;
    root.alpha = 0;
    this.tweens.add({ targets: root, y: 0, alpha: 1, duration: 450, ease: 'Back.easeOut' });

    if (stars > 0) this.addCoinRain(stars);

    const kb = this.input.keyboard!;
    kb.once('keydown-ENTER', () => this.go('Game', data.players, level.id));
    kb.once('keydown-ESC', () => this.go('Menu'));
    this.cameras.main.fadeIn(250, 46, 34, 48);
  }

  private go(scene: 'Game' | 'Menu', players?: number, levelId?: string): void {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(220, 46, 34, 48);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      this.scene.start(scene, scene === 'Game' ? { players, levelId } : undefined),
    );
  }

  /** Celebration: coins falling behind the card, more for more stars. */
  private addCoinRain(stars: number): void {
    const emitter = this.add.particles(0, 0, FX.coin, {
      x: { min: 0, max: VIEW.width },
      y: -20,
      lifespan: 4000,
      speedY: { min: 120, max: 260 },
      speedX: { min: -30, max: 30 },
      rotate: { start: 0, end: 540 },
      scale: { min: 1, max: 1.8 },
      frequency: 220 / stars,
      emitting: false,
    });
    emitter.setDepth(-1);
    this.time.delayedCall(STAR_DELAY, () => emitter.start());
    this.time.delayedCall(STAR_DELAY + 2600, () => emitter.stop());
  }
}
