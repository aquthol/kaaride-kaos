import { AudioEngine } from '../audio/AudioEngine';
import { PLAYER } from '../config/gameConfig';
import { PALETTE } from '../config/palette';
import type { Player } from '../entities/Player';
import { Particles } from '../fx/Particles';
import type { Station } from '../stations/Station';

/** Turns player input into pickup / putdown / work actions on stations, and highlights the current target. */
export class InteractionSystem {
  /** Who is currently working each station. One worker per station, first come. */
  private readonly claims = new Map<Station, Player>();

  constructor(private readonly stations: Station[]) {}

  update(players: Player[], dt: number): void {
    for (const s of this.stations) s.setHighlight(null);
    const workedThisFrame = new Set<Station>();

    for (const p of players) {
      const input = p.input;
      if (input.justPressed('grab')) {
        if (p.carrying) this.putDown(p);
        else this.pickUp(p);
      }

      p.working = false;
      const inRange = this.inRange(p);

      if (p.carrying) {
        const carried = p.carrying;
        inRange.find((s) => s.accepts(carried))?.setHighlight(PALETTE.good);
        continue;
      }

      const target = inRange.find((s) => s.occupant !== null);
      if (!target) continue;
      target.setHighlight(PALETTE.white);
      if (input.justPressed('work')) target.interact();

      // A station has one worker: whoever started keeps it until they stop.
      const claimedBy = this.claims.get(target);
      if (input.isDown('work') && (claimedBy === undefined || claimedBy === p)) {
        p.working = target.work(dt);
        if (p.working) {
          this.claims.set(target, p);
          workedThisFrame.add(target);
          p.view.faceTowards(target.x - p.x);
        }
      }
    }

    // Release claims nobody worked this frame
    for (const station of this.claims.keys()) {
      if (!workedThisFrame.has(station)) this.claims.delete(station);
    }
  }

  /** Stations within reach, nearest first. */
  private inRange(p: Player): Station[] {
    const reach = p.reachPoint(PLAYER.reachDistance);
    return this.stations
      .map((s) => ({ s, d: s.distanceTo(reach) }))
      .filter((e) => e.d <= PLAYER.interactRange)
      .sort((a, b) => a.d - b.d)
      .map((e) => e.s);
  }

  private pickUp(p: Player): void {
    const station = this.inRange(p).find((s) => s.occupant !== null);
    if (!station) return;
    if (!station.canRelease()) {
      station.refuse();
      AudioEngine.get().play('refuse');
      return;
    }
    const customer = station.release();
    customer.pickUp(p);
    p.carrying = customer;
    p.view.punch(0.16);
    AudioEngine.get().play('pickUp');
  }

  private putDown(p: Player): void {
    const customer = p.carrying!;
    const candidates = this.inRange(p);
    const target = candidates.find((s) => s.accepts(customer));
    if (target) {
      p.carrying = null;
      target.place(customer);
      p.view.punch(0.12);
      const seat = target.seatPoint;
      Particles.of(target.prop.image.scene)?.dust(seat.x, target.y, 5);
      AudioEngine.get().play('putDown');
    } else if (candidates.length > 0) {
      candidates[0].refuse();
      p.view.punch(0.08);
      AudioEngine.get().play('refuse');
    }
  }
}
