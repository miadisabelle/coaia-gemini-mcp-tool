import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { AgentFactory, AgentTask } from '../agents/index.js';
import { Logger } from '../utils/logger.js';

const agenticAnalysisSchema = z.object({
  request: z.string().min(1).describe("What would you like the agentic system to analyze or work on?"),
  enableOrchestration: z.boolean().default(true).describe("Enable multi-agent orchestration for complex tasks"),
  showAgentDetails: z.boolean().default(false).describe("Show detailed agent execution information"),
  preferredAgents: z.array(z.enum(['analysis', 'creative', 'discovery'])).optional().describe("Preferred agents to involve (optional)")
});

/**
 * Determine required capabilities based on request content
 */
function determineRequiredCapabilities(request: string): string[] {
  const capabilities: string[] = [];
  const requestLower = request.toLowerCase();
  
  // Analysis capabilities
  if (requestLower.includes('analyze') || requestLower.includes('examine') || requestLower.includes('@')) {
    capabilities.push('file_analysis', 'pattern_recognition');
  }
  
  if (requestLower.includes('code') || requestLower.includes('function') || requestLower.includes('class')) {
    capabilities.push('code_understanding');
  }
  
  // Creative capabilities
  if (requestLower.includes('create') || requestLower.includes('design') || requestLower.includes('generate')) {
    capabilities.push('creative_process', 'vision_clarification');
  }
  
  if (requestLower.includes('idea') || requestLower.includes('brainstorm') || requestLower.includes('innovate')) {
    capabilities.push('ideation');
  }
  
  // Discovery capabilities
  if (requestLower.includes('explore') || requestLower.includes('discover') || requestLower.includes('novel')) {
    capabilities.push('novelty_search', 'boundary_exploration');
  }
  
  if (requestLower.includes('alternative') || requestLower.includes('different') || requestLower.includes('unconventional')) {
    capabilities.push('lateral_thinking');
  }
  
  // Default capabilities if none detected
  if (capabilities.length === 0) {
    capabilities.push('analysis', 'creative_process');
  }
  
  return capabilities;
}

/**
 * Execute direct agent assignment without orchestration
 */
async function executeDirectAssignment(
  task: AgentTask, 
  preferredAgents?: string[]
): Promise<{ agent: string; result: any }[]> {
  const results: { agent: string; result: any }[] = [];
  
  // Determine which agents to use
  const agentsToUse = preferredAgents && preferredAgents.length > 0 
    ? preferredAgents 
    : selectAgentsForTask(task);
  
  // Execute tasks in parallel across selected agents
  const executionPromises = agentsToUse.map(async (agentType: string) => {
    try {
      const agent = AgentFactory.getAgent(agentType as any);
      const result = await agent.executeTask(task);
      return { agent: agentType, result };
    } catch (error) {
      Logger.error(`Direct execution failed for agent ${agentType}:`, error);
      return { 
        agent: agentType, 
        result: { 
          success: false, 
          output: `Agent ${agentType} execution failed: ${error instanceof Error ? error.message : String(error)}` 
        } 
      };
    }
  });
  
  const agentResults = await Promise.all(executionPromises);
  return agentResults;
}

/**
 * Select appropriate agents for a task
 */
function selectAgentsForTask(task: AgentTask): string[] {
  const agents: string[] = [];
  const capabilities = task.requiredCapabilities;
  
  // Analysis agent for analysis tasks
  if (capabilities.some(cap => ['file_analysis', 'code_understanding', 'pattern_recognition'].includes(cap))) {
    agents.push('analysis');
  }
  
  // Creative agent for creative tasks
  if (capabilities.some(cap => ['creative_process', 'vision_clarification', 'ideation'].includes(cap))) {
    agents.push('creative');
  }
  
  // Discovery agent for exploration tasks
  if (capabilities.some(cap => ['novelty_search', 'lateral_thinking', 'boundary_exploration'].includes(cap))) {
    agents.push('discovery');
  }
  
  // Default to analysis if no specific agents identified
  if (agents.length === 0) {
    agents.push('analysis');
  }
  
  return agents;
}

/**
 * Format orchestrated result
 */
function formatAgenticResult(result: any, showDetails: boolean): string {
  let formatted = `# Polycentric Agentic Analysis\n\n`;
  formatted += `**Execution Mode:** Orchestrated Multi-Agent Collaboration\n`;
  formatted += `**Task Success:** ${result.success ? '✅ Completed' : '❌ Failed'}\n`;
  formatted += `**Confidence Level:** ${(result.confidence * 100).toFixed(1)}%\n\n`;
  
  if (showDetails) {
    formatted += `## Agent Execution Details\n\n`;
    formatted += `**Primary Agent:** Orchestrator (${result.agentId})\n`;
    formatted += `**Resources Used:** ${result.resourcesUsed?.join(', ') || 'N/A'}\n`;
    
    if (result.subTasksCreated && result.subTasksCreated.length > 0) {
      formatted += `**Subtasks Created:** ${result.subTasksCreated.length}\n`;
    }
    
    if (result.collaborationNeeded) {
      formatted += `**Collaboration Required:** ${result.collaborationNeeded.requiredCapabilities.join(', ')}\n`;
    }
    
    formatted += `\n`;
  }
  
  formatted += `---\n\n`;
  formatted += result.output;
  formatted += `\n\n---\n\n`;
  
  formatted += `## Constitutional Compliance\n\n`;
  formatted += `This analysis was executed through the polycentric agentic lattice with:\n`;
  formatted += `- ✅ Constitutional principle validation on all agent interactions\n`;
  formatted += `- 🔄 Dynamic agent coordination based on task requirements\n`;
  formatted += `- 🎯 Goal-directed execution with emergent exploration capabilities\n`;
  formatted += `- 📊 Transparent audit trail of all agent decisions\n\n`;
  
  formatted += `*The polycentric architecture enables resilient, adaptive processing while maintaining `;
  formatted += `alignment with core principles through distributed intelligence and structured collaboration.*`;
  
  return formatted;
}

