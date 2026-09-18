import Phaser from 'phaser';
import { STATION_TIMES } from '../config/gameConfig';
import type { Customer } from '../entities/Customer';
import { Particles } from '../fx/Particles';
import { ManualStation } from './ManualStation';

const SNIP_EVERY = 0.08;

export class CutStation extends ManualStation {
  protected readonly workTime = STATION_TIMES.cut;
  private snipTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'cut', x, y, colliders);
  }

  protected override onWorkTick(customer: Customer, dt: number): void {
    this.snipTimer -= dt;
    if (this.snipTimer > 0) return;
    this.snipTimer = SNIP_EVERY;
    const side = Math.random() < 0.5 ? -1 : 1;
    Particles.of(this.scene)?.snips(
      customer.x + side * Phaser.Math.Between(8, 16),
      customer.headY - Phaser.Math.Between(0, 10),
      customer.hairColor,
      2,
    );
  }
}
