import Phaser from 'phaser';
import { AudioEngine } from '../audio/AudioEngine';
import { SCORE } from '../config/gameConfig';
import type { Customer } from '../entities/Customer';
import { GameEvent } from '../systems/events';
import { depthForY } from '../world/depth';
import { Station } from './Station';

const PAY_DELAY = 350;

/** Finished customers are dropped here; they pay and leave. */
export class Checkout extends Station {
  override readonly seatsCustomer = false;

  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'checkout', x, y, colliders);
  }

  override get customerDepth(): number {
    return depthForY(this.seatPoint.y);
  }

  override accepts(customer: Customer): boolean {
    return this.isFree() && customer.isFinished;
  }

  override canRelease(): boolean {
    return false;
  }

  protected override onPlaced(customer: Customer): void {
    this.scene.time.delayedCall(PAY_DELAY, () => {
      if (customer.station !== this) return;
      const payout =
        customer.recipe.price + Math.round(SCORE.baseTip * customer.patienceRatio * customer.type.tipMultiplier);
      // A better tip rings out brighter
      const tipShare = Math.min(1, (payout - customer.recipe.price) / (SCORE.baseTip * 2));
      AudioEngine.get().play('payout', { pitch: 1 + tipShare * 0.28 });
      this.scene.events.emit(GameEvent.CustomerServed, customer, payout);
      customer.leave('served');
    });
  }
}
