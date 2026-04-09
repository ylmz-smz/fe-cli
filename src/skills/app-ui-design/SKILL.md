---
name: app-ui-design
description: Review App/H5 UI code for UI 设计规范 compliance. Use when the user asks to “检查 UI 规范/对齐规范/审查页面”, “review UI”, “按设计规范检查 App/H5”, or wants a terse issues list in `file:line - finding` format plus a final `✓ pass` when clean.
metadata:
  author: internal
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# App UI Design Guidelines Checker

在开发过程中，按“设计规范”对指定文件进行快速审查，输出**可定位、可执行**的问题清单。

输出风格对齐 Web Interface Guidelines：**先读取最新规范 → 读取目标文件 → 按固定格式输出问题**。

## How It Works

1. 读取最新的 UI 规范规则文件（见下方 Source）
2. 读取用户指定的文件/目录/模式（前端代码、样式文件、设计稿标注文档等）
3. 对照规则逐条检查，产出**可定位**的问题列表
4. 若无问题：输出 `✓ pass`

## Guidelines Source

默认从本 skill 目录内的规则说明文件读取（单一真源，随 skill 一起被复制到运行环境）：

- `references/rules.md`（相对 `SKILL.md`）

可选：如果你把规则托管到远程（例如 GitHub Raw），审查时应优先从远程拉取最新版本，再进行检查。

## Usage

当用户提供 `<file-or-pattern>` 时：

1. 读取 `references/rules.md`（作为审查规则）
2. 读取并遍历用户目标（单文件、目录或 glob pattern）
3. 按规则检查并输出发现

当用户没有提供 `<file-or-pattern>` 时：询问需要审查的文件/目录/模式。

## Output Format (MUST)

输出必须是**简洁问题列表**，每条一行，格式如下（示例）：

```text
path/to/file.tsx:123 - [app-ui] <finding>
path/to/file.css:45 - [app-ui] <finding>
✓ pass - no app-ui issues found
```

规则：

- 每条 finding 必须能落地为“可执行动作”（要改什么/怎么对齐），不要写成散文
- 尽可能给出最具体的定位（文件路径 + 行号）
- 若无法精确到行号（例如仅能判断组件结构/布局语义），至少要定位到文件，并在 finding 中写明“无法精确行号”的原因
- 避免把“软方向/品牌调性”当作硬验收；若引用软方向，必须同时给出可执行的约束（例如“字号范围/间距/颜色/对比度”）

## Scope Notes

- 本 skill 只做“对照规则的 UI 审查”，不负责从 `.docx` 抽取规则；规则维护请直接更新 `references/rules.md`
- 若项目存在多端差异（App vs H5），审查时必须在 finding 中写明端类型与差异理由，避免把某端特例当成通用规则

