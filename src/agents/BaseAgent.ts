/**
 * Base Agent - Foundation for all autonomous agents in the polycentric lattice
 * 
 * This abstract class defines the common interface and capabilities for all agents
 * in the system. Each agent is semi-autonomous and can communicate with other agents
 * while maintaining constitutional compliance.
 */

import { getVortexCore, ValidationContext, ToolExecutionContext } from '../core/index.js';
import { Logger } from '../utils/logger.js';

/**
 * Agent capability defines what an agent can do
 */
export interface AgentCapability {
  name: string;
  description: string;
  costEstimate: number; // Relative cost (1-10 scale)
  reliabilityScore: number; // Reliability (0-1 scale)
}

/**
 * Task that can be assigned to an agent
 */
export interface AgentTask {
  id: string;
  description: string;
  priority: number; // 1-10 scale
  requiredCapabilities: string[];
  context: Record<string, any>;
  deadline?: Date;
  parentTaskId?: string;
}

/**
 * Result from agent task execution
 */
export interface AgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: string;
  confidence: number; // 0-1 scale
  resourcesUsed: string[];
  subTasksCreated?: AgentTask[];
  collaborationNeeded?: {
    requiredCapabilities: string[];
    suggestedAgents: string[];
  };
}

/**
 * Communication message between agents
 */
export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'collaboration' | 'conflict_resolution';
  content: any;
  timestamp: Date;
  taskId?: string;
}

/**
 * Agent state for coordination
 */
export interface AgentState {
  id: string;
  active: boolean;
  currentLoad: number; // 0-1 scale of capacity utilization
  availableCapabilities: AgentCapability[];
  activeTasks: string[];
  lastActivity: Date;
}

/**
 * Abstract base class for all agents
 */
export abstract class BaseAgent {
  protected readonly id: string;
  protected readonly name: string;
  protected state: AgentState;
  protected messageQueue: AgentMessage[] = [];
  
  constructor(id: string, name: string, capabilities: AgentCapability[]) {
    this.id = id;
    this.name = name;
    this.state = {
      id,
      active: true,
      currentLoad: 0,
      availableCapabilities: capabilities,
      activeTasks: [],
      lastActivity: new Date()
    };
    
    Logger.debug(`Agent ${this.name} (${this.id}) initialized with ${capabilities.length} capabilities`);
  }
  
  /**
   * Get agent identifier
   */
  getId(): string {
    return this.id;
  }
  
  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }
  
  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }
  
  /**
   * Check if agent can handle a task
   */
  canHandle(task: AgentTask): boolean {
    // Check if agent has required capabilities
    const hasCapabilities = task.requiredCapabilities.every(required =>
      this.state.availableCapabilities.some(cap => cap.name === required)
    );
    
    // Check if agent has capacity
    const hasCapacity = this.state.currentLoad < 0.9; // Leave 10% buffer
    
    return hasCapabilities && hasCapacity && this.state.active;
  }
  
  /**
   * Estimate cost and reliability for a task
   */
  estimateTask(task: AgentTask): { cost: number; reliability: number; } {
    const requiredCaps = this.state.availableCapabilities.filter(cap =>
      task.requiredCapabilities.includes(cap.name)
    );
    
    if (requiredCaps.length === 0) {
      return { cost: Infinity, reliability: 0 };
    }
    
    const avgCost = requiredCaps.reduce((sum, cap) => sum + cap.costEstimate, 0) / requiredCaps.length;
    const avgReliability = requiredCaps.reduce((sum, cap) => sum + cap.reliabilityScore, 0) / requiredCaps.length;
    
    // Adjust for current load
    const loadMultiplier = 1 + this.state.currentLoad;
    
    return {
      cost: avgCost * loadMultiplier,
      reliability: avgReliability * (1 - this.state.currentLoad * 0.3) // Performance degrades with load
    };
  }
  
  /**
   * Execute a task with constitutional validation
   */
  async executeTask(task: AgentTask): Promise<AgentResult> {
    Logger.debug(`Agent ${this.name} executing task ${task.id}: ${task.description}`);
    
    // Update state
    this.state.activeTasks.push(task.id);
    this.state.currentLoad = Math.min(this.state.currentLoad + 0.2, 1.0);
    this.state.lastActivity = new Date();
    
    try {
      // Constitutional pre-validation
      const vortexCore = getVortexCore();
      const executionContext: ToolExecutionContext = {
        toolName: this.name,
        args: task.context,
        input: task.description,
        timestamp: new Date()
      };
      
      const preValidation = await vortexCore.preExecutionValidation(executionContext);
      
      if (!preValidation.approved && preValidation.guidance) {
        Logger.debug(`Constitutional guidance for agent ${this.name}: ${preValidation.guidance}`);
      }
      
      // Execute the actual task
      const rawResult = await this.doExecuteTask(task);
      
      // Constitutional post-validation
      const finalOutput = await vortexCore.postExecutionValidation(executionContext, rawResult.output);
      
      const result: AgentResult = {
        ...rawResult,
        output: finalOutput
      };
      
      Logger.debug(`Agent ${this.name} completed task ${task.id} with success: ${result.success}`);
      
      return result;
      
    } catch (error) {
      Logger.error(`Agent ${this.name} failed task ${task.id}:`, error);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: `Task execution failed: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
        resourcesUsed: []
      };
      
    } finally {
      // Update state
      this.state.activeTasks = this.state.activeTasks.filter(id => id !== task.id);
      this.state.currentLoad = Math.max(this.state.currentLoad - 0.2, 0);
      this.state.lastActivity = new Date();
    }
  }
  
  /**
   * Send a message to another agent
   */
  async sendMessage(message: AgentMessage): Promise<void> {
    // In a real implementation, this would route through a message bus
    Logger.debug(`Agent ${this.name} sending ${message.type} message to ${message.to}`);
  }
  
  /**
   * Receive a message from another agent
   */
  async receiveMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    await this.processMessage(message);
  }
  
  /**
   * Process messages from other agents
   */
  protected async processMessage(message: AgentMessage): Promise<void> {
    Logger.debug(`Agent ${this.name} processing ${message.type} message from ${message.from}`);
    
    switch (message.type) {
      case 'request':
        await this.handleRequest(message);
        break;
      case 'collaboration':
        await this.handleCollaboration(message);
        break;
      case 'conflict_resolution':
        await this.handleConflictResolution(message);
        break;
    }
  }
  
  /**
   * Handle incoming requests
   */
  protected async handleRequest(message: AgentMessage): Promise<void> {
    // Default implementation - can be overridden by specific agents
    Logger.debug(`Agent ${this.name} received request: ${JSON.stringify(message.content)}`);
  }
  
  /**
   * Handle collaboration requests
   */
  protected async handleCollaboration(message: AgentMessage): Promise<void> {
    // Default implementation - can be overridden by specific agents
    Logger.debug(`Agent ${this.name} received collaboration request: ${JSON.stringify(message.content)}`);
  }
  
  /**
   * Handle conflict resolution
   */
  protected async handleConflictResolution(message: AgentMessage): Promise<void> {
    // Default implementation - can be overridden by specific agents
    Logger.debug(`Agent ${this.name} participating in conflict resolution: ${JSON.stringify(message.content)}`);
  }
  
  /**
   * Abstract method for actual task execution - must be implemented by subclasses
   */
  protected abstract doExecuteTask(task: AgentTask): Promise<AgentResult>;
  
  /**
   * Shutdown the agent gracefully
   */
  async shutdown(): Promise<void> {
    this.state.active = false;
    Logger.debug(`Agent ${this.name} shutting down`);
  }
}