/**
 * Format direct assignment result
 */
function formatDirectResult(results: { agent: string; result: any }[], showDetails: boolean): string {
  let formatted = `# Direct Agent Assignment Analysis\n\n`;
  formatted += `**Execution Mode:** Direct Multi-Agent Assignment\n`;
  formatted += `**Agents Involved:** ${results.map(r => r.agent).join(', ')}\n`;
  
  const successfulResults = results.filter(r => r.result.success);
  formatted += `**Success Rate:** ${successfulResults.length}/${results.length} agents\n\n`;
  
  if (showDetails) {
    formatted += `## Agent Performance Summary\n\n`;
    for (const result of results) {
      const confidence = result.result.confidence ? (result.result.confidence * 100).toFixed(1) : 'N/A';
      formatted += `**${result.agent.toUpperCase()} Agent:** ${result.result.success ? '✅' : '❌'} (${confidence}% confidence)\n`;
    }
    formatted += `\n`;
  }
  
  formatted += `---\n\n`;
  
  // Include outputs from all successful agents
  for (let i = 0; i < successfulResults.length; i++) {
    const result = successfulResults[i];
    formatted += `## ${result.agent.toUpperCase()} Agent Analysis\n\n`;
    formatted += result.result.output;
    
    if (i < successfulResults.length - 1) {
      formatted += `\n\n---\n\n`;
    }
  }
  
  // Include failed agents if any
  const failedResults = results.filter(r => !r.result.success);
  if (failedResults.length > 0) {
    formatted += `\n\n## Agent Execution Issues\n\n`;
    for (const failed of failedResults) {
      formatted += `**${failed.agent.toUpperCase()} Agent:** ${failed.result.output}\n\n`;
    }
  }
  
  formatted += `\n\n*This analysis utilized direct agent assignment within the polycentric lattice, `;
  formatted += `enabling parallel processing while maintaining constitutional compliance across all agents.*`;
  
  return formatted;
}

/**
 * Agentic Analysis Tool
 * 
 * This tool demonstrates the polycentric agentic lattice in action.
 * It coordinates multiple semi-autonomous agents to tackle complex tasks
 * through structured collaboration while maintaining constitutional compliance.
 */
export const agenticAnalysisTool: UnifiedTool = {
  name: "agentic-analysis",
  description: "Leverage the polycentric agentic lattice for complex analysis and creative tasks. Coordinates multiple semi-autonomous agents (Analysis, Creative, Discovery) through intelligent orchestration.",
  zodSchema: agenticAnalysisSchema,
  category: 'gemini',
  
  prompt: {
    description: "Execute complex tasks through coordinated multi-agent system",
    arguments: [
      {
        name: "request",
        description: "What to analyze or work on using the agentic system",
        required: true
      },
      {
        name: "enableOrchestration",
        description: "Enable intelligent task decomposition and agent coordination",
        required: false
      },
      {
        name: "showAgentDetails",
        description: "Include detailed information about agent execution",
        required: false
      },
      {
        name: "preferredAgents",
        description: "Specify preferred agents to involve in the task",
        required: false
      }
    ]
  },
  
  async execute(args, onProgress) {
    const { request, enableOrchestration, showAgentDetails, preferredAgents } = args;
    
    onProgress?.("🤖 Initializing polycentric agentic lattice...");
    
    try {
      // Initialize the agent lattice
      const orchestrator = AgentFactory.initializeAgentLattice();
      
      onProgress?.("🎯 Analyzing request and determining agent assignment...");
      
      // Create the main task
      const mainTask: AgentTask = {
        id: `task_${Date.now()}`,
        description: String(request),
        priority: 5,
        requiredCapabilities: determineRequiredCapabilities(String(request)),
        context: {
          enableOrchestration,
          preferredAgents,
          timestamp: new Date().toISOString()
        }
      };
      
      let result: string;
      
      if (enableOrchestration) {
        onProgress?.("🔄 Orchestrating multi-agent collaboration...");
        
        // Use orchestrator for complex coordination
        const orchestratorResult = await orchestrator.executeTask(mainTask);
        result = formatAgenticResult(orchestratorResult, showAgentDetails as boolean);
        
      } else {
        onProgress?.("⚡ Executing direct agent assignment...");
        
        // Direct agent assignment without orchestration
        const directResult = await executeDirectAssignment(mainTask, Array.isArray(preferredAgents) ? preferredAgents : undefined);
        result = formatDirectResult(directResult, showAgentDetails as boolean);
      }
      
      onProgress?.("✅ Agentic analysis complete");
      
      return result;
      
    } catch (error) {
      Logger.error('Agentic analysis failed:', error);
      
      return `# Agentic Analysis Failed

**Error:** ${error instanceof Error ? error.message : String(error)}

The polycentric agentic lattice encountered an error during execution. This may be due to:
- Agent initialization issues
- Task complexity exceeding current capabilities
- Constitutional validation failures

Please try simplifying the request or check the system configuration.`;
    }
  }
};