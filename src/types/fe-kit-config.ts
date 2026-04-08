import type { Framework } from '../constants/frameworks.js';
import type { Bundler } from '../constants/bundlers.js';
import type { DevToolId } from '../constants/tools.js';
import type { LintTool } from '../constants/lint.js';

/** .fe-kit/project.json */
export interface ProjectMeta {
  name: string;
  framework: Framework;
  router: string;
  stateManagement: string;
  bundler: Bundler;
  typescript: true;
  lintTools: LintTool[];
  templateVersion: string;
  rulesVersion: string;
  cliVersion: string;
}

/** .fe-kit/skills.json */
export interface SkillEntry {
  id: string;
  source: 'builtin' | 'custom';
  targets: DevToolId[];
  version: string;
}

export interface SkillsMeta {
  enabled: SkillEntry[];
}

/** .fe-kit/mcp.json */
export interface McpEntry {
  id: string;
  adapterStatus: Partial<Record<DevToolId, 'written' | 'pending'>>;
  version: string;
}

export interface McpMeta {
  enabled: McpEntry[];
  configVersion: string;
}

/** .fe-kit/tools.json */
export interface ToolsMeta {
  selectedTools: DevToolId[];
  paths: Partial<Record<DevToolId, string>>;
  extensionRecommendations: string[];
}
