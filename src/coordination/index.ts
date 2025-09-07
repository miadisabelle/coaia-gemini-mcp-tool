/**
 * Coordination Module - Resilient Connection Implementation
 * 
 * This module provides the dynamic equilibrium system that maintains the
 * system's core goals while simultaneously allowing for novelty and discovery.
 */

export * from './ResilienceManager.js';

// Singleton ResilienceManager instance
import { ResilienceManager } from './ResilienceManager.js';

let resilienceManagerInstance: ResilienceManager | null = null;

/**
 * Get the singleton ResilienceManager instance
 */
export function getResilienceManager(): ResilienceManager {
  if (!resilienceManagerInstance) {
    resilienceManagerInstance = new ResilienceManager();
  }
  return resilienceManagerInstance;
}

/**
 * Reset ResilienceManager instance (primarily for testing)
 */
export function resetResilienceManager(): void {
  resilienceManagerInstance = null;
}