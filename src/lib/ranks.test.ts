import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('broker ranks', () => {
  it('are unique and cover 1..10', () => {
    const dir = join(process.cwd(), 'src/content/brokers');
    const ranks = readdirSync(dir)
      .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
      .map((f) => readFileSync(join(dir, f), 'utf8').match(/^rank:\s*(\d+)/m)![1])
      .map(Number)
      .sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
