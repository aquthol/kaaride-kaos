import Phaser from 'phaser';
import type { WaitSeat } from './WaitSeat';

/** The group of waiting seats where new customers arrive. */
export class WaitingArea {
  constructor(readonly seats: WaitSeat[]) {}

  freeSeat(): WaitSeat | null {
    const free = this.seats.filter((s) => s.isFree());
    return free.length ? Phaser.Utils.Array.GetRandom(free) : null;
  }
}
