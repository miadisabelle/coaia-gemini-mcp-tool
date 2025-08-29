import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

// Bias detection and correction system
interface BiasAnalysis {
  hasBias: boolean;
  detectedPatterns: string[];
  biasType: 'problem-solving' | 'enhancement' | 'gap-filling' | 'reactive' | 'none';
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

function detectReactivePatterns(text: string): BiasAnalysis {
  const problemSolvingWords = [
    'problem', 'challenge', 'issue', 'difficulty', 'trouble', 
    'fix', 'solve', 'resolve', 'address', 'tackle',
    'eliminate', 'prevent', 'stop', 'avoid', 'reduce',
    'improve', 'enhance', 'optimize', 'upgrade', 'better'
  ];

  const gapFillingWords = [
    'gap', 'bridge', 'fill', 'void', 'missing', 'lack',
    'need', 'should', 'must', 'require', 'necessary'
  ];

  const reactiveStructures = [
    'how to', 'ways to', 'steps to', 'methods for',
    'in order to', 'so that', 'to ensure'
  ];

  const detectedProblems = problemSolvingWords.filter(word => 
    text.toLowerCase().includes(word)
  );

  const detectedGaps = gapFillingWords.filter(word =>
    text.toLowerCase().includes(word)
  );

  const detectedStructures = reactiveStructures.filter(phrase =>
    text.toLowerCase().includes(phrase)
  );

  const allDetected = [...detectedProblems, ...detectedGaps, ...detectedStructures];

  if (allDetected.length === 0) {
    return {
      hasBias: false,
      detectedPatterns: [],
      biasType: 'none',
      severity: 'low',
      suggestions: []
    };
  }

  // Determine bias type and severity
  let biasType: BiasAnalysis['biasType'] = 'reactive';
  let severity: BiasAnalysis['severity'] = 'low';

  if (detectedProblems.length > 0) {
    biasType = 'problem-solving';
    severity = detectedProblems.length > 3 ? 'high' : detectedProblems.length > 1 ? 'medium' : 'low';
  } else if (detectedGaps.length > 0) {
    biasType = 'gap-filling';
    severity = detectedGaps.length > 3 ? 'high' : detectedGaps.length > 1 ? 'medium' : 'low';
  } else if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('enhance')) {
    biasType = 'enhancement';
    severity = 'medium';
  }

  // Generate suggestions based on detected patterns
  const suggestions = generateReframeSuggestions(allDetected, biasType);

  return {
    hasBias: true,
    detectedPatterns: allDetected,
    biasType,
    severity,
    suggestions
  };
}

function generateReframeSuggestions(detectedWords: string[], biasType: BiasAnalysis['biasType']): string[] {
  const suggestions: string[] = [];

  switch (biasType) {
    case 'problem-solving':
      suggestions.push("Reframe from 'What problem needs solving?' to 'What outcome do I want to create?'");
      suggestions.push("Replace problem language with desired end states");
      suggestions.push("Focus on what you want to bring into being, not what you want to eliminate");
      break;

    case 'gap-filling':
      suggestions.push("Instead of 'bridging gaps', describe the complete desired outcome");
      suggestions.push("Replace 'what's missing' with 'what I want to establish'");
      suggestions.push("Shift from void-elimination to outcome-manifestation");
      break;

    case 'enhancement':
      suggestions.push("Move from 'making X better' to 'creating specific desired version of X'");
      suggestions.push("Define the complete desired outcome, not improvements to current state");
      suggestions.push("Ask 'What do I want to create?' rather than 'How can I improve this?'");
      break;

    case 'reactive':
      suggestions.push("Identify the desired outcome first, then consider structural tension");
      suggestions.push("Replace reactive responses with proactive creation");
      suggestions.push("Focus on advancing toward vision, not reacting to circumstances");
      break;

    default:
      suggestions.push("Consider using creative orientation language");
      break;
  }

  return suggestions;
}

