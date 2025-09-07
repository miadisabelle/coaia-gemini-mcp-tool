/**
 * Resilience Manager - Dynamic Equilibrium between Goals and Exploration
 * 
 * This class implements the "Resilient Connection" - the dynamic equilibrium
 * that maintains the system's core goals while simultaneously allowing for
 * novelty and discovery. It balances exploitation and exploration according
 * to the system's constitutional principles.
 */

import { BaseAgent, AgentTask, AgentResult } from '../agents/BaseAgent.js';
import { getVortexCore } from '../core/index.js';
import { Logger } from '../utils/logger.js';

/**
 * Exploration vs Exploitation balance
 */
export interface ExplorationBalance {
  exploitation: number; // 0-1 scale - focus on known goals
  exploration: number;  // 0-1 scale - search for novelty
  tension: number;      // Creative tension level
  rationale: string;    // Why this balance was chosen
}

/**
 * Resilience strategy types
 */
export type ResilienceStrategy = 'goal_directed' | 'exploratory' | 'balanced' | 'adaptive';

/**
 * Coordination context for decision making
 */
export interface CoordinationContext {
  primaryGoal: string;
  currentSituation: string;
  availableAgents: BaseAgent[];
  taskComplexity: number; // 1-10 scale
  timeConstraints?: number; // Minutes available
  riskTolerance: number; // 0-1 scale
  noveltyRequired: boolean;
}

/**
 * Coordination decision
 */
export interface CoordinationDecision {
  strategy: ResilienceStrategy;
  agentAssignments: Map<string, AgentTask[]>;
  explorationBalance: ExplorationBalance;
  expectedOutcomes: string[];
  contingencyPlans: string[];
}

/**
 * Dynamic outcome evaluation
 */
export interface OutcomeEvaluation {
  goalAlignment: number; // 0-1 how well it serves the primary goal
  noveltyScore: number; // 0-1 how novel/creative the outcome is
  feasibility: number; // 0-1 how implementable it is
  constitutionalCompliance: number; // 0-1 principle adherence
  overallValue: number; // Weighted combination
}

/**
 * Resilience Manager implementation
 */
export class ResilienceManager {
  private coordinationHistory: CoordinationDecision[] = [];
  private outcomeHistory: Map<string, OutcomeEvaluation> = new Map();
  
  constructor() {
    Logger.debug('ResilienceManager initialized for dynamic equilibrium coordination');
  }
  
  /**
   * Make a coordination decision balancing goals and exploration
   */
  async makeCoordinationDecision(context: CoordinationContext): Promise<CoordinationDecision> {
    Logger.debug(`Making coordination decision for goal: ${context.primaryGoal}`);
    
    // Calculate optimal exploration balance
    const explorationBalance = this.calculateExplorationBalance(context);
    
    // Determine resilience strategy
    const strategy = this.selectResilienceStrategy(context, explorationBalance);
    
    // Generate agent assignments based on strategy
    const agentAssignments = await this.generateAgentAssignments(context, strategy, explorationBalance);
    
    // Predict expected outcomes
    const expectedOutcomes = this.predictOutcomes(context, strategy, agentAssignments);
    
    // Create contingency plans
    const contingencyPlans = this.createContingencyPlans(context, strategy);
    
    const decision: CoordinationDecision = {
      strategy,
      agentAssignments,
      explorationBalance,
      expectedOutcomes,
      contingencyPlans
    };
    
    // Store decision for learning
    this.coordinationHistory.push(decision);
    
    Logger.debug(`Coordination decision: ${strategy} strategy with ${(explorationBalance.exploitation * 100).toFixed(1)}% exploitation, ${(explorationBalance.exploration * 100).toFixed(1)}% exploration`);
    
    return decision;
  }
  
