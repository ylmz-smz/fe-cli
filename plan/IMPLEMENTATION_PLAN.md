## 阶段1：CLI 参数化与非交互模式

**目标**：为 init/enhance 增加关键命令行参数，支持无交互运行与 CI 自动化。
**完成标准**：
- init 支持 framework、bundler、router、stateManagement、qualityTools、devTools、skills、mcpServers、yes、install、packageManager 参数。
- enhance 支持 yes 与关键选择项参数化，交互与参数模式可共存。
- README 补充参数示例与 CI 用法。
**测试用例**：
- 使用全参数执行 init，命令无交互完成。
- 缺少必需参数时给出清晰错误信息。
- 参数与交互混合使用时，以显式参数优先。
**状态**：已完成

## 阶段2：初始化后自动化执行链路

**目标**：实现项目创建后自动安装依赖，并支持可选 git 初始化。
**完成标准**：
- init 默认执行依赖安装，可通过参数关闭。
- 支持 package manager 策略（优先 pnpm，可显式指定）。
- 支持可选 git init 与初始提交（默认可配置）。
**测试用例**：
- 新建项目后可直接执行 dev/build。
- install=false 时仅生成文件，不执行安装。
- 在无 git 环境或未启用 git 场景下行为稳定。
**状态**：已完成

## 阶段3：模板与版本矩阵升级

**目标**：对齐主流脚手架的模板依赖与脚本能力，建立版本单一来源。
**完成标准**：
- 提升模板依赖版本并集中管理，避免分散硬编码。
- Vue 模板补齐 vue-tsc 与推荐 tsconfig 组合。
- 统一输出脚本（lint、format、typecheck、test 的基础能力）。
**测试用例**：
- 六套模板均可完成 install、dev、build。
- Vue 模板 typecheck 可执行并通过。
- 版本更新仅需修改一处配置即可生效。
**状态**：已完成

## 阶段4：测试基线与脚手架稳定性

**目标**：建立脚手架生成结果的冒烟测试与关键回归测试。
**完成标准**：
- 对每种 framework + bundler 组合增加生成后 smoke 测试。
- 对 init/enhance 参数分支增加核心单元测试。
- CI 中加入模板可运行性校验任务。
**测试用例**：
- 批量生成项目并验证 dev/build/关键脚本可运行。
- 对默认值、可选项、错误分支进行回归测试。
- 回归测试能覆盖最近修复问题。
**状态**：已完成

## 阶段5：Next 一等公民支持

**目标**：将 Next 从检测增强能力扩展为完整 init 模板能力。
**完成标准**：
- init 支持 next 作为 framework 选项。
- 新增 next 模板与项目生成逻辑。
- 质量工具、规则、元数据、README 输出均兼容 next。
**测试用例**：
- next 项目可一键生成并启动。
- enhance 对 next 项目识别与增强行为正确。
- Next 路由与脚本结构符合官方推荐。
**状态**：已完成
