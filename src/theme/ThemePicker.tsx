import type { ThemeDefinition } from './themeTypes';

interface ThemePickerProps {
  selectedThemeId: string;
  themes: ThemeDefinition[];
  onSelectTheme: (themeId: string) => void;
  themeQuery?: string;
  onThemeQueryChange?: (query: string) => void;
}

export function ThemePicker({ selectedThemeId, themes, onSelectTheme, themeQuery, onThemeQueryChange }: ThemePickerProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Theme Gallery</h2>
        <p>{themes.length} themes</p>
      </header>
      {onThemeQueryChange ? (
        <input
          className="theme-search"
          type="text"
          placeholder="Search themes…"
          value={themeQuery ?? ''}
          onChange={(e) => onThemeQueryChange(e.target.value)}
        />
      ) : null}
      {themes.length === 0 ? (
        <p className="theme-empty">No themes match this query.</p>
      ) : (
        <div className="theme-grid">
          {themes.map((theme) => {
            const active = theme.id === selectedThemeId;
            return (
              <button
                key={theme.id}
                className={`theme-card${active ? ' active' : ''}`}
                onClick={() => onSelectTheme(theme.id)}
                type="button"
              >
                <span className="theme-chip" style={{ backgroundColor: theme.tokens.accent }} />
                <span className="theme-name">{theme.name}</span>
                <span className="theme-family">{theme.family}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
