import type { ThemeDefinition } from './themeTypes';

export function filterThemes(themes: ThemeDefinition[], query: string): ThemeDefinition[] {
  const normalized = query.trim().toLowerCase();

  if (normalized.length === 0) {
    return themes;
  }

  return themes.filter(
    (theme) =>
      theme.name.toLowerCase().includes(normalized) ||
      theme.family.toLowerCase().includes(normalized),
  );
}
