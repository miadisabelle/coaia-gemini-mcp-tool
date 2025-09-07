/**
 * VortexCore - The Constitutional Layer for Generative Agentic Systems
 * 
 * This class implements the "immutable set of basic principles for thinking"
 * that functions as the system's constitution. It provides the governance
 * mechanism that prevents cognitive drift and bridges policy-practice gaps.
 */

import { 
  ValidationContext, 
  CoreValidationResult, 
  validateAgainstCore, 
  generatePrincipleGuidedResponse,
  VORTEX_CORE
} from './principles.js';
import { Logger } from '../utils/logger.js';

/**
 * Self-correction protocol configuration
 */
export interface SelfCorrectionConfig {
  enableActivePause: boolean;
  generateAlternatives: boolean;
  alternativeCount: number;
  evaluationCriteria: string[];
}

/**
 * Tool execution context for constitutional validation
 */
export interface ToolExecutionContext {
  toolName: string;
  args: Record<string, any>;
  input: string;
  userId?: string;
  timestamp: Date;
}

/**
 * Constitutional audit record
 */
export interface ConstitutionalAudit {
  id: string;
  timestamp: Date;
  toolName: string;
  context: ValidationContext;
  validation: CoreValidationResult;
  correctionApplied: boolean;
  finalOutput: string;
}

/**
 * The VortexCore class - Constitutional governance for the agentic system
 */
export class VortexCore {
  private auditLog: ConstitutionalAudit[] = [];
  private config: SelfCorrectionConfig;
  
  constructor(config: Partial<SelfCorrectionConfig> = {}) {
    this.config = {
      enableActivePause: true,
      generateAlternatives: true,
      alternativeCount: 3,
      evaluationCriteria: ['novelty', 'reliability', 'ethical_alignment'],
      ...config
    };
    
    Logger.debug("VortexCore initialized with constitutional principles");
  }
  
  /**
   * Pre-execution validation - Check if tool request aligns with principles
   */
  async preExecutionValidation(context: ToolExecutionContext): Promise<{
    approved: boolean;
    guidance?: string;
    modifiedArgs?: Record<string, any>;
  }> {
    const validationContext: ValidationContext = {
      input: context.input,
      toolName: context.toolName,
      args: context.args,
      metadata: {
        userId: context.userId,
        timestamp: context.timestamp
      }
    };
    
    const validation = validateAgainstCore(validationContext);
    
    // Log pre-execution validation
    Logger.debug(`Pre-execution validation for ${context.toolName}: ${validation.overallCompliant ? 'APPROVED' : 'NEEDS_GUIDANCE'}`);
    
    if (validation.overallCompliant) {
      return { approved: true };
    }
    
    // Provide guidance for principle violations
    const guidance = this.generateExecutionGuidance(validation);
    const modifiedArgs = this.suggestArgumentModifications(context.args, validation);
    
    return {
      approved: false,
      guidance,
      modifiedArgs
    };
  }
  
  /**
   * Post-execution validation with self-correction
   */
  async postExecutionValidation(
    context: ToolExecutionContext,
    rawOutput: string
  ): Promise<string> {
    const validationContext: ValidationContext = {
      input: context.input,
      output: rawOutput,
      toolName: context.toolName,
      args: context.args,
      metadata: {
        userId: context.userId,
        timestamp: context.timestamp
      }
    };
    
    const validation = validateAgainstCore(validationContext);
    
    // Create audit record
    const auditId = this.generateAuditId();
    const audit: ConstitutionalAudit = {
      id: auditId,
      timestamp: new Date(),
      toolName: context.toolName,
      context: validationContext,
      validation,
      correctionApplied: false,
      finalOutput: rawOutput
    };
    
    if (validation.overallCompliant) {
      audit.finalOutput = rawOutput;
      this.auditLog.push(audit);
      return rawOutput;
    }
    
    // Apply self-correction if needed
    let correctedOutput = rawOutput;
    
    if (this.config.enableActivePause) {
      correctedOutput = await this.activePauseCorrection(validationContext, rawOutput);
      audit.correctionApplied = true;
      audit.finalOutput = correctedOutput;
    }
    
    this.auditLog.push(audit);
    
    Logger.debug(`Post-execution correction applied for ${context.toolName}: ${audit.correctionApplied}`);
    
    return correctedOutput;
  }
  
  /**
   * Active Pause mechanism - Generate multiple approaches and select best
   */
  private async activePauseCorrection(
    context: ValidationContext,
    originalOutput: string
  ): Promise<string> {
    if (!this.config.generateAlternatives) {
      return generatePrincipleGuidedResponse(originalOutput, context);
    }
    
    // Generate alternative approaches
    const alternatives = await this.generateAlternativeApproaches(context, originalOutput);
    
    // Evaluate alternatives against criteria
    const evaluatedAlternatives = this.evaluateAlternatives(alternatives, context);
    
    // Select best alternative based on evaluation
    const bestAlternative = this.selectBestAlternative(evaluatedAlternatives);
    
    return bestAlternative.output;
  }
  
  /**
   * Generate multiple alternative approaches
   */
  private async generateAlternativeApproaches(
    context: ValidationContext,
    originalOutput: string
  ): Promise<Array<{ approach: string; output: string; }>> {
    const alternatives = [];
    
    // Original with principle corrections
    alternatives.push({
      approach: "principle_guided",
      output: generatePrincipleGuidedResponse(originalOutput, context)
    });
    
    // Bold but risky approach
    alternatives.push({
      approach: "bold_exploration",
      output: this.generateBoldApproach(context, originalOutput)
    });
    
    // Conservative but reliable approach  
    alternatives.push({
      approach: "conservative_reliable",
      output: this.generateConservativeApproach(context, originalOutput)
    });
    
    return alternatives;
  }
  
