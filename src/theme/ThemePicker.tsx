import { useMemo, useState } from 'react';
import type { ThemeDefinition } from './themeTypes';

interface ThemePickerProps {
  selectedThemeId: string;
  themes: ThemeDefinition[];
  onSelectTheme: (themeId: string) => void;
  themeQuery?: string;
  onThemeQueryChange?: (query: string) => void;
}

const FAMILY_LABELS: Record<string, string> = {
  warm: '暖色',
  nature: '自然',
  cool: '冷色',
  minimal: '极简',
  soft: '柔和',
  tech: '科技',
  bold: '醒目',
  classic: '经典',
};

export function ThemePicker({ selectedThemeId, themes, onSelectTheme, themeQuery, onThemeQueryChange }: ThemePickerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const groupedThemes = useMemo(() => {
    const groups: Record<string, ThemeDefinition[]> = {};
    for (const theme of themes) {
      if (!groups[theme.family]) {
        groups[theme.family] = [];
      }
      groups[theme.family].push(theme);
    }
    return groups;
  }, [themes]);

  const families = Object.keys(groupedThemes).sort();

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  return (
    <section className="panel theme-panel" aria-labelledby="theme-gallery-heading">
      <header className="panel-header">
        <h2 id="theme-gallery-heading">主题库</h2>
        <p aria-live="polite" aria-atomic="true">
          {themes.length === 0
            ? '没有找到匹配的主题。'
            : `${themes.length} 个主题`}
        </p>
      </header>

      {selectedTheme && (
        <div className="theme-summary">
          <div className="theme-summary-info">
            <span className="theme-summary-label">当前使用</span>
            <span className="theme-summary-name">{selectedTheme.name}</span>
          </div>
          <div className="theme-summary-swatches" aria-hidden="true">
            <span style={{ backgroundColor: selectedTheme.tokens.background }} />
            <span style={{ backgroundColor: selectedTheme.tokens.heading }} />
            <span style={{ backgroundColor: selectedTheme.tokens.accent }} />
          </div>
        </div>
      )}

      {onThemeQueryChange ? (
        <input
          className="theme-search"
          type="text"
          placeholder="搜索主题..."
          aria-label="搜索主题"
          value={themeQuery ?? ''}
          onChange={(e) => onThemeQueryChange(e.target.value)}
        />
      ) : null}

      {themes.length > 0 && !themeQuery && (
        <div className="theme-filters">
          <button
            className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            type="button"
          >
            全部
          </button>
          {families.map((family) => (
            <button
              key={family}
              className={`filter-chip ${activeTab === family ? 'active' : ''}`}
              onClick={() => setActiveTab(family)}
              type="button"
            >
              {FAMILY_LABELS[family] || family}
            </button>
          ))}
        </div>
      )}

      {themes.length === 0 ? (
        <p className="theme-empty">没有找到匹配的主题。</p>
      ) : (
        <div className="theme-grid-container" tabIndex={-1}>
          {activeTab === 'all' || themeQuery ? (
            families.map((family) => (
              <div key={family} className="theme-group">
                <h3 className="theme-group-title">{FAMILY_LABELS[family] || family}</h3>
                <div className="theme-grid">
                  {groupedThemes[family].map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      selectedThemeId={selectedThemeId}
                      onSelectTheme={onSelectTheme}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="theme-grid">
              {groupedThemes[activeTab]?.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  selectedThemeId={selectedThemeId}
                  onSelectTheme={onSelectTheme}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ThemeCard({
  theme,
  selectedThemeId,
  onSelectTheme,
}: {
  theme: ThemeDefinition;
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
}) {
  const active = theme.id === selectedThemeId;
  return (
    <button
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
      </div>
    </button>
  );
}
