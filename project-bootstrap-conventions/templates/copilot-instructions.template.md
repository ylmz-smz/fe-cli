# Project Copilot Instructions Template

将下列内容作为新项目的轻量级 .github/copilot-instructions.md 起点，先替换项目变量，再按实际团队约束增删。

````markdown
# <app-name> — Copilot Instructions

此文件用于沉淀当前项目的稳定工程约定。目标是帮助后续实现保持目录清晰、边界一致、验证路径明确。

## Tech Stack

- 构建：<build-stack>
- 语言：<language-stack>
- UI / Runtime：<ui-or-runtime-stack>
- 路由：<routing-solution>
- 状态：<state-solution>
- 测试：<test-solution>
- 包管理：<package-manager>

## Build And Validation Commands

```bash
<package-manager> <dev-command>
<package-manager> <typecheck-command>
<package-manager> <lint-command>
<package-manager> <test-command>
```

## Project Structure

```text
src/
  core/
  features/
  components/
  layouts/
  theme/
docs/
plan/
```

## Architecture Conventions

### Feature Slice Layout

每个 feature 优先按以下结构组织：

```text
features/<domain>/
  pages/
  components/
  services/
  types/
  constants/
  hooks/
```

### Pages Rules

- pages 目录层级应镜像路由层级
- 可路由页面优先使用 page.tsx、page.test.tsx、index.ts 的页面目录模式
- 动态路由统一使用 <dynamic-route-pattern>
- 父级布局使用 <layout-dir-pattern>

### Components And Constants Rules

- 页面专属组件放在 feature/components 的页面语义子目录
- 跨 feature 共享组件放在 src/components
- 页面专属常量放在 feature/constants，并尽量镜像 pages 结构

## Coding Rules

- 默认使用命名导出
- 优先使用路径别名
- 状态更新保持不可变
- 日期处理统一使用单一方案
- 错误处理必须明确，避免静默吞错
- 为核心函数、导出类型和关键数据结构补充 JSDoc

## Working Rules

- 先阅读相关代码，再做最小必要改动
- 优先交付可验证的最小实现，不做未被要求的扩展
- 完成修改后至少执行一项与改动范围匹配的验证
- 若项目有 docs 或 plan 目录，变更时同步更新必要文档

## What Not To Do

- 不要复制其他仓库的业务角色、页面名或接口名
- 不要为了抽象而抽象
- 不要在没有确认需求时一次性生成大量业务代码
- 不要引入与当前技术栈不匹配的默认规则

````

落地建议：

- 先替换所有尖括号变量，再保存到 .github/copilot-instructions.md
- 如果项目需要更强约束，再额外拆分 instructions 或 skill，不要把所有规则都堆进同一个文件
