import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Core pattern types in structural thinking
type BehaviorPattern = 'oscillation' | 'advancing' | 'unclear';

interface PatternAnalysis {
  pattern: BehaviorPattern;
  confidence: number;
  evidence: string[];
  implications: string;
}

function buildOscillationDetectionPrompt(): string {
  return `🌊 **OSCILLATION PATTERN DETECTION**

**Definition**: A repeating cycle where the system advances toward a goal, then reverses, ending up back where it started.

**Key Characteristics**:
- Cyclical advancement followed by regression
- Returns to starting state repeatedly
- Progress is temporary and unsustainable
- May involve pendulum swings between extremes

**Examples**:
- Company builds up capacity → downsizes → builds up → downsizes
- Organization centralizes → decentralizes → centralizes again
- Person gains weight → loses weight → gains weight back
- Team improves performance → performance degrades → improves again

**Detection Questions**:
- Does this system show repeated cycles of progress and regression?
- Are there patterns of building up followed by tearing down?
- Does success in one area lead to problems that reverse the progress?
- Is there a pendulum swing between opposite approaches?

**Note**: Oscillation is a "terrible structure for personal life or for a company" but identifying it is neutral observation, not judgment.`;
}

function buildAdvancingDetectionPrompt(): string {
  return `🌊 **ADVANCING/RESOLVING PATTERN DETECTION**

**Definition**: A structure that consistently moves from clearly defined current reality toward a desired outcome.

**Key Characteristics**:
- Driven by structural tension between current reality and desired outcome
- Progress builds on previous progress
- Movement is generally in one direction toward the goal
- Success creates momentum for continued advancement

**Mechanism**: 
- **Structural Tension**: Natural tendency for discrepancy between desired state and current state to seek resolution
- This tension is the creative force that generates advancing movement

**Examples**:
- Person learns skill → practices → gets better → applies skill → learns more
- Company identifies market need → develops product → sells → reinvests in improvement
- Team sets clear goals → makes progress → celebrates success → sets next goals
- System establishes feedback loops that reinforce desired behavior

**Detection Questions**:
- Is there clear structural tension between current reality and desired outcome?
- Does progress in one area support further progress?
- Are there feedback loops that reinforce advancement?
- Is the system generally moving toward a specific desired state?`;
}

function buildPatternAnalysisPrompt(situation: string): string {
  return `🌊 **BEHAVIORAL PATTERN ANALYSIS**

**System/Situation to Analyze**: ${situation}

**Analysis Framework**:

${buildOscillationDetectionPrompt()}

---

${buildAdvancingDetectionPrompt()}

---

**Your Analysis Task**:

1. **Pattern Identification**: Based on the situation described, which pattern does this system exhibit?
   - Oscillation (cyclical progress/regression)
   - Advancing (consistent movement toward desired outcome)
   - Unclear (insufficient information or mixed patterns)

2. **Evidence Collection**: What specific evidence supports your pattern identification?
   - List concrete examples from the situation
   - Note behavioral cycles or progression sequences
   - Identify structural elements (tensions, feedback loops, etc.)

3. **Confidence Assessment**: How confident are you in this pattern identification? (1-10 scale)
   - What makes you confident?
   - What information would increase confidence?
   - What aspects remain unclear?

4. **Structural Analysis**: What underlying structure is generating this pattern?
   - What forces are creating the behavior?
   - What structural elements support or undermine advancement?
   - How could the structure be modified to produce different patterns?

5. **Implications**: What does this pattern mean for the system's future?
   - If oscillation: What keeps the system stuck in cycles?
   - If advancing: What supports continued advancement?
   - What would need to change for different outcomes?

**Remember**: This is diagnostic observation. The goal is to understand what IS, not immediately to change it.`;
}

const detectPatternsSchema = z.object({
  situation: z.string().min(1).describe("The system, behavior, or situation you want to analyze for oscillation vs advancing patterns. Describe observable behaviors over time."),
  focus: z.enum(['oscillation', 'advancing', 'analyze', 'structure']).default('analyze').describe("Focus area: oscillation (check for cycles), advancing (check for progression), analyze (full pattern analysis), structure (identify underlying structural elements)"),
  timeframe: z.string().optional().describe("What time period to analyze (days, months, years) - helps identify cycle patterns"),
  model: z.string().optional().describe("Optional Gemini model for enhanced pattern recognition")
});

