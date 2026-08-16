# Skye Web UI — Research & Planning

## Documents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Competitive Analysis](01-competitive-analysis.md) | Analysis of ChatGPT, Claude, Perplexity, Open WebUI, LibreChat, AnythingLLM |
| 02 | [Activation Code Design](02-activation-code-design.md) | RN-SKYE-XXXXXX-XXXXXX-XXXXXX format, self-encoding, validation flow |
| 03 | [UX Patterns & Feature Matrix](03-ux-patterns-feature-matrix.md) | Three-panel layout, feature matrix by priority, user tiers |
| 04 | [Tech Stack](04-tech-stack.md) | Next.js + shadcn/ui + FastAPI recommendation, directory structure |
| 05 | [Implementation Roadmap](05-implementation-roadmap.md) | 5-phase plan, database schema, API routes |

## Key Decisions

### Activation Code Format
```
RN-SKYE-510510-XXXXXX-XXXXXX
```
- Segment 1: `510510` = 2×3×5×7×11×13×17 (magic number)
- Segment 2: Hash-derived from user email
- Segment 3: Checksum tying all segments together
- Self-validating, single-use, 26 characters

### Architecture
```
Next.js (port 3000) → FastAPI (port 8000) → Skye Engine (port 8765)
```
- Next.js + shadcn/ui for the frontend
- FastAPI + WebSocket for the backend
- Skye's existing Python engine untouched

### User Tiers
- **Admin** (Lark): Full access, admin panel, user management
- **Trusted** (Theresa, Jackie): Full chat features, no admin
- **Guest** (Future): Full chat features, stricter rate limits

### Three-Panel Layout
- Left sidebar: Chat history, search, admin (Lark only)
- Main area: Chat messages, streaming, input
- Right panel: Context-sensitive (sources, artifacts, files, tools)

## Next Steps

1. Review and approve the research
2. Decide on tech stack (Next.js + FastAPI recommended)
3. Begin Phase 0: Project scaffolding
4. Generate activation codes for Theresa and Jackie
