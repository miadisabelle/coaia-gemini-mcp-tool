/**
 * Agents Module - Polycentric Agentic Lattice Implementation
 * 
 * This module provides the semi-autonomous agents that form the polycentric
 * lattice architecture for generative agentic systems.
 */

export * from './BaseAgent.js';
export * from './OrchestratorAgent.js';
export * from './AnalysisAgent.js';
export * from './CreativeAgent.js';
export * from './DiscoveryAgent.js';

// Agent registry for easy access
import { BaseAgent } from './BaseAgent.js';
import { OrchestratorAgent } from './OrchestratorAgent.js';
import { AnalysisAgent } from './AnalysisAgent.js';
import { CreativeAgent } from './CreativeAgent.js';
import { DiscoveryAgent } from './DiscoveryAgent.js';

/**
 * Agent factory for creating agent instances
 */
export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();
  
  /**
   * Create or get an agent instance
   */
  static getAgent(type: 'orchestrator' | 'analysis' | 'creative' | 'discovery'): BaseAgent {
    const existingAgent = this.agents.get(type);
    if (existingAgent) {
      return existingAgent;
    }
    
    let agent: BaseAgent;
    
    switch (type) {
      case 'orchestrator':
        agent = new OrchestratorAgent();
        break;
      case 'analysis':
        agent = new AnalysisAgent();
        break;
      case 'creative':
        agent = new CreativeAgent();
        break;
      case 'discovery':
        agent = new DiscoveryAgent();
        break;
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
    
    this.agents.set(type, agent);
    return agent;
  }
  
  /**
   * Get all active agents
   */
  static getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Register agents with orchestrator
   */
  static initializeAgentLattice(): OrchestratorAgent {
    const orchestrator = this.getAgent('orchestrator') as OrchestratorAgent;
    const analysisAgent = this.getAgent('analysis');
    const creativeAgent = this.getAgent('creative');
    const discoveryAgent = this.getAgent('discovery');
    
    orchestrator.registerAgent(analysisAgent);
    orchestrator.registerAgent(creativeAgent);
    orchestrator.registerAgent(discoveryAgent);
    
    return orchestrator;
  }
  
  /**
   * Shutdown all agents
   */
  static async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.agents.values()).map(agent => agent.shutdown());
    await Promise.all(shutdownPromises);
    this.agents.clear();
  }
}