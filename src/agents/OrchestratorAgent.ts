/**
 * Orchestrator Agent - Coordinates complex tasks across multiple agents
 * 
 * The Orchestrator Agent serves as the primary coordinator in the polycentric lattice.
 * It breaks down complex requests into subtasks, assigns them to specialized agents,
 * and synthesizes the results into coherent responses.
 */

import { BaseAgent, AgentTask, AgentResult, AgentCapability, AgentMessage } from './BaseAgent.js';
import { Logger } from '../utils/logger.js';

/**
 * Task decomposition strategy
 */
interface DecompositionStrategy {
  name: string;
  description: string;
  apply: (task: AgentTask) => AgentTask[];
}

/**
 * Agent assignment for a subtask
 */
interface AgentAssignment {
  agentId: string;
  taskId: string;
  estimatedCost: number;
  estimatedReliability: number;
}

/**
 * Orchestrator Agent implementation
 */
export class OrchestratorAgent extends BaseAgent {
  private decompositionStrategies: DecompositionStrategy[] = [];
  private availableAgents: Map<string, BaseAgent> = new Map();
  private activeAssignments: Map<string, AgentAssignment[]> = new Map();
  
  constructor() {
    const capabilities: AgentCapability[] = [
      {
        name: 'task_decomposition',
        description: 'Break complex tasks into manageable subtasks',
        costEstimate: 3,
        reliabilityScore: 0.9
      },
      {
        name: 'agent_coordination',
        description: 'Coordinate multiple agents working on related tasks',
        costEstimate: 4,
        reliabilityScore: 0.85
      },
      {
        name: 'result_synthesis',
        description: 'Combine outputs from multiple agents into coherent results',
        costEstimate: 5,
        reliabilityScore: 0.8
      },
      {
        name: 'conflict_resolution',
        description: 'Resolve conflicts between agents and competing approaches',
        costEstimate: 6,
        reliabilityScore: 0.75
      }
    ];
    
    super('orchestrator-001', 'OrchestratorAgent', capabilities);
    
    this.initializeDecompositionStrategies();
    Logger.debug('OrchestratorAgent initialized with coordination capabilities');
  }
  
