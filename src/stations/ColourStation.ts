import Phaser from 'phaser';
import { ICON, STEP_COLOR } from '../art/drawIcons';
import { AudioEngine } from '../audio/AudioEngine';
import { STATION_TIMES } from '../config/gameConfig';
import { PALETTE } from '../config/palette';
import type { Customer } from '../entities/Customer';
import { bump } from '../fx/Juice';
import { Particles } from '../fx/Particles';
import { Station } from './Station';

type ColourPhase = 'idle' | 'applying' | 'processing' | 'done';

const BUBBLE_EVERY = 0.35;

/**
 * Hybrid station: hold the work key to apply the dye, then it develops on its own
 * while the player does something else. No burn — it simply waits when it is ready.
 */
export class ColourStation extends Station {
  private phase: ColourPhase = 'idle';
  private processTime = 0;
  private fxTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'colour', x, y, colliders);
  }

  /** Hair is developing; the customer cannot be moved. */
  get isProcessing(): boolean {
    return this.phase === 'processing';
  }

  override canRelease(): boolean {
    return super.canRelease() && this.phase !== 'processing';
  }

  override work(dt: number): boolean {
    const c = this.occupant;
    if (!c || c.state !== 'seated' || c.nextStep !== 'colour') return false;
    if (this.phase !== 'idle' && this.phase !== 'applying') return false;

    if (this.phase === 'idle') {
      this.phase = 'applying';
      AudioEngine.get().play('colourApply');
    }
    c.stepProgress += dt;
    this.workedThisFrame = true;
    this.startSound('colourApply');

    if (c.stepProgress >= STATION_TIMES.colourApply) {
      // Applied: the dye now develops on its own
      this.phase = 'processing';
      this.processTime = 0;
      this.stopSound();
      this.startSound('colour');
      bump(this.scene, this.prop.image, 0.07);
    }
    return true;
  }

  override update(dt: number, time: number): void {
    const c = this.occupant;
    if (!c || c.state !== 'seated') {
      this.ring.hide();
      return;
    }

    switch (this.phase) {
      case 'applying':
        this.ring.setScale(1);
        this.ring.showProgress(c.stepProgress / STATION_TIMES.colourApply, STEP_COLOR.colour);
        // Applying pauses (keeping progress) as soon as nobody holds the key
        if (!this.workedThisFrame) this.stopSound();
        break;

      case 'processing': {
        this.processTime += dt;
        this.ring.setScale(1);
        this.ring.showProgress(this.processTime / STATION_TIMES.colourProcess, PALETTE.colourDark);
        this.emitBubbles(c, dt);
        if (this.processTime >= STATION_TIMES.colourProcess) this.finish(c);
        break;
      }

      case 'done':
        this.ring.setScale(1);
        this.ring.showIcon(ICON.check);
        break;

      case 'idle':
        if (c.nextStep === 'colour') {
          this.ring.showIcon(ICON.colour, 28);
          this.ring.setScale(1 + Math.sin(time * 0.01) * 0.12);
        } else {
          this.ring.hide();
        }
        break;
    }
    this.workedThisFrame = false;
  }

  private finish(customer: Customer): void {
    this.phase = 'done';
    this.stopSound();
    customer.dyeHair();
    AudioEngine.get().play('colourDone');
    Particles.of(this.scene)?.sparkle(customer.x, customer.headY - 6, 14);
    customer.completeStep();
  }

  private emitBubbles(customer: Customer, dt: number): void {
    this.fxTimer -= dt;
    if (this.fxTimer > 0) return;
    this.fxTimer = BUBBLE_EVERY;
    Particles.of(this.scene)?.bubbles(customer.x + Phaser.Math.Between(-10, 10), customer.headY - 8, 1);
  }

  protected override onReleased(): void {
    this.phase = 'idle';
    this.processTime = 0;
    this.stopSound();
  }
}
