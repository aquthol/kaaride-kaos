export const TEX = {
  // room
  floor: 'floor-tile',
  doormat: 'doormat',
  shadow: 'soft-shadow',
  // furniture
  sink: 'prop-sink',
  cutChair: 'prop-cut-chair',
  dryer: 'prop-dryer',
  dryerHood: 'prop-dryer-hood',
  counter: 'prop-counter',
  colourStation: 'prop-colour',
  cover: 'prop-cover',
  waitChair: 'prop-wait-chair',
  plant: 'prop-plant',
  bigPlant: 'prop-big-plant',
  table: 'prop-table',
  display: 'prop-display',
  // characters
  head: 'char-head',
  leg: 'char-leg',
  hands: 'char-hands',
  body: 'char-body',
  rasmusBody: 'rasmus-body',
  karlBody: 'karl-body',
  pearls: 'acc-pearls',
  // pixel for misc fills
  pixel: 'pixel',
} as const;

export const hairFrontKey = (style: string) => `hair-${style}-front`;
export const hairBackKey = (style: string) => `hair-${style}-back`;
export const hairRearKey = (style: string) => `hair-${style}-rear`;
export const faceKey = (mood: string) => `face-${mood}`;