  /**
   * Generate a bold, exploratory approach
   */
  private generateBoldApproach(context: ValidationContext, originalOutput: string): string {
    return `${originalOutput}

EXPLORATORY ENHANCEMENT:
This response takes a bold approach by exploring unconventional possibilities:
- Novel connections between concepts that might not be immediately obvious
- Experimental ideas that push beyond conventional wisdom
- Creative synthesis that combines disparate elements in new ways
- Future-oriented thinking that anticipates emerging possibilities

Note: This exploratory enhancement deliberately ventures into less certain territory to stimulate innovative thinking while maintaining core principle alignment.`;
  }
  
  /**
   * Generate a conservative, reliable approach
   */
  private generateConservativeApproach(context: ValidationContext, originalOutput: string): string {
    return `${originalOutput}

CONSERVATIVE ENHANCEMENT:
This response emphasizes reliability and proven approaches:
- Well-established methods with demonstrated track records
- Clear acknowledgment of limitations and uncertainties  
- Step-by-step guidance with predictable outcomes
- Risk mitigation strategies for safe implementation

Note: This conservative enhancement prioritizes safety and predictability while ensuring constitutional principle compliance.`;
  }
  
  /**
   * Evaluate alternatives against configured criteria
   */
  private evaluateAlternatives(
    alternatives: Array<{ approach: string; output: string; }>,
    context: ValidationContext
  ): Array<{ approach: string; output: string; score: number; }> {
    return alternatives.map(alt => {
      let score = 0;
      
      // Evaluate novelty
      if (this.config.evaluationCriteria.includes('novelty')) {
        score += this.evaluateNovelty(alt.output, context) * 0.3;
      }
      
      // Evaluate reliability
      if (this.config.evaluationCriteria.includes('reliability')) {
        score += this.evaluateReliability(alt.output, context) * 0.4;
      }
      
      // Evaluate ethical alignment
      if (this.config.evaluationCriteria.includes('ethical_alignment')) {
        const validation = validateAgainstCore({ ...context, output: alt.output });
        score += validation.confidence * 0.3;
      }
      
      return { ...alt, score };
    });
  }
  
  /**
   * Evaluate novelty of an output
   */
  private evaluateNovelty(output: string, context: ValidationContext): number {
    // Simple novelty scoring based on unique concepts and creative language
    const noveltyKeywords = [
      'innovative', 'creative', 'novel', 'unconventional', 'experimental',
      'breakthrough', 'revolutionary', 'paradigm', 'synthesis', 'emergent'
    ];
    
    const noveltyScore = noveltyKeywords.reduce((score, keyword) => {
      return score + (output.toLowerCase().includes(keyword) ? 0.1 : 0);
    }, 0);
    
    return Math.min(noveltyScore, 1.0);
  }
  
  /**
   * Evaluate reliability of an output
   */
  private evaluateReliability(output: string, context: ValidationContext): number {
    // Simple reliability scoring based on certainty indicators and proven approaches
    const reliabilityKeywords = [
      'established', 'proven', 'tested', 'validated', 'standard',
      'documented', 'reliable', 'consistent', 'predictable', 'stable'
    ];
    
    const reliabilityScore = reliabilityKeywords.reduce((score, keyword) => {
      return score + (output.toLowerCase().includes(keyword) ? 0.1 : 0);
    }, 0);
    
    return Math.min(reliabilityScore, 1.0);
  }
  
  /**
   * Select the best alternative based on scores
   */
  private selectBestAlternative(
    evaluatedAlternatives: Array<{ approach: string; output: string; score: number; }>
  ): { approach: string; output: string; score: number; } {
    return evaluatedAlternatives.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }
  
  /**
   * Generate execution guidance for principle violations
   */
  private generateExecutionGuidance(validation: CoreValidationResult): string {
    const violations = Array.from(validation.principleResults.entries())
      .filter(([_, result]) => !result.compliant)
      .map(([name, result]) => `- ${name}: ${result.details}`);
    
    return `CONSTITUTIONAL GUIDANCE:
The following principles need attention before execution:

${violations.join('\n')}

Please consider these principle-aligned approaches before proceeding.`;
  }
  
  /**
   * Suggest argument modifications to align with principles
   */
  private suggestArgumentModifications(
    args: Record<string, any>,
    validation: CoreValidationResult
  ): Record<string, any> {
    const modifiedArgs = { ...args };
    
    // If creative orientation is violated, modify prompt to be more creative
    if (validation.principleResults.get('creative-orientation')?.compliant === false) {
      if (modifiedArgs.prompt) {
        modifiedArgs.prompt = `What would you like to create? ${modifiedArgs.prompt}`;
      }
    }
    
    return modifiedArgs;
  }
  
  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get constitutional audit history
   */
  getAuditHistory(limit?: number): ConstitutionalAudit[] {
    const sorted = this.auditLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  /**
   * Get principle compliance statistics
   */
  getComplianceStats(): Record<string, { total: number; compliant: number; rate: number; }> {
    const stats: Record<string, { total: number; compliant: number; rate: number; }> = {};
    
    for (const principle of VORTEX_CORE) {
      stats[principle.name] = { total: 0, compliant: 0, rate: 0 };
    }
    
    for (const audit of this.auditLog) {
      for (const [name, result] of audit.validation.principleResults) {
        stats[name].total++;
        if (result.compliant) {
          stats[name].compliant++;
        }
      }
    }
    
    // Calculate compliance rates
    for (const [name, stat] of Object.entries(stats)) {
      stat.rate = stat.total > 0 ? stat.compliant / stat.total : 0;
    }
    
    return stats;
  }
  
  /**
   * Export constitutional audit log for external analysis
   */
  exportAuditLog(): string {
    return JSON.stringify(this.auditLog, null, 2);
  }
}