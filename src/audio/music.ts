import { playTone } from './synth';

/** Chord progression (I–V–vi–IV in C), one chord per bar. */
const PROGRESSION: number[][] = [
  [261.63, 329.63, 392.0], // C
  [196.0, 246.94, 392.0], // G
  [220.0, 261.63, 329.63], // Am
  [174.61, 220.0, 261.63], // F
];

/** Pentatonic notes the melody wanders through. */
const MELODY = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
/** Which eighth notes of a bar get a pluck (rests keep it unobtrusive). */
const MELODY_PATTERN = [true, false, true, false, false, true, false, true];

const STEPS_PER_BAR = 8;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.22;

/**
 * Light background loop: a soft pad under a gently plucked melody.
 * Notes are scheduled on the audio clock a little ahead of time.
 */
export class MusicPlayer {
  private timer: number | undefined;
  private nextStepTime = 0;
  private step = 0;
  private bpm = 96;
  private melodyIndex = 2;

  constructor(
    private readonly ctx: BaseAudioContext,
    private readonly dest: AudioNode,
  ) {}

  get playing(): boolean {
    return this.timer !== undefined;
  }

  start(): void {
    if (this.playing) return;
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  /** Slightly faster in the last stretch of a round. */
  setTempo(bpm: number): void {
    this.bpm = bpm;
  }

  private get stepDuration(): number {
    return 30 / this.bpm; // an eighth note
  }

  private schedule(): void {
    while (this.nextStepTime < this.ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleStep(this.step, this.nextStepTime);
      this.nextStepTime += this.stepDuration;
      this.step = (this.step + 1) % (STEPS_PER_BAR * PROGRESSION.length);
    }
  }

  private scheduleStep(step: number, time: number): void {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const beat = step % STEPS_PER_BAR;

    // Pad: one soft chord at the start of each bar
    if (beat === 0) {
      const chord = PROGRESSION[bar];
      const barLength = this.stepDuration * STEPS_PER_BAR;
      chord.forEach((freq, i) => {
        playTone(
          this.ctx,
          this.dest,
          {
            type: i === 0 ? 'triangle' : 'sine',
            freq,
            dur: barLength * 0.9,
            gain: i === 0 ? 0.05 : 0.035,
            attack: 0.35,
            release: 0.5,
            jitter: 0.002,
          },
          time,
        );
      });
    }

    // Melody: a gentle pluck that steps around the pentatonic scale
    if (MELODY_PATTERN[beat]) {
      const drift = Math.random() < 0.5 ? -1 : 1;
      this.melodyIndex = Math.min(MELODY.length - 1, Math.max(0, this.melodyIndex + drift));
      playTone(
        this.ctx,
        this.dest,
        {
          type: 'triangle',
          freq: MELODY[this.melodyIndex],
          dur: this.stepDuration * 0.5,
          gain: 0.045,
          attack: 0.01,
          release: 0.18,
          jitter: 0.004,
        },
        time,
      );
    }
  }
}
