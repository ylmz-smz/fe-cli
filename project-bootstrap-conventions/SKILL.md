---
name: project-bootstrap-conventions
description: "Initialize a new project with reusable directory conventions, naming rules, validation steps, and a bootstrap checklist. Use when starting a new repo, scaffolding a frontend app, or aligning project structure before first implementation."
argument-hint: "Optional: stack, package manager, feature domains, routing shape, and whether responsive/mobile, demo mode, or custom lint rules are required"
---

# Project Bootstrap Conventions

## Purpose

把成熟项目里稳定、可迁移的工程约定抽成初始化工作流，帮助新仓库在第一天就建立清晰的目录结构、命名规范、校验入口与开发约束。

这个 skill 的目标不是复制来源仓库的业务实现，而是输出一套可变量化的初始化骨架。

---

## When to Use

- 新建前端项目或中后台项目时
- 新仓库已经有脚手架，但目录和规范还未定型时
- 需要把团队约定沉淀成统一初始化流程时
- 准备引入 feature slice、统一命名规则、统一验证流程时
- 需要在第一批文件创建前先定义目录与工程边界时

---

## Inputs to Collect

开始前先确认这些变量，再生成目录和规则：

1. 技术栈：例如 Vite + React + TypeScript，或其他前端栈
2. 包管理器：pnpm、npm 或 yarn
3. 应用形态：后台管理、门户、工作台、移动优先、PC 优先
4. 主要业务域：例如 auth、dashboard、admin、reporting
5. 路由复杂度：平铺路由、嵌套路由、是否有动态路由段
6. 状态模型：是否需要全局 store、服务端状态管理、表单状态策略
7. 是否需要 demo/mock 模式
8. 是否需要移动端响应式控件抽象层
9. 是否需要自定义 ESLint 硬规则
10. 是否需要 docs、plan、codemap 这类文档目录

如果用户未提供完整输入，先给出最小可用方案，再把不确定项标为占位。

### Input Strategy

1. 优先使用用户已经明确提供的输入。
2. 对于未提供但有合理默认值的项，使用默认假设推进。
3. 对于未提供且无法安全默认的项，在 Assumptions 中明确标记为待确认。
4. 不要因为输入不完整而阻塞初始化建议，优先交付最小可用方案。

### Default Assumptions

当用户没有明确指定时，按以下默认假设推进，并在输出里显式标注：

- 优先做前端 Web 项目初始化
- 优先采用 feature slice 结构
- 优先保留 docs 与 plan 目录
- 优先要求 typecheck、lint、test 三类验证入口
- 优先输出最小骨架，不生成业务实现

---

## Stable Conventions to Apply

### 1. 顶层目录边界

优先建立以下稳定骨架：

- src/core：基础设施层，如 router、http、store、hooks、utils
- src/features：按业务域划分功能切片
- src/components：跨 feature 共享组件
- src/layouts：应用壳层和布局层
- src/theme：主题或设计令牌
- docs：PRD、设计说明、codemap
- plan：任务计划、进度、调研记录

### 2. Feature Slice 结构

每个 feature 优先使用统一分层：

- pages：路由页面
- components：feature 内复用组件
- services：接口调用或数据访问
- types：类型定义
- constants：常量定义
- hooks：该 feature 专属 Hook

### 3. 页面目录规则

- pages 内的目录层级镜像路由层级
- 可路由页面优先使用页面目录承接实现：page.tsx、page.test.tsx、index.ts
- 动态路由段统一使用 [param] 目录命名
- 父级布局页统一使用 _layout 目录
- index.ts 仅用于稳定导出，不承载业务实现

### 4. 常量与组件定位规则

- 页面专属常量放在 feature/constants 下，并尽量镜像 pages 结构
- 单页面专属组件放入 feature/components 下的页面语义子目录
- 跨 feature 共享组件统一放在 src/components

### 5. 代码与导入规范

- 默认使用命名导出，不使用默认导出
- 优先使用路径别名，避免跨层级相对路径遍历
- store 更新采用不可变更新
- 日期处理统一依赖单一日期库，不混用原生格式化方式
- 统一错误处理策略，避免静默吞错
- 为核心函数、导出类型、关键数据结构补充 JSDoc

### 6. 验证流程

初始化完成后至少具备：

- 可运行的开发命令
- 类型检查命令
- 测试入口
- lint 入口
- 最小文档入口

---

## Project Variables to Fill

生成初始化方案时，把下列内容替换为模板变量，不要硬编码来源项目细节：

- <package-manager>
- <app-name>
- <build-stack>
- <language-stack>
- <ui-or-runtime-stack>
- <routing-solution>
- <state-solution>
- <test-solution>
- <dev-command>
- <typecheck-command>
- <lint-command>
- <test-command>
- <feature-domains>
- <dynamic-route-pattern>
- <layout-dir-pattern>

生成输出前，先用用户已确认的输入值替换全部模板变量。最终交付内容里不应残留尖括号占位符。

可选配置输入：

- <docs-scope>：用于决定是否创建 docs、plan、codebase-map 等文档目录与说明
- <demo-mode-strategy>：用于决定是否增加 demo/mock 目录与对应约定

变量依赖说明：

- <feature-domains> 决定需要展开多少个 feature 子目录；目录骨架中的 domain 占位符只是示例展开形式
- <dynamic-route-pattern> 和 <layout-dir-pattern> 应与 <routing-solution> 保持一致

变量替换规则：

