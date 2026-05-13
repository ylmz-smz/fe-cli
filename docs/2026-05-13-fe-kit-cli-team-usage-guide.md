# fe-kit 使用说明

## 安装

```bash
pnpm add -g fe-kit-cli
```

## 命令一览

| 命令 | 用途 |
|------|------|
| `fe-kit init` | 新建前端项目 |
| `fe-kit enhance` | 给现有项目补配置 |

---

## `fe-kit init` — 新建项目

在目标父目录下运行：

```bash
fe-kit init
```

### 交互步骤（按顺序）

| 步骤 | 问题 | 可选值 | 默认值 |
|------|------|--------|--------|
| 1 | 项目名 | 自由填写 | — |
| 2 | 项目路径 | 自由填写 | `./<项目名>` |
| 3 | 框架 | `vue` / `react` / `next` | `vue` |
| 4 | 路由 | Vue→`vue-router`，React→`react-router`，Next→`next-app-router` | 随框架固定 |
| 5 | 状态管理 | Vue→`pinia`/`vuex`，React→`redux-toolkit`/`zustand`/`mobx`，Next→`redux-toolkit`/`zustand` | 各框架第一项 |
| 6 | 构建工具 | Vue/React→`vite`/`webpack`/`rspack`，Next→`next` | `vite` |
| 7 | 代码质量工具 | `eslint` `stylelint` `prettier` `editorconfig`（多选） | 全选 |
| 8 | 开发工具适配 | `cursor` `claude-code` `vscode` `codebuddy-cn` `trae` `idea`（多选，至少一个） | `cursor` |
| 9 | 内置 Skills | 多选，按需 | 不选 |
| 10 | MCP 服务 | `context7` `sequential-thinking` `filesystem` `exa-search`（多选） | 不选 |
| 11 | Feature domains | 逗号分隔，如 `auth,dashboard`（可留空） | 空 |

### 完成后生成了什么

- 框架模板项目（可直接 `pnpm install && pnpm dev`）
- `src/core`、`src/features`、`docs`、`plan` 等目录骨架
- ESLint / Prettier / Stylelint 等配置文件
- `.fe-kit/` 元数据（project / tools / skills / mcp 记录）
- 各编辑器配置目录（见下表）
- 自动安装依赖（默认开启）

### 各编辑器的配置落盘位置

| 编辑器 | Rules | Skills | MCP |
|--------|-------|--------|-----|
| Cursor | `.cursor/rules/*.mdc` | — | `.cursor/mcp.json` |
| Claude Code | `.claude/rules/*.md` | `.claude/skills/<id>/SKILL.md` | `.mcp.json` |
| VS Code + Copilot | `.github/copilot-instructions.md` | — | `.vscode/mcp.json` |
| CodeBuddy CN | `.codebuddy/rules/*.mdc` | — | `.mcp.json` |
| Trae | `.trae/rules/*.md` | `.trae/rules/<id>.md` | `.trae/mcp.json` |
| IDEA | `.idea/fe-kit/rules/*.md` | — | — |

### 非交互模式（CI / 固定命令）

所有选项都可以用参数传入，加 `--yes` 跳过剩余交互：

```bash
fe-kit init \
  --project-name my-app \
  --project-path ./my-app \
  --framework react \
  --router react-router \
  --state-management zustand \
  --bundler vite \
  --lint-tools eslint,prettier,editorconfig \
  --dev-tools cursor,vscode \
  --skills tdd-workflow,verification-loop \
  --mcp-servers context7,sequential-thinking \
  --feature-domains auth,dashboard \
  --package-manager pnpm \
  --git-init true \
  --git-commit true \
  --yes
```

### `init` 参数速查

| 参数 | 说明 | 默认 |
|------|------|------|
| `--project-name` | 项目名 | — |
| `--project-path` | 项目路径 | `./<project-name>` |
| `--framework` | `vue` / `react` / `next` | `vue` |
| `--router` | 路由方案 | 随框架 |
| `--state-management` | 状态管理 | 随框架第一项 |
| `--bundler` | 构建工具 | `vite` |
| `--lint-tools` | 逗号分隔质量工具 | 全选 |
| `--dev-tools` | 逗号分隔开发工具 | `cursor` |
| `--skills` | 逗号分隔 skill id | 空 |
| `--mcp-servers` | 逗号分隔 mcp id | 空 |
| `--feature-domains` | 逗号分隔业务域 | 空 |
| `--install` | 是否安装依赖 | `true` |
| `--package-manager` | `pnpm`/`npm`/`yarn`/`bun` | 按 lockfile 推断 |
| `--git-init` | 是否执行 `git init` | `false` |
| `--git-commit` | 是否创建首提交 | `false` |
| `--git-message` | 首提交信息 | `chore: initialize project with fe-kit` |
| `--yes` | 跳过所有交互，用默认值或参数值 | — |

---

## `fe-kit enhance` — 增强已有项目

进入项目根目录（必须有 `package.json`）：

```bash
cd your-project
fe-kit enhance
```

### 自动检测阶段（无需操作）

CLI 先自动识别：框架、构建工具、TypeScript 使用情况、是否有 Git。

### 交互步骤（4 步）

| 步骤 | 问题 | 默认值 |
|------|------|--------|
| 1 | 要适配哪些开发工具（至少选一个） | 读取 `.fe-kit` 历史记录，无记录则 `cursor` |
| 2 | 要安装/配置哪些质量工具 | `eslint` `prettier` `editorconfig`（`stylelint` `commitlint` 默认不选） |
| 3 | 要补充哪些 Skills | 读取 `.fe-kit` 历史记录 |
| 4 | 要补充哪些 MCP | 读取 `.fe-kit` 历史记录 |

### 非交互模式

```bash
fe-kit enhance \
  --dev-tools cursor,vscode \
  --quality-tools eslint,prettier,editorconfig,commitlint \
  --skills tdd-workflow \
  --mcp-servers context7 \
  --yes
```

---

## 常见问题

**`Could not detect a project`**：当前目录没有 `package.json`，切到正确目录再跑。

**参数校验报错（framework/router 不匹配）**：框架与路由/状态管理/构建工具有对应关系，参考上表。

**`--git-commit` 没有生效**：需要同时传 `--git-init true`，或目录中已有 `.git`。
