import type { StepKind } from '../types';

export interface RecipeDef {
  id: string;
  /** Display name (Estonian). */
  name: string;
  steps: StepKind[];
  price: number;
  /** Relative spawn weight. */
  weight: number;
  /** Seconds into the round before this recipe can appear. */
  unlockAt: number;
}

export const RECIPES: RecipeDef[] = [
  { id: 'quick', name: 'Kiirlõikus', steps: ['cut'], price: 10, weight: 3, unlockAt: 0 },
  { id: 'classic', name: 'Klassika', steps: ['wash', 'cut'], price: 18, weight: 3, unlockAt: 0 },
  { id: 'festive', name: 'Pidulik', steps: ['wash', 'cut', 'dry'], price: 28, weight: 2.5, unlockAt: 25 },
  { id: 'colour', name: 'Värvisoeng', steps: ['colour', 'wash', 'dry'], price: 32, weight: 2.5, unlockAt: 20 },
  {
    id: 'bridal',
    name: 'Pruudisoeng',
    steps: ['wash', 'cut', 'colour', 'dry'],
    price: 45,
    weight: 1.6,
    unlockAt: 30,
  },
];

export function getRecipes(ids: readonly string[]): RecipeDef[] {
  return RECIPES.filter((r) => ids.includes(r.id));
}
