# Competitive Analysis: AI Web Chat Interfaces

## 1. ChatGPT (OpenAI) — The Benchmark

**URL**: chatgpt.com

### Layout
- **Left sidebar** (collapsible): Chat history list, "New chat" button, search, settings
- **Main area**: Model selector at top, chat messages, input box at bottom
- **No right panel** by default (canvas opens as overlay)

### Key UX Patterns
- Chat history grouped by time (Today, Yesterday, Previous 7 Days, etc.)
- Each chat auto-titled from first prompt
- Model selector: dropdown with model capabilities listed
- Message actions: Copy, Regenerate, Thumbs up/down, Read aloud, Select text
- Code blocks with syntax highlighting + "Copy code" button
- Streaming responses with cursor blink
- Temporary chat mode (no history saved)
- File/image upload via paperclip icon
- GPT-4o canvas for collaborative editing
- Search chats by keyword
- Archive/delete chats
- Custom GPTs in sidebar

### Strengths
- Clean, minimal, fast
- Excellent code rendering
- Canvas for collaborative editing
- Good mobile responsiveness

### Weaknesses
- No conversation branching visible to user
- Limited organizational tools (no folders/tags)
- No multi-model comparison view

---

## 2. Claude (Anthropic) — The Minimalist

**URL**: claude.ai

### Layout
- **Left sidebar**: Chat list, project selector, "Start new chat"
- **Main area**: Model selector, chat, input
- **Right panel**: Artifacts (rendered HTML/SVG/React/Mermaid)

### Key UX Patterns
- Project-based organization (chats grouped under projects with custom instructions)
- Artifacts panel: rendered content appears alongside chat
- Model selector: Opus, Sonnet, Haiku with capability descriptions
- File upload with preview (images, PDFs, code files)
- "Chat controls" for temporary chats
- Star/resurface important chats
- Conversation branching (edit a previous message → forks the conversation)
- Dark/light mode toggle
- Knowledge base per project

### Strengths
- Artifacts panel is genuinely useful for rendered output
- Project organization with custom instructions
- Clean, distraction-free design
- Conversation branching

### Weaknesses
- Less feature-rich than ChatGPT
- No voice input on web
- Limited search

---

## 3. Perplexity — The Researcher

**URL**: perplexity.ai

### Layout
- **Left sidebar**: Threads, Collections, Discover
- **Main area**: Search-focused input, Focus selector, results with citations
- **Right panel**: Related questions, sources

### Key UX Patterns
- Focus modes: Web, Academic, Writing, Math, Video, Social
- Sources cited inline with clickable links
- "Related questions" suggestions
- Collections for organizing threads
- Pro search toggle
- File upload for analysis
- Discover feed for trending queries

### Strengths
- Source attribution builds trust
- Focus modes are genuinely useful
- Collections for organization

### Weaknesses
- Less conversational, more search-oriented
- No code execution

---

## 4. Open WebUI — The Self-Hosted Standard

**URL**: openwebui.com | GitHub: open-webui/open-webui (149k stars)

### Layout
- **Left sidebar**: Chats, Models, Prompts, Tools, Functions, Admin
- **Main area**: Model selector, chat, input
- **Settings**: Extensive admin panel

### Key UX Patterns
- Multi-model support (Ollama, OpenAI, Anthropic, any OpenAI-compatible)
- Model customization (system prompts, temperature, etc.)
- Community prompts/tools/functions marketplace
- RAG (Retrieval Augmented Generation) with document upload
- Web search integration
- Voice input/output
- Image generation
- Multi-user with RBAC (Role-Based Access Control)
- SSO, OAuth, LDAP
- Audit logs
- Python functions for extending
- Mobile PWA

### Strengths
- Full-featured, self-hosted
- Extensive admin controls
- Community ecosystem
- Python extensibility

### Weaknesses
- Complex setup
- Can feel overwhelming
- UI polish below ChatGPT/Claude

---

## 5. LibreChat — The Multi-Provider Hub

**URL**: librechat.ai | GitHub: danny-avila/LibreChat (42k stars)

### Layout
- **Left sidebar**: Conversations, Agents, Models, Settings
- **Main area**: Model selector, chat, input
- **Right panel**: Code interpreter, artifacts

### Key UX Patterns
- Multi-provider: OpenAI, Anthropic, AWS, Azure, Google, and more
- Agents with file handling, code interpreter, API actions
- Code interpreter (multiple languages, secure sandbox)
- Artifacts (React, HTML, Mermaid diagrams)
- MCP (Model Context Protocol) support
- Persistent memory across conversations
- Web search with reranking
- SSO: OAuth, SAML, LDAP, 2FA
- Message search
- File upload

### Strengths
- Best multi-provider support
- MCP integration
- Code interpreter
- Enterprise auth

### Weaknesses
- Less polished UI
- Complex configuration

---

## 6. AnythingLLM — The Desktop + Self-Hosted Hybrid

**URL**: anythingllm.com | GitHub: 64k stars

### Layout
- Desktop app + self-hosted web version
- Workspaces with document knowledge bases
- Custom agent skills

### Key UX Patterns
- On-device AI (no cloud required)
- Document knowledge bases per workspace
- Web scraping & search
- Meeting assistant (local transcription)
- Custom agent skills
- Multi-user self-hosted deployment
- MIT licensed

### Strengths
- Privacy-first, fully local
- Document ingestion
- Desktop + web

### Weaknesses
- Less suited for pure chat
- Smaller community than Open WebUI

---

## Summary: Common Patterns Across All

| Feature | ChatGPT | Claude | Perplexity | Open WebUI | LibreChat |
|---------|---------|--------|------------|------------|-----------|
| Left sidebar chat history | ✅ | ✅ | ✅ | ✅ | ✅ |
| Streaming responses | ✅ | ✅ | ✅ | ✅ | ✅ |
| Markdown + code rendering | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dark/light mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Model selection | ✅ | ✅ | ✅ | ✅ | ✅ |
| File/image upload | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat search | ✅ | ❌ | ✅ | ✅ | ✅ |
| Conversation branching | ❌ | ✅ | ❌ | ❌ | ❌ |
| Multi-user / RBAC | ❌ | ❌ | ❌ | ✅ | ✅ |
| Self-hosted | ❌ | ❌ | ❌ | ✅ | ✅ |
| Code execution | Canvas | Artifacts | ❌ | ✅ | ✅ |
| Web search | ✅ | ❌ | ✅ | ✅ | ✅ |
| Voice I/O | ✅ | ❌ | ❌ | ✅ | ❌ |
| RAG / Documents | GPTs | Projects | Collections | ✅ | ✅ |
| API extensibility | GPTs | ❌ | ❌ | Functions | MCP |
