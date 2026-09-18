import Phaser from 'phaser';
import { AudioEngine } from '../audio/AudioEngine';
import { profilesFor } from '../config/controls';
import { AUDIO, DEMO, FORCED_LEVEL, FORCED_PLAYERS, VIEW } from '../config/gameConfig';
import { LAYOUT } from '../config/layout';
import { getLevel, LEVELS, type LevelDef } from '../config/levels';
import { PALETTE } from '../config/palette';
import { TEXT } from '../config/texts';
import type { Customer } from '../entities/Customer';
import { Particles } from '../fx/Particles';
import { PLAYER_COLORS, PLAYER_LOOKS } from '../entities/looks';
import { Player } from '../entities/Player';
import { PlayerInput } from '../input/PlayerInput';
import { createStation } from '../stations/createStation';
import type { Station } from '../stations/Station';
import { WaitingArea } from '../stations/WaitingArea';
import { WaitSeat } from '../stations/WaitSeat';
import { demoSetup } from '../systems/demoSetup';
import { FeedbackSystem } from '../systems/FeedbackSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { showBanner } from '../ui/Banner';
import { DEPTH } from '../world/depth';
import { PROPS, STATION_PROP } from '../world/propDefs';
import { Prop } from '../world/Prop';
import { buildRoom } from '../world/Room';

/** Seconds left when the "hurry" banner appears. */
const HURRY_AT = 30;

export interface EndData {
  money: number;
  served: number;
  angry: number;
  /** Number of players, so "Proovi uuesti" restarts in the same mode. */
  players: number;
  levelId: string;
}

export interface GameData {
  players?: number;
  levelId?: string;
}

export class GameScene extends Phaser.Scene {
  private players: Player[] = [];
  private stations: Station[] = [];
  private customers: Customer[] = [];
  private interaction!: InteractionSystem;
  private spawner!: SpawnSystem;
  score!: ScoreSystem;
  private elapsed = 0;
  private ended = false;
  private hurryShown = false;
  private playerCount = 1;
  private level: LevelDef = LEVELS[0];

  constructor() {
    super('Game');
  }

  /** Seconds left in the round, for the HUD. */
  get remaining(): number {
    return Math.max(0, this.level.duration - this.elapsed);
  }

  create(data: GameData): void {
    this.players = [];
    this.stations = [];
    this.customers = [];
    this.elapsed = 0;
    this.ended = false;
    this.playerCount = FORCED_PLAYERS || data?.players || 1;
    this.level = getLevel(FORCED_LEVEL || data?.levelId);

    this.hurryShown = false;
    this.physics.resume();
    Particles.create(this);
    new FeedbackSystem(this);

    const colliders = this.physics.add.staticGroup();
    buildRoom(this, colliders);

    // Stations this level doesn't use stay as furniture under a dust sheet
    this.stations = [];
    for (const placement of LAYOUT.stations) {
      if (this.level.stations.includes(placement.kind)) {
        this.stations.push(createStation(this, placement, colliders));
      } else {
        new Prop(this, PROPS[STATION_PROP[placement.kind]], placement.x, placement.y, colliders).cover(this);
      }
    }
    const waiting = new WaitingArea(this.stations.filter((s): s is WaitSeat => s instanceof WaitSeat));

    const profiles = profilesFor(this.playerCount);
    profiles.forEach((profile, i) => {
      // Markers only make sense when there is someone to tell apart
      const marker = profiles.length > 1 ? PLAYER_COLORS[i] : null;
      const player = new Player(
        this,
        i,
        new PlayerInput(this, profile),
        LAYOUT.playerSpawns[i],
        PLAYER_LOOKS[i],
        marker,
      );
      this.physics.add.collider(player.feet, colliders);
      this.players.push(player);
    });

    this.interaction = new InteractionSystem(this.stations);
    this.score = new ScoreSystem(this);
    this.spawner = new SpawnSystem(
      this,
      this.level,
      waiting,
      () => this.customers.length,
      (c) => this.customers.push(c),
    );

    if (DEMO) this.customers.push(...demoSetup(this, this.stations, this.players));

    this.add
      .rectangle(0, 0, VIEW.width, VIEW.hudHeight, PALETTE.hudBand)
      .setOrigin(0)
      .setDepth(DEPTH.hud);

    // Loops never survive a round; music keeps playing across scenes
    const audio = AudioEngine.get();
    audio.stopLoops();
    audio.setMusicTempo(AUDIO.musicBpm);
    audio.startMusic();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => audio.stopLoops());

    this.scene.launch('Hud');
    this.scene.bringToTop('Hud');
    this.cameras.main.fadeIn(300, 46, 34, 48);
    this.time.delayedCall(350, () => showBanner(this, TEXT.banner.start, PALETTE.good));
  }

  update(time: number, deltaMs: number): void {
    if (this.ended) return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.elapsed += dt;

    for (const p of this.players) p.update(dt);
    this.interaction.update(this.players, dt);
    this.spawner.update(dt, this.elapsed);
    for (const s of this.stations) s.update(dt, time);
    for (const c of this.customers) c.update(dt, time);
    this.customers = this.customers.filter((c) => !c.removed);
    for (const p of this.players) p.lateUpdate(dt, time);

    if (!this.hurryShown && this.level.duration > HURRY_AT * 2 && this.remaining <= HURRY_AT) {
      this.hurryShown = true;
      showBanner(this, TEXT.banner.hurry, PALETTE.warn, 700);
      AudioEngine.get().play('hurry');
      AudioEngine.get().setMusicTempo(AUDIO.musicBpmHurry);
    }
    if (this.elapsed >= this.level.duration) this.endLevel();
  }

  private endLevel(): void {
    this.ended = true;
    this.physics.pause();
    for (const p of this.players) p.view.working = false;
    const data: EndData = {
      money: this.score.money,
      served: this.score.served,
      angry: this.score.angry,
      players: this.playerCount,
      levelId: this.level.id,
    };
    showBanner(this, TEXT.banner.end, PALETTE.accent, 700);
    const audio = AudioEngine.get();
    audio.stopLoops();
    audio.play('roundEnd');
    audio.setMusicTempo(AUDIO.musicBpm);
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(250, 46, 34, 48);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop('Hud');
        this.scene.start('End', data);
      });
    });
  }
}
