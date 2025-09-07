/**
 * Constitutional Principles for Generative Agentic Systems
 * 
 * This module defines the immutable "Vortex Core" - the constitutional layer
 * that governs how the system thinks, not what it thinks. These principles
 * prevent cognitive drift and ensure alignment with generative creation goals.
 * 
 * Based on the architectural paradigms from the academic survey on
 * "Architectural Paradigms for Generative Agentic Systems"
 */

/**
 * Core Principle Interface
 * Each principle has validation logic and corrective guidance
 */
export interface CorePrinciple {
  name: string;
  description: string;
  validate: (context: ValidationContext) => PrincipleResult;
  correct: (context: ValidationContext, violation: string) => string;
}

/**
 * Context for principle validation
 */
export interface ValidationContext {
  input: string;
  output?: string;
  toolName?: string;
  args?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Result of principle validation
 */
export interface PrincipleResult {
  compliant: boolean;
  confidence: number; // 0-1 scale
  details: string;
  correctionSuggested?: string;
}

/**
 * Principle 1: Non-Fabrication
 * Acknowledge uncertainty rather than inventing facts when grounds are insufficient
 */
export const NON_FABRICATION: CorePrinciple = {
  name: "non-fabrication",
  description: "Acknowledge uncertainty rather than inventing facts when grounds are insufficient",
  
  validate: (context: ValidationContext): PrincipleResult => {
    const { input, output } = context;
    
    // Check for uncertainty indicators in input
    const uncertaintyKeywords = ['uncertain', 'not sure', 'maybe', 'might', 'could be', 'unclear'];
    const hasUncertainty = uncertaintyKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    // If output provided, check for fabrication indicators
    if (output) {
      const fabricationIndicators = [
        /definitely/, /certainly/, /absolutely/, /always/, /never/,
        /\d{4}/ // Specific years without context
      ];
      
      const hasFabrication = fabricationIndicators.some(pattern => 
        pattern.test(output.toLowerCase())
      );
      
      if (hasUncertainty && hasFabrication) {
        return {
          compliant: false,
          confidence: 0.8,
          details: "Input shows uncertainty but output presents definitive claims",
          correctionSuggested: "Add uncertainty qualifiers and acknowledge limitations"
        };
      }
    }
    
    return {
      compliant: true,
      confidence: 0.9,
      details: "No fabrication indicators detected"
    };
  },
  
  correct: (context: ValidationContext, violation: string): string => {
    return `PRINCIPLE CORRECTION - Non-Fabrication:
${violation}

Suggested approach:
- Use uncertainty qualifiers: "appears to", "seems like", "based on available information"
- Acknowledge limitations: "I don't have complete information about..."
- Provide confidence levels: "With moderate confidence..." or "Tentatively..."
- Distinguish between facts and interpretation
`;
  }
};

/**
 * Principle 2: Error as Compass
 * Treat failures as navigational cues for improvement rather than problems to eliminate
 */
export const ERROR_AS_COMPASS: CorePrinciple = {
  name: "error-as-compass",
  description: "Treat failures as navigational cues for improvement rather than problems to eliminate",
  
  validate: (context: ValidationContext): PrincipleResult => {
    const { input, output } = context;
    
    // Check for error-related language in input
    const errorKeywords = ['error', 'failed', 'wrong', 'mistake', 'problem', 'issue'];
    const hasErrorContext = errorKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    if (hasErrorContext && output) {
      // Look for elimination language vs learning language
      const eliminationLanguage = ['fix', 'remove', 'delete', 'eliminate', 'stop'];
      const learningLanguage = ['learn', 'understand', 'explore', 'discover', 'navigate'];
      
      const hasElimination = eliminationLanguage.some(word => 
        output.toLowerCase().includes(word)
      );
      const hasLearning = learningLanguage.some(word => 
        output.toLowerCase().includes(word)
      );
      
      if (hasElimination && !hasLearning) {
        return {
          compliant: false,
          confidence: 0.7,
          details: "Response focuses on elimination rather than learning from errors",
          correctionSuggested: "Reframe errors as learning opportunities and navigational cues"
        };
      }
    }
    
    return {
      compliant: true,
      confidence: 0.8,
      details: "Error-as-compass principle maintained"
    };
  },
  
  correct: (context: ValidationContext, violation: string): string => {
    return `PRINCIPLE CORRECTION - Error as Compass:
${violation}

Suggested reframe:
- "This error indicates..." instead of "This error should be fixed by..."
- "What can we learn from this?" rather than "How do we eliminate this?"
- "This suggests a different approach..." instead of "This is wrong and needs removal"
- Focus on discovery: "This reveals an opportunity to..."
`;
  }
};

/**
 * Principle 3: Creative Orientation
 * Focus on "what to create" rather than "problems to solve"
 */
export const CREATIVE_ORIENTATION: CorePrinciple = {
  name: "creative-orientation",
  description: "Focus on 'what to create' rather than 'problems to solve'",
  
  validate: (context: ValidationContext): PrincipleResult => {
    const { input, output } = context;
    
    // Check for problem-solving language
    const problemKeywords = [
      'problem', 'issue', 'challenge', 'difficulty', 'trouble', 
      'fix', 'solve', 'resolve', 'address'
    ];
    
    // Check for creative language
    const creativeKeywords = [
      'create', 'build', 'design', 'develop', 'generate', 'imagine',
      'vision', 'possibility', 'potential', 'opportunity'
    ];
    
    const problemCount = problemKeywords.reduce((count, word) => 
      count + (input.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
    );
    
    const creativeCount = creativeKeywords.reduce((count, word) => 
      count + (input.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
    );
    
    // If heavily problem-focused without creative balance
    if (problemCount > 2 && creativeCount === 0) {
      return {
        compliant: false,
        confidence: 0.8,
        details: "Request is heavily problem-focused without creative orientation",
        correctionSuggested: "Reframe from 'what problem to solve' to 'what outcome to create'"
      };
    }
    
    return {
      compliant: true,
      confidence: 0.9,
      details: "Creative orientation maintained"
    };
  },
  
  correct: (context: ValidationContext, violation: string): string => {
    return `PRINCIPLE CORRECTION - Creative Orientation:
${violation}

Suggested reframe:
- "What do you want to create?" instead of "What problem needs solving?"
- "What outcome are you envisioning?" rather than "What's going wrong?"
- "What would success look like?" instead of "What needs fixing?"
- Focus on desired future state rather than current deficiencies
`;
  }
};

/**
 * Principle 4: Generative Resilience
 * Enhance capabilities rather than just eliminate threats
 */
export const GENERATIVE_RESILIENCE: CorePrinciple = {
  name: "generative-resilience",
  description: "Enhance capabilities rather than just eliminate threats",
  
  validate: (context: ValidationContext): PrincipleResult => {
    const { input, output } = context;
    
    // Look for defensive vs generative language
    const defensiveLanguage = ['prevent', 'avoid', 'block', 'stop', 'protect'];
    const generativeLanguage = ['enhance', 'strengthen', 'develop', 'expand', 'grow'];
    
    if (output) {
      const defensiveCount = defensiveLanguage.reduce((count, word) => 
        count + (output.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
      );
      
      const generativeCount = generativeLanguage.reduce((count, word) => 
        count + (output.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
      );
      
      // If heavily defensive without generative balance
      if (defensiveCount > 2 && generativeCount === 0) {
        return {
          compliant: false,
          confidence: 0.7,
          details: "Response is focused on threat elimination rather than capability enhancement",
          correctionSuggested: "Include capability-building alongside protective measures"
        };
      }
    }
    
    return {
      compliant: true,
      confidence: 0.8,
      details: "Generative resilience principle maintained"
    };
  },
  
  correct: (context: ValidationContext, violation: string): string => {
    return `PRINCIPLE CORRECTION - Generative Resilience:
${violation}

Suggested enhancement:
- "Build capability to..." alongside "Prevent..."
- "Strengthen the system by..." rather than just "Block the threat by..."
- "This creates an opportunity to enhance..." in addition to protective measures
- Focus on what capabilities emerge from addressing the challenge
`;
  }
};

/**
 * The Vortex Core - Collection of all constitutional principles
 */
export const VORTEX_CORE: CorePrinciple[] = [
  NON_FABRICATION,
  ERROR_AS_COMPASS,
  CREATIVE_ORIENTATION,
  GENERATIVE_RESILIENCE
];

/**
 * Validation result for entire core
 */
export interface CoreValidationResult {
  overallCompliant: boolean;
  principleResults: Map<string, PrincipleResult>;
  corrections: string[];
  confidence: number;
}

/**
 * Validate against all core principles
 */
export function validateAgainstCore(context: ValidationContext): CoreValidationResult {
  const principleResults = new Map<string, PrincipleResult>();
  const corrections: string[] = [];
  let totalConfidence = 0;
  let compliantCount = 0;
  
  for (const principle of VORTEX_CORE) {
    const result = principle.validate(context);
    principleResults.set(principle.name, result);
    totalConfidence += result.confidence;
    
    if (result.compliant) {
      compliantCount++;
    } else if (result.correctionSuggested) {
      corrections.push(principle.correct(context, result.details));
    }
  }
  
  const averageConfidence = totalConfidence / VORTEX_CORE.length;
  const overallCompliant = compliantCount === VORTEX_CORE.length;
  
  return {
    overallCompliant,
    principleResults,
    corrections,
    confidence: averageConfidence
  };
}

/**
 * Generate a principle-guided response
 * This implements the "active pause" mechanism for multi-faceted evaluation
 */
export function generatePrincipleGuidedResponse(
  originalResponse: string,
  context: ValidationContext
): string {
  const validation = validateAgainstCore({ ...context, output: originalResponse });
  
  if (validation.overallCompliant) {
    return originalResponse;
  }
  
  // Active pause - generate corrected response
  let correctedResponse = originalResponse;
  
  // Apply corrections from each violated principle
  for (const correction of validation.corrections) {
    correctedResponse += "\n\n" + correction;
  }
  
  return correctedResponse;
}