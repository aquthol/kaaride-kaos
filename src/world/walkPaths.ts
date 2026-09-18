import { LAYOUT } from '../config/layout';
import type { Point } from '../types';

const { midRowY, sideColX, doorRowY } = LAYOUT.walkway;
const door = LAYOUT.door;

/** Door → waiting seat, approaching the seat from the front. */
export function pathToSeat(seat: Point, seatBaseY: number): Point[] {
  const frontY = seatBaseY + 14;
  return [
    { x: door.x, y: doorRowY },
    { x: sideColX, y: doorRowY },
    { x: sideColX, y: frontY },
    { x: seat.x, y: frontY },
    seat,
  ];
}

/** Seated customers step this far forward before walking off (in front of their own seat row). */
const STEP_FORWARD = 36;

/** Anywhere → out of the door. */
export function pathToDoor(from: Point): Point[] {
  const path: Point[] = [];
  if (from.x < sideColX) {
    // Waiting area: leave along the front of the seat row (mirrors the way in)
    const frontY = Math.min(from.y + STEP_FORWARD, doorRowY);
    path.push({ x: from.x, y: frontY }, { x: sideColX, y: frontY });
  } else if (from.y < doorRowY - 60) {
    path.push({ x: from.x, y: midRowY }, { x: sideColX, y: midRowY });
  }
  path.push({ x: sideColX, y: doorRowY }, { x: door.x, y: doorRowY }, { x: door.x, y: door.y + 30 });
  return path;
}
