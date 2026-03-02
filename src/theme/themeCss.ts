import type { CSSProperties } from 'react';
import type { ThemeDefinition } from './themeTypes';

export function toThemeCssVariables(theme: ThemeDefinition): CSSProperties {
  return {
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
  } as CSSProperties;
}
