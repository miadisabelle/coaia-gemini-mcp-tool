/**
 * Discovery Agent - Specialized in novelty search and alternative exploration
 * 
 * This agent implements the "exploration" aspect of the resilient connection,
 * actively seeking novel solutions and creative alternatives while maintaining
 * alignment with core principles.
 */

import { BaseAgent, AgentTask, AgentResult, AgentCapability } from './BaseAgent.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';
import { Logger } from '../utils/logger.js';

/**
 * Discovery strategy types
 */
type DiscoveryStrategy = 'lateral_thinking' | 'analogical_reasoning' | 'boundary_exploration' | 'synthesis_discovery' | 'constraint_liberation';

/**
 * Discovery result with novelty score
 */
interface DiscoveryResult {
  approach: string;
  noveltyScore: number; // 0-1 scale
  feasibilityScore: number; // 0-1 scale
  content: string;
}

/**
 * Discovery Agent implementation
 */
export class DiscoveryAgent extends BaseAgent {
  
  constructor() {
    const capabilities: AgentCapability[] = [
      {
        name: 'novelty_search',
        description: 'Actively search for novel and unconventional solutions',
        costEstimate: 7,
        reliabilityScore: 0.7
      },
      {
        name: 'lateral_thinking',
        description: 'Apply lateral thinking techniques for creative problem-solving',
        costEstimate: 6,
        reliabilityScore: 0.75
      },
      {
        name: 'analogical_reasoning',
        description: 'Find insights through analogies and cross-domain connections',
        costEstimate: 5,
        reliabilityScore: 0.8
      },
      {
        name: 'boundary_exploration',
        description: 'Explore boundaries and edge cases for new possibilities',
        costEstimate: 8,
        reliabilityScore: 0.65
      },
      {
        name: 'synthesis_discovery',
        description: 'Discover new insights through creative synthesis',
        costEstimate: 6,
        reliabilityScore: 0.7
      },
      {
        name: 'constraint_liberation',
        description: 'Challenge assumptions and conventional constraints',
        costEstimate: 7,
        reliabilityScore: 0.6
      }
    ];
    
    super('discovery-001', 'DiscoveryAgent', capabilities);
    Logger.debug('DiscoveryAgent initialized with novelty search capabilities');
  }
  
