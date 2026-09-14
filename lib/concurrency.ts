/**
 * Runs `fn` over `items` with at most `limit` in flight at once, preserving
 * result order. Used to queue the per-answer Notion writes — Notion's API
 * is rate-limited to roughly 3 requests/second, so a small concurrency
 * limit (rather than Promise.all) keeps a multi-question submission from
 * bursting past that.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
