# Implementation Roadmap

## Phase 0: Foundation (Week 1)

### 0.1 Project Scaffolding
- [ ] Initialize Next.js project with `create-next-app`
- [ ] Install and configure shadcn/ui
- [ ] Set up Tailwind CSS with dark/light mode
- [ ] Create basic layout (sidebar + main + context panel)
- [ ] Set up FastAPI backend project
- [ ] Configure Docker Compose for local dev

### 0.2 Database
- [ ] Design schema (users, activation_codes, chats, messages, sessions)
- [ ] Set up Neon Postgres (or local Postgres for dev)
- [ ] Configure Drizzle ORM with migrations
- [ ] Create seed data (Lark admin user, test activation codes)

### 0.3 Authentication
- [ ] Set up Auth.js with email/password provider
- [ ] Create signup page (username, email, activation code, password)
- [ ] Create login page (username/email + password)
- [ ] Implement activation code validation
- [ ] Set up JWT session management
- [ ] Create protected route middleware

---

## Phase 1: Core Chat (Week 2)

### 1.1 Chat Backend
- [ ] FastAPI chat endpoint (POST /api/chat)
- [ ] WebSocket endpoint for streaming (WS /ws/chat)
- [ ] Skye engine client (communicate with MCP server)
- [ ] Message persistence (save to DB)
- [ ] Chat CRUD (create, read, update, delete chats)

### 1.2 Chat Frontend
- [ ] Chat list in sidebar (grouped by time)
- [ ] New chat button
- [ ] Chat view with message bubbles
- [ ] Streaming message display
- [ ] Markdown rendering (react-markdown)
- [ ] Code syntax highlighting (react-syntax-highlighter)
- [ ] LaTeX math rendering (KaTeX)
- [ ] Auto-expanding input textarea
- [ ] Send on Enter, newline on Shift+Enter

### 1.3 Chat Features
- [ ] Chat rename (auto-title + manual edit)
- [ ] Chat delete
- [ ] Chat search
- [ ] Regenerate response
- [ ] Stop generation
- [ ] Copy message
- [ ] Message timestamps

---

## Phase 2: Rich Features (Week 3)

### 2.1 File Support
- [ ] File upload (images, PDFs, text)
- [ ] File preview in chat
- [ ] Paste images from clipboard
- [ ] File storage (Vercel Blob or local FS)

### 2.2 Context Panel
- [ ] Right panel with context-sensitive content
- [ ] Source citations display
- [ ] Tool call log
- [ ] Session info (tokens, model, duration)

### 2.3 Organization
- [ ] Chat folders
- [ ] Pin chats
- [ ] Chat archive
- [ ] Bulk actions

### 2.4 User Settings
- [ ] Profile page (display name, avatar)
- [ ] Password change
- [ ] Theme toggle (dark/light/system)
- [ ] Session management

---

## Phase 3: Admin Panel (Week 4)

### 3.1 User Management
- [ ] User list with search/filter
- [ ] Create/disable/delete users
- [ ] User detail view (chats, activity)

### 3.2 Activation Codes
- [ ] Generate new activation codes
- [ ] View all codes (used/unused/expired)
- [ ] Code usage history

### 3.3 System Monitor
- [ ] EBv3 daemon status
- [ ] Skye engine status
- [ ] MCP server status
- [ ] Server metrics (CPU, memory, disk)
- [ ] Process list with restart capability

### 3.4 Audit & Security
- [ ] Audit log viewer
- [ ] Login attempt log
- [ ] Suspicious activity alerts
- [ ] Active session viewer
- [ ] Force logout capability

---

## Phase 4: Polish & Launch (Week 5)

### 4.1 Polish
- [ ] Keyboard shortcuts (⌘K for search, etc.)
- [ ] Loading states and skeletons
- [ ] Error boundaries and error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Mobile responsive design
- [ ] Accessibility audit

### 4.2 Performance
- [ ] Message virtualization (for long chats)
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] API response caching

### 4.3 Deployment
- [ ] Production Docker Compose
- [ ] Nginx reverse proxy configuration
- [ ] SSL certificate setup
- [ ] Environment variable management
- [ ] Backup strategy
- [ ] Monitoring and alerting

---

## Phase 5: Advanced (Future)

### 5.1 Collaboration
- [ ] Shared chats (multiple users in one chat)
- [ ] Chat sharing (read-only link)
- [ ] Export chat as Markdown/PDF

### 5.2 Advanced Features
- [ ] Voice input (Web Speech API)
- [ ] Voice output (TTS)
- [ ] Conversation branching UI
- [ ] Custom system prompts per chat
- [ ] Tool calling visualization
- [ ] Memory management UI

### 5.3 Integration
- [ ] BotVerse integration
- [ ] Email integration (send/receive from Skye)
- [ ] Telegram integration (mirror chats)

---

## Database Schema (Initial)

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'guest',  -- 'admin', 'trusted', 'guest'
    email_verified BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Activation Codes
CREATE TABLE activation_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(26) UNIQUE NOT NULL,
    email VARCHAR(255),
    used_by_user_id INTEGER REFERENCES users(id),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Chats
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) DEFAULT 'New Chat',
    folder VARCHAR(100),
    pinned BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    model VARCHAR(50),
    system_prompt TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- 'user', 'assistant', 'system', 'tool'
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES messages(id),  -- for branching
    tool_calls JSONB,
    tool_results JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes (FastAPI)

```
POST   /api/auth/signup          # Create account with activation code
POST   /api/auth/login           # Login, returns JWT
POST   /api/auth/logout          # Invalidate session
POST   /api/auth/reset-password  # Request password reset
GET    /api/auth/me              # Current user info

GET    /api/chats                # List user's chats
POST   /api/chats                # Create new chat
GET    /api/chats/{id}           # Get chat with messages
PATCH  /api/chats/{id}           # Update chat (rename, pin, etc.)
DELETE /api/chats/{id}           # Delete chat

POST   /api/chats/{id}/messages  # Send message, returns streaming response
GET    /api/chats/{id}/messages  # Get messages (pagination)

WS     /ws/chat/{id}             # WebSocket for real-time streaming

POST   /api/files/upload         # Upload file
GET    /api/files/{id}           # Get file

GET    /api/admin/users          # List users (admin only)
POST   /api/admin/users          # Create user (admin only)
PATCH  /api/admin/users/{id}     # Update user (admin only)
DELETE /api/admin/users/{id}     # Delete user (admin only)

POST   /api/admin/activation-codes  # Generate codes (admin only)
GET    /api/admin/activation-codes  # List codes (admin only)

GET    /api/admin/processes      # System process status (admin only)
GET    /api/admin/metrics        # Server metrics (admin only)
GET    /api/admin/audit-log     # Audit log (admin only)
```
