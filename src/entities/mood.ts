import { PATIENCE } from '../config/gameConfig';
import type { Mood } from '../types';

/** Face mood from remaining patience ratio (0..1). "Burnt" is set explicitly by the dryer, not here. */
export function moodForPatience(ratio: number): Mood {
  if (ratio > PATIENCE.happyAbove) return 'happy';
  if (ratio > PATIENCE.neutralAbove) return 'neutral';
  return 'angry';
}