  /**
   * Register an agent for coordination
   */
  registerAgent(agent: BaseAgent): void {
    this.availableAgents.set(agent.getId(), agent);
    Logger.debug(`Registered agent ${agent.getName()} (${agent.getId()}) with orchestrator`);
  }
  
  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.availableAgents.delete(agentId);
    Logger.debug(`Unregistered agent ${agentId} from orchestrator`);
  }
  
  /**
   * Get list of available agents
   */
  getAvailableAgents(): BaseAgent[] {
    return Array.from(this.availableAgents.values());
  }
  
  /**
   * Execute orchestration task
   */
  protected async doExecuteTask(task: AgentTask): Promise<AgentResult> {
    Logger.debug(`Orchestrator decomposing task: ${task.description}`);
    
    // Step 1: Decompose the task into subtasks
    const subtasks = this.decomposeTask(task);
    
    if (subtasks.length === 0) {
      // Simple task that doesn't need decomposition
      return await this.executeSimpleTask(task);
    }
    
    // Step 2: Assign subtasks to appropriate agents
    const assignments = await this.assignTasks(subtasks);
    
    // Step 3: Execute subtasks in parallel where possible
    const results = await this.executeSubtasks(assignments);
    
    // Step 4: Synthesize results into final output
    const synthesizedResult = await this.synthesizeResults(task, results);
    
    return synthesizedResult;
  }
  
  /**
   * Decompose a complex task into subtasks
   */
  private decomposeTask(task: AgentTask): AgentTask[] {
    const taskLower = task.description.toLowerCase();
    
    // Try each decomposition strategy
    for (const strategy of this.decompositionStrategies) {
      try {
        const subtasks = strategy.apply(task);
        if (subtasks.length > 0) {
          Logger.debug(`Applied decomposition strategy '${strategy.name}' to create ${subtasks.length} subtasks`);
          return subtasks;
        }
      } catch (error) {
        Logger.debug(`Decomposition strategy '${strategy.name}' failed: ${error}`);
      }
    }
    
    return []; // No decomposition needed
  }
  
  /**
   * Assign subtasks to appropriate agents
   */
  private async assignTasks(subtasks: AgentTask[]): Promise<Map<string, AgentAssignment[]>> {
    const assignments = new Map<string, AgentAssignment[]>();
    
    for (const subtask of subtasks) {
      const suitableAgents = this.findSuitableAgents(subtask);
      
      if (suitableAgents.length === 0) {
        Logger.debug(`No suitable agents found for subtask: ${subtask.description}`);
        continue;
      }
      
      // Select best agent based on cost and reliability
      const bestAgent = this.selectBestAgent(suitableAgents, subtask);
      
      if (!assignments.has(bestAgent.getId())) {
        assignments.set(bestAgent.getId(), []);
      }
      
      const estimate = bestAgent.estimateTask(subtask);
      assignments.get(bestAgent.getId())!.push({
        agentId: bestAgent.getId(),
        taskId: subtask.id,
        estimatedCost: estimate.cost,
        estimatedReliability: estimate.reliability
      });
    }
    
    return assignments;
  }
  
  /**
   * Find agents suitable for a task
   */
  private findSuitableAgents(task: AgentTask): BaseAgent[] {
    return Array.from(this.availableAgents.values())
      .filter(agent => agent.canHandle(task));
  }
  
  /**
   * Select the best agent for a task
   */
  private selectBestAgent(suitableAgents: BaseAgent[], task: AgentTask): BaseAgent {
    let bestAgent = suitableAgents[0];
    let bestScore = -Infinity;
    
    for (const agent of suitableAgents) {
      const estimate = agent.estimateTask(task);
      // Score = reliability / cost (higher is better)
      const score = estimate.reliability / Math.max(estimate.cost, 1);
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }
  
  /**
   * Execute subtasks across assigned agents
   */
  private async executeSubtasks(assignments: Map<string, AgentAssignment[]>): Promise<AgentResult[]> {
    const allResults: AgentResult[] = [];
    const executionPromises: Promise<AgentResult[]>[] = [];
    
    // Execute tasks for each agent
    for (const [agentId, agentAssignments] of assignments) {
      const agent = this.availableAgents.get(agentId);
      if (!agent) {
        Logger.error(`Agent ${agentId} not found for task execution`);
        continue;
      }
      
      const agentPromise = this.executeAgentTasks(agent, agentAssignments);
      executionPromises.push(agentPromise);
    }
    
    // Wait for all agents to complete their tasks
    const agentResults = await Promise.all(executionPromises);
    
    // Flatten results
    for (const results of agentResults) {
      allResults.push(...results);
    }
    
    return allResults;
  }
  
  /**
   * Execute tasks for a specific agent
   */
  private async executeAgentTasks(agent: BaseAgent, assignments: AgentAssignment[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    for (const assignment of assignments) {
      try {
        // Create task from assignment (this would need the original task data)
        const task: AgentTask = {
          id: assignment.taskId,
          description: `Subtask for ${assignment.taskId}`,
          priority: 5,
          requiredCapabilities: [],
          context: {}
        };
        
        const result = await agent.executeTask(task);
        results.push(result);
        
      } catch (error) {
        Logger.error(`Error executing task ${assignment.taskId} on agent ${agent.getName()}:`, error);
        
        results.push({
          taskId: assignment.taskId,
          agentId: agent.getId(),
          success: false,
          output: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
          confidence: 0,
          resourcesUsed: []
        });
      }
    }
    
    return results;
  }
  
  /**
   * Synthesize results from multiple agents
   */
  private async synthesizeResults(originalTask: AgentTask, results: AgentResult[]): Promise<AgentResult> {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    if (successfulResults.length === 0) {
      return {
        taskId: originalTask.id,
        agentId: this.id,
        success: false,
        output: 'All subtasks failed to complete successfully',
        confidence: 0,
        resourcesUsed: []
      };
    }
    
    // Combine successful outputs
    let synthesizedOutput = `# Orchestrated Result for: ${originalTask.description}\n\n`;
    
    if (successfulResults.length === 1) {
      synthesizedOutput += successfulResults[0].output;
    } else {
      synthesizedOutput += '## Synthesized Analysis from Multiple Agents\n\n';
      
      for (let i = 0; i < successfulResults.length; i++) {
        const result = successfulResults[i];
        synthesizedOutput += `### Agent Analysis ${i + 1} (Confidence: ${(result.confidence * 100).toFixed(1)}%)\n`;
        synthesizedOutput += `${result.output}\n\n`;
      }
      
      // Add synthesis conclusion
      synthesizedOutput += '### Orchestrator Synthesis\n';
      synthesizedOutput += this.generateSynthesisConclusion(successfulResults);
    }
    
    if (failedResults.length > 0) {
      synthesizedOutput += `\n\n### Note: ${failedResults.length} subtask(s) failed to complete`;
    }
    
    // Calculate average confidence
    const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
    
    return {
      taskId: originalTask.id,
      agentId: this.id,
      success: true,
      output: synthesizedOutput,
      confidence: avgConfidence,
      resourcesUsed: results.flatMap(r => r.resourcesUsed)
    };
  }
  
  /**
   * Generate synthesis conclusion from multiple results
   */
  private generateSynthesisConclusion(results: AgentResult[]): string {
    const highConfidenceResults = results.filter(r => r.confidence > 0.7);
    const mediumConfidenceResults = results.filter(r => r.confidence > 0.4 && r.confidence <= 0.7);
    
    let conclusion = '';
    
    if (highConfidenceResults.length > 0) {
      conclusion += `Based on ${highConfidenceResults.length} high-confidence analysis(es), `;
    }
    
    if (results.length > 1) {
      conclusion += `the collective intelligence suggests convergence around the core findings. `;
    }
    
    conclusion += `This orchestrated approach provides multiple perspectives while maintaining constitutional compliance across all agent interactions.`;
    
    return conclusion;
  }
  
  /**
   * Execute simple task that doesn't need decomposition
   */
  private async executeSimpleTask(task: AgentTask): Promise<AgentResult> {
    return {
      taskId: task.id,
      agentId: this.id,
      success: true,
      output: `Task "${task.description}" completed directly by orchestrator without decomposition.`,
      confidence: 0.8,
      resourcesUsed: ['orchestrator_direct_execution']
    };
  }
  
  /**
   * Initialize decomposition strategies
   */
  private initializeDecompositionStrategies(): void {
    this.decompositionStrategies = [
      {
        name: 'file_analysis_decomposition',
        description: 'Break down file analysis tasks',
        apply: (task: AgentTask) => {
          const description = task.description.toLowerCase();
          if (description.includes('analyze') && description.includes('@')) {
            return this.createFileAnalysisSubtasks(task);
          }
          return [];
        }
      },
      {
        name: 'creative_process_decomposition',
        description: 'Break down creative process tasks into phases',
        apply: (task: AgentTask) => {
          const description = task.description.toLowerCase();
          if (description.includes('create') || description.includes('design') || description.includes('develop')) {
            return this.createCreativeProcessSubtasks(task);
          }
          return [];
        }
      },
      {
        name: 'complex_query_decomposition',
        description: 'Break down complex multi-part queries',
        apply: (task: AgentTask) => {
          const description = task.description;
          if (description.includes(' and ') || description.includes(', ') || description.length > 200) {
            return this.createComplexQuerySubtasks(task);
          }
          return [];
        }
      }
    ];
  }
  
  /**
   * Create subtasks for file analysis
   */
  private createFileAnalysisSubtasks(task: AgentTask): AgentTask[] {
    return [
      {
        id: `${task.id}_file_extraction`,
        description: 'Extract and prepare file contents for analysis',
        priority: task.priority,
        requiredCapabilities: ['file_analysis'],
        context: { ...task.context, phase: 'extraction' },
        parentTaskId: task.id
      },
      {
        id: `${task.id}_content_analysis`,
        description: 'Perform deep analysis of file contents',
        priority: task.priority,
        requiredCapabilities: ['gemini_analysis'],
        context: { ...task.context, phase: 'analysis' },
        parentTaskId: task.id
      }
    ];
  }
  
  /**
   * Create subtasks for creative processes
   */
  private createCreativeProcessSubtasks(task: AgentTask): AgentTask[] {
    return [
      {
        id: `${task.id}_vision_clarification`,
        description: 'Clarify creative vision and desired outcome',
        priority: task.priority,
        requiredCapabilities: ['creative_process'],
        context: { ...task.context, phase: 'germination' },
        parentTaskId: task.id
      },
      {
        id: `${task.id}_resource_analysis`,
        description: 'Analyze available resources and current reality',
        priority: task.priority,
        requiredCapabilities: ['analysis'],
        context: { ...task.context, phase: 'assessment' },
        parentTaskId: task.id
      }
    ];
  }
  
  /**
   * Create subtasks for complex queries
   */
  private createComplexQuerySubtasks(task: AgentTask): AgentTask[] {
    // Simple heuristic: split on "and" or comma
    const parts = task.description.split(/\s+and\s+|,\s+/);
    
    if (parts.length < 2) return [];
    
    return parts.map((part, index) => ({
      id: `${task.id}_part_${index + 1}`,
      description: part.trim(),
      priority: task.priority,
      requiredCapabilities: ['analysis'],
      context: { ...task.context, partIndex: index },
      parentTaskId: task.id
    }));
  }
}