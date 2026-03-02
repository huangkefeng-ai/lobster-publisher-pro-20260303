import { describe, expect, it } from 'vitest';
import { getThemeById, THEME_REGISTRY } from './themeRegistry';

describe('themeRegistry', () => {
  it('ships with at least 30 themes for gallery preview', () => {
    expect(THEME_REGISTRY.length).toBeGreaterThanOrEqual(30);
  });

  it('has unique theme ids', () => {
    const ids = THEME_REGISTRY.map((theme) => theme.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('finds a theme by id', () => {
    const firstTheme = THEME_REGISTRY[0];
    expect(getThemeById(firstTheme.id)).toEqual(firstTheme);
    expect(getThemeById('missing-theme')).toBeUndefined();
  });

  it('contains themes in the "recommended" family', () => {
    const recommended = THEME_REGISTRY.filter((t) => t.family === 'recommended');
    expect(recommended.length).toBeGreaterThanOrEqual(7);
    expect(recommended.map((t) => t.id)).toContain('apple-white');
    expect(recommended.map((t) => t.id)).toContain('wechat-native');
    expect(recommended.map((t) => t.id)).toContain('claude-oat');
  });
});
