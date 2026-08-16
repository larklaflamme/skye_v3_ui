# Skye v3 Middleware — Design Document

## Purpose

The middleware is the bridge between the Svelte web UI and the Skye Engine architecture. It provides:

1. **Authentication** — JWT-based login/signup with activation codes
2. **REST API** — Chat threads, messages, admin operations, telemetry
3. **WebSocket** — Real-time streaming of Skye's responses and system events
4. **Redis Integration** — Message passing to/from the Skye Engine master loop
5. **Persistence** — SQLite for users, sessions, threads, messages, activation codes

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Middleware (Node.js/TypeScript)       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Express  │  │ Socket.io│  │   Redis Client        │  │
│  │ (REST)   │  │ (WS)     │  │   (ioredis)          │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │             │                   │               │
│  ┌────┴─────────────┴───────────────────┴───────────┐   │
│  │                  Core Services                   │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │ Auth   │ │ Chat   │ │ Admin  │ │Telemetry │  │   │
│  │  │Service │ │Service │ │Service │ │Service   │  │   │
│  │  └────────┘ └────────┘ └────────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              SQLite Database                      │   │
│  │  users | sessions | threads | messages | codes    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│  Redis           │  │  Skye Engine     │
│  skye:master:    │  │  (Python)        │
│  inbox           │  │                  │
│  skye:channel:   │  │  Master Loop     │
│  web:out         │  │  EBv3 Client     │
│  skye:stream:    │  │  Runtime Adapter │
│  conv:web:*      │  └──────────────────┘
└─────────────────┘
```

## Message Flow

### User sends a message
```
Svelte UI ──POST /api/chat/threads/:id/messages──▶ Middleware
                                                      │
                                                      ├─ Save message to SQLite
                                                      ├─ RPUSH MessageEnvelope to skye:master:inbox
                                                      │
                                                      ▼
                                              Skye Engine Master Loop
                                                      │
                                                      ├─ BLMOVE from inbox
                                                      ├─ Process through cognition pipeline
                                                      ├─ Stream tokens to skye:stream:conv:web:{conv_id}
                                                      ├─ LPUSH response to skye:channel:web:out
                                                      │
                                                      ▼
                                              Middleware (Redis subscriber)
                                                      │
                                                      ├─ Receive stream tokens → Socket.io emit
                                                      ├─ Receive final response → Save to SQLite
                                                      │
                                                      ▼
                                              Svelte UI (WebSocket)
```

### Skye streams a response
```
Skye Engine ──PUBLISH skye:stream:conv:web:{conv_id}──▶ Redis Pub/Sub
                                                              │
                                                              ▼
                                                      Middleware subscriber
                                                              │
                                                              ├─ Parse token
                                                              ├─ socket.emit('stream:token', { conv_id, token })
                                                              │
                                                              ▼
                                                      Svelte UI updates in real-time
