/**
 * Creative Agent - Specialized in Fritz's creative process and generative ideation
 * 
 * This agent leverages the existing CREATE tool framework but operates autonomously
 * within the polycentric lattice to support creative processes.
 */

import { BaseAgent, AgentTask, AgentResult, AgentCapability } from './BaseAgent.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';
import { Logger } from '../utils/logger.js';

/**
 * Creative phase types from Fritz's framework
 */
type CreativePhase = 'germination' | 'assimilation' | 'completion';

/**
 * Structural tension calculation
 */
interface StructuralTension {
  vision: string;
  currentReality: string;
  tension: number;
  energy: string;
}

/**
 * Creative Agent implementation
 */
export class CreativeAgent extends BaseAgent {
  
  constructor() {
    const capabilities: AgentCapability[] = [
      {
        name: 'creative_process',
        description: 'Guide through Fritz\'s three-phase creative framework',
        costEstimate: 5,
        reliabilityScore: 0.9
      },
      {
        name: 'vision_clarification',
        description: 'Help clarify creative vision and desired outcomes',
        costEstimate: 4,
        reliabilityScore: 0.85
      },
      {
        name: 'structural_tension',
        description: 'Calculate and manage structural tension between vision and reality',
        costEstimate: 3,
        reliabilityScore: 0.8
      },
      {
        name: 'ideation',
        description: 'Generate creative ideas and possibilities',
        costEstimate: 6,
        reliabilityScore: 0.75
      },
      {
        name: 'momentum_building',
        description: 'Support building momentum during assimilation phase',
        costEstimate: 4,
        reliabilityScore: 0.8
      }
    ];
    
    super('creative-001', 'CreativeAgent', capabilities);
    Logger.debug('CreativeAgent initialized with Fritz creative framework capabilities');
  }
  
  /**
   * Execute creative task
   */
  protected async doExecuteTask(task: AgentTask): Promise<AgentResult> {
    Logger.debug(`Creative agent executing: ${task.description}`);
    
    const creativePhase = this.determineCreativePhase(task);
    
    try {
      let result: string;
      
      switch (creativePhase) {
        case 'germination':
          result = await this.performGermination(task);
          break;
        case 'assimilation':
          result = await this.performAssimilation(task);
          break;
        case 'completion':
          result = await this.performCompletion(task);
          break;
        default:
          result = await this.performGeneralCreativeSupport(task);
      }
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output: result,
        confidence: this.calculateCreativeConfidence(creativePhase, task),
        resourcesUsed: ['creative_framework', creativePhase],
        subTasksCreated: this.suggestFollowUpTasks(task, creativePhase)
      };
      
    } catch (error) {
      Logger.error(`Creative agent failed task ${task.id}:`, error);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: `Creative process failed: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
        resourcesUsed: []
      };
    }
  }
  
  /**
   * Determine which creative phase to apply
   */
  private determineCreativePhase(task: AgentTask): CreativePhase {
    const description = task.description.toLowerCase();
    const context = task.context || {};
    
    if (context.creativePhase) {
      return context.creativePhase as CreativePhase;
    }
    
    if (description.includes('vision') || description.includes('idea') || description.includes('start')) {
      return 'germination';
    }
    
    if (description.includes('momentum') || description.includes('develop') || description.includes('build')) {
      return 'assimilation';
    }
    
    if (description.includes('finish') || description.includes('complete') || description.includes('final')) {
      return 'completion';
    }
    
    return 'germination'; // Default to beginning phase
  }
  
  /**
   * Perform germination phase - Initial excitement and vision clarification
   */
  private async performGermination(task: AgentTask): Promise<string> {
    const context = task.context || {};
    
    // Calculate structural tension if we have vision and current reality
    let structuralTension: StructuralTension | null = null;
    if (context.desiredOutcome && context.currentReality) {
      structuralTension = this.calculateStructuralTension(
        String(context.desiredOutcome),
        String(context.currentReality)
      );
    }
    
    const prompt = this.buildGerminationPrompt(task, structuralTension);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatCreativeResult('Germination Phase', result, task, structuralTension);
  }
  
  /**
   * Perform assimilation phase - Building momentum and internalization
   */
  private async performAssimilation(task: AgentTask): Promise<string> {
    const prompt = this.buildAssimilationPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatCreativeResult('Assimilation Phase', result, task);
  }
  
  /**
   * Perform completion phase - Finishing touches and successful conclusion
   */
  private async performCompletion(task: AgentTask): Promise<string> {
    const prompt = this.buildCompletionPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatCreativeResult('Completion Phase', result, task);
  }
  
  /**
   * Perform general creative support
   */
  private async performGeneralCreativeSupport(task: AgentTask): Promise<string> {
    const prompt = this.buildGeneralCreativePrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatCreativeResult('Creative Support', result, task);
  }
  
  /**
   * Calculate structural tension between vision and current reality
   */
  private calculateStructuralTension(vision: string, currentReality: string): StructuralTension {
    const visionClarity = vision.length > 50 && !vision.toLowerCase().includes('problem') ? 8 : 5;
    const realityClarity = currentReality.length > 30 ? 7 : 4;
    const tensionStrength = Math.min(visionClarity, realityClarity);
    
    return {
      vision,
      currentReality,
      tension: tensionStrength,
      energy: tensionStrength > 6 
        ? "Strong creative energy - tension is clear and motivating"
        : "Moderate energy - vision or current reality could be clearer"
    };
  }
  
  /**
   * Build germination phase prompt
   */
  private buildGerminationPrompt(task: AgentTask, structuralTension?: StructuralTension | null): string {
    const context = task.context || {};
    
    let prompt = `As a Creative Agent specializing in Robert Fritz's creative framework, I'm supporting the GERMINATION phase.\n\n`;
    prompt += `This is the exciting beginning phase of creation, characterized by initial excitement, vision clarification, and balanced planning/action.\n\n`;
    
    prompt += `Task: ${task.description}\n\n`;
    
    if (structuralTension) {
      prompt += `## Structural Tension Analysis\n`;
      prompt += `**Vision:** ${structuralTension.vision}\n`;
      prompt += `**Current Reality:** ${structuralTension.currentReality}\n`;
      prompt += `**Tension Strength:** ${structuralTension.tension}/10\n`;
      prompt += `**Creative Energy:** ${structuralTension.energy}\n\n`;
    }
    
