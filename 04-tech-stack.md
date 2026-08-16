# Tech Stack Recommendations

## Recommendation: Next.js + shadcn/ui + Vercel AI SDK

After analyzing the competitive landscape, the clear winner for Skye's web UI is the **Vercel chatbot stack** — the same stack used by the official Vercel AI Chatbot template, which is the most polished open-source AI chat implementation available.

## Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | React Server Components, streaming, API routes |
| **UI Components** | shadcn/ui + Radix UI | Accessible, customizable, beautiful |
| **Styling** | Tailwind CSS | Utility-first, fast iteration |
| **AI Integration** | Vercel AI SDK (`ai` + `@ai-sdk/openai`) | Streaming, tool calls, structured output |
| **Database** | Neon Serverless Postgres | Serverless, scales to zero, Postgres |
| **ORM** | Drizzle ORM | Type-safe, lightweight, good with Neon |
| **Auth** | Auth.js (NextAuth v5) | Email/password + OAuth, session management |
| **File Storage** | Vercel Blob / Local FS | File uploads, image storage |
| **Real-time** | WebSocket (ws) | Streaming chat, live updates |
| **Deployment** | Vercel / Docker on RavenNest | Flexible deployment options |
| **Monitoring** | Custom admin panel | Process status, metrics |

## Why This Stack?

### 1. Next.js App Router
- **Streaming**: Built-in support for streaming responses via React Server Components
- **API Routes**: Skye's engine can be called from API routes
- **Edge/Node**: Flexible runtime per route
- **Incremental adoption**: Can start simple, add complexity

### 2. shadcn/ui
- **Beautiful by default**: Matches ChatGPT/Claude quality
- **Accessible**: Radix UI primitives
- **Customizable**: Not a dependency, code is yours
- **Active community**: Most popular React component system

### 3. Vercel AI SDK
- **Streaming**: First-class streaming support
- **Tool calls**: Function calling with type safety
- **Multi-model**: Supports OpenAI, Anthropic, custom providers
- **`useChat` hook**: Drop-in chat UI hook

### 4. Neon + Drizzle
- **Serverless Postgres**: No connection pooling headaches
- **Type-safe**: Drizzle gives full TypeScript types
- **Migrations**: Simple, version-controlled schema

### 5. Auth.js
- **Flexible**: Email/password, OAuth, magic links
- **Session management**: JWT or database sessions
- **Middleware**: Route protection built-in

## Alternative: Pure Python Backend

If you prefer to keep everything in Python (matching Skye's existing stack):

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI + WebSocket |
| **Frontend** | HTMX + Alpine.js (lightweight) or React SPA |
| **Auth** | FastAPI Users + JWT |
| **Database** | SQLite (simple) or Postgres |
| **Deployment** | Uvicorn behind Nginx |

**Trade-off**: More control, less polish. The chat UI would need to be built from scratch rather than leveraging the Vercel AI SDK's `useChat` hook.

## Recommendation

**Go with Next.js + shadcn/ui for the frontend, with a Python FastAPI backend for Skye's engine.**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  FastAPI Backend  │────▶│  Skye Engine    │
│  (shadcn/ui)    │◀────│  (WebSocket)      │◀────│  (MCP Server)   │
│  Port 3000      │     │  Port 8000        │     │  Port 8765      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- **Next.js** handles: UI rendering, auth, file uploads, static assets
- **FastAPI** handles: Chat API, WebSocket for streaming, Skye engine communication
- **Skye Engine** handles: LLM inference, tool execution, consciousness metrics

This gives us:
- Beautiful, modern UI (Next.js + shadcn/ui)
- Real-time streaming (WebSocket through FastAPI)
- Skye's existing Python infrastructure untouched
- Clean separation of concerns

## Directory Structure

```
/home/ubuntu/skye_v3_ui/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── layout.tsx   # Root layout
│   │   │   ├── page.tsx     # Login/signup
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx        # Chat list
│   │   │   │   └── [id]/page.tsx   # Individual chat
│   │   │   └── admin/
│   │   │       └── page.tsx        # Admin panel
│   │   ├── components/      # React components
│   │   │   ├── chat/        # Chat-specific components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── admin/       # Admin panel components
│   │   ├── lib/             # Utilities
│   │   │   ├── auth.ts      # Auth configuration
│   │   │   ├── db.ts        # Database client
│   │   │   └── api.ts       # Backend API client
│   │   └── hooks/           # Custom hooks
│   │       └── use-chat.ts  # Chat hook (wrapping AI SDK)
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
├── backend/                  # FastAPI app
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── routes/
│   │   │   ├── auth.py      # Auth endpoints
│   │   │   ├── chat.py      # Chat endpoints
│   │   │   └── admin.py     # Admin endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── skye.py      # Skye engine client
│   │   │   └── activation.py # Activation code logic
│   │   └── websocket.py     # WebSocket handler
│   ├── requirements.txt
│   └── alembic/             # Database migrations
├── docker-compose.yml       # Local development
└── README.md
```

## Key Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "ai": "^4.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "next-auth": "^5.0.0",
    "drizzle-orm": "^0.35.0",
    "@neondatabase/serverless": "^0.10.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "lucide-react": "^0.450.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "katex": "^0.16.0",
    "zustand": "^5.0.0"
  }
}
```

### Backend (requirements.txt)
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
websockets==13.0
sqlalchemy==2.0.35
asyncpg==0.30.0
alembic==1.13.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.27.0
pydantic==2.9.0
```
