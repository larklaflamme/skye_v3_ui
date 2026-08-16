<script>
  import { activeTheme, THEMES, setTheme } from '../lib/stores/themeStore.js';
  import { chats, currentChatId, currentChat, selectChat, createNewThread, sendMessage } from '../lib/stores/chatStore.js';
  import { activeGraphNodes, updateNodePosition, forkHypothesisNode } from '../lib/stores/graphStore.js';
  import { USERS_DATA, CODES_DATA, TELEMETRY_METRICS, SOCKET_FRAMES, generateActivationCode, toggleUser } from '../lib/stores/adminStore.js';
  import { fade, fly, scale } from 'svelte/transition';

  let selectedTab = 'chat'; // 'chat' | 'graph' | 'admin' | 'socket'
  let inputText = '';
  let selectedNode = null;

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
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
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

<div class="pure-app-wrapper" in:fade={{ duration: 150 }}>
  
  <!-- 1. Pure Svelte Telemetry HUD -->
  <header class="pure-telemetry-hud">
    <div class="hud-left-strip">
      <div class="pure-brand">
        <span class="glyph">◆</span>
        <strong>RAVENNEST SKYE</strong>
        <span class="pure-subtag">Pure Svelte 5</span>
      </div>

      <div class="telemetry-chip active">
        <span class="status-online-dot"></span>
        <span>EBv3: PID {$TELEMETRY_METRICS.ebv3Pid}</span>
      </div>

      <div class="telemetry-chip">
        <span>Engine: :{$TELEMETRY_METRICS.skyePort}</span>
      </div>

      <div class="telemetry-chip">
        <span>MCP: {$TELEMETRY_METRICS.mcpTools} Tools ({$TELEMETRY_METRICS.mcpLatency})</span>
      </div>
    </div>

    <div class="hud-right-strip">
      <div class="telemetry-chip">
        <span>CPU: <strong>{$TELEMETRY_METRICS.cpu}%</strong></span>
        <span>·</span>
        <span>RAM: <strong>{$TELEMETRY_METRICS.ram}</strong></span>
      </div>
      <span class="tier-pill">ADMIN (LARK)</span>
    </div>
  </header>

  <!-- 2. Pure Svelte Navigation & 10 Themes -->
  <nav class="pure-nav-bar">
    <div class="pure-tab-bar">
      <button class="pure-tab-btn {selectedTab === 'chat' ? 'active' : ''}" on:click={() => selectedTab = 'chat'}>
        💬 Research Console
      </button>
      <button class="pure-tab-btn {selectedTab === 'graph' ? 'active' : ''}" on:click={() => selectedTab = 'graph'}>
        🕸️ 2D Thought Graph
      </button>
      <button class="pure-tab-btn {selectedTab === 'admin' ? 'active' : ''}" on:click={() => selectedTab = 'admin'}>
        🛡️ Admin Command Deck
      </button>
      <button class="pure-tab-btn {selectedTab === 'socket' ? 'active' : ''}" on:click={() => selectedTab = 'socket'}>
        📡 Live WebSocket Stream
      </button>
    </div>

    <!-- Theme Dropdown (10 Themes) -->
    <div class="pure-theme-wrapper">
      <span style="font-size:12px; color:var(--text-secondary);">🎨 Palette:</span>
      <select class="pure-theme-select" value={$activeTheme} on:change={(e) => setTheme(e.target.value)}>
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

      <button class="btn-pure-key" on:click={() => generateActivationCode()}>
        + Key (RN-SKYE)
      </button>
    </div>
  </nav>

  <!-- 3. Viewport Panels -->
  <main class="pure-viewport">
    
    <!-- TAB 1: RESEARCH CONSOLE -->
    {#if selectedTab === 'chat'}
      <div class="console-deck" in:fade={{ duration: 120 }}>
        <!-- Sidebar -->
        <aside class="console-sidebar">
          <div class="sidebar-top">
            <span>RESEARCH THREADS</span>
            <button class="btn-pure-add" on:click={() => createNewThread()}>+ New</button>
          </div>
          <div class="sidebar-scroll">
            {#each $chats as c}
              <div 
                class="thread-card {c.id === $currentChatId ? 'active' : ''}"
                on:click={() => selectChat(c.id)}
              >
                <div class="thread-title">{c.pinned ? '📌 ' : ''}{c.title}</div>
                <div class="thread-meta">{c.updatedAt} · {c.model}</div>
              </div>
            {/each}
          </div>
        </aside>

        <!-- Chat Stream -->
        <section class="console-stream">
          <div class="stream-header">
            <div>
              <span class="status-online-dot"></span>
              <strong style="margin-left:6px; font-size:13.5px;">{$currentChat.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="model-badge">{$currentChat.model} · {$currentChat.tokens.used} tok</span>
              <button class="btn-pure-jump" on:click={() => selectedTab = 'graph'}>
                View in 2D Graph ↗
              </button>
            </div>
          </div>

          <div class="messages-scroll-area">
            {#each $currentChat.messages as m}
              <div class="msg-row {m.sender}" in:fly={{ y: 8, duration: 150 }}>
                <div class="msg-bubble">
                  <div class="msg-head">
                    <strong>{m.senderName}</strong>
                    <span>{m.time}</span>
                  </div>
                  <div class="msg-text">
                    {@html m.text.replace(/\n/g, '<br>')}
                  </div>
                  {#if m.code}
                    <div class="code-block-pure">
                      <div class="code-header">{m.code.language} ({m.code.filename})</div>
                      <pre><code>{m.code.content}</code></pre>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>

          <!-- Prompt Bar -->
          <div class="prompt-bar">
            <div class="chips-row">
              <button class="chip" on:click={() => setTheme('dark-amethyst-silver')}>/theme amethyst</button>
              <button class="chip" on:click={() => setTheme('light-botanical-bronze')}>/theme botanical</button>
              <button class="chip" on:click={() => selectedTab = 'graph'}>/graph</button>
              <button class="chip" on:click={() => generateActivationCode()}>/keygen</button>
            </div>

            <div class="input-row">
              <input 
                type="text" 
                class="pure-input" 
                placeholder="Ask Skye about spectral dilation matrices or run /command..."
                bind:value={inputText}
                on:keydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button class="btn-pure-send" on:click={handleSend}>
                Send ▶
              </button>
            </div>
          </div>
        </section>
      </div>
    {/if}

    <!-- TAB 2: 2D THOUGHT GRAPH (PER CONVERSATION) -->
    {#if selectedTab === 'graph'}
      <div class="graph-deck" in:fade={{ duration: 120 }}>
        <div class="graph-top-bar">
          <div>
            <span>Active Thread:</span>
            <strong style="color:var(--accent); margin:0 6px;">{$currentChat.title}</strong>
            <span class="model-badge">{$activeGraphNodes.length} Nodes Mapped</span>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn-pure-action" on:click={() => forkHypothesisNode($currentChatId, "Branch C: Noncommutative Adeles")}>
              + Fork Hypothesis Node
            </button>
          </div>
        </div>

        <div class="graph-canvas-container">
          <svg class="graph-svg">
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

          <!-- Nodes -->
          {#each $activeGraphNodes as node}
            <div 
              class="pure-node-card {selectedNode?.id === node.id ? 'active' : ''}"
              style="left: {node.x}px; top: {node.y}px;"
              on:mousedown={(e) => handleNodeDrag(e, node)}
              on:click={() => selectedNode = node}
            >
              <div class="node-top-row">
                <span class="node-badge {node.type}">{node.badge}</span>
                <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">{node.type.toUpperCase()}</span>
              </div>
              <div class="node-title">{node.title}</div>
              <div class="node-snippet">{node.text}</div>
              <div class="node-foot">
                <span>Drag to arrange</span>
                <span>Inspect 🔍</span>
              </div>
            </div>
          {/each}

          <!-- Inspector -->
          {#if selectedNode}
            <div class="node-inspector-pane" in:scale={{ duration: 150 }}>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="node-badge {selectedNode.type}">{selectedNode.badge}</span>
                <button class="close-btn" on:click={() => selectedNode = null}>✕</button>
              </div>
              <h4>{selectedNode.title}</h4>
              <p>{selectedNode.text}</p>
              <button class="btn-jump-action" on:click={() => selectedTab = 'chat'}>
                Jump to Conversation Turn →
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 3: ADMIN COMMAND DECK -->
    {#if selectedTab === 'admin'}
      <div class="admin-deck" in:fade={{ duration: 120 }}>
        <div class="admin-grid">
          <div class="pure-card">
            <h3>User Directory & Access Tiers</h3>
            <table class="pure-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {#each $USERS_DATA as u}
                  <tr>
                    <td><strong>{u.name}</strong></td>
                    <td style="font-family:var(--font-mono);">{u.email}</td>
                    <td><span class="model-badge">{u.role}</span></td>
                    <td>
                      <span class="status-{u.status === 'active' ? 'online' : 'offline'}"></span>
                      {u.status}
                    </td>
                    <td>
                      <button class="btn-pure-toggle" on:click={() => toggleUser(u.id)}>
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="pure-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3>Cryptographic Activation Keys (RN-SKYE-510510-...)</h3>
              <button class="btn-pure-action" on:click={() => generateActivationCode()}>+ Issue Key</button>
            </div>
            <table class="pure-table">
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
                    <td style="font-family:var(--font-mono); color:var(--accent);">{c.code}</td>
                    <td>{c.recipient}</td>
                    <td><span class="node-badge {c.status}">{c.status}</span></td>
                    <td>{c.expiresAt}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}

    <!-- TAB 4: WEBSOCKET STREAM -->
    {#if selectedTab === 'socket'}
      <div class="socket-deck" in:fade={{ duration: 120 }}>
        <div class="socket-box">
          <div style="color:var(--text-muted); margin-bottom:8px;">// Live WebSocket Stream (ws://localhost:8000/api/v1/skye/stream)</div>
          {#each $SOCKET_FRAMES as f}
            <div class="socket-line">
              <span style="color:var(--text-muted);">{f.time}</span>
              <span style="color:var(--accent); font-weight:600;">[{f.type}]</span>
              <span style="color:var(--text-primary);">{JSON.stringify(f.payload)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </main>

</div>

<style>
  .pure-app-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 38px);
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  /* HUD */
  .pure-telemetry-hud {
    background-color: var(--code-bg);
    border-bottom: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    font-family: var(--font-mono);
  }
  .hud-left-strip, .hud-right-strip {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pure-brand { display: flex; align-items: center; gap: 6px; }
  .pure-brand .glyph { color: var(--accent); font-weight: 700; }
  .pure-subtag { font-size: 10px; color: var(--text-muted); }

  .telemetry-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .tier-pill {
    font-size: 10px;
    background: var(--accent-muted);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .status-online-dot { width: 7px; height: 7px; background: var(--success); border-radius: 50%; display: inline-block; }
  .status-online { width: 7px; height: 7px; background: var(--success); border-radius: 50%; display: inline-block; }
  .status-offline { width: 7px; height: 7px; background: var(--error); border-radius: 50%; display: inline-block; }

  /* Navbar */
  .pure-nav-bar {
    height: 46px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
  .pure-tab-bar { display: flex; gap: 4px; }
  .pure-tab-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .pure-tab-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .pure-tab-btn.active {
    background: var(--surface);
    color: var(--accent);
    border-color: var(--border);
    font-weight: 600;
  }

  .pure-theme-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pure-theme-select {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  .btn-pure-key {
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
  }

  .pure-viewport {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Console Layout */
  .console-deck {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .console-sidebar {
    width: 270px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .sidebar-top {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .btn-pure-add {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
  }
  .sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .thread-card {
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    border-left: 3px solid transparent;
  }
  .thread-card:hover { background: var(--bg-hover); }
  .thread-card.active {
    background: var(--accent-muted);
    border-left-color: var(--accent);
  }
  .thread-title { font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thread-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  .console-stream {
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
  .model-badge { font-family: var(--font-mono); font-size: 11px; color: var(--accent); }
  .btn-pure-jump {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
  }

  .messages-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .msg-bubble {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .msg-row.user .msg-bubble {
    background: var(--user-bubble);
    border: 1px solid var(--user-bubble-border);
  }
  .msg-row.skye .msg-bubble {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .msg-head { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
  .code-block-pure {
    margin-top: 8px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .code-header { background: rgba(255, 255, 255, 0.04); padding: 4px 8px; font-size: 10.5px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  .code-block-pure pre { padding: 8px 12px; overflow-x: auto; }

  .prompt-bar {
    padding: 10px 14px;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .chips-row { display: flex; gap: 6px; }
  .chip {
    padding: 2px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    cursor: pointer;
  }
  .chip:hover { color: var(--accent); border-color: var(--accent); }
  .input-row { display: flex; gap: 8px; }
  .pure-input {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 12px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .btn-pure-send {
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
  .graph-top-bar {
    height: 38px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  .btn-pure-action {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    cursor: pointer;
  }

  .graph-canvas-container {
    flex: 1;
    position: relative;
    background: var(--graph-canvas-bg);
    overflow: hidden;
  }
  .graph-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .pure-node-card {
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
  .pure-node-card:active { cursor: grabbing; }
  .pure-node-card.active { border-color: var(--accent); box-shadow: 0 0 12px var(--accent-glow); }
  .node-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .node-badge {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent-muted);
    color: var(--accent);
  }
  .node-title { font-weight: 600; font-size: 12.5px; color: var(--text-primary); margin-bottom: 4px; }
  .node-snippet { font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; }
  .node-foot { margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }

  .node-inspector-pane {
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
  .node-inspector-pane h4 { margin: 8px 0; font-size: 13px; }
  .node-inspector-pane p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
  .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
  .btn-jump-action {
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

  /* Admin & Socket */
  .admin-deck, .socket-deck {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  .admin-grid { display: flex; flex-direction: column; gap: 16px; }
  .pure-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
  }
  .pure-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .pure-table th, .pure-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); }
  .btn-pure-toggle { background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }

  .socket-box {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11.5px;
  }
  .socket-line { display: flex; gap: 8px; margin-bottom: 4px; }
</style>
