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

<div class="flowbite-app-wrapper">
  
  <!-- 1. Top Telemetry HUD (Flowbite Aesthetic) -->
  <div class="flowbite-telemetry-hud">
    <div class="hud-left-group">
      <div class="brand-badge-flow">
        <span class="dot-indicator"></span>
        <strong>RAVENNEST SKYE</strong>
        <span class="sub-label">Flowbite Svelte</span>
      </div>

      <div class="flow-pill">
        <span class="dot-green"></span>
        <span>EBv3: PID {$TELEMETRY_METRICS.ebv3Pid}</span>
      </div>

      <div class="flow-pill">
        <span>Engine: :{$TELEMETRY_METRICS.skyePort}</span>
      </div>

      <div class="flow-pill">
        <span>MCP: {$TELEMETRY_METRICS.mcpTools} tools ({$TELEMETRY_METRICS.mcpLatency})</span>
      </div>
    </div>

    <div class="hud-right-group">
      <div class="flow-pill">
        <span>CPU: <strong>{$TELEMETRY_METRICS.cpu}%</strong></span>
        <span>·</span>
        <span>RAM: <strong>{$TELEMETRY_METRICS.ram}</strong></span>
      </div>
      <span class="role-pill">TIER: ADMIN (LARK)</span>
    </div>
  </div>

  <!-- 2. Cockpit Navigation & 10-Theme Dropdown -->
  <nav class="flowbite-navbar">
    <div class="tab-pill-group">
      <button class="flow-tab-btn {selectedTab === 'chat' ? 'active' : ''}" on:click={() => selectedTab = 'chat'}>
        💬 Research Console
      </button>
      <button class="flow-tab-btn {selectedTab === 'graph' ? 'active' : ''}" on:click={() => selectedTab = 'graph'}>
        🕸️ 2D Thought Graph
      </button>
      <button class="flow-tab-btn {selectedTab === 'admin' ? 'active' : ''}" on:click={() => selectedTab = 'admin'}>
        🛡️ Admin Command Deck
      </button>
      <button class="flow-tab-btn {selectedTab === 'socket' ? 'active' : ''}" on:click={() => selectedTab = 'socket'}>
        📡 Live WebSocket Frames
      </button>
    </div>

    <div class="theme-flow-group">
      <span style="font-size:12px; color:var(--text-secondary);">🎨 Theme:</span>
      <select class="flow-select-theme" value={$activeTheme} on:change={(e) => setTheme(e.target.value)}>
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

      <button class="btn-flow-key" on:click={() => generateActivationCode()}>
        + Key (RN-SKYE)
      </button>
    </div>
  </nav>

  <!-- 3. Main Viewport -->
  <main class="flowbite-viewport">
    
    <!-- TAB 1: RESEARCH CONSOLE -->
    {#if selectedTab === 'chat'}
      <div class="flow-console-deck">
        <!-- Sidebar -->
        <aside class="flow-sidebar">
          <div class="sidebar-header-flow">
            <span>RESEARCH CONVERSATIONS</span>
            <button class="btn-flow-add" on:click={() => createNewThread()}>+ New</button>
          </div>
          <div class="sidebar-threads-scroll">
            {#each $chats as c}
              <div 
                class="thread-card-flow {c.id === $currentChatId ? 'active' : ''}"
                on:click={() => selectChat(c.id)}
              >
                <div class="thread-title-flow">{c.pinned ? '📌 ' : ''}{c.title}</div>
                <div class="thread-meta-flow">{c.updatedAt} · {c.model}</div>
              </div>
            {/each}
          </div>
        </aside>

        <!-- Messages stream -->
        <section class="flow-chat-stream">
          <div class="stream-top-bar">
            <div>
              <span class="dot-green"></span>
              <strong style="margin-left:6px; font-size:13.5px;">{$currentChat.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="flow-badge-info">{$currentChat.model} · {$currentChat.tokens.used} tok</span>
              <button class="btn-flow-open-graph" on:click={() => selectedTab = 'graph'}>
                View in 2D Graph ↗
              </button>
            </div>
          </div>

          <div class="stream-messages-scroll">
            {#each $currentChat.messages as m}
              <div class="flow-msg-card {m.sender}">
                <div class="msg-header-flow">
                  <strong>{m.senderName}</strong>
                  <span>{m.time}</span>
                </div>
                <div class="msg-content-flow">
                  {@html m.text.replace(/\n/g, '<br>')}
                </div>
                {#if m.code}
                  <div class="flow-code-card">
                    <div class="code-head-flow">
                      <span>{m.code.language} ({m.code.filename})</span>
                    </div>
                    <pre><code>{m.code.content}</code></pre>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <!-- Input Bar -->
          <div class="flow-input-dock">
            <div class="flow-chips-row">
              <button class="flow-chip" on:click={() => setTheme('dark-midnight-sapphire')}>/theme sapphire</button>
              <button class="flow-chip" on:click={() => setTheme('light-nordic-fog')}>/theme nordic</button>
              <button class="flow-chip" on:click={() => selectedTab = 'graph'}>/graph</button>
              <button class="flow-chip" on:click={() => generateActivationCode()}>/keygen</button>
            </div>

            <div class="flow-input-wrapper">
              <input 
                type="text" 
                class="flow-text-field" 
                placeholder="Message Skye or execute /command..."
                bind:value={inputText}
                on:keydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button class="btn-flow-send" on:click={handleSend}>
                Send ▶
              </button>
            </div>
          </div>
        </section>
      </div>
    {/if}

    <!-- TAB 2: 2D THOUGHT GRAPH (PER CONVERSATION) -->
    {#if selectedTab === 'graph'}
      <div class="flow-graph-deck">
        <div class="graph-top-flow">
          <div>
            <span>Active Thread:</span>
            <strong style="color:var(--accent); margin:0 6px;">{$currentChat.title}</strong>
            <span class="flow-badge-accent">{$activeGraphNodes.length} Nodes Mapped</span>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn-flow-action" on:click={() => forkHypothesisNode($currentChatId, "Branch C: Noncommutative Adeles")}>
              + Fork Hypothesis Node
            </button>
          </div>
        </div>

        <div class="flow-canvas-viewport">
          <svg class="flow-svg-layer">
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

          <!-- Nodes -->
          {#each $activeGraphNodes as node}
            <div 
              class="flowbite-node-card {selectedNode?.id === node.id ? 'active' : ''}"
              style="left: {node.x}px; top: {node.y}px;"
              on:mousedown={(e) => handleNodeDrag(e, node)}
              on:click={() => selectedNode = node}
            >
              <div class="flow-node-head">
                <span class="flow-badge-type {node.type}">{node.badge}</span>
                <span style="font-size:10px; color:var(--text-muted);">{node.type.toUpperCase()}</span>
              </div>
              <div class="flow-node-title">{node.title}</div>
              <div class="flow-node-snippet">{node.text}</div>
              <div class="flow-node-foot">
                <span>Drag to move</span>
                <span>Inspect 🔍</span>
              </div>
            </div>
          {/each}

          <!-- Node Inspector -->
          {#if selectedNode}
            <div class="flow-inspector-box">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="flow-badge-type {selectedNode.type}">{selectedNode.badge}</span>
                <button class="close-btn" on:click={() => selectedNode = null}>✕</button>
              </div>
              <h4>{selectedNode.title}</h4>
              <p>{selectedNode.text}</p>
              <button class="btn-flow-jump" on:click={() => selectedTab = 'chat'}>
                Jump to Conversation Turn →
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 3: ADMIN COMMAND DECK -->
    {#if selectedTab === 'admin'}
      <div class="flow-admin-deck">
        <div class="flow-admin-grid">
          <div class="flow-card">
            <h3>User Directory & Access Control</h3>
            <table class="flow-table">
              <thead>
                <tr>
                  <th>Name</th>
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
                    <td><span class="flow-badge-info">{u.role}</span></td>
                    <td>
                      <span class="dot-{u.status === 'active' ? 'green' : 'red'}"></span>
                      {u.status}
                    </td>
                    <td>
                      <button class="btn-flow-toggle" on:click={() => toggleUser(u.id)}>
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="flow-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3>Cryptographic Activation Keys (RN-SKYE-510510-...)</h3>
              <button class="btn-flow-action" on:click={() => generateActivationCode()}>+ Generate Key</button>
            </div>
            <table class="flow-table">
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
                    <td><span class="flow-badge-{c.status === 'used' ? 'green' : c.status === 'unused' ? 'accent' : 'red'}">{c.status}</span></td>
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
      <div class="flow-socket-deck">
        <div class="flow-socket-box">
          <div style="color:var(--text-muted); margin-bottom:8px;">// Live WebSocket Stream (ws://localhost:8000/api/v1/skye/stream)</div>
          {#each $SOCKET_FRAMES as f}
            <div class="socket-frame-flow">
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
  .flowbite-app-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 38px);
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  /* HUD */
  .flowbite-telemetry-hud {
    background-color: var(--code-bg);
    border-bottom: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    font-family: var(--font-mono);
  }
  .hud-left-group, .hud-right-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand-badge-flow {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .brand-badge-flow strong { color: var(--accent); }
  .sub-label { font-size: 10px; color: var(--text-muted); }

  .flow-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .role-pill {
    font-size: 10px;
    background: var(--accent-muted);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .dot-green { width: 7px; height: 7px; background: var(--success); border-radius: 50%; display: inline-block; }
  .dot-red { width: 7px; height: 7px; background: var(--error); border-radius: 50%; display: inline-block; }

  /* Navbar */
  .flowbite-navbar {
    height: 46px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
  .tab-pill-group { display: flex; gap: 4px; }
  .flow-tab-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .flow-tab-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .flow-tab-btn.active {
    background: var(--surface);
    color: var(--accent);
    border-color: var(--border);
    font-weight: 600;
  }

  .theme-flow-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .flow-select-theme {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  .btn-flow-key {
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
  }

  .flowbite-viewport {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Console Layout */
  .flow-console-deck {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .flow-sidebar {
    width: 270px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .sidebar-header-flow {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .btn-flow-add {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
  }
  .sidebar-threads-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .thread-card-flow {
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    border-left: 3px solid transparent;
  }
  .thread-card-flow:hover { background: var(--bg-hover); }
  .thread-card-flow.active {
    background: var(--accent-muted);
    border-left-color: var(--accent);
  }
  .thread-title-flow { font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thread-meta-flow { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  .flow-chat-stream {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow: hidden;
  }
  .stream-top-bar {
    height: 40px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .flow-badge-info { font-family: var(--font-mono); font-size: 11px; color: var(--accent); }
  .btn-flow-open-graph {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
  }

  .stream-messages-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .flow-msg-card {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .flow-msg-card.user {
    background: var(--user-bubble);
    border: 1px solid var(--user-bubble-border);
  }
  .flow-msg-card.skye {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .msg-header-flow { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
  .flow-code-card {
    margin-top: 8px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .code-head-flow { background: rgba(255, 255, 255, 0.04); padding: 4px 8px; font-size: 10.5px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  .flow-code-card pre { padding: 8px 12px; overflow-x: auto; }

  .flow-input-dock {
    padding: 10px 14px;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .flow-chips-row { display: flex; gap: 6px; }
  .flow-chip {
    padding: 2px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    cursor: pointer;
  }
  .flow-chip:hover { color: var(--accent); border-color: var(--accent); }
  .flow-input-wrapper { display: flex; gap: 8px; }
  .flow-text-field {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 12px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .btn-flow-send {
    background: var(--accent);
    color: #111;
    border: none;
    border-radius: 4px;
    padding: 6px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  /* 2D Thought Graph */
  .flow-graph-deck {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .graph-top-flow {
    height: 38px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  .flow-badge-accent {
    font-size: 10.5px;
    background: var(--accent-muted);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--accent);
  }
  .btn-flow-action {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    cursor: pointer;
  }

  .flow-canvas-viewport {
    flex: 1;
    position: relative;
    background: var(--graph-canvas-bg);
    overflow: hidden;
  }
  .flow-svg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .flowbite-node-card {
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
  .flowbite-node-card:active { cursor: grabbing; }
  .flowbite-node-card.active { border-color: var(--accent); box-shadow: 0 0 12px var(--accent-glow); }
  .flow-node-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .flow-badge-type {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent-muted);
    color: var(--accent);
  }
  .flow-node-title { font-weight: 600; font-size: 12.5px; color: var(--text-primary); margin-bottom: 4px; }
  .flow-node-snippet { font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; }
  .flow-node-foot { margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }

  .flow-inspector-box {
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
  .flow-inspector-box h4 { margin: 8px 0; font-size: 13px; }
  .flow-inspector-box p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
  .btn-flow-jump {
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
  .flow-admin-deck, .flow-socket-deck {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  .flow-admin-grid { display: flex; flex-direction: column; gap: 16px; }
  .flow-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
  }
  .flow-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .flow-table th, .flow-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); }
  .btn-flow-toggle { background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }

  .flow-socket-box {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11.5px;
  }
  .socket-frame-flow { display: flex; gap: 8px; margin-bottom: 4px; }
</style>
