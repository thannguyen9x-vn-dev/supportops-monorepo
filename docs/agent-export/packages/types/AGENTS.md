# AGENTS.md — Shared Contracts (packages/types)

## Purpose
Single source of truth for frontend/backend API communication.

## Structure
```text
src/
├── types/
├── schemas/
├── endpoints.ts
└── index.ts
```

## Rules
- Use `interface` for object shapes
- Endpoints belong in `endpoints.ts`
- Dynamic endpoints use factory functions
- Validation schemas in `schemas/*` must match backend validation
- Export all public contracts from `index.ts`
- Keep this package runtime-light (types/schemas/constants only)

## Strict DO NOTs
- ❌ React/UI imports
- ❌ Backend imports
- ❌ `any`
- ❌ Runtime business logic