  /**
   * Calculate optimal balance between exploitation and exploration
   */
  private calculateExplorationBalance(context: CoordinationContext): ExplorationBalance {
    let exploitation = 0.5; // Start with neutral balance
    let exploration = 0.5;
    
    // Adjust based on context factors
    
    // Task complexity favors exploration
    if (context.taskComplexity > 7) {
      exploration += 0.2;
      exploitation -= 0.2;
    } else if (context.taskComplexity < 4) {
      exploitation += 0.2;
      exploration -= 0.2;
    }
    
    // Time constraints favor exploitation
    if (context.timeConstraints && context.timeConstraints < 30) {
      exploitation += 0.3;
      exploration -= 0.3;
    }
    
    // Risk tolerance affects exploration
    if (context.riskTolerance > 0.7) {
      exploration += 0.2;
    } else if (context.riskTolerance < 0.3) {
      exploitation += 0.2;
      exploration -= 0.2;
    }
    
    // Explicit novelty requirement
    if (context.noveltyRequired) {
      exploration += 0.3;
      exploitation -= 0.3;
    }
    
    // Normalize to ensure they sum to 1
    const total = exploitation + exploration;
    exploitation = exploitation / total;
    exploration = exploration / total;
    
    // Calculate creative tension
    const tension = Math.abs(exploitation - exploration) * 2; // 0-2 scale, normalized to 0-1
    const normalizedTension = Math.min(tension, 1);
    
    let rationale = `Balanced for `;
    if (exploitation > 0.6) {
      rationale = `Favors exploitation due to `;
    } else if (exploration > 0.6) {
      rationale = `Favors exploration due to `;
    }
    
    const factors = [];
    if (context.taskComplexity > 7) factors.push('high complexity');
    if (context.timeConstraints && context.timeConstraints < 30) factors.push('time constraints');
    if (context.riskTolerance > 0.7) factors.push('high risk tolerance');
    if (context.noveltyRequired) factors.push('novelty requirement');
    
    rationale += factors.length > 0 ? factors.join(', ') : 'balanced context';
    
    return {
      exploitation,
      exploration,
      tension: normalizedTension,
      rationale
    };
  }
  
  /**
   * Select appropriate resilience strategy
   */
  private selectResilienceStrategy(
    context: CoordinationContext, 
    balance: ExplorationBalance
  ): ResilienceStrategy {
    // High exploitation - go goal-directed
    if (balance.exploitation > 0.7) {
      return 'goal_directed';
    }
    
    // High exploration - go exploratory
    if (balance.exploration > 0.7) {
      return 'exploratory';
    }
    
    // High tension suggests adaptive approach
    if (balance.tension > 0.7) {
      return 'adaptive';
    }
    
    // Default to balanced
    return 'balanced';
  }
  
  /**
   * Generate agent assignments based on strategy
   */
  private async generateAgentAssignments(
    context: CoordinationContext,
    strategy: ResilienceStrategy,
    balance: ExplorationBalance
  ): Promise<Map<string, AgentTask[]>> {
    const assignments = new Map<string, AgentTask[]>();
    
    switch (strategy) {
      case 'goal_directed':
        return this.generateGoalDirectedAssignments(context);
      
      case 'exploratory':
        return this.generateExploratoryAssignments(context);
      
      case 'balanced':
        return this.generateBalancedAssignments(context, balance);
      
      case 'adaptive':
        return this.generateAdaptiveAssignments(context, balance);
      
      default:
        return this.generateBalancedAssignments(context, balance);
    }
  }
  
  /**
   * Generate goal-directed agent assignments
   */
  private generateGoalDirectedAssignments(context: CoordinationContext): Map<string, AgentTask[]> {
    const assignments = new Map<string, AgentTask[]>();
    
    // Prioritize agents most aligned with the primary goal
    const primaryTask: AgentTask = {
      id: `goal_${Date.now()}`,
      description: context.primaryGoal,
      priority: 10, // Highest priority
      requiredCapabilities: this.inferCapabilitiesFromGoal(context.primaryGoal),
      context: {
        strategy: 'goal_directed',
        primaryGoal: context.primaryGoal,
        focusMode: 'efficiency'
      }
    };
    
    // Assign to most suitable agent
    const suitableAgent = this.findMostSuitableAgent(context.availableAgents, primaryTask);
    if (suitableAgent) {
      assignments.set(suitableAgent.getId(), [primaryTask]);
    }
    
    return assignments;
  }
  
