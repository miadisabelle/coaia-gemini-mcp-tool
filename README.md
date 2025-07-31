
# CoAIA Gemini MCP Tool

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/coaia/coaia-gemini-mcp-tool?logo=github&label=GitHub)](https://github.com/coaia/coaia-gemini-mcp-tool/releases)
[![npm version](https://img.shields.io/npm/v/coaia-gemini-mcp-tool)](https://www.npmjs.com/package/coaia-gemini-mcp-tool)
[![npm downloads](https://img.shields.io/npm/dt/coaia-gemini-mcp-tool)](https://www.npmjs.com/package/coaia-gemini-mcp-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red.svg)](https://github.com/coaia/coaia-gemini-mcp-tool)

</div>

> 📚 **[View Full Documentation](https://coaia.github.io/coaia-gemini-mcp-tool/)** - Examples, FAQ, Troubleshooting, Best Practices

A Model Context Protocol (MCP) server that bridges AI assistants with [Gemini CLI](https://github.com/google-gemini/gemini-cli), featuring **authentic creative process support** based on Robert Fritz's "Creating Your Life" framework.

## 🎯 **NEW: CREATE Tool - Authentic Creative Process**

Transform your creative work with Fritz's proven three-phase framework:
- **🌱 Germination**: Initial excitement, vision clarification, balanced action
- **⚡ Assimilation**: Structural tension, momentum building, natural movement  
- **✨ Completion**: Finishing touches, successful conclusion

**Creative Orientation**: "What do you want to create?" (not "What problem to solve?")

## Core Features

✅ **Claude + Gemini Integration**: Bridge AI assistants with Gemini's massive context window  
✅ **CREATE Tool**: Authentic creative process based on Robert Fritz's framework  
✅ **File Analysis**: Use `@` syntax for large codebases and files  
✅ **Sandbox Mode**: Safe code execution and testing  
✅ **Change Mode**: Structured code edits with OLD/NEW format

## TLDR: [![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](#) + [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-886FBF?logo=googlegemini&logoColor=fff)](#) + 🎨 **Creative Process**

## Prerequisites

Before using this tool, ensure you have:

1. **[Node.js](https://nodejs.org/)** (v16.0.0 or higher)
2. **[Google Gemini CLI](https://github.com/google-gemini/gemini-cli)** installed and configured


### One-Line Setup

```bash
claude mcp add coaia-gemini-cli -- npx -y coaia-gemini-mcp-tool
```

### Verify Installation

Type `/mcp` inside Claude Code to verify the coaia-gemini-cli MCP is active.

---

### Alternative: Import from Claude Desktop

If you already have it configured in Claude Desktop:

1. Add to your Claude Desktop config:
```json
"coaia-gemini-cli": {
  "command": "npx",
  "args": ["-y", "coaia-gemini-mcp-tool"]
}
```

2. Import to Claude Code:
```bash
claude mcp add-from-claude-desktop
```

## Configuration

Register the MCP server with your MCP client:

### For NPX Usage (Recommended)

Add this configuration to your Claude Desktop config file:

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

### For Global Installation

If you installed globally, use this configuration instead:

```json
{
  "mcpServers": {
    "coaia-gemini-cli": {
      "command": "coaia-gemini-mcp"
    }
  }
}
```

**Configuration File Locations:**

- **Claude Desktop**:
  - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
  - **Linux**: `~/.config/claude/claude_desktop_config.json`

After updating the configuration, restart your terminal session.

## Example Workflow

- **Natural language**: "use gemini to explain index.html", "create a mobile app using the create tool", "ask gemini to search for latest news"
- **Claude Code**: Type `/coaia-gemini-cli` and commands will populate in Claude Code's interface.

## Usage Examples

### 🎨 CREATE Tool - Authentic Creative Process

Transform your creative work with the three-phase framework:

#### Germination Phase
```
"I want to create a mobile app that helps people track their creative projects"
- desiredOutcome: "Create a mobile app that helps people track creative projects with inspiration features"
- currentReality: "I have programming skills but no mobile app experience"
- creativePhase: "germination"
```

#### Assimilation Phase
```
"Help me build momentum on my app project"
- desiredOutcome: "Launch beta version with 50 active users" 
- currentReality: "Working prototype, 5 friends testing and giving feedback"
- creativePhase: "assimilation"
```

#### Completion Phase
```
"Bring my app to successful launch"
- desiredOutcome: "Polished app ready for App Store"
- currentReality: "Beta tested, 4.2 stars, final bugs being fixed"
- creativePhase: "completion"
```

### With File References (using @ syntax)

- `ask gemini to analyze @src/main.js and explain what it does`
- `use gemini to summarize @. the current directory`
- `analyze @package.json and tell me about dependencies`

### General Questions (without files)

- `ask gemini to search for the latest tech news`
- `use gemini to explain div centering`
- `ask gemini about best practices for React development related to @file_im_confused_about`

### Using Gemini CLI's Sandbox Mode (-s)

The sandbox mode allows you to safely test code changes, run scripts, or execute potentially risky operations in an isolated environment.

- `use gemini sandbox to create and run a Python script that processes data`
- `ask gemini to safely test @script.py and explain what it does`
- `use gemini sandbox to install numpy and create a data visualization`
- `test this code safely: Create a script that makes HTTP requests to an API`

### Tools (for the AI)

These tools are designed to be used by the AI assistant.

- **`create`** ⭐ **PRIMARY CREATIVE TOOL**: Supports authentic creative process through Fritz's three-phase framework.
  - **`desiredOutcome`** (required): What specific outcome do you want to create? Focus on what you want to bring into being.
  - **`currentReality`** (optional): Where are you now in relation to this vision?
  - **`creativePhase`** (optional): Which phase - germination, assimilation, or completion? (defaults to germination)
  - **`timeframe`** (optional): When do you want this created?
  - **`resources`** (optional): What resources do you have available?
  - **`model`** (optional): Gemini model to use.

- **`ask-gemini`**: Asks Google Gemini for analysis and general questions.
  - **`prompt`** (required): Use `@` syntax for files (e.g., `@src/main.js explain this code`) or ask general questions.
  - **`model`** (optional): The Gemini model to use. Defaults to `gemini-2.5-pro`.
  - **`sandbox`** (optional): Set to `true` to run in sandbox mode for safe code execution.
  - **`changeMode`** (optional): Enable structured change mode for code edits.

- **`brainstorm`** ⚠️ **DEPRECATED**: Use `create` tool instead for authentic creative work.

- **`Ping`**: A simple test tool that echoes back a message.
- **`Help`**: Shows the Gemini CLI help text.

### Slash Commands (for the User)

You can use these commands directly in Claude Code's interface.

- **/create** ⭐ **NEW**: Authentic creative process support
  - **`desiredOutcome`** (required): What do you want to create?
  - **`currentReality`** (optional): Where are you now?
  - **`creativePhase`** (optional): germination, assimilation, or completion

- **/analyze**: Analyzes files or directories using Gemini, or asks general questions.
  - **`prompt`** (required): Use `@` syntax for files or ask general questions.
  
- **/sandbox**: Safely tests code or scripts in Gemini's sandbox environment.
  - **`prompt`** (required): Code testing request.
  
- **/help**: Displays the Gemini CLI help information.
- **/ping**: Tests the connection to the server.

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Disclaimer:** This is an unofficial, third-party tool and is not affiliated with, endorsed, or sponsored by Google.
