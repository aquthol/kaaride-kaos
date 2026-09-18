import { ICON, STEP_COLOR } from '../art/drawIcons';
import { PALETTE } from '../config/palette';
import type { Customer } from '../entities/Customer';
import type { StepKind } from '../types';
import { Station } from './Station';

type AutoState = 'idle' | 'running' | 'finished';

/**
 * Started with a tap, then runs on its own. After finishing, the customer
 * must be picked up in time: first a warning, then the step "overcooks".
 */
export abstract class AutoStation extends Station {
  declare readonly kind: StepKind;
  protected abstract readonly workTime: number;
  protected abstract readonly warnAfter: number;
  protected abstract readonly failAfter: number;
  protected autoState: AutoState = 'idle';
  protected overTime = 0;

  get isWarning(): boolean {
    return this.autoState === 'finished' && this.overTime >= this.warnAfter;
  }

  override canRelease(): boolean {
    return super.canRelease() && this.autoState !== 'running';
  }

  override interact(): void {
    const c = this.occupant;
    if (!c || c.state !== 'seated' || this.autoState !== 'idle' || c.nextStep !== this.kind) return;
    this.autoState = 'running';
    this.onStart(c);
  }

  override update(dt: number, time: number): void {
    const c = this.occupant;
    if (!c || c.state !== 'seated') {
      this.ring.hide();
      return;
    }
    switch (this.autoState) {
      case 'running':
        this.startSound(this.kind);
        c.stepProgress += dt;
        this.ring.setScale(1);
        this.ring.showProgress(c.stepProgress / this.workTime, STEP_COLOR[this.kind]);
        this.onRunning(c, dt);
        if (c.stepProgress >= this.workTime) {
          c.completeStep();
          this.autoState = 'finished';
          this.overTime = 0;
          this.stopSound();
          this.onFinished(c);
        }
        break;
      case 'finished':
        this.overTime += dt;
        if (this.overTime >= this.failAfter) {
          this.autoState = 'idle';
          this.stopSound();
          this.onFail(c);
        } else if (this.overTime >= this.warnAfter) {
          const blink = Math.sin(time * 0.025) > 0;
          this.ring.showIcon(ICON.warn, 34);
          this.ring.setScale(blink ? 1.2 : 1);
          this.prop.image.setTint(blink ? 0xff8a8a : 0xffffff);
          this.onWarning(c, dt);
        } else {
          this.ring.setScale(1);
          this.ring.showIcon(ICON.check);
        }
        break;
      case 'idle':
        if (c.nextStep === this.kind) {
          // Waiting to be started: pulsing hint with the station icon
          this.ring.showIcon(ICON[this.kind], 28);
          this.ring.setScale(1 + Math.sin(time * 0.01) * 0.12);
        } else {
          this.ring.hide();
        }
        break;
    }
  }

  protected override onReleased(customer: Customer): void {
    this.autoState = 'idle';
    this.overTime = 0;
    this.stopSound();
    this.prop.image.setTint(PALETTE.white);
    this.onStop(customer);
  }

  protected onStart(_customer: Customer): void {}
  protected onRunning(_customer: Customer, _dt: number): void {}
  protected onFinished(_customer: Customer): void {}
  protected onWarning(_customer: Customer, _dt: number): void {}
  protected onStop(_customer: Customer): void {}
  /** The customer was left too long. */
  protected abstract onFail(customer: Customer): void;
}
