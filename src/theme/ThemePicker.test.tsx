import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemePicker } from './ThemePicker';
import { THEME_REGISTRY } from './index';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

function renderThemePicker(element: React.ReactElement): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return { container, root };
}

function cleanupRender({ container, root }: RenderResult) {
  act(() => {
    root.unmount();
  });
  container.remove();
}

describe('ThemePicker', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders theme count and highlights the selected theme', () => {
    const themes = THEME_REGISTRY.slice(0, 2);
    const rendered = renderThemePicker(
      <ThemePicker
        selectedThemeId={themes[0].id}
        themes={themes}
        onSelectTheme={() => {}}
      />,
    );

    const count = rendered.container.querySelector('.panel-header p');
    expect(count?.textContent).toBe('2 个主题');

    const firstButton = rendered.container.querySelector(`button[aria-pressed="true"]`) as HTMLButtonElement | null;
    expect(firstButton).not.toBeNull();
    expect(firstButton?.textContent).toContain(themes[0].name);

    cleanupRender(rendered);
  });

  it('calls onSelectTheme when a theme card is clicked', () => {
    const themes = THEME_REGISTRY.slice(0, 2);
    const onSelectTheme = vi.fn();
    const rendered = renderThemePicker(
      <ThemePicker
        selectedThemeId={themes[0].id}
        themes={themes}
        onSelectTheme={onSelectTheme}
      />,
    );

    const secondButton = rendered.container.querySelector(`button:not([aria-pressed="true"])`) as HTMLButtonElement | null;
    expect(secondButton).not.toBeNull();

    act(() => {
      secondButton?.click();
    });

    expect(onSelectTheme).toHaveBeenCalledTimes(1);
    expect(onSelectTheme).toHaveBeenCalledWith(themes[1].id);

    cleanupRender(rendered);
  });

  it('renders search input and forwards query changes', () => {
    const onThemeQueryChange = vi.fn();
    const rendered = renderThemePicker(
      <ThemePicker
        selectedThemeId={THEME_REGISTRY[0].id}
        themes={THEME_REGISTRY.slice(0, 1)}
        onSelectTheme={() => {}}
        themeQuery=""
        onThemeQueryChange={onThemeQueryChange}
      />,
    );

    const input = rendered.container.querySelector('input[aria-label="Search themes"]') as HTMLInputElement | null;
    expect(input).not.toBeNull();

    act(() => {
      const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setInputValue?.call(input, 'ocean');
      input!.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onThemeQueryChange).toHaveBeenCalledTimes(1);
    expect(onThemeQueryChange).toHaveBeenCalledWith('ocean');

    cleanupRender(rendered);
  });

  it('shows empty-state message when no themes are provided', () => {
    const rendered = renderThemePicker(
      <ThemePicker
        selectedThemeId=""
        themes={[]}
        onSelectTheme={() => {}}
      />,
    );

    expect(rendered.container.textContent).toContain('没有找到匹配的主题。');

    cleanupRender(rendered);
  });
});