    prompt += `Please support the germination phase by:\n`;
    prompt += `1. **Vision Clarification** - Help refine what they want to create (not problems to solve)\n`;
    prompt += `2. **Possibility Exploration** - Explore exciting possibilities and potential\n`;
    prompt += `3. **Energy Activation** - Connect with the motivating force of the vision\n`;
    prompt += `4. **Initial Steps** - Suggest concrete first steps that build momentum\n\n`;
    
    if (context.timeframe) {
      prompt += `Timeframe consideration: ${context.timeframe}\n`;
    }
    
    if (context.resources) {
      prompt += `Available resources: ${context.resources}\n`;
    }
    
    prompt += `\nConstitutional principles: Focus on creative orientation - what they want to create, not problems to solve. Generate possibilities rather than eliminate obstacles.`;
    
    return prompt;
  }
  
  /**
   * Build assimilation phase prompt
   */
  private buildAssimilationPrompt(task: AgentTask): string {
    let prompt = `As a Creative Agent, I'm supporting the ASSIMILATION phase of the creative process.\n\n`;
    prompt += `This phase focuses on structural tension internalization, momentum building, and natural movement toward the vision.\n\n`;
    
    prompt += `Task: ${task.description}\n\n`;
    
    prompt += `Please support the assimilation phase by:\n`;
    prompt += `1. **Momentum Building** - Identify and leverage current momentum\n`;
    prompt += `2. **Resource Mobilization** - Help organize and deploy available resources\n`;
    prompt += `3. **Natural Movement** - Support the natural tendency toward the vision\n`;
    prompt += `4. **Tension Management** - Maintain healthy creative tension without forcing\n`;
    prompt += `5. **Progress Recognition** - Acknowledge progress and emerging capabilities\n\n`;
    
    prompt += `Constitutional guidance: Enhance capabilities rather than just eliminate obstacles. Treat challenges as navigational cues for improvement.`;
    
    return prompt;
  }
  
  /**
   * Build completion phase prompt
   */
  private buildCompletionPrompt(task: AgentTask): string {
    let prompt = `As a Creative Agent, I'm supporting the COMPLETION phase of the creative process.\n\n`;
    prompt += `This phase focuses on finishing touches, avoiding unnecessary complexity, and successful conclusion.\n\n`;
    
    prompt += `Task: ${task.description}\n\n`;
    
    prompt += `Please support the completion phase by:\n`;
    prompt += `1. **Finishing Excellence** - Focus on polishing and refining the final outcome\n`;
    prompt += `2. **Complexity Avoidance** - Resist adding unnecessary features or complications\n`;
    prompt += `3. **Completion Resistance Management** - Address any hesitation to finish\n`;
    prompt += `4. **Success Recognition** - Acknowledge what has been created and achieved\n`;
    prompt += `5. **Integration Support** - Help integrate the completed creation into their life/work\n\n`;
    
    prompt += `Constitutional principles: Focus on capability enhancement and successful conclusion rather than perfection or problem elimination.`;
    
    return prompt;
  }
  
  /**
   * Build general creative prompt
   */
  private buildGeneralCreativePrompt(task: AgentTask): string {
    let prompt = `As a Creative Agent, I'm providing general creative process support.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    const context = task.context || {};
    if (Object.keys(context).length > 0) {
      prompt += `Context: ${JSON.stringify(context, null, 2)}\n\n`;
    }
    
    prompt += `Please provide creative support by:\n`;
    prompt += `1. **Creative Orientation** - Frame this in terms of what to create rather than problems to solve\n`;
    prompt += `2. **Possibility Generation** - Explore creative possibilities and potential\n`;
    prompt += `3. **Vision Support** - Help clarify or strengthen their creative vision\n`;
    prompt += `4. **Next Steps** - Suggest concrete next steps that maintain creative momentum\n\n`;
    
    prompt += `Constitutional framework: Focus on generative creation, acknowledge uncertainty rather than fabricating certainty, and treat any challenges as creative navigation cues.`;
    
    return prompt;
  }
  
  /**
   * Format creative result with agent branding and structural tension
   */
  private formatCreativeResult(
    phase: string, 
    result: string, 
    task: AgentTask, 
    structuralTension?: StructuralTension | null
  ): string {
    let formatted = `# ${phase} - Creative Process Support\n\n`;
    formatted += `**Agent:** Creative Agent (${this.id})\n`;
    formatted += `**Framework:** Robert Fritz's Creative Orientation\n`;
    formatted += `**Task:** ${task.description}\n\n`;
    
    if (structuralTension) {
      formatted += `## Structural Tension\n`;
      formatted += `**Tension Strength:** ${structuralTension.tension}/10\n`;
      formatted += `**Creative Energy:** ${structuralTension.energy}\n\n`;
    }
    
    formatted += `---\n\n`;
    formatted += result;
    formatted += `\n\n---\n\n`;
    formatted += `*This creative support was provided by the Creative Agent using Robert Fritz's proven framework, `;
    formatted += `maintaining constitutional focus on generative creation rather than problem-solving.*`;
    
    return formatted;
  }
  
  /**
   * Calculate confidence based on creative phase and task alignment
   */
  private calculateCreativeConfidence(phase: CreativePhase, task: AgentTask): number {
    let baseConfidence = 0.8; // Creative agent has high confidence in its domain
    
    const description = task.description.toLowerCase();
    const hasCreativeLanguage = description.includes('create') || description.includes('vision') || description.includes('design');
    
    if (hasCreativeLanguage) {
      baseConfidence += 0.1;
    }
    
    // Problem-focused language reduces confidence (constitutional principle)
    const hasProblemLanguage = description.includes('problem') || description.includes('fix') || description.includes('solve');
    if (hasProblemLanguage) {
      baseConfidence -= 0.1;
    }
    
    return Math.min(Math.max(baseConfidence, 0.1), 0.95);
  }
  
  /**
   * Suggest follow-up tasks based on creative phase
   */
  private suggestFollowUpTasks(task: AgentTask, phase: CreativePhase): AgentTask[] | undefined {
    const followUpTasks: AgentTask[] = [];
    
    switch (phase) {
      case 'germination':
        // Suggest moving to assimilation if vision is clear
        followUpTasks.push({
          id: `${task.id}_assimilation`,
          description: 'Build momentum and move into assimilation phase',
          priority: task.priority,
          requiredCapabilities: ['creative_process', 'momentum_building'],
          context: { ...task.context, creativePhase: 'assimilation' },
          parentTaskId: task.id
        });
        break;
        
      case 'assimilation':
        // Suggest completion when momentum is strong
        followUpTasks.push({
          id: `${task.id}_completion`,
          description: 'Move toward completion and finishing touches',
          priority: task.priority,
          requiredCapabilities: ['creative_process'],
          context: { ...task.context, creativePhase: 'completion' },
          parentTaskId: task.id
        });
        break;
    }
    
    return followUpTasks.length > 0 ? followUpTasks : undefined;
  }
}