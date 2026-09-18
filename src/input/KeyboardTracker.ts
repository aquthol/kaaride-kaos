import Phaser from 'phaser';

const registry = new WeakMap<Phaser.Scene, KeyboardTracker>();

/**
 * Tracks held keys by `KeyboardEvent.code` (e.g. "ShiftLeft", "NumpadEnter").
 * Phaser's KeyCodes cannot tell left and right Shift apart and has no NumpadEnter,
 * which local co-op needs, so input is read from the raw codes instead.
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
    const kb = scene.input.keyboard!;
    kb.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onDown, this);
    kb.on(Phaser.Input.Keyboard.Events.ANY_KEY_UP, this.onUp, this);
    scene.game.events.on(Phaser.Core.Events.BLUR, this.clear, this);
    // Fresh presses last exactly one frame; every player reads them during update()
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onDown, this);
      kb.off(Phaser.Input.Keyboard.Events.ANY_KEY_UP, this.onUp, this);
      scene.game.events.off(Phaser.Core.Events.BLUR, this.clear, this);
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);
      registry.delete(scene);
    });
  }

  /** Register the codes a profile uses so their browser defaults are suppressed. */
  capture(codes: readonly string[]): void {
    for (const code of codes) this.captured.add(code);
  }

  private onDown(event: KeyboardEvent): void {
    if (this.captured.has(event.code)) event.preventDefault();
    // Ignore auto-repeat: only the first press counts as "just pressed"
    if (this.held.has(event.code)) return;
    this.held.add(event.code);
    this.pressedThisFrame.add(event.code);
  }

  private onUp(event: KeyboardEvent): void {
    if (this.captured.has(event.code)) event.preventDefault();
    this.held.delete(event.code);
  }

  private clear(): void {
    this.held.clear();
    this.pressedThisFrame.clear();
  }

  isDown(code: string): boolean {
    return this.held.has(code);
  }

  justPressed(code: string): boolean {
    return this.pressedThisFrame.has(code);
  }

  /** Runs on the scene's post-update, once every player has read its input. */
  private endFrame(): void {
    this.pressedThisFrame.clear();
  }
}
