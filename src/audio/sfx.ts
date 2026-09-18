import type { ClickLoopSpec, NoiseLoopSpec, SoundSpec } from './synth';

/**
 * Every sound as data. Adding a sound means adding an entry here
 * (and a volume in AUDIO.volumes if it needs balancing).
 */
export const SFX = {
  /** Menu hover: soft short blip. */
  uiHover: {
    tones: [{ type: 'sine', freq: 880, dur: 0.05, gain: 0.08, release: 0.04 }],
  },
  /** Player-count pill: slightly brighter select blip. */
  uiSelect: {
    tones: [{ type: 'triangle', freq: 660, freqEnd: 990, dur: 0.09, gain: 0.11 }],
  },
  /** Confirm: rising two-note chime. */
  uiConfirm: {
    tones: [
      { type: 'triangle', freq: 659, dur: 0.12, gain: 0.13 },
      { type: 'triangle', freq: 988, at: 0.09, dur: 0.24, gain: 0.13, release: 0.2 },
    ],
  },
  /** Door bell when a customer walks in. */
  customerArrive: {
    tones: [
      { type: 'triangle', freq: 988, dur: 0.22, gain: 0.12, release: 0.25 },
      { type: 'sine', freq: 988, dur: 0.22, gain: 0.05, release: 0.25 },
      { type: 'triangle', freq: 784, at: 0.17, dur: 0.3, gain: 0.12, release: 0.35 },
    ],
  },
  /** Lifting a customer: upward whoosh plus a soft pop. */
  pickUp: {
    tones: [{ type: 'sine', freq: 520, freqEnd: 820, dur: 0.11, gain: 0.11 }],
    noises: [{ freq: 500, freqEnd: 1900, dur: 0.16, gain: 0.07, q: 0.8 }],
  },
  /** Setting a customer down: soft thud and a confirming blip. */
  putDown: {
    tones: [{ type: 'triangle', freq: 440, dur: 0.07, gain: 0.1, at: 0.05 }],
    noises: [{ filter: 'lowpass', freq: 220, dur: 0.1, gain: 0.14, q: 0.7 }],
  },
  /** Station says no. Fires often, so it stays low and dull. */
  refuse: {
    tones: [{ type: 'square', freq: 150, freqEnd: 112, dur: 0.13, gain: 0.055, lowpass: 620, jitter: 0.02 }],
  },
  /** Squeezing dye onto the hair: a soft pump. */
  colourApply: {
    tones: [{ type: 'sine', freq: 220, freqEnd: 150, dur: 0.12, gain: 0.09, lowpass: 700 }],
    noises: [{ filter: 'lowpass', freq: 700, dur: 0.14, gain: 0.06, q: 0.8, at: 0.02 }],
  },
  /** Colour is ready: bright chime. */
  colourDone: {
    tones: [
      { type: 'triangle', freq: 880, dur: 0.1, gain: 0.11 },
      { type: 'triangle', freq: 1319, at: 0.08, dur: 0.14, gain: 0.11 },
      { type: 'sine', freq: 1760, at: 0.16, dur: 0.24, gain: 0.07, release: 0.25 },
    ],
  },
  /** A bored child slipping off the chair. */
  giggle: {
    tones: [
      { type: 'sine', freq: 780, freqEnd: 1040, dur: 0.07, gain: 0.08, jitter: 0.03 },
      { type: 'sine', freq: 980, freqEnd: 1240, at: 0.09, dur: 0.08, gain: 0.08, jitter: 0.03 },
    ],
  },
  /** Press photographers greeting the celebrity. */
  cameraShutter: {
    tones: [{ type: 'square', freq: 1600, dur: 0.02, gain: 0.05, lowpass: 3000 }],
    noises: [
      { freq: 4200, dur: 0.04, gain: 0.09, q: 1.2 },
      { freq: 2600, freqEnd: 900, at: 0.05, dur: 0.12, gain: 0.05, q: 0.8 },
    ],
  },
  /** The dog, when someone trips over it. */
  bark: {
    tones: [{ type: 'sawtooth', freq: 300, freqEnd: 190, dur: 0.1, gain: 0.08, lowpass: 900, jitter: 0.05 }],
    noises: [{ filter: 'bandpass', freq: 900, freqEnd: 500, dur: 0.09, gain: 0.07, q: 1.4 }],
  },
  /** A recipe step finished: bright sparkle arpeggio. */
  stepDone: {
    tones: [
      { type: 'triangle', freq: 784, dur: 0.08, gain: 0.1 },
      { type: 'triangle', freq: 988, at: 0.06, dur: 0.08, gain: 0.1 },
      { type: 'triangle', freq: 1175, at: 0.12, dur: 0.08, gain: 0.1 },
      { type: 'sine', freq: 1568, at: 0.18, dur: 0.16, gain: 0.09, release: 0.2 },
    ],
  },
  /** Dryer is overdue; pitch rises as the burn approaches (pass `pitch`). */
  dryerWarn: {
    tones: [
      { type: 'square', freq: 784, dur: 0.07, gain: 0.07, lowpass: 2200 },
      { type: 'square', freq: 784, at: 0.12, dur: 0.07, gain: 0.07, lowpass: 2200 },
    ],
  },
  /** Hair burns: sad descending tone with a hiss. */
  burn: {
    tones: [{ type: 'triangle', freq: 440, freqEnd: 150, dur: 0.5, gain: 0.14, release: 0.25 }],
    noises: [{ filter: 'highpass', freq: 2200, dur: 0.55, gain: 0.06, q: 0.5 }],
  },
  /** Comedic wah-wah when a customer storms out. */
  angry: {
    tones: [
      { type: 'sawtooth', freq: 330, freqEnd: 294, dur: 0.16, gain: 0.09, lowpass: 900 },
      { type: 'sawtooth', freq: 294, freqEnd: 262, at: 0.16, dur: 0.16, gain: 0.09, lowpass: 820 },
      { type: 'sawtooth', freq: 262, freqEnd: 175, at: 0.32, dur: 0.34, gain: 0.1, lowpass: 720, release: 0.25 },
    ],
  },
  /** Coin jingle; a bigger tip raises `pitch`. */
  payout: {
    tones: [
      { type: 'triangle', freq: 1319, dur: 0.07, gain: 0.1 },
      { type: 'triangle', freq: 1760, at: 0.07, dur: 0.1, gain: 0.1 },
      { type: 'sine', freq: 2093, at: 0.14, dur: 0.18, gain: 0.07, release: 0.2 },
    ],
  },
  /** Dash: short air whoosh. */
  dash: {
    noises: [{ freq: 320, freqEnd: 2400, dur: 0.2, gain: 0.09, q: 0.9 }],
  },
  /** "Last 30 seconds" alert. */
  hurry: {
    tones: [
      { type: 'triangle', freq: 1047, dur: 0.12, gain: 0.12 },
      { type: 'triangle', freq: 784, at: 0.13, dur: 0.12, gain: 0.1 },
      { type: 'triangle', freq: 1047, at: 0.26, dur: 0.22, gain: 0.12, release: 0.2 },
    ],
  },
  /** Soft tick in the final seconds. */
  tick: {
    tones: [{ type: 'sine', freq: 1200, dur: 0.035, gain: 0.06, release: 0.03 }],
  },
  /** Round over: short fanfare. */
  roundEnd: {
    tones: [
      { type: 'triangle', freq: 523, dur: 0.14, gain: 0.13 },
      { type: 'triangle', freq: 659, at: 0.13, dur: 0.14, gain: 0.13 },
      { type: 'triangle', freq: 784, at: 0.26, dur: 0.16, gain: 0.13 },
      { type: 'triangle', freq: 1047, at: 0.42, dur: 0.38, gain: 0.14, release: 0.35 },
      { type: 'sine', freq: 1568, at: 0.42, dur: 0.38, gain: 0.06, release: 0.35 },
    ],
  },
  /** One note per star on the end screen (pass `pitch` per star). */
  star: {
    tones: [
      { type: 'triangle', freq: 659, dur: 0.16, gain: 0.12, release: 0.2 },
      { type: 'sine', freq: 1318, dur: 0.16, gain: 0.05, release: 0.2 },
    ],
  },
} satisfies Record<string, SoundSpec>;

