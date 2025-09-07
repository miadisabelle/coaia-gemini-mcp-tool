/**
 * Analysis Agent - Specialized in deep file and code analysis using Gemini
 * 
 * This agent leverages the existing Gemini CLI integration to perform
 * sophisticated analysis tasks while maintaining constitutional compliance.
 */

import { BaseAgent, AgentTask, AgentResult, AgentCapability } from './BaseAgent.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';
import { Logger } from '../utils/logger.js';

/**
 * Analysis Agent implementation
 */
export class AnalysisAgent extends BaseAgent {
  
  constructor() {
    const capabilities: AgentCapability[] = [
      {
        name: 'file_analysis',
        description: 'Analyze files and codebases using @ syntax',
        costEstimate: 6,
        reliabilityScore: 0.9
      },
      {
        name: 'gemini_analysis',
        description: 'Deep analysis using Gemini large context window',
        costEstimate: 7,
        reliabilityScore: 0.85
      },
      {
        name: 'code_understanding',
        description: 'Understand and explain code structure and patterns',
        costEstimate: 5,
        reliabilityScore: 0.8
      },
      {
        name: 'pattern_recognition',
        description: 'Identify patterns and relationships in data/code',
        costEstimate: 6,
        reliabilityScore: 0.75
      },
      {
        name: 'sandbox_execution',
        description: 'Safe code execution and testing',
        costEstimate: 8,
        reliabilityScore: 0.7
      }
    ];
    
    super('analysis-001', 'AnalysisAgent', capabilities);
    Logger.debug('AnalysisAgent initialized with Gemini analysis capabilities');
  }
  
