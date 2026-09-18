import { ICON, STEP_COLOR } from '../art/drawIcons';
import type { Customer } from '../entities/Customer';
import type { StepKind } from '../types';
import { Station } from './Station';

/**
 * Work happens only while a player holds the work key nearby.
 * Progress is stored on the customer, so walking away just pauses it.
 */
export abstract class ManualStation extends Station {
  declare readonly kind: StepKind;
  protected abstract readonly workTime: number;
  private finishedCustomer: Customer | null = null;

  override work(dt: number): boolean {
    const c = this.occupant;
    if (!c || c.state !== 'seated' || c.nextStep !== this.kind) return false;
    c.stepProgress += dt;
    this.workedThisFrame = true;
    this.onWorkTick(c, dt);
    if (c.stepProgress >= this.workTime) {
      c.completeStep();
      this.finishedCustomer = c;
      this.stopSound();
      this.onStepDone(c);
    }
    return true;
  }

  override update(dt: number, time: number): void {
    const c = this.occupant;
    if (c && c.state === 'seated' && c.nextStep === this.kind) {
      this.ring.showProgress(c.stepProgress / this.workTime, STEP_COLOR[this.kind]);
      // Gentle bob so an unfinished, idle station catches the eye
      const idle = !this.workedThisFrame && c.stepProgress > 0;
      this.ring.setScale(idle ? 1 + Math.sin(time * 0.008) * 0.06 : 1);
    } else if (c && c === this.finishedCustomer) {
      this.ring.setScale(1);
      this.ring.showIcon(ICON.check);
    } else {
      this.ring.hide();
    }
    // The working sound follows whether work actually happened this frame
    if (this.workedThisFrame) {
      this.startSound(this.kind);
      this.onWorkingFrame(dt);
    } else {
      this.stopSound();
    }
    this.workedThisFrame = false;
  }

  protected override onReleased(): void {
    this.finishedCustomer = null;
    this.stopSound();
  }

  /** Hook for effects while work is happening. */
  protected onWorkTick(_customer: Customer, _dt: number): void {}

  /** Hook called once per frame after work happened (effects). */
  protected onWorkingFrame(_dt: number): void {}

  /** Hook when the step completes. */
  protected onStepDone(_customer: Customer): void {}
}