  /**
   * Generate exploratory agent assignments
   */
  private generateExploratoryAssignments(context: CoordinationContext): Map<string, AgentTask[]> {
    const assignments = new Map<string, AgentTask[]>();
    
    // Create multiple exploratory tasks
    const exploratoryTasks: AgentTask[] = [
      {
        id: `explore_novelty_${Date.now()}`,
        description: `Explore novel approaches to: ${context.primaryGoal}`,
        priority: 8,
        requiredCapabilities: ['novelty_search', 'lateral_thinking'],
        context: {
          strategy: 'exploratory',
          explorationFocus: 'novelty',
          primaryGoal: context.primaryGoal
        }
      },
      {
        id: `explore_alternatives_${Date.now()}`,
        description: `Find alternative perspectives on: ${context.primaryGoal}`,
        priority: 7,
        requiredCapabilities: ['boundary_exploration', 'analogical_reasoning'],
        context: {
          strategy: 'exploratory',
          explorationFocus: 'alternatives',
          primaryGoal: context.primaryGoal
        }
      }
    ];
    
    // Distribute across available agents
    for (const task of exploratoryTasks) {
      const agent = this.findMostSuitableAgent(context.availableAgents, task);
      if (agent) {
        if (!assignments.has(agent.getId())) {
          assignments.set(agent.getId(), []);
        }
        assignments.get(agent.getId())!.push(task);
      }
    }
    
    return assignments;
  }
  
  /**
   * Generate balanced agent assignments
   */
  private generateBalancedAssignments(
    context: CoordinationContext, 
    balance: ExplorationBalance
  ): Map<string, AgentTask[]> {
    const assignments = new Map<string, AgentTask[]>();
    
    // Create both goal-directed and exploratory tasks
    const goalTask: AgentTask = {
      id: `balanced_goal_${Date.now()}`,
      description: context.primaryGoal,
      priority: 8,
      requiredCapabilities: this.inferCapabilitiesFromGoal(context.primaryGoal),
      context: {
        strategy: 'balanced',
        exploitationWeight: balance.exploitation,
        primaryGoal: context.primaryGoal
      }
    };
    
    const explorationTask: AgentTask = {
      id: `balanced_explore_${Date.now()}`,
      description: `Explore creative possibilities related to: ${context.primaryGoal}`,
      priority: 6,
      requiredCapabilities: ['novelty_search', 'creative_process'],
      context: {
        strategy: 'balanced',
        explorationWeight: balance.exploration,
        primaryGoal: context.primaryGoal
      }
    };
    
    // Assign tasks to suitable agents
    const goalAgent = this.findMostSuitableAgent(context.availableAgents, goalTask);
    const exploreAgent = this.findMostSuitableAgent(context.availableAgents, explorationTask);
    
    if (goalAgent) {
      assignments.set(goalAgent.getId(), [goalTask]);
    }
    
    if (exploreAgent && exploreAgent.getId() !== goalAgent?.getId()) {
      assignments.set(exploreAgent.getId(), [explorationTask]);
    }
    
    return assignments;
  }
  
  /**
   * Generate adaptive agent assignments
   */
  private generateAdaptiveAssignments(
    context: CoordinationContext, 
    balance: ExplorationBalance
  ): Map<string, AgentTask[]> {
    const assignments = new Map<string, AgentTask[]>();
    
    // Create adaptive task that can shift between exploitation and exploration
    const adaptiveTask: AgentTask = {
      id: `adaptive_${Date.now()}`,
      description: `Adaptively pursue: ${context.primaryGoal}`,
      priority: 9,
      requiredCapabilities: ['creative_process', 'analysis', 'novelty_search'],
      context: {
        strategy: 'adaptive',
        tension: balance.tension,
        exploitationWeight: balance.exploitation,
        explorationWeight: balance.exploration,
        primaryGoal: context.primaryGoal,
        adaptiveMode: true
      }
    };
    
    // Use orchestrator for adaptive coordination
    const orchestrator = context.availableAgents.find(agent => 
      agent.getName() === 'OrchestratorAgent'
    );
    
    if (orchestrator) {
      assignments.set(orchestrator.getId(), [adaptiveTask]);
    } else {
      // Fallback to most capable agent
      const fallbackAgent = this.findMostSuitableAgent(context.availableAgents, adaptiveTask);
      if (fallbackAgent) {
        assignments.set(fallbackAgent.getId(), [adaptiveTask]);
      }
    }
    
    return assignments;
  }
  