export const detectPatternsTool: UnifiedTool = {
  name: "detect-patterns",
  description: "🌊 Identify whether a system exhibits Oscillation (cyclical progress/regression) or Advancing (consistent movement toward desired outcomes) behavioral patterns. Core structural thinking diagnostic for understanding what underlying structure generates observed behaviors.",
  zodSchema: detectPatternsSchema,
  prompt: {
    description: "Analyze behavioral patterns to determine if a system is oscillating (terrible for organizations/personal life) or advancing (driven by structural tension). Essential for structural diagnosis before any change efforts.",
  },
  category: 'structural',
  execute: async (args, onProgress) => {
    const { situation, focus = 'analyze', timeframe, model } = args;

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      throw new Error("🌊 What system or behavior do you want to analyze? Describe observable patterns over time.");
    }

    let enhancedPrompt: string;

    switch (focus) {
      case 'oscillation':
        enhancedPrompt = `${buildOscillationDetectionPrompt()}

**Situation to Analyze**: ${situation}

**Oscillation Analysis**:
- Look for repeated cycles of advancement followed by regression
- Identify patterns where the system returns to starting states
- Note any pendulum swings between opposite approaches
- Consider whether success creates conditions for reversal

${timeframe ? `**Timeframe**: Analyze patterns over ${timeframe}` : ''}

**Question**: Does this situation exhibit oscillation patterns? What evidence supports or contradicts this?`;
        onProgress?.(`🌊 Analyzing for oscillation patterns...`);
        break;

      case 'advancing':
        enhancedPrompt = `${buildAdvancingDetectionPrompt()}

**Situation to Analyze**: ${situation}

**Advancing Pattern Analysis**:
- Look for consistent movement toward desired outcomes
- Identify structural tension between current reality and goals
- Note whether progress builds on previous progress
- Consider feedback loops that reinforce advancement

${timeframe ? `**Timeframe**: Analyze patterns over ${timeframe}` : ''}

**Question**: Does this situation exhibit advancing patterns? What structural tension drives it?`;
        onProgress?.(`🌊 Analyzing for advancing patterns...`);
        break;

      case 'structure':
        enhancedPrompt = `🌊 **STRUCTURAL ANALYSIS**

**Situation**: ${situation}

**Deep Structural Investigation**:
Focus on the underlying structural elements that generate the observed behavior patterns.

**Core Principle**: Structure determines behavior. What you observe is the result of underlying structural forces.

**Structural Elements to Identify**:
1. **Forces**: What forces are acting on this system?
2. **Tensions**: What unresolved tensions exist?
3. **Feedback Loops**: What reinforces current patterns?
4. **Constraints**: What limits or directs behavior?
5. **Incentives**: What does the structure reward/punish?

**Key Questions**:
- What structural elements keep this pattern in place?
- If the pattern is oscillation, what structure creates the reversal?
- If the pattern is advancing, what structure maintains momentum?
- How could the structure be modified to produce different patterns?

${timeframe ? `**Timeframe**: Consider structural forces over ${timeframe}` : ''}`;
        onProgress?.(`🌊 Analyzing underlying structural elements...`);
        break;

      case 'analyze':
      default:
        enhancedPrompt = buildPatternAnalysisPrompt(situation as string);
        if (timeframe) {
          enhancedPrompt += `\n\n**Timeframe Context**: Analyze patterns over ${timeframe}`;
        }
        onProgress?.(`🌊 Complete pattern analysis: Oscillation vs Advancing identification...`);
        break;
    }

    Logger.debug(`🌊 Detect-patterns: ${focus} focus for situation: ${situation}`);
    
    const result = await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
    
    // Add guidance based on focus
    const nextStepGuidance = focus === 'analyze'
      ? "\n\n🌊 **Next**: If pattern is oscillation, consider structural changes needed. If advancing, use `create` tool to enhance desired outcomes."
      : focus === 'structure'  
      ? "\n\n🌊 **Next**: Use insights about structure to inform `create` tool for building advancing patterns."
      : "\n\n🌊 **Next**: Use focus='analyze' for complete pattern analysis or focus='structure' for deep structural investigation.";
    
    return `${result}${nextStepGuidance}`;
  }
};