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
  { id: 'apple-white', name: 'Mac', description: '极简留白风格，适合日常记录与随笔。', family: 'recommended', palette: { background: '#ffffff', surface: '#ffffff', text: '#1d1d1f', heading: '#111111', accent: '#0066cc', border: '#eaeaea', quoteBackground: '#f5f5f7', quoteBorder: '#0066cc', codeBackground: '#f5f5f7' }, typography: FONTS.modern },
  { id: 'claude-oat', name: 'Claude', description: '温润燕麦色调，适合长文阅读与文学创作。', family: 'recommended', palette: { background: '#f8f6f0', surface: '#ffffff', text: '#2b2b2b', heading: '#b75c3d', accent: '#b75c3d', border: '#e0ddd6', quoteBackground: '#f3f0e8', quoteBorder: '#b75c3d', codeBackground: '#f0ece4' }, typography: FONTS.modern },
  { id: 'wechat-native', name: '微信公众号原生', description: '官方经典绿意风格，稳健专业的排版首选。', family: 'recommended', palette: { background: '#ffffff', surface: '#ffffff', text: '#333333', heading: '#111111', accent: '#07c160', border: '#eaeaea', quoteBackground: '#f0f7f2', quoteBorder: '#07c160', codeBackground: '#f0f7f2' }, typography: FONTS.classic },
  { id: 'sunset-paper', name: '暖阳日记', description: '暖阳橙调风格，适合生活志与情感表达。', family: 'recommended', palette: { background: '#fff7ed', surface: '#ffffff', text: '#422006', heading: '#9a3412', accent: '#ea580c', border: '#fdba74', quoteBackground: '#ffedd5', quoteBorder: '#fb923c', codeBackground: '#ffedd5' }, typography: FONTS.editorial },
  { id: 'matcha-journal', name: '抹茶周报', description: '清新抹茶绿色，适合自然科普与健康生活。', family: 'recommended', palette: { background: '#f0fdf4', surface: '#ffffff', text: '#14532d', heading: '#166534', accent: '#16a34a', border: '#86efac', quoteBackground: '#dcfce7', quoteBorder: '#4ade80', codeBackground: '#dcfce7' }, typography: FONTS.classic },
  { id: 'ocean-signal', name: '商务深蓝', description: '商务深蓝风格，适合科技前沿与行业研报。', family: 'recommended', palette: { background: '#eff6ff', surface: '#ffffff', text: '#1e3a8a', heading: '#1d4ed8', accent: '#2563eb', border: '#93c5fd', quoteBackground: '#dbeafe', quoteBorder: '#60a5fa', codeBackground: '#dbeafe' }, typography: FONTS.modern },
  { id: 'charcoal-ink', name: '工业灰', description: '工业灰色美学，适合产品说明与硬核测评。', family: 'recommended', palette: { background: '#f5f5f5', surface: '#ffffff', text: '#171717', heading: '#262626', accent: '#404040', border: '#d4d4d4', quoteBackground: '#e5e5e5', quoteBorder: '#a3a3a3', codeBackground: '#f5f5f5' }, typography: FONTS.clean },
  { id: 'lavender-fog', name: '薰衣草', description: '薰衣草淡紫色，适合诗歌艺术与感性文字。', family: 'soft', palette: { background: '#faf5ff', surface: '#ffffff', text: '#4c1d95', heading: '#6d28d9', accent: '#8b5cf6', border: '#c4b5fd', quoteBackground: '#ede9fe', quoteBorder: '#a78bfa', codeBackground: '#ede9fe' }, typography: FONTS.editorial },
  { id: 'copper-ledger', name: '古典羊皮纸', description: '古典羊皮纸感，适合历史沉淀与传统文化。', family: 'warm', palette: { background: '#fff7ed', surface: '#fffbeb', text: '#7c2d12', heading: '#b45309', accent: '#d97706', border: '#fcd34d', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.classic },
  { id: 'midnight-byte', name: '极客黑', description: '深邃夜间模式，适合编程指南与深夜故事。', family: 'tech', palette: { background: '#e2e8f0', surface: '#f8fafc', text: '#0f172a', heading: '#1e293b', accent: '#334155', border: '#94a3b8', quoteBackground: '#cbd5e1', quoteBorder: '#64748b', codeBackground: '#e2e8f0' }, typography: FONTS.modern },
  { id: 'peony-note', name: '芍药记', description: '柔美粉嫩风格，适合美妆穿搭与女性频道。', family: 'soft', palette: { background: '#fdf2f8', surface: '#fff1f2', text: '#831843', heading: '#9d174d', accent: '#db2777', border: '#f9a8d4', quoteBackground: '#fce7f3', quoteBorder: '#f472b6', codeBackground: '#fce7f3' }, typography: FONTS.editorial },
  { id: 'teal-wire', name: '活力青', description: '活力青色风格，适合创业动态与互联网观察。', family: 'cool', palette: { background: '#ecfeff', surface: '#f0fdfa', text: '#134e4a', heading: '#0f766e', accent: '#14b8a6', border: '#99f6e4', quoteBackground: '#ccfbf1', quoteBorder: '#2dd4bf', codeBackground: '#ccfbf1' }, typography: FONTS.modern },
  { id: 'sandstone-report', name: '大地游记', description: '大地色系风格，适合旅行游记与户外探索。', family: 'warm', palette: { background: '#fffbeb', surface: '#ffffff', text: '#78350f', heading: '#92400e', accent: '#b45309', border: '#fcd34d', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.classic },
  { id: 'mint-canvas', name: '薄荷清新', description: '薄荷清新风格，适合创意设计与灵感火花。', family: 'nature', palette: { background: '#f0fdf4', surface: '#f7fee7', text: '#365314', heading: '#3f6212', accent: '#65a30d', border: '#bef264', quoteBackground: '#ecfccb', quoteBorder: '#84cc16', codeBackground: '#ecfccb' }, typography: FONTS.clean },
  { id: 'ruby-column', name: '醒目红', description: '醒目正红风格，适合重磅头条与紧急通知。', family: 'bold', palette: { background: '#fef2f2', surface: '#ffffff', text: '#7f1d1d', heading: '#991b1b', accent: '#dc2626', border: '#fca5a5', quoteBackground: '#fee2e2', quoteBorder: '#ef4444', codeBackground: '#fee2e2' }, typography: FONTS.editorial },
  { id: 'skyboard', name: '教育蓝', description: '开阔天蓝风格，适合教育培训与知识付费。', family: 'cool', palette: { background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', heading: '#0369a1', accent: '#0ea5e9', border: '#bae6fd', quoteBackground: '#e0f2fe', quoteBorder: '#38bdf8', codeBackground: '#e0f2fe' }, typography: FONTS.modern },
  { id: 'forest-ledger', name: '深林访谈', description: '深林幽绿风格，适合深度访谈与思想随笔。', family: 'nature', palette: { background: '#f7fee7', surface: '#ffffff', text: '#1a2e05', heading: '#3f6212', accent: '#4d7c0f', border: '#a3e635', quoteBackground: '#ecfccb', quoteBorder: '#65a30d', codeBackground: '#ecfccb' }, typography: FONTS.classic },
  { id: 'amber-signal', name: '琥珀快讯', description: '明亮琥珀风格，适合快讯播报与实时点评。', family: 'warm', palette: { background: '#fffbeb', surface: '#ffffff', text: '#78350f', heading: '#92400e', accent: '#d97706', border: '#fde68a', quoteBackground: '#fef3c7', quoteBorder: '#f59e0b', codeBackground: '#fef3c7' }, typography: FONTS.modern },
  { id: 'ink-and-ice', name: '黑白学术', description: '冷峻黑白风格，适合专业论文与学术规范。', family: 'minimal', palette: { background: '#f8fafc', surface: '#ffffff', text: '#0f172a', heading: '#1e293b', accent: '#475569', border: '#cbd5e1', quoteBackground: '#e2e8f0', quoteBorder: '#94a3b8', codeBackground: '#e2e8f0' }, typography: FONTS.clean },
  { id: 'orchid-memo', name: '紫罗兰', description: '浪漫兰花紫色，适合婚礼策划与礼赠指南。', family: 'soft', palette: { background: '#fdf4ff', surface: '#ffffff', text: '#581c87', heading: '#7e22ce', accent: '#a855f7', border: '#d8b4fe', quoteBackground: '#f3e8ff', quoteBorder: '#c084fc', codeBackground: '#f3e8ff' }, typography: FONTS.editorial },
  { id: 'citrus-zine', name: '柠檬潮刊', description: '跳跃柠檬黄色，适合潮流前瞻与独立刊物。', family: 'bold', palette: { background: '#fefce8', surface: '#ffffff', text: '#3f3f46', heading: '#a16207', accent: '#ca8a04', border: '#fde047', quoteBackground: '#fef9c3', quoteBorder: '#eab308', codeBackground: '#fef9c3' }, typography: FONTS.modern },
  { id: 'granite-grid', name: '建筑灰', description: '沉稳花岗岩色，适合建筑设计与房产观察。', family: 'minimal', palette: { background: '#f5f5f4', surface: '#ffffff', text: '#292524', heading: '#44403c', accent: '#57534e', border: '#d6d3d1', quoteBackground: '#e7e5e4', quoteBorder: '#a8a29e', codeBackground: '#e7e5e4' }, typography: FONTS.clean },
  { id: 'coral-post', name: '珊瑚美食', description: '活泼珊瑚红色，适合美食推荐与探店分享。', family: 'warm', palette: { background: '#fff1f2', surface: '#ffffff', text: '#881337', heading: '#9f1239', accent: '#e11d48', border: '#fda4af', quoteBackground: '#ffe4e6', quoteBorder: '#fb7185', codeBackground: '#ffe4e6' }, typography: FONTS.editorial },
  { id: 'jade-wireframe', name: '翡翠品牌', description: '翡翠质感风格，适合品牌升级与年度总结。', family: 'nature', palette: { background: '#ecfdf5', surface: '#ffffff', text: '#064e3b', heading: '#065f46', accent: '#10b981', border: '#6ee7b7', quoteBackground: '#d1fae5', quoteBorder: '#34d399', codeBackground: '#d1fae5' }, typography: FONTS.modern },
  { id: 'indigo-bulletin', name: '靛蓝通知', description: '可靠靛蓝风格，适合官方声明与重要通知。', family: 'cool', palette: { background: '#eef2ff', surface: '#ffffff', text: '#312e81', heading: '#4338ca', accent: '#6366f1', border: '#a5b4fc', quoteBackground: '#e0e7ff', quoteBorder: '#818cf8', codeBackground: '#e0e7ff' }, typography: FONTS.classic },
  { id: 'apricot-ledger', name: '杏色整理', description: '清甜杏色风格，适合家居整理与生活好物。', family: 'warm', palette: { background: '#fff7ed', surface: '#ffffff', text: '#7c2d12', heading: '#9a3412', accent: '#f97316', border: '#fdba74', quoteBackground: '#ffedd5', quoteBorder: '#fb923c', codeBackground: '#ffedd5' }, typography: FONTS.clean },
  { id: 'storm-brief', name: '军事观察', description: '深蓝灰调风格，适合军事观察与地缘政治。', family: 'minimal', palette: { background: '#f1f5f9', surface: '#ffffff', text: '#1e293b', heading: '#334155', accent: '#64748b', border: '#cbd5e1', quoteBackground: '#e2e8f0', quoteBorder: '#94a3b8', codeBackground: '#e2e8f0' }, typography: FONTS.modern },
  { id: 'lotus-page', name: '荷花文学', description: '恬静荷花粉色，适合诗歌朗诵与文学奖。', family: 'soft', palette: { background: '#fdf2f8', surface: '#ffffff', text: '#831843', heading: '#be185d', accent: '#ec4899', border: '#f9a8d4', quoteBackground: '#fce7f3', quoteBorder: '#f472b6', codeBackground: '#fce7f3' }, typography: FONTS.classic },
  { id: 'azure-column', name: '财报蔚蓝', description: '稳重蔚蓝风格，适合财报解读与宏观研究。', family: 'cool', palette: { background: '#eff6ff', surface: '#ffffff', text: '#1e40af', heading: '#1d4ed8', accent: '#3b82f6', border: '#93c5fd', quoteBackground: '#dbeafe', quoteBorder: '#60a5fa', codeBackground: '#dbeafe' }, typography: FONTS.clean },
  { id: 'terracotta-journal', name: '陶土人文', description: '陶土红褐风格，适合考古发现与非遗传承。', family: 'warm', palette: { background: '#fef2f2', surface: '#fff7ed', text: '#7f1d1d', heading: '#b91c1c', accent: '#f97316', border: '#fdba74', quoteBackground: '#fee2e2', quoteBorder: '#f87171', codeBackground: '#fee2e2' }, typography: FONTS.editorial },
  { id: 'pine-manual', name: '常青手册', description: '常青松绿色风格，适合企业内刊与培训手册。', family: 'nature', palette: { background: '#f0fdf4', surface: '#ffffff', text: '#14532d', heading: '#166534', accent: '#22c55e', border: '#86efac', quoteBackground: '#dcfce7', quoteBorder: '#4ade80', codeBackground: '#dcfce7' }, typography: FONTS.modern },
  { id: 'violet-storyboard', name: '游戏紫', description: '魔幻紫罗兰风格，适合ACG动态与游戏测评。', family: 'soft', palette: { background: '#f5f3ff', surface: '#ffffff', text: '#4c1d95', heading: '#6d28d9', accent: '#8b5cf6', border: '#c4b5fd', quoteBackground: '#ede9fe', quoteBorder: '#a78bfa', codeBackground: '#ede9fe' }, typography: FONTS.clean },
  { id: 'cocoa-briefing', name: '可可哲学', description: '香醇可可棕色，适合职场进阶与管理哲学。', family: 'warm', palette: { background: '#fafaf9', surface: '#ffffff', text: '#451a03', heading: '#78350f', accent: '#b45309', border: '#e7e5e4', quoteBackground: '#f5f5f4', quoteBorder: '#d6d3d1', codeBackground: '#f5f5f4' }, typography: FONTS.classic },
  { id: 'neon-mint', name: '霓虹薄荷', description: '极高饱和薄荷绿，适合前卫设计与科技潮牌。', family: 'bold', palette: { background: '#ecfdf5', surface: '#ffffff', text: '#064e3b', heading: '#065f46', accent: '#14b8a6', border: '#5eead4', quoteBackground: '#ccfbf1', quoteBorder: '#2dd4bf', codeBackground: '#ccfbf1' }, typography: FONTS.modern },
  { id: 'steel-pulse', name: '钢铁工业', description: '硬朗钢铁灰色，适合汽车工业与重型装备。', family: 'tech', palette: { background: '#f8fafc', surface: '#ffffff', text: '#111827', heading: '#1f2937', accent: '#374151', border: '#d1d5db', quoteBackground: '#e5e7eb', quoteBorder: '#9ca3af', codeBackground: '#e5e7eb' }, typography: FONTS.clean },
  { id: 'rosewood-editorial', name: '玫瑰木社论', description: '深邃玫瑰木色，适合高端社论与独家视角。', family: 'bold', palette: { background: '#fff1f2', surface: '#ffffff', text: '#881337', heading: '#9f1239', accent: '#e11d48', border: '#f9a8d4', quoteBackground: '#ffe4e6', quoteBorder: '#fb7185', codeBackground: '#ffe4e6' }, typography: FONTS.editorial },
];

export const THEME_REGISTRY: ThemeDefinition[] = THEME_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  family: seed.family,
  description: seed.description,
  tokens: {
    ...seed.palette,
    ...seed.typography,
  },
}));

export function getThemeById(themeId: string): ThemeDefinition | undefined {
  return THEME_REGISTRY.find((theme) => theme.id === themeId);
}
