# fe-kit

前端项目脚手架 CLI：初始化新项目、增强现有项目，并管理开发工具、Skills、MCP 与框架规则（Vue / React + TypeScript，支持 Vite、Webpack、Rspack）。

## Breaking Changes (v0.2.0)

- **TSLint 已移除**：TSLint 早在 2019 年即被官方废弃，fe-kit 不再提供 TSLint 选项与生成器。请使用 ESLint + `typescript-eslint`（已为默认）。
- **配置输出路径变更**：Skills、Rules、MCP 不再写入 `.fe-kit/` 作为编辑器配置，改为直接写入各编辑器标准目录（见下文）。如果你之前依赖 `.fe-kit/skills.json` 或 `.fe-kit/mcp.json` 作为编辑器读取入口，需手动迁移。
- **新增 Cursor 作为独立适配目标**：之前只有 `vscode`，现在 `cursor` 是独立选项，默认选中。

## 编辑器配置输出

`init` / `enhance` 执行后，根据选择的开发工具，配置会写入以下**编辑器标准目录**：

| 编辑器 | Rules | Skills | MCP |
| ------ | ----- | ------ | --- |
| **Cursor** | `.cursor/rules/*.mdc` | —（通过 rules 生效） | `.cursor/mcp.json`（`mcpServers`） |
| **Claude Code** | `.claude/rules/*.md` | `.claude/skills/<id>/SKILL.md` | `.mcp.json`（`mcpServers`） |
| **VS Code + Copilot** | `.github/copilot-instructions.md` | —（通过 instructions 生效） | `.vscode/mcp.json`（`servers`） |
| **CodeBuddy CN** | `.codebuddy/rules/*.mdc` | —（通过 rules 生效） | `.mcp.json`（`mcpServers`） |
| **Trae** | `.trae/rules/*.md` | `.trae/rules/<id>.md` | `.trae/mcp.json`（`mcpServers`） |
| **IDEA** | `.idea/fe-kit/rules/*.md` | —（占位集成） | —（占位集成） |

`.fe-kit/` 目录仍用于存储 fe-kit 内部元数据（`project.json`、`skills.json`、`mcp.json`、`tools.json` 等），但不再作为编辑器配置的输出目标。

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

## 安装与运行

发布包名为 `fe-kit-cli`，命令名为 `fe-kit`。

直接全局安装：

```bash
pnpm add -g fe-kit-cli
fe-kit --help
```

在仓库里本地运行：

```bash
pnpm install
pnpm run build
node dist/cli.mjs --help
```

本地 link 成全局命令：

```bash
pnpm run build
pnpm link --global
fe-kit --help

# 用完可执行
pnpm unlink --global fe-kit-cli
```

当前 CLI 帮助输出如下：

```text
Usage: fe-kit [options] [command]

Frontend project scaffold CLI — init, enhance, and manage your dev environment.

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init            Initialize a new frontend project with Vue or React + TypeScript
  enhance         Enhance an existing frontend project with dev tools, skills, MCP, and rules
  help [command]  display help for command
```

## 使用说明

### 1. 初始化新项目

在任意目录运行：

```bash
fe-kit init
```

`init` 会按顺序询问这些信息：

1. 项目名与目标路径。
2. 前端框架：`vue` 或 `react`。
3. 路由方案：Vue 固定为 `vue-router`，React 固定为 `react-router`。
4. 状态管理：Vue 可选 `pinia`、`vuex`；React 可选 `redux-toolkit`、`zustand`、`mobx`。
5. 构建工具：`vite`、`webpack`、`rspack`。
6. 代码质量工具：当前默认全选 `eslint`、`stylelint`、`prettier`、`editorconfig`。
7. 开发工具适配：`cursor`、`claude-code`、`vscode`、`codebuddy-cn`、`trae`、`idea`。
8. 内置 Skills。
9. MCP 服务。

执行完成后，CLI 会：

1. 生成对应模板项目。
2. 写入 lint/format 相关配置。
3. 生成项目 README。
4. 写入 `.fe-kit/` 元数据。
5. 按所选工具写入 rules、skills、MCP 配置。

### 2. 增强已有项目

进入已有项目根目录后运行：

```bash
fe-kit enhance
```

`enhance` 要求当前目录至少存在 `package.json`。执行时会先自动识别：

1. 项目名。
2. 框架与构建工具。
3. 是否存在 TypeScript。
4. 是否已经初始化 Git。

随后进入交互选择：

1. 要写入配置的开发工具。
2. 要安装/配置的质量工具。
3. 要补充的 Skills。
4. 要补充的 MCP 服务。

当前默认勾选策略与 `init` 不同：

1. 默认选中 `eslint`、`prettier`、`editorconfig`。
2. `stylelint` 默认不选。
3. `commitlint` 默认不选。

执行完成后，CLI 会在保留现有项目基础上更新 `.fe-kit/` 元数据，并把新增配置合并到对应工具目录。

### 3. 内置能力范围

当前脚手架内置的主要选择项如下：

1. 框架：`vue`、`react`。
2. 构建工具：`vite`、`webpack`、`rspack`。
3. 开发工具：`cursor`、`claude-code`、`vscode`、`codebuddy-cn`、`trae`、`idea`。
4. MCP：`context7`、`sequential-thinking`、`filesystem`、`exa-search`。
5. Skills：从 `src/skills/` 目录动态加载，当前内置包括前端设计、TDD、Vue 最佳实践、调试、验证等多类模板。

### 4. 输出结果怎么看

执行 `init` 或 `enhance` 后，建议优先检查这些位置：

1. `.fe-kit/project.json`：项目基础元数据。
2. `.fe-kit/skills.json`：启用的内置技能记录。
3. `.fe-kit/mcp.json`：MCP 记录与适配状态。
4. `.fe-kit/tools.json`：选中的开发工具记录。
5. 对应编辑器目录：例如 `.cursor/`、`.claude/`、`.vscode/`、`.github/`、`.trae/`、`.idea/fe-kit/`。

## 开发与构建

```bash
pnpm install
pnpm run build    # 产出 dist/
pnpm run dev      # tsup watch
pnpm run typecheck
```

## 命令

| 命令 | 说明 |
| ---- | ---- |
| `init` | 交互式初始化 Vue 或 React + TypeScript 项目 |
| `enhance` | 在已有前端项目中叠加开发工具、Skills、MCP、规则等 |

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
