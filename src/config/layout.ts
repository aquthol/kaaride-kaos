import type { Point, StationKind } from '../types';
import type { PropKey } from '../world/propDefs';

/** Interior floor bounds. The top wall face is drawn above `top`. */
export const ROOM = {
  left: 40,
  right: 1240,
  top: 176,
  bottom: 680,
  /** Visible height of the back wall face. */
  wallFaceHeight: 100,
  door: { x1: 88, x2: 196 },
} as const;

export interface StationPlacement extends Point {
  kind: StationKind;
}

export interface PropPlacement extends Point {
  prop: PropKey;
}

export interface WallDecorPlacement extends Point {
  texture: string;
}

export const LAYOUT = {
  playerSpawns: [
    { x: 600, y: 400 },
    { x: 800, y: 400 },
  ] as Point[],
  /** Where customers enter and leave. */
  door: { x: 142, y: 712 } as Point,
  /** Corridors customers walk along (they ignore collisions, these keep paths believable). */
  walkway: {
    /** Horizontal lane crossing the salon. */
    midRowY: 392,
    /** Vertical lane right of the waiting area. */
    sideColX: 252,
    /** Horizontal lane just inside the door. */
    doorRowY: 652,
  },
  stations: [
    { kind: 'wait', x: 96, y: 318 },
    { kind: 'wait', x: 184, y: 318 },
    { kind: 'wait', x: 96, y: 452 },
    { kind: 'wait', x: 184, y: 452 },
    { kind: 'wash', x: 420, y: 272 },
    { kind: 'wash', x: 546, y: 272 },
    { kind: 'cut', x: 716, y: 272 },
    { kind: 'cut', x: 846, y: 272 },
    { kind: 'dry', x: 1164, y: 352 },
    { kind: 'dry', x: 1164, y: 512 },
    { kind: 'colour', x: 880, y: 620 },
    { kind: 'colour', x: 1040, y: 620 },
    { kind: 'checkout', x: 420, y: 596 },
  ] as StationPlacement[],
  /**
   * Open floor spots a restless customer (a bored child) wanders between.
   * Every one is clear of furniture and of the doorway lane, and reachable on
   * foot, so the player can always walk over and pick them up.
   */
  wanderPoints: [
    { x: 330, y: 380 },
    { x: 470, y: 430 },
    { x: 620, y: 360 },
    { x: 560, y: 560 },
    { x: 760, y: 430 },
    { x: 900, y: 360 },
    { x: 1020, y: 470 },
    { x: 700, y: 620 },
  ] as Point[],
  props: [
    { prop: 'plant', x: 300, y: 236 },
    { prop: 'plant', x: 1000, y: 236 },
    { prop: 'plant', x: 1206, y: 664 },
    { prop: 'bigPlant', x: 66, y: 664 },
    { prop: 'table', x: 140, y: 560 },
    { prop: 'display', x: 700, y: 510 },
  ] as PropPlacement[],
  wallDecor: [
    { texture: 'wall-sign-wait', x: 140, y: 118 },
    { texture: 'wall-shelf', x: 484, y: 110 },
    { texture: 'wall-mirror', x: 716, y: 124 },
    { texture: 'wall-mirror', x: 846, y: 124 },
    { texture: 'wall-shelf-small', x: 1000, y: 112 },
    { texture: 'wall-clock', x: 1110, y: 112 },
    { texture: 'wall-window', x: 300, y: 118 },
  ] as WallDecorPlacement[],
  rugs: [
    { texture: 'rug-wait', x: 140, y: 420 },
    { texture: 'rug-round', x: 700, y: 500 },
  ] as WallDecorPlacement[],
} as const;
