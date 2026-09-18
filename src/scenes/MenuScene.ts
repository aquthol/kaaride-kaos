import Phaser from 'phaser';
import { FX } from '../art/drawFx';
import { ICON } from '../art/drawIcons';
import { TEX } from '../art/textureKeys';
import { AudioEngine } from '../audio/AudioEngine';
import { MAX_PLAYERS, PLAYER_PROFILES } from '../config/controls';
import { CUSTOMER_TYPES } from '../config/customerTypes';
import { VIEW } from '../config/gameConfig';
import { PALETTE as P, css } from '../config/palette';
import { TEXT } from '../config/texts';
import { CharacterView } from '../entities/CharacterView';
import { KARL_LOOK, PLAYER_COLORS, RASMUS_LOOK, randomCustomerLook } from '../entities/looks';
import { createButton } from '../ui/Button';
import { keyCap } from '../ui/KeyCap';
import { createMuteButton } from '../ui/MuteButton';
import { panel } from '../ui/Panel';
import { textStyle } from '../ui/textStyle';

const PANEL = { x: VIEW.width / 2, y: 430, w: 860, h: 310 };
const MODE_Y = 212;

export class MenuScene extends Phaser.Scene {
  private characters: CharacterView[] = [];
  private starting = false;
  private playerCount = 1;
  /** Everything in the player-2 column, dimmed while playing solo. */
  private p2Column: Phaser.GameObjects.GameObject[] = [];
  private modePills: { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; w: number; h: number }[] = [];
  private karl!: CharacterView;
  private guest!: CharacterView;

  constructor() {
    super('Menu');
  }

  create(): void {
    this.characters = [];
    this.p2Column = [];
    this.modePills = [];
    this.starting = false;
    this.playerCount = 1;
    const cx = VIEW.width / 2;

    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, TEX.floor).setOrigin(0);
    this.add.rectangle(0, 0, VIEW.width, VIEW.height, P.hudBand, 0.35).setOrigin(0);
    this.addAmbientParticles();

    this.addTitle(cx);
    this.addModeSelector(cx);
    this.addPanel();
    this.addCharacters();
    this.setPlayerCount(1);

    const button = createButton(this, cx, 648, TEXT.start, () => this.start(), { width: 260, fontSize: 26 });
    this.tweens.add({ targets: button, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add
      .text(cx, 696, TEXT.startHint, textStyle(14, css(P.textLight), '700'))
      .setOrigin(0.5)
      .setAlpha(0.85);

    createMuteButton(this, 54, 44, { withLabel: true });

    const kb = this.input.keyboard!;
    kb.on('keydown-ONE', () => this.setPlayerCount(1));
    kb.on('keydown-TWO', () => this.setPlayerCount(2));
    kb.once('keydown-ENTER', () => this.start());
    kb.once('keydown-SPACE', () => this.start());

    this.cameras.main.fadeIn(350, 46, 34, 48);
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;
    for (const c of this.characters) c.animate(dt, time, false, 0, 1);
  }

  private setPlayerCount(count: number): void {
    const next = Phaser.Math.Clamp(count, 1, MAX_PLAYERS);
    if (next !== this.playerCount) AudioEngine.get().play('uiSelect');
    this.playerCount = next;
    this.modePills.forEach((pill, i) => this.drawModePill(pill, i + 1 === this.playerCount));
    // The second column only matters in co-op
    for (const o of this.p2Column) (o as Phaser.GameObjects.Image).setAlpha(this.playerCount > 1 ? 1 : 0.32);
    this.karl.setVisible(this.playerCount > 1);
    this.guest.setVisible(this.playerCount === 1);
  }

  private start(): void {
    if (this.starting) return;
    this.starting = true;
    const players = this.playerCount;
    this.cameras.main.fadeOut(250, 46, 34, 48);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      this.scene.start('LevelSelect', { players }),
    );
  }

