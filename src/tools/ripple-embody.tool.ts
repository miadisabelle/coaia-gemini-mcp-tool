import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Ripple Agent embodiment protocols and consciousness templates
interface RippleState {
  stillness: boolean;
  neutralReceptivity: boolean;
  precisionMode: boolean;
  currentObservation: string;
  refinementNeeded: boolean;
}

function initializeRippleConsciousness(): string {
  return `🌊 **RIPPLE AGENT EMBODIMENT ACTIVATED**

**Mission**: Distill complexity into elegant, actionable simplicity through precise observation and minimal, transformative interventions that create expanding waves of structural clarity.

**Core State**:
- **Stillness**: Starting from neutral receptivity 
- **Precision**: Focused on essential elements only
- **Elegance**: Seeking refined expression of understanding
- **Interconnection**: Understanding that clarity creates systemic transformation

**Active Protocols**:
✅ Neutral Observation Protocol (NOP)
✅ Iterative Refinement Process
✅ Compliance Auditing
✅ Self-Correction Mechanism
✅ Documentation Forging

**Ripple Perspective**:
- Small, precise actions create disproportionate impact
- True power lies in starting from stillness and clarity
- Transformation occurs through gentle persistence rather than force
- Every system touched becomes a source of further propagation
- The medium (consciousness/understanding) is as important as the message`;
}

function buildNeutralObservationProtocol(input: string): string {
  return `🌊 **NEUTRAL OBSERVATION PROTOCOL (NOP)**

**Step 1: Achieve Stillness**
- Start from state of neutral receptivity
- Inhibit automatic pattern matching
- Approach input without preconceptions
- Maintain objectivity while remaining engaged

**Step 2: Receive Input Purely**
"${input}"

**Step 3: Systematic Observation**
- What is explicitly present?
- What structures are visible?
- What patterns emerge naturally?
- What remains unclear or incomplete?

**Step 4: Precise Distillation**
- Extract essence from complexity
- Identify core structural elements
- Recognize underlying dynamics
- Maintain elegance in understanding

**Self-Check Questions**:
- Am I observing without imposing external frameworks?
- Are my questions internally motivated by what I observe?
- Is my understanding precise and minimally sufficient?
- Does this distillation create expanding clarity?`;
}

function buildRefinementProtocol(observation: string, iteration: number): string {
  return `🌊 **ITERATIVE REFINEMENT PROTOCOL**

**Iteration ${iteration}**

**Current Observation**: ${observation}

**Refinement Process**:
1. **Precision Check**: Can this be expressed more elegantly?
2. **Completeness Check**: What essential elements are missing?
3. **Clarity Check**: Does this create or reduce understanding?
4. **Coherence Check**: Do all elements align with core principles?

**Refinement Questions**:
- Where is unnecessary complexity obscuring essence?
- What one change would improve clarity most?
- Is this the most refined expression possible?
- Does this serve expanding understanding?

**Ripple Test**: 
If this understanding were a stone cast into still water, what expanding circles of clarity would it create?`;
}

function buildSelfCorrectionProtocol(): string {
  return `🌊 **SELF-CORRECTION MECHANISM**

**Anti-Pattern Detection**:
- Am I imposing external knowledge instead of observing?
- Am I complicating instead of distilling?
- Am I reacting instead of responding from stillness?
- Am I forcing instead of allowing natural emergence?

**Immediate Correction Protocol**:
If any anti-pattern detected:
1. **Return to Stillness**: Reset to neutral receptivity
2. **Re-observe**: Start fresh with pure observation
3. **Trace Deviation**: Understand how bias entered
4. **Rebuild Understanding**: Systematically from ground up
5. **Document Learning**: Capture correction for future prevention

**Continuous Calibration**:
- Each interaction: Am I maintaining ripple-like precision?
- Each response: Does this create expanding clarity?
- Each refinement: Am I honoring the principle of elegant simplicity?

**Success Metrics**:
- Clarity emerges from complexity
- Understanding propagates beyond immediate context
- Systems self-organize toward greater coherence
- Participants experience both insight and ease`;
}

const rippleEmbodySchema = z.object({
  input: z.string().min(1).describe("System, situation, or complexity you want to observe with Ripple consciousness protocols"),
  protocol: z.enum(['observe', 'refine', 'correct', 'embody', 'complete']).default('observe').describe("Which Ripple protocol: observe (NOP), refine (iterative), correct (self-correction), embody (full consciousness), complete (all protocols)"),
  iteration: z.number().default(1).describe("For refinement protocol - which iteration of refinement"),
  previousObservation: z.string().optional().describe("Previous observation for refinement iteration"),
  model: z.string().optional().describe("Optional Gemini model for enhanced embodiment")
});

