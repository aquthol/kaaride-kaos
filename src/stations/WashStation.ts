import Phaser from 'phaser';
import { STATION_TIMES } from '../config/gameConfig';
import type { Customer } from '../entities/Customer';
import { Particles } from '../fx/Particles';
import { ManualStation } from './ManualStation';

const DROP_EVERY = 0.06;
const FOAM_EVERY = 0.14;

export class WashStation extends ManualStation {
  protected readonly workTime = STATION_TIMES.wash;
  private dropTimer = 0;
  private foamTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'wash', x, y, colliders);
  }

  protected override onWorkTick(customer: Customer, dt: number): void {
    const fx = Particles.of(this.scene);
    if (!fx) return;
    this.dropTimer -= dt;
    this.foamTimer -= dt;
    const hx = customer.x;
    const hy = customer.headY;
    if (this.dropTimer <= 0) {
      this.dropTimer = DROP_EVERY;
      fx.droplets(hx + Phaser.Math.Between(-14, 14), hy - 4, 1);
    }
    if (this.foamTimer <= 0) {
      this.foamTimer = FOAM_EVERY;
      fx.bubbles(hx + Phaser.Math.Between(-12, 12), hy - 10, 1);
    }
  }
}
