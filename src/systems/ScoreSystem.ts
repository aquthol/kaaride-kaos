import Phaser from 'phaser';
import { PALETTE } from '../config/palette';
import { SCORE } from '../config/gameConfig';
import type { Customer } from '../entities/Customer';
import { showFloatingText } from '../ui/FloatingText';
import { GameEvent, type LeaveReason } from './events';

/** Tracks money and served/angry counts, and shows the +/- floating feedback. */
export class ScoreSystem {
  money = 0;
  served = 0;
  angry = 0;

  constructor(private readonly scene: Phaser.Scene) {
    scene.events.on(GameEvent.CustomerServed, this.onServed, this);
    scene.events.on(GameEvent.CustomerAngry, this.onAngry, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private onServed = (customer: Customer, payout: number): void => {
    this.money += payout;
    this.served++;
    showFloatingText(this.scene, customer.x, customer.y - 60, `+€${payout}`, PALETTE.good);
    this.emitChange();
  };

  private onAngry = (customer: Customer, reason: LeaveReason): void => {
    const penalty = reason === 'burnt' ? SCORE.burnPenalty : SCORE.angryPenalty;
    this.money = Math.max(0, this.money - penalty);
    this.angry++;
    showFloatingText(this.scene, customer.x, customer.y - 60, `-€${penalty}`, PALETTE.bad);
    this.emitChange();
  };

  private emitChange(): void {
    this.scene.events.emit(GameEvent.ScoreChanged, this.money, this.served, this.angry);
  }

  private destroy = (): void => {
    this.scene.events.off(GameEvent.CustomerServed, this.onServed, this);
    this.scene.events.off(GameEvent.CustomerAngry, this.onAngry, this);
  };
}
