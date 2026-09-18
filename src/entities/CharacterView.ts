import Phaser from 'phaser';
import { TEX, faceKey, hairBackKey, hairFrontKey, hairRearKey } from '../art/textureKeys';
import type { CharacterLook, Mood } from '../types';

const HEAD_Y = -50;

/**
 * Layered cartoon character anchored at its feet. Handles walking bob,
 * squash & stretch, left/right flip, back view and facial expression.
 */
export class CharacterView extends Phaser.GameObjects.Container {
  /** Everything except the shadow; scaled for squash & stretch. */
  readonly rig: Phaser.GameObjects.Container;
  readonly shadow: Phaser.GameObjects.Image;
  private readonly legL: Phaser.GameObjects.Image;
  private readonly legR: Phaser.GameObjects.Image;
  private readonly face: Phaser.GameObjects.Image;
  private readonly hands: Phaser.GameObjects.Image;
  private readonly frontParts: Phaser.GameObjects.Image[] = [];
  private readonly hairParts: Phaser.GameObjects.Image[] = [];
  private readonly hairRear: Phaser.GameObjects.Image;

  private phase = 0;
  private flip = 1;
  private flipCurrent = 1;
  private sx = 1;
  private sy = 1;
  private mood: Mood = 'happy';
  /** Extra vertical offset used when lifted/seated. */
  lift = 0;
  /** Freeze walking animation (e.g. while seated). */
  legsHidden = false;
  /** Busy-hands animation (working at a station). */
  working = false;
  /** Current hair color; changes for good when dyed. */
  private baseHairColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly look: CharacterLook,
  ) {
    super(scene, x, y);
    this.baseHairColor = look.hairColor;
    this.shadow = scene.add.image(0, 0, TEX.shadow).setDisplaySize(46, 16);
    this.rig = scene.add.container(0, 0);

    this.legL = scene.add.image(-6, 0, TEX.leg).setOrigin(0.5, 1).setTint(look.legsTint);
    this.legR = scene.add.image(6, 0, TEX.leg).setOrigin(0.5, 1).setTint(look.legsTint);
    const body = scene.add.image(0, -12, look.bodyTexture).setOrigin(0.5, 1);
    if (look.bodyTint !== 0xffffff) body.setTint(look.bodyTint);
    this.hands = scene.add.image(0, -16, TEX.hands).setTint(look.skin);
    const parts: Phaser.GameObjects.GameObject[] = [this.legL, this.legR, body, this.hands];

    if (look.accessory) {
      parts.push(scene.add.image(0, -46, look.accessory).setOrigin(0.5, 0));
    }
    const backKey = hairBackKey(look.hairStyle);
    if (scene.textures.exists(backKey)) {
      const back = scene.add.image(0, HEAD_Y, backKey).setTint(look.hairColor);
      parts.push(back);
      this.frontParts.push(back);
      this.hairParts.push(back);
    }
    parts.push(scene.add.image(0, HEAD_Y, TEX.head).setTint(look.skin));
    this.face = scene.add.image(0, HEAD_Y + 3, faceKey('happy'));
    parts.push(this.face);
    this.frontParts.push(this.face);
    if (look.faceAccessory) {
      const worn = scene.add.image(0, HEAD_Y + 1, look.faceAccessory);
      parts.push(worn);
      this.frontParts.push(worn);
    }
    const frontKey = hairFrontKey(look.hairStyle);
    if (scene.textures.exists(frontKey)) {
      const front = scene.add.image(0, HEAD_Y, frontKey).setTint(look.hairColor);
      parts.push(front);
      this.frontParts.push(front);
      this.hairParts.push(front);
    }
    this.hairRear = scene.add
      .image(0, HEAD_Y, hairRearKey(look.hairStyle))
      .setTint(look.hairColor)
      .setVisible(false);
    parts.push(this.hairRear);
    this.hairParts.push(this.hairRear);

    this.rig.add(parts);
    this.add([this.shadow, this.rig]);
    scene.add.existing(this);
  }

  setMood(mood: Mood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    this.face.setTexture(faceKey(mood));
  }

  getMood(): Mood {
    return this.mood;
  }

  /** Temporarily recolor the hair (wet, burnt…); pass nothing to restore the base color. */
  setHairTint(color: number = this.baseHairColor): void {
    for (const h of this.hairParts) h.setTint(color);
  }

  /** Permanently change the hair color (dyed at the colour station). */
  setHairColor(color: number): void {
    this.baseHairColor = color;
    this.setHairTint();
  }

  get hairColor(): number {
    return this.baseHairColor;
  }

  /** World-space Y of the head center. */
  get headY(): number {
    return this.y + (HEAD_Y - this.lift) * this.scaleY;
  }

  setRearView(rear: boolean): void {
    this.hairRear.setVisible(rear);
    for (const p of this.frontParts) p.setVisible(!rear);
  }

  /** Seated/carried characters hide their legs' walk cycle and floor shadow. */
  setGrounded(grounded: boolean, showLegs = grounded): void {
    this.shadow.setVisible(grounded);
    this.legL.setVisible(showLegs);
    this.legR.setVisible(showLegs);
    this.legsHidden = !grounded;
  }

  faceTowards(dirX: number): void {
    if (Math.abs(dirX) > 0.1) this.flip = Math.sign(dirX);
  }

  /** Per-frame animation. `dir` is the current facing, `moving`/`dashing` drive the squash. */
  animate(dt: number, time: number, moving: boolean, dirX: number, dirY: number, dashing = false): void {
    const k = 1 - Math.exp(-dt * 16);
    if (moving) this.phase += dt * 13;
    else this.phase = 0;
    const s = Math.sin(this.phase);

    let tx = 1;
    let ty = 1 + Math.sin(time * 0.004) * 0.015;
    if (moving) {
      const land = 1 - Math.abs(s);
      tx = 1 + land * 0.05;
      ty = 1 - land * 0.07;
    }
    if (dashing) {
      tx = 1.22;
      ty = 0.8;
    }
    this.sx += (tx - this.sx) * k;
    this.sy += (ty - this.sy) * k;

    if (moving) {
      this.faceTowards(dirX);
      this.setRearView(dirY < -0.4 && Math.abs(dirX) < 0.75);
    }
    this.flipCurrent += (this.flip - this.flipCurrent) * Math.min(1, dt * 22);

    let bob = moving && !this.legsHidden ? Math.abs(s) * 2.5 : 0;
    if (this.working) {
      // Busy hands at head height and a little rhythmic bounce
      const w = Math.sin(time * 0.03);
      this.hands.y = -30 + w * 4;
      this.hands.x = w * 2;
      bob += Math.abs(w) * 1.5;
    } else {
      this.hands.y += (-16 - this.hands.y) * k;
      this.hands.x += (0 - this.hands.x) * k;
    }
    this.rig.setScale(this.sx * this.flipCurrent, this.sy);
    this.rig.y = -bob - this.lift;
    this.legL.y = moving && !this.legsHidden ? Math.max(0, s) * -3 : 0;
    this.legR.y = moving && !this.legsHidden ? Math.max(0, -s) * -3 : 0;
    // Dangling legs while carried
    const dangle = this.legsHidden && this.legL.visible ? Math.sin(time * 0.012) * 18 : 0;
    this.legL.angle = dangle;
    this.legR.angle = -dangle;
  }

  /** Quick scale punch, e.g. on pickup. */
  punch(amount = 0.18): void {
    this.sx = 1 - amount;
    this.sy = 1 + amount;
  }
}
