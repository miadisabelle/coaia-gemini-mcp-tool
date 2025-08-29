// Tool Registry Index - Registers all tools for Structural Thinking Engine v3.0.0
import { toolRegistry } from './registry.js';

// Core tools
import { askGeminiTool } from './ask-gemini.tool.js';
import { pingTool, helpTool } from './simple-tools.js';

// Creative process tools  
import { createTool } from './create.tool.js';

// Structural thinking tools
import { structuralObserveTool } from './structural-observe.tool.js';
import { detectPatternsTool } from './detect-patterns.tool.js';
import { biasDetectorTool } from './bias-detector.tool.js';

// Memory integration tools
import { createTensionChartTool } from './create-tension-chart.tool.js';

// Consciousness protocols
import { rippleEmbodyTool } from './ripple-embody.tool.js';

// Utility tools
import { fetchChunkTool } from './fetch-chunk.tool.js';
import { timeoutTestTool } from './timeout-test.tool.js';

// Register all tools in the structural thinking engine
toolRegistry.push(
  // Core functionality
  askGeminiTool,
  pingTool,
  helpTool,
  
  // Creative process (enhanced)
  createTool,
  
  // Structural thinking foundation
  structuralObserveTool,
  detectPatternsTool,
  biasDetectorTool,
  
  // Memory integration
  createTensionChartTool,
  
  // Consciousness protocols
  rippleEmbodyTool,
  
  // Utilities
  fetchChunkTool,
  timeoutTestTool
);

export * from './registry.js';