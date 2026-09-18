import Phaser from 'phaser';

const registry = new WeakMap<Phaser.Scene, KeyboardTracker>();

/**
 * Modifier keys, with the `getModifierState` name that reports whether either
 * side is down. Browsers lose modifier keyups more often than ordinary keys.
 */
const MODIFIERS: { state: string; codes: readonly [string, string] }[] = [
  { state: 'Shift', codes: ['ShiftLeft', 'ShiftRight'] },
  { state: 'Control', codes: ['ControlLeft', 'ControlRight'] },
  { state: 'Alt', codes: ['AltLeft', 'AltRight'] },
  { state: 'Meta', codes: ['MetaLeft', 'MetaRight'] },
];

/**
 * Tracks held keys by `KeyboardEvent.code` (e.g. "ShiftLeft", "NumpadEnter").
 * Phaser's KeyCodes cannot tell left and right Shift apart and has no NumpadEnter,
 * which local co-op needs, so input is read from the raw codes instead.
 *
 * Events come straight from the window rather than through Phaser's keyboard
 * plugin, which is allowed to swallow them: it ignores events whose default was
 * already prevented, de-duplicates by `keyCode` (ShiftLeft and ShiftRight share
 * 16, Enter and NumpadEnter share 13), and skips its queue entirely while a
 * scene is paused. A swallowed keyup would leave that key stuck down forever.
 */
export class KeyboardTracker {
  private readonly held = new Set<string>();
  private readonly pressedThisFrame = new Set<string>();
  /** Codes we consume, so the browser does not scroll or activate anything. */
  private readonly captured = new Set<string>();

  static for(scene: Phaser.Scene): KeyboardTracker {
    let tracker = registry.get(scene);
    if (!tracker) {
      tracker = new KeyboardTracker(scene);
      registry.set(scene, tracker);
    }
    return tracker;
  }

  private constructor(scene: Phaser.Scene) {
    window.addEventListener('keydown', this.onDown, true);
    window.addEventListener('keyup', this.onUp, true);
    window.addEventListener('pointerdown', this.onPointer, true);
    // Anything held when we lose the window is unknowable afterwards, so forget it
    window.addEventListener('blur', this.clear);
    window.addEventListener('focus', this.clear);
    window.addEventListener('pagehide', this.clear);
    document.addEventListener('visibilitychange', this.onVisibility);
    scene.game.events.on(Phaser.Core.Events.BLUR, this.clear, this);
    // Fresh presses last exactly one frame; every player reads them during update()
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.onDown, true);
      window.removeEventListener('keyup', this.onUp, true);
      window.removeEventListener('pointerdown', this.onPointer, true);
      window.removeEventListener('blur', this.clear);
      window.removeEventListener('focus', this.clear);
      window.removeEventListener('pagehide', this.clear);
      document.removeEventListener('visibilitychange', this.onVisibility);
      scene.game.events.off(Phaser.Core.Events.BLUR, this.clear, this);
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);
      registry.delete(scene);
    });
  }

  /** Register the codes a profile uses so their browser defaults are suppressed. */
  capture(codes: readonly string[]): void {
    for (const code of codes) this.captured.add(code);
  }

  private readonly onDown = (event: KeyboardEvent): void => {
    this.reconcileModifiers(event);
    if (this.captured.has(event.code)) event.preventDefault();
    // Ignore auto-repeat: only the first press counts as "just pressed"
    if (this.held.has(event.code)) return;
    this.held.add(event.code);
    this.pressedThisFrame.add(event.code);
  };

  private readonly onUp = (event: KeyboardEvent): void => {
    if (this.captured.has(event.code)) event.preventDefault();
    this.held.delete(event.code);
    this.reconcileModifiers(event);
  };

  private readonly onPointer = (event: PointerEvent): void => {
    this.reconcileModifiers(event);
  };

  private readonly onVisibility = (): void => {
    if (document.hidden) this.clear();
  };

  /**
   * Self-heal a modifier whose keyup never arrived. Every event carries the true
   * state of the modifiers, so a flag reporting "up" means both sides are up. A
   * flag reporting "down" cannot say which side it is, so we only ever clear.
   */
  private reconcileModifiers(event: KeyboardEvent | PointerEvent): void {
    for (const { state, codes } of MODIFIERS) {
      let down: boolean;
      try {
        down = event.getModifierState(state);
      } catch {
        continue; // Synthetic events may not implement it
      }
      if (!down) {
        this.held.delete(codes[0]);
        this.held.delete(codes[1]);
      }
    }
  }

  private readonly clear = (): void => {
    this.held.clear();
    this.pressedThisFrame.clear();
  };

  isDown(code: string): boolean {
    return this.held.has(code);
  }

  justPressed(code: string): boolean {
    return this.pressedThisFrame.has(code);
  }

  /** Runs on the scene's post-update, once every player has read its input. */
  private readonly endFrame = (): void => {
    this.pressedThisFrame.clear();
    // Belt and braces: if a blur was ever missed, nothing can legitimately be held
    // while the document does not have focus.
    if (this.held.size > 0 && !document.hasFocus()) this.held.clear();
  };
}
