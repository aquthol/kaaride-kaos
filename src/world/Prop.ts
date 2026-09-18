import Phaser from 'phaser';
import { TEX } from '../art/textureKeys';
import { DEPTH, depthForY } from './depth';
import type { PropDef } from './propDefs';

/** A piece of furniture: sprite anchored at its base, soft shadow and a static footprint collider. */
export class Prop {
  readonly image: Phaser.GameObjects.Image;
  readonly shadow: Phaser.GameObjects.Image;
  readonly collider: Phaser.GameObjects.Zone;

  constructor(
    scene: Phaser.Scene,
    readonly def: PropDef,
    readonly x: number,
    readonly y: number,
    colliders: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.shadow = scene.add
      .image(x, y - 3, TEX.shadow)
      .setDisplaySize(def.shadow.w, def.shadow.h)
      .setDepth(DEPTH.shadow);
    this.image = scene.add.image(x, y, def.texture).setOrigin(0.5, 1).setDepth(depthForY(y));
    this.collider = scene.add.zone(x, y - def.footprint.h / 2, def.footprint.w, def.footprint.h);
    colliders.add(this.collider);
  }

  get depth(): number {
    return this.image.depth;
  }

  /** Closed for this level: greyed out and under a dust sheet. */
  cover(scene: Phaser.Scene): void {
    this.image.setTint(0xa79fa6);
    const sheet = scene.add
      .image(this.x, this.y + 4, TEX.cover)
      .setOrigin(0.5, 1)
      .setDepth(this.depth + 1);
    const width = this.def.footprint.w + 26;
    sheet.setDisplaySize(width, width * 0.8);
  }
}
