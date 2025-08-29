# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that integrates Google's Gemini CLI with AI assistants like Claude. The tool enables AI assistants to leverage Gemini's large context window for analyzing files and codebases using the `@` syntax.

**Key Capability**: The tool acts as a bridge between Claude and Gemini, allowing Claude to offload large file analysis to Gemini when needed.

## CREATE Tool: Authentic Creative Process Support (the word 'Authentic' here is not relevant, I have left it here to demonstrate that when writing documentation, words that dont add values are added... Creating is not problem solving, there is no 'Authentic Creative Process Support', there is just 'Creative Process Support', period !!)

**Philosophy**: Based on Robert Fritz's "Creating Your Life" framework, this tool supports **Creative Orientation** (generative) rather than **Reactive-Responsive Orientation** (problem-solving).

**Core Distinction**:
- **Problem-Solving**: "What's your challenge?" → Eliminate what you don't want
- **Creative Orientation**: "What do you want to create?" → Bring into being what you do want

**Structural Tension Framework**:
The fundamental creative force comes from tension between:
1. **Vision** (desired outcome) 
2. **Current Reality** (where you are now)
This tension naturally resolves by moving toward the vision.

**Three-Phase Creative Process**:

1. **Germination** - Beginning excitement, vision clarification, balanced planning/action
2. **Assimilation** - Structural tension internalization, momentum building, natural movement
3. **Completion** - Finishing touches, avoiding complexity, successful conclusion

## Implementation Status

**✅ CREATE Tool Live & Operational** (2025-07-31):
- Fully implemented and tested Robert Fritz's creative framework
- All three phases with specialized prompts and guidance
- Problem-solving language detection automatically redirects to creative orientation
- Structural tension calculator for vision/reality gap analysis
- Original `brainstorm` tool removed in favor of CREATE tool

## Usage Examples

### Germination Phase
```
desiredOutcome: "Create a mobile app that helps people track creative projects"
currentReality: "I have programming skills but no mobile app experience"
creativePhase: "germination"
timeframe: "6 months"
```

### Assimilation Phase  
```
desiredOutcome: "Launch beta version with 50 active users"
currentReality: "Working prototype, 5 friends testing and giving feedback"
creativePhase: "assimilation"
resources: "React Native skills, $500 budget"
```

### Completion Phase
```
desiredOutcome: "Polished app ready for App Store launch"
currentReality: "Beta tested, 4.2 stars, minor bugs being fixed"
creativePhase: "completion"
```

## Development Commands

### Build and Development
```bash
# Build TypeScript to JavaScript
npm run build

# Development mode (build + run)
npm run dev

# Start the built server
npm start

# Type checking without build
npm run lint
```

### Documentation
```bash
# Serve documentation locally
npm run docs:dev

# Build documentation
npm run docs:build

# Preview built docs
npm run docs:preview
```

### Testing and Validation
```bash
# Basic test (currently placeholder)
npm test

# Test MCP server functionality
# Start server in one terminal: npm run dev
# In another terminal: echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

## Architecture

### Core Components

**MCP Server Layer** (`src/index.ts`)
- Handles MCP protocol communication via stdio transport
- Manages tool invocation and progress notifications
- Implements keepalive mechanism for long-running operations
- Provides unified tool and prompt registry system

**Tool Registry System** (`src/tools/registry.ts`)
- Unified tool definition system combining metadata, validation, and execution
- Zod schema validation for all tool arguments
- Automatic JSON schema generation for MCP tool definitions
- Support for both tools and prompts in single registry

**Gemini Execution Layer** (`src/utils/geminiExecutor.ts`)
- Wraps Gemini CLI with proper argument handling
- **Change Mode**: Special mode that formats prompts for structured code edits
- Automatic model fallback (Pro → Flash) on quota exhaustion
- Cross-platform `@` syntax handling with proper shell escaping

**Command Execution** (`src/utils/commandExecutor.ts`)
- Platform-agnostic command execution
- Real-time output streaming with progress callbacks
- Timeout management for long-running operations

### Tool Architecture

All tools follow the `UnifiedTool` interface:
- **name**: Tool identifier for MCP
- **description**: Human-readable description
- **zodSchema**: Zod validation schema for arguments
- **execute**: Async function that performs the tool's work
- **prompt**: Optional MCP prompt definition
- **category**: Tool categorization (simple, gemini, utility)

### Key Tools

**ask-gemini** (`src/tools/ask-gemini.tool.ts`)
- Primary tool for Gemini analysis
- Supports `@` syntax for file inclusion
- Model selection (-m flag)
- Sandbox mode (-s flag) for safe code execution
- **Change Mode**: Structured output for code edits with OLD/NEW format

**create** (`src/tools/create.tool.ts`) - **PRIMARY CREATIVE TOOL**
- Supports authentic creative process through Fritz's three-phase framework
- **Germination**: Initial excitement, vision clarification, balanced planning/action
- **Assimilation**: Structural tension internalization, momentum building, resource gathering
- **Completion**: Finishing touches, completion resistance management, successful conclusion
- Creative orientation: "What do you want to create?" vs problem-solving approach
- Problem-solving language detection with redirection to creative orientation


## Change Mode System

**Purpose**: Enables programmatic code edits by formatting Gemini responses in OLD/NEW blocks.

**Key Files**:
- `src/utils/changeModeParser.ts`: Parses OLD/NEW format from Gemini output
- `src/utils/changeModeTranslator.ts`: Formats edits for Claude consumption
- `src/utils/changeModeChunker.ts`: Splits large edit sets into manageable chunks
- `src/utils/chunkCache.ts`: Cache system for multi-chunk responses

**Usage**: When `changeMode: true`, the tool prepends special instructions to prompts and processes output for direct application by Claude.

## Configuration and Constants

**Constants** (`src/constants.ts`)
- Error messages and status messages
- Model definitions (Pro/Flash)
- CLI command structure
- MCP protocol constants
- Keepalive interval (25 seconds)

## File Analysis Features

The tool supports Gemini CLI's `@` syntax for file inclusion:
- Single files: `@README.md`
- Multiple files: `@file1.js @file2.js`
- Wildcards: `@src/*.js`, `@**/*.test.js`
- Directories: `@src/`

## Installation and Setup

**Prerequisites**:
- Node.js v16.0.0+
- Google Gemini CLI installed and configured

**Claude Code Setup**:
```bash
claude mcp add coaia-gemini-cli -- npx -y coaia-gemini-mcp-tool
```

**Claude Desktop Setup**: Add to config JSON:
```json
{
  "mcpServers": {
    "coaia-gemini-cli": {
      "command": "npx",
      "args": ["-y", "coaia-gemini-mcp-tool"]
    }
  }
}
```

## Common Development Patterns

### Adding New Tools
1. Create tool file in `src/tools/` with `.tool.ts` suffix
2. Implement `UnifiedTool` interface with Zod schema
3. Add to registry in `src/tools/index.ts`
4. Test with MCP protocol directly

### Error Handling
- All tools use try/catch with proper error message formatting
- Quota exceeded errors trigger automatic model fallback
- Progress notifications inform users of long-running operations

### Testing Tool Integration
Test individual tools by sending MCP requests directly to the server during development.

## Dependencies

**Core**: 
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `zod`: Runtime validation and schema generation

**Utilities**:
- `chalk`: Terminal colors for logging
- `inquirer`: Interactive CLI prompts

**Dev Dependencies**:
- `typescript`: TypeScript compiler
- `vitepress`: Documentation generation
