import type Phaser from 'phaser';
import { FONT_FAMILY, PALETTE, css } from '../config/palette';

export function textStyle(
  size: number,
  color: string = css(PALETTE.text),
  weight: '600' | '700' | '800' | '900' = '800',
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT_FAMILY,
    fontSize: `${size}px`,
    fontStyle: weight,
    color,
    resolution: 2,
  };
}
