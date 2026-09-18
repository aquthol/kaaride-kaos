import { TEX } from '../art/textureKeys';
import type { Point, StationKind } from '../types';

export interface PropDef {
  texture: string;
  /** Collision box, bottom-aligned to the base point. */
  footprint: { w: number; h: number };
  shadow: { w: number; h: number };
  /** Where a customer's feet go, relative to the base point (stations only). */
  seat?: Point;
  /** Where the progress ring sits, relative to the base point (stations only). */
  ring?: Point;
}

export const PROPS = {
  sink: {
    texture: TEX.sink,
    footprint: { w: 88, h: 100 },
    shadow: { w: 112, h: 32 },
    seat: { x: 0, y: -36 },
    ring: { x: 52, y: -30 },
  },
  cutChair: {
    texture: TEX.cutChair,
    footprint: { w: 76, h: 100 },
    shadow: { w: 96, h: 28 },
    seat: { x: 0, y: -32 },
    ring: { x: 50, y: -30 },
  },
  colourStation: {
    texture: TEX.colourStation,
    footprint: { w: 92, h: 86 },
    shadow: { w: 116, h: 32 },
    seat: { x: -16, y: -30 },
    ring: { x: 56, y: -54 },
  },
  dryer: {
    texture: TEX.dryer,
    footprint: { w: 84, h: 70 },
    shadow: { w: 110, h: 30 },
    seat: { x: 0, y: -28 },
    ring: { x: -58, y: -40 },
  },
  counter: { texture: TEX.counter, footprint: { w: 168, h: 60 }, shadow: { w: 190, h: 36 }, seat: { x: 0, y: 46 } },
  waitChair: { texture: TEX.waitChair, footprint: { w: 64, h: 44 }, shadow: { w: 84, h: 24 }, seat: { x: 0, y: -22 } },
  plant: { texture: TEX.plant, footprint: { w: 36, h: 22 }, shadow: { w: 54, h: 18 } },
  bigPlant: { texture: TEX.bigPlant, footprint: { w: 48, h: 28 }, shadow: { w: 74, h: 22 } },
  table: { texture: TEX.table, footprint: { w: 78, h: 30 }, shadow: { w: 96, h: 26 } },
  display: { texture: TEX.display, footprint: { w: 112, h: 44 }, shadow: { w: 136, h: 36 } },
} satisfies Record<string, PropDef>;

export type PropKey = keyof typeof PROPS;

export const STATION_PROP: Record<StationKind, PropKey> = {
  wait: 'waitChair',
  wash: 'sink',
  cut: 'cutChair',
  colour: 'colourStation',
  dry: 'dryer',
  checkout: 'counter',
};
