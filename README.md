# fe-kit

前端项目脚手架 CLI：初始化新项目、增强现有项目，并管理开发工具、Skills、MCP 与框架规则（Vue / React + TypeScript，支持 Vite、Webpack、Rspack）。

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

## 命令

| 命令 | 说明 |
|------|------|
| `init` | 交互式初始化 Vue 或 React + TypeScript 项目 |
| `enhance` | 在已有前端项目中叠加开发工具、skills、MCP、规则等 |

## 仓库结构（节选）

- `src/` — CLI 源码、模板、规则与内置资源
- `dist/` — 构建产物（发布内容）
- **`plan/`** — 见下文

## `plan/` 目录

用于存放**与代码实现解耦**的规划和协作材料，便于长期维护与对齐方向：

- **现有方案**：已采纳或正在执行的技术方案、架构决策记录等
- **后续计划**：路线图、里程碑、待启动功能的概要说明
- **待办与跟踪**：任务清单、复盘要点、会议结论摘要等

建议按主题或时间分子目录或文件命名（例如 `plan/2026-q2-roadmap.md`），避免与 `src/` 内的可执行逻辑混放。该目录不参与 CLI 打包；新增文档无需改构建配置。
