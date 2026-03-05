# Lobster Publisher Pro

面向微信公众号与内容创作者的现代化 Markdown 排版工作台。

> 一句话：把“写作 → 排版 → 预览 → 复制到公众号”这条链路做成稳定、可控、可二次开发的开源工具。

---

## ✨ 核心能力

- **魔法粘贴（Magic Paste）**
  - 兼容飞书 / Notion / Word / 网页富文本粘贴
  - 自动清洗冗余样式，转换为结构化 Markdown
  - 尽量保留：标题、列表、表格、代码、图片

- **主题系统（Design Tokens）**
  - 内置多套主题，一键切换
  - 支持 `飞书原生`、`微信公众号原生` 等风格
  - 主题影响预览、导出 HTML、公众号复制输出

- **代码块增强**
  - 支持语法高亮
  - 支持 macOS 风格代码块头部（三色交通灯）

- **公众号复制链路**
  - 输出公众号兼容 HTML（样式内联）
  - 适配微信后台粘贴场景，尽量降低样式丢失

- **多端实时预览**
  - 桌面 / 平板 / 手机三档视图切换
  - 便于提前检查移动端阅读效果

- **导出能力**
  - 导出带主题 HTML
  - 打开打印对话框导出 PDF

- **写作统计**
  - 字数统计（按字符）
  - 阅读时长估算
  - 非空行统计

- **界面模式**
  - 支持白天 / 黑夜模式切换
  - 按业务要求：实时预览区可保持白底阅读体验

---

## 🧩 技术栈

- **前端**：React + TypeScript + Vite
- **Markdown 渲染**：marked
- **内容清洗**：DOMPurify
- **测试**：Vitest / Playwright
- **图标**：lucide-react

---

## 🚀 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发服务

```bash
npm run dev
```

默认地址：`http://localhost:5173/`

### 3) 构建生产包

```bash
npm run build
```

---

## ✅ 质量检查

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

---

## 📁 目录结构

```text
src/
  core/        # 解析、渲染、统计、基础能力
  editor/      # Markdown 编辑器与交互
  preview/     # 多端实时预览
  theme/       # 主题定义、主题选择、Design Tokens
  wechat/      # 微信兼容处理（清洗、内联样式、复制）
  export/      # HTML/PDF 导出
  pipeline/    # 处理流水线（Markdown -> HTML -> Inline）
```

---

## 🔧 适合二次开发的入口

- 新增主题：`src/theme/themeRegistry.ts`
- 调整主题选择 UI：`src/theme/ThemePicker.tsx`
- 调整代码块渲染：`src/core/renderer.ts`
- 调整微信内联样式：`src/wechat/inlineStyles.ts`
- 调整整体界面样式：`src/App.css`
- 调整顶部操作区（按钮/链接/图标）：`src/App.tsx`

---

## ⚠️ 已知限制

- 极复杂富文本（深层嵌套样式）在转换后可能仍需少量人工微调
- 微信编辑器本身存在平台限制，个别 CSS 属性会被过滤
- 超窄容器下图片网格会降级，以保证可读性

---

## 🗺 Roadmap（建议）

- [ ] AI 辅助排版建议（段落层级、重点标注）
- [ ] 图床自动上传（替代 base64）
- [ ] 可复用内容组件（提示框、问答卡片、分栏模块）
- [ ] 一键发布工作流（排版后直达渠道）

---

## 🔗 仓库

- GitHub: https://github.com/huangkefeng-ai/lobster-publisher-pro-20260303
