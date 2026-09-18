import Phaser from 'phaser';
import type { Customer } from '../entities/Customer';
import { bump, shakeCamera } from '../fx/Juice';
import { Particles } from '../fx/Particles';
import { GameEvent, type LeaveReason } from './events';

/** Purely visual reactions to gameplay events: coins, sparkles, camera shake. */
export class FeedbackSystem {
  constructor(private readonly scene: Phaser.Scene) {
    scene.events.on(GameEvent.CustomerServed, this.onServed, this);
    scene.events.on(GameEvent.CustomerAngry, this.onAngry, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(GameEvent.CustomerServed, this.onServed, this);
      scene.events.off(GameEvent.CustomerAngry, this.onAngry, this);
    });
  }

  private onServed(customer: Customer, payout: number): void {
    const fx = Particles.of(this.scene);
    const counter = customer.station;
    const x = counter?.x ?? customer.x;
    const y = counter ? counter.y - 70 : customer.y - 40;
    fx?.coins(x + 20, y, Phaser.Math.Clamp(Math.round(payout / 3), 4, 16));
    fx?.sparkle(x + 20, y, 8);
    if (counter) bump(this.scene, counter.prop.image, 0.08);
  }

  private onAngry(_customer: Customer, reason: LeaveReason): void {
    shakeCamera(this.scene, reason === 'burnt' ? 0.011 : 0.007, reason === 'burnt' ? 320 : 220);
  }
}
