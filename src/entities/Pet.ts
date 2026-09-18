import Phaser from 'phaser';
import { TEX } from '../art/textureKeys';
import { AudioEngine } from '../audio/AudioEngine';
import type { PetKind } from '../config/customerTypes';
import type { Point } from '../types';
import { DEPTH, depthForY } from '../world/depth';
import { walkableArea } from '../world/walkable';
import type { Player } from './Player';

const SPEED = 165;
/** How far from the owner the dog settles. */
const FOLLOW_DISTANCE = 46;
const WANDER_RADIUS = 90;
/** Player must be this close to be nudged. */
const CONTACT_RANGE = 26;
const BARK_COOLDOWN = 2.2;
const SLOW_SECONDS = 0.45;
const SLOW_MULTIPLIER = 0.45;
/** How briskly the dog scampers aside when a player walks into it. */
const SHOVE_SPEED = 90;
/** Half-size of the dog's body, kept clear of furniture and walls. */
const PAD_X = 20;
const PAD_Y = 9;

/**
 * A companion that trots after its owner. It has no physics body on purpose:
 * it nudges a player who walks into it (a brief slow and a bark) but can never
 * wedge anyone against the furniture. Its own position is clamped to the
 * walkable floor instead, so it cannot end up inside a wall or a counter.
 */
export class Pet {
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Image;
  private readonly pos: Phaser.Math.Vector2;
  private target: Phaser.Math.Vector2;
  private readonly area = walkableArea();
  private barkTimer = 0;
  private retargetTimer = 0;
  private facing = 1;
  private removed = false;
  /** While heading out with its owner, the entrance lane is fair game. */
  private leaving = false;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly kind: PetKind,
    spawn: Point,
  ) {
    const start = this.area.clamp(spawn.x, spawn.y, PAD_X, PAD_Y);
    this.pos = new Phaser.Math.Vector2(start.x, start.y);
    this.target = this.pos.clone();
    this.shadow = scene.add.image(start.x, start.y, TEX.shadow).setDisplaySize(38, 14).setDepth(DEPTH.shadow);
    this.sprite = scene.add.image(start.x, start.y, TEX.dog).setOrigin(0.5, 1);
  }

  /** Called by the owner, so the game loop needs to know nothing about pets. */
  update(dt: number, time: number, owner: Point, players: readonly Player[]): void {
    if (this.removed) return;

    this.retargetTimer -= dt;
    const fromOwner = Phaser.Math.Distance.Between(this.pos.x, this.pos.y, owner.x, owner.y);
    if (this.leaving) {
      // Heading for the door with the owner; no milling about
    } else if (fromOwner > FOLLOW_DISTANCE * 2.4) {
      // Fallen behind: head straight back to the owner
      const back = this.area.clamp(owner.x, owner.y + 18, PAD_X, PAD_Y);
      this.target.set(back.x, back.y);
      this.retargetTimer = 0.6;
    } else if (this.retargetTimer <= 0) {
      // Mill about near the owner, on clear floor and out of the entrance
      const spot = this.area.randomSpotNear(owner, FOLLOW_DISTANCE, FOLLOW_DISTANCE + WANDER_RADIUS, PAD_X, PAD_Y);
      this.target.set(spot.x, spot.y);
      this.retargetTimer = 0.9 + Math.random() * 1.4;
    }

    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const dist = Math.hypot(dx, dy);
    let moving = false;
    if (dist > 4) {
      const step = Math.min(SPEED * dt, dist);
      this.pos.x += (dx / dist) * step;
      this.pos.y += (dy / dist) * step;
      if (Math.abs(dx) > 2) this.facing = Math.sign(dx);
      moving = true;
    }

    // Underfoot: a brief slow and a bark, and the dog scampers aside
    this.barkTimer -= dt;
    for (const player of players) {
      const gap = Phaser.Math.Distance.Between(this.pos.x, this.pos.y, player.x, player.y);
      if (gap > CONTACT_RANGE) continue;
      player.applySlow(SLOW_SECONDS, SLOW_MULTIPLIER);
      // Shoved away from the player; the clamp below turns a blocked shove into a slide
      const away = new Phaser.Math.Vector2(this.pos.x - player.x, this.pos.y - player.y);
      if (away.lengthSq() < 0.01) away.set(1, 0);
      away.normalize();
      this.pos.x += away.x * SHOVE_SPEED * dt;
      this.pos.y += away.y * SHOVE_SPEED * dt;
      if (this.barkTimer <= 0) {
        this.barkTimer = BARK_COOLDOWN;
        AudioEngine.get().play('bark');
        this.sprite.setScale(this.facing * 1.12, 0.9);
      }
      break;
    }

    // Never inside a wall or a counter, however it got there. On the way out the
    // room bounds are lifted, so it can trot through the doorway with its owner.
    const safe = this.area.clamp(this.pos.x, this.pos.y, PAD_X, PAD_Y, !this.leaving);
    this.pos.set(safe.x, safe.y);

    const bob = moving ? Math.abs(Math.sin(time * 0.012)) * 2 : 0;
    this.sprite.setPosition(this.pos.x, this.pos.y - bob);
    this.sprite.setDepth(depthForY(this.pos.y));
    this.shadow.setPosition(this.pos.x, this.pos.y - 1);
    // Ease back to the resting scale after a bark
    const sx = Phaser.Math.Linear(this.sprite.scaleX, this.facing, Math.min(1, dt * 8));
    const sy = Phaser.Math.Linear(this.sprite.scaleY, 1, Math.min(1, dt * 8));
    this.sprite.setScale(sx, sy);
  }

  /** Trot to a spot (used when the owner leaves, so the entrance is allowed). */
  sendTo(point: Point): void {
    this.leaving = true;
    this.target.set(point.x, point.y);
    this.retargetTimer = 999;
  }

  destroy(): void {
    if (this.removed) return;
    this.removed = true;
    this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      alpha: 0,
      duration: 220,
      onComplete: () => {
        this.sprite.destroy();
        this.shadow.destroy();
      },
    });
  }
}
