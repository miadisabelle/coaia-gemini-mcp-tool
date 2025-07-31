# Brainstorm Tool Refactoring Plan

**From Problem-Solving to Creative Orientation**

Based on Robert Fritz's "Creating Your Life" framework

---

## Executive Summary

The current `brainstorm` tool operates from a **Reactive-Responsive Orientation** (problem-solving) when it should support **Creative Orientation** (generative creation). This plan outlines the complete refactoring needed to align with authentic creative processes.

## Core Paradigm Shift

### Current Approach (Problem-Solving)
- "What's your brainstorming challenge?"
- Business methodology frameworks (SCAMPER, design-thinking)
- Feasibility scoring (1-5 scales)
- Focus on eliminating problems

### New Approach (Creative Orientation)
- "What do you want to create?"
- Fritz's three-phase creative process
- Structural tension framework
- Focus on bringing desired outcomes into being

## Detailed Refactoring Segments

### 1. Tool Renaming and Core Identity
**Current:** `brainstorm` tool
**New:** `create` tool

**Rationale:** "Brainstorming" is free-association of unrelated ideas, not creative work. "Creating" aligns with Fritz's creative orientation.

### 2. Schema Complete Redesign

**Current Schema Issues:**
```typescript
// Lines 118-127: Problem-solving parameters
prompt: "brainstorming challenge or question"
methodology: ['divergent', 'convergent', 'scamper', 'design-thinking']
constraints: "limitations and boundaries"
includeAnalysis: feasibility scoring
```

**New Schema:**
```typescript
const creativeProcessSchema = z.object({
  desiredOutcome: z.string().min(1).describe("What specific outcome do you want to create?"),
  currentReality: z.string().optional().describe("Where are you now in relation to this vision?"),
  creativePhase: z.enum(['germination', 'assimilation', 'completion']).default('germination'),
  model: z.string().optional(),
  timeframe: z.string().optional().describe("When do you want this created?"),
  resources: z.string().optional().describe("What resources do you have available?")
});
```

### 3. Remove All Business Methodologies

**Current Code (Lines 70-116):** Remove entirely
- SCAMPER framework
- Design-thinking approach  
- Divergent/convergent thinking
- Lateral thinking methodology
- All problem-solving frameworks

**Replace With:** Fritz's Creative Process Phases

### 4. Implement Three-Phase Creative Process

#### Phase 1: Germination
**Characteristics:**
- Initial excitement and exploration
- Move from general idea to specific vision
- Balance planning with action
- Research but avoid over-planning

**Implementation:**
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
${config.currentReality || 'Describe where you are now in relation to this vision...'}

## Germination Guidance
This is the exciting beginning phase of creation. Let yourself feel the possibility and energy of what you want to create.

### Questions to Explore:
- What does the completed creation look like specifically?
- What draws you to create this particular outcome?
- What aspects are you most excited about?
- What would success look and feel like?

### Next Steps:
- Move from general idea to specific, clear vision
- Do some initial research or exploration, but don't over-plan
- Take one small action today toward this creation
- Notice what resources or connections might be helpful

**Remember:** This is about what you want to bring into being, not problems to solve. Stay focused on the outcome you desire.`;
}
```

#### Phase 2: Assimilation
**Characteristics:**
- Internalize structural tension
- Develop momentum and natural movement
- Generate actions toward vision
- Build connections and resources

**Implementation:**
```typescript
function buildAssimilationPrompt(config: {
  desiredOutcome: string;
  currentReality: string;
  timeframe?: string;
  resources?: string;
}): string {
  return `# ASSIMILATION - Deepening Your Creative Process

## Structural Tension Analysis
**Vision:** ${config.desiredOutcome}
**Current Reality:** ${config.currentReality}

## Assimilation Guidance
You're now in the phase where you make this creation part of you. The initial excitement may be settling, but this is where real progress happens.

### Internalizing Structural Tension:
- Hold both your vision AND current reality clearly in mind
- Feel the natural tension between where you are and where you want to be
- This tension is your creative energy - it wants to resolve toward your vision

### Momentum Building:
- What actions naturally want to emerge from this tension?
- What resources are becoming available to you?
- What connections or opportunities are appearing?
- What new ideas are being generated?

### Focus Questions:
- How is your vision becoming clearer and more specific?
- What aspects of the end result are starting to become visible?
- What adjustments need to be made as you learn more?
- What's working well in your creative process?

**Trust the Process:** Allow natural movement and useful coincidences to emerge. Your mind will generate creative solutions when structural tension is clearly established.`;
}
```

#### Phase 3: Completion
**Characteristics:**
- Creation nearly fully created
- Add finishing touches
- Resist unnecessary complexity
- Successfully conclude process

**Implementation:**
```typescript
function buildCompletionPrompt(config: {
  desiredOutcome: string;
  currentReality: string;
  timeframe?: string;
  resources?: string;
}): string {
  return `# COMPLETION - Bringing Your Creation to Fruition

## Near Completion Status
**Original Vision:** ${config.desiredOutcome}
**Current Progress:** ${config.currentReality}

## Completion Guidance
You're in the final phase of your creative process. The creation is nearly complete and it's time for finishing touches.

