import Phaser from 'phaser';
import { FX } from '../art/drawFx';
import { ICON } from '../art/drawIcons';
import { AudioEngine } from '../audio/AudioEngine';
import type { LoopName } from '../audio/sfx';
import type { LoopHandle } from '../audio/synth';
import type { Customer } from '../entities/Customer';
import type { Point, StationKind } from '../types';
import { ProgressRing } from '../ui/ProgressRing';
import { DEPTH } from '../world/depth';
import { PROPS, STATION_PROP, type PropDef } from '../world/propDefs';
import { Prop } from '../world/Prop';

/**
 * A place a customer can be put. Subclasses decide what is accepted
 * and what working at the station does.
 */
export abstract class Station {
  readonly prop: Prop;
  readonly ring: ProgressRing;
  occupant: Customer | null = null;
  /** True if customers sit down here (legs hidden, drawn on the furniture). */
  readonly seatsCustomer: boolean = true;
  /** Extra height for the occupant's bubble (e.g. to clear a dryer hood). */
  readonly bubbleLift: number = 0;

  protected readonly bounds: Phaser.Geom.Rectangle;
  private readonly refuseIcon: Phaser.GameObjects.Image;
  private readonly highlight: Phaser.GameObjects.Image;
  /** Handle for this station's working sound, while it runs. */
  private loop: LoopHandle | null = null;

  constructor(
    protected readonly scene: Phaser.Scene,
    readonly kind: StationKind,
    x: number,
    y: number,
    colliders: Phaser.Physics.Arcade.StaticGroup,
  ) {
    const def = PROPS[STATION_PROP[kind]];
    this.prop = new Prop(scene, def, x, y, colliders);
    const { w, h } = def.footprint;
    this.bounds = new Phaser.Geom.Rectangle(x - w / 2, y - h, w, h);
    const ring = 'ring' in def ? def.ring : { x: 0, y: -h - 20 };
    this.ring = new ProgressRing(scene, x + ring.x, y + ring.y);
    this.refuseIcon = scene.add
      .image(x, y - h / 2, ICON.cross)
      .setDepth(DEPTH.bubble + 1)
      .setVisible(false);
    this.highlight = scene.add
      .image(x, y - 4, FX.ring)
      .setDisplaySize(w + 30, 34)
      .setDepth(DEPTH.shadow + 0.5)
      .setVisible(false);
    scene.tweens.add({
      targets: this.highlight,
      alpha: { from: 1, to: 0.45 },
      duration: 480,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Floor ring showing this is what the player would interact with; `null` hides it. */
  setHighlight(color: number | null): void {
    if (color === null) {
      this.highlight.setVisible(false);
      return;
    }
    this.highlight.setVisible(true).setTint(color);
  }

  get x(): number {
    return this.prop.x;
  }

  get y(): number {
    return this.prop.y;
  }

  get seatPoint(): Point {
    const def: PropDef = PROPS[STATION_PROP[this.kind]];
    const seat = def.seat ?? { x: 0, y: 0 };
    return { x: this.x + seat.x, y: this.y + seat.y };
  }

  /** Depth used for a customer placed here. */
  get customerDepth(): number {
    return this.prop.depth + 1;
  }

  /** Distance from a point to the station's footprint. */
  distanceTo(p: Point): number {
    const b = this.bounds;
    const cx = Phaser.Math.Clamp(p.x, b.left, b.right);
    const cy = Phaser.Math.Clamp(p.y, b.top, b.bottom);
    return Math.hypot(p.x - cx, p.y - cy);
  }

  isFree(): boolean {
    return this.occupant === null;
  }

  accepts(customer: Customer): boolean {
    return this.isFree() && customer.nextStep === this.kind;
  }

  canRelease(): boolean {
    return this.occupant?.state === 'seated';
  }

  /** Reserve the station for a customer that is still walking here. */
  reserve(customer: Customer): void {
    this.occupant = customer;
  }

  place(customer: Customer): void {
    this.occupant = customer;
    customer.sitAt(this);
    this.onPlaced(customer);
  }

  release(): Customer {
    const customer = this.occupant!;
    this.occupant = null;
    this.stopSound();
    this.onReleased(customer);
    return customer;
  }

  /** Start this station's looping sound, if it isn't already running. */
  protected startSound(name: LoopName): void {
    if (this.loop) return;
    this.loop = AudioEngine.get().startLoop(name);
  }

  /** Stop the looping sound. Safe to call when nothing is playing. */
  protected stopSound(): void {
    this.loop?.stop();
    this.loop = null;
  }

  /** Forget a customer that left on their own. */
  clear(customer: Customer): void {
    if (this.occupant !== customer) return;
    this.occupant = null;
    this.stopSound();
    this.onReleased(customer);
  }

  /** Set by `work()` and cleared by `update()`, so a station can tell if anyone is holding the key. */
  protected workedThisFrame = false;

  /** Called every frame while a player holds the work key here. Returns true if work happened. */
  work(_dt: number): boolean {
    return false;
  }

  /** Called when a player taps the work key here. */
  interact(): void {}

  update(_dt: number, _time: number): void {}

  /** "No!" feedback: shake, red flash and a cross icon. */
  refuse(): void {
    const img = this.prop.image;
    this.scene.tweens.killTweensOf(img);
    img.x = this.x;
    img.setTint(0xff9a9a);
    this.scene.tweens.add({
      targets: img,
      x: this.x + 5,
      duration: 45,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        img.x = this.x;
        img.clearTint();
      },
    });
    const icon = this.refuseIcon;
    this.scene.tweens.killTweensOf(icon);
    icon.setVisible(true).setAlpha(1).setScale(0.4);
    icon.y = this.y - this.bounds.height / 2;
    this.scene.tweens.add({ targets: icon, scale: 1, duration: 160, ease: 'Back.easeOut' });
    this.scene.tweens.add({
      targets: icon,
      alpha: 0,
      y: icon.y - 14,
      delay: 450,
      duration: 250,
      onComplete: () => icon.setVisible(false),
    });
  }

  protected onPlaced(_customer: Customer): void {}

  protected onReleased(_customer: Customer): void {}
}
