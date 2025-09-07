import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { AgentFactory } from '../agents/index.js';
import { getResilienceManager, CoordinationContext } from '../coordination/index.js';
import { Logger } from '../utils/logger.js';

const resilientCoordinationSchema = z.object({
  goal: z.string().min(1).describe("What is your primary goal or desired outcome?"),
  situation: z.string().min(1).describe("Describe your current situation or context"),
  complexity: z.number().min(1).max(10).default(5).describe("Task complexity (1=simple, 10=very complex)"),
  timeConstraints: z.number().optional().describe("Available time in minutes (optional)"),
  riskTolerance: z.number().min(0).max(1).default(0.5).describe("Risk tolerance (0=very conservative, 1=high risk)"),
  noveltyRequired: z.boolean().default(false).describe("Do you specifically need novel/creative solutions?"),
  showCoordinationDetails: z.boolean().default(false).describe("Show detailed coordination decision process")
});

/**
 * Helper functions (outside the tool object to avoid TypeScript issues)
 */

/**
 * Format coordination decision for display
 */
function formatCoordinationDecision(
  decision: any,
  context: CoordinationContext,
  showDetails: boolean
): string {
  let formatted = `# Resilient Connection Coordination\n\n`;
  formatted += `**Primary Goal:** ${context.primaryGoal}\n`;
  formatted += `**Strategy Selected:** ${decision.strategy.toUpperCase()}\n`;
  formatted += `**Exploration Balance:** ${(decision.explorationBalance.exploration * 100).toFixed(1)}% exploration, ${(decision.explorationBalance.exploitation * 100).toFixed(1)}% exploitation\n`;
  formatted += `**Creative Tension:** ${(decision.explorationBalance.tension * 100).toFixed(1)}%\n\n`;
  
  if (showDetails) {
    formatted += `## Coordination Analysis\n\n`;
    formatted += `**Context Assessment:**\n`;
    formatted += `- Task Complexity: ${context.taskComplexity}/10\n`;
    formatted += `- Risk Tolerance: ${(context.riskTolerance * 100).toFixed(1)}%\n`;
    formatted += `- Novelty Required: ${context.noveltyRequired ? 'Yes' : 'No'}\n`;
    if (context.timeConstraints) {
      formatted += `- Time Available: ${context.timeConstraints} minutes\n`;
    }
    formatted += `\n**Balance Rationale:** ${decision.explorationBalance.rationale}\n\n`;
    
    formatted += `**Agent Assignments:**\n`;
    for (const [agentId, tasks] of decision.agentAssignments) {
      formatted += `- Agent ${agentId}: ${tasks.length} task(s)\n`;
      for (const task of tasks) {
        formatted += `  - ${task.description} (Priority: ${task.priority})\n`;
      }
    }
    formatted += `\n`;
    
    formatted += `**Expected Outcomes:**\n`;
    for (const outcome of decision.expectedOutcomes) {
      formatted += `- ${outcome}\n`;
    }
    formatted += `\n`;
    
    formatted += `**Contingency Plans:**\n`;
    for (const plan of decision.contingencyPlans) {
      formatted += `- ${plan}\n`;
    }
    formatted += `\n`;
  }
  
  return formatted;
}

/**
 * Execute coordination decision across agents
 */