export type SfxName = keyof typeof SFX;

/** Looping sounds tied to station state. */
export const LOOPS = {
  /** Running water at the sink. */
  wash: {
    kind: 'noise',
    spec: {
      filter: 'lowpass',
      freq: 900,
      q: 0.8,
      gain: 0.075,
      wobbleRate: 5.5,
      wobbleDepth: 260,
      fadeIn: 0.15,
    } as NoiseLoopSpec,
  },
  /** Low hum of the hood dryer. */
  dry: {
    kind: 'noise',
    spec: {
      filter: 'lowpass',
      freq: 420,
      q: 0.7,
      gain: 0.07,
      wobbleRate: 0.8,
      wobbleDepth: 60,
      hum: { freq: 92, gain: 0.05, type: 'triangle' },
      fadeIn: 0.2,
    } as NoiseLoopSpec,
  },
  /** Brushing the dye in: soft wet strokes. */
  colourApply: {
    kind: 'noise',
    spec: {
      filter: 'lowpass',
      freq: 620,
      q: 0.8,
      gain: 0.05,
      wobbleRate: 3.2,
      wobbleDepth: 200,
      fadeIn: 0.1,
    } as NoiseLoopSpec,
  },
  /** Dye developing: quiet bubbling. */
  colour: {
    kind: 'clicks',
    spec: {
      interval: 0.32,
      intervalJitter: 0.25,
      volume: 0.75,
      click: {
        tones: [{ type: 'sine', freq: 420, freqEnd: 720, dur: 0.05, gain: 0.05, jitter: 0.08 }],
      },
    } as ClickLoopSpec,
  },
  /** Rhythmic scissor snips. */
  cut: {
    kind: 'clicks',
    spec: {
      interval: 0.17,
      intervalJitter: 0.06,
      volume: 0.9,
      click: {
        noises: [
          { freq: 3200, freqEnd: 2200, dur: 0.03, gain: 0.08, q: 3 },
          { freq: 5200, dur: 0.02, gain: 0.05, q: 4, at: 0.035 },
        ],
      },
    } as ClickLoopSpec,
  },
} as const;

export type LoopName = keyof typeof LOOPS;
