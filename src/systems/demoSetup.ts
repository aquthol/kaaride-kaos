import Phaser from 'phaser';
import { CUSTOMER_TYPES } from '../config/customerTypes';
import { RECIPES } from '../config/recipes';
import { Customer } from '../entities/Customer';
import type { Player } from '../entities/Player';
import type { Station } from '../stations/Station';

/** Dev helper (`?demo`): fill every station with a customer and hand one to the first player. */
export function demoSetup(scene: Phaser.Scene, stations: Station[], players: Player[]): Customer[] {
  const festive = RECIPES.find((r) => r.id === 'festive')!;
  const out: Customer[] = [];
  const make = (typeIndex: number, stepIndex: number) => {
    const type = CUSTOMER_TYPES[typeIndex % CUSTOMER_TYPES.length];
    const c = new Customer(scene, type, festive, { x: 0, y: 0 });
    for (let i = 0; i < stepIndex; i++) c.completeStep();
    out.push(c);
    return c;
  };
  const stepFor: Record<string, number> = { wait: 0, wash: 0, cut: 1, dry: 2, checkout: 3 };
  stations.forEach((s, i) => {
    if (s.kind === 'checkout') return;
    const c = make(i, stepFor[s.kind]);
    if (s.kind === 'cut') c.stepProgress = 2;
    s.place(c);
  });
  const carried = make(1, 1);
  carried.pickUp(players[0]);
  players[0].carrying = carried;
  return out;
}