```

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login with username/email + password → JWT |
| POST | /api/auth/signup | No | Create account with activation code |
| GET | /api/auth/me | JWT | Get current user profile |

### Chat
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/chat/threads | JWT | List user's threads |
| POST | /api/chat/threads | JWT | Create new thread |
| GET | /api/chat/threads/:id | JWT | Get thread with messages |
| POST | /api/chat/threads/:id/messages | JWT | Send message (triggers Skye) |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/users | JWT+Admin | List all users |
| POST | /api/admin/codes | JWT+Admin | Generate activation code |
| GET | /api/admin/logs | JWT+Admin | Get audit logs |

### Telemetry
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/telemetry | JWT | System metrics (CPU, RAM, EBv3 status) |

### WebSocket
| Path | Auth | Description |
|------|------|-------------|
| /ws | JWT (query param) | Real-time streaming + events |

## WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:thread` | `{ threadId }` | Subscribe to a thread's stream |
| `unsubscribe:thread` | `{ threadId }` | Unsubscribe |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `stream:token` | `{ threadId, token, index }` | Streaming response token |
| `stream:complete` | `{ threadId, message }` | Response complete |
| `stream:error` | `{ threadId, error }` | Error during generation |
| `telemetry:update` | `{ metrics }` | Periodic telemetry push |
| `notification` | `{ type, title, body }` | System notification |

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  last_active TEXT
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id),
  user_id TEXT REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE activation_codes (
  code TEXT PRIMARY KEY,
  recipient_email TEXT,
  role TEXT NOT NULL DEFAULT 'trusted',
  status TEXT NOT NULL DEFAULT 'unused',
  created_at TEXT NOT NULL,
  expires_at TEXT,
  used_at TEXT,
  used_by TEXT REFERENCES users(id)
);
```

## Redis Keys

| Key | Type | Description |
|-----|------|-------------|
| `skye:master:inbox` | List | Messages TO Skye Engine (RPUSH) |
| `skye:channel:web:out` | List | Responses FROM Skye Engine (BLMOVE) |
| `skye:stream:conv:web:{conv_id}` | Pub/Sub | Streaming tokens per conversation |
| `skye:session:web:{session_id}` | String | Session data (TTL: 24h) |

## MessageEnvelope Format

The middleware serializes messages to the same `MessageEnvelope` JSON format the Skye Engine expects:

```json
{
  "envelope_version": 1,
  "message_id": "a1b2c3d4e5f6g7h8",
  "conversation_id": "thread-uuid",
  "channel": "web",
  "text": "What is the Riemann Hypothesis?",
  "attachments": [],
  "metadata": {
    "user": "lark",
    "user_id": "user_lark",
    "thread_id": "thread-uuid"
  },
  "created_at": 1723680000.123
}
```

## Activation Code Format

```
RN-SKYE-510510-{SEG2}-{SEG3}
```

- `RN-SKYE`: Fixed prefix
- `510510`: RavenNest identifier
- `SEG2`: 6 hex chars — derived from SHA-256 of recipient email (first 6 chars)
- `SEG3`: 6 hex chars — checksum of SEG2 + email + timestamp

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **HTTP**: Express.js 4.x
- **WebSocket**: Socket.io 4.x
- **Redis**: ioredis
- **Database**: better-sqlite3
- **Auth**: jsonwebtoken + bcryptjs
- **Validation**: zod
- **Config**: dotenv

## Directory Structure

```
middleware/
├── DESIGN.md           # This file
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts        # Entry point — Express + Socket.io setup
│   ├── config.ts       # Environment config
│   ├── database.ts     # SQLite setup + migrations
│   ├── redis.ts        # Redis client + pub/sub
│   ├── types.ts        # Shared TypeScript types
│   ├── middleware/
│   │   └── auth.ts     # JWT authentication middleware
│   ├── services/
│   │   ├── auth.ts     # Login, signup, token management
│   │   ├── chat.ts     # Thread CRUD, message sending
│   │   ├── admin.ts    # User management, code generation
│   │   └── telemetry.ts # System metrics collection
│   ├── routes/
│   │   ├── auth.ts     # /api/auth/*
│   │   ├── chat.ts     # /api/chat/*
│   │   ├── admin.ts    # /api/admin/*
│   │   └── telemetry.ts # /api/telemetry
│   └── ws/
│       └── socket.ts   # Socket.io event handlers
└── data/               # SQLite database (gitignored)
```

## Integration Points with Skye Engine

### 1. Message Injection
The middleware RPUSHes MessageEnvelope JSON to `skye:master:inbox`. The Skye Engine master loop picks it up via BLMOVE. No changes needed to the engine.

### 2. Response Collection
The middleware subscribes to `skye:channel:web:out` via Redis Pub/Sub or polling. When a response arrives, it's saved to SQLite and emitted via WebSocket.

### 3. Stream Subscription
The middleware subscribes to `skye:stream:conv:web:*` via Redis Pub/Sub. Each token is forwarded to the appropriate Socket.io room.

### 4. Telemetry
The middleware queries EBv3 status via its WebSocket API (port 8765) and collects system metrics via `os` module. These are cached and served via REST + pushed via WebSocket.

## Security Considerations

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens expire after 24 hours
- Activation codes expire after 30 days
- Admin routes require `role: 'admin'`
- CORS restricted to configured origin
- Rate limiting on auth endpoints (TODO)
- Input validation via zod on all endpoints
