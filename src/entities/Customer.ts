import Phaser from 'phaser';
import { AudioEngine } from '../audio/AudioEngine';
import type { CustomerTypeDef } from '../config/customerTypes';
import { PATIENCE } from '../config/gameConfig';
import { LAYOUT } from '../config/layout';
import { PALETTE } from '../config/palette';
import type { RecipeDef } from '../config/recipes';
import { popIn } from '../fx/Juice';
import { Particles } from '../fx/Particles';
import type { Station } from '../stations/Station';
import { GameEvent, type LeaveReason } from '../systems/events';
import type { Mood, Point, StepKind } from '../types';
import { PatienceBar } from '../ui/PatienceBar';
import { RecipeBubble } from '../ui/RecipeBubble';
import { lerpColor } from '../utils/color';
import { depthForY } from '../world/depth';
import { pathToDoor } from '../world/walkPaths';
import { CharacterView } from './CharacterView';
import { randomCustomerLook } from './looks';
import { moodForPatience } from './mood';
import type { Player } from './Player';

export type CustomerState = 'entering' | 'seated' | 'carried' | 'leaving';

const WALK_SPEED = 150;
/** Angry customers storm out faster. */
const STORM_OUT_MULTIPLIER = 1.45;
/** Carried customers ride above the carrier's head. */
const CARRY_LIFT = 54;
const BUBBLE_OFFSET = 74;
/** Extra bubble height reserved for the patience bar row. */
const PATIENCE_ROW_HEIGHT = 18;
const WET_TINT = 0x2c4a6e;
const BURNT_TINT = 0x3a3032;

export class Customer {
  readonly view: CharacterView;
  readonly bubble: RecipeBubble;
  private readonly patienceBar: PatienceBar;
  readonly maxPatience: number;
  patience: number;
  state: CustomerState = 'entering';
  station: Station | null = null;
  carrier: Player | null = null;
  stepIndex = 0;
  /** Seconds of work done on the current step (kept when moved/paused). */
  stepProgress = 0;
  /** Set once the customer has fully left the salon. */
  removed = false;