- 已确认变量：替换为具体值
- 未确认但有默认值的变量：替换为默认值，并在 Assumptions 中说明
- 未确认且无默认值的变量：使用描述性文字说明其待确认状态，不要把尖括号占位符直接留在最终结果里

不要复制具体业务角色、页面名、接口名、品牌名或现有组件名。

---

## Recommended Directory Skeleton

本 skill 依赖同目录下的 bundled template：templates/scaffold-tree.md

生成时遵循两个原则：

1. 先产出通用骨架，再按业务域填充
2. 目录结构能直接反推路由和职责边界

---

## Bootstrap Workflow

1. 读取用户提供的技术栈、业务域与初始化目标。
2. 判断执行模式：
	- 若用户明确要求新建项目、初始化仓库或从零搭骨架，使用 Greenfield Bootstrap。
	- 若用户已有仓库、已有 src 或已有配置文件，需要整理结构，使用 Existing Repo Alignment。
	- 若两者都可能，优先遵循用户明确意图；无明确意图时，按当前仓库状态选择更保守的 Existing Repo Alignment。
3. 如果输入不完整，先采用默认假设，再把待确认项单独列出。
4. 先输出目录树与职责边界，不直接生成大量业务代码。
5. 为每个 feature 生成最小目录骨架，并保留占位页面目录。
6. 输出命名、导出、状态、日期、错误处理、测试入口等开发约定。
7. 如果项目需要响应式表单或日期控件，明确要求抽象层位置和适用范围。
8. 如果项目需要 demo/mock 模式，定义集中管理位置，而不是分散在业务文件里。
9. 生成初始化检查清单，并提示用户用最小命令完成验证。

### Execution Modes

#### Mode A: Greenfield Bootstrap

适用于从零开始的新仓库。

输出重点：

- 建议目录树
- 每层职责边界
- 初始化约定摘要
- 首批应创建的最小文件集合
- 验证命令建议

#### Mode B: Existing Repo Alignment

适用于已有脚手架或已有仓库。

输出重点：

- 当前结构与目标结构的差异
- 建议新增、移动、保留的目录
- 明确哪些规范应先补齐
- 不进行大范围迁移，优先给最小对齐方案

---

## Validation Checklist

本 skill 依赖同目录下的 bundled template：templates/init-checklist.md

完成初始化后，至少核对以下事项：

- package manager 与 scripts 已统一
- 类型检查可以独立运行
- lint 可以独立运行
- 测试入口已存在
- 路径别名已配置
- docs 与 plan 目录已建立或明确不需要
- 共享组件与 feature 组件边界清晰
- 路由页面目录可从 URL 反推
- 日期、错误处理、日志策略已统一

## Bootstrap Instruction Template

如果用户希望初始化后立即具备一份项目级常驻规范，可使用 bundled template：templates/copilot-instructions.template.md

使用原则：

- 只保留跨仓库稳定适用的工程规则
- 技术栈、命令、目录边界使用项目变量替换
- 不写入来源仓库的业务角色、业务流程和现有实现细节
- 第一版保持轻量，避免把 skill 中的全部内容再次复制进 instructions

---

## Anti-patterns

执行该 skill 时，避免以下行为：

- 不要复制来源仓库的业务角色、业务流或接口设计
- 不要在初始化阶段预生成大量页面业务代码
- 不要把某个项目的目录细节冒充为所有项目都适用的唯一标准
- 不要在最终输出中保留未替换的模板占位符
- 不要为了“完整”而引入尚未确认需要的抽象层

---

## What Not to Copy From the Source Repo

以下内容必须剥离或改成占位符：

- 业务角色和业务流程
- 具体页面名称和接口名称
- 特定品牌、域名、代理地址和部署路径
- 具体公共组件名、Hook 名和服务函数名
- 当前仓库的扫描结果、技术债和临时 workaround
- 特定 ESLint 规则 id 和仓库专有工具名

如果来源项目中存在“稳定约定”和“业务特例”，只迁移前者。

---

## Output

执行该 skill 时，必须输出以下内容：

1. 一份可复制的目录骨架
2. 一份初始化约定摘要
3. 一份验证清单
4. 若用户要求落盘，则创建对应目录和最小说明文件

默认只交付“初始化结构与规则”，不要在没有明确要求时扩展出完整业务实现。

### Required Response Format

执行该 skill 时，必须按这个顺序组织结果，减少歧义：

1. Scope：本次是 Greenfield Bootstrap 还是 Existing Repo Alignment
2. Assumptions：已确认输入和默认假设
3. Structure：建议目录树或对齐差异
4. Conventions：必须落地的开发规范
5. Validation：初始化后立即执行的校验项
6. Next Actions：若用户要求落盘，接下来要创建的最小文件集合

### File Creation Policy

- 默认只输出文本形式的结构建议和规范摘要。
- 仅在用户明确要求创建目录、创建文件、初始化仓库或落盘时，才进行实际文件创建。
- 发生文件创建时，严格遵循 Minimal File Set，避免一次性铺开完整业务代码。

### Minimal File Set

如果用户要求直接初始化仓库，优先创建最小必要集合，而不是一次性铺满所有目录：

- 目录骨架本身
- 一个路由入口或页面占位入口
- 一个共享基础设施入口，例如 core/router 或 core/http
- 一份项目级说明文件，例如 README 或 docs/bootstrapping notes
- 一份轻量级 .github/copilot-instructions.md，可基于 bundled template 生成
- 一组基础验证命令所需的配置文件