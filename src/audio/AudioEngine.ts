import { AUDIO } from '../config/gameConfig';
import { MusicPlayer } from './music';
import { LOOPS, SFX, type LoopName, type SfxName } from './sfx';
import { playSpec, startClickLoop, startNoiseLoop, type LoopHandle, type PlayOptions } from './synth';

const STORAGE_KEY = 'rkk.audio';
const NOOP_LOOP: LoopHandle = { stop: () => {} };

interface AudioSettings {
  muted: boolean;
  master: number;
  sfx: number;
  music: number;
}

interface Buses {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
}

/**
 * Owns the AudioContext and the sfx/music buses. The context is only created
 * on the first user gesture (browser autoplay policy), and every call is safe
 * to make before that — sounds simply do nothing.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  static get(): AudioEngine {
    if (!this.instance) this.instance = new AudioEngine();
    return this.instance;
  }

  private buses: Buses | null = null;
  private musicPlayer: MusicPlayer | null = null;
  private readonly activeLoops = new Set<LoopHandle>();
  private readonly listeners = new Set<() => void>();
  private settings: AudioSettings;
  private voices = 0;
  private wantsMusic = false;
  private initialised = false;

  private constructor() {
    this.settings = this.loadSettings();
  }

  /** Attach the gesture listeners that unlock audio. Safe to call more than once. */
  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    const unlock = () => this.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM' && !e.repeat) this.toggleMute();
    });
  }

  get muted(): boolean {
    return this.settings.muted;
  }

  get ready(): boolean {
    return this.buses !== null;
  }

  /** For tests and debugging. */
  get activeLoopCount(): number {
    return this.activeLoops.size;
  }

  get contextState(): string {
    return this.buses?.ctx.state ?? 'none';
  }

  /** Create (or resume) the context. Only ever called from a user gesture. */
  unlock(): void {
    try {
      if (!this.buses) this.buses = this.createBuses();
      if (!this.buses) return;
      if (this.buses.ctx.state === 'suspended') void this.buses.ctx.resume();
      if (this.wantsMusic) this.startMusic();
    } catch {
      // Audio unavailable; the game stays silent.
    }
  }

  private createBuses(): Buses | null {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    const sfx = ctx.createGain();
    const music = ctx.createGain();
    master.connect(ctx.destination);
    sfx.connect(master);
    music.connect(master);
    const buses = { ctx, master, sfx, music };
    this.applySettings(buses);
    return buses;
  }

  private applySettings(buses: Buses = this.buses!): void {
    if (!buses) return;
    buses.master.gain.value = this.settings.muted ? 0 : this.settings.master;
    buses.sfx.gain.value = this.settings.sfx;
    buses.music.gain.value = this.settings.music;
  }

  // --- settings -------------------------------------------------------------

  private loadSettings(): AudioSettings {
    const defaults: AudioSettings = {
      muted: AUDIO.mutedByDefault,
      master: AUDIO.masterVolume,
      sfx: AUDIO.sfxVolume,
      music: AUDIO.musicVolume,
    };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const saved = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        muted: saved.muted ?? defaults.muted,
        master: saved.master ?? defaults.master,
        sfx: saved.sfx ?? defaults.sfx,
        music: saved.music ?? defaults.music,
      };
    } catch {
      return defaults;
    }
  }

  private saveSettings(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage unavailable (private mode); settings just won't persist.
    }
  }

  setMuted(muted: boolean): void {
    this.settings.muted = muted;
    this.applySettings();
    this.saveSettings();
    for (const cb of this.listeners) cb();
  }

  toggleMute(): void {
    this.setMuted(!this.settings.muted);
  }

  setVolume(bus: 'master' | 'sfx' | 'music', value: number): void {
    this.settings[bus] = Math.max(0, Math.min(1, value));
    this.applySettings();
    this.saveSettings();
    for (const cb of this.listeners) cb();
  }

  /** Subscribe to mute/volume changes (UI icons). Returns an unsubscribe function. */
  onChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // --- playback -------------------------------------------------------------

  play(name: SfxName, opts: PlayOptions = {}): void {
    const buses = this.buses;
    if (!buses || this.settings.muted) return;
    if (this.voices >= AUDIO.maxVoices) return;
    try {
      const spec = SFX[name];
      const volume = (opts.volume ?? 1) * (AUDIO.volumes[name] ?? 1);
      const used = playSpec(buses.ctx, buses.sfx, spec, { ...opts, volume });
      this.voices += used;
      window.setTimeout(() => {
        this.voices = Math.max(0, this.voices - used);
      }, 1200);
    } catch {
      // Never let a sound break gameplay.
    }
  }

  /** Start a looping station sound. Always returns a handle, even when silent. */
  startLoop(name: LoopName): LoopHandle {
    const buses = this.buses;
    if (!buses) return NOOP_LOOP;
    try {
      const def = LOOPS[name];
      const handle =
        def.kind === 'clicks'
          ? startClickLoop(buses.ctx, buses.sfx, def.spec)
          : startNoiseLoop(buses.ctx, buses.sfx, def.spec);
      const tracked: LoopHandle = {
        stop: (fade?: number) => {
          handle.stop(fade);
          this.activeLoops.delete(tracked);
        },
      };
      this.activeLoops.add(tracked);
      return tracked;
    } catch {
      return NOOP_LOOP;
    }
  }

  /** Stop every looping sound; called on scene shutdown so nothing leaks. */
  stopLoops(): void {
    for (const loop of [...this.activeLoops]) loop.stop(0.05);
    this.activeLoops.clear();
  }

  // --- music ----------------------------------------------------------------

  startMusic(): void {
    this.wantsMusic = true;
    const buses = this.buses;
    if (!buses) return;
    if (!this.musicPlayer) this.musicPlayer = new MusicPlayer(buses.ctx, buses.music);
    this.musicPlayer.start();
  }

  stopMusic(): void {
    this.wantsMusic = false;
    this.musicPlayer?.stop();
  }

  setMusicTempo(bpm: number): void {
    this.musicPlayer?.setTempo(bpm);
  }

  /** Full stop: loops and music. */
  stopAll(): void {
    this.stopLoops();
    this.stopMusic();
  }
}