  /**
   * Execute discovery task
   */
  protected async doExecuteTask(task: AgentTask): Promise<AgentResult> {
    Logger.debug(`Discovery agent executing: ${task.description}`);
    
    try {
      // Apply multiple discovery strategies in parallel
      const strategies = this.selectDiscoveryStrategies(task);
      const discoveryResults = await this.applyDiscoveryStrategies(task, strategies);
      
      // Synthesize and rank discoveries
      const synthesizedResult = this.synthesizeDiscoveries(task, discoveryResults);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output: synthesizedResult,
        confidence: this.calculateDiscoveryConfidence(discoveryResults),
        resourcesUsed: ['novelty_search', ...strategies],
        collaborationNeeded: this.identifyCollaborationOpportunities(discoveryResults)
      };
      
    } catch (error) {
      Logger.error(`Discovery agent failed task ${task.id}:`, error);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: `Discovery process failed: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
        resourcesUsed: []
      };
    }
  }
  
  /**
   * Select appropriate discovery strategies for the task
   */
  private selectDiscoveryStrategies(task: AgentTask): DiscoveryStrategy[] {
    const description = task.description.toLowerCase();
    const context = task.context || {};
    const strategies: DiscoveryStrategy[] = [];
    
    // Always include lateral thinking for creative exploration
    strategies.push('lateral_thinking');
    
    // Add specific strategies based on task characteristics
    if (description.includes('innovate') || description.includes('creative') || description.includes('new')) {
      strategies.push('boundary_exploration');
    }
    
    if (description.includes('connect') || description.includes('relate') || description.includes('similar')) {
      strategies.push('analogical_reasoning');
    }
    
    if (description.includes('combine') || description.includes('merge') || description.includes('integrate')) {
      strategies.push('synthesis_discovery');
    }
    
    if (description.includes('limitation') || description.includes('constraint') || description.includes('impossible')) {
      strategies.push('constraint_liberation');
    }
    
    // If no specific strategies, add synthesis as default exploration
    if (strategies.length === 1) {
      strategies.push('synthesis_discovery');
    }
    
    return strategies;
  }
  
  /**
   * Apply discovery strategies to generate novel insights
   */
  private async applyDiscoveryStrategies(task: AgentTask, strategies: DiscoveryStrategy[]): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    
    for (const strategy of strategies) {
      try {
        const result = await this.applyStrategy(task, strategy);
        results.push(result);
      } catch (error) {
        Logger.debug(`Discovery strategy ${strategy} failed: ${error}`);
      }
    }
    
    return results;
  }
  
  /**
   * Apply a specific discovery strategy
   */
  private async applyStrategy(task: AgentTask, strategy: DiscoveryStrategy): Promise<DiscoveryResult> {
    const prompt = this.buildStrategyPrompt(task, strategy);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return {
      approach: strategy,
      noveltyScore: this.calculateNoveltyScore(result, strategy),
      feasibilityScore: this.calculateFeasibilityScore(result, strategy),
      content: result
    };
  }
  
  /**
   * Build prompt for specific discovery strategy
   */
  private buildStrategyPrompt(task: AgentTask, strategy: DiscoveryStrategy): string {
    let prompt = `As a Discovery Agent specializing in novelty search, I'm applying ${strategy.replace('_', ' ')} to explore new possibilities.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    switch (strategy) {
      case 'lateral_thinking':
        prompt += this.buildLateralThinkingPrompt(task);
        break;
      case 'analogical_reasoning':
        prompt += this.buildAnalogicalReasoningPrompt(task);
        break;
      case 'boundary_exploration':
        prompt += this.buildBoundaryExplorationPrompt(task);
        break;
      case 'synthesis_discovery':
        prompt += this.buildSynthesisDiscoveryPrompt(task);
        break;
      case 'constraint_liberation':
        prompt += this.buildConstraintLiberationPrompt(task);
        break;
    }
    
    prompt += `\n\nConstitutional principles: Focus on generative possibilities, acknowledge uncertainty, and treat constraints as navigational cues for creative exploration.`;
    