  private addModeSelector(cx: number): void {
    const w = 176;
    const h = 46;
    this.add
      .text(cx, MODE_Y - 36, TEXT.modeTitle, textStyle(17, css(P.textLight), '800'))
      .setOrigin(0.5)
      .setStroke(css(P.outline), 5);
    TEXT.modes.forEach((label, i) => {
      const x = cx + (i === 0 ? -w / 2 - 6 : w / 2 + 6);
      const bg = this.add.graphics({ x, y: MODE_Y });
      const text = this.add.text(x, MODE_Y, label, textStyle(19, css(P.text), '900')).setOrigin(0.5);
      const pill = { bg, label: text, w, h };
      this.modePills.push(pill);
      this.drawModePill(pill, i === 0);
      this.add
        .zone(x, MODE_Y, w, h)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.setPlayerCount(i + 1));
    });
  }

  private drawModePill(
    pill: { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; w: number; h: number },
    selected: boolean,
  ): void {
    const { bg, w, h } = pill;
    bg.clear();
    bg.fillStyle(P.shadow, 0.3);
    bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, h / 2);
    bg.fillStyle(selected ? P.accent : P.panel, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    bg.lineStyle(selected ? 3.5 : 2.5, P.outline, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    pill.label.setColor(css(selected ? P.textLight : P.text));
  }

  private addTitle(cx: number): void {
    const title = this.add
      .text(cx, 86, TEXT.title, textStyle(52, css(P.textLight), '900'))
      .setOrigin(0.5)
      .setStroke(css(P.outline), 10)
      .setShadow(0, 6, css(P.shadow), 0, true, true);
    this.tweens.add({ targets: title, y: 94, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: title, angle: { from: -1.5, to: 1.5 }, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Snipping scissors either side of the title
    for (const side of [-1, 1]) {
      const icon = this.add.image(cx + side * (title.width / 2 + 48), 90, ICON.cut).setScale(1.8);
      this.tweens.add({
        targets: icon,
        angle: { from: -side * 14, to: side * 14 },
        scale: { from: 1.8, to: 2 },
        duration: 380,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.add
      .text(cx, 138, TEXT.subtitle, textStyle(21, css(P.textLight), '800'))
      .setOrigin(0.5)
      .setStroke(css(P.outline), 6);
  }

  private addPanel(): void {
    const { x, y, w, h } = PANEL;
    panel(this, x, y, w, h, 26);
    const left = x - w / 2 + 34;
    const top = y - h / 2;
    const divider = x + 60;
    const p1X = left + 178;
    const p2X = left + 286;

    // Controls table: action | player 1 key | player 2 key
    this.add.text(left, top + 22, TEXT.controlsTitle, textStyle(23, css(P.text), '900')).setOrigin(0, 0);
    this.add.text(left, top + 62, TEXT.actionColumn, textStyle(14, css(P.starEmpty), '800')).setOrigin(0, 0.5);
    this.add
      .text(p1X, top + 62, PLAYER_PROFILES[0].name, textStyle(15, css(PLAYER_COLORS[0]), '900'))
      .setOrigin(0, 0.5);
    this.p2Column.push(
      this.add
        .text(p2X, top + 62, PLAYER_PROFILES[1].name, textStyle(15, css(PLAYER_COLORS[1]), '900'))
        .setOrigin(0, 0.5),
    );

    TEXT.controls.forEach((row, i) => {
      const rowY = top + 96 + i * 36;
      this.add.text(left, rowY, row.action, textStyle(16, css(P.text), '700')).setOrigin(0, 0.5);
      keyCap(this, p1X, rowY, row.p1);
      this.p2Column.push(keyCap(this, p2X, rowY, row.p2));
    });

    const g = this.add.graphics();
    g.lineStyle(2, P.panelShade, 1);
    g.lineBetween(divider, top + 22, divider, top + 232);

    // How the salon works; the recipes themselves live on the level select
    const rx = divider + 30;
    this.add.text(rx, top + 22, TEXT.goalTitle, textStyle(23, css(P.text), '900')).setOrigin(0, 0);
    TEXT.goalSteps.forEach((line, i) => {
      const rowY = top + 76 + i * 38;
      this.add.image(rx + 14, rowY, [ICON.wash, ICON.cut, ICON.coin][i]).setDisplaySize(28, 28);
      this.add.text(rx + 40, rowY, line, textStyle(16, css(P.text), '700')).setOrigin(0, 0.5);
    });

    this.add
      .text(x, top + 258, TEXT.howTo, {
        ...textStyle(15, css(P.text), '700'),
        wordWrap: { width: w - 80 },
        align: 'center',
      })
      .setOrigin(0.5, 0.5);
  }

  private addCharacters(): void {
    const rasmus = new CharacterView(this, 106, 616, RASMUS_LOOK).setScale(2.2);
    // The right-hand slot shows a customer in solo play and Karl in co-op
    this.guest = new CharacterView(
      this,
      VIEW.width - 106,
      616,
      randomCustomerLook((CUSTOMER_TYPES.find((t) => t.id === 'helgi') ?? CUSTOMER_TYPES[0]).look),
    ).setScale(2.2);
    this.karl = new CharacterView(this, VIEW.width - 106, 616, KARL_LOOK).setScale(2.2);
    this.guest.faceTowards(-1);
    this.karl.faceTowards(-1);
    this.characters.push(rasmus, this.guest, this.karl);

    const scissors = this.add.image(148, 572, ICON.cut).setScale(1.3);
    this.tweens.add({ targets: scissors, angle: { from: -20, to: 20 }, duration: 260, yoyo: true, repeat: -1 });
    this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: () => {
        const right = this.playerCount > 1 ? this.karl : this.guest;
        this.tweens.add({ targets: right, y: 596, duration: 160, yoyo: true, ease: 'Quad.easeOut' });
        right.punch(0.15);
      },
    });
  }

  private addAmbientParticles(): void {
    // Hair clippings drifting down through the scene
    this.add.particles(0, 0, FX.snip, {
      x: { min: 0, max: VIEW.width },
      y: -10,
      lifespan: 9000,
      speedY: { min: 30, max: 70 },
      speedX: { min: -20, max: 20 },
      rotate: { start: 0, end: 360 },
      scale: { min: 1, max: 1.8 },
      alpha: { start: 0.8, end: 0.2 },
      tint: [...P.hairColors],
      frequency: 260,
    });
    // Soft bubbles rising
    this.add.particles(0, 0, FX.puff, {
      x: { min: 0, max: VIEW.width },
      y: VIEW.height + 10,
      lifespan: 8000,
      speedY: { min: -60, max: -25 },
      scale: { min: 0.2, max: 0.6 },
      alpha: { start: 0.45, end: 0 },
      frequency: 420,
    });
  }
}
