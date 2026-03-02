# Lobster Publisher Pro

面向公众号创作的 AI 驱动排版工具（开源版）。

目标：做一个比常见排版器更强、更稳定、可持续迭代的公众号排版工作台。

---

## 当前进度（Phase-1）

本仓库已经完成的基础能力：

- 项目基础架构（`core / editor / theme / preview / export`）
- Markdown 编辑器（含常用片段工具栏）
- 实时预览（Markdown → 文章预览）
- 主题系统（30+ 套 token 化主题，支持即时切换）
- HTML 导出基础管线（可继续增强微信兼容处理）
- 单元测试基础（编辑器状态与主题注册表）

---

## 本地运行

```bash
npm install
npm run dev
```

---

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

---

## 目录结构

- `src/core`：全局默认配置与公共常量
- `src/editor`：编辑器 UI 与状态管理（reducer）
- `src/theme`：主题定义、注册表、CSS 变量映射
- `src/preview`：Markdown 到主题化预览渲染
- `src/export`：导出管线（当前为 HTML 基线）

---

## 下一阶段计划

接下来会继续增强以下能力：

1. 富文本“魔法粘贴”（飞书/Notion/Word → Markdown 规范化）
2. 微信兼容增强（HTML 结构与样式转换）
3. 图片处理链路（上传、压缩、兼容复制到公众号）
4. 一键复制到公众号工作流
5. PDF 导出与端到端测试

---

## 说明

这是持续迭代项目。每完成一个阶段都会：

- 增量提交到 GitHub
- 补齐测试与文档
- 保证可回滚、可维护
