<script>
  import { activeTheme, THEMES, setTheme } from '../lib/stores/themeStore.js';
  import { chats, currentChatId, currentChat, selectChat, createNewThread, sendMessage } from '../lib/stores/chatStore.js';
  import { activeGraphNodes, updateNodePosition, forkHypothesisNode } from '../lib/stores/graphStore.js';
  import { USERS_DATA, CODES_DATA, TELEMETRY_METRICS, SOCKET_FRAMES, generateActivationCode, toggleUser } from '../lib/stores/adminStore.js';

  // Lucide Svelte Icons
  import { 
    Terminal, GitBranch, Shield, Radio, Plus, Send, 
    Cpu, Database, Sparkles, Move, ZoomIn, ZoomOut, RotateCcw,
    Layers, Search, Key, ChevronRight, CheckCircle2
  } from 'lucide-svelte';

  let selectedTab = 'chat'; // 'chat' | 'graph' | 'admin' | 'socket'
  let inputText = '';
  let selectedNode = null;
  let zoomLevel = 1.0;
  let searchQuery = '';

  $: filteredChats = searchQuery 
    ? $chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : $chats;

  function handleSend() {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    inputText = '';
  }

  function handleNodeDrag(e, node) {
    if (e.target.tagName === 'BUTTON') return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = node.x;
    const origY = node.y;

    function onMove(ev) {
      const dx = (ev.clientX - startX) / zoomLevel;
      const dy = (ev.clientY - startY) / zoomLevel;
      updateNodePosition($currentChatId, node.id, Math.round(origX + dx), Math.round(origY + dy));
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
</script>

<div class="pkg-app-wrapper">
  
  <!-- 1. Real-time Telemetry Bar -->
  <header class="pkg-telemetry-hud">
    <div class="hud-item-group">
      <div class="brand-pill">
        <Sparkles size={14} class="brand-icon" />
        <span class="brand-name">RavenNest Skye</span>
        <span class="brand-tag">Packages Edition</span>
      </div>

      <div class="telemetry-pill active">
        <span class="status-indicator online"></span>
        <Cpu size={12} />
        <span>EBv3: PID {$TELEMETRY_METRICS.ebv3Pid}</span>
      </div>

      <div class="telemetry-pill">
        <Radio size={12} />
        <span>Port :{$TELEMETRY_METRICS.skyePort}</span>
      </div>

      <div class="telemetry-pill">
        <Database size={12} />
        <span>MCP: {$TELEMETRY_METRICS.mcpTools} tools ({$TELEMETRY_METRICS.mcpLatency})</span>
      </div>
    </div>

    <div class="hud-item-group">
      <div class="telemetry-pill">
        <span>CPU: <strong>{$TELEMETRY_METRICS.cpu}%</strong></span>
        <span class="pill-dot">·</span>
        <span>RAM: <strong>{$TELEMETRY_METRICS.ram}</strong></span>
      </div>
      <span class="badge-role">ADMIN (LARK)</span>
    </div>
  </header>

  <!-- 2. Cockpit Navigation & 10-Theme Bar -->
  <nav class="pkg-navbar">
    <div class="nav-tabs">
      <button class="tab-button {selectedTab === 'chat' ? 'active' : ''}" on:click={() => selectedTab = 'chat'}>
        <Terminal size={15} />
        <span>Research Console</span>
      </button>

      <button class="tab-button {selectedTab === 'graph' ? 'active' : ''}" on:click={() => selectedTab = 'graph'}>
        <GitBranch size={15} />
        <span>2D Thought Graph</span>
      </button>

      <button class="tab-button {selectedTab === 'admin' ? 'active' : ''}" on:click={() => selectedTab = 'admin'}>
        <Shield size={15} />
        <span>Admin Command Deck</span>
      </button>

      <button class="tab-button {selectedTab === 'socket' ? 'active' : ''}" on:click={() => selectedTab = 'socket'}>
        <Radio size={15} />
        <span>Live WebSocket Frames</span>
      </button>
    </div>

    <!-- Theme Selection (10 Themes) -->
    <div class="theme-dropdown-container">
      <span class="theme-label">🎨 Palette:</span>
      <select class="theme-select-input" value={$activeTheme} on:change={(e) => setTheme(e.target.value)}>
        <optgroup label="🌙 DARK THEMES (5)">
          {#each THEMES.filter(t => t.isDark) as t}
            <option value={t.id}>{t.label}</option>
          {/each}
        </optgroup>
        <optgroup label="☀️ LIGHT THEMES (5)">
          {#each THEMES.filter(t => !t.isDark) as t}
            <option value={t.id}>{t.label}</option>
          {/each}
        </optgroup>
      </select>

      <button class="btn-quick-key" on:click={() => generateActivationCode()}>
        <Key size={13} />
        <span>+ Key</span>
      </button>
    </div>
  </nav>

  <!-- 3. Dynamic Viewport -->
  <main class="pkg-viewport">
    
    <!-- TAB 1: RESEARCH CONSOLE -->
    {#if selectedTab === 'chat'}
      <div class="chat-deck">
        <!-- Sidebar -->
        <aside class="chat-sidebar">
          <div class="sidebar-search-bar">
            <Search size={13} class="search-icon" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              bind:value={searchQuery}
              class="search-input"
            />
            <button class="btn-icon-add" title="New Thread" on:click={() => createNewThread()}>
              <Plus size={14} />
            </button>
          </div>

          <div class="thread-scroll-view">
            {#each filteredChats as c}
              <div 
                class="thread-item {c.id === $currentChatId ? 'active' : ''}" 
                on:click={() => selectChat(c.id)}
              >
                <div class="thread-item-header">
                  <span class="thread-title">{c.pinned ? '📌 ' : ''}{c.title}</span>
                  <span class="thread-time">{c.updatedAt}</span>
                </div>
                <div class="thread-item-meta">{c.model} · {c.tokens.used} tokens</div>
              </div>
            {/each}
          </div>
        </aside>

        <!-- Chat Stream -->
        <section class="chat-main-stream">
          <div class="stream-header">
            <div class="stream-title-group">
              <span class="status-indicator online"></span>
              <h2>{$currentChat.title}</h2>
            </div>
            <div class="stream-actions">
              <span class="badge-tokens">{$currentChat.model}</span>
              <button class="btn-jump-graph" on:click={() => selectedTab = 'graph'}>
                <GitBranch size={13} />
                <span>Open in 2D Graph</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div class="messages-container">
            {#each $currentChat.messages as m}
              <div class="msg-bubble-row {m.sender}">
                <div class="msg-bubble-card">
                  <div class="msg-card-head">
                    <span class="msg-sender">{m.senderName}</span>
                    <span class="msg-timestamp">{m.time}</span>
                  </div>
                  <div class="msg-text">
                    {@html m.text.replace(/\n/g, '<br>')}
                  </div>
                  {#if m.code}
                    <div class="code-editor-preview">
                      <div class="code-preview-bar">
                        <span>{m.code.language} ({m.code.filename})</span>
                        <span class="code-badge">Verified</span>
                      </div>
                      <pre><code>{m.code.content}</code></pre>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>

          <!-- Prompt Bar -->
          <div class="chat-input-bar">
            <div class="cli-chips-list">
              <button class="chip-item" on:click={() => setTheme('dark-obsidian-copper')}>/theme obsidian</button>
              <button class="chip-item" on:click={() => setTheme('light-parchment-gold')}>/theme parchment</button>
              <button class="chip-item" on:click={() => selectedTab = 'graph'}>/graph</button>
              <button class="chip-item" on:click={() => generateActivationCode()}>/keygen</button>
            </div>

            <div class="input-field-group">
              <input 
                type="text" 
                class="text-input" 
                placeholder="Ask Skye about boundary extensions or type /command..."
                bind:value={inputText}
                on:keydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button class="btn-send-action" on:click={handleSend}>
                <span>Send</span>
                <Send size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>
    {/if}

    <!-- TAB 2: 2D THOUGHT GRAPH PER CONVERSATION -->
    {#if selectedTab === 'graph'}
      <div class="graph-deck">
        <div class="graph-header-controls">
          <div class="graph-title-block">
            <span>Cognitive Topology for:</span>
            <strong class="active-graph-name">{$currentChat.title}</strong>
            <span class="badge-nodes">{$activeGraphNodes.length} Graph Nodes</span>
          </div>

          <div class="graph-actions-block">
            <button class="btn-action-pill" on:click={() => forkHypothesisNode($currentChatId, "Branch C: Noncommutative Scaling Site")}>
              <Plus size={13} />
              <span>+ Fork Hypothesis Node</span>
            </button>
          </div>
        </div>

        <div class="graph-canvas-viewport" style="transform: scale({zoomLevel});">
          <!-- SVG Links -->
          <svg class="canvas-svg-layer">
            {#each $activeGraphNodes as source}
              {#if source.linksTo}
                {#each source.linksTo as targetId}
                  {@const target = $activeGraphNodes.find(n => n.id === targetId)}
                  {#if target}
                    <path
                      d="M {source.x + 130} {source.y + 80} C {source.x + 130} {source.y + 140}, {target.x + 130} {target.y - 40}, {target.x + 130} {target.y}"
                      stroke="var(--accent)"
                      stroke-width="2.2"
                      fill="none"
                    />
                  {/if}
                {/each}
              {/if}
            {/each}
          </svg>

          <!-- Interactive Node Cards -->
          {#each $activeGraphNodes as node}
            <div 
              class="pkg-node-card {selectedNode?.id === node.id ? 'active' : ''}"
              style="left: {node.x}px; top: {node.y}px;"
              on:mousedown={(e) => handleNodeDrag(e, node)}
              on:click={() => selectedNode = node}
            >
              <div class="node-badge-row">
                <span class="node-pill {node.type}">{node.badge}</span>
                <Move size={11} class="drag-handle-icon" />
              </div>
              <div class="node-title-text">{node.title}</div>
              <div class="node-snippet-text">{node.text}</div>
              <div class="node-footer-row">
                <span>Click to inspect</span>
                <span>ID: {node.id}</span>
              </div>
            </div>
          {/each}

          <!-- Node Inspector Drawer -->
          {#if selectedNode}
            <div class="node-inspector-box">
              <div class="inspector-header">
                <span class="node-pill {selectedNode.type}">{selectedNode.badge}</span>
                <button class="btn-close-inspector" on:click={() => selectedNode = null}>✕</button>
              </div>
              <h3>{selectedNode.title}</h3>
              <p>{selectedNode.text}</p>
              <button class="btn-jump-turn" on:click={() => selectedTab = 'chat'}>
                Jump to Conversation Turn →
              </button>
            </div>
          {/if}
        </div>

        <!-- Canvas Zoom Controls -->
        <div class="canvas-zoom-hud">
          <button class="zoom-btn" on:click={() => zoomLevel = Math.min(1.8, zoomLevel + 0.15)}><ZoomIn size={14} /></button>
          <button class="zoom-btn" on:click={() => zoomLevel = Math.max(0.6, zoomLevel - 0.15)}><ZoomOut size={14} /></button>
          <button class="zoom-btn" on:click={() => zoomLevel = 1.0}><RotateCcw size={14} /></button>
        </div>
      </div>
    {/if}

    <!-- TAB 3: ADMIN COMMAND DECK -->
    {#if selectedTab === 'admin'}
      <div class="admin-deck">
        <div class="admin-cards-container">
          <div class="admin-panel-card">
            <h3>User Directory & Access Tiers</h3>
            <table class="pkg-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role Tier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {#each $USERS_DATA as u}
                  <tr>
                    <td><strong>{u.name}</strong></td>
                    <td class="code-font">{u.email}</td>
                    <td><span class="pill-badge">{u.role}</span></td>
                    <td>
                      <span class="status-indicator {u.status === 'active' ? 'online' : 'offline'}"></span>
                      {u.status}
                    </td>
                    <td>
                      <button class="btn-action-table" on:click={() => toggleUser(u.id)}>
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="admin-panel-card">
            <div class="card-header-actions">
              <h3>Cryptographic Activation Keys (RN-SKYE-510510-...)</h3>
              <button class="btn-primary-action" on:click={() => generateActivationCode()}>
                + Issue Key
              </button>
            </div>
            <table class="pkg-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {#each $CODES_DATA as c}
                  <tr>
                    <td class="key-code">{c.code}</td>
                    <td>{c.recipient}</td>
                    <td><span class="pill-badge {c.status}">{c.status}</span></td>
                    <td>{c.expiresAt}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}

    <!-- TAB 4: WEBSOCKET TELEMETRY -->
    {#if selectedTab === 'socket'}
      <div class="socket-deck">
        <div class="socket-stream-box">
          <div class="socket-log-header">// Live WebSocket Stream (ws://localhost:8000/api/v1/skye/stream)</div>
          {#each $SOCKET_FRAMES as frame}
            <div class="socket-row">
              <span class="socket-time">{frame.time}</span>
              <span class="socket-type">[{frame.type}]</span>
              <span class="socket-body">{JSON.stringify(frame.payload)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </main>

</div>

<style>
  .pkg-app-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 38px);
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  /* HUD */
  .pkg-telemetry-hud {
    background-color: var(--code-bg);
    border-bottom: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    font-family: var(--font-mono);
  }
  .hud-item-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .brand-name { color: var(--accent); }
  .brand-tag { font-size: 10px; color: var(--text-muted); }
  
  .telemetry-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .badge-role {
    font-size: 10px;
    background: var(--accent-muted);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .status-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .status-indicator.online { background: var(--success); box-shadow: 0 0 6px rgba(76, 175, 80, 0.5); }
  .status-indicator.offline { background: var(--error); }

  /* Navbar */
  .pkg-navbar {
    height: 46px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
  .nav-tabs {
    display: flex;
    gap: 4px;
  }
  .tab-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .tab-button:hover { background: var(--bg-hover); color: var(--text-primary); }
  .tab-button.active {
    background: var(--surface);
    color: var(--accent);
    border-color: var(--border);
    font-weight: 600;
  }

  .theme-dropdown-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .theme-label { font-size: 12px; color: var(--text-secondary); }
  .theme-select-input {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  .btn-quick-key {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
  }

  /* Viewport */
  .pkg-viewport {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Chat Deck */
  .chat-deck {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .chat-sidebar {
    width: 270px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .sidebar-search-bar {
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .search-input {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 8px;
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
  }
  .btn-icon-add {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
  }
  .thread-scroll-view {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .thread-item {
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    border-left: 3px solid transparent;
  }
  .thread-item:hover { background: var(--bg-hover); }
  .thread-item.active {
    background: var(--accent-muted);
    border-left-color: var(--accent);
  }
  .thread-item-header {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    font-weight: 500;
  }
  .thread-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
  .thread-time { font-size: 10px; color: var(--text-muted); }
  .thread-item-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  .chat-main-stream {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow: hidden;
  }
  .stream-header {
    height: 40px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .stream-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stream-title-group h2 { font-size: 13.5px; font-weight: 600; }
  .stream-actions { display: flex; align-items: center; gap: 8px; }
  .badge-tokens { font-family: var(--font-mono); font-size: 11px; color: var(--accent); }
  .btn-jump-graph {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .msg-bubble-card {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .msg-bubble-row.user .msg-bubble-card {
    background: var(--user-bubble);
    border: 1px solid var(--user-bubble-border);
  }
  .msg-bubble-row.skye .msg-bubble-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .msg-card-head {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  .code-editor-preview {
    margin-top: 8px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .code-preview-bar {
    background: rgba(255, 255, 255, 0.04);
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    color: var(--text-muted);
  }
  .code-editor-preview pre { padding: 8px 12px; overflow-x: auto; }

  .chat-input-bar {
    padding: 10px 14px;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cli-chips-list { display: flex; gap: 6px; }
  .chip-item {
    padding: 2px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    cursor: pointer;
  }
  .chip-item:hover { color: var(--accent); border-color: var(--accent); }

  .input-field-group {
    display: flex;
    gap: 8px;
  }
  .text-input {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 12px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .btn-send-action {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 6px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  /* 2D Thought Graph */
  .graph-deck {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .graph-header-controls {
    height: 38px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  .active-graph-name { color: var(--accent); margin: 0 6px; }
  .badge-nodes {
    font-size: 10.5px;
    background: var(--surface);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }
  .btn-action-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    cursor: pointer;
  }

  .graph-canvas-viewport {
    flex: 1;
    position: relative;
    background: var(--graph-canvas-bg);
    overflow: hidden;
    transform-origin: 0 0;
  }
  .canvas-svg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .pkg-node-card {
    position: absolute;
    width: 260px;
    background: var(--node-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px;
    box-shadow: var(--shadow-md);
    cursor: grab;
    user-select: none;
    z-index: 10;
  }
  .pkg-node-card:active { cursor: grabbing; }
  .pkg-node-card.active {
    border-color: var(--accent);
    box-shadow: 0 0 14px var(--accent-glow);
  }
  .node-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .node-pill {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent-muted);
    color: var(--accent);
  }
  .node-title-text { font-weight: 600; font-size: 12.5px; color: var(--text-primary); margin-bottom: 4px; }
  .node-snippet-text { font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; }
  .node-footer-row {
    margin-top: 6px;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
  }

  .node-inspector-box {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 280px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    box-shadow: var(--shadow-lg);
    z-index: 30;
  }
  .inspector-header { display: flex; justify-content: space-between; }
  .btn-close-inspector { background: none; border: none; color: var(--text-muted); cursor: pointer; }
  .btn-jump-turn {
    margin-top: 10px;
    width: 100%;
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 6px;
    font-weight: 600;
    font-size: 11.5px;
    cursor: pointer;
  }

  .canvas-zoom-hud {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 50;
  }
  .zoom-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Admin & Socket */
  .admin-deck, .socket-deck {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  .admin-cards-container { display: flex; flex-direction: column; gap: 16px; }
  .admin-panel-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
  }
  .card-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .pkg-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .pkg-table th, .pkg-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); }
  .pill-badge { font-size: 10.5px; padding: 2px 6px; border-radius: 4px; background: var(--bg-hover); }
  .btn-action-table { background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }
  .btn-primary-action { background: var(--accent); color: #111; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer; }

  .socket-stream-box {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11.5px;
  }
  .socket-log-header { color: var(--text-muted); margin-bottom: 8px; }
  .socket-row { display: flex; gap: 8px; margin-bottom: 4px; }
  .socket-time { color: var(--text-muted); }
  .socket-type { color: var(--accent); font-weight: 600; }
  .socket-body { color: var(--text-primary); }
</style>
