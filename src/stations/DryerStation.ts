import Phaser from 'phaser';
import { TEX } from '../art/textureKeys';
import { AudioEngine } from '../audio/AudioEngine';
import { STATION_TIMES } from '../config/gameConfig';
import type { Customer } from '../entities/Customer';
import { bump } from '../fx/Juice';
import { Particles } from '../fx/Particles';
import { GameEvent } from '../systems/events';
import { AutoStation } from './AutoStation';

const HOOD_UP = -136;
const HOOD_DOWN = -128;
/** Offset from the hood's top edge to its rim. */
const HOOD_RIM = 44;
const STEAM_EVERY = 0.11;
const HEAT_EVERY = 0.07;
const HEAT_TINT = 0xffb08a;
/** Warning beeps speed up from this interval to this one as the burn nears. */
const BEEP_SLOW = 0.75;
const BEEP_FAST = 0.28;

export class DryerStation extends AutoStation {
  protected readonly workTime = STATION_TIMES.dry;
  protected readonly warnAfter = STATION_TIMES.dryerWarnAfter;
  protected readonly failAfter = STATION_TIMES.dryerBurnAfter;
  override readonly bubbleLift = 30;
  private readonly hood: Phaser.GameObjects.Image;
  private fxTimer = 0;
  private beepTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, colliders: Phaser.Physics.Arcade.StaticGroup) {
    super(scene, 'dry', x, y, colliders);
    this.hood = scene.add
      .image(x, y + HOOD_UP, TEX.dryerHood)
      .setOrigin(0.5, 0)
      .setDepth(this.customerDepth + 1);
  }

  override update(dt: number, time: number): void {
    super.update(dt, time);
    if (this.autoState === 'running') {
      // Tiny rumble while running
      this.hood.x = this.x + Math.sin(time * 0.08) * 0.8;
    }
    if (this.isWarning) this.hood.setTint(Math.sin(time * 0.025) > 0 ? 0xff8a8a : 0xffffff);
  }

  protected override onStart(): void {
    this.moveHood(HOOD_DOWN);
    bump(this.scene, this.prop.image, 0.06);
  }

  protected override onRunning(_customer: Customer, dt: number): void {
    this.fxTimer -= dt;
    if (this.fxTimer > 0) return;
    this.fxTimer = STEAM_EVERY;
    const side = Math.random() < 0.5 ? -1 : 1;
    Particles.of(this.scene)?.steam(this.x - 4 + side * Phaser.Math.Between(14, 34), this.hood.y + HOOD_RIM, 1);
  }

  protected override onWarning(_customer: Customer, dt: number): void {
    // Smoke and beeps both get more urgent as the burn approaches
    const danger = (this.overTime - this.warnAfter) / (this.failAfter - this.warnAfter);
    this.beepTimer -= dt;
    if (this.beepTimer <= 0) {
      this.beepTimer = Phaser.Math.Linear(BEEP_SLOW, BEEP_FAST, danger);
      AudioEngine.get().play('dryerWarn', { pitch: 1 + danger * 0.45 });
    }

    this.fxTimer -= dt;
    if (this.fxTimer > 0) return;
    this.fxTimer = HEAT_EVERY;
    const fx = Particles.of(this.scene);
    const x = this.x - 4 + Phaser.Math.Between(-30, 30);
    fx?.steam(x, this.hood.y + 10, 1, HEAT_TINT);
    if (Math.random() < danger * 0.6) fx?.smoke(x, this.hood.y + 6, 1);
  }

  protected override onFinished(): void {
    this.moveHood(HOOD_UP);
  }

  protected override onStop(): void {
    this.beepTimer = 0;
    this.hood.clearTint();
    this.hood.x = this.x;
    this.moveHood(HOOD_UP);
  }

  protected override onFail(customer: Customer): void {
    this.hood.clearTint();
    this.prop.image.clearTint();
    Particles.of(this.scene)?.smoke(this.x, this.hood.y + 20, 16);
    bump(this.scene, this.hood, 0.2);
    this.scene.events.emit(GameEvent.CustomerAngry, customer, 'burnt');
    customer.leave('burnt');
  }

  private moveHood(offset: number): void {
    this.scene.tweens.add({ targets: this.hood, y: this.y + offset, duration: 220, ease: 'Back.easeOut' });
  }
}
