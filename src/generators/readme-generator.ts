import path from 'node:path';
import fs from 'fs-extra';
import type { InitAnswers } from '../types/selections.js';
import { logger } from '../utils/logger.js';

function scriptBlock(bundler: InitAnswers['bundler']): string {
  if (bundler === 'vite') {
    return [
      '- `pnpm dev`：启动开发服务器',
      '- `pnpm build`：构建生产产物',
      '- `pnpm preview`：本地预览生产构建',
    ].join('\n');
  }

  if (bundler === 'webpack') {
    return [
      '- `pnpm dev`：启动开发服务器',
      '- `pnpm build`：构建生产产物',
    ].join('\n');
  }

  // rspack
  return [
    '- `pnpm dev`：启动开发服务器',
    '- `pnpm build`：构建生产产物',
  ].join('\n');
}

function structureBlock(framework: InitAnswers['framework']): string {
  const lines: string[] = [
    '```text',
    '.',
    '├─ public/                     # 静态资源（不经构建直接输出）',
    '├─ src/',
    '│  ├─ core/                    # 基础设施层（router/http/store/utils 等）',
    '│  ├─ features/                # 按业务域拆分的 feature slice',
    '│  ├─ components/              # 跨 feature 共享组件',
    '│  ├─ layouts/                 # 布局壳层',
    '│  ├─ theme/                   # 主题与设计令牌',
    '│  ├─ assets/                  # 静态资源与素材',
    '│  └─ ' + (framework === 'react' ? 'main.tsx' : 'main.ts') + '               # 入口文件',
    '├─ .fe-kit/                    # fe-kit 生成的元数据与规则',
    '├─ docs/                       # 文档与 bootstrap 约束产物',
    '├─ plan/                       # 计划与执行记录',
    '├─ package.json',
    '├─ tsconfig.json',
    '└─ README.md',
    '```',
  ];
  return lines.join('\n');
}

export async function generateReadme(answers: InitAnswers): Promise<void> {
  const outPath = path.join(answers.projectPath, 'README.md');

  const content = [
    `# ${answers.projectName}`,
    '',
    '一个由 **fe-kit** 初始化的前端工程骨架。',
    '',
    '## 环境要求',
    '',
    '- Node.js >= 18',
    '- pnpm（推荐）',
    '',
    '## 快速开始',
    '',
    '安装依赖：',
    '',
    '```bash',
    'pnpm install',
    '```',
    '',
    '常用脚本：',
    '',
    scriptBlock(answers.bundler),
    '',
    '## 目录结构',
    '',
    structureBlock(answers.framework),
    '',
    '## 约定说明（重要）',
    '',
    '- **目录骨架已对齐 bootstrap 约束**：默认生成 `src/core`、`src/features`、`docs`、`plan` 等稳定目录。',
    '- **docs/bootstrap/**：包含初始化 checklist、bootstrap prompt 和脚手架说明，便于后续继续扩展。',
    '- **部分空目录会带 `.gitkeep`**：这是为了让 Git 保留初始化骨架；如果目录后续已有真实文件，或你不需要保留空目录，可以直接删除这些 `.gitkeep`。',
    '',
  ].join('\n');

  await fs.writeFile(outPath, content, 'utf-8');
  logger.success('README.md generated');
}

