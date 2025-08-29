import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Structural Tension Interface
interface StructuralTension {
  vision: string;
  currentReality: string;
  tension: number;        // 0-10 scale of clarity/strength
  energy: string;         // Description of creative energy available
}

function calculateStructuralTension(
  vision: string, 
  currentReality: string
): StructuralTension {
  // Enhanced tension calculation with bias detection
  const visionClarity = analyzeVisionQuality(vision);
  const realityClarity = analyzeRealityQuality(currentReality);
  const tensionStrength = Math.min(visionClarity, realityClarity);
  
  return {
    vision,
    currentReality,
    tension: tensionStrength,
    energy: generateTensionDescription(tensionStrength, visionClarity, realityClarity)
  };
}

function analyzeVisionQuality(vision: string): number {
  let score = 5; // Base score
  
  // Positive indicators
  if (vision.length > 50) score += 1;
  if (vision.includes('create') || vision.includes('build') || vision.includes('achieve')) score += 1;
  if (!vision.toLowerCase().includes('problem') && !vision.toLowerCase().includes('fix')) score += 2;
  
  // Creative orientation language
  const creativeWords = ['manifest', 'bring into being', 'establish', 'design', 'develop', 'realize'];
  if (creativeWords.some(word => vision.toLowerCase().includes(word))) score += 2;
  
  // Problem-solving language penalties
  const problemWords = ['solve', 'eliminate', 'stop', 'prevent', 'avoid', 'fix', 'resolve issues'];
  if (problemWords.some(word => vision.toLowerCase().includes(word))) score -= 3;
  
  return Math.max(1, Math.min(10, score));
}

function analyzeRealityQuality(reality: string): number {
  let score = 5; // Base score
  
  // Positive indicators
  if (reality.length > 30) score += 1;
  if (reality.length > 100) score += 1;
  
  // Objective language (good)
  const objectiveWords = ['currently', 'have', 'am', 'exists', 'experience'];
  if (objectiveWords.some(word => reality.toLowerCase().includes(word))) score += 1;
  
  // Judgmental language (reduces clarity)
  const judgmentWords = ['terrible', 'awful', 'wrong', 'bad', 'should', 'must'];
  if (judgmentWords.some(word => reality.toLowerCase().includes(word))) score -= 2;
  
  // Action-oriented language in current reality (not ideal)
  const actionWords = ['need to', 'plan to', 'going to', 'will'];
  if (actionWords.some(word => reality.toLowerCase().includes(word))) score -= 1;
  
  return Math.max(1, Math.min(10, score));
}

function generateTensionDescription(tensionStrength: number, visionClarity: number, realityClarity: number): string {
  if (tensionStrength >= 8) {
    return "🌊 Excellent structural tension - both vision and reality are clear and specific. Strong creative energy available for advancement.";
  } else if (tensionStrength >= 6) {
    return "🌊 Good structural tension - clear enough for creative movement. Some refinement could increase energy.";
  } else if (visionClarity < realityClarity) {
    return "🌊 Moderate tension - vision could be more specific and free from problem-solving language for stronger creative orientation.";
  } else if (realityClarity < visionClarity) {
    return "🌊 Moderate tension - current reality could be more objective and detailed for clearer structural awareness.";
  } else {
    return "🌊 Developing tension - both vision and current reality need refinement for stronger creative force.";
  }
}

function buildGerminationPrompt(config: {
  desiredOutcome: string;
  currentReality?: string;
  timeframe?: string;
  resources?: string;
}): string {
  return `# GERMINATION - Creative Vision Development

## Your Creative Vision
${config.desiredOutcome}

## Current Reality  
${config.currentReality || 'Where are you now in relation to this vision?'}

## Germination Energy
This is the exciting beginning phase of creation. Feel the possibility and energy of what you want to create.

### Vision Clarification:
- What does the completed creation look like specifically?
- What draws you to create this particular outcome?
- What aspects excite you most?
- What would success look and feel like?
- How will you know when it's complete?

### Initial Actions:
- What's one small step you could take today?
- What research or exploration would be helpful?
- What resources or connections might you need?
- Who else might be interested in this creation?

### Balance Planning and Action:
- Do some initial planning, but don't over-plan
- Take action alongside planning
- Let the vision guide you, not methodology
- Stay connected to what you want to create

**Remember:** This is about bringing something into being that you want to exist. Trust your creative instincts and the energy of this beginning phase.

${config.timeframe ? `\n**Timeframe:** ${config.timeframe}` : ''}
${config.resources ? `\n**Available Resources:** ${config.resources}` : ''}`;
}

