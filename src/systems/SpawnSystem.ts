import Phaser from 'phaser';
import { getCustomerTypes, type CustomerTypeDef } from '../config/customerTypes';
import type { LevelDef } from '../config/levels';
import { LAYOUT } from '../config/layout';
import { getRecipes, type RecipeDef } from '../config/recipes';
import { Customer } from '../entities/Customer';
import type { WaitingArea } from '../stations/WaitingArea';
import { weightedPick } from '../utils/random';
import { pathToSeat } from '../world/walkPaths';

/** Spawns customers at the door and walks them to a free waiting seat. */
export class SpawnSystem {
  private timer: number;
  private readonly recipes: RecipeDef[];
  private readonly types: CustomerTypeDef[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LevelDef,
    private readonly waiting: WaitingArea,
    private readonly activeCount: () => number,
    private readonly onSpawn: (customer: Customer) => void,
  ) {
    this.timer = level.spawn.firstSpawnDelay ?? 1.5;
    // Only what this level allows; `unlockAt` then paces them within the round
    this.recipes = getRecipes(level.recipes);
    this.types = getCustomerTypes(level.customerTypes);
  }

  update(dt: number, elapsed: number): void {
    this.timer -= dt;
    if (this.timer > 0) return;

    const seat = this.waiting.freeSeat();
    if (!seat || this.activeCount() >= this.level.spawn.maxConcurrent) {
      this.timer = 0.75;
      return;
    }

    const t = Phaser.Math.Clamp(elapsed / this.level.duration, 0, 1);
    this.timer = Phaser.Math.Linear(this.level.spawn.intervalStart, this.level.spawn.intervalEnd, t);

    const type = weightedPick(
      this.types.filter((c) => c.unlockAt <= elapsed),
      (c) => c.spawnWeight,
    );
    const recipe = weightedPick(
      this.recipes.filter((r) => r.unlockAt <= elapsed),
      (r) => r.weight,
    );
    if (!type || !recipe) return;

    const customer = new Customer(this.scene, type, recipe, LAYOUT.door);
    seat.reserve(customer);
    customer.walk(pathToSeat(seat.seatPoint, seat.y), () => seat.place(customer));
    this.onSpawn(customer);
  }
}
