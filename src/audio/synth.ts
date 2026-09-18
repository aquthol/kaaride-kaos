/**
 * Small Web Audio building blocks. Everything is synthesised at runtime:
 * oscillators with ADSR-ish envelopes, filtered noise, and looping sources.
 */

export interface ToneSpec {
  type?: OscillatorType;
  /** Start frequency in Hz. */
  freq: number;
  /** Optional glide target. */
  freqEnd?: number;
  /** Offset from the sound's start, in seconds. */
  at?: number;
  dur: number;
  gain?: number;
  attack?: number;
  release?: number;
  /** Optional low-pass to soften harsh waveforms. */
  lowpass?: number;
  /** Random pitch variation (fraction), so repeats don't sound robotic. */
  jitter?: number;
}

export interface NoiseSpec {
  at?: number;
  dur: number;
  gain?: number;
  attack?: number;
  release?: number;
  filter?: BiquadFilterType;
  freq: number;
  freqEnd?: number;
  q?: number;
}

/** A sound is just layers of tones and noise bursts. */
export interface SoundSpec {
  tones?: ToneSpec[];
  noises?: NoiseSpec[];
}

export interface PlayOptions {
  volume?: number;
  /** Frequency multiplier, e.g. a higher coin jingle for a bigger tip. */
  pitch?: number;
}

const MIN_GAIN = 0.0001;
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** One second of white noise, reused by every noise voice. */
export function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

function envelope(
  ctx: BaseAudioContext,
  start: number,
  dur: number,
  peak: number,
  attack: number,
  release: number,
): GainNode {
  const gain = ctx.createGain();
  const top = Math.max(MIN_GAIN * 2, peak);
  gain.gain.setValueAtTime(MIN_GAIN, start);
  gain.gain.exponentialRampToValueAtTime(top, start + attack);
  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, start + dur + release);
  return gain;
}

export function playTone(
  ctx: BaseAudioContext,
  dest: AudioNode,
  spec: ToneSpec,
  t0: number,
  volume = 1,
  pitch = 1,
): void {
  const jitter = spec.jitter ?? 0.012;
  const wobble = 1 + (Math.random() * 2 - 1) * jitter;
  const start = t0 + (spec.at ?? 0);
  const attack = spec.attack ?? 0.008;
  const release = spec.release ?? Math.max(0.03, spec.dur * 0.5);

  const osc = ctx.createOscillator();
  osc.type = spec.type ?? 'sine';
  osc.frequency.setValueAtTime(Math.max(20, spec.freq * pitch * wobble), start);
  if (spec.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, spec.freqEnd * pitch * wobble),
      start + spec.dur,
    );
  }

  const gain = envelope(ctx, start, spec.dur, (spec.gain ?? 0.15) * volume, attack, release);
  osc.connect(gain);
  if (spec.lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(spec.lowpass, start);
    gain.connect(filter);
    filter.connect(dest);
  } else {
    gain.connect(dest);
  }
  osc.start(start);
  osc.stop(start + spec.dur + release + 0.05);
}

export function playNoise(
  ctx: BaseAudioContext,
  dest: AudioNode,
  spec: NoiseSpec,
  t0: number,
  volume = 1,
  pitch = 1,
): void {
  const start = t0 + (spec.at ?? 0);
  const attack = spec.attack ?? 0.005;
  const release = spec.release ?? Math.max(0.03, spec.dur * 0.5);

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = spec.filter ?? 'bandpass';
  filter.Q.value = spec.q ?? 1;
  filter.frequency.setValueAtTime(Math.max(30, spec.freq * pitch), start);
  if (spec.freqEnd !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(30, spec.freqEnd * pitch), start + spec.dur);
  }

  const gain = envelope(ctx, start, spec.dur, (spec.gain ?? 0.12) * volume, attack, release);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start(start);
  source.stop(start + spec.dur + release + 0.05);
}

