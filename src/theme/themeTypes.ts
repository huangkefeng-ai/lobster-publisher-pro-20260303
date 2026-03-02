export interface ThemeTokens {
  background: string;
  surface: string;
  text: string;
  heading: string;
  accent: string;
  border: string;
  quoteBackground: string;
  quoteBorder: string;
  codeBackground: string;
  bodyFont: string;
  headingFont: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  family: string;
  tokens: ThemeTokens;
}
