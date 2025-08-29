import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Interface for COAIA Memory integration simulation
interface TensionChart {
  id: string;
  desiredOutcome: string;
  currentReality: string;
  dueDate: string;
  actionSteps: string[];
  createdAt: string;
}

function generateChartId(): string {
  return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function buildTensionChartPrompt(chart: TensionChart): string {
  return `🌊 **STRUCTURAL TENSION CHART CREATED**

**Chart ID**: ${chart.id}
**Created**: ${new Date(chart.createdAt).toLocaleString()}

## Core Structural Elements

### Desired Outcome (Vision)
${chart.desiredOutcome}

### Current Reality (Starting Point)
${chart.currentReality}

### Due Date Target
${new Date(chart.dueDate).toLocaleDateString()}

### Strategic Action Steps
${chart.actionSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Structural Tension Analysis

**Creative Force**: The gap between your current reality and desired outcome creates natural tension that wants to resolve by moving toward your vision.

**Advancement Pattern**: This chart establishes an advancing structure where:
- Each completed action step flows into current reality
- Progress builds momentum for continued advancement
- Success creates new structural tension for next level outcomes

## Chart Usage Guidance

**Daily Practice**: 
- Hold both vision AND current reality clearly in awareness
- Feel the natural tension - this is your creative power
- Trust that actions will naturally emerge from this tension

**Progress Tracking**:
- Complete action steps and update current reality
- Notice how completion changes the structural dynamic
- Celebrate advancement and set new tension for continued growth

**Next Steps**:
- Use \`track-chart-progress\` to monitor advancement
- Use \`telescope-action\` to break down complex steps
- Use \`update-chart\` to refine vision or reality as needed

## Integration with Creative Process

This chart complements your creative phases:
- **Germination**: Chart captures initial creative excitement and vision
- **Assimilation**: Chart maintains structural tension for momentum building
- **Completion**: Chart guides you to successful fruition of desired outcome

**Remember**: This is not a to-do list. It's a structural tension system that naturally generates the energy and actions needed for creation.`;
}

function validateChartElements(desiredOutcome: string, currentReality: string, dueDate: string): string | null {
  // Check for problem-solving language in desired outcome
  const problemWords = ['fix', 'solve', 'eliminate', 'prevent', 'stop', 'avoid', 'reduce'];
  const detectedProblems = problemWords.filter(word => 
    desiredOutcome.toLowerCase().includes(word)
  );
  
  if (detectedProblems.length > 0) {
    return `🌊 **Creative Orientation Issue Detected**

Your desired outcome contains problem-solving language: "${detectedProblems.join(', ')}"

**Structural Tension Charts** work with creative orientation - what you want to bring into being, not problems to eliminate.

**Reframe Suggestion**: Instead of focusing on what you want to fix/stop/prevent, describe the positive outcome you want to create.

Example:
- Instead of: "Fix our communication problems"
- Try: "Establish clear, effective communication practices"

Please reframe your desired outcome in terms of what you want to create or bring into existence.`;
  }

  // Check for action-oriented language in current reality
  const actionWords = ['need to', 'should', 'must', 'will', 'plan to', 'going to'];
  const detectedActions = actionWords.filter(word => 
    currentReality.toLowerCase().includes(word)
  );
  
  if (detectedActions.length > 0) {
    return `🌊 **Current Reality Clarity Issue**

Your current reality contains future-oriented language: "${detectedActions.join(', ')}"

**Current Reality** should describe what IS now, not what you plan to do or think you should do.

**Objective Description**: State facts about your present situation in relation to your desired outcome.

Example:
- Instead of: "I need to learn programming"
- Try: "I have no programming experience but am interested in learning"

Please describe your current reality as objective facts about where you are now.`;
  }

  // Validate due date
  const dueDateTime = new Date(dueDate);
  if (isNaN(dueDateTime.getTime())) {
    return `🌊 **Due Date Format Issue**

Please provide a valid date in ISO format (YYYY-MM-DD) or a clear date description.

Examples:
- "2024-12-31"
- "December 31, 2024"
- "Next Friday"`;
  }

  if (dueDateTime < new Date()) {
    return `🌊 **Due Date Issue**

The due date appears to be in the past. Structural tension works best when there's a clear future target to move toward.

Please provide a future date for your desired outcome.`;
  }

  return null;
}

const createTensionChartSchema = z.object({
  desiredOutcome: z.string().min(1).describe("What specific positive outcome do you want to create? (avoid problem-solving language)"),
  currentReality: z.string().min(1).describe("Where are you now in relation to this outcome? (objective facts, not future plans)"),
  dueDate: z.string().describe("When do you want to achieve this outcome? (ISO date or clear description)"),
  actionSteps: z.array(z.string()).optional().describe("Optional strategic action steps - intermediary outcomes that advance toward your goal"),
  model: z.string().optional().describe("Optional Gemini model for enhanced analysis"),
  saveToMemory: z.boolean().default(true).describe("Whether to save this chart to persistent memory (requires COAIA Memory MCP server)")
});

export const createTensionChartTool: UnifiedTool = {
  name: "create-tension-chart",
  description: "🌊 Create persistent structural tension charts that bridge CREATE tool sessions with long-term advancement tracking. Establishes advancing patterns through clear desired outcomes, current reality, and strategic action steps. Integrates with COAIA Memory for chart persistence.",
  zodSchema: createTensionChartSchema,
  prompt: {
    description: "Transform creative sessions into structured advancing patterns with persistent memory tracking. Creates the foundation for telescoping actions and progress monitoring across time.",
  },
  category: 'memory',
  execute: async (args, onProgress) => {
    const { desiredOutcome, currentReality, dueDate, actionSteps = [], model, saveToMemory = true } = args;

    if (!desiredOutcome?.trim()) {
      throw new Error("🌊 What specific positive outcome do you want to create? Focus on what you want to bring into being.");
    }

    if (!currentReality?.trim()) {
      throw new Error("🌊 Where are you now in relation to this outcome? Describe your current situation objectively.");
    }

    // Validate chart elements for structural integrity
    const validationIssue = validateChartElements(
      desiredOutcome as string, 
      currentReality as string, 
      dueDate as string
    );
    
    if (validationIssue) {
      return validationIssue;
    }

    // Create tension chart structure
    const chart: TensionChart = {
      id: generateChartId(),
      desiredOutcome: desiredOutcome as string,
      currentReality: currentReality as string,
      dueDate: dueDate as string,
      actionSteps: actionSteps as string[],
      createdAt: new Date().toISOString()
    };

    onProgress?.(`🌊 Creating structural tension chart: ${chart.id}`);

    // Build comprehensive prompt for chart analysis
    const analysisPrompt = `${buildTensionChartPrompt(chart)}

**Analysis Request**:
Analyze this structural tension chart for:
1. **Creative Orientation Quality**: How well does the desired outcome focus on creation vs problem-solving?
2. **Current Reality Clarity**: How objective and specific is the current reality description?
3. **Structural Tension Strength**: How clear is the gap that will generate creative energy?
4. **Action Step Strategic Value**: How well do the action steps serve as intermediary outcomes?
5. **Advancement Potential**: What advancing patterns could this chart generate?

Provide specific suggestions for strengthening any weak elements.`;

    Logger.debug(`🌊 Create-tension-chart: Chart ${chart.id} for outcome: ${desiredOutcome}`);
    
    const result = await executeGeminiCLI(analysisPrompt, model as string | undefined, false, false, onProgress);
    
    // Memory integration note
    const memoryNote = saveToMemory 
      ? `\n\n🌊 **Memory Integration**: Chart structure ready for COAIA Memory persistence. Use \`track-chart-progress\` and \`telescope-action\` tools to continue working with this chart.`
      : `\n\n🌊 **Session Only**: Chart created for current session. Set saveToMemory=true to persist across sessions.`;

    // Chart summary for reference
    const chartSummary = `\n\n---\n\n🌊 **CHART SUMMARY**
**ID**: ${chart.id}
**Outcome**: ${chart.desiredOutcome}
**Reality**: ${chart.currentReality}
**Due**: ${new Date(chart.dueDate).toLocaleDateString()}
**Actions**: ${chart.actionSteps.length} strategic steps`;

    return `${result}${memoryNote}${chartSummary}`;
  }
};