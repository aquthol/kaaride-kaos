import Phaser from 'phaser';
import type { Customer } from '../entities/Customer';
import { Station } from './Station';

/** A waiting-area armchair. Any customer may sit here. */
export class WaitSeat extends Station {
  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'wait', x, y, colliders);
  }

  override accepts(_customer: Customer): boolean {
    return this.isFree();
  }
}