function buildAssimilationPrompt(config: {
  desiredOutcome: string;
  currentReality: string;
  timeframe?: string;
  resources?: string;
}): string {
  return `# ASSIMILATION - Making Creation Part of You

## Structural Tension Map
**Vision:** ${config.desiredOutcome}
**Current Reality:** ${config.currentReality}
**Creative Tension:** The gap between vision and reality generates energy to move toward your desired outcome.

## Assimilation Process
The initial excitement may be settling, but this is where real creative work happens. You're internalizing the creative process.

### Structural Tension Work:
- Hold both vision AND current reality clearly in awareness
- Feel the natural tension - this is your creative power
- Notice how this tension wants to resolve toward your vision
- Trust that your mind will generate solutions

### Momentum Building:
- What actions are naturally emerging from this tension?
- What resources are becoming available?
- What connections or opportunities are appearing?
- What new insights are being generated?
- What coincidences or synchronicities are occurring?

### Progress Assessment:
- How is your vision becoming clearer and more specific?
- What aspects of the end result are starting to become visible?
- What course corrections are needed based on what you're learning?
- What's working well in your creative process?
- What obstacles are resolving naturally?

### Natural Movement:
- What feels like the natural next step?
- Where do you have the most energy and momentum?
- What would bring you closer to your desired outcome?
- What adjustments want to be made?

**Trust the Process:** Allow natural movement and useful coincidences to emerge. Your creative unconscious is working when structural tension is clearly established.

${config.timeframe ? `\n**Timeline Check:** ${config.timeframe}` : ''}
${config.resources ? `\n**Resource Status:** ${config.resources}` : ''}`;
}

function buildCompletionPrompt(config: {
  desiredOutcome: string;
  currentReality: string;
  timeframe?: string;
  resources?: string;
}): string {
  return `# COMPLETION - Bringing Creation to Full Fruition

## Near-Completion Status
**Original Vision:** ${config.desiredOutcome}
**Current Progress:** ${config.currentReality}
**Phase:** Final stages of creative process

## Completion Guidance
Your creation is nearly complete. This phase has its own energy and requirements.

### Finishing Touches:
- What final details will bring this to full completion?
- What finishing touches would make this truly satisfying?
- What would make you proud to share this creation?
- What small refinements would perfect it?

### Completion Resistance Management:
- Resist urge to add unnecessary complexity
- Don't get distracted by new exciting projects
- Stay focused on completing what you started
- Recognize that completion anxiety is normal

### Quality Assessment:
- Does this creation fulfill your original vision?
- What aspects exceed your expectations?
- What would you do differently next time?
- What are you most proud of in this creation?

### Transition Preparation:
- How will you know when this is truly complete?
- What will it feel like to shift from creator to audience?
- How will you celebrate and appreciate what you've created?
- What new creative visions are emerging from this completion?

### Final Steps:
- What would bring this creative process to successful conclusion?
- What documentation or presentation does it need?
- Who would appreciate seeing this completed creation?
- How does this completion set you up for future creations?

**Complete the Cycle:** Finish this creation fully so you can appreciate what you've brought into being and be ready for your next creative adventure.

${config.timeframe ? `\n**Timeline:** ${config.timeframe}` : ''}
${config.resources ? `\n**Final Resources:** ${config.resources}` : ''}`;
}

function buildStructuralTensionPrompt(tension: StructuralTension): string {
  return `# STRUCTURAL TENSION - Your Creative Energy

## Vision (What You Want to Create)
${tension.vision}

## Current Reality (Where You Are Now)  
${tension.currentReality}

## The Creative Tension
${tension.energy}

This tension is your creative power. It wants to resolve by moving toward your vision. What actions naturally want to emerge from this tension?

### Questions for Movement:
- What's the smallest step you could take toward your vision today?
- What resources do you have available right now?
- What would bring you closer to your desired outcome?
- What feels like the natural next action?

**Trust the Tension:** This discrepancy between vision and reality is not a problem to solve - it's the creative force that will move you toward what you want to create.`;
}

