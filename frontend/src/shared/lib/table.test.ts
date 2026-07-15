import { describe, expect, it } from 'vitest';
import { compareRows, matchesQuery } from './table';

type Row = { name: string; stock: number };

describe('compareRows', () => {
  const rows: Row[] = [
    { name: 'banana', stock: 3 },
    { name: 'Apple', stock: 10 },
    { name: 'cherry', stock: 1 },
  ];

  it('sorts strings case-insensitively ascending', () => {
    const sorted = [...rows].sort((a, b) => compareRows(a, b, (r) => r.name, 'asc'));
    expect(sorted.map((r) => r.name)).toEqual(['Apple', 'banana', 'cherry']);
  });

  it('reverses on desc', () => {
    const sorted = [...rows].sort((a, b) => compareRows(a, b, (r) => r.name, 'desc'));
    expect(sorted.map((r) => r.name)).toEqual(['cherry', 'banana', 'Apple']);
  });

  it('sorts numbers numerically, not lexically', () => {
    const sorted = [...rows].sort((a, b) => compareRows(a, b, (r) => r.stock, 'asc'));
    // Lexical order would put 10 before 3; numeric keeps 1, 3, 10.
    expect(sorted.map((r) => r.stock)).toEqual([1, 3, 10]);
  });
});

describe('matchesQuery', () => {
  it('matches when every term appears in some field', () => {
    expect(matchesQuery(['USB-C cable', 'Nile Components'], 'cable nile')).toBe(true);
  });

  it('fails when any term is missing', () => {
    expect(matchesQuery(['USB-C cable', 'Nile Components'], 'cable delta')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(matchesQuery(['Docking Station'], 'DOCK')).toBe(true);
  });

  it('treats a blank query as a match', () => {
    expect(matchesQuery(['anything'], '   ')).toBe(true);
  });
});
