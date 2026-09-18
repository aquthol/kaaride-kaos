/** Pick an item with probability proportional to `weight(item)`. */
export function weightedPick<T>(items: readonly T[], weight: (item: T) => number): T | null {
  const total = items.reduce((sum, it) => sum + Math.max(0, weight(it)), 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const it of items) {
    r -= Math.max(0, weight(it));
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}
