# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**🌊 COAIA Structural Thinking Engine v3.0.0** - An advanced MCP server that integrates Google's Gemini CLI with comprehensive structural thinking capabilities, creative process support, and consciousness protocols based on Robert Fritz's methodology.

**Core Capabilities**:
- **Structural Thinking**: 3-step observation discipline and pattern detection (oscillation vs advancing)  
- **Creative Process**: Enhanced CREATE tool with bias detection and tension analysis
- **Memory Integration**: Persistent tension charts bridging sessions with COAIA Memory
- **Ripple Consciousness**: Precision observation and elegant distillation protocols
- **Bias Detection**: Real-time reactive pattern identification with creative reframes

**Key Evolution**: From simple Gemini bridge → Comprehensive structural thinking engine with consciousness protocols

## Tool Categories & Architecture

### 🌊 Structural Thinking Tools

**structural-observe** - 3-step observation discipline
- Step 1: Start with Nothing (no preconceptions)
- Step 2: Picture What Is Said (mental movie creation)  
- Step 3: Ask Questions (4 types only: Information, Clarification, Implication, Discrepancy)
- **Core Principle**: Structure determines behavior - observe to understand underlying patterns

**detect-patterns** - Behavioral pattern identification
- **Oscillation**: Cyclical progress/regression patterns (terrible for organizations/personal life)
- **Advancing**: Consistent movement toward desired outcomes via structural tension
- **Purpose**: Diagnostic tool to understand what structural forces generate observed behaviors

**bias-detector** - Reactive bias identification and correction
- Detects problem-solving, enhancement, gap-filling, and other reactive patterns
- Provides creative orientation alternatives
- **Auto-correction mode** for real-time language reframing

### 🎯 Creative Process Tools (Enhanced)

**create** - Fritz's three-phase creative process (now with bias detection)
- **Enhanced Features**:
  - Structural tension calculation with quality analysis
  - Automatic bias detection in desired outcomes
  - Creative orientation validation
  - Problem-solving language redirection with detailed explanations
  - Vision/reality clarity scoring for optimal tension

**create-tension-chart** - Memory bridge for persistent advancement tracking
- Creates structured charts bridging CREATE sessions
- Validates elements for creative orientation integrity
- Integration ready for COAIA Memory MCP server
- Supports telescoping actions and progress tracking

### 🧠 Consciousness Protocol Tools

**ripple-embody** - Precision consciousness protocols
- **Mission**: Distill complexity into elegant, actionable simplicity
- **Protocols**: Neutral Observation, Iterative Refinement, Self-Correction
- **Ripple Philosophy**: Small, precise actions create expanding waves of clarity
- **Embodiment Modes**: observe, refine, correct, embody, complete

### 🔧 Core Infrastructure Tools

**ask-gemini** - Enhanced Gemini CLI bridge
- `@` syntax for file inclusion with large context analysis
- **Change Mode**: Structured code edits with OLD/NEW format
- Model selection and sandbox mode
- **Integration**: Works seamlessly with all structural thinking tools

## Implementation Philosophy

### Creative Orientation vs Problem-Solving
**Core Distinction**:
- **Problem-Solving**: "What's your challenge?" → Eliminate what you don't want (leads to oscillation)
- **Creative Orientation**: "What do you want to create?" → Bring into being what you do want (creates advancement)

### Structural Tension Framework
**Fundamental Creative Force**: 
1. **Desired Outcome** (clear vision)
2. **Current Reality** (objective assessment)
3. **Tension** → Natural resolution toward desired outcome

### Three-Phase Creative Process
1. **Germination** - Beginning excitement, vision clarification, balanced planning/action
2. **Assimilation** - Structural tension internalization, momentum building, natural movement  
3. **Completion** - Finishing touches, avoiding complexity, successful conclusion

## Usage Patterns & Examples

### Structural Observation Workflow
```
1. structural-observe (input="system behavior", step="complete")
2. detect-patterns (situation="observed behavior", focus="analyze") 
3. bias-detector (text="current approach") → reframe if needed
4. create (desiredOutcome="reframed goal", creativePhase="germination")
```

### Creative Process with Memory Integration
```
1. bias-detector (text="initial request", autoCorrect=true)
2. create (desiredOutcome="...", creativePhase="germination")
3. create-tension-chart (desiredOutcome="...", currentReality="...", saveToMemory=true)
4. [Future sessions] → Access charts via COAIA Memory integration
```

