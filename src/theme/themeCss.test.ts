import { describe, expect, it } from 'vitest';
import { toThemeCssVariables } from './themeCss';
import { THEME_REGISTRY } from './themeRegistry';

describe('toThemeCssVariables', () => {
  it('maps theme tokens to CSS custom properties', () => {
    const theme = THEME_REGISTRY[0];
    const cssVars = toThemeCssVariables(theme);

    expect(cssVars).toMatchObject({
      '--theme-background': theme.tokens.background,
      '--theme-surface': theme.tokens.surface,
      '--theme-text': theme.tokens.text,
      '--theme-heading': theme.tokens.heading,
      '--theme-accent': theme.tokens.accent,
      '--theme-border': theme.tokens.border,
      '--theme-quote-bg': theme.tokens.quoteBackground,
      '--theme-quote-border': theme.tokens.quoteBorder,
      '--theme-code-bg': theme.tokens.codeBackground,
      '--theme-body-font': theme.tokens.bodyFont,
      '--theme-heading-font': theme.tokens.headingFont,
    });
  });
});
