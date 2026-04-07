import type { Framework } from '../constants/frameworks.js';
import type { Bundler } from '../constants/bundlers.js';
import type { DevToolId } from '../constants/tools.js';
import type { LintTool, QualityTool } from '../constants/lint.js';

export interface InitAnswers {
  projectName: string;
  projectPath: string;
  framework: Framework;
  router: string;
  stateManagement: string;
  bundler: Bundler;
  lintTools: LintTool[];
  devTools: DevToolId[];
  skills: string[];
  mcpServers: string[];
}

export interface EnhanceAnswers {
  devTools: DevToolId[];
  qualityTools: QualityTool[];
  skills: string[];
  mcpServers: string[];
}