### Completion Focus:
- What finishing touches will bring this creation to full completion?
- What final details need attention?
- What would make this creation truly complete and satisfying?

### Avoiding Completion Resistance:
- Resist the urge to add unnecessary complexity
- Don't get distracted by new exciting projects until this is done
- Stay focused on completing what you started
- Trust that this phase has its own energy and satisfaction

### Preparing for Transition:
- How will you know when this creation is truly complete?
- What will it feel like to shift from being the creator to being the audience?
- How will you appreciate and enjoy what you've created?

### Final Questions:
- What would bring this creative process to a successful conclusion?
- What are you most proud of in this creation?
- What have you learned about your own creative process?

**Bring it Home:** Complete this creation so you can fully appreciate what you've brought into being.`;
}
```

### 5. Structural Tension Framework

**Core Concept:**
Creative energy comes from tension between:
1. **Vision** (desired outcome)
2. **Current Reality** (where you are now)

This tension naturally resolves by moving toward the vision.

**Implementation:**
```typescript
interface StructuralTension {
  vision: string;           // What you want to create
  currentReality: string;   // Where you are now
  tension: string;          // The gap that creates energy
  actions: string[];        // Natural actions that emerge
}

function calculateStructuralTension(vision: string, currentReality: string): StructuralTension {
  return {
    vision,
    currentReality,
    tension: `The creative tension between your vision and current reality creates natural energy to move toward what you want to create.`,
    actions: [] // These emerge from the user's own process
  };
}

function buildStructuralTensionPrompt(tension: StructuralTension): string {
  return `# STRUCTURAL TENSION - Your Creative Energy

## Vision (What You Want to Create)
${tension.vision}

## Current Reality (Where You Are Now)  
${tension.currentReality}

## The Creative Tension
${tension.tension}

This tension is your creative power. It wants to resolve by moving toward your vision. What actions naturally want to emerge from this tension?

### Questions for Movement:
- What's the smallest step you could take toward your vision today?
- What resources do you have available right now?
- What would bring you closer to your desired outcome?
- What feels like the natural next action?

**Trust the Tension:** This discrepancy between vision and reality is not a problem to solve - it's the creative force that will move you toward what you want to create.`;
}
```

## Specific File Changes Required

### src/tools/brainstorm.tool.ts
**Action:** Complete rewrite to `create.tool.ts`

**Key Changes:**
- **Lines 20-23:** Replace "BRAINSTORMING SESSION" and "Core Challenge" 
- **Lines 70-116:** Remove all methodology frameworks
- **Lines 118-127:** Redesign schema completely
- **Lines 129-131:** Update tool description
- **Lines 149-151:** Change error message language
- **Lines 153-161:** Replace buildBrainstormPrompt with phase-specific functions

### src/tools/index.ts
**Action:** Update import and registration
```typescript
// Change from:
import { brainstormTool } from './brainstorm.tool.js';

// To:
import { createTool } from './create.tool.js';

// Update registry:
toolRegistry.push(
  askGeminiTool,
  pingTool,
  helpTool,
  createTool,  // Changed from brainstormTool
  fetchChunkTool,
  timeoutTestTool
);
```

### src/constants.ts
**Action:** Update ToolArguments interface
```typescript
// Remove brainstorm-specific parameters:
methodology?: string;
domain?: string; 
constraints?: string;
existingContext?: string;
ideaCount?: number;
includeAnalysis?: boolean;

// Add creative process parameters:
desiredOutcome?: string;
currentReality?: string;
creativePhase?: string;
timeframe?: string;
resources?: string;
```

## New Tool Architecture

```
Create Tool
├── Germination Phase Support
│   ├── Initial excitement and exploration
│   ├── Vision clarification  
│   └── Planning/action balance
├── Assimilation Phase Support
│   ├── Structural tension internalization
│   ├── Momentum building
│   └── Resource gathering
├── Completion Phase Support
│   ├── Finishing touches
│   ├── Completion resistance handling
│   └── Creator-to-audience transition
└── Structural Tension Framework
    ├── Vision + Current Reality
    ├── Creative energy generation
    └── Natural action emergence
```

## Implementation Priority

1. **High Priority:** Schema redesign and core prompt restructuring
2. **High Priority:** Remove all business methodology frameworks  
3. **High Priority:** Implement basic structural tension framework
4. **Medium Priority:** Full three-phase implementation
5. **Medium Priority:** Advanced phase-specific guidance
6. **Low Priority:** UI/UX enhancements for new paradigm

## Success Metrics

**Old Metrics (Remove):**
- Number of ideas generated
- Feasibility scores
- Implementation difficulty ratings

**New Metrics (Creative Orientation):**
- Clarity of desired outcome
- Strength of structural tension
- Natural action emergence
- Phase-appropriate progress
- Creative energy and momentum

## Philosophical Foundation

This refactoring is based on Robert Fritz's fundamental insight:

> **Creating is not problem-solving.** Problem-solving is reactive-responsive (getting rid of what you don't want). Creating is generative (bringing into being what you do want). These are different cognitive processes with different orientations and different results.

The new tool supports authentic creative work rather than applying business methodologies to creative processes.

---

**Next Steps:** Begin implementation with schema redesign and core prompt restructuring.