// Detect problem-solving language and redirect
function detectProblemSolvingLanguage(text: string): string | null {
  const problemWords = ['problem', 'challenge', 'fix', 'solve', 'issue', 'difficulty', 'trouble', 'prevent', 'stop', 'avoid', 'eliminate'];
  const detectedWords = problemWords.filter(word => 
    text.toLowerCase().includes(word)
  );
  
  if (detectedWords.length > 0) {
    return `🌊 **REACTIVE PATTERN DETECTED**

I noticed problem-solving language in your description: "${detectedWords.join(', ')}"

**Creative Orientation Reframe**:
The creative process is about bringing desired outcomes into being, not solving problems or eliminating what you don't want.

**Instead of**: "I need to fix/solve/stop..."
**Try**: "I want to create/establish/bring into being..."

**Structural Shift**:
- **Reactive-Responsive**: Focus on what's wrong → eliminate problems
- **Creative Orientation**: Focus on what you want → manifest desired outcomes

**Question for Reframe**: What specific positive outcome do you want to create or bring into existence?

This shift moves you from reactive patterns (which often create oscillation) to creative patterns (which generate advancing structures).`;
  }
  
  return null;
}

const creativeProcessSchema = z.object({
  desiredOutcome: z.string().min(1).describe("What specific outcome do you want to create? Focus on what you want to bring into being, not problems to solve."),
  currentReality: z.string().optional().describe("Where are you now in relation to this vision? Describe your current situation objectively."),
  creativePhase: z.enum(['germination', 'assimilation', 'completion']).default('germination').describe("Which phase: germination (beginning excitement), assimilation (building momentum), or completion (finishing touches)?"),
  model: z.string().optional().describe("Optional Gemini model to use (e.g., 'gemini-2.5-flash'). Defaults to gemini-2.5-pro."),
  timeframe: z.string().optional().describe("When do you want this created? (optional timeline)"),
  resources: z.string().optional().describe("What resources do you have available? (skills, connections, budget, etc.)")
});

export const createTool: UnifiedTool = {
  name: "create",
  description: "🌊 Support authentic creative process through Fritz's three phases: Germination (initial excitement), Assimilation (building momentum), Completion (finishing touches). Enhanced with structural tension analysis, bias detection, and creative orientation validation. Focus on what you want to bring into being.",
  zodSchema: creativeProcessSchema,
  prompt: {
    description: "Guide creative process with enhanced structural awareness, automatic bias detection, and quality assessment of vision/reality clarity for optimal creative tension generation.",
  },
  category: 'creative',
  execute: async (args, onProgress) => {
    const {
      desiredOutcome,
      currentReality,
      creativePhase = 'germination',
      model,
      timeframe,
      resources
    } = args;

    if (!desiredOutcome?.trim()) {
      throw new Error("What specific outcome do you want to create? The creative process begins with a clear desired result, not a problem to solve.");
    }

    // Check for problem-solving language
    const problemRedirect = detectProblemSolvingLanguage(desiredOutcome as string);
    if (problemRedirect) {
      return problemRedirect;
    }

    let enhancedPrompt: string;

    // Build phase-specific prompt
    switch (creativePhase) {
      case 'germination':
        enhancedPrompt = buildGerminationPrompt({
          desiredOutcome: desiredOutcome as string,
          currentReality: currentReality as string | undefined,
          timeframe: timeframe as string | undefined,
          resources: resources as string | undefined
        });
        onProgress?.(`Germination phase: Exploring your creative vision...`);
        break;

      case 'assimilation':
        if (!currentReality?.trim()) {
          throw new Error("Assimilation phase requires both your vision AND current reality to establish structural tension.");
        }
        enhancedPrompt = buildAssimilationPrompt({
          desiredOutcome: desiredOutcome as string,
          currentReality: currentReality as string,
          timeframe: timeframe as string | undefined,
          resources: resources as string | undefined
        });
        onProgress?.(`Assimilation phase: Building momentum through structural tension...`);
        break;

      case 'completion':
        if (!currentReality?.trim()) {
          throw new Error("Completion phase requires understanding where you are now in relation to your original vision.");
        }
        enhancedPrompt = buildCompletionPrompt({
          desiredOutcome: desiredOutcome as string,
          currentReality: currentReality as string,
          timeframe: timeframe as string | undefined,
          resources: resources as string | undefined
        });
        onProgress?.(`Completion phase: Bringing your creation to fruition...`);
        break;

      default:
        throw new Error("Invalid creative phase. Please specify: germination, assimilation, or completion.");
    }

    Logger.debug(`Create: ${creativePhase} phase for outcome: ${desiredOutcome}`);
    
    // Execute with Gemini
    const result = await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
    
    // Add structural tension analysis for assimilation phase
    if (creativePhase === 'assimilation' && currentReality) {
      const tension = calculateStructuralTension(desiredOutcome as string, currentReality as string);
      const tensionPrompt = buildStructuralTensionPrompt(tension);
      return `${result}\n\n---\n\n${tensionPrompt}`;
    }
    
    return result;
  }
};