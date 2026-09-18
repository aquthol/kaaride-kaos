/**
 * All tunable gameplay values. Times are in seconds, money in euros.
 */

const params = new URLSearchParams(window.location.search);
/** `?debug` shows physics bodies. */
export const DEBUG = params.has('debug');
/** `?demo` pre-seats customers at every station (visual testing). */
export const DEMO = params.has('demo');
/** `?fast` shortens the round (testing the end-of-round flow). */
const FAST = params.has('fast');
/** `?players=2` starts a co-op round straight away (skips the menu choice). */
export const FORCED_PLAYERS = Number(params.get('players')) || 0;
/** `?level=colourday` starts a specific level (testing). */
export const FORCED_LEVEL = params.get('level') ?? '';

export const VIEW = {
  width: 1280,
  height: 720,
  hudHeight: 64,
} as const;

export const LEVEL = {
  /** Length of a round. */
  duration: FAST ? 12 : 180,
} as const;

export const PLAYER = {
  speed: 240,
  /** Speed multiplier while carrying a customer. */
  carrySpeedMultiplier: 0.88,
  dashSpeed: 640,
  dashDuration: 0.14,
  dashCooldown: 0.9,
  /** Physics footprint at the feet. */
  bodyWidth: 26,
  bodyHeight: 14,
  /** How far (px) in front of the player a station's footprint may be to interact with it. */
  interactRange: 44,
  /** Distance of the "reach point" in front of the player's feet. */
  reachDistance: 18,
} as const;

export const STATION_TIMES = {
  wash: 2.2,
  cut: 4.5,
  /** Long enough that waiting at the dryer is wasted time — go do something else. */
  dry: 9.5,
  /** Dryer: seconds after finishing before the warning starts flashing. */
  dryerWarnAfter: 3.0,
  /** Dryer: seconds after finishing before the hair burns. */
  dryerBurnAfter: 6.5,
  /** Colour: hold E this long to apply the dye… */
  colourApply: 2.0,
  /** …then it develops on its own for this long. */
  colourProcess: 6.0,
} as const;

export const PATIENCE = {
  /** Extra patience seconds for each recipe step (longer recipes are more forgiving). */
  bonusPerStep: 10,
  /** Drain multiplier while sitting at a work station (slow drying and colour sit here). */
  drainAtStationMultiplier: 0.45,
  /** Drain multiplier while being carried. */
  drainCarriedMultiplier: 0.6,
  /** Mood thresholds as fractions of max patience. */
  happyAbove: 0.6,
  neutralAbove: 0.3,
} as const;

export const SPAWN = {
  firstSpawnDelay: 1.5,
  /** Spawn interval at the start of the round. */
  intervalStart: 13,
  /** Spawn interval at the end of the round (lerped in between). */
  intervalEnd: 6,
  /** Hard cap of customers in the salon at once. */
  maxConcurrent: 6,
} as const;

export const AUDIO = {
  masterVolume: 0.85,
  sfxVolume: 0.9,
  /** Music sits well below the effects so it stays in the background. */
  musicVolume: 0.3,
  mutedByDefault: false,
  /** Simultaneous one-shot voices; extra sounds are dropped. */
  maxVoices: 24,
  /** Base tempo, and the livelier tempo for the last 30 seconds. */
  musicBpm: 96,
  musicBpmHurry: 108,
  /** Per-sound volume multipliers, for balancing without touching the sound data. */
  volumes: {
    uiHover: 0.7,
    uiSelect: 0.9,
    uiConfirm: 1,
    customerArrive: 0.9,
    pickUp: 0.85,
    putDown: 0.85,
    refuse: 0.8,
    stepDone: 0.9,
    colourApply: 0.85,
    colourDone: 1,
    dryerWarn: 0.85,
    burn: 1,
    angry: 0.95,
    payout: 1,
    dash: 0.7,
    hurry: 1,
    tick: 0.8,
    roundEnd: 1,
    star: 1,
  } as Record<string, number>,
} as const;

export const SCORE = {
  /** Tip at full patience before the customer type's multiplier. */
  baseTip: 8,
  angryPenalty: 8,
  burnPenalty: 12,
  /** Money needed for 1, 2 and 3 stars. */
  starThresholds: [60, 140, 230] as const,
} as const;
