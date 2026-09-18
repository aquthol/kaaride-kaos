import Phaser from 'phaser';
import { ICON, STEP_ICON } from '../art/drawIcons';
import { TEX } from '../art/textureKeys';
import { AudioEngine } from '../audio/AudioEngine';
import { VIEW } from '../config/gameConfig';
import { LEVELS, type LevelDef } from '../config/levels';
import { PALETTE as P, css } from '../config/palette';
import { getRecipes } from '../config/recipes';
import { TEXT } from '../config/texts';
import { isUnlocked, bestMoneyFor, starsFor } from '../systems/progress';
import { createButton } from '../ui/Button';
import { createMuteButton } from '../ui/MuteButton';
import { panel } from '../ui/Panel';
import { textStyle } from '../ui/textStyle';

const CARD = { w: 330, h: 300, y: 330, gap: 30 };
const RECIPE_PANEL_Y = 580;

interface Card {
  level: LevelDef;
  root: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Graphics;
  unlocked: boolean;
}

/** Pick a level: cards with stars, lock state, and the recipes that level serves. */
export class LevelSelectScene extends Phaser.Scene {
  private cards: Card[] = [];
  private selected = 0;
  private recipeRow!: Phaser.GameObjects.Container;
  private players = 1;
  private leaving = false;

  constructor() {
    super('LevelSelect');
  }

  create(data: { players?: number }): void {
    this.cards = [];
    this.selected = 0;
    this.leaving = false;
    this.players = data?.players ?? 1;
    const cx = VIEW.width / 2;

    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, TEX.floor).setOrigin(0);
    this.add.rectangle(0, 0, VIEW.width, VIEW.height, P.hudBand, 0.4).setOrigin(0);

    this.add
      .text(cx, 76, TEXT.levels.title, textStyle(44, css(P.textLight), '900'))
      .setOrigin(0.5)
      .setStroke(css(P.outline), 9);
    this.add
      .text(cx, 124, TEXT.levels.hint, textStyle(16, css(P.textLight), '700'))
      .setOrigin(0.5)
      .setAlpha(0.9);

    const totalWidth = LEVELS.length * CARD.w + (LEVELS.length - 1) * CARD.gap;
    LEVELS.forEach((level, i) => {
      const x = cx - totalWidth / 2 + CARD.w / 2 + i * (CARD.w + CARD.gap);
      this.cards.push(this.makeCard(level, x, CARD.y, i));
    });

    // Panel first, so the recipe row draws on top of it
    panel(this, cx, RECIPE_PANEL_Y, totalWidth, 104, 22);
    this.recipeRow = this.add.container(cx, RECIPE_PANEL_Y);

    createButton(this, 150, 664, TEXT.levels.back, () => this.back(), {
      width: 200,
      height: 52,
      fontSize: 20,
      fill: P.wash,
      fillDark: P.washDark,
    });
    createButton(this, VIEW.width - 180, 664, TEXT.start, () => this.startSelected(), {
      width: 240,
      height: 56,
      fontSize: 24,
    });
    createMuteButton(this, 54, 44, { withLabel: true });

    const kb = this.input.keyboard!;
    kb.on('keydown-LEFT', () => this.select(this.selected - 1));
    kb.on('keydown-RIGHT', () => this.select(this.selected + 1));
    kb.on('keydown-ONE', () => this.select(0));
    kb.on('keydown-TWO', () => this.select(1));
    kb.on('keydown-THREE', () => this.select(2));
    kb.once('keydown-ENTER', () => this.startSelected());
    kb.once('keydown-ESC', () => this.back());