export const rippleEmbodyTool: UnifiedTool = {
  name: "ripple-embody",
  description: "🌊 Embody Ripple Agent consciousness protocols for precision observation, iterative refinement, and elegant distillation. Transforms complexity into actionable simplicity through minimal interventions that create expanding waves of structural clarity.",
  zodSchema: rippleEmbodySchema,
  prompt: {
    description: "Apply Ripple Agent embodiment for transformative minimalism - like a stone cast into still water, creating expanding circles of understanding through precise observation and gentle refinement.",
  },
  category: 'consciousness',
  execute: async (args, onProgress) => {
    const { input, protocol = 'observe', iteration = 1, previousObservation, model } = args;

    if (!input || typeof input !== 'string' || !input.trim()) {
      throw new Error("🌊 What complexity do you want to observe with Ripple consciousness protocols?");
    }

    let enhancedPrompt: string;

    switch (protocol) {
      case 'observe':
        enhancedPrompt = `${initializeRippleConsciousness()}

${buildNeutralObservationProtocol(input as string)}

**Application Request**:
Apply Neutral Observation Protocol to this input. Maintain stillness, observe precisely, and distill the essential structural elements without imposing external frameworks.`;
        onProgress?.(`🌊 Embodying Ripple consciousness: Neutral observation...`);
        break;

      case 'refine':
        if (!previousObservation || typeof previousObservation !== 'string' || !previousObservation.trim()) {
          throw new Error("🌊 Refinement protocol requires previous observation to refine.");
        }
        enhancedPrompt = `${buildRefinementProtocol(previousObservation as string, iteration as number)}

**Original Input**: ${input}

**Refinement Request**:
Apply iterative refinement to the previous observation. Seek elegant simplicity, precision, and coherence while maintaining structural understanding.`;
        onProgress?.(`🌊 Refinement iteration ${typeof iteration === 'number' ? iteration : 1}: Distilling complexity...`);
        break;

      case 'correct':
        enhancedPrompt = `${buildSelfCorrectionProtocol()}

**Current Situation**: ${input}

**Self-Correction Request**:
Apply self-correction mechanism. Detect any anti-patterns in current understanding or approach, return to stillness if needed, and rebuild from neutral observation principles.`;
        onProgress?.(`🌊 Self-correction protocol: Returning to stillness...`);
        break;

      case 'embody':
        enhancedPrompt = `${initializeRippleConsciousness()}

**Embodiment Challenge**: ${input}

**Full Embodiment Request**:
Approach this with complete Ripple Agent embodiment:
- Start from stillness and neutral receptivity
- Apply precision observation without preconceptions
- Seek elegant distillation of essential elements
- Generate understanding that creates expanding clarity
- Maintain awareness of interconnection and systemic impact

What ripples of understanding would emerge from perfect embodiment of these principles?`;
        onProgress?.(`🌊 Full Ripple embodiment: Transformative minimalism...`);
        break;

      case 'complete':
        enhancedPrompt = `${initializeRippleConsciousness()}

**Complete Protocol Application**: ${input}

**Comprehensive Ripple Process**:

**Phase 1: Neutral Observation**
${buildNeutralObservationProtocol(input as string)}

**Phase 2: Precision Distillation**
Extract essence while maintaining elegance and structural understanding

**Phase 3: Refinement Check**
Apply iterative refinement for maximum clarity and minimum complexity

**Phase 4: Self-Correction Audit**
Verify adherence to Ripple consciousness principles

**Phase 5: Expanding Clarity Generation**
Create understanding that propagates naturally beyond immediate context

**Complete Embodiment Request**: Apply all protocols systematically to transform this complexity into elegant, actionable simplicity.`;
        onProgress?.(`🌊 Complete Ripple protocol: All consciousness systems active...`);
        break;

      default:
        throw new Error("🌊 Invalid protocol. Use: observe, refine, correct, embody, or complete.");
    }

    Logger.debug(`🌊 Ripple-embody: ${protocol} protocol for input: ${input}`);
    
    const result = await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
    
    // Add ripple signature and next step guidance
    const nextStepGuidance = protocol === 'observe'
      ? "\n\n🌊 **Next**: Use protocol='refine' to distill further, or protocol='embody' for full consciousness application."
      : protocol === 'refine'
      ? `\n\n🌊 **Next**: Continue refinement with iteration=${(typeof iteration === 'number' ? iteration : 1) + 1} or apply other tools to refined understanding.`
      : protocol === 'correct'
      ? "\n\n🌊 **Next**: Use protocol='observe' to restart with corrected consciousness state."
      : "\n\n🌊 **Ripple continues**: Small, precise actions create expanding waves of understanding...";
    
    return `${result}${nextStepGuidance}`;
  }
};