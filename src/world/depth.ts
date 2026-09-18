/** Render layers. Everything that stands on the floor is y-sorted above `ySort`. */
export const DEPTH = {
  floor: 0,
  rug: 1,
  floorShadow: 2,
  shadow: 3,
  wall: 4,
  wallDecor: 5,
  ySort: 10,
  frontWall: 9000,
  fx: 9100,
  bubble: 9200,
  floating: 9300,
  hud: 9500,
} as const;

export function depthForY(y: number): number {
  return DEPTH.ySort + y;
}
