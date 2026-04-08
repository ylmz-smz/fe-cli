# fe-kit

前端项目脚手架 CLI：初始化新项目、增强现有项目，并管理开发工具、Skills、MCP 与框架规则（Vue / React + TypeScript，支持 Vite、Webpack、Rspack）。

## Breaking Changes (v0.2.0)

- **TSLint 已移除**：TSLint 早在 2019 年即被官方废弃，fe-kit 不再提供 TSLint 选项与生成器。请使用 ESLint + `typescript-eslint`（已为默认）。
- **配置输出路径变更**：Skills、Rules、MCP 不再写入 `.fe-kit/` 作为编辑器配置，改为直接写入各编辑器标准目录（见下文）。如果你之前依赖 `.fe-kit/skills.json` 或 `.fe-kit/mcp.json` 作为编辑器读取入口，需手动迁移。
- **新增 Cursor 作为独立适配目标**：之前只有 `vscode`，现在 `cursor` 是独立选项，默认选中。

## 编辑器配置输出

`init` / `enhance` 执行后，根据选择的开发工具，配置会写入以下**编辑器标准目录**：

| 编辑器 | Rules | Skills | MCP |
|--------|-------|--------|-----|
| **Cursor** | `.cursor/rules/*.mdc` | — (通过 rules 生效) | `.cursor/mcp.json` (`mcpServers`) |
| **Claude Code** | `.claude/rules/*.md` | `.claude/skills/<id>/SKILL.md` | `.mcp.json` (`mcpServers`) |
| **VS Code + Copilot** | `.github/copilot-instructions.md` | — (通过 instructions 生效) | `.vscode/mcp.json` (`servers`) |
| **CodeBuddy** | `.codebuddy/rules/*.mdc` | — (通过 rules 生效) | `.mcp.json` (`mcpServers`) |
| **Trae** | `.trae/rules/*.md` | `.trae/rules/<id>.md` | `.trae/mcp.json` (`mcpServers`) |

`.fe-kit/` 目录仍用于存储 fe-kit 内部元数据（`project.json` 等），但不再作为编辑器配置的输出目标。

## 环境要求

- Node.js ≥ 18
- **pnpm** ≥ 9（本仓库通过 `packageManager` 固定版本，建议启用 [Corepack](https://nodejs.org/api/corepack.html)：`corepack enable`）

## 包管理与发布

- 仅使用 **pnpm** 安装依赖；勿提交 `package-lock.json`（已在 `.gitignore` 中忽略）。
- 发布目标为 **npm** 公共仓库（`publishConfig.registry` 已指向 `https://registry.npmjs.org/`）。
- **版本与变更记录** 使用 [Changesets](https://github.com/changesets/changesets)：
  1. 完成功能或修复后：`pnpm changeset`，按提示选择 semver  bump 并写摘要。
  2. 准备发版：`pnpm version-packages`（更新 `package.json` 版本并写入 `CHANGELOG.md`），提交改动。
  3. 发布：`pnpm release`（先 `build`，再 `changeset publish`；`prepublishOnly` 也会保证发布前构建）。

首次发包前需在 npm 登录：`npm login`（或 `pnpm publish` 使用的同一 npm 身份）。

## 开发与构建

```bash
pnpm install
pnpm run build    # 产出 dist/
pnpm run dev      # tsup watch
pnpm run typecheck
```

全局或本地执行：

```bash
node dist/cli.mjs --help
```

本地全局命令执行
```bash
pnpm run build
pnpm link --global
fe-kit --help

#（用完可 pnpm unlink --global fe-kit 清理）
```

## 命令

| 命令 | 说明 |
|------|------|
| `init` | 交互式初始化 Vue 或 React + TypeScript 项目 |
| `enhance` | 在已有前端项目中叠加开发工具、skills、MCP、规则等 |

## 仓库结构（节选）

- `src/` — CLI 源码、模板、规则与内置资源
- `src/adapters/` — 各编辑器输出适配（Cursor / Claude Code / VS Code / CodeBuddy / Trae / IDEA）
- `src/rules/` — 内置规则 Markdown 源（按 common / react / vue 分类）
- `src/skills/` — 技能目录（`catalog.ts` + 各 `<skill>/SKILL.md` 预设模板，构建时拷贝到 `dist/skills/`）
- `dist/` — 构建产物（发布内容）
- **`plan/`** — 见下文

## `plan/` 目录

用于存放**与代码实现解耦**的规划和协作材料，便于长期维护与对齐方向：

- **现有方案**：已采纳或正在执行的技术方案、架构决策记录等
- **后续计划**：路线图、里程碑、待启动功能的概要说明
- **待办与跟踪**：任务清单、复盘要点、会议结论摘要等

建议按主题或时间分子目录或文件命名（例如 `plan/2026-q2-roadmap.md`），避免与 `src/` 内的可执行逻辑混放。该目录不参与 CLI 打包；新增文档无需改构建配置。
