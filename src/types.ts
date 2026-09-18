/** Station kinds. Recipes are sequences of the "work" kinds (wash/cut/colour/dry). */
export type StationKind = 'wait' | 'wash' | 'cut' | 'colour' | 'dry' | 'checkout';

/** Station kinds that can appear as a recipe step. */
export type StepKind = Extract<StationKind, 'wash' | 'cut' | 'colour' | 'dry'>;

export type Mood = 'happy' | 'neutral' | 'angry' | 'burnt';

export type HairStyle = 'quiff' | 'short' | 'bob' | 'bun' | 'curly' | 'long' | 'perm' | 'bald';

/** Everything needed to draw a character. Colors are 0xRRGGBB. */
export interface CharacterLook {
  skin: number;
  hairStyle: HairStyle;
  hairColor: number;
  /** Texture key of the torso. Tintable torsos are drawn in white. */
  bodyTexture: string;
  bodyTint: number;
  legsTint: number;
  /** Optional overlay drawn on top of the torso (e.g. pearls). */
  accessory?: string;
}

export interface Point {
  x: number;
  y: number;
}
