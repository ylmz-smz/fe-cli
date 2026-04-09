import type { McpSelection } from '../adapters/types.js';

export interface McpDefinition {
  id: string;
  label: string;
  description: string;
  config: Record<string, unknown>;
}

const BUILTIN_MCP: McpDefinition[] = [
  {
    id: 'context7',
    label: 'Context7',
    description: 'Fetch up-to-date library documentation via Context7.',
    config: {
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp@latest'],
    },
  },
  {
    id: 'sequential-thinking',
    label: 'Sequential Thinking',
    description: 'Step-by-step reasoning MCP server for complex problem solving.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/sequential-thinking-mcp@latest'],
    },
  },
  {
    id: 'filesystem',
    label: 'Filesystem',
    description: 'Read/write project files via MCP.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/filesystem-mcp@latest'],
    },
  },
  {
    id: 'exa-search',
    label: 'Exa Search',
    description: 'Neural web search for real-time information.',
    config: {
      command: 'npx',
      args: ['-y', 'exa-mcp-server@latest'],
      env: {
        EXA_API_KEY: '<your-exa-api-key>',
      },
    },
  },
];

export function getMcpCatalog(): McpDefinition[] {
  return BUILTIN_MCP;
}

export function getMcpById(id: string): McpSelection | undefined {
  const def = BUILTIN_MCP.find((m) => m.id === id);
  if (!def) return undefined;
  return { id: def.id, label: def.label, config: def.config };
}
