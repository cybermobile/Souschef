# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chef (formerly Souschef) is an AI-powered full-stack web app builder built on Convex. It specializes in creating applications with real-time features, built-in database, authentication, and file handling capabilities.

## Core Commands

### Development
```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Run development server (requires two terminals)
pnpm run dev        # Terminal 1: Runs the Remix app on http://127.0.0.1:5173
npx convex dev     # Terminal 2: Runs the Convex backend

# IMPORTANT: Use 127.0.0.1:5173 not localhost for proper WorkOS authentication
```

### Testing & Quality
```bash
pnpm run test           # Run Vitest tests
pnpm run test:watch     # Run tests in watch mode
pnpm run lint           # Run ESLint for app and convex directories
pnpm run lint:fix       # Auto-fix linting issues
pnpm run typecheck      # TypeScript type checking
```

### Building & Deployment
```bash
pnpm run build          # Build for production
npm run rebuild-template  # Rebuild the Chef project template
```

## Architecture

### Directory Structure
- **`app/`** - Client-side Remix application
  - `components/` - React UI components
  - `lib/` - Client-side logic and state management
  - `routes/` - Remix routes (client and server)

- **`chef-agent/`** - AI agent orchestration layer
  - `prompts/` - System prompts and model-specific configurations
  - `tools/` - Agent tools for code manipulation and project management
  - `ChatContextManager.ts` - Manages conversation context and message flow

- **`convex/`** - Backend database and serverless functions
  - Uses new Convex function syntax with typed args/returns
  - Authentication via WorkOS integration
  - Real-time subscriptions and mutations

- **`template/`** - Base template for new Chef projects

## Key Technologies

- **Frontend**: Remix, React, TypeScript, Tailwind CSS
- **Backend**: Convex (reactive database with real-time subscriptions)
- **AI Models**: Supports Anthropic, OpenAI, Google, xAI
- **Container**: WebContainer API for browser-based code execution
- **Editor**: CodeMirror with language support

## Convex Patterns

Always use the new Convex function syntax:
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const myFunction = query({
  args: { param: v.string() },
  returns: v.object({ result: v.string() }),
  handler: async (ctx, args) => {
    // Implementation
    return { result: "value" };
  },
});
```

## Authentication

- Users authenticate via WorkOS with their Convex accounts
- OAuth flow for team/project selection
- API keys stored securely in Convex with user-level encryption

## Important Notes

1. **Always use pnpm** instead of npm for package management
2. **Use 127.0.0.1:5173** for local development (not localhost)
3. **Two terminals required** for development (app + convex)
4. **Follow Convex guidelines** in `.cursor/rules/convex_rules.mdc`
5. **Real-time features** are core to Chef - leverage Convex subscriptions
6. **Template modifications** require running `npm run rebuild-template`