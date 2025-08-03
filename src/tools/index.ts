// Tool Registry Index - Registers all tools
import { toolRegistry } from './registry.js';
import { askGeminiTool } from './ask-gemini.tool.js';
import { pingTool, helpTool } from './simple-tools.js';
import { createTool } from './create.tool.js';
import { fetchChunkTool } from './fetch-chunk.tool.js';
import { timeoutTestTool } from './timeout-test.tool.js';

toolRegistry.push(
  askGeminiTool,
  pingTool,
  helpTool,
  createTool,
  fetchChunkTool,
  timeoutTestTool
);

export * from './registry.js';