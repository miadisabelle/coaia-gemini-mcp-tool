/**
 * Core Module - Constitutional Governance for Generative Agentic Systems
 * 
 * This module provides the foundational constitutional layer that governs
 * how the system thinks and ensures alignment with generative creation principles.
 */

export * from './principles.js';
export * from './VortexCore.js';

// Singleton VortexCore instance for the entire system
import { VortexCore } from './VortexCore.js';

let vortexCoreInstance: VortexCore | null = null;

/**
 * Get the singleton VortexCore instance
 */
export function getVortexCore(): VortexCore {
  if (!vortexCoreInstance) {
    vortexCoreInstance = new VortexCore({
      enableActivePause: true,
      generateAlternatives: true,
      alternativeCount: 3,
      evaluationCriteria: ['novelty', 'reliability', 'ethical_alignment']
    });
  }
  return vortexCoreInstance;
}

/**
 * Initialize VortexCore with custom configuration
 */
export function initializeVortexCore(config: Partial<import('./VortexCore.js').SelfCorrectionConfig> = {}): VortexCore {
  vortexCoreInstance = new VortexCore(config);
  return vortexCoreInstance;
}

/**
 * Reset VortexCore instance (primarily for testing)
 */
export function resetVortexCore(): void {
  vortexCoreInstance = null;
}