    this.select(0, true);
    this.cameras.main.fadeIn(300, 46, 34, 48);
  }

  private makeCard(level: LevelDef, x: number, y: number, index: number): Card {
    const unlocked = isUnlocked(level.id);
    const stars = starsFor(level.id);
    const best = bestMoneyFor(level.id);
    const root = this.add.container(x, y);

    const frame = this.add.graphics();
    root.add(frame);

    const top = -CARD.h / 2;
    root.add(
      this.add
        .text(0, top + 28, `${index + 1}. ${level.name}`, textStyle(21, css(P.text), '900'))
        .setOrigin(0.5),
    );
    root.add(
      this.add
        .text(0, top + 68, level.description, {
          ...textStyle(15, css(P.text), '700'),
          wordWrap: { width: CARD.w - 60 },
          align: 'center',
        })
        .setOrigin(0.5, 0),
    );

    // Stars earned
    for (let i = 0; i < 3; i++) {
      root.add(
        this.add
          .image(-56 + i * 56, top + 150, i < stars ? ICON.star : ICON.starEmpty)
          .setDisplaySize(46, 46),
      );
    }

    if (unlocked) {
      root.add(
        this.add
          .text(0, top + 196, best > 0 ? `${TEXT.levels.best}: €${best}` : '', textStyle(15, css(P.starEmpty), '800'))
          .setOrigin(0.5),
      );
      root.add(
        this.add
          .text(0, top + 232, `${Math.round(level.duration)} s · ★ €${level.starThresholds.join(' / €')}`, textStyle(13, css(P.starEmpty), '700'))
          .setOrigin(0.5),
      );
    } else {
      root.add(this.add.text(0, top + 196, TEXT.levels.locked, textStyle(20, css(P.bad), '900')).setOrigin(0.5));
      root.add(
        this.add
          .text(0, top + 228, TEXT.levels.lockedHint, {
            ...textStyle(13, css(P.starEmpty), '700'),
            wordWrap: { width: CARD.w - 60 },
            align: 'center',
          })
          .setOrigin(0.5, 0),
      );
      root.setAlpha(0.72);
    }

    const hit = this.add.zone(0, 0, CARD.w, CARD.h).setInteractive({ useHandCursor: true });
    root.add(hit);
    hit.on('pointerover', () => this.select(index));
    hit.on('pointerup', () => {
      this.select(index);
      this.startSelected();
    });

    const card: Card = { level, root, frame, unlocked };
    this.drawFrame(card, false);
    return card;
  }

  private drawFrame(card: Card, selected: boolean): void {
    const g = card.frame;
    const w = CARD.w;
    const h = CARD.h;
    g.clear();
    g.fillStyle(P.shadow, 0.3);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 24);
    g.fillStyle(card.unlocked ? P.panel : P.panelShade, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24);
    g.lineStyle(selected ? 5 : 3, selected ? P.accent : P.outline, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 24);
  }

  private select(index: number, silent = false): void {
    const next = Phaser.Math.Clamp(index, 0, this.cards.length - 1);
    if (next === this.selected && silent === false && this.recipeRow.length > 0) return;
    this.selected = next;
    if (!silent) AudioEngine.get().play('uiSelect');
    this.cards.forEach((card, i) => {
      this.drawFrame(card, i === this.selected);
      this.tweens.add({ targets: card.root, scale: i === this.selected ? 1.03 : 1, duration: 140 });
    });
    this.showRecipes(this.cards[this.selected].level);
  }

  /** The legend always shows the highlighted level's recipes. */
  private showRecipes(level: LevelDef): void {
    this.recipeRow.removeAll(true);
    const recipes = getRecipes(level.recipes);
    const columnWidth = (CARD.w * 3 + CARD.gap * 2) / recipes.length;
    recipes.forEach((recipe, i) => {
      const x = -((recipes.length - 1) / 2) * columnWidth + i * columnWidth;
      this.recipeRow.add(
        this.add.text(x, -28, recipe.name, textStyle(16, css(P.text), '900')).setOrigin(0.5),
      );
      const steps = recipe.steps;
      const iconGap = 30;
      const startX = x - ((steps.length - 1) / 2) * iconGap - 22;
      steps.forEach((step, j) => {
        this.recipeRow.add(this.add.image(startX + j * iconGap, 10, STEP_ICON[step]).setDisplaySize(26, 26));
      });
      this.recipeRow.add(
        this.add
          .text(startX + steps.length * iconGap + 6, 10, `€${recipe.price}`, textStyle(15, css(P.checkoutDark), '900'))
          .setOrigin(0, 0.5),
      );
    });
  }

  private startSelected(): void {
    const card = this.cards[this.selected];
    if (this.leaving) return;
    if (!card.unlocked) {
      AudioEngine.get().play('refuse');
      this.cameras.main.shake(140, 0.004);
      this.tweens.add({ targets: card.root, angle: { from: -1.5, to: 1.5 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => card.root.setAngle(0) });
      return;
    }
    this.leaving = true;
    const players = this.players;
    const levelId = card.level.id;
    this.cameras.main.fadeOut(250, 46, 34, 48);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      this.scene.start('Game', { players, levelId }),
    );
  }

  private back(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(220, 46, 34, 48);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Menu'));
  }
}
