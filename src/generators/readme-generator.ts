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
    '│  ├─ app/                     # “应用层”组织',
    '│  ├─ components/              # 业务/通用组件',
    '│  ├─ hooks/                   # React Hooks / Vue Composables（按需放）',
    '│  ├─ lib/                     # 工具函数、请求封装、纯逻辑（不直接依赖 UI）',
    '│  ├─ styles/                  # 样式与设计 token（按需放）',
    '│  └─ ' + (framework === 'react' ? 'main.tsx' : 'main.ts') + '               # 入口文件',
    '├─ .fe-kit/                    # fe-kit 生成的元数据与规则',
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
    '- **不包含 service/back-end 内容**：本骨架不生成任何服务端目录与 API 路由。',
    '- **应用层组织**：`src/app/` 仅作为代码组织约定，不强绑定具体框架运行时。',
    '',
  ].join('\n');

  await fs.writeFile(outPath, content, 'utf-8');
  logger.success('README.md generated');
}