/** Schedule a whole sound. Returns how many voices it used. */
export function playSpec(
  ctx: BaseAudioContext,
  dest: AudioNode,
  spec: SoundSpec,
  opts: PlayOptions = {},
): number {
  const t0 = ctx.currentTime;
  const volume = opts.volume ?? 1;
  const pitch = opts.pitch ?? 1;
  for (const tone of spec.tones ?? []) playTone(ctx, dest, tone, t0, volume, pitch);
  for (const noise of spec.noises ?? []) playNoise(ctx, dest, noise, t0, volume, pitch);
  return (spec.tones?.length ?? 0) + (spec.noises?.length ?? 0);
}

export interface LoopHandle {
  stop(fade?: number): void;
}

export interface NoiseLoopSpec {
  gain?: number;
  filter?: BiquadFilterType;
  freq: number;
  q?: number;
  /** Slow wobble of the filter, in Hz of modulation rate. */
  wobbleRate?: number;
  wobbleDepth?: number;
  /** Optional low tone layered under the noise (dryer hum). */
  hum?: { freq: number; gain: number; type?: OscillatorType };
  fadeIn?: number;
}

/** Continuous filtered noise (water, dryer). Fades in, and out again on stop. */
export function startNoiseLoop(ctx: BaseAudioContext, dest: AudioNode, spec: NoiseLoopSpec): LoopHandle {
  const now = ctx.currentTime;
  const fadeIn = spec.fadeIn ?? 0.12;
  const peak = Math.max(MIN_GAIN * 2, spec.gain ?? 0.1);

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = spec.filter ?? 'lowpass';
  filter.frequency.value = spec.freq;
  filter.Q.value = spec.q ?? 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(MIN_GAIN, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + fadeIn);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start(now);

  // Gentle movement so the loop does not sound static
  let lfo: OscillatorNode | null = null;
  if (spec.wobbleRate) {
    lfo = ctx.createOscillator();
    lfo.frequency.value = spec.wobbleRate;
    const depth = ctx.createGain();
    depth.gain.value = spec.wobbleDepth ?? spec.freq * 0.25;
    lfo.connect(depth);
    depth.connect(filter.frequency);
    lfo.start(now);
  }

  let hum: OscillatorNode | null = null;
  if (spec.hum) {
    hum = ctx.createOscillator();
    hum.type = spec.hum.type ?? 'sine';
    hum.frequency.value = spec.hum.freq;
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(MIN_GAIN, now);
    humGain.gain.exponentialRampToValueAtTime(Math.max(MIN_GAIN * 2, spec.hum.gain), now + fadeIn);
    hum.connect(humGain);
    humGain.connect(dest);
    hum.start(now);
  }

  let stopped = false;
  return {
    stop(fade = 0.14) {
      if (stopped) return;
      stopped = true;
      const end = ctx.currentTime + fade;
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, MIN_GAIN), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(MIN_GAIN, end);
        source.stop(end + 0.05);
        lfo?.stop(end + 0.05);
        hum?.stop(end + 0.05);
      } catch {
        // Already stopped; nothing to do.
      }
    },
  };
}

export interface ClickLoopSpec {
  /** Seconds between clicks. */
  interval: number;
  /** Random variation added to the interval. */
  intervalJitter?: number;
  click: SoundSpec;
  volume?: number;
}

/** Repeating short sound (scissor snips). Driven by a timer, not the audio clock. */
export function startClickLoop(ctx: BaseAudioContext, dest: AudioNode, spec: ClickLoopSpec): LoopHandle {
  let timer: number | undefined;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    playSpec(ctx, dest, spec.click, { volume: spec.volume ?? 1, pitch: 0.94 + Math.random() * 0.12 });
    const jitter = (spec.intervalJitter ?? 0) * Math.random();
    timer = window.setTimeout(tick, (spec.interval + jitter) * 1000);
  };
  tick();
  return {
    stop() {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
    },
  };
}
