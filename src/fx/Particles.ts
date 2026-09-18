import Phaser from 'phaser';
import { FX } from '../art/drawFx';
import { PALETTE as P } from '../config/palette';
import { DEPTH } from '../world/depth';

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;
type EmitterConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

const registry = new WeakMap<Phaser.Scene, Particles>();

/** One pooled emitter per effect; call the burst methods with world positions. */
export class Particles {
  private readonly snip: Emitter;
  private readonly drop: Emitter;
  private readonly foam: Emitter;
  private readonly steamE: Emitter;
  private readonly smokeE: Emitter;
  private readonly coin: Emitter;
  private readonly sparkleE: Emitter;
  private readonly dustE: Emitter;
  private readonly angerE: Emitter;
  private readonly heartE: Emitter;

  static create(scene: Phaser.Scene): Particles {
    const p = new Particles(scene);
    registry.set(scene, p);
    return p;
  }

  static of(scene: Phaser.Scene): Particles | undefined {
    return registry.get(scene);
  }

  private constructor(private readonly scene: Phaser.Scene) {
    this.snip = this.make(FX.snip, {
      lifespan: { min: 550, max: 850 },
      speed: { min: 40, max: 110 },
      angle: { min: 180, max: 360 },
      gravityY: 380,
      rotate: { min: -180, max: 180 },
      scale: { start: 1, end: 0.7 },
      alpha: { start: 1, end: 0 },
    });
    this.drop = this.make(FX.drop, {
      lifespan: { min: 350, max: 600 },
      speed: { min: 50, max: 120 },
      angle: { min: 200, max: 340 },
      gravityY: 520,
      scale: { start: 1, end: 0.5 },
      alpha: { start: 1, end: 0.2 },
    });
    this.foam = this.make(FX.puff, {
      lifespan: { min: 500, max: 800 },
      speedY: { min: -30, max: -10 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.15, end: 0.45 },
      alpha: { start: 0.95, end: 0 },
    });
    this.steamE = this.make(FX.puff, {
      lifespan: { min: 700, max: 1100 },
      speedY: { min: -55, max: -25 },
      speedX: { min: -18, max: 18 },
      scale: { start: 0.35, end: 1.2 },
      alpha: { start: 0.75, end: 0 },
    });
    this.smokeE = this.make(FX.puff, {
      lifespan: { min: 900, max: 1500 },
      speedY: { min: -70, max: -30 },
      speedX: { min: -30, max: 30 },
      scale: { start: 0.5, end: 1.8 },
      alpha: { start: 0.85, end: 0 },
      tint: [0x4d4148, 0x5f5358, 0x3c3236],
    });
    this.coin = this.make(FX.coin, {
      lifespan: { min: 650, max: 900 },
      speed: { min: 150, max: 260 },
      angle: { min: 235, max: 305 },
      gravityY: 700,
      rotate: { min: -40, max: 40 },
      scale: { start: 1.1, end: 0.8 },
      alpha: { start: 1, end: 0 },
    });
    this.sparkleE = this.make(FX.sparkle, {
      lifespan: { min: 380, max: 620 },
      speed: { min: 30, max: 110 },
      rotate: { min: 0, max: 90 },
      scale: { start: 1, end: 0 },
      tint: [0xffffff, P.star, 0xfff1b8],
      blendMode: Phaser.BlendModes.ADD,
    });
    this.dustE = this.make(
      FX.puff,
      {
        lifespan: { min: 300, max: 520 },
        speed: { min: 10, max: 45 },
        angle: { min: 180, max: 360 },
        scale: { start: 0.25, end: 0.7 },
        alpha: { start: 0.55, end: 0 },
        tint: 0xe6d3bc,
      },
      DEPTH.shadow + 1,
    );
    this.angerE = this.make(FX.anger, {
      lifespan: 650,
      speedY: { min: -30, max: -15 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 1.2 },
      alpha: { start: 1, end: 0 },
    });
    this.heartE = this.make(FX.heart, {
      lifespan: { min: 700, max: 1000 },
      speedY: { min: -70, max: -40 },
      speedX: { min: -25, max: 25 },
      scale: { start: 0.6, end: 1.2 },
      alpha: { start: 1, end: 0 },
    });
  }

  private make(texture: string, config: EmitterConfig, depth: number = DEPTH.fx): Emitter {
    return this.scene.add.particles(0, 0, texture, { ...config, emitting: false }).setDepth(depth);
  }

  snips(x: number, y: number, hairColor: number, count = 2): void {
    this.snip.setParticleTint(hairColor);
    this.snip.explode(count, x, y);
  }

  droplets(x: number, y: number, count = 2): void {
    this.drop.explode(count, x, y);
  }

  bubbles(x: number, y: number, count = 1): void {
    this.foam.explode(count, x, y);
  }

  steam(x: number, y: number, count = 1, tint = 0xffffff): void {
    this.steamE.setParticleTint(tint);
    this.steamE.explode(count, x, y);
  }

  smoke(x: number, y: number, count = 2): void {
    this.smokeE.explode(count, x, y);
  }

  coins(x: number, y: number, count = 8): void {
    this.coin.explode(count, x, y);
  }

  sparkle(x: number, y: number, count = 8): void {
    this.sparkleE.explode(count, x, y);
  }

  dust(x: number, y: number, count = 3): void {
    this.dustE.explode(count, x, y);
  }

  anger(x: number, y: number): void {
    this.angerE.explode(1, x, y);
  }

  hearts(x: number, y: number, count = 3): void {
    this.heartE.explode(count, x, y);
  }
}
