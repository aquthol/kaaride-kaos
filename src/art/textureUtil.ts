import Phaser from 'phaser';
import { PALETTE } from '../config/palette';

type G = Phaser.GameObjects.Graphics;

/** Draw into an off-screen Graphics and bake it into a texture. */
export function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: G) => void,
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

export function rrect(
  g: G,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: number,
  stroke: number | null = PALETTE.outline,
  lineWidth = 2,
  alpha = 1,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  if (stroke !== null) {
    g.lineStyle(lineWidth, stroke, 1);
    g.strokeRoundedRect(x, y, w, h, radius);
  }
}

export function ellipse(
  g: G,
  cx: number,
  cy: number,
  w: number,
  h: number,
  fill: number,
  stroke: number | null = PALETTE.outline,
  lineWidth = 2,
  alpha = 1,
): void {
  g.fillStyle(fill, alpha);
  g.fillEllipse(cx, cy, w, h);
  if (stroke !== null) {
    g.lineStyle(lineWidth, stroke, 1);
    g.strokeEllipse(cx, cy, w, h);
  }
}

export function circle(
  g: G,
  cx: number,
  cy: number,
  r: number,
  fill: number,
  stroke: number | null = PALETTE.outline,
  lineWidth = 2,
  alpha = 1,
): void {
  g.fillStyle(fill, alpha);
  g.fillCircle(cx, cy, r);
  if (stroke !== null) {
    g.lineStyle(lineWidth, stroke, 1);
    g.strokeCircle(cx, cy, r);
  }
}

export function poly(
  g: G,
  points: [number, number][],
  fill: number,
  stroke: number | null = PALETTE.outline,
  lineWidth = 2,
  alpha = 1,
): void {
  const pts = points.map(([x, y]) => new Phaser.Math.Vector2(x, y));
  g.fillStyle(fill, alpha);
  g.fillPoints(pts, true);
  if (stroke !== null) {
    g.lineStyle(lineWidth, stroke, 1);
    g.strokePoints(pts, true);
  }
}

/** A pointed leaf shape from (x, y) along `angle`. */
export function leaf(
  g: G,
  x: number,
  y: number,
  length: number,
  width: number,
  angle: number,
  fill: number,
  stroke: number | null = PALETTE.outline,
): void {
  const pts: [number, number][] = [];
  const steps = 8;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const push = (t: number, side: number) => {
    const along = t * length;
    const across = Math.sin(t * Math.PI) * width * 0.5 * side;
    pts.push([x + cos * along - sin * across, y + sin * along + cos * across]);
  };
  for (let i = 0; i <= steps; i++) push(i / steps, 1);
  for (let i = steps - 1; i > 0; i--) push(i / steps, -1);
  poly(g, pts, fill, stroke, 1.5);
}

/** Stroke an arc; angles in radians, clockwise on screen. */
export function arcStroke(
  g: G,
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  color: number,
  lineWidth: number,
): void {
  g.lineStyle(lineWidth, color, 1);
  g.beginPath();
  g.arc(cx, cy, r, from, to, false);
  g.strokePath();
}

/** Deterministic RNG so baked textures look identical every run. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
