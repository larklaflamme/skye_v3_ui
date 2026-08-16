<script>
  import { activeTheme, THEMES, setTheme } from '../lib/stores/themeStore.js';
  import { chats, currentChatId, currentChat, selectChat, createNewThread, sendMessage } from '../lib/stores/chatStore.js';
  import { activeGraphNodes, updateNodePosition, forkHypothesisNode } from '../lib/stores/graphStore.js';
  import { USERS_DATA, CODES_DATA, TELEMETRY_METRICS, SOCKET_FRAMES, generateActivationCode, toggleUser } from '../lib/stores/adminStore.js';

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

<div class="svar-app-wrapper">
  
  <!-- 1. SVAR Top Telemetry HUD -->
  <div class="svar-telemetry-hud">
    <div class="svar-hud-left">
      <div class="svar-brand-block">
        <span class="svar-glyph">◆</span>
        <strong>RAVENNEST SKYE</strong>
        <span class="svar-badge-core">SVAR Widgets</span>
      </div>

      <div class="svar-hud-cell">
        <span class="svar-dot-online"></span>
        <span>EBv3: PID {$TELEMETRY_METRICS.ebv3Pid}</span>
      </div>

      <div class="svar-hud-cell">
        <span>Engine: :{$TELEMETRY_METRICS.skyePort}</span>
      </div>

      <div class="svar-hud-cell">
        <span>MCP: {$TELEMETRY_METRICS.mcpTools} Tools ({$TELEMETRY_METRICS.mcpLatency})</span>
      </div>
    </div>

    <div class="svar-hud-right">
      <div class="svar-hud-cell">
        <span>CPU: <strong>{$TELEMETRY_METRICS.cpu}%</strong></span>
        <span>·</span>
        <span>RAM: <strong>{$TELEMETRY_METRICS.ram}</strong></span>
      </div>
      <span class="svar-tier-badge">ADMIN (LARK)</span>
    </div>
  </div>

  <!-- 2. SVAR Toolbar & Theme Dropdown -->
  <div class="svar-toolbar">
    <div class="svar-tab-group">
      <button class="svar-tab {selectedTab === 'chat' ? 'active' : ''}" on:click={() => selectedTab = 'chat'}>
        <span>💬 Research Console</span>
      </button>
      <button class="svar-tab {selectedTab === 'graph' ? 'active' : ''}" on:click={() => selectedTab = 'graph'}>
        <span>🕸️ 2D Thought Graph</span>
      </button>
      <button class="svar-tab {selectedTab === 'admin' ? 'active' : ''}" on:click={() => selectedTab = 'admin'}>
        <span>🛡️ Admin Command Deck</span>
      </button>
      <button class="svar-tab {selectedTab === 'socket' ? 'active' : ''}" on:click={() => selectedTab = 'socket'}>
        <span>📡 Live WebSocket Telemetry</span>
      </button>
    </div>

    <div class="svar-theme-group">
      <span style="font-size:12px; color:var(--text-secondary);">🎨 Palette:</span>
      <select class="svar-select" value={$activeTheme} on:change={(e) => setTheme(e.target.value)}>
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

      <button class="svar-btn-key" on:click={() => generateActivationCode()}>
        + Key (RN-SKYE)
      </button>
    </div>
  </div>

  <!-- 3. SVAR Viewport Deck -->
  <main class="svar-viewport">
    
    <!-- TAB 1: RESEARCH CONSOLE -->
    {#if selectedTab === 'chat'}
      <div class="svar-console-deck">
        <!-- Sidebar Tree / List -->
        <aside class="svar-sidebar-tree">
          <div class="svar-tree-head">
            <span>RESEARCH SESSIONS</span>
            <button class="svar-btn-xs" on:click={() => createNewThread()}>+ New</button>
          </div>
          <div class="svar-tree-scroll">
            {#each $chats as c}
              <div 
                class="svar-tree-node {c.id === $currentChatId ? 'active' : ''}"
                on:click={() => selectChat(c.id)}
              >
                <div class="svar-node-title">{c.pinned ? '📌 ' : ''}{c.title}</div>
                <div class="svar-node-meta">{c.updatedAt} · {c.model}</div>
              </div>
            {/each}
          </div>
        </aside>

        <!-- Main Stream -->
        <section class="svar-main-stream">
          <div class="svar-stream-toolbar">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="svar-dot-online"></span>
              <strong>{$currentChat.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="svar-badge-model">{$currentChat.model} · {$currentChat.tokens.used} tok</span>
              <button class="svar-btn-jump" on:click={() => selectedTab = 'graph'}>
                View in 2D Graph ↗
              </button>
            </div>
          </div>

          <div class="svar-messages-scroll">
            {#each $currentChat.messages as m}
              <div class="svar-msg-row {m.sender}">
                <div class="svar-msg-bubble">
                  <div class="svar-bubble-head">
                    <strong>{m.senderName}</strong>
                    <span>{m.time}</span>
                  </div>
                  <div class="svar-bubble-body">
                    {@html m.text.replace(/\n/g, '<br>')}
                  </div>
                  {#if m.code}
                    <div class="svar-code-box">
                      <div class="svar-code-head">{m.code.language} ({m.code.filename})</div>
                      <pre><code>{m.code.content}</code></pre>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>

          <!-- Input Bar -->
          <div class="svar-input-bar">
            <div class="svar-chips-row">
              <button class="svar-chip" on:click={() => setTheme('dark-forest-ochre')}>/theme forest</button>
              <button class="svar-chip" on:click={() => setTheme('light-alabaster-terracotta')}>/theme alabaster</button>
              <button class="svar-chip" on:click={() => selectedTab = 'graph'}>/graph</button>
              <button class="svar-chip" on:click={() => generateActivationCode()}>/keygen</button>
            </div>

            <div class="svar-input-group">
              <input 
                type="text" 
                class="svar-text-field"
                placeholder="Ask Skye about spectral formulations or run /command..."
                bind:value={inputText}
                on:keydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button class="svar-btn-send" on:click={handleSend}>
                Send ▶
              </button>
            </div>
          </div>
        </section>
      </div>
    {/if}

    <!-- TAB 2: 2D THOUGHT GRAPH PER CONVERSATION -->
    {#if selectedTab === 'graph'}
      <div class="svar-graph-deck">
        <div class="svar-graph-toolbar">
          <div>
            <span>Active Investigation:</span>
            <strong style="color:var(--accent); margin:0 6px;">{$currentChat.title}</strong>
            <span class="svar-badge-model">{$activeGraphNodes.length} Cognitive Nodes</span>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="svar-btn-action" on:click={() => forkHypothesisNode($currentChatId, "Branch C: Noncommutative Trace Formula")}>
              + Fork Hypothesis Node
            </button>
          </div>
        </div>

        <div class="svar-canvas-view">
          <svg class="svar-svg-layer">
            {#each $activeGraphNodes as source}
              {#if source.linksTo}
                {#each source.linksTo as targetId}
                  {@const target = $activeGraphNodes.find(n => n.id === targetId)}
                  {#if target}
                    <path
                      d="M {source.x + 130} {source.y + 80} C {source.x + 130} {source.y + 140}, {target.x + 130} {target.y - 40}, {target.x + 130} {target.y}"
                      stroke="var(--accent)"
                      stroke-width="2"
                      fill="none"
                    />
                  {/if}
                {/each}
              {/if}
            {/each}
          </svg>

          <!-- Thought Nodes -->
          {#each $activeGraphNodes as node}
            <div 
              class="svar-node-card {selectedNode?.id === node.id ? 'active' : ''}"
              style="left: {node.x}px; top: {node.y}px;"
              on:mousedown={(e) => handleNodeDrag(e, node)}
              on:click={() => selectedNode = node}
            >
              <div class="svar-node-top">
                <span class="svar-node-badge {node.type}">{node.badge}</span>
                <span style="font-size:10px; color:var(--text-muted);">{node.type.toUpperCase()}</span>
              </div>
              <div class="svar-node-heading">{node.title}</div>
              <div class="svar-node-body">{node.text}</div>
              <div class="svar-node-foot">
                <span>Drag to align</span>
                <span>Inspect 🔍</span>
              </div>
            </div>
          {/each}

          <!-- Node Inspector -->
          {#if selectedNode}
            <div class="svar-inspector">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="svar-node-badge {selectedNode.type}">{selectedNode.badge}</span>
                <button class="svar-close" on:click={() => selectedNode = null}>✕</button>
              </div>
              <h4>{selectedNode.title}</h4>
              <p>{selectedNode.text}</p>
              <button class="svar-btn-jump-turn" on:click={() => selectedTab = 'chat'}>
                Jump to Conversation Turn →
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 3: ADMIN COMMAND DECK -->
    {#if selectedTab === 'admin'}
      <div class="svar-admin-deck">
        <div class="svar-admin-grid">
          <div class="svar-card">
            <h3>User Directory & Access Grid</h3>
            <table class="svar-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {#each $USERS_DATA as u}
                  <tr>
                    <td><strong>{u.name}</strong></td>
                    <td style="font-family:var(--font-mono);">{u.email}</td>
                    <td><span class="svar-badge-model">{u.role}</span></td>
                    <td>
                      <span class="svar-dot-{u.status === 'active' ? 'online' : 'red'}"></span>
                      {u.status}
                    </td>
                    <td>
                      <button class="svar-btn-xs" on:click={() => toggleUser(u.id)}>
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="svar-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3>Cryptographic Activation Keys (RN-SKYE-510510-...)</h3>
              <button class="svar-btn-action" on:click={() => generateActivationCode()}>+ Issue Key</button>
            </div>
            <table class="svar-table">
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
                    <td><span class="svar-node-badge {c.status}">{c.status}</span></td>
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
      <div class="svar-socket-deck">
        <div class="svar-socket-box">
          <div style="color:var(--text-muted); margin-bottom:8px;">// Live WebSocket Stream (ws://localhost:8000/api/v1/skye/stream)</div>
          {#each $SOCKET_FRAMES as f}
            <div class="svar-socket-row">
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
  .svar-app-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 38px);
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  /* HUD */
  .svar-telemetry-hud {
    background-color: var(--code-bg);
    border-bottom: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    font-family: var(--font-mono);
  }
  .svar-hud-left, .svar-hud-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .svar-brand-block {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .svar-glyph { color: var(--accent); }
  .svar-badge-core { font-size: 10px; color: var(--text-muted); }

  .svar-hud-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .svar-tier-badge {
    font-size: 10px;
    background: var(--accent-muted);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .svar-dot-online { width: 7px; height: 7px; background: var(--success); border-radius: 50%; display: inline-block; }
  .svar-dot-red { width: 7px; height: 7px; background: var(--error); border-radius: 50%; display: inline-block; }

  /* Toolbar */
  .svar-toolbar {
    height: 46px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
  .svar-tab-group { display: flex; gap: 4px; }
  .svar-tab {
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
  .svar-tab:hover { background: var(--bg-hover); color: var(--text-primary); }
  .svar-tab.active {
    background: var(--surface);
    color: var(--accent);
    border-color: var(--border);
    font-weight: 600;
  }

  .svar-theme-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .svar-select {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  .svar-btn-key {
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
  }

  .svar-viewport {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Console Layout */
  .svar-console-deck {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .svar-sidebar-tree {
    width: 270px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .svar-tree-head {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .svar-btn-xs {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
  }
  .svar-tree-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .svar-tree-node {
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    border-left: 3px solid transparent;
  }
  .svar-tree-node:hover { background: var(--bg-hover); }
  .svar-tree-node.active {
    background: var(--accent-muted);
    border-left-color: var(--accent);
  }
  .svar-node-title { font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .svar-node-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  .svar-main-stream {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow: hidden;
  }
  .svar-stream-toolbar {
    height: 40px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .svar-badge-model { font-family: var(--font-mono); font-size: 11px; color: var(--accent); }
  .svar-btn-jump {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
  }

  .svar-messages-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .svar-msg-bubble {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .svar-msg-row.user .svar-msg-bubble {
    background: var(--user-bubble);
    border: 1px solid var(--user-bubble-border);
  }
  .svar-msg-row.skye .svar-msg-bubble {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .svar-bubble-head { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
  .svar-code-box {
    margin-top: 8px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .svar-code-head { background: rgba(255, 255, 255, 0.04); padding: 4px 8px; font-size: 10.5px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  .svar-code-box pre { padding: 8px 12px; overflow-x: auto; }

  .svar-input-bar {
    padding: 10px 14px;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .svar-chips-row { display: flex; gap: 6px; }
  .svar-chip {
    padding: 2px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    cursor: pointer;
  }
  .svar-chip:hover { color: var(--accent); border-color: var(--accent); }
  .svar-input-group { display: flex; gap: 8px; }
  .svar-text-field {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 12px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .svar-btn-send {
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 6px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  /* 2D Thought Graph */
  .svar-graph-deck {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .svar-graph-toolbar {
    height: 38px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  .svar-btn-action {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    cursor: pointer;
  }

  .svar-canvas-view {
    flex: 1;
    position: relative;
    background: var(--graph-canvas-bg);
    overflow: hidden;
  }
  .svar-svg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .svar-node-card {
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
  .svar-node-card:active { cursor: grabbing; }
  .svar-node-card.active { border-color: var(--accent); box-shadow: 0 0 12px var(--accent-glow); }
  .svar-node-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .svar-node-badge {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent-muted);
    color: var(--accent);
  }
  .svar-node-heading { font-weight: 600; font-size: 12.5px; color: var(--text-primary); margin-bottom: 4px; }
  .svar-node-body { font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; }
  .svar-node-foot { margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }

  .svar-inspector {
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
  .svar-inspector h4 { margin: 8px 0; font-size: 13px; }
  .svar-inspector p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
  .svar-close { background: none; border: none; color: var(--text-muted); cursor: pointer; }
  .svar-btn-jump-turn {
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
  .svar-admin-deck, .svar-socket-deck {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  .svar-admin-grid { display: flex; flex-direction: column; gap: 16px; }
  .svar-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
  }
  .svar-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .svar-table th, .svar-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); }

  .svar-socket-box {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11.5px;
  }
  .svar-socket-row { display: flex; gap: 8px; margin-bottom: 4px; }
</style>
