import Phaser from 'phaser';
import { AudioEngine } from './audio/AudioEngine';
import { DEBUG, VIEW } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { EndScene } from './scenes/EndScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { MenuScene } from './scenes/MenuScene';

/** Wait for the web font so Phaser text renders with it (falls back after a timeout). */
async function loadFonts(): Promise<void> {
  const fonts = ['600 16px Nunito', '800 16px Nunito', '900 16px Nunito'];
  try {
    await Promise.race([
      Promise.all(fonts.map((f) => document.fonts.load(f))),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Font loading is best-effort; system fallback is fine.
  }
}

// Audio waits for a user gesture before creating its context (autoplay policy)
const audio = AudioEngine.get();
audio.init();

// When embedded (itch.io and friends), the first click must pull keyboard focus
// into the frame, otherwise arrows and space keep scrolling the host page.
window.addEventListener(
  'pointerdown',
  () => {
    try {
      window.focus();
    } catch {
      // Cross-origin parents can refuse; the click itself still focuses us.
    }
  },
  { once: true },
);

void loadFonts().then(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: VIEW.width,
    height: VIEW.height,
    backgroundColor: '#2e2230',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: DEBUG },
    },
    render: { antialias: true },
    scene: [BootScene, MenuScene, LevelSelectScene, GameScene, HudScene, EndScene],
  });
  // Dev-only handles for automated browser checks
  if (import.meta.env.DEV) {
    Object.assign(window, { __game: game, __audio: audio });
  }
});
