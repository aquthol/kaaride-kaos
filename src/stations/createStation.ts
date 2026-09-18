import Phaser from 'phaser';
import type { StationPlacement } from '../config/layout';
import type { StationKind } from '../types';
import { Checkout } from './Checkout';
import { ColourStation } from './ColourStation';
import { CutStation } from './CutStation';
import { DryerStation } from './DryerStation';
import type { Station } from './Station';
import { WaitSeat } from './WaitSeat';
import { WashStation } from './WashStation';

type StationCtor = new (
  scene: Phaser.Scene,
  x: number,
  y: number,
  colliders: Phaser.Physics.Arcade.StaticGroup,
) => Station;

const STATION_CLASSES: Record<StationKind, StationCtor> = {
  wait: WaitSeat,
  wash: WashStation,
  cut: CutStation,
  colour: ColourStation,
  dry: DryerStation,
  checkout: Checkout,
};

export function createStation(
  scene: Phaser.Scene,
  placement: StationPlacement,
  colliders: Phaser.Physics.Arcade.StaticGroup,
): Station {
  return new STATION_CLASSES[placement.kind](scene, placement.x, placement.y, colliders);
}
