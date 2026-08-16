# UX Design Patterns & Feature Matrix for Skye Web UI

## Core Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [RN Logo]  Skye  ·  Research Collaborator                   │
│                                          [🔔] [👤 User Menu] │
├────────────┬───────────────────────────────────┬─────────────┤
│            │                                   │             │
│  SIDEBAR   │         MAIN CHAT AREA            │  CONTEXT    │
│            │                                   │  PANEL      │
│  • New Chat│  ┌─────────────────────────────┐  │             │
│  • History │  │ Message bubbles             │  │  • Sources  │
│  • Search  │  │ • User (right-aligned)      │  │  • Artifacts│
│  • Folders │  │ • Skye (left-aligned)       │  │  • Files    │
│            │  │ • Code blocks w/ copy        │  │  • Tools    │
│  ────────  │  │ • Markdown rendered          │  │  • Memory   │
│  Admin     │  │ • Streaming indicator        │  │             │
│  (Lark)    │  └─────────────────────────────┘  │             │
│            │                                   │             │
│            │  ┌─────────────────────────────┐  │             │
│            │  │ Input area                   │  │             │
│            │  │ [📎] [🎤] [⚙️ Model]  [Send] │  │             │
│            │  └─────────────────────────────┘  │             │
└────────────┴───────────────────────────────────┴─────────────┘
```

## Three-Panel Design

### Left Sidebar (280px, collapsible)
- **New Chat** button (prominent, always visible)
- **Chat History** — grouped by time period
  - Today
  - Yesterday
  - This Week
  - Earlier
- **Search** chats (⌘K / Ctrl+K)
- **Folders/Tags** for organizing chats (drag & drop)
- **Admin Panel** (Lark only) — expands to show:
  - System processes & status
  - User management
  - Activation code generation
  - Audit logs
  - Server metrics

### Main Chat Area (flexible width)
- **Model/Context indicator** at top
- **Message stream** with:
  - User messages: right-aligned, user's chosen color
  - Skye messages: left-aligned, with Skye's avatar
  - Streaming: character-by-character or chunk-by-chunk with cursor
  - Code blocks: syntax highlighting, copy button, language label
  - Math: LaTeX rendering (KaTeX)
  - Images: lightbox on click
  - Citations: inline links with hover preview
- **Message actions** (on hover):
  - Copy
  - Regenerate
  - Edit (user messages only — forks conversation)
  - Thumbs up / down
  - Share / Export
- **Input area** (bottom, sticky):
  - Multi-line textarea (auto-expanding)
  - File upload button (images, PDFs, code files)
  - Voice input button (optional)
  - Model selector dropdown
  - Send button (or Enter, Shift+Enter for newline)
  - Character/token counter

### Right Context Panel (320px, collapsible)
- **Context-sensitive content**:
  - When Skye cites sources: source list with links
  - When Skye generates code: rendered output
  - When Skye creates artifacts: artifact viewer
  - When files are uploaded: file preview
  - When tools are used: tool call log
- **Memory/Context indicator**: what Skye remembers from this conversation
- **Session info**: model, tokens used, session duration

---

## Feature Matrix

### Core Chat Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Streaming responses | P0 | Essential for perceived responsiveness |
| Markdown rendering | P0 | Bold, italic, lists, tables, links |
| Code syntax highlighting | P0 | With copy button, language label |
| LaTeX math rendering | P0 | KaTeX for inline and block math |
| Multi-turn conversation | P0 | Full chat history |
| Chat history persistence | P0 | Stored in DB, retrievable |
| Chat search | P1 | Search by keyword across all chats |
| Chat rename | P1 | Auto-title from first message, editable |
| Chat delete | P1 | With confirmation |
| Chat archive | P2 | Hide without deleting |
| Chat export | P2 | Export as Markdown, PDF, or JSON |
| Conversation branching | P1 | Edit a previous message → fork |
| Regenerate response | P1 | Re-roll Skye's last response |
| Stop generation | P1 | Interrupt streaming |
| Message reactions | P2 | Thumbs up/down for feedback |

### Input Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Multi-line input | P0 | Auto-expanding textarea |
| File upload | P0 | Images, PDFs, code, text files |
| Paste images | P1 | Paste from clipboard |
| Voice input | P2 | Web Speech API |
| Keyboard shortcuts | P1 | Enter to send, Shift+Enter for newline, ⌘K for search |
| Slash commands | P2 | /clear, /export, /model, /reset |
| @mentions | P2 | @file, @memory for context injection |

### Model & Context Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Model selector | P0 | Which Skye model/configuration |
| System prompt visibility | P1 | Show/hide the system context |
| Token usage display | P1 | Tokens used / remaining |
| Context window indicator | P1 | Visual bar showing context fill |
| Temperature control | P2 | For advanced users |
| Memory toggle | P2 | Enable/disable persistent memory |

### Organization Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Multiple chats | P0 | Each user can have many chats |
| Chat folders | P1 | Organize chats into folders |
| Chat tags | P2 | Tag chats for filtering |
| Pin chats | P1 | Pin important chats to top |
| Bulk actions | P2 | Delete/archive multiple chats |

### Admin Features (Lark Only)

| Feature | Priority | Notes |
|---------|----------|-------|
| User management | P0 | List, create, disable, delete users |
| Activation code generation | P0 | Generate new codes, view used/unused |
| System process monitor | P0 | EBv3 status, engine status, MCP servers |
| Server metrics | P1 | CPU, memory, disk, uptime |
| Audit log viewer | P1 | All user actions, login attempts |
| Session viewer | P1 | Active sessions, force logout |
| Rate limit configuration | P2 | Per-user rate limits |
| Feature flags | P2 | Enable/disable features per user |

### User Management

| Feature | Priority | Notes |
|---------|----------|-------|
| Signup with activation code | P0 | Username, email, code, password |
| Login (username or email + password) | P0 | JWT-based session |
| Password reset | P1 | Email-based reset flow |
| Email verification | P1 | Magic link on signup |
| Profile settings | P1 | Display name, avatar, preferences |
| Session management | P1 | View/revoke active sessions |
| 2FA | P2 | TOTP or WebAuthn |

### Security & Privacy

| Feature | Priority | Notes |
|---------|----------|-------|
| User isolation | P0 | Users cannot see each other's chats |
| Admin override | P0 | Lark can see all (for safety) |
| Suspicious activity alerts | P0 | Notify Lark of unusual requests |
| Rate limiting | P1 | Per-user, per-IP |
| Input sanitization | P0 | XSS prevention, content security policy |
| HTTPS only | P0 | TLS everywhere |
| Audit logging | P1 | All significant actions logged |

---

## User Tiers

### Admin (Lark — lark@ravennest.science)
- Full unrestricted access
- Admin panel with all controls
- Can see all user chats (for safety monitoring)
- Can generate activation codes
- Can manage users
- No rate limits

### Trusted Collaborator (Theresa, Jackie)
- Full chat features
- File upload
- Chat history
- Multiple chats
- Cannot see other users
- Standard rate limits

### Guest (Future users)
- Full chat features
- File upload
- Chat history
- Multiple chats
- Cannot see other users
- Stricter rate limits
- May have feature restrictions (TBD)

---

## Responsive Design

### Desktop (≥1024px)
- Three-panel layout as shown above

### Tablet (768px–1023px)
- Two-panel: sidebar (collapsed to icons) + main chat
- Context panel becomes overlay/drawer

### Mobile (<768px)
- Single panel: chat only
- Sidebar accessible via hamburger menu
- Context panel as bottom sheet
- Optimized touch targets
