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
    <section className="panel" aria-labelledby="theme-gallery-heading">
      <header className="panel-header">
        <h2 id="theme-gallery-heading">Theme Gallery</h2>
        <p aria-live="polite" aria-atomic="true">
          {themes.length === 0
            ? 'No themes match this query.'
            : themes.length === 1
              ? '1 theme'
              : `${themes.length} themes`}
        </p>
      </header>
      {onThemeQueryChange ? (
        <input
          className="theme-search"
          type="text"
          placeholder="Search themes…"
          aria-label="Search themes"
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
                aria-pressed={active}
              >
                <div
                  className="theme-thumbnail"
                  style={{
                    backgroundColor: theme.tokens.background,
                    borderColor: theme.tokens.border,
                  }}
                  aria-hidden="true"
                >
                  <div className="theme-thumbnail-heading" style={{ backgroundColor: theme.tokens.heading }} />
                  <div className="theme-thumbnail-text" style={{ backgroundColor: theme.tokens.text }} />
                  <div className="theme-thumbnail-text" style={{ backgroundColor: theme.tokens.text, width: '80%' }} />
                  <div
                    className="theme-thumbnail-quote"
                    style={{
                      backgroundColor: theme.tokens.quoteBackground,
                      borderLeftColor: theme.tokens.quoteBorder,
                    }}
                  />
                  <div className="theme-thumbnail-accent" style={{ backgroundColor: theme.tokens.accent }} />
                </div>
                <div className="theme-info">
                  <span className="theme-name">{theme.name}</span>
                  <span className="theme-family">{theme.family}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
