import Phaser from 'phaser';
import { TEX } from '../art/textureKeys';
import { makeTexture } from '../art/textureUtil';
import { VIEW } from '../config/gameConfig';
import { LAYOUT, ROOM } from '../config/layout';
import { PALETTE as P, css } from '../config/palette';
import { TEXT } from '../config/texts';
import { textStyle } from '../ui/textStyle';
import { DEPTH } from './depth';
import { PROPS } from './propDefs';
import { Prop } from './Prop';

/** Floor, walls, wall decor, rugs and non-station furniture. */
export function buildRoom(scene: Phaser.Scene, colliders: Phaser.Physics.Arcade.StaticGroup): void {
  const { left, right, top, bottom, wallFaceHeight, door } = ROOM;
  const W = VIEW.width;
  const H = VIEW.height;
  const faceTop = top - wallFaceHeight;

  scene.add
    .tileSprite(left, top - 12, right - left, H - top + 12, TEX.floor)
    .setOrigin(0)
    .setDepth(DEPTH.floor);

  // Static layers are baked once (cheaper than redrawing Graphics every frame) and cropped
  // into tight, non-overlapping pieces so no large transparent areas are blended.
  type Draw = (g: Phaser.GameObjects.Graphics) => void;
  type Rect = [key: string, x: number, y: number, w: number, h: number];
  const layer = (depth: number, pieces: Rect[], draw: Draw) => {
    for (const [key, x, y, w, h] of pieces) {
      makeTexture(scene, key, w, h, (g) => {
        g.translateCanvas(-x, -y);
        draw(g);
      });
      scene.add.image(x, y, key).setOrigin(0).setDepth(depth);
    }
  };

  // Soft ambient shadows cast by the walls onto the floor
  const shadeDepth = 30;
  const shadePieces: Rect[] = [
    ['room-shade-top', left, top, right - left, shadeDepth],
    ['room-shade-left', left, top + shadeDepth, 16, bottom - top - shadeDepth],
    ['room-shade-right', right - 16, top + shadeDepth, 16, bottom - top - shadeDepth],
    ['room-door-light', door.x1, bottom - 10, door.x2 - door.x1, H - bottom + 10],
  ];
  layer(DEPTH.floorShadow, shadePieces, (g) => {
    for (let i = 0; i < 6; i++) {
      g.fillStyle(P.wallShadow, 0.05);
      g.fillRect(left, top, right - left, 30 - i * 5);
      g.fillRect(left, top, 16 - i * 2.5, bottom - top);
      g.fillRect(right - (16 - i * 2.5), top, 16 - i * 2.5, bottom - top);
    }
    // Doorway light spill
    g.fillStyle(0xfff6d8, 0.35);
    g.fillRect(door.x1, bottom - 10, door.x2 - door.x1, H - bottom + 10);
  });

  const wallPieces: Rect[] = [
    ['room-wall-back', 0, VIEW.hudHeight, W, top - VIEW.hudHeight],
    ['room-wall-left', 0, top, left, H - top],
    ['room-wall-right', right, top, W - right, H - top],
  ];
  layer(DEPTH.wall, wallPieces, (g) => {
    // Back wall
    g.fillStyle(P.wallFace, 1);
    g.fillRect(0, faceTop, W, wallFaceHeight);
    g.fillStyle(P.wallStripe, 1);
    for (let x = 0; x < W; x += 40) g.fillRect(x, faceTop, 18, wallFaceHeight - 36);
    g.fillStyle(P.wainscot, 1);
    g.fillRect(0, top - 36, W, 36);
    g.lineStyle(2, P.wainscotDark, 0.7);
    for (let x = 30; x < W; x += 64) g.strokeRoundedRect(x, top - 30, 48, 20, 4);
    g.fillStyle(P.wallTrim, 1);
    g.fillRect(0, top - 40, W, 6);
    g.fillStyle(P.woodDark, 1);
    g.fillRect(0, top - 7, W, 7);
    // Wall cap (seen from above)
    g.fillStyle(P.wallTop, 1);
    g.fillRect(0, VIEW.hudHeight, W, faceTop - VIEW.hudHeight);
    g.fillStyle(P.wallTopLight, 1);
    g.fillRect(0, faceTop - 3, W, 3);
    // Side walls
    g.fillStyle(P.wallTop, 1);
    g.fillRect(0, VIEW.hudHeight, left, H - VIEW.hudHeight);
    g.fillRect(right, VIEW.hudHeight, W - right, H - VIEW.hudHeight);
    g.fillStyle(P.wallTopLight, 1);
    g.fillRect(left - 3, faceTop, 3, H - faceTop);
    g.fillRect(right, faceTop, 3, H - faceTop);
  });

  // Front wall with doorway; drawn above characters
  layer(DEPTH.frontWall, [['room-front', 0, bottom, W, H - bottom]], (g) => {
    g.fillStyle(P.wallTop, 1);
    g.fillRect(0, bottom, door.x1, H - bottom);
    g.fillRect(door.x2, bottom, W - door.x2, H - bottom);
    g.fillStyle(P.wallTopLight, 1);
    g.fillRect(left, bottom, door.x1 - left, 3);
    g.fillRect(door.x2, bottom, right - door.x2, 3);
    g.fillStyle(P.woodDark, 1);
    g.fillRect(door.x1 - 6, bottom, 6, H - bottom);
    g.fillRect(door.x2, bottom, 6, H - bottom);
  });

  scene.add.image(LAYOUT.door.x, bottom + 8, TEX.doormat).setDepth(DEPTH.rug);

  // Colliders around the room
  const walls: [number, number, number, number][] = [
    [W / 2, top - 30, W, 60],
    [W / 2, bottom + 30, W, 60],
    [left - 30, H / 2, 60, H],
    [right + 30, H / 2, 60, H],
  ];
  for (const [x, y, w, h] of walls) colliders.add(scene.add.zone(x, y, w, h));

  for (const rug of LAYOUT.rugs) scene.add.image(rug.x, rug.y, rug.texture).setDepth(DEPTH.rug);

  for (const d of LAYOUT.wallDecor) {
    scene.add.image(d.x, d.y, d.texture).setDepth(DEPTH.wallDecor);
  }
  const sign = LAYOUT.wallDecor.find((d) => d.texture === 'wall-sign-wait');
  if (sign) {
    scene.add
      .text(sign.x, sign.y + 4, TEXT.stations.wait.toUpperCase(), textStyle(17, css(P.outline), '900'))
      .setOrigin(0.5)
      .setDepth(DEPTH.wallDecor);
  }

  for (const p of LAYOUT.props) new Prop(scene, PROPS[p.prop], p.x, p.y, colliders);
}
