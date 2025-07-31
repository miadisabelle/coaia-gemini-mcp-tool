# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that integrates Google's Gemini CLI with AI assistants like Claude. The tool enables AI assistants to leverage Gemini's large context window for analyzing files and codebases using the `@` syntax.

**Key Capability**: The tool acts as a bridge between Claude and Gemini, allowing Claude to offload large file analysis to Gemini when needed.

## Current Analysis & Replacement Plans

**Brainstorm Tool Assessment**: The current `brainstorm` tool fundamentally confuses orientations. Based on Robert Fritz's "Creating Your Life" framework, there are two primary life orientations:

**Reactive-Responsive Orientation** (Problem-Solving):
- React/respond to prevailing circumstances
- Motivation: rid ourselves of something we don't want
- The problem organizes actions, not desired outcomes
- Solving all problems doesn't guarantee having what you want
- Temporary mobilization, limited creative process

**Creative Orientation** (Generative):
- Choices, not circumstances, are the organizing principle
- Motivation: bring into being something we do want
- Take action on behalf of desired goals
- Focus on outcomes rather than eliminating problems

**The Tool's Core Error**: The brainstorm tool applies problem-solving methodology frameworks (SCAMPER, design thinking, etc.) to what should be generative creative work. It asks "What's your brainstorming challenge?" - treating creativity as a problem to solve rather than something to bring into being.

**True Creative Orientation** involves:
- Structural tension between desired outcome and current reality
- Generative approach driven by what you want to create
- Moving toward desired results, not away from problems
- "What is the outcome I want?" not "What problem needs solving?"

**Replacement Plan**: Replace with tools that support authentic creative orientation - helping users clarify desired outcomes and establish structural tension rather than applying business methodology to creative work.

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

**brainstorm** (`src/tools/brainstorm.tool.ts`) - **SCHEDULED FOR REPLACEMENT**
- Current implementation: Traditional brainstorming with methodology frameworks (divergent, convergent, SCAMPER, etc.)
- Problem: Conflates brainstorming (free-association of unrelated ideas) with creative problem-solving
- Will be replaced with proper creative orientation system that distinguishes between:
  - Creating vs Problem-solving (different cognitive processes)
  - True creative work vs associative idea generation

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
claude mcp add gemini-cli -- npx -y gemini-mcp-tool
```

**Claude Desktop Setup**: Add to config JSON:
```json
{
  "mcpServers": {
    "gemini-cli": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-tool"]
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