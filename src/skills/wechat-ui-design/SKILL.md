---
name: wechat-ui-design
description: Review UI code for WeChat Official Account / Mini Program UI rules compliance. Use when the user asks to “检查 UI 规范/对齐规范/审查页面”, “review UI”, “check accessibility/UX”, “按官微/小程序规范检查”, or wants a terse issues list in `file:line - finding` format plus a final `✓ pass` when clean.
metadata:
  author: internal
  version: "2.0.0"
  argument-hint: <file-or-pattern>
---

# WeChat UI Design Guidelines Checker

在开发过程中，按“官微/小程序 UI 设计规范”对指定文件进行快速审查，输出**可定位、可执行**的问题清单。

输出风格对齐 Web Interface Guidelines：**先拉取最新规范 → 读取目标文件 → 按固定格式输出问题**。

## How It Works

1. 读取最新的 UI 规范规则文件（见下方 Source）
2. 读取用户指定的文件/目录/模式（前端代码、样式文件、设计稿标注文档等）
3. 对照规则逐条检查，产出**可定位**的问题列表
4. 若无问题：输出 `✓ pass`

## Guidelines Source

默认从仓库内的规则说明文件读取（你可以把它当作“本项目的 WeChat UI 规范单一真源”）：

- `src/skills/wechat-ui-design/references/rules.md`

可选：如果你把规则托管到远程（例如 GitHub Raw），审查时应优先从远程拉取最新版本，再进行检查。

要求：每次审查前都要确保读取的是**最新内容**（如果规则文件被更新了，重新读取即可）。

## Usage

当用户提供 `<file-or-pattern>` 时：

1. 读取 `references/rules.md`（作为审查规则）
2. 读取并遍历用户目标（单文件、目录或 glob pattern）
3. 按规则检查并输出发现

当用户没有提供 `<file-or-pattern>` 时：询问需要审查的文件/目录/模式。

## Output Format (MUST)

输出必须是**简洁问题列表**，每条一行，格式如下（示例）：

```text
path/to/file.tsx:123 - [wechat-ui] <finding>
path/to/file.css:45 - [wechat-ui] <finding>
✓ pass - no wechat-ui issues found
```

规则：

- 每条 finding 必须能落地为“可执行动作”（要改什么/怎么对齐），不要写成散文
- 尽可能给出最具体的定位（文件路径 + 行号）
- 若无法精确到行号（例如仅能判断组件结构/布局语义），至少要定位到文件，并在 finding 中写明“无法精确行号”的原因
- 避免把“软方向/品牌调性”当作硬验收；若引用软方向，必须同时给出可执行的约束（例如“颜色饱和度不超过 X / 对比度不低于 Y / 字号范围”）

## Scope Notes

- 本 skill 只做“对照规则的 UI 审查”，不负责从手册抽取规则；规则维护请直接更新 `references/rules.md`
- 如果规则文件里存在“示例值 / 可能 OCR 错误”，审查时应以规则文件的归一化结果为准，并在 finding 中引用对应条目说明

