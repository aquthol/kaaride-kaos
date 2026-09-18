import Phaser from 'phaser';
import type { Action, InputProfile } from '../config/controls';
import { KeyboardTracker } from './KeyboardTracker';

const ACTIONS: Action[] = ['up', 'down', 'left', 'right', 'grab', 'work', 'dash'];

/** Keyboard bindings for one player, read through abstract actions. */
export class PlayerInput {
  private readonly tracker: KeyboardTracker;
  private readonly pressed = {} as Record<Action, boolean>;
  private readonly axisVec = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, readonly profile: InputProfile) {
    this.tracker = KeyboardTracker.for(scene);
    this.tracker.capture(Object.values(profile.keys).flat());
    for (const action of ACTIONS) this.pressed[action] = false;
  }

  /** Call once per frame before reading `justPressed`. */
  poll(): void {
    for (const action of ACTIONS) {
      this.pressed[action] = this.profile.keys[action].some((code) => this.tracker.justPressed(code));
    }
  }

  isDown(action: Action): boolean {
    return this.profile.keys[action].some((code) => this.tracker.isDown(code));
  }

  justPressed(action: Action): boolean {
    return this.pressed[action];
  }

  /** Normalized movement direction (zero when idle). */
  axis(): Phaser.Math.Vector2 {
    const x = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
    const y = (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0);
    return this.axisVec.set(x, y).normalize();
  }
}
