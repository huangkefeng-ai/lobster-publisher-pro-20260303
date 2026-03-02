import { useMemo, useState, useRef, useEffect } from 'react';
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

const QUICK_THEME_IDS = ['apple-white', 'claude-oat', 'wechat-native', 'sunset-paper', 'matcha-journal'];

export function ThemePicker({ selectedThemeId, themes, onSelectTheme, themeQuery, onThemeQueryChange }: ThemePickerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const quickThemes = useMemo(() => {
    return QUICK_THEME_IDS.map((id) => themes.find((t) => t.id === id)).filter((t): t is ThemeDefinition => Boolean(t));
  }, [themes]);

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
    <div className="theme-topbar" aria-labelledby="theme-gallery-heading" ref={dropdownRef}>
      <div className="theme-topbar-left">
        <span id="theme-gallery-heading" className="theme-topbar-label">主题风格</span>
        <div className="theme-quick-chips" role="group" aria-label="快捷主题">
          {quickThemes.map((theme) => {
            const active = theme.id === selectedThemeId;
            return (
              <button
                key={theme.id}
                className={`theme-quick-chip ${active ? 'active' : ''}`}
                onClick={() => onSelectTheme(theme.id)}
                type="button"
                aria-pressed={active}
              >
                {theme.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="theme-topbar-right">
        {selectedTheme && (
          <div className="theme-topbar-swatch" aria-hidden="true" title={`当前使用: ${selectedTheme.name}`}>
            <span style={{ backgroundColor: selectedTheme.tokens.background }} />
            <span style={{ backgroundColor: selectedTheme.tokens.heading }} />
            <span style={{ backgroundColor: selectedTheme.tokens.accent }} />
          </div>
        )}
        <button
          className="theme-dropdown-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          type="button"
        >
          全部 {themes.length} 款
          <span className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
      </div>

      {isDropdownOpen && (
        <div className="theme-dropdown-panel">
          <header className="theme-dropdown-header">
            <h3 className="theme-dropdown-title">
              主题库
              <span className="theme-count-badge">共 {themes.length} 款</span>
            </h3>
            {onThemeQueryChange && (
              <input
                className="theme-search"
                type="text"
                placeholder="搜索主题..."
                aria-label="搜索主题"
                value={themeQuery ?? ''}
                onChange={(e) => onThemeQueryChange(e.target.value)}
              />
            )}
          </header>

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
                    <h4 className="theme-group-title">{FAMILY_LABELS[family] || family}</h4>
                    <div className="theme-grid">
                      {groupedThemes[family].map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          selectedThemeId={selectedThemeId}
                          onSelectTheme={(id) => {
                            onSelectTheme(id);
                            setIsDropdownOpen(false);
                          }}
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
                      onSelectTheme={(id) => {
                        onSelectTheme(id);
                        setIsDropdownOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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
