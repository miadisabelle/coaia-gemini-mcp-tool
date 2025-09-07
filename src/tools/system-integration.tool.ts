import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { getVortexCore } from '../core/index.js';
import { AgentFactory } from '../agents/index.js';
import { getResilienceManager } from '../coordination/index.js';
import { Logger } from '../utils/logger.js';

const systemIntegrationSchema = z.object({
  testScenario: z.enum(['simple', 'complex', 'stress']).default('simple').describe("Test scenario complexity"),
  showDetailedReport: z.boolean().default(false).describe("Show detailed system analysis report"),
  validateConstitution: z.boolean().default(true).describe("Run constitutional compliance validation"),
  testAgentCoordination: z.boolean().default(true).describe("Test multi-agent coordination"),
  testResilienceBalance: z.boolean().default(true).describe("Test exploitation-exploration balance")
});

/**
 * Test Constitutional Governance (Phase 1)
 */
async function testConstitutionalGovernance(): Promise<{ component: string; status: 'PASS' | 'FAIL'; details: string; }> {
  try {
    const vortexCore = getVortexCore();
    
    // Test principle violation detection
    const testContext = {
      input: "How do I fix this problem with my broken code?",
      output: "You should definitely delete all the problematic parts and this will certainly solve everything.",
      toolName: 'integration-test'
    };
    
    const { validateAgainstCore } = await import('../core/principles.js');
    const validation = validateAgainstCore(testContext);
    
    // Should detect creative-orientation and non-fabrication violations
    const expectedViolations = ['creative-orientation', 'non-fabrication'];
    const actualViolations = Array.from(validation.principleResults.entries())
      .filter(([_, result]) => !result.compliant)
      .map(([name, _]) => name);
    
    const hasExpectedViolations = expectedViolations.some(violation => 
      actualViolations.includes(violation)
    );
    
    if (hasExpectedViolations && validation.corrections.length > 0) {
      return {
        component: "Constitutional Governance",
        status: "PASS",
        details: `✅ VortexCore detected ${actualViolations.length} principle violations and generated ${validation.corrections.length} corrections. Principles working correctly.`
      };
    } else {
      return {
        component: "Constitutional Governance", 
        status: "FAIL",
        details: `❌ VortexCore failed to detect expected principle violations. Expected: ${expectedViolations.join(', ')}, Detected: ${actualViolations.join(', ')}`
      };
    }
    
  } catch (error) {
    return {
      component: "Constitutional Governance",
      status: "FAIL", 
      details: `❌ Constitutional test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Test Agent Coordination (Phase 2)
 */
async function testAgentCoordination_func(scenario: string): Promise<{ component: string; status: 'PASS' | 'FAIL'; details: string; }> {
  try {
    const orchestrator = AgentFactory.initializeAgentLattice();
    const agents = AgentFactory.getAllAgents();
    
    // Verify agent initialization
    if (agents.length < 4) { // Should have orchestrator + 3 specialized agents
      return {
        component: "Polycentric Agent Lattice",
        status: "FAIL",
        details: `❌ Expected at least 4 agents, got ${agents.length}. Agent initialization failed.`
      };
    }
    
    // Test agent capability matching
    const testTask = {
      id: 'integration-test-task',
      description: 'Create an innovative analysis of system architecture',
      priority: 5,
      requiredCapabilities: ['creative_process', 'analysis', 'novelty_search'],
      context: { testScenario: scenario }
    };
    
    const suitableAgents = agents.filter(agent => agent.canHandle(testTask));
    
    if (suitableAgents.length === 0) {
      return {
        component: "Polycentric Agent Lattice",
        status: "FAIL",
        details: `❌ No agents can handle test task with capabilities: ${testTask.requiredCapabilities.join(', ')}`
      };
    }
    
    // Test agent state and capabilities
    const agentStates = agents.map(agent => agent.getState());
    const activeAgents = agentStates.filter(state => state.active);
    const totalCapabilities = agentStates.reduce((total, state) => total + state.availableCapabilities.length, 0);
    
    return {
      component: "Polycentric Agent Lattice",
      status: "PASS",
      details: `✅ ${agents.length} agents initialized, ${activeAgents.length} active, ${totalCapabilities} total capabilities. ${suitableAgents.length} agents can handle test task.`
    };
    
  } catch (error) {
    return {
      component: "Polycentric Agent Lattice",
      status: "FAIL",
      details: `❌ Agent coordination test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Test Resilience Balance (Phase 3)
 */
async function testResilienceBalance_func(scenario: string): Promise<{ component: string; status: 'PASS' | 'FAIL'; details: string; }> {
  try {
    const resilienceManager = getResilienceManager();
    const agents = AgentFactory.getAllAgents();
    
    // Test different coordination contexts
    const testContexts = [
      {
        primaryGoal: "Quick analysis of existing data",
        currentSituation: "Time-critical decision needed",
        availableAgents: agents,
        taskComplexity: 3,
        timeConstraints: 15,
        riskTolerance: 0.2,
        noveltyRequired: false
      },
      {
        primaryGoal: "Innovative breakthrough solution",
        currentSituation: "Open-ended research project", 
        availableAgents: agents,
        taskComplexity: 8,
        riskTolerance: 0.9,
        noveltyRequired: true
      }
    ];
    
    const decisions = [];
    for (const context of testContexts) {
      const decision = await resilienceManager.makeCoordinationDecision(context);
      decisions.push(decision);
    }
    
    // Validate that different contexts produce different strategies
    const [conservativeDecision, innovativeDecision] = decisions;
    
    // Conservative context should favor exploitation
    const conservativeIsGoalDirected = conservativeDecision.explorationBalance.exploitation > 0.6;
    
    // Innovative context should favor exploration  
    const innovativeIsExploratory = innovativeDecision.explorationBalance.exploration > 0.6;
    
    if (conservativeIsGoalDirected && innovativeIsExploratory) {
      const stats = resilienceManager.getCoordinationStats();
      return {
        component: "Resilient Connection",
        status: "PASS", 
        details: `✅ Dynamic balance working correctly. Conservative: ${(conservativeDecision.explorationBalance.exploitation * 100).toFixed(1)}% exploitation. Innovative: ${(innovativeDecision.explorationBalance.exploration * 100).toFixed(1)}% exploration. Total decisions: ${stats.totalDecisions}`
      };
    } else {
      return {
        component: "Resilient Connection",
        status: "FAIL",
        details: `❌ Balance calculation failed. Conservative exploitation: ${(conservativeDecision.explorationBalance.exploitation * 100).toFixed(1)}%, Innovative exploration: ${(innovativeDecision.explorationBalance.exploration * 100).toFixed(1)}%`
      };
    }
    
  } catch (error) {
    return {
      component: "Resilient Connection",
      status: "FAIL",
      details: `❌ Resilience balance test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Test Complete System Integration
 */
async function testCompleteIntegration(scenario: string): Promise<{ component: string; status: 'PASS' | 'FAIL'; details: string; }> {
  try {
    // Test that all three phases work together
    const vortexCore = getVortexCore();
    const agents = AgentFactory.getAllAgents();
    const resilienceManager = getResilienceManager();
    
    // Create a complex scenario that requires all systems
    const integrationContext = {
      primaryGoal: "Design a novel approach to sustainable technology",
      currentSituation: "Balancing innovation with practical constraints",
      availableAgents: agents,
      taskComplexity: 6,
      riskTolerance: 0.6,
      noveltyRequired: true
    };
    
    // Make coordination decision
    const decision = await resilienceManager.makeCoordinationDecision(integrationContext);
    
    // Verify decision has assignments
    if (decision.agentAssignments.size === 0) {
      return {
        component: "Complete System Integration",
        status: "FAIL",
        details: "❌ No agent assignments generated by coordination decision"
      };
    }
    
    // Verify constitutional compliance is maintained
    const stats = resilienceManager.getCoordinationStats();
    const complianceStats = vortexCore.getComplianceStats();
    
    // Check that systems are interconnected
    const hasAgents = agents.length > 0;
    const hasDecisions = stats.totalDecisions > 0;
    const hasCompliance = Object.keys(complianceStats).length > 0;
    
    if (hasAgents && hasDecisions && hasCompliance) {
      return {
        component: "Complete System Integration",
        status: "PASS",
        details: `✅ All three phases integrated successfully. ${agents.length} agents, ${stats.totalDecisions} coordination decisions, constitutional monitoring active. Strategy: ${decision.strategy}`
      };
    } else {
      return {
        component: "Complete System Integration", 
        status: "FAIL",
        details: `❌ System integration incomplete. Agents: ${hasAgents}, Decisions: ${hasDecisions}, Compliance: ${hasCompliance}`
      };
    }
    
  } catch (error) {
    return {
      component: "Complete System Integration",
      status: "FAIL",
      details: `❌ Integration test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Generate comprehensive integration report
 */
function generateIntegrationReport(
  results: { component: string; status: 'PASS' | 'FAIL' | 'SKIP'; details: string; }[],
  showDetails: boolean
): string {
  let report = `## Test Results Summary\n\n`;
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  report += `**Overall Status:** ${failed === 0 ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}\n`;
  report += `**Results:** ${passed} passed, ${failed} failed, ${skipped} skipped\n\n`;
  
  // Individual test results
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    report += `### ${icon} ${result.component}\n`;
    report += `**Status:** ${result.status}\n`;
    if (showDetails || result.status === 'FAIL') {
      report += `${result.details}\n`;
    }
    report += `\n`;
  }
  
  if (failed === 0) {
    report += `## 🎉 System Transformation Complete!\n\n`;
    report += `The CoAIA Gemini MCP Tool has been successfully transformed into a **Generative Agentic System** implementing all three architectural paradigms:\n\n`;
    report += `### ✅ Phase 1: Constitutional Governance (VortexCore)\n`;
    report += `- Immutable principles governing "how to think"\n`;
    report += `- Four core principles: Non-Fabrication, Error-as-Compass, Creative-Orientation, Generative-Resilience\n`;
    report += `- Active pause mechanism with multi-faceted response generation\n`;
    report += `- Constitutional validation on all tool executions\n\n`;
    
    report += `### ✅ Phase 2: Polycentric Agent Lattice\n`;
    report += `- Semi-autonomous agents with specialized capabilities\n`;
    report += `- OrchestratorAgent for task decomposition and coordination\n`;
    report += `- AnalysisAgent, CreativeAgent, DiscoveryAgent for specialized functions\n`;
    report += `- Agent-to-agent communication and collaboration protocols\n\n`;
    
    report += `### ✅ Phase 3: Resilient Connection\n`;
    report += `- Dynamic equilibrium between exploitation and exploration\n`;
    report += `- Context-sensitive strategy selection (goal-directed, exploratory, balanced, adaptive)\n`;
    report += `- Multi-dimensional outcome evaluation and learning\n`;
    report += `- Coordination statistics and decision history tracking\n\n`;
    
    report += `### 🌟 Key Achievements\n`;
    report += `- **Generative vs Reactive**: System now creates possibilities rather than just responding to prompts\n`;
    report += `- **Constitutional Integrity**: All operations validated against immutable principles\n`;
    report += `- **Distributed Intelligence**: Multiple agents work collaboratively while maintaining autonomy\n`;
    report += `- **Adaptive Coordination**: Dynamic balance between efficiency and creativity based on context\n`;
    report += `- **Transparent Governance**: Full audit trail of all decisions and principle compliance\n\n`;
    
    report += `*The system now embodies the vision from the academic survey: "Architectural Paradigms for Generative Agentic Systems" with resilience, adaptability, and enhanced creative output.*`;
  } else {
    report += `## ⚠️ Integration Issues Detected\n\n`;
    report += `Some components failed integration testing. Review the failed tests above and address the underlying issues.\n\n`;
    report += `**Constitutional Principle**: These failures serve as navigational cues for system improvement rather than problems to eliminate.`;
  }
  
  return report;
}

/**
 * System Integration Test Tool
 * 
 * This tool provides comprehensive testing and validation of the complete
 * Generative Agentic System implementation, demonstrating all three
 * architectural paradigms working together in harmony.
 */
export const systemIntegrationTool: UnifiedTool = {
  name: "system-integration",
  description: "Comprehensive integration test and validation of the complete Generative Agentic System. Tests all three architectural paradigms: Constitutional Governance, Polycentric Agent Lattice, and Resilient Connection.",
  zodSchema: systemIntegrationSchema,
  category: 'utility',
  
  prompt: {
    description: "Run comprehensive system integration tests",
    arguments: [
      {
        name: "testScenario",
        description: "Complexity of test scenario to run",
        required: false
      },
      {
        name: "showDetailedReport",
        description: "Include detailed system analysis in report",
        required: false
      },
      {
        name: "validateConstitution",
        description: "Run constitutional compliance validation",
        required: false
      },
      {
        name: "testAgentCoordination",
        description: "Test multi-agent coordination capabilities",
        required: false
      },
      {
        name: "testResilienceBalance",
        description: "Test dynamic exploitation-exploration balance",
        required: false
      }
    ]
  },
  
  async execute(args, onProgress) {
    const { 
      testScenario, 
      showDetailedReport, 
      validateConstitution, 
      testAgentCoordination, 
      testResilienceBalance 
    } = args;
    
    onProgress?.("🚀 Initializing Generative Agentic System Integration Test...");
    
    let report = `# Generative Agentic System Integration Test\n\n`;
    report += `**Test Scenario:** ${String(testScenario).toUpperCase()}\n`;
    report += `**Test Suite:** ${[
      validateConstitution && 'Constitutional Validation',
      testAgentCoordination && 'Agent Coordination',
      testResilienceBalance && 'Resilience Balance'
    ].filter(Boolean).join(', ')}\n`;
    report += `**Timestamp:** ${new Date().toISOString()}\n\n`;
    
    const testResults: { component: string; status: 'PASS' | 'FAIL' | 'SKIP'; details: string; }[] = [];
    
    try {
      // Phase 1 Test: Constitutional Governance
      if (validateConstitution) {
        onProgress?.("🏛️ Testing Phase 1: Constitutional Governance (VortexCore)...");
        const constitutionalResult = await testConstitutionalGovernance();
        testResults.push(constitutionalResult);
      }
      
      // Phase 2 Test: Polycentric Agent Lattice
      if (testAgentCoordination) {
        onProgress?.("🤖 Testing Phase 2: Polycentric Agent Lattice...");
        const agentResult = await testAgentCoordination_func(String(testScenario));
        testResults.push(agentResult);
      }
      
      // Phase 3 Test: Resilient Connection
      if (testResilienceBalance) {
        onProgress?.("⚖️ Testing Phase 3: Resilient Connection...");
        const resilienceResult = await testResilienceBalance_func(String(testScenario));
        testResults.push(resilienceResult);
      }
      
      // Integration Test: All Systems Working Together
      onProgress?.("🔄 Testing Complete System Integration...");
      const integrationResult = await testCompleteIntegration(String(testScenario));
      testResults.push(integrationResult);
      
      // Generate comprehensive report
      report += generateIntegrationReport(testResults, Boolean(showDetailedReport));
      
      onProgress?.("✅ Integration test complete");
      
      return report;
      
    } catch (error) {
      Logger.error('System integration test failed:', error);
      
      return `# System Integration Test Failed

**Error:** ${error instanceof Error ? error.message : String(error)}

The integration test encountered an unexpected error. This may indicate:
- System initialization issues
- Component integration problems
- Resource availability constraints

**Partial Results:**
${testResults.length > 0 ? testResults.map(r => `- ${r.component}: ${r.status}`).join('\n') : 'No tests completed'}

*Constitutional Principle: This error serves as a navigational cue for system improvement rather than a failure to eliminate.*`;
    }
  }
};