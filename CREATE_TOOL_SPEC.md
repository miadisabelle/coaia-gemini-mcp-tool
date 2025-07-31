# CREATE Tool Specification

**Replacement for the brainstorm tool based on Robert Fritz's Creative Orientation**

---

## Tool Overview

**Name:** `create`  
**Purpose:** Support authentic creative processes through Fritz's three-phase framework  
**Paradigm:** Creative Orientation (generative) vs Reactive-Responsive (problem-solving)

## Core Principles

### 1. Creative Orientation
- **Focus:** What do you want to create?
- **Energy:** Structural tension between vision and current reality
- **Process:** Germination → Assimilation → Completion
- **Motivation:** Bring desired outcomes into being

### 2. Structural Tension
The fundamental creative force:
```
Vision (what you want) ↔ Current Reality (where you are) = Creative Energy
```

### 3. Three-Phase Process
Each phase has distinct characteristics and requirements:
- **Germination:** Initial excitement, vision clarification, balanced planning/action
- **Assimilation:** Internalize tension, build momentum, gather resources  
- **Completion:** Finishing touches, resist complexity, successful conclusion

## Technical Specification

### Schema Design
```typescript
const creativeProcessSchema = z.object({
  desiredOutcome: z.string().min(1).describe("What specific outcome do you want to create?"),
  currentReality: z.string().optional().describe("Where are you now in relation to this vision?"),
  creativePhase: z.enum(['germination', 'assimilation', 'completion']).default('germination').describe("Which phase of the creative process are you in?"),
  model: z.string().optional().describe("Gemini model to use"),
  timeframe: z.string().optional().describe("When do you want this created?"),
  resources: z.string().optional().describe("What resources do you have available?")
});
```

### Tool Interface
```typescript
export const createTool: UnifiedTool = {
  name: "create",
  description: "Support authentic creative process through Germination, Assimilation, and Completion phases. Based on Robert Fritz's creative orientation framework - focuses on desired outcomes, not problem-solving.",
  zodSchema: creativeProcessSchema,
  prompt: {
    description: "Guide creative process based on desired outcomes and structural tension, supporting generative creation rather than reactive problem-solving"
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    // Phase-specific implementation
  }
};
```

## Phase-Specific Implementations

### Germination Phase Prompt
```typescript
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
```

### Assimilation Phase Prompt  
```typescript
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
```

### Completion Phase Prompt
```typescript
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
```

## Structural Tension Calculator

```typescript
interface StructuralTension {
  vision: string;
  currentReality: string;
  tension: number;        // 0-10 scale of clarity/strength
  energy: string;         // Description of creative energy available
  naturalActions: string[]; // Actions that want to emerge
}

function calculateStructuralTension(
  vision: string, 
  currentReality: string
): StructuralTension {
  // Calculate tension strength based on clarity of both elements
  const visionClarity = vision.length > 50 && vision.includes('specific') ? 8 : 5;
  const realityClarity = currentReality.length > 30 ? 7 : 4;
  const tensionStrength = Math.min(visionClarity, realityClarity);
  
  return {
    vision,
    currentReality,
    tension: tensionStrength,
    energy: tensionStrength > 6 
      ? "Strong creative energy - tension is clear and motivating"
      : "Moderate energy - vision or current reality could be clearer",
    naturalActions: [] // User generates these through the process
  };
}
```

## Usage Examples

### Germination Example
```
desiredOutcome: "Create a mobile app that helps people track their creative projects with inspiration and momentum features"
currentReality: "I have programming skills but have never built a mobile app. I use paper notebooks for my creative projects now."
creativePhase: "germination"
timeframe: "Launch in 6 months"
```

### Assimilation Example  
```
desiredOutcome: "Launch the creative project tracking app with 100 beta users"
currentReality: "I've built the core features and have a working prototype. 5 friends are testing it and giving feedback."
creativePhase: "assimilation"
resources: "React Native skills, Apple Developer account, $500 marketing budget"
```

### Completion Example
```
desiredOutcome: "Successful app launch with positive user feedback and sustainable growth"
currentReality: "App is in app store with 80 downloads, 4.2 star rating, getting organic growth through word of mouth"
creativePhase: "completion"
```

## Error Handling

### Invalid Phase Detection
```typescript
if (!['germination', 'assimilation', 'completion'].includes(phase)) {
  throw new Error("Please specify which creative phase you're in: germination (beginning), assimilation (building momentum), or completion (finishing touches)");
}
```

### Missing Vision
```typescript
if (!desiredOutcome?.trim()) {
  throw new Error("What specific outcome do you want to create? The creative process begins with a clear desired result, not a problem to solve.");
}
```

### Problem-Solving Language Detection
```typescript
if (desiredOutcome.includes('problem') || desiredOutcome.includes('challenge') || desiredOutcome.includes('fix')) {
  return `I noticed problem-solving language in your description. The creative process is about bringing desired outcomes into being, not solving problems. 

Instead of focusing on what you want to fix or solve, try rephrasing as: "What do you want to create?" or "What outcome do you want to bring into being?"

This shifts from reactive-responsive orientation to creative orientation.`;
}
```

## Integration Points

### MCP Integration
- Tool appears in `/create` slash command
- Natural language: "help me create..." or "I want to create..."
- Progress tracking through phases

### Gemini CLI Integration  
- Uses existing `executeGeminiCLI` function
- Phase-specific prompts sent to Gemini
- Structured responses focused on creative guidance

### Documentation Integration
- Update all references from "brainstorm" to "create"
- New usage examples in docs
- Phase-specific guidance documentation

## Migration Strategy

1. **Parallel Implementation:** Build `create.tool.ts` alongside existing `brainstorm.tool.ts`
2. **Gradual Rollout:** Test with internal users first
3. **Deprecation:** Mark brainstorm tool as deprecated with migration guidance
4. **Full Replacement:** Remove brainstorm tool after successful migration

---

**Philosophy:** This tool supports authentic creative work based on Fritz's proven framework rather than applying business methodologies to creative processes. It honors the mystery and generative nature of true creation while providing practical structural support.