/** Scene-level gameplay events (emitted on `scene.events`). */
export const GameEvent = {
  /** (customer: Customer, payout: number) — paid at the checkout. */
  CustomerServed: 'customer-served',
  /** (customer: Customer, reason: LeaveReason) — left unhappy. */
  CustomerAngry: 'customer-angry',
  /** (money: number, served: number, angry: number) */
  ScoreChanged: 'score-changed',
} as const;

export type LeaveReason = 'served' | 'impatient' | 'burnt';