function buildBiasAnalysisPrompt(text: string, analysis: BiasAnalysis): string {
  if (!analysis.hasBias) {
    return `🌊 **BIAS ANALYSIS: CLEAN CREATIVE ORIENTATION**

**Text Analyzed**: "${text}"

**Result**: ✅ No significant reactive bias detected

**Creative Orientation Assessment**:
- Language appears focused on desired outcomes
- Minimal problem-solving or enhancement patterns
- Good foundation for structural tension work

**Suggestions for Enhancement**:
- Consider making desired outcomes even more specific
- Ensure current reality is objective and factual
- Look for opportunities to strengthen creative vision

**Next Steps**: Use \`create\` or \`create-tension-chart\` tools to develop this creative orientation further.`;
  }

  return `🌊 **REACTIVE BIAS DETECTED**

**Text Analyzed**: "${text}"

**Bias Analysis**:
- **Type**: ${analysis.biasType.toUpperCase()}
- **Severity**: ${analysis.severity.toUpperCase()}
- **Detected Patterns**: ${analysis.detectedPatterns.join(', ')}

## Structural Thinking Reframe

**The Issue**: Your language indicates reactive-responsive orientation rather than creative orientation. This typically leads to oscillating patterns instead of advancing patterns.

**Reactive Pattern**: ${analysis.biasType === 'problem-solving' ? 'Focus on eliminating what you don\'t want' : 
  analysis.biasType === 'gap-filling' ? 'Focus on filling voids or bridging gaps' :
  analysis.biasType === 'enhancement' ? 'Focus on making existing things better' :
  'Focus on reacting to circumstances rather than creating desired outcomes'}

**Creative Alternative**: Focus on clearly defining what you want to create or bring into being

## Reframe Suggestions

${analysis.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

## Conversion Questions

**Instead of asking**: "How do I solve/fix/improve this?"
**Ask**: "What specific outcome do I want to create?"

**Instead of saying**: "I need to eliminate/prevent/stop..."
**Say**: "I want to establish/create/manifest..."

## Structural Tension Approach

Once you've reframed in creative language:
1. **Desired Outcome**: What do you want to create?
2. **Current Reality**: Where are you now objectively?
3. **Structural Tension**: Feel the natural tension between these two
4. **Action Steps**: What naturally wants to emerge from this tension?

**Next Step**: Rewrite your request using creative orientation language, then use \`create\` or \`create-tension-chart\` tools.`;
}

const biasDetectorSchema = z.object({
  text: z.string().min(1).describe("The text to analyze for reactive bias patterns (problem-solving, enhancement, gap-filling language)"),
  autoCorrect: z.boolean().default(false).describe("Whether to automatically generate creative orientation alternatives"),
  focus: z.enum(['problem-solving', 'gap-filling', 'enhancement', 'reactive', 'all']).default('all').describe("Specific bias type to focus detection on"),
  model: z.string().optional().describe("Optional Gemini model for enhanced bias analysis")
});

export const biasDetectorTool: UnifiedTool = {
  name: "bias-detector", 
  description: "🌊 Detect and correct reactive bias patterns in language and thinking. Identifies problem-solving, enhancement, gap-filling, and other reactive orientations that lead to oscillating patterns. Provides creative orientation alternatives for advancing patterns.",
  zodSchema: biasDetectorSchema,
  prompt: {
    description: "Analyze text for reactive bias patterns and provide creative orientation reframes. Essential for maintaining advancing patterns rather than oscillating problem-solving cycles.",
  },
  category: 'structural',
  execute: async (args, onProgress) => {
    const { text, autoCorrect = false, focus = 'all', model } = args;

    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error("🌊 What text do you want to analyze for reactive bias patterns?");
    }

    onProgress?.(`🌊 Analyzing for reactive bias patterns...`);

    // Perform bias detection
    const analysis = detectReactivePatterns(text as string);
    
    // Generate initial analysis
    const analysisResult = buildBiasAnalysisPrompt(text as string, analysis);

    if (!autoCorrect || !analysis.hasBias) {
      Logger.debug(`🌊 Bias-detector: ${analysis.hasBias ? 'Bias detected' : 'Clean'} - ${analysis.biasType}`);
      return analysisResult;
    }

    // Auto-correction with Gemini
    onProgress?.(`🌊 Generating creative orientation alternatives...`);

    const correctionPrompt = `${analysisResult}

**AUTO-CORRECTION REQUEST**:

Based on the bias analysis above, please provide:

1. **Creative Rewrite**: Rewrite the original text using creative orientation language
2. **Structural Tension Setup**: Format as desired outcome + current reality if possible
3. **Action Alternative**: If the original was asking for actions, suggest how to approach this through structural tension

**Original Text**: "${text}"

**Focus on**: 
- What does the person want to CREATE or BRING INTO BEING?
- How can this be framed as a desired outcome rather than problem elimination?
- What structural tension would naturally generate the needed actions?

Make the rewrite practical and actionable while maintaining creative orientation.`;

    const correctionResult = await executeGeminiCLI(correctionPrompt, model as string | undefined, false, false, onProgress);

    Logger.debug(`🌊 Bias-detector: Auto-correction applied for ${analysis.biasType} bias`);

    return `${analysisResult}\n\n---\n\n🌊 **AUTO-CORRECTION APPLIED**\n\n${correctionResult}`;
  }
};