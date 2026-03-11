# Canvas Assistant Architecture

This directory contains the new modular architecture for the Canvas Assistant API.

## Structure

```
canvas-assistant/
├── index.js                    # Express router (main entry point)
├── core/                       # Core agent orchestration
│   ├── Agent.js                # Main agent orchestrator
│   ├── AgentSession.js         # Session state management
│   └── ModelSelector.js         # Cost-optimized model selection
├── tools/                      # Tool system
│   ├── ToolRegistry.js         # Auto-discovery & registration
│   ├── BaseTool.js             # Abstract base class
│   ├── validators.js           # Parameter validation
│   ├── extension/              # Extension search tools
│   ├── user/                   # User-related tools
│   ├── canvas/                 # Canvas analysis tools
│   └── workflow/               # Workflow tools
├── prompts/                    # Prompt management
│   ├── PromptManager.js        # Versioned prompt system
│   ├── templates/              # Prompt templates
│   └── composers.js            # Prompt composition
├── context/                    # Context enrichment
│   ├── ContextBuilder.js       # Main context pipeline
│   ├── enrichers/              # Context enrichers
│   └── transformers.js        # Context transformation
├── memory/                     # Memory management
│   ├── ConversationMemory.js   # Short-term memory
│   ├── LongTermMemory.js      # Long-term memory
│   └── MemorySummarizer.js    # Memory summarization
├── handlers/                   # Request handlers
│   ├── ChatHandler.js
│   ├── StreamHandler.js
│   ├── GenerateFlowHandler.js
│   ├── SetupNodeHandler.js
│   ├── SuggestNextBarHandler.js
│   └── TinyGPTHandler.js
└── utils/                      # Utilities
    ├── constants.js            # Shared constants
    └── errors.js               # Error handling
```

## Key Features

### Tool Registry System
- Auto-discovery of tools extending `BaseTool`
- No hardcoded switch statements
- Parameter validation before execution
- Scales to 50+ tools

### Prompt Management
- Versioned prompts (like Git commits)
- Template system with variable substitution
- Composable prompts

### Context Enrichment Pipeline
- Staged enrichment (only fetch what's needed)
- Workflow → User → Integrations → Memory
- Caching for expensive operations

### Memory Management
- Short-term: Conversation history
- Long-term: User preferences, decision history
- Selective summarization to reduce costs

### Error Handling
- Comprehensive error classes
- Structured logging with request IDs
- Graceful error responses

## Usage

### Enable New Architecture

Set environment variable:
```bash
USE_NEW_CANVAS_ASSISTANT=true
```

Or update `server/canvas-assistant-api.js` to always use the new router.

### Creating a New Tool

1. Create a new file in the appropriate subdirectory:
```javascript
// server/canvas-assistant/tools/mycategory/MyTool.js
import { BaseTool } from "../BaseTool.js";

export default class MyTool extends BaseTool {
  get name() {
    return "myTool";
  }

  get description() {
    return "Description of when to use this tool";
  }

  get parameters() {
    return {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Parameter description",
        },
      },
      required: ["param1"],
    };
  }

  async execute(args, context) {
    // Tool logic here
    return { result: "success" };
  }
}
```

2. The tool will be auto-discovered on server startup.

### API Endpoints

- `POST /api/canvas-assistant` - Chat endpoint
- `POST /api/canvas-assistant/stream` - Streaming chat
- `POST /api/canvas-assistant/generate-flow` - Generate workflow
- `POST /api/canvas-assistant/setup-node` - Configure node
- `POST /api/canvas-assistant/suggest-next-bar` - Suggest next nodes
- `POST /api/canvas-assistant/tinygpt-test` - TinyGPT proxy
- `GET /api/canvas-assistant/health` - Health check

## Testing

Health check endpoint:
```bash
curl http://localhost:3003/api/canvas-assistant/health
```

## Migration Notes

The new architecture is backward compatible. Legacy endpoints remain available when `USE_NEW_CANVAS_ASSISTANT` is not set to `true`.
