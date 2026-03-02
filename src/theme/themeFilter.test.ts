import { describe, expect, it } from 'vitest';
import { filterThemes } from './themeFilter';
import { THEME_REGISTRY } from './index';

describe('filterThemes', () => {
  it('returns all themes for an empty query', () => {
    expect(filterThemes(THEME_REGISTRY, '')).toEqual(THEME_REGISTRY);
  });

  it('returns all themes for whitespace-only query', () => {
    expect(filterThemes(THEME_REGISTRY, '   ')).toEqual(THEME_REGISTRY);
  });

  it('filters by theme name (case-insensitive)', () => {
    const results = filterThemes(THEME_REGISTRY, 'mac');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every((t) => t.name.toLowerCase().includes('mac'))).toBe(true);
  });

  it('filters by family', () => {
    const results = filterThemes(THEME_REGISTRY, 'recommended');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every((t) => t.family === 'recommended')).toBe(true);
  });

  it('returns empty array when no themes match', () => {
    expect(filterThemes(THEME_REGISTRY, 'xyznonexistent')).toEqual([]);
  });

  it('matches partial name fragments', () => {
    const results = filterThemes(THEME_REGISTRY, '大地');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