  /**
   * Execute analysis task
   */
  protected async doExecuteTask(task: AgentTask): Promise<AgentResult> {
    Logger.debug(`Analysis agent executing: ${task.description}`);
    
    const taskType = this.determineAnalysisType(task);
    
    try {
      let result: string;
      
      switch (taskType) {
        case 'file_analysis':
          result = await this.performFileAnalysis(task);
          break;
        case 'code_analysis':
          result = await this.performCodeAnalysis(task);
          break;
        case 'pattern_analysis':
          result = await this.performPatternAnalysis(task);
          break;
        case 'sandbox_analysis':
          result = await this.performSandboxAnalysis(task);
          break;
        default:
          result = await this.performGeneralAnalysis(task);
      }
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output: result,
        confidence: this.calculateConfidence(taskType, result),
        resourcesUsed: ['gemini_cli', taskType]
      };
      
    } catch (error) {
      Logger.error(`Analysis agent failed task ${task.id}:`, error);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
        resourcesUsed: []
      };
    }
  }
  
  /**
   * Determine the type of analysis needed
   */
  private determineAnalysisType(task: AgentTask): string {
    const description = task.description.toLowerCase();
    const context = task.context || {};
    
    if (description.includes('@') || context.files) {
      return 'file_analysis';
    }
    
    if (description.includes('code') || description.includes('function') || description.includes('class')) {
      return 'code_analysis';
    }
    
    if (description.includes('pattern') || description.includes('relationship') || description.includes('structure')) {
      return 'pattern_analysis';
    }
    
    if (description.includes('test') || description.includes('execute') || context.sandbox) {
      return 'sandbox_analysis';
    }
    
    return 'general_analysis';
  }
  
  /**
   * Perform file analysis using @ syntax
   */
  private async performFileAnalysis(task: AgentTask): Promise<string> {
    const prompt = this.buildFileAnalysisPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatAnalysisResult('File Analysis', result, task);
  }
  
  /**
   * Perform code analysis
   */
  private async performCodeAnalysis(task: AgentTask): Promise<string> {
    const prompt = this.buildCodeAnalysisPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatAnalysisResult('Code Analysis', result, task);
  }
  
  /**
   * Perform pattern analysis
   */
  private async performPatternAnalysis(task: AgentTask): Promise<string> {
    const prompt = this.buildPatternAnalysisPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatAnalysisResult('Pattern Analysis', result, task);
  }
  
  /**
   * Perform sandbox analysis with safe execution
   */
  private async performSandboxAnalysis(task: AgentTask): Promise<string> {
    const prompt = this.buildSandboxAnalysisPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      true, // Enable sandbox mode
      false
    );
    
    return this.formatAnalysisResult('Sandbox Analysis', result, task);
  }
  
  /**
   * Perform general analysis
   */
  private async performGeneralAnalysis(task: AgentTask): Promise<string> {
    const prompt = this.buildGeneralAnalysisPrompt(task);
    
    const result = await executeGeminiCLI(
      prompt,
      'gemini-2.5-pro',
      false,
      false
    );
    
    return this.formatAnalysisResult('General Analysis', result, task);
  }
  
  /**
   * Build file analysis prompt
   */
  private buildFileAnalysisPrompt(task: AgentTask): string {
    const basePrompt = task.description;
    const context = task.context || {};
    
    let prompt = `As an Analysis Agent in a constitutional agentic system, I need to perform deep file analysis.\n\n`;
    prompt += `Task: ${basePrompt}\n\n`;
    
    if (context.files) {
      prompt += `Files to analyze: ${Array.isArray(context.files) ? context.files.join(', ') : context.files}\n\n`;
    }
    
    prompt += `Please provide:\n`;
    prompt += `1. Structural analysis of the content\n`;
    prompt += `2. Key patterns and relationships identified\n`;
    prompt += `3. Potential areas for enhancement or attention\n`;
    prompt += `4. Recommendations based on the analysis\n\n`;
    prompt += `Constitutional principle: Focus on capability enhancement rather than just problem identification.`;
    
    return prompt;
  }
  
  /**
   * Build code analysis prompt
   */
  private buildCodeAnalysisPrompt(task: AgentTask): string {
    let prompt = `As an Analysis Agent, I need to perform comprehensive code analysis.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    prompt += `Please analyze:\n`;
    prompt += `1. Code architecture and design patterns\n`;
    prompt += `2. Functionality and purpose\n`;
    prompt += `3. Code quality and best practices\n`;
    prompt += `4. Potential improvements and enhancements\n`;
    prompt += `5. Dependencies and relationships\n\n`;
    prompt += `Constitutional guidance: Treat any issues as navigational cues for improvement, not problems to eliminate.`;
    
    return prompt;
  }
  
  /**
   * Build pattern analysis prompt
   */
  private buildPatternAnalysisPrompt(task: AgentTask): string {
    let prompt = `As an Analysis Agent specializing in pattern recognition, I need to identify patterns and relationships.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    prompt += `Please identify:\n`;
    prompt += `1. Structural patterns and recurring themes\n`;
    prompt += `2. Relationships between different elements\n`;
    prompt += `3. Emergent properties and behaviors\n`;
    prompt += `4. Opportunities for pattern-based improvements\n\n`;
    prompt += `Constitutional principle: Focus on what patterns reveal about potential, not just current state.`;
    
    return prompt;
  }
  
  /**
   * Build sandbox analysis prompt
   */
  private buildSandboxAnalysisPrompt(task: AgentTask): string {
    let prompt = `As an Analysis Agent with sandbox capabilities, I need to safely analyze and test code.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    prompt += `Please:\n`;
    prompt += `1. Safely execute or test the code in the sandbox\n`;
    prompt += `2. Analyze the execution results\n`;
    prompt += `3. Identify behavior patterns and potential issues\n`;
    prompt += `4. Suggest improvements based on execution analysis\n\n`;
    prompt += `Safety note: Use sandbox mode to prevent any harmful effects.\n`;
    prompt += `Constitutional guidance: Errors during execution are navigational cues for enhancement.`;
    
    return prompt;
  }
  
  /**
   * Build general analysis prompt
   */
  private buildGeneralAnalysisPrompt(task: AgentTask): string {
    let prompt = `As an Analysis Agent, I need to perform comprehensive analysis.\n\n`;
    prompt += `Task: ${task.description}\n\n`;
    
    const context = task.context || {};
    if (Object.keys(context).length > 0) {
      prompt += `Context: ${JSON.stringify(context, null, 2)}\n\n`;
    }
    
    prompt += `Please provide thorough analysis considering:\n`;
    prompt += `1. Core concepts and themes\n`;
    prompt += `2. Relationships and dependencies\n`;
    prompt += `3. Potential areas for development\n`;
    prompt += `4. Creative possibilities and opportunities\n\n`;
    prompt += `Constitutional principles: Focus on generative possibilities and capability enhancement.`;
    
    return prompt;
  }
  
  /**
   * Format analysis result with agent branding
   */
  private formatAnalysisResult(analysisType: string, result: string, task: AgentTask): string {
    let formatted = `# ${analysisType} Report\n\n`;
    formatted += `**Agent:** Analysis Agent (${this.id})\n`;
    formatted += `**Task:** ${task.description}\n`;
    formatted += `**Analysis Type:** ${analysisType}\n\n`;
    formatted += `---\n\n`;
    formatted += result;
    formatted += `\n\n---\n\n`;
    formatted += `*This analysis was performed by the Analysis Agent as part of the polycentric agentic lattice, `;
    formatted += `maintaining constitutional compliance and focusing on generative capabilities.*`;
    
    return formatted;
  }
  
  /**
   * Calculate confidence based on analysis type and result quality
   */
  private calculateConfidence(analysisType: string, result: string): number {
    let baseConfidence = 0.7;
    
    // Adjust based on analysis type
    switch (analysisType) {
      case 'file_analysis':
        baseConfidence = 0.85; // High confidence for file analysis
        break;
      case 'code_analysis':
        baseConfidence = 0.8;
        break;
      case 'sandbox_analysis':
        baseConfidence = 0.75; // Slightly lower due to execution complexity
        break;
      case 'pattern_analysis':
        baseConfidence = 0.7;
        break;
      default:
        baseConfidence = 0.65;
    }
    
    // Adjust based on result quality indicators
    if (result.length > 500) {
      baseConfidence += 0.05; // More detailed results
    }
    
    if (result.includes('analysis') && result.includes('recommendation')) {
      baseConfidence += 0.05; // Structured output
    }
    
    if (result.toLowerCase().includes('uncertain') || result.toLowerCase().includes('unclear')) {
      baseConfidence += 0.05; // Acknowledges uncertainty (constitutional principle)
    }
    
    return Math.min(baseConfidence, 0.95);
  }
}