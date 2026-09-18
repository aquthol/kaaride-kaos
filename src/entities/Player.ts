import Phaser from 'phaser';
import { FX } from '../art/drawFx';
import { AudioEngine } from '../audio/AudioEngine';
import { PLAYER } from '../config/gameConfig';
import { Particles } from '../fx/Particles';
import type { PlayerInput } from '../input/PlayerInput';
import type { CharacterLook, Point } from '../types';
import { DEPTH, depthForY } from '../world/depth';
import { CharacterView } from './CharacterView';
import type { Customer } from './Customer';

/**
 * A controllable hairdresser. The physics body is a small zone at the feet;
 * the visual `CharacterView` follows it.
 */
export class Player {
  readonly feet: Phaser.GameObjects.Zone;
  readonly view: CharacterView;
  readonly facing = new Phaser.Math.Vector2(0, 1);
  /** Customer currently carried, if any. */
  carrying: Customer | null = null;
  /** True on frames where the player is working a station. */
  working = false;

  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly dashDir = new Phaser.Math.Vector2();
  private dashTimer = 0;
  private dashCooldown = 0;
  private moving = false;
  private stepTimer = 0;

  /** Colored ring at the feet, used in co-op to tell the players apart. */
  private readonly marker: Phaser.GameObjects.Image | null;

  constructor(
    scene: Phaser.Scene,
    readonly index: number,
    readonly input: PlayerInput,
    spawn: Point,
    look: CharacterLook,
    markerColor: number | null = null,
  ) {
    this.feet = scene.add.zone(spawn.x, spawn.y, PLAYER.bodyWidth, PLAYER.bodyHeight);
    scene.physics.add.existing(this.feet);
    this.body = this.feet.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.view = new CharacterView(scene, spawn.x, spawn.y, look);
    this.marker =
      markerColor === null
        ? null
        : scene.add
            .image(spawn.x, spawn.y, FX.ring)
            .setDisplaySize(52, 20)
            .setTint(markerColor)
            .setAlpha(0.9)
            .setDepth(DEPTH.shadow + 0.6);
  }

  get name(): string {
    return this.input.profile.name;
  }

  /** Feet position in world space. */
  get x(): number {
    return this.feet.x;
  }

  get y(): number {
    return this.feet.y + PLAYER.bodyHeight / 2;
  }

  get isDashing(): boolean {
    return this.dashTimer > 0;
  }

  update(dt: number): void {
    this.input.poll();
    const axis = this.input.axis();
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.moving = axis.lengthSq() > 0;
    if (this.moving) this.facing.copy(axis);

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.body.setVelocity(this.dashDir.x * PLAYER.dashSpeed, this.dashDir.y * PLAYER.dashSpeed);
    } else {
      const speed = PLAYER.speed * (this.carrying ? PLAYER.carrySpeedMultiplier : 1);
      this.body.setVelocity(axis.x * speed, axis.y * speed);
      if (this.input.justPressed('dash') && this.dashCooldown <= 0) {
        this.dashTimer = PLAYER.dashDuration;
        this.dashCooldown = PLAYER.dashCooldown;
        this.dashDir.copy(this.facing);
        Particles.of(this.feet.scene)?.dust(this.x - this.facing.x * 10, this.y, 6);
        AudioEngine.get().play('dash');
      }
    }

    // Soft footstep puffs
    if (this.moving || this.isDashing) {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.isDashing ? 0.03 : 0.26;
        Particles.of(this.feet.scene)?.dust(this.x, this.y - 1, 1);
      }
    } else {
      this.stepTimer = 0;
    }
  }

  /** Sync visuals after movement. */
  lateUpdate(dt: number, time: number): void {
    this.view.setPosition(this.x, this.y);
    this.view.setDepth(depthForY(this.y));
    this.marker?.setPosition(this.x, this.y + 2);
    this.view.working = this.working && !this.moving;
    this.view.animate(dt, time, this.moving || this.isDashing, this.facing.x, this.facing.y, this.isDashing);
  }

  /** Point in front of the player, used for picking interaction targets. */
  reachPoint(distance = 26): Point {
    return { x: this.x + this.facing.x * distance, y: this.y + this.facing.y * distance };
  }
}