  /**
   * Predict expected outcomes based on coordination decision
   */
  private predictOutcomes(
    context: CoordinationContext,
    strategy: ResilienceStrategy,
    assignments: Map<string, AgentTask[]>
  ): string[] {
    const outcomes: string[] = [];
    
    switch (strategy) {
      case 'goal_directed':
        outcomes.push('Efficient achievement of primary goal');
        outcomes.push('Reliable, tested approaches');
        outcomes.push('Minimal risk of unexpected results');
        break;
        
      case 'exploratory':
        outcomes.push('Novel insights and creative solutions');
        outcomes.push('Discovery of unexpected opportunities');
        outcomes.push('Higher risk but potentially breakthrough results');
        break;
        
      case 'balanced':
        outcomes.push('Good balance of reliability and creativity');
        outcomes.push('Moderate innovation with controlled risk');
        outcomes.push('Multiple pathways to goal achievement');
        break;
        
      case 'adaptive':
        outcomes.push('Dynamic optimization based on emerging information');
        outcomes.push('Ability to pivot between approaches as needed');
        outcomes.push('Resilient adaptation to unexpected challenges');
        break;
    }
    
    return outcomes;
  }
  
  /**
   * Create contingency plans for different scenarios
   */
  private createContingencyPlans(
    context: CoordinationContext,
    strategy: ResilienceStrategy
  ): string[] {
    const contingencies: string[] = [];
    
    // Common contingencies
    contingencies.push('If primary agent fails, reassign to backup agent with similar capabilities');
    contingencies.push('If time constraints become critical, shift to goal-directed strategy');
    contingencies.push('If unexpected opportunities emerge, deploy discovery agent');
    
    // Strategy-specific contingencies
    switch (strategy) {
      case 'goal_directed':
        contingencies.push('If efficient path is blocked, temporarily increase exploration');
        contingencies.push('If outcome lacks innovation, inject creative agent input');
        break;
        
      case 'exploratory':
        contingencies.push('If exploration yields no viable options, fallback to proven approaches');
        contingencies.push('If risk becomes too high, implement safety constraints');
        break;
        
      case 'balanced':
        contingencies.push('If balance becomes ineffective, shift to pure exploitation or exploration');
        contingencies.push('Monitor tension levels and adjust weights dynamically');
        break;
        
      case 'adaptive':
        contingencies.push('If adaptation cycles become chaotic, implement stability controls');
        contingencies.push('If tension becomes destructive, reduce exploration weight');
        break;
    }
    
    return contingencies;
  }
  
  /**
   * Evaluate outcome quality across multiple dimensions
   */
  async evaluateOutcome(
    taskId: string,
    result: AgentResult,
    originalContext: CoordinationContext
  ): Promise<OutcomeEvaluation> {
    const vortexCore = getVortexCore();
    
    // Evaluate constitutional compliance
    const validation = await vortexCore.postExecutionValidation(
      {
        toolName: 'resilience_manager',
        args: {},
        input: originalContext.primaryGoal,
        timestamp: new Date()
      },
      result.output
    );
    
    const evaluation: OutcomeEvaluation = {
      goalAlignment: this.calculateGoalAlignment(result, originalContext.primaryGoal),
      noveltyScore: this.calculateNoveltyScore(result),
      feasibility: this.calculateFeasibility(result),
      constitutionalCompliance: result.confidence, // Use agent's confidence as proxy
      overallValue: 0 // Will be calculated
    };
    
    // Calculate weighted overall value
    evaluation.overallValue = (
      evaluation.goalAlignment * 0.3 +
      evaluation.noveltyScore * 0.2 +
      evaluation.feasibility * 0.3 +
      evaluation.constitutionalCompliance * 0.2
    );
    
    // Store evaluation for learning
    this.outcomeHistory.set(taskId, evaluation);
    
    Logger.debug(`Outcome evaluation for ${taskId}: Goal alignment ${(evaluation.goalAlignment * 100).toFixed(1)}%, Novelty ${(evaluation.noveltyScore * 100).toFixed(1)}%, Overall value ${(evaluation.overallValue * 100).toFixed(1)}%`);
    
    return evaluation;
  }
  
  /**
   * Calculate how well the result aligns with the primary goal
   */
  private calculateGoalAlignment(result: AgentResult, primaryGoal: string): number {
    // Simple heuristic based on content overlap and success
    if (!result.success) return 0.1;
    
    const goalWords = primaryGoal.toLowerCase().split(' ');
    const resultWords = result.output.toLowerCase().split(' ');
    
    const overlap = goalWords.filter(word => resultWords.includes(word)).length;
    const alignmentScore = overlap / goalWords.length;
    
    return Math.min(alignmentScore * result.confidence, 1.0);
  }
  
