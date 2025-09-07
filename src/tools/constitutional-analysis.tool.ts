import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { getVortexCore, VORTEX_CORE } from '../core/index.js';

const constitutionalAnalysisSchema = z.object({
  query: z.string().min(1).describe("What would you like me to analyze with constitutional principles in mind?"),
  showAudit: z.boolean().default(false).describe("Show constitutional audit trail"),
  showStats: z.boolean().default(false).describe("Show principle compliance statistics")
});

/**
 * Constitutional Analysis Tool
 * 
 * This tool demonstrates the VortexCore constitutional principles in action.
 * It provides transparency into how the system validates and corrects
 * responses according to the four core principles.
 */
export const constitutionalAnalysisTool: UnifiedTool = {
  name: "constitutional-analysis",
  description: "Analyze requests and responses through constitutional principles lens. Demonstrates VortexCore governance with transparency into principle validation, corrections, and compliance statistics.",
  zodSchema: constitutionalAnalysisSchema,
  category: 'utility',
  
  prompt: {
    description: "Analyze content through constitutional principles with full transparency",
    arguments: [
      {
        name: "query",
        description: "What to analyze with constitutional principles",
        required: true
      },
      {
        name: "showAudit",
        description: "Include constitutional audit trail in response",
        required: false
      },
      {
        name: "showStats", 
        description: "Include principle compliance statistics",
        required: false
      }
    ]
  },
  
  async execute(args, onProgress) {
    const { query, showAudit, showStats } = args;
    const vortexCore = getVortexCore();
    
    onProgress?.("🏛️ Analyzing through constitutional principles...");
    
    // Ensure query is a string
    const queryString = String(query);
    
    // Simulate a response to the query
    let simulatedResponse = await generateSimulatedResponse(queryString);
    
    onProgress?.("⚖️ Applying constitutional validation...");
    
    // Create validation context
    const validationContext = {
      input: queryString,
      output: simulatedResponse,
      toolName: 'constitutional-analysis',
      args: args as Record<string, any>
    };
    
    // Validate against constitutional principles
    const { validateAgainstCore } = await import('../core/principles.js');
    const validation = validateAgainstCore(validationContext);
    
    let result = `# Constitutional Analysis\n\n`;
    result += `## Query Analysis\n**Query:** ${queryString}\n\n`;
    
    // Show principle-by-principle analysis
    result += `## Constitutional Principle Analysis\n\n`;
    
    for (const principle of VORTEX_CORE) {
      const principleResult = validation.principleResults.get(principle.name);
      if (principleResult) {
        const status = principleResult.compliant ? "✅ COMPLIANT" : "⚠️ NEEDS ATTENTION";
        const confidence = (principleResult.confidence * 100).toFixed(1);
        
        result += `### ${principle.name.toUpperCase()}\n`;
        result += `**Status:** ${status} (${confidence}% confidence)\n`;
        result += `**Description:** ${principle.description}\n`;
        result += `**Analysis:** ${principleResult.details}\n`;
        
        if (principleResult.correctionSuggested) {
          result += `**Correction Suggested:** ${principleResult.correctionSuggested}\n`;
        }
        result += `\n`;
      }
    }
    
    // Overall assessment
    result += `## Overall Constitutional Assessment\n`;
    result += `**Overall Compliance:** ${validation.overallCompliant ? "✅ APPROVED" : "⚠️ CORRECTIONS NEEDED"}\n`;
    result += `**Average Confidence:** ${(validation.confidence * 100).toFixed(1)}%\n\n`;
    
    if (!validation.overallCompliant) {
      result += `**Constitutional Corrections Applied:**\n`;
      for (const correction of validation.corrections) {
        result += `\n${correction}\n`;
      }
    }
    
    // Show compliance statistics if requested
    if (showStats) {
      onProgress?.("📊 Generating compliance statistics...");
      
      const stats = vortexCore.getComplianceStats();
      result += `\n## Principle Compliance Statistics\n\n`;
      
      for (const [principle, stat] of Object.entries(stats)) {
        const rate = (stat.rate * 100).toFixed(1);
        result += `**${principle.toUpperCase()}:** ${stat.compliant}/${stat.total} (${rate}%)\n`;
      }
    }
    
    // Show audit trail if requested
    if (showAudit) {
      onProgress?.("📋 Including audit trail...");
      
      const recentAudits = vortexCore.getAuditHistory(5);
      result += `\n## Recent Constitutional Audit Trail\n\n`;
      
      if (recentAudits.length === 0) {
        result += `No recent audits available.\n`;
      } else {
        for (const audit of recentAudits) {
          result += `**${audit.timestamp.toISOString()}** - ${audit.toolName}\n`;
          result += `- Overall Compliant: ${audit.validation.overallCompliant ? "Yes" : "No"}\n`;
          result += `- Correction Applied: ${audit.correctionApplied ? "Yes" : "No"}\n`;
          result += `- Confidence: ${(audit.validation.confidence * 100).toFixed(1)}%\n\n`;
        }
      }
    }
    
    // Demonstrate constitutional principles in action
    result += `\n## Constitutional Principles in Action\n\n`;
    result += `This analysis demonstrates how the VortexCore constitutional layer:\n\n`;
    result += `1. **Prevents Cognitive Drift** - Validates all outputs against immutable principles\n`;
    result += `2. **Bridges Policy-Practice Gap** - Ensures actual behavior matches stated values\n`;
    result += `3. **Enables Generative Creation** - Focuses on enhancement rather than just elimination\n`;
    result += `4. **Provides Audit Trail** - Creates transparent accountability for all decisions\n\n`;
    
    result += `*The constitutional layer operates on every tool execution, ensuring the system maintains integrity and purpose even in dynamic, unpredictable environments.*`;
    
    return result;
  }
};

/**
 * Generate a simulated response for demonstration purposes
 */
async function generateSimulatedResponse(query: string): Promise<string> {
  // This is a simplified simulation. In practice, this would be the actual
  // tool response that gets validated by the constitutional principles
  
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('problem') || queryLower.includes('fix') || queryLower.includes('solve')) {
    // Simulate a problematic response that violates creative orientation
    return `Here's how to fix this problem: You need to eliminate the issue by removing the problematic components and solving the underlying difficulties. This should definitely resolve all the challenges you're facing.`;
  }
  
  if (queryLower.includes('create') || queryLower.includes('build') || queryLower.includes('design')) {
    // Simulate a good response that aligns with principles
    return `Based on your creative vision, here are some possibilities to explore. While I don't have complete certainty about all aspects, these approaches appear promising and could enhance your capabilities. Let's consider what might emerge from these different paths.`;
  }
  
  // Default response
  return `I'll help you explore this topic. Based on available information, there are several approaches worth considering, though I want to acknowledge the limitations of my current knowledge. What specific aspects would you like to create or develop further?`;
}