    return prompt;
  }
  
  /**
   * Build lateral thinking prompt
   */
  private buildLateralThinkingPrompt(task: AgentTask): string {
    return `Apply lateral thinking techniques to discover unexpected approaches:

1. **Random Word Association** - Connect this task to completely unrelated concepts
2. **Assumption Reversal** - What if we reversed common assumptions about this?
3. **Alternative Purposes** - What other purposes could this serve?
4. **Provocative Questions** - Ask "What if..." questions that challenge conventional thinking
5. **Metaphorical Exploration** - How is this like something completely different?

Focus on generating ideas that are genuinely different from conventional approaches.`;
  }
  
  /**
   * Build analogical reasoning prompt
   */
  private buildAnalogicalReasoningPrompt(task: AgentTask): string {
    return `Use analogical reasoning to discover insights from other domains:

1. **Nature Analogies** - How does nature solve similar challenges?
2. **Historical Parallels** - What historical situations parallel this?
3. **Cross-Industry Learning** - How do other industries handle similar situations?
4. **Biological Systems** - What biological processes could inspire solutions?
5. **Physical Phenomena** - What physical laws or phenomena offer insights?

Look for deep structural similarities rather than surface-level comparisons.`;
  }
  
  /**
   * Build boundary exploration prompt
   */
  private buildBoundaryExplorationPrompt(task: AgentTask): string {
    return `Explore boundaries and edge cases for novel possibilities:

1. **Scale Extremes** - What happens at very large or very small scales?
2. **Time Boundaries** - What about very fast or very slow approaches?
3. **Resource Extremes** - What with unlimited resources? What with almost none?
4. **User Edge Cases** - What about unusual or extreme user scenarios?
5. **Technical Boundaries** - What becomes possible at the edge of current technology?

Push beyond conventional boundaries to discover new possibility spaces.`;
  }
  
  /**
   * Build synthesis discovery prompt
   */
  private buildSynthesisDiscoveryPrompt(task: AgentTask): string {
    return `Discover new insights through creative synthesis:

1. **Concept Fusion** - Combine seemingly unrelated concepts in novel ways
2. **Method Hybridization** - Merge different approaches or methodologies  
3. **Perspective Integration** - Synthesize multiple viewpoints into new understanding
4. **Tool Combination** - Combine existing tools in unexpected ways
5. **Pattern Synthesis** - Find new patterns by combining existing ones

Focus on creating genuinely new combinations that offer emergent properties.`;
  }
  
  /**
   * Build constraint liberation prompt
   */
  private buildConstraintLiberationPrompt(task: AgentTask): string {
    return `Challenge assumptions and liberate thinking from conventional constraints:

1. **Assumption Identification** - What assumptions are we making?
2. **Constraint Questioning** - Which constraints are real vs. assumed?
3. **Rule Breaking** - What if conventional rules didn't apply?
4. **Resource Reimagining** - What if we redefined available resources?
5. **Context Shifting** - What if this occurred in a completely different context?

Look for artificial limitations that can be transcended for breakthrough thinking.`;
  }
  
  /**
   * Synthesize discoveries into coherent output
   */
  private synthesizeDiscoveries(task: AgentTask, discoveries: DiscoveryResult[]): string {
    if (discoveries.length === 0) {
      return `Discovery Agent was unable to generate novel insights for: ${task.description}`;
    }
    
    // Sort by combined novelty and feasibility score
    const rankedDiscoveries = discoveries.sort((a, b) => {
      const scoreA = (a.noveltyScore * 0.6) + (a.feasibilityScore * 0.4);
      const scoreB = (b.noveltyScore * 0.6) + (b.feasibilityScore * 0.4);
      return scoreB - scoreA;
    });
    
    let result = `# Discovery Agent - Novel Exploration Results\n\n`;
    result += `**Agent:** Discovery Agent (${this.id})\n`;
    result += `**Task:** ${task.description}\n`;
    result += `**Strategies Applied:** ${discoveries.map(d => d.approach).join(', ')}\n\n`;
    
    result += `## Ranked Discovery Results\n\n`;
    
    for (let i = 0; i < rankedDiscoveries.length; i++) {
      const discovery = rankedDiscoveries[i];
      const score = (discovery.noveltyScore * 0.6) + (discovery.feasibilityScore * 0.4);
      
      result += `### ${i + 1}. ${discovery.approach.replace('_', ' ').toUpperCase()} Approach\n`;
      result += `**Novelty Score:** ${(discovery.noveltyScore * 100).toFixed(1)}%\n`;
      result += `**Feasibility Score:** ${(discovery.feasibilityScore * 100).toFixed(1)}%\n`;
      result += `**Combined Score:** ${(score * 100).toFixed(1)}%\n\n`;
      result += `${discovery.content}\n\n`;
      result += `---\n\n`;
    }
    
    // Add synthesis conclusion
    result += `## Discovery Synthesis\n\n`;
    result += `The exploration revealed ${discoveries.length} distinct approaches, with novelty scores ranging from `;
    result += `${(Math.min(...discoveries.map(d => d.noveltyScore)) * 100).toFixed(1)}% to `;
    result += `${(Math.max(...discoveries.map(d => d.noveltyScore)) * 100).toFixed(1)}%. `;
    
    const avgNovelty = discoveries.reduce((sum, d) => sum + d.noveltyScore, 0) / discoveries.length;
    result += `Average novelty: ${(avgNovelty * 100).toFixed(1)}%.\n\n`;
    
    result += `These discoveries represent genuine exploration beyond conventional approaches, `;
    result += `maintaining constitutional compliance while pushing creative boundaries. `;
    result += `Consider integrating the highest-scoring approaches or combining elements from multiple discoveries.`;
    
    result += `\n\n*This discovery process was conducted by the Discovery Agent as part of the polycentric agentic lattice, `;
    result += `specifically designed to explore novel possibilities while maintaining constitutional alignment.*`;
    
    return result;
  }
  
  /**
   * Calculate novelty score for a discovery result
   */
  private calculateNoveltyScore(result: string, strategy: DiscoveryStrategy): number {
    let noveltyScore = 0.5; // Base score
    
    // Strategy-specific scoring
    const strategyMultipliers = {
      'lateral_thinking': 0.8,
      'analogical_reasoning': 0.7,
      'boundary_exploration': 0.9,
      'synthesis_discovery': 0.8,
      'constraint_liberation': 0.9
    };
    
    noveltyScore = strategyMultipliers[strategy] || 0.5;
    
    // Content-based adjustments
    const noveltyKeywords = [
      'unconventional', 'unexpected', 'innovative', 'breakthrough', 'paradigm',
      'revolutionary', 'novel', 'unprecedented', 'surprising', 'creative'
    ];
    
    const keywordCount = noveltyKeywords.reduce((count, keyword) => {
      return count + (result.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    noveltyScore += (keywordCount * 0.02); // Small boost per keyword
    
    return Math.min(noveltyScore, 1.0);
  }
  
  /**
   * Calculate feasibility score for a discovery result
   */
  private calculateFeasibilityScore(result: string, strategy: DiscoveryStrategy): number {
    let feasibilityScore = 0.6; // Base score
    
    // Strategy-specific feasibility
    const strategyFeasibility = {
      'lateral_thinking': 0.6,
      'analogical_reasoning': 0.8,
      'boundary_exploration': 0.4,
      'synthesis_discovery': 0.7,
      'constraint_liberation': 0.5
    };
    
    feasibilityScore = strategyFeasibility[strategy] || 0.6;
    
    // Content-based adjustments
    const feasibilityKeywords = [
      'practical', 'achievable', 'realistic', 'implementable', 'doable',
      'concrete', 'actionable', 'step-by-step', 'gradual', 'incremental'
    ];
    
    const keywordCount = feasibilityKeywords.reduce((count, keyword) => {
      return count + (result.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    feasibilityScore += (keywordCount * 0.03); // Boost per feasibility keyword
    
    return Math.min(feasibilityScore, 1.0);
  }
  
  /**
   * Calculate overall discovery confidence
   */
  private calculateDiscoveryConfidence(discoveries: DiscoveryResult[]): number {
    if (discoveries.length === 0) return 0.1;
    
    const avgNovelty = discoveries.reduce((sum, d) => sum + d.noveltyScore, 0) / discoveries.length;
    const avgFeasibility = discoveries.reduce((sum, d) => sum + d.feasibilityScore, 0) / discoveries.length;
    
    // Discovery confidence balances novelty with feasibility
    const confidence = (avgNovelty * 0.7) + (avgFeasibility * 0.3);
    
    // Bonus for multiple successful discoveries
    const diversityBonus = Math.min(discoveries.length * 0.05, 0.2);
    
    return Math.min(confidence + diversityBonus, 0.9);
  }
  
  /**
   * Identify collaboration opportunities based on discoveries
   */
  private identifyCollaborationOpportunities(discoveries: DiscoveryResult[]): { requiredCapabilities: string[]; suggestedAgents: string[]; } | undefined {
    const highNoveltyDiscoveries = discoveries.filter(d => d.noveltyScore > 0.7);
    
    if (highNoveltyDiscoveries.length > 0) {
      return {
        requiredCapabilities: ['analysis', 'creative_process', 'feasibility_assessment'],
        suggestedAgents: ['analysis-001', 'creative-001']
      };
    }
    
    return undefined;
  }
}