import Phaser from 'phaser';
import { LAYOUT, ROOM } from '../config/layout';
import type { Point } from '../types';
import { PROPS, STATION_PROP } from './propDefs';

/**
 * The floor area a loose character may stand on: inside the room, outside every
 * piece of furniture. Built from the same layout data the colliders come from,
 * so it cannot drift out of sync with what the player bumps into.
 */
export class WalkableArea {
  private readonly blocks: Phaser.Geom.Rectangle[] = [];
  private readonly bounds: Phaser.Geom.Rectangle;
  /** The entrance lane; fine to walk through, but nobody should idle there. */
  readonly doorCorridor: Phaser.Geom.Rectangle;

  constructor() {
    this.bounds = new Phaser.Geom.Rectangle(
      ROOM.left,
      ROOM.top,
      ROOM.right - ROOM.left,
      ROOM.bottom - ROOM.top,
    );
    const footprint = (x: number, y: number, w: number, h: number) =>
      this.blocks.push(new Phaser.Geom.Rectangle(x - w / 2, y - h, w, h));

    for (const s of LAYOUT.stations) {
      const { w, h } = PROPS[STATION_PROP[s.kind]].footprint;
      footprint(s.x, s.y, w, h);
    }
    for (const p of LAYOUT.props) {
      const { w, h } = PROPS[p.prop].footprint;
      footprint(p.x, p.y, w, h);
    }

    this.doorCorridor = new Phaser.Geom.Rectangle(
      ROOM.door.x1 - 30,
      LAYOUT.walkway.doorRowY - 30,
      ROOM.door.x2 - ROOM.door.x1 + 60,
      ROOM.bottom - LAYOUT.walkway.doorRowY + 60,
    );
  }

  /** Is this spot clear, allowing for a body of `pad` half-size? */
  isClear(x: number, y: number, padX: number, padY: number): boolean {
    if (
      x < this.bounds.left + padX ||
      x > this.bounds.right - padX ||
      y < this.bounds.top + padY ||
      y > this.bounds.bottom - padY
    ) {
      return false;
    }
    return !this.blocks.some(
      (b) => x > b.left - padX && x < b.right + padX && y > b.top - padY && y < b.bottom + padY,
    );
  }

  /**
   * Nudge a point out of anything it has ended up inside, along whichever axis
   * needs the least movement — which reads as sliding along the obstacle.
   */
  clamp(x: number, y: number, padX: number, padY: number, keepInsideRoom = true): Point {
    let px = keepInsideRoom ? Phaser.Math.Clamp(x, this.bounds.left + padX, this.bounds.right - padX) : x;
    let py = keepInsideRoom ? Phaser.Math.Clamp(y, this.bounds.top + padY, this.bounds.bottom - padY) : y;

    // A couple of passes so wedged corners resolve cleanly
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const b of this.blocks) {
        const left = b.left - padX;
        const right = b.right + padX;
        const top = b.top - padY;
        const bottom = b.bottom + padY;
        if (px <= left || px >= right || py <= top || py >= bottom) continue;
        // Distance out of each side; take the cheapest escape
        const outLeft = px - left;
        const outRight = right - px;
        const outTop = py - top;
        const outBottom = bottom - py;
        const min = Math.min(outLeft, outRight, outTop, outBottom);
        if (min === outLeft) px = left;
        else if (min === outRight) px = right;
        else if (min === outTop) py = top;
        else py = bottom;
        moved = true;
      }
      if (!moved) break;
    }
    if (keepInsideRoom) {
      px = Phaser.Math.Clamp(px, this.bounds.left + padX, this.bounds.right - padX);
      py = Phaser.Math.Clamp(py, this.bounds.top + padY, this.bounds.bottom - padY);
    }
    return { x: px, y: py };
  }

  /** A clear spot to mill about in, away from the entrance. Falls back to `near`. */
  randomSpotNear(near: Point, minRadius: number, maxRadius: number, padX: number, padY: number): Point {
    for (let attempt = 0; attempt < 24; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = near.x + Math.cos(angle) * radius;
      const y = near.y + Math.sin(angle) * radius * 0.6;
      if (!this.isClear(x, y, padX, padY)) continue;
      if (Phaser.Geom.Rectangle.Contains(this.doorCorridor, x, y)) continue;
      return { x, y };
    }
    return this.clamp(near.x, near.y + 20, padX, padY);
  }
}

let shared: WalkableArea | null = null;

/** The layout is static, so one instance serves the whole game. */
export function walkableArea(): WalkableArea {
  if (!shared) shared = new WalkableArea();
  return shared;
}