  /**
   * Calculate novelty score of the result
   */
  private calculateNoveltyScore(result: AgentResult): number {
    const noveltyKeywords = [
      'novel', 'innovative', 'creative', 'unique', 'original', 'breakthrough',
      'unconventional', 'unexpected', 'surprising', 'revolutionary'
    ];
    
    const output = result.output.toLowerCase();
    const noveltyCount = noveltyKeywords.reduce((count, keyword) => {
      return count + (output.includes(keyword) ? 1 : 0);
    }, 0);
    
    const baseScore = Math.min(noveltyCount * 0.1, 0.8);
    return result.success ? baseScore : baseScore * 0.5;
  }
  
  /**
   * Calculate feasibility of the result
   */
  private calculateFeasibility(result: AgentResult): number {
    const feasibilityKeywords = [
      'practical', 'implementable', 'achievable', 'realistic', 'doable',
      'step-by-step', 'concrete', 'actionable', 'specific'
    ];
    
    const output = result.output.toLowerCase();
    const feasibilityCount = feasibilityKeywords.reduce((count, keyword) => {
      return count + (output.includes(keyword) ? 1 : 0);
    }, 0);
    
    const baseScore = Math.min(feasibilityCount * 0.15, 0.9);
    return result.success ? Math.max(baseScore, 0.5) : baseScore * 0.3;
  }
  
  /**
   * Infer required capabilities from a goal description
   */
  private inferCapabilitiesFromGoal(goal: string): string[] {
    const capabilities: string[] = [];
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('analyze') || goalLower.includes('understand')) {
      capabilities.push('analysis', 'pattern_recognition');
    }
    
    if (goalLower.includes('create') || goalLower.includes('design') || goalLower.includes('develop')) {
      capabilities.push('creative_process', 'ideation');
    }
    
    if (goalLower.includes('explore') || goalLower.includes('discover') || goalLower.includes('find')) {
      capabilities.push('novelty_search', 'exploration');
    }
    
    if (goalLower.includes('code') || goalLower.includes('program') || goalLower.includes('software')) {
      capabilities.push('code_understanding', 'technical_analysis');
    }
    
    return capabilities.length > 0 ? capabilities : ['analysis', 'creative_process'];
  }
  
  /**
   * Find the most suitable agent for a task
   */
  private findMostSuitableAgent(agents: BaseAgent[], task: AgentTask): BaseAgent | null {
    let bestAgent: BaseAgent | null = null;
    let bestScore = -1;
    
    for (const agent of agents) {
      if (agent.canHandle(task)) {
        const estimate = agent.estimateTask(task);
        const score = estimate.reliability / Math.max(estimate.cost, 1);
        
        if (score > bestScore) {
          bestScore = score;
          bestAgent = agent;
        }
      }
    }
    
    return bestAgent;
  }
  
  /**
   * Get coordination statistics for analysis
   */
  getCoordinationStats(): {
    totalDecisions: number;
    strategyDistribution: Record<ResilienceStrategy, number>;
    averageOutcomeValue: number;
    explorationTrends: { avg: number; trend: 'increasing' | 'decreasing' | 'stable' };
  } {
    const strategyDistribution: Record<ResilienceStrategy, number> = {
      goal_directed: 0,
      exploratory: 0,
      balanced: 0,
      adaptive: 0
    };
    
    for (const decision of this.coordinationHistory) {
      strategyDistribution[decision.strategy]++;
    }
    
    const outcomeValues = Array.from(this.outcomeHistory.values()).map(e => e.overallValue);
    const averageOutcomeValue = outcomeValues.length > 0 
      ? outcomeValues.reduce((sum, val) => sum + val, 0) / outcomeValues.length 
      : 0;
    
    // Calculate exploration trends
    const recentDecisions = this.coordinationHistory.slice(-10);
    const explorationValues = recentDecisions.map(d => d.explorationBalance.exploration);
    const avgExploration = explorationValues.length > 0 
      ? explorationValues.reduce((sum, val) => sum + val, 0) / explorationValues.length 
      : 0.5;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (explorationValues.length > 5) {
      const firstHalf = explorationValues.slice(0, Math.floor(explorationValues.length / 2));
      const secondHalf = explorationValues.slice(Math.floor(explorationValues.length / 2));
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.1) trend = 'increasing';
      else if (firstAvg > secondAvg + 0.1) trend = 'decreasing';
    }
    
    return {
      totalDecisions: this.coordinationHistory.length,
      strategyDistribution,
      averageOutcomeValue,
      explorationTrends: { avg: avgExploration, trend }
    };
  }
}