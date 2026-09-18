import Phaser from 'phaser';
import { AudioEngine } from '../audio/AudioEngine';
import { PALETTE as P, css } from '../config/palette';
import { textStyle } from './textStyle';

export interface ButtonOptions {
  width?: number;
  height?: number;
  fill?: number;
  fillDark?: number;
  fontSize?: number;
}

/** A rounded, tactile button: hover grows it slightly, press dips the label. */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const w = opts.width ?? 240;
  const h = opts.height ?? 64;
  const fill = opts.fill ?? P.accent;
  const fillDark = opts.fillDark ?? P.accentDark;

  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  const text = scene.add.text(0, 0, label, textStyle(opts.fontSize ?? 24, css(P.textLight), '900')).setOrigin(0.5);

  const draw = (pressed: boolean) => {
    const offset = pressed ? 3 : 0;
    g.clear();
    g.fillStyle(P.shadow, 0.22);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, h / 2);
    g.fillStyle(fillDark, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2);
    g.fillStyle(fill, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + offset, w, h, h / 2);
    g.lineStyle(2.5, P.outline, 1);
    g.strokeRoundedRect(-w / 2, -h / 2 + offset, w, h, h / 2);
    text.y = offset;
  };
  draw(false);
  container.add([g, text]);

  const hit = scene.add.zone(0, 0, w, h + 6).setInteractive({ useHandCursor: true });
  container.add(hit);
  hit.on('pointerover', () => {
    AudioEngine.get().play('uiHover');
    scene.tweens.add({ targets: container, scale: 1.045, duration: 110 });
  });
  hit.on('pointerout', () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 110 });
    draw(false);
  });
  hit.on('pointerdown', () => draw(true));
  hit.on('pointerup', () => {
    draw(false);
    AudioEngine.get().play('uiConfirm');
    onClick();
  });
  return container;
}
