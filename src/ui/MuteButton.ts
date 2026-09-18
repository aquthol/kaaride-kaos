import Phaser from 'phaser';
import { ICON } from '../art/drawIcons';
import { AudioEngine } from '../audio/AudioEngine';
import { PALETTE as P, css } from '../config/palette';
import { TEXT } from '../config/texts';
import { textStyle } from './textStyle';

export interface MuteButtonOptions {
  /** Show "Heli sees" / "Heli väljas" next to the icon. */
  withLabel?: boolean;
  size?: number;
  depth?: number;
}

/** Speaker toggle that follows the engine's mute state (also changed by the M key). */
export function createMuteButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  opts: MuteButtonOptions = {},
): Phaser.GameObjects.Container {
  const audio = AudioEngine.get();
  const size = opts.size ?? 34;
  const icon = scene.add.image(0, 0, ICON.soundOn).setDisplaySize(size, size);
  const container = scene.add.container(x, y, [icon]);

  const label = opts.withLabel
    ? scene.add.text(size * 0.72, 1, '', textStyle(14, css(P.textLight), '800')).setOrigin(0, 0.5).setStroke(css(P.outline), 4)
    : null;
  if (label) container.add(label);

  const refresh = () => {
    icon.setTexture(audio.muted ? ICON.soundOff : ICON.soundOn).setDisplaySize(size, size);
    icon.setAlpha(audio.muted ? 0.75 : 1);
    label?.setText(audio.muted ? TEXT.audio.off : TEXT.audio.on);
  };
  refresh();

  const hit = scene.add.zone(0, 0, size + 12, size + 12).setInteractive({ useHandCursor: true });
  container.add(hit);
  hit.on('pointerover', () => scene.tweens.add({ targets: container, scale: 1.12, duration: 100 }));
  hit.on('pointerout', () => scene.tweens.add({ targets: container, scale: 1, duration: 100 }));
  hit.on('pointerup', () => audio.toggleMute());

  const unsubscribe = audio.onChange(refresh);
  if (opts.depth !== undefined) container.setDepth(opts.depth);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
  return container;
}