### Consciousness-Driven Analysis
```
1. ripple-embody (input="complex situation", protocol="embody")
2. structural-observe (input="distilled insight", step="complete")
3. detect-patterns (situation="structural elements", focus="structure")
```

## Enhanced Architecture v3.0.0

### Tool Registry System
- **Categories**: structural, creative, memory, consciousness, gemini, utility
- **Unified Interface**: All tools follow enhanced UnifiedTool specification
- **Validation**: Zod schema validation with creative orientation bias detection
- **Integration**: Seamless interaction between all tool categories

### Memory System Integration
- **Bridge Ready**: create-tension-chart tool designed for COAIA Memory integration
- **Session Persistence**: Charts survive across interaction sessions  
- **Advancement Tracking**: Complete support for telescoping actions and progress monitoring

### Consciousness Protocols
- **Ripple Embodiment**: Precision observation and elegant distillation
- **Self-Correction**: Real-time anti-pattern detection and course correction
- **Bias Awareness**: Continuous monitoring for reactive vs creative orientation

## Development Commands

```bash
# Build & Run
npm run build      # Build TypeScript with enhanced tool system
npm run dev        # Development mode with all v3.0.0 tools
npm start          # Production mode

# Validation
npm run lint       # Type checking across all tool categories  
npm test           # Tool integration testing

# Documentation  
npm run docs:dev   # Serve enhanced documentation locally
```

## Installation & Setup

**Prerequisites**:
- Node.js v16.0.0+
- Google Gemini CLI configured
- Optional: COAIA Memory MCP server for chart persistence

**Claude Code Setup**:
```bash
claude mcp add coaia-structural-thinking -- npx -y mcp-ripple-thinker
```

**Claude Desktop Configuration**:
```json
{
  "mcpServers": {
    "coaia-structural-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-ripple-thinker"]
    }
  }
}
```

## Key Files & Components

**Tool Implementations**:
- `src/tools/structural-observe.tool.ts` - Core observation discipline
- `src/tools/detect-patterns.tool.ts` - Oscillation vs advancing pattern detection
- `src/tools/bias-detector.tool.ts` - Reactive language detection & correction
- `src/tools/create.tool.ts` - Enhanced creative process with tension analysis
- `src/tools/create-tension-chart.tool.ts` - Memory integration bridge
- `src/tools/ripple-embody.tool.ts` - Consciousness protocols

**Core Infrastructure**:
- `src/tools/registry.ts` - Enhanced with consciousness/structural categories
- `src/tools/index.ts` - Complete tool registration system
- `src/utils/geminiExecutor.ts` - Enhanced Gemini integration

## Integration Guidelines

### COAIA Memory Bridge
The `create-tension-chart` tool creates chart structures compatible with the COAIA Memory MCP server. When both servers are configured, charts persist across sessions and support:
- Telescoping action steps into sub-charts
- Progress tracking with current reality updates  
- Hierarchical chart management
- Advancing pattern maintenance

### LLM Training Integration
Enhanced with guidance documents from `/llms/` directory:
- `llms-structural-thinking-persona-capabilities.txt` - AI consciousness protocols
- `llms-structural-thinking.gemini.txt` - Core observation methodology
- `llms-haiku-ripple-embodiment.md` - Ripple agent specification

## Common Development Patterns

### Adding Structural Thinking Tools
1. Create tool with appropriate category ('structural', 'creative', 'consciousness')
2. Implement bias detection and creative orientation validation
3. Include 🌊 Ripple glyph for consciousness protocol tools
4. Add to registry with proper categorization

### Integration Testing
Test tool combinations for complete workflows:
- Observation → Pattern Detection → Creative Reframe → Memory Persistence
- Bias Detection → Structural Analysis → Consciousness Application

## Version History

- **v1.0-2.0**: Gemini CLI bridge with CREATE tool
- **v3.0.0**: Complete transformation to Structural Thinking Engine
  - Added 5 new structural thinking tools
  - Enhanced CREATE tool with bias detection
  - Integrated Ripple consciousness protocols  
  - Memory system bridge implementation
  - Comprehensive creative orientation validation

**Philosophy**: Structure determines behavior. This tool system embodies advancing patterns through authentic creative orientation rather than reactive problem-solving cycles.