  private readonly pos: Phaser.Math.Vector2;
  private readonly dir = new Phaser.Math.Vector2(0, 1);
  private path: Point[] = [];
  private onArrive?: () => void;
  private depthOverride: number | null = null;
  /** The shade this customer wants, when their recipe includes colouring. */
  readonly dyeColor: number | null;
  private walkSpeed = WALK_SPEED;
  private leaveReason: LeaveReason | null = null;
  private fxTimer = 0;
  private wet = false;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly type: CustomerTypeDef,
    readonly recipe: RecipeDef,
    spawn: Point,
  ) {
    this.pos = new Phaser.Math.Vector2(spawn.x, spawn.y);
    this.view = new CharacterView(scene, spawn.x, spawn.y, randomCustomerLook(type.look));
    this.maxPatience = type.patience + recipe.steps.length * PATIENCE.bonusPerStep;
    this.patience = this.maxPatience;
    // Customers asking for colour have a shade in mind; the bubble shows it
    this.dyeColor = recipe.steps.includes('colour')
      ? Phaser.Utils.Array.GetRandom([...PALETTE.dyeColors])
      : null;
    this.bubble = new RecipeBubble(scene, recipe.steps, type.displayName, PATIENCE_ROW_HEIGHT, this.dyeColor);
    this.bubble.setVisible(false);
    const barWidth = Math.max(34, this.bubble.bodyWidth - 14);
    this.patienceBar = new PatienceBar(scene, 0, this.bubble.extraRowY, barWidth);
    this.bubble.add(this.patienceBar);

    popIn(scene, this.view, 0, 380);
    Particles.of(scene)?.sparkle(LAYOUT.door.x, LAYOUT.door.y - 40, 6);
    AudioEngine.get().play('customerArrive');
  }

  get headY(): number {
    return this.view.headY;
  }

  get hairColor(): number {
    return this.view.hairColor;
  }

  /** Apply the colour this customer asked for. */
  dyeHair(): void {
    if (this.dyeColor === null) return;
    this.wet = false;
    this.view.setHairColor(this.dyeColor);
  }

  get x(): number {
    return this.pos.x;
  }

  get y(): number {
    return this.pos.y;
  }

  get nextStep(): StepKind | null {
    return this.recipe.steps[this.stepIndex] ?? null;
  }

  get isFinished(): boolean {
    return this.stepIndex >= this.recipe.steps.length;
  }

  get patienceRatio(): number {
    return Phaser.Math.Clamp(this.patience / this.maxPatience, 0, 1);
  }

  completeStep(): void {
    const done = this.nextStep;
    this.stepIndex++;
    this.stepProgress = 0;
    this.bubble.setProgress(this.stepIndex);
    this.view.punch(0.2);
    Particles.of(this.scene)?.sparkle(this.x, this.headY - 6, 10);
    AudioEngine.get().play('stepDone');
    // Freshly washed hair looks darker until the next step is done
    if (done === 'wash') {
      this.wet = true;
      this.view.setHairTint(lerpColor(this.hairColor, WET_TINT, 0.45));
    } else if (this.wet) {
      this.wet = false;
      this.view.setHairTint();
    }
  }

  setMood(mood: Mood): void {
    this.view.setMood(mood);
  }

  walk(path: Point[], onArrive?: () => void): void {
    this.path = path.slice();
    this.onArrive = onArrive;
  }

  sitAt(station: Station): void {
    this.state = 'seated';
    this.station = station;
    this.carrier = null;
    this.path = [];
    const seat = station.seatPoint;
    this.depthOverride = station.customerDepth;
    this.view.setGrounded(!station.seatsCustomer, !station.seatsCustomer);
    this.view.setRearView(false);
    this.view.faceTowards(1);
    this.bubble.setVisible(true);
    this.scene.tweens.add({ targets: this.pos, x: seat.x, y: seat.y, duration: 160, ease: 'Quad.easeOut' });
    this.scene.tweens.add({ targets: this.view, lift: 0, duration: 160, ease: 'Back.easeOut' });
    this.view.punch(0.15);
  }

  pickUp(player: Player): void {
    this.state = 'carried';
    this.station = null;
    this.carrier = player;
    this.depthOverride = null;
    this.view.setGrounded(false, true);
    this.view.punch(0.2);
    this.scene.tweens.add({ targets: this.pos, x: player.x, y: player.y + 1, duration: 110 });
    this.scene.tweens.add({ targets: this.view, lift: CARRY_LIFT, duration: 160, ease: 'Back.easeOut' });
  }

  /** Walk out of the salon. Callers emit score events. */
  leave(reason: LeaveReason): void {
    if (this.state === 'leaving') return;
    this.station?.clear(this);
    if (this.carrier) this.carrier.carrying = null;
    this.state = 'leaving';
    this.station = null;
    this.carrier = null;
    this.depthOverride = null;
    this.scene.tweens.killTweensOf(this.pos);
    this.scene.tweens.add({ targets: this.view, lift: 0, duration: 150 });
    this.view.setGrounded(true);
    this.bubble.setVisible(false);
    this.setMood(reason === 'served' ? 'happy' : reason === 'burnt' ? 'burnt' : 'angry');
    this.leaveReason = reason;
    const fx = Particles.of(this.scene);
    if (reason === 'served') {
      if (this.wet) this.view.setHairTint();
      fx?.hearts(this.x, this.headY - 10, 3);
    } else {
      this.walkSpeed = WALK_SPEED * STORM_OUT_MULTIPLIER;
      this.view.punch(0.25);
      if (reason === 'burnt') {
        this.view.setHairTint(BURNT_TINT);
        fx?.smoke(this.x, this.headY - 10, 10);
        AudioEngine.get().play('burn');
      } else {
        fx?.anger(this.x + 14, this.headY - 16);
        AudioEngine.get().play('angry');
      }
    }
    this.walk(pathToDoor(this.pos), () => {
      this.scene.tweens.add({
        targets: this.view,
        alpha: 0,
        duration: 250,
        onComplete: () => this.destroy(),
      });
    });
  }

  update(dt: number, time: number): void {
    if (this.state !== 'leaving') {
      this.patience = Math.max(0, this.patience - dt * this.drainMultiplier());
      this.setMood(moodForPatience(this.patienceRatio));
      this.patienceBar.setRatio(this.patienceRatio);
      if (this.patience <= 0) {
        this.scene.events.emit(GameEvent.CustomerAngry, this, 'impatient');
        this.leave('impatient');
      }
    }

    let moving = false;
    if (this.state === 'carried' && this.carrier) {
      const c = this.carrier;
      if (!this.scene.tweens.isTweening(this.pos)) this.pos.set(c.x, c.y + 1);
      this.dir.copy(c.facing);
      this.view.faceTowards(c.facing.x);
      this.view.setRearView(false);
      this.depthOverride = c.view.depth + 0.5;
    } else if (this.path.length > 0) {
      moving = this.followPath(dt);
    }

    this.view.setPosition(this.pos.x, this.pos.y);
    this.view.setDepth(this.depthOverride ?? depthForY(this.pos.y));
    this.view.animate(dt, time, moving, this.dir.x, this.dir.y);

    const stationLift = this.state === 'seated' ? (this.station?.bubbleLift ?? 0) : 0;
    // Nervous jitter when patience is running low
    const jitter = this.patienceRatio < PATIENCE.neutralAbove ? Math.sin(time * 0.06) * 1.6 : 0;
    this.bubble.setPosition(this.pos.x + jitter, this.pos.y - BUBBLE_OFFSET - this.view.lift - stationLift);
    this.bubble.tick(time);

    if (this.leaveReason && this.leaveReason !== 'served') this.emitLeavingFx(dt);
  }

  private emitLeavingFx(dt: number): void {
    this.fxTimer -= dt;
    if (this.fxTimer > 0) return;
    const fx = Particles.of(this.scene);
    if (this.leaveReason === 'burnt') {
      this.fxTimer = 0.12;
      fx?.smoke(this.x + Phaser.Math.Between(-6, 6), this.headY - 12, 1);
    } else {
      this.fxTimer = 0.45;
      fx?.anger(this.x + Phaser.Math.Between(-14, 14), this.headY - 18);
    }
  }

  private drainMultiplier(): number {
    if (this.state === 'carried') return PATIENCE.drainCarriedMultiplier;
    if (this.state === 'seated' && this.station && this.station.kind !== 'wait') {
      return PATIENCE.drainAtStationMultiplier;
    }
    return 1;
  }

  private followPath(dt: number): boolean {
    const target = this.path[0];
    const dx = target.x - this.pos.x;
    const dy = target.y - this.pos.y;
    const dist = Math.hypot(dx, dy);
    const step = this.walkSpeed * dt;
    if (dist <= step) {
      this.pos.set(target.x, target.y);
      this.path.shift();
      if (this.path.length === 0) {
        const cb = this.onArrive;
        this.onArrive = undefined;
        cb?.();
      }
    } else {
      this.dir.set(dx / dist, dy / dist);
      this.pos.x += this.dir.x * step;
      this.pos.y += this.dir.y * step;
    }
    return dist > 0.5;
  }

  destroy(): void {
    if (this.removed) return;
    this.removed = true;
    this.scene.tweens.killTweensOf([this.pos, this.view]);
    this.view.destroy();
    this.bubble.destroy();
  }
}
