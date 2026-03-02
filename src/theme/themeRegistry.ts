import type { ThemeDefinition } from './themeTypes';

type ThemeSeed = Omit<ThemeDefinition, 'tokens'> & {
  palette: {
    background: string;
    surface: string;
    text: string;
    heading: string;
    accent: string;
    border: string;
    quoteBackground: string;
    quoteBorder: string;
    codeBackground: string;
  };
  typography: {
    bodyFont: string;
    headingFont: string;
  };
};

const FONTS = {
  editorial: {
    bodyFont: '"Source Serif 4", Georgia, serif',
    headingFont: '"Playfair Display", Georgia, serif',
  },
  modern: {
    bodyFont: '"IBM Plex Sans", "Segoe UI", sans-serif',
    headingFont: '"Space Grotesk", "Segoe UI", sans-serif',
  },
  classic: {
    bodyFont: '"Noto Serif SC", "PingFang SC", serif',
    headingFont: '"Noto Sans SC", "PingFang SC", sans-serif',
  },
  clean: {
    bodyFont: '"Atkinson Hyperlegible", Arial, sans-serif',
    headingFont: '"Archivo", Arial, sans-serif',
  },
} as const;

const THEME_SEEDS: ThemeSeed[] = [
  { id: 'apple-white', name: 'Mac（纯净白）', family: 'minimal', palette: { background: '#ffffff', surface: '#ffffff', text: '#1d1d1f', heading: '#111111', accent: '#0066cc', border: '#eaeaea', quoteBackground: '#f5f5f7', quoteBorder: '#0066cc', codeBackground: '#f5f5f7' }, typography: FONTS.modern },
  { id: 'claude-oat', name: 'Claude（燕麦色）', family: 'soft', palette: { background: '#f8f6f0', surface: '#ffffff', text: '#2b2b2b', heading: '#b75c3d', accent: '#b75c3d', border: '#e0ddd6', quoteBackground: '#f3f0e8', quoteBorder: '#b75c3d', codeBackground: '#f0ece4' }, typography: FONTS.modern },
  { id: 'wechat-native', name: '微信公众号原生', family: 'classic', palette: { background: '#ffffff', surface: '#ffffff', text: '#333333', heading: '#111111', accent: '#07c160', border: '#eaeaea', quoteBackground: '#f0f7f2', quoteBorder: '#07c160', codeBackground: '#f0f7f2' }, typography: FONTS.classic },
  { id: 'sunset-paper', name: 'Sunset Paper', family: 'warm', palette: { background: '#fff7ed', surface: '#ffffff', text: '#422006', heading: '#9a3412', accent: '#ea580c', border: '#fdba74', quoteBackground: '#ffedd5', quoteBorder: '#fb923c', codeBackground: '#ffedd5' }, typography: FONTS.editorial },
  { id: 'matcha-journal', name: 'Matcha Journal', family: 'nature', palette: { background: '#f0fdf4', surface: '#ffffff', text: '#14532d', heading: '#166534', accent: '#16a34a', border: '#86efac', quoteBackground: '#dcfce7', quoteBorder: '#4ade80', codeBackground: '#dcfce7' }, typography: FONTS.classic },
  { id: 'ocean-signal', name: 'Ocean Signal', family: 'cool', palette: { background: '#eff6ff', surface: '#ffffff', text: '#1e3a8a', heading: '#1d4ed8', accent: '#2563eb', border: '#93c5fd', quoteBackground: '#dbeafe', quoteBorder: '#60a5fa', codeBackground: '#dbeafe' }, typography: FONTS.modern },
  { id: 'charcoal-ink', name: 'Charcoal Ink', family: 'minimal', palette: { background: '#f5f5f5', surface: '#ffffff', text: '#171717', heading: '#262626', accent: '#404040', border: '#d4d4d4', quoteBackground: '#e5e5e5', quoteBorder: '#a3a3a3', codeBackground: '#f5f5f5' }, typography: FONTS.clean },
  { id: 'lavender-fog', name: 'Lavender Fog', family: 'soft', palette: { background: '#faf5ff', surface: '#ffffff', text: '#4c1d95', heading: '#6d28d9', accent: '#8b5cf6', border: '#c4b5fd', quoteBackground: '#ede9fe', quoteBorder: '#a78bfa', codeBackground: '#ede9fe' }, typography: FONTS.editorial },
  { id: 'copper-ledger', name: 'Copper Ledger', family: 'warm', palette: { background: '#fff7ed', surface: '#fffbeb', text: '#7c2d12', heading: '#b45309', accent: '#d97706', border: '#fcd34d', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.classic },
  { id: 'midnight-byte', name: 'Midnight Byte', family: 'tech', palette: { background: '#e2e8f0', surface: '#f8fafc', text: '#0f172a', heading: '#1e293b', accent: '#334155', border: '#94a3b8', quoteBackground: '#cbd5e1', quoteBorder: '#64748b', codeBackground: '#e2e8f0' }, typography: FONTS.modern },
  { id: 'peony-note', name: 'Peony Note', family: 'soft', palette: { background: '#fdf2f8', surface: '#fff1f2', text: '#831843', heading: '#9d174d', accent: '#db2777', border: '#f9a8d4', quoteBackground: '#fce7f3', quoteBorder: '#f472b6', codeBackground: '#fce7f3' }, typography: FONTS.editorial },
  { id: 'teal-wire', name: 'Teal Wire', family: 'cool', palette: { background: '#ecfeff', surface: '#f0fdfa', text: '#134e4a', heading: '#0f766e', accent: '#14b8a6', border: '#99f6e4', quoteBackground: '#ccfbf1', quoteBorder: '#2dd4bf', codeBackground: '#ccfbf1' }, typography: FONTS.modern },
  { id: 'sandstone-report', name: 'Sandstone Report', family: 'warm', palette: { background: '#fffbeb', surface: '#ffffff', text: '#78350f', heading: '#92400e', accent: '#b45309', border: '#fcd34d', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.classic },
  { id: 'mint-canvas', name: 'Mint Canvas', family: 'nature', palette: { background: '#f0fdf4', surface: '#f7fee7', text: '#365314', heading: '#3f6212', accent: '#65a30d', border: '#bef264', quoteBackground: '#ecfccb', quoteBorder: '#84cc16', codeBackground: '#ecfccb' }, typography: FONTS.clean },
  { id: 'ruby-column', name: 'Ruby Column', family: 'bold', palette: { background: '#fef2f2', surface: '#ffffff', text: '#7f1d1d', heading: '#991b1b', accent: '#dc2626', border: '#fca5a5', quoteBackground: '#fee2e2', quoteBorder: '#ef4444', codeBackground: '#fee2e2' }, typography: FONTS.editorial },
  { id: 'skyboard', name: 'Skyboard', family: 'cool', palette: { background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', heading: '#0369a1', accent: '#0ea5e9', border: '#bae6fd', quoteBackground: '#e0f2fe', quoteBorder: '#38bdf8', codeBackground: '#e0f2fe' }, typography: FONTS.modern },
  { id: 'forest-ledger', name: 'Forest Ledger', family: 'nature', palette: { background: '#f7fee7', surface: '#ffffff', text: '#1a2e05', heading: '#3f6212', accent: '#4d7c0f', border: '#a3e635', quoteBackground: '#ecfccb', quoteBorder: '#65a30d', codeBackground: '#ecfccb' }, typography: FONTS.classic },
  { id: 'amber-signal', name: 'Amber Signal', family: 'warm', palette: { background: '#fffbeb', surface: '#ffffff', text: '#78350f', heading: '#92400e', accent: '#d97706', border: '#fde68a', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.modern },
  { id: 'ink-and-ice', name: 'Ink and Ice', family: 'minimal', palette: { background: '#f8fafc', surface: '#ffffff', text: '#0f172a', heading: '#1e293b', accent: '#475569', border: '#cbd5e1', quoteBackground: '#e2e8f0', quoteBorder: '#94a3b8', codeBackground: '#e2e8f0' }, typography: FONTS.clean },
  { id: 'orchid-memo', name: 'Orchid Memo', family: 'soft', palette: { background: '#fdf4ff', surface: '#ffffff', text: '#581c87', heading: '#7e22ce', accent: '#a855f7', border: '#d8b4fe', quoteBackground: '#f3e8ff', quoteBorder: '#c084fc', codeBackground: '#f3e8ff' }, typography: FONTS.editorial },
  { id: 'citrus-zine', name: 'Citrus Zine', family: 'bold', palette: { background: '#fefce8', surface: '#ffffff', text: '#3f3f46', heading: '#a16207', accent: '#ca8a04', border: '#fde047', quoteBackground: '#fef9c3', quoteBorder: '#eab308', codeBackground: '#fef9c3' }, typography: FONTS.modern },
  { id: 'granite-grid', name: 'Granite Grid', family: 'minimal', palette: { background: '#f5f5f4', surface: '#ffffff', text: '#292524', heading: '#44403c', accent: '#57534e', border: '#d6d3d1', quoteBackground: '#e7e5e4', quoteBorder: '#a8a29e', codeBackground: '#e7e5e4' }, typography: FONTS.clean },
  { id: 'coral-post', name: 'Coral Post', family: 'warm', palette: { background: '#fff1f2', surface: '#ffffff', text: '#881337', heading: '#9f1239', accent: '#e11d48', border: '#fda4af', quoteBackground: '#ffe4e6', quoteBorder: '#fb7185', codeBackground: '#ffe4e6' }, typography: FONTS.editorial },
  { id: 'jade-wireframe', name: 'Jade Wireframe', family: 'nature', palette: { background: '#ecfdf5', surface: '#ffffff', text: '#064e3b', heading: '#065f46', accent: '#10b981', border: '#6ee7b7', quoteBackground: '#d1fae5', quoteBorder: '#34d399', codeBackground: '#d1fae5' }, typography: FONTS.modern },
  { id: 'indigo-bulletin', name: 'Indigo Bulletin', family: 'cool', palette: { background: '#eef2ff', surface: '#ffffff', text: '#312e81', heading: '#4338ca', accent: '#6366f1', border: '#a5b4fc', quoteBackground: '#e0e7ff', quoteBorder: '#818cf8', codeBackground: '#e0e7ff' }, typography: FONTS.classic },
  { id: 'apricot-ledger', name: 'Apricot Ledger', family: 'warm', palette: { background: '#fff7ed', surface: '#ffffff', text: '#7c2d12', heading: '#9a3412', accent: '#f97316', border: '#fdba74', quoteBackground: '#ffedd5', quoteBorder: '#fb923c', codeBackground: '#ffedd5' }, typography: FONTS.clean },
  { id: 'storm-brief', name: 'Storm Brief', family: 'minimal', palette: { background: '#f1f5f9', surface: '#ffffff', text: '#1e293b', heading: '#334155', accent: '#64748b', border: '#cbd5e1', quoteBackground: '#e2e8f0', quoteBorder: '#94a3b8', codeBackground: '#e2e8f0' }, typography: FONTS.modern },
  { id: 'lotus-page', name: 'Lotus Page', family: 'soft', palette: { background: '#fdf2f8', surface: '#ffffff', text: '#831843', heading: '#be185d', accent: '#ec4899', border: '#f9a8d4', quoteBackground: '#fce7f3', quoteBorder: '#f472b6', codeBackground: '#fce7f3' }, typography: FONTS.classic },
  { id: 'azure-column', name: 'Azure Column', family: 'cool', palette: { background: '#eff6ff', surface: '#ffffff', text: '#1e40af', heading: '#1d4ed8', accent: '#3b82f6', border: '#93c5fd', quoteBackground: '#dbeafe', quoteBorder: '#60a5fa', codeBackground: '#dbeafe' }, typography: FONTS.clean },
  { id: 'terracotta-journal', name: 'Terracotta Journal', family: 'warm', palette: { background: '#fef2f2', surface: '#fff7ed', text: '#7f1d1d', heading: '#b91c1c', accent: '#f97316', border: '#fdba74', quoteBackground: '#fee2e2', quoteBorder: '#f87171', codeBackground: '#fee2e2' }, typography: FONTS.editorial },
  { id: 'pine-manual', name: 'Pine Manual', family: 'nature', palette: { background: '#f0fdf4', surface: '#ffffff', text: '#14532d', heading: '#166534', accent: '#22c55e', border: '#86efac', quoteBackground: '#dcfce7', quoteBorder: '#4ade80', codeBackground: '#dcfce7' }, typography: FONTS.modern },
  { id: 'violet-storyboard', name: 'Violet Storyboard', family: 'soft', palette: { background: '#f5f3ff', surface: '#ffffff', text: '#4c1d95', heading: '#6d28d9', accent: '#8b5cf6', border: '#c4b5fd', quoteBackground: '#ede9fe', quoteBorder: '#a78bfa', codeBackground: '#ede9fe' }, typography: FONTS.clean },
  { id: 'cocoa-briefing', name: 'Cocoa Briefing', family: 'warm', palette: { background: '#fafaf9', surface: '#ffffff', text: '#451a03', heading: '#78350f', accent: '#b45309', border: '#e7e5e4', quoteBackground: '#f5f5f4', quoteBorder: '#d6d3d1', codeBackground: '#f5f5f4' }, typography: FONTS.classic },
  { id: 'neon-mint', name: 'Neon Mint', family: 'bold', palette: { background: '#ecfdf5', surface: '#ffffff', text: '#064e3b', heading: '#065f46', accent: '#14b8a6', border: '#5eead4', quoteBackground: '#ccfbf1', quoteBorder: '#2dd4bf', codeBackground: '#ccfbf1' }, typography: FONTS.modern },
  { id: 'steel-pulse', name: 'Steel Pulse', family: 'tech', palette: { background: '#f8fafc', surface: '#ffffff', text: '#111827', heading: '#1f2937', accent: '#374151', border: '#d1d5db', quoteBackground: '#e5e7eb', quoteBorder: '#9ca3af', codeBackground: '#e5e7eb' }, typography: FONTS.clean },
  { id: 'rosewood-editorial', name: 'Rosewood Editorial', family: 'bold', palette: { background: '#fff1f2', surface: '#ffffff', text: '#881337', heading: '#9f1239', accent: '#e11d48', border: '#f9a8d4', quoteBackground: '#ffe4e6', quoteBorder: '#fb7185', codeBackground: '#ffe4e6' }, typography: FONTS.editorial },
];

export const THEME_REGISTRY: ThemeDefinition[] = THEME_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  family: seed.family,
  tokens: {
    ...seed.palette,
    ...seed.typography,
  },
}));

export function getThemeById(themeId: string): ThemeDefinition | undefined {
  return THEME_REGISTRY.find((theme) => theme.id === themeId);
}
