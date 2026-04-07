import type { DevToolId } from '../constants/tools.js';
import type { Framework } from '../constants/frameworks.js';

export interface SkillSelection {
  id: string;
  label: string;
  content: string;
}

export interface McpSelection {
  id: string;
  label: string;
  config: Record<string, unknown>;
}

export interface AdapterContext {
  projectRoot: string;
  framework: Framework;
}

export interface ToolAdapter {
  readonly id: DevToolId;
  applySkills(ctx: AdapterContext, skills: SkillSelection[]): Promise<void>;
  applyMcp(ctx: AdapterContext, mcp: McpSelection[]): Promise<void>;
  applyRules(ctx: AdapterContext): Promise<void>;
}
