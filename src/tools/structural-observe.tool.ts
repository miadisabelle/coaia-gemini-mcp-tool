import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Types for structured observation
interface ObservationState {
  stage: 'nothing' | 'picturing' | 'questioning';
  mentalImage: string[];
  incompleteAspects: string[];
  questions: Question[];
}

interface Question {
  type: 'information' | 'clarification' | 'implication' | 'discrepancy';
  question: string;
  motivation: string; // What in the picture motivated this question
}

// Core structural thinking observation functions
function startWithNothing(): string {
  return `🌊 **STEP 1: START WITH NOTHING**

**Core Mandate**: Approach this observation without any preconceptions, comparisons, or imported knowledge.

**Discipline**: 
- Inhibit automatic association reflexes
- Do not compare to similar situations from training data
- Focus exclusively on what is presented
- Begin fresh with neutral observation

**Mental State**: Like an accountant examining unique books, not a historian making comparisons.

**Next**: Proceed to picture exactly what is being described.`;
}

function buildMentalPicture(input: string): string {
  return `🌊 **STEP 2: PICTURE WHAT IS SAID**

**Input to Picture**: "${input}"

**Core Mandate**: Translate this linear, verbal information into a dimensional, visual mental "movie."

**Process**:
- Create placeholder images for general terms
- Hold multiple ideas simultaneously to see relationships
- Build only what is explicitly stated - incomplete pictures provide critical data
- Avoid filling in blanks or making assumptions

**Mental Image Building**:
- What visual elements are explicitly described?
- What relationships between elements are stated?
- What aspects remain vague or general?
- What information is missing from the picture?

**Purpose**: This visual translation eliminates language bias and reveals what's actually present vs. assumed.`;
}

function generateQuestions(imageDescription: string): string {
  return `🌊 **STEP 3: ASK QUESTIONS (FOUR TYPES ONLY)**

**Current Mental Picture**: ${imageDescription}

**Core Mandate**: Ask ONLY questions internally motivated by the picture itself. No external knowledge import.

**Four Valid Question Types**:

**1. Information Questions** - Expand vague/general picture elements
- When: Part of picture is unclear or general
- Purpose: Get specific details to complete the image
- Example: "What specific type of X are you referring to?"

**2. Clarification Questions** - Define terminology in context
- When: User uses words/phrases needing definition in their context
- Purpose: Understand precise meaning of terms
- Example: "What do you mean by 'Y' in this specific situation?"

**3. Implication Questions** - Make implicit explicit
- When: Statement implies something unstated
- Purpose: Reveal hidden assumptions or consequences
- Example: "If Z is true, would that mean W?"

**4. Discrepancy Questions** - Address contradictions
- When: Two statements appear contradictory
- Purpose: Understand how contradictions coexist
- Example: "How can both A and B be true?"

**Generate Questions**: Based on the current mental picture, what questions naturally arise?`;
}

const structuralObserveSchema = z.object({
  input: z.string().min(1).describe("The situation, system, or reality you want to observe structurally. Describe what you're seeing without interpretation."),
  step: z.enum(['nothing', 'picture', 'questions', 'complete']).default('nothing').describe("Which step: nothing (start fresh), picture (build mental image), questions (ask internally-motivated questions), complete (full process)"),
  currentImage: z.string().optional().describe("Your current mental picture (for steps 2-3)"),
  model: z.string().optional().describe("Optional Gemini model for enhanced analysis")
});

export const structuralObserveTool: UnifiedTool = {
  name: "structural-observe",
  description: "🌊 Apply rigorous 3-step structural observation discipline: 1) Start with Nothing (no preconceptions), 2) Picture What Is Said (mental movie), 3) Ask Questions (4 types only). Embodies Ripple agent precision for understanding underlying structures that determine behavior.",
  zodSchema: structuralObserveSchema,
  prompt: {
    description: "Guide systematic structural observation to understand reality before any action. Identifies underlying structures that generate behavioral patterns.",
  },
  category: 'structural',
  execute: async (args, onProgress) => {
    const { input, step = 'nothing', currentImage, model } = args;

    if (!input || typeof input !== 'string' || !input.trim()) {
      throw new Error("🌊 What situation or system do you want to observe structurally? Describe what you're seeing without interpretation.");
    }

    let enhancedPrompt: string;

    switch (step) {
      case 'nothing':
        enhancedPrompt = `${startWithNothing()}

**Situation to Observe**: ${input}

**Your Task**: Apply Step 1 discipline. Approach this situation with no preconceptions. Do not compare it to anything else. Simply observe what is explicitly presented.`;
        onProgress?.(`🌊 Step 1: Starting with nothing - pure observation...`);
        break;

      case 'picture':
        enhancedPrompt = `${buildMentalPicture(input as string)}

**Now Build Your Mental Picture**:
- What specific visual elements do you see?
- What relationships are explicitly described?
- What remains vague or incomplete?
- Where do you notice gaps in the picture?

Remember: Incomplete pictures are valuable data, not problems to solve.`;
        onProgress?.(`🌊 Step 2: Building dimensional mental picture...`);
        break;

      case 'questions':
        if (!currentImage || typeof currentImage !== 'string' || !currentImage.trim()) {
          throw new Error("🌊 Questions step requires your current mental picture to generate internally-motivated questions.");
        }
        enhancedPrompt = `${generateQuestions(currentImage as string)}

**Generate Internally-Motivated Questions**:
Based on your mental picture, what questions naturally emerge? Use only the four valid types and explain what aspect of the picture motivates each question.`;
        onProgress?.(`🌊 Step 3: Generating internally-motivated questions...`);
        break;

      case 'complete':
        enhancedPrompt = `🌊 **COMPLETE STRUCTURAL OBSERVATION**

**Situation**: ${input}

Apply the full 3-step structural thinking discipline:

**STEP 1 - START WITH NOTHING**
Approach without preconceptions or comparisons. Observe exactly what is presented.

**STEP 2 - PICTURE WHAT IS SAID**  
Create a dimensional mental movie of the situation. Build only what's explicitly stated.

**STEP 3 - ASK QUESTIONS**
Generate questions internally motivated by your mental picture using only these four types:
- Information (expand vague elements)
- Clarification (define terms in context)
- Implication (make implicit explicit)
- Discrepancy (address contradictions)

**Goal**: Understand the underlying structure that generates the observed behavior patterns.

**Remember**: This is diagnostic observation, not problem-solving. The goal is to see what IS, not to change what is.`;
        onProgress?.(`🌊 Complete structural observation: Understanding the structure that determines behavior...`);
        break;

      default:
        throw new Error("🌊 Invalid step. Use: nothing, picture, questions, or complete.");
    }

    Logger.debug(`🌊 Structural-observe: ${step} step for input: ${input}`);
    
    const result = await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
    
    // Add footer with next step guidance
    const nextStepGuidance = step === 'complete' 
      ? "\n\n🌊 **Next**: Use `detect-patterns` to identify if this structure produces oscillation or advancing behavior."
      : step === 'nothing'
      ? "\n\n🌊 **Next**: Use step='picture' to build your mental image of this situation."
      : step === 'picture'
      ? "\n\n🌊 **Next**: Use step='questions' with your mental picture to generate internally-motivated questions."
      : "\n\n🌊 **Next**: Use step='complete' to apply full structural observation or `detect-patterns` to analyze behavioral patterns.";
    
    return `${result}${nextStepGuidance}`;
  }
};