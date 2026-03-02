import type { ThemeDefinition } from './themeTypes';

interface ThemePickerProps {
  selectedThemeId: string;
  themes: ThemeDefinition[];
  onSelectTheme: (themeId: string) => void;
}

export function ThemePicker({ selectedThemeId, themes, onSelectTheme }: ThemePickerProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Theme Gallery</h2>
        <p>{themes.length} themes</p>
      </header>
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
    </section>
  );
}
