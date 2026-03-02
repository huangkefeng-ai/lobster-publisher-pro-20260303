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

function openThemeDropdown(container: HTMLDivElement) {
  const trigger = container.querySelector('.theme-dropdown-trigger') as HTMLButtonElement | null;
  expect(trigger).not.toBeNull();
  act(() => {
    trigger?.click();
  });
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

    const trigger = rendered.container.querySelector('.theme-dropdown-trigger');
    expect(trigger?.textContent).toContain('全部 2 款');

    openThemeDropdown(rendered.container);

    const firstButton = rendered.container.querySelector(`.theme-card[aria-pressed="true"]`) as HTMLButtonElement | null;
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

    openThemeDropdown(rendered.container);

    const secondButton = rendered.container.querySelector(`.theme-card:not([aria-pressed="true"])`) as HTMLButtonElement | null;
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

    openThemeDropdown(rendered.container);

    const input = rendered.container.querySelector('input[aria-label="搜索主题"]') as HTMLInputElement | null;
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

    openThemeDropdown(rendered.container);

    expect(rendered.container.textContent).toContain('没有找到匹配的主题。');

    cleanupRender(rendered);
  });

  it('displays the "常用（推荐）" category as the first group', () => {
    const rendered = renderThemePicker(
      <ThemePicker
        selectedThemeId={THEME_REGISTRY[0].id}
        themes={THEME_REGISTRY}
        onSelectTheme={() => {}}
      />,
    );

    openThemeDropdown(rendered.container);

    const groupTitles = rendered.container.querySelectorAll('.theme-group-title');
    expect(groupTitles[0].textContent).toBe('常用（推荐）');

    cleanupRender(rendered);
  });
});
