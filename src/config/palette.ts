/** The single source of truth for colors. Soft pastels with a dark plum outline for contrast. */
export const PALETTE = {
  // Room
  floorA: 0xf7ecdd,
  floorB: 0xefdcc8,
  floorGrout: 0xdcc6ad,
  floorSpeck: 0xc9ae92,
  wallFace: 0xf6c3c9,
  wallStripe: 0xf0b3bb,
  wainscot: 0xd996a5,
  wainscotDark: 0xbf7d8e,
  wallTrim: 0xfff5ee,
  wallTop: 0x8c5c70,
  wallTopLight: 0xa77388,
  wallShadow: 0x4a2c3c,
  doorFloor: 0xd8c2a8,
  doormat: 0x7fbfa9,
  doormatDark: 0x5f9f8a,
  rug: 0xbfe6d6,
  rugBorder: 0x8ccdb4,
  rugDot: 0xf7fffb,

  // Materials
  wood: 0xc98f5e,
  woodDark: 0x9a6640,
  woodLight: 0xe8b98b,
  ceramic: 0xffffff,
  ceramicShade: 0xdbe9f1,
  ceramicDeep: 0xb5cfdd,
  chrome: 0xd3dee6,
  chromeDark: 0x8ea1b0,
  gold: 0xf2c46b,
  goldDark: 0xc9963f,
  glass: 0xd4ecf4,
  glassShine: 0xffffff,
  plantLeaf: 0x74c795,
  plantLeafDark: 0x3f9a63,
  pot: 0xe9896b,
  potDark: 0xc56a50,

  // Station identity colors (also used in recipe icons)
  wash: 0x7cc3e8,
  washDark: 0x4f9cc4,
  cut: 0xf28fa6,
  cutDark: 0xc9657f,
  colour: 0x8fd89a,
  colourDark: 0x5aa86a,
  /** Shades a customer can ask to be dyed. */
  dyeColors: [0xe0578f, 0x7f6be0, 0x49b6d8, 0x6fc36a, 0xe8913f, 0xd94f4f, 0xf0d24a, 0xb45ad9],
  dry: 0xb9a4e6,
  dryDark: 0x8b73c7,
  checkout: 0xffd66e,
  checkoutDark: 0xe0a93c,
  wait: 0xffc3a0,
  waitLight: 0xffd9c0,
  waitDark: 0xe39b76,

  // Characters
  skins: [0xffe0c4, 0xf4c49c, 0xdda27a, 0xb07a52, 0x7d5236],
  hairColors: [0x3b2a22, 0x6b4430, 0xc98a4b, 0xf2d27a, 0xd9573f, 0x2c2c3a, 0xe8a0c0, 0x7fa8e0],
  clothes: [0x8fd3c4, 0xf7a8b8, 0xa9c8f5, 0xffe29a, 0xc9b3f0, 0xa8e0a0, 0xffb98a, 0x9fb4c8],
  pants: [0x4f5d86, 0x5b4a5f, 0x3e5a58, 0x6b5a4a],
  rasmusHair: 0x4a2f22,
  rasmusShirt: 0xf6f3ee,
  rasmusApron: 0x2f8f86,
  rasmusApronDark: 0x216f68,
  rasmusPants: 0x3b4466,
  karlHair: 0xd9a441,
  karlShirt: 0xe6eef7,
  karlApron: 0xe0743f,
  karlApronDark: 0xb4552a,
  karlPants: 0x5b4a5f,
  helgiHair: 0xd9cdf2,
  helgiCardigan: 0xa05a8c,
  /** Bright, playful shades for children. */
  childHair: [0xe8913f, 0xc9a227, 0x6b4430, 0xd94f4f, 0x3b2a22],
  childClothes: [0xffd166, 0x8fd3c4, 0xff9fb1, 0x9ad6ff, 0xc3f08a],
  starHair: 0xf7e7a6,
  starOutfit: 0xd94f9e,
  dogFur: 0xd6a06a,
  dogFurDark: 0xa9764a,
  dogNose: 0x3a2b2b,

  // Faces
  eye: 0x2d1f28,
  blush: 0xff8fa3,
  angryBlush: 0xff5a5a,
  soot: 0x3a3030,

  // Generic
  outline: 0x4a3340,
  shadow: 0x2b1822,
  white: 0xffffff,

  // UI
  hudBand: 0x3a2a3a,
  panel: 0xfffaf3,
  panelShade: 0xf1e2d3,
  panelEdge: 0x4a3340,
  text: 0x4a3340,
  textLight: 0xfffaf3,
  accent: 0xff7d8e,
  accentDark: 0xd9566a,
  good: 0x6fd08c,
  warn: 0xffc94d,
  bad: 0xff5e5e,
  ringBg: 0x4a3340,
  ringFill: 0x6fd08c,
  coin: 0xffd24d,
  coinDark: 0xd99a1c,
  star: 0xffcf3f,
  starEmpty: 0x6b5566,
} as const;

export const FONT_FAMILY = 'Nunito, "Segoe UI", system-ui, sans-serif';

/** Convert 0xRRGGBB to a CSS color string for Phaser text. */
export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