async function executeCoordinationDecision(
  decision: any,
  onProgress?: (message: string) => void
): Promise<{ results: any[]; evaluation: string }> {
  const results: any[] = [];
  
  onProgress?.(`🔄 Executing ${decision.strategy} strategy across ${decision.agentAssignments.size} agent(s)...`);
  
  // Execute tasks for each agent
  for (const [agentId, tasks] of decision.agentAssignments) {
    onProgress?.(`⚡ Executing ${tasks.length} task(s) for agent ${agentId}...`);
    
    try {
      // Find the agent by ID or name pattern
      let agent = null;
      if (agentId.includes('orchestrator')) {
        agent = AgentFactory.getAgent('orchestrator');
      } else if (agentId.includes('analysis')) {
        agent = AgentFactory.getAgent('analysis');
      } else if (agentId.includes('creative')) {
        agent = AgentFactory.getAgent('creative');
      } else if (agentId.includes('discovery')) {
        agent = AgentFactory.getAgent('discovery');
      }
      
      if (!agent) {
        results.push({
          agentId,
          success: false,
          output: `Agent ${agentId} not found or not available`,
          tasks: tasks.map((t: any) => t.id)
        });
        continue;
      }
      
      // Execute each task for this agent
      for (const task of tasks) {
        try {
          const result = await agent.executeTask(task);
          results.push({
            agentId,
            taskId: task.id,
            success: result.success,
            output: result.output,
            confidence: result.confidence,
            resourcesUsed: result.resourcesUsed
          });
        } catch (error) {
          results.push({
            agentId,
            taskId: task.id,
            success: false,
            output: `Task execution failed: ${error instanceof Error ? error.message : String(error)}`,
            confidence: 0
          });
        }
      }
    } catch (error) {
      results.push({
        agentId,
        success: false,
        output: `Agent initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        tasks: tasks.map((t: any) => t.id)
      });
    }
  }
  
  onProgress?.("📊 Evaluating coordination effectiveness...");
  
  // Generate coordination evaluation
  const successfulResults = results.filter(r => r.success);
  const successRate = results.length > 0 ? (successfulResults.length / results.length) * 100 : 0;
  
  let evaluation = `## Coordination Execution Results\n\n`;
  evaluation += `**Success Rate:** ${successfulResults.length}/${results.length} (${successRate.toFixed(1)}%)\n`;
  evaluation += `**Strategy Effectiveness:** ${decision.strategy} strategy executed across ${decision.agentAssignments.size} agent(s)\n\n`;
  
  // Include successful results
  if (successfulResults.length > 0) {
    evaluation += `### Successful Executions\n\n`;
    for (const result of successfulResults) {
      evaluation += `**Agent ${result.agentId}** (Task: ${result.taskId || 'N/A'})\n`;
      if (result.confidence !== undefined) {
        evaluation += `*Confidence: ${(result.confidence * 100).toFixed(1)}%*\n\n`;
      }
      evaluation += `${result.output}\n\n`;
      evaluation += `---\n\n`;
    }
  }
  
  // Include failed results if any
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    evaluation += `### Execution Issues\n\n`;
    for (const result of failedResults) {
      evaluation += `**Agent ${result.agentId}:** ${result.output}\n\n`;
    }
  }
  
  return { results, evaluation };
}

/**
 * Resilient Coordination Tool
 * 
 * This tool demonstrates the Resilient Connection in action - the dynamic
 * equilibrium between goal-directed exploitation and novelty-driven exploration.
 * It uses the ResilienceManager to make coordination decisions and execute
 * them across the polycentric agent lattice.
 */
export const resilientCoordinationTool: UnifiedTool = {
  name: "resilient-coordination",
  description: "Demonstrate the Resilient Connection - dynamic equilibrium between goal-directed action and creative exploration. Coordinates agents based on context, complexity, and risk tolerance to achieve optimal outcomes.",
  zodSchema: resilientCoordinationSchema,
  category: 'gemini',
  
  prompt: {
    description: "Execute tasks through resilient coordination balancing exploitation and exploration",
    arguments: [
      {
        name: "goal",
        description: "Primary goal or desired outcome",
        required: true
      },
      {
        name: "situation",
        description: "Current situation or context",
        required: true
      },
      {
        name: "complexity",
        description: "Task complexity (1-10 scale)",
        required: false
      },
      {
        name: "timeConstraints",
        description: "Available time in minutes",
        required: false
      },
      {
        name: "riskTolerance",
        description: "Risk tolerance (0-1 scale)",
        required: false
      },
      {
        name: "noveltyRequired",
        description: "Whether novel solutions are specifically needed",
        required: false
      },
      {
        name: "showCoordinationDetails",
        description: "Show detailed coordination decision process",
        required: false
      }
    ]
  },
  
  async execute(args, onProgress) {
    const { 
      goal, 
      situation, 
      complexity, 
      timeConstraints, 
      riskTolerance, 
      noveltyRequired, 
      showCoordinationDetails 
    } = args;
    
    onProgress?.("🎯 Initializing Resilient Connection system...");
    
    try {
      // Initialize agents and resilience manager
      AgentFactory.initializeAgentLattice();
      const resilienceManager = getResilienceManager();
      
      onProgress?.("📊 Analyzing context and calculating exploration balance...");
      
      // Create coordination context
      const context: CoordinationContext = {
        primaryGoal: String(goal),
        currentSituation: String(situation),
        availableAgents: AgentFactory.getAllAgents(),
        taskComplexity: Number(complexity) || 5,
        timeConstraints: timeConstraints ? Number(timeConstraints) : undefined,
        riskTolerance: Number(riskTolerance) || 0.5,
        noveltyRequired: Boolean(noveltyRequired)
      };
      
      onProgress?.("⚖️ Making coordination decision based on resilience strategy...");
      
      // Make coordination decision
      const decision = await resilienceManager.makeCoordinationDecision(context);
      
      let result = formatCoordinationDecision(decision, context, Boolean(showCoordinationDetails));
      
      // Execute the coordination decision
      onProgress?.("🚀 Executing coordination across agent lattice...");
      
      const { results, evaluation } = await executeCoordinationDecision(decision, onProgress);
      
      result += evaluation;
      
      onProgress?.("📈 Generating resilience insights...");
      
      // Get coordination statistics
      const stats = resilienceManager.getCoordinationStats();
      
      result += `## Resilience System Insights\n\n`;
      result += `**Total Coordination Decisions:** ${stats.totalDecisions}\n`;
      result += `**Strategy Distribution:**\n`;
      for (const [strategy, count] of Object.entries(stats.strategyDistribution)) {
        const percentage = stats.totalDecisions > 0 ? (count / stats.totalDecisions * 100).toFixed(1) : '0.0';
        result += `- ${strategy.replace('_', ' ').toUpperCase()}: ${count} (${percentage}%)\n`;
      }
      result += `**Average Outcome Value:** ${(stats.averageOutcomeValue * 100).toFixed(1)}%\n`;
      result += `**Exploration Trend:** ${stats.explorationTrends.trend} (avg: ${(stats.explorationTrends.avg * 100).toFixed(1)}%)\n\n`;
      
      result += `## Resilient Connection Principles\n\n`;
      result += `This coordination demonstrates the key principles of the Resilient Connection:\n\n`;
      result += `1. **Dynamic Equilibrium** - Balances goal achievement with creative exploration\n`;
      result += `2. **Context Sensitivity** - Adjusts strategy based on complexity, risk, and constraints\n`;
      result += `3. **Constitutional Compliance** - All agents maintain adherence to core principles\n`;
      result += `4. **Emergent Adaptation** - System learns from coordination history to improve decisions\n`;
      result += `5. **Structured Exploration** - Novelty search is guided by strategic objectives\n\n`;
      
      result += `*The Resilient Connection enables the system to pursue goal-directed optimization `;
      result += `while simultaneously exploring novelty and discovery, creating a dynamic equilibrium `;
      result += `that enhances both creative and functional output.*`;
      
      onProgress?.("✅ Resilient coordination complete");
      
      return result;
      
    } catch (error) {
      Logger.error('Resilient coordination failed:', error);
      
      return `# Resilient Coordination Failed

**Error:** ${error instanceof Error ? error.message : String(error)}

The Resilient Connection system encountered an error during coordination. This may be due to:
- Agent lattice initialization issues
- Coordination context complexity
- Strategy execution failures

The system maintains resilience by acknowledging this as a navigation cue for improvement rather than a failure to eliminate.`;
    }
  }
};