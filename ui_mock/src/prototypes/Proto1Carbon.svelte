<script>
  import { activeTheme, THEMES, setTheme } from '../lib/stores/themeStore.js';
  import { chats, currentChatId, currentChat, selectChat, createNewThread, sendMessage } from '../lib/stores/chatStore.js';
  import { activeGraphNodes, updateNodePosition, forkHypothesisNode } from '../lib/stores/graphStore.js';
  import { USERS_DATA, CODES_DATA, TELEMETRY_METRICS, SOCKET_FRAMES, generateActivationCode, toggleUser } from '../lib/stores/adminStore.js';
  
  // IBM Carbon Components
  import {
    Header, HeaderUtilities, HeaderAction,
    Tabs, Tab, TabContent,
    Button, TextInput, TextArea, Tag,
    DataTable, Select, SelectItem,
    ProgressBar, InlineLoading
  } from 'carbon-components-svelte';

  import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';
  import Network_3 from 'carbon-icons-svelte/lib/Network_3.svelte';
  import Security from 'carbon-icons-svelte/lib/Security.svelte';
  import Activity from 'carbon-icons-svelte/lib/Activity.svelte';
  import Add from 'carbon-icons-svelte/lib/Add.svelte';
  import Send from 'carbon-icons-svelte/lib/Send.svelte';

  let selectedTab = 0; // 0: Console, 1: 2D Graph, 2: Admin, 3: Sockets
  let inputText = '';
  let cliInput = '';
  let selectedNode = null;
  let canvasElem;

  function handleSend() {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    inputText = '';
  }

  function handleCli() {
    if (!cliInput.trim()) return;
    if (cliInput.startsWith('/theme')) {
      const name = cliInput.split(' ')[1];
      const match = THEMES.find(t => t.id.includes(name));
      if (match) setTheme(match.id);
    } else if (cliInput.startsWith('/graph')) {
      selectedTab = 1;
    } else if (cliInput.startsWith('/keygen')) {
      generateActivationCode();
    } else {
      sendMessage(cliInput);
    }
    cliInput = '';
  }

  function handleForkNode() {
    const title = prompt("Enter hypothesis fork title:", "Branch C: Noncommutative Adele Classes");
    if (title) {
      forkHypothesisNode($currentChatId, title);
    }
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
      updateNodePosition($currentChatId, node.id, origX + dx, origY + dy);
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
</script>

<div class="carbon-app-wrapper">
  
  <!-- 1. Top Telemetry HUD (Carbon Styled) -->
  <div class="carbon-telemetry-hud">
    <div class="hud-left">
      <span class="hud-brand">◆ RAVENNEST</span>
      <span class="hud-divider">|</span>
      <span class="hud-title">SKYE IBM CARBON</span>
      <Tag type="cyan" size="sm">EBv3: PID {$TELEMETRY_METRICS.ebv3Pid}</Tag>
      <Tag type="teal" size="sm">ENGINE: :{$TELEMETRY_METRICS.skyePort}</Tag>
      <Tag type="purple" size="sm">MCP: {$TELEMETRY_METRICS.mcpTools} tools ({$TELEMETRY_METRICS.mcpLatency})</Tag>
    </div>
    <div class="hud-right">
      <span class="hud-stat">CPU: <strong>{$TELEMETRY_METRICS.cpu}%</strong></span>
      <span class="hud-stat">RAM: <strong>{$TELEMETRY_METRICS.ram}</strong></span>
      <Tag type="warm-gray" size="sm">TIER: ADMIN (LARK)</Tag>
    </div>
  </div>

  <!-- 2. Main Navigation Header -->
  <div class="carbon-nav-bar">
    <div class="tab-controls">
      <button class="nav-tab-btn {selectedTab === 0 ? 'active' : ''}" on:click={() => selectedTab = 0}>
        <Terminal size={16} />
        <span>Research Console</span>
      </button>
      <button class="nav-tab-btn {selectedTab === 1 ? 'active' : ''}" on:click={() => selectedTab = 1}>
        <Network_3 size={16} />
        <span>2D Thought Graph</span>
      </button>
      <button class="nav-tab-btn {selectedTab === 2 ? 'active' : ''}" on:click={() => selectedTab = 2}>
        <Security size={16} />
        <span>Admin Command Deck</span>
      </button>
      <button class="nav-tab-btn {selectedTab === 3 ? 'active' : ''}" on:click={() => selectedTab = 3}>
        <Activity size={16} />
        <span>WebSocket Telemetry</span>
      </button>
    </div>

    <!-- Theme Dropdown (10 Themes) -->
    <div class="theme-picker-box">
      <span style="font-size:12px; color:var(--text-secondary);">🎨 Theme:</span>
      <select class="carbon-select" value={$activeTheme} on:change={(e) => setTheme(e.target.value)}>
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
      
      <Button size="small" kind="primary" icon={Add} on:click={() => generateActivationCode()}>
        + Key
      </Button>
    </div>
  </div>

  <!-- 3. Tab Contents Viewport -->
  <div class="carbon-viewport">
    
    <!-- TAB 0: RESEARCH CONSOLE -->
    {#if selectedTab === 0}
      <div class="console-split-layout">
        <!-- Sidebar -->
        <div class="console-sidebar">
          <div class="sidebar-top">
            <span>RESEARCH SESSIONS</span>
            <Button size="small" kind="ghost" icon={Add} on:click={() => createNewThread()} />
          </div>
          <div class="thread-list-scroll">
            {#each $chats as chat}
              <button 
                class="thread-card {chat.id === $currentChatId ? 'active' : ''}" 
                on:click={() => selectChat(chat.id)}
              >
                <div class="thread-title">{chat.pinned ? '📌 ' : ''}{chat.title}</div>
                <div class="thread-meta">{chat.updatedAt} · {chat.model}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Chat Area -->
        <div class="console-main">
          <div class="chat-header-bar">
            <div>
              <Tag type="green" size="sm">ONLINE</Tag>
              <strong style="margin-left:8px; font-size:13.5px;">{$currentChat.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <Tag type="cool-gray" size="sm">{$currentChat.model} · {$currentChat.tokens.used} tok</Tag>
              <Button size="small" kind="tertiary" on:click={() => selectedTab = 1}>
                View 2D Graph ↗
              </Button>
            </div>
          </div>

          <div class="messages-scroll">
            {#each $currentChat.messages as msg}
              <div class="msg-card {msg.sender}">
                <div class="msg-meta">
                  <strong>{msg.senderName}</strong>
                  <span>{msg.time}</span>
                </div>
                <div class="msg-body">
                  {@html msg.text.replace(/\n/g, '<br>')}
                </div>
                {#if msg.code}
                  <div class="code-box">
                    <div class="code-head">
                      <span>{msg.code.language} ({msg.code.filename})</span>
                    </div>
                    <pre><code>{msg.code.content}</code></pre>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <!-- Prompt bar -->
          <div class="input-deck">
            <div class="command-chips">
              <button class="chip" on:click={() => setTheme('dark-obsidian-copper')}>/theme obsidian</button>
              <button class="chip" on:click={() => setTheme('light-parchment-gold')}>/theme parchment</button>
              <button class="chip" on:click={() => selectedTab = 1}>/graph</button>
              <button class="chip" on:click={() => generateActivationCode()}>/keygen</button>
            </div>
            <div class="field-row">
              <TextInput 
                placeholder="Ask Skye about spectral operators, proofs, or type /command..."
                bind:value={inputText}
                on:keydown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="field" kind="primary" icon={Send} on:click={handleSend}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- TAB 1: 2D THOUGHT GRAPH (PER CONVERSATION) -->
    {#if selectedTab === 1}
      <div class="graph-layout">
        <div class="graph-top-bar">
          <div>
            <span>Active Conversation:</span>
            <strong style="color:var(--accent); margin-left:6px;">{$currentChat.title}</strong>
            <Tag type="purple" size="sm" style="margin-left:8px;">{$activeGraphNodes.length} Cognitive Nodes</Tag>
          </div>
          <div style="display:flex; gap:8px;">
            <Button size="small" kind="secondary" on:click={handleForkNode}>
              + Fork Hypothesis Node
            </Button>
          </div>
        </div>

        <div class="canvas-container" bind:this={canvasElem}>
          <!-- SVG Connections -->
          <svg class="svg-layer">
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
              class="carbon-thought-card {selectedNode?.id === node.id ? 'active' : ''}"
              style="left: {node.x}px; top: {node.y}px;"
              on:mousedown={(e) => handleNodeDrag(e, node)}
              on:click={() => selectedNode = node}
            >
              <div class="node-head">
                <Tag type={node.type === 'tool' ? 'warm-gray' : node.type === 'deduction' ? 'green' : 'cyan'} size="sm">
                  {node.badge}
                </Tag>
                <span style="font-size:10px; color:var(--text-muted);">{node.type.toUpperCase()}</span>
              </div>
              <div class="node-title">{node.title}</div>
              <div class="node-snippet">{node.text}</div>
              <div class="node-foot">
                <span>Drag to rearrange</span>
                <span>🔍 Inspect</span>
              </div>
            </div>
          {/each}

          <!-- Node Inspector Drawer -->
          {#if selectedNode}
            <div class="node-inspector">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <Tag type="purple">{selectedNode.badge}</Tag>
                <button class="close-btn" on:click={() => selectedNode = null}>✕</button>
              </div>
              <h4 style="margin:8px 0; font-size:13px; color:var(--text-primary);">{selectedNode.title}</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">{selectedNode.text}</p>
              <Button size="small" kind="primary" style="margin-top:12px; width:100%;" on:click={() => selectedTab = 0}>
                Jump to Conversation Turn →
              </Button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 2: ADMIN COMMAND DECK -->
    {#if selectedTab === 2}
      <div class="admin-layout">
        <div class="admin-grid">
          <!-- Users Table -->
          <div class="carbon-card">
            <h4 style="margin-bottom:10px;">User Directory & Permissions</h4>
            <table class="carbon-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each $USERS_DATA as u}
                  <tr>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><Tag type="cyan" size="sm">{u.role}</Tag></td>
                    <td><Tag type={u.status === 'active' ? 'green' : 'red'} size="sm">{u.status}</Tag></td>
                    <td>
                      <Button size="small" kind="ghost" on:click={() => toggleUser(u.id)}>
                        Toggle Status
                      </Button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <!-- Activation Keys Table -->
          <div class="carbon-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h4>Cryptographic Keys (RN-SKYE-510510-...)</h4>
              <Button size="small" kind="primary" on:click={() => generateActivationCode()}>+ Generate</Button>
            </div>
            <table class="carbon-table">
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
                    <td><code style="color:var(--accent);">{c.code}</code></td>
                    <td>{c.recipient}</td>
                    <td><Tag type={c.status === 'used' ? 'green' : c.status === 'unused' ? 'cyan' : 'red'} size="sm">{c.status}</Tag></td>
                    <td>{c.expiresAt}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}

    <!-- TAB 3: WEBSOCKET TELEMETRY -->
    {#if selectedTab === 3}
      <div class="socket-layout">
        <div class="socket-feed">
          <div style="color:var(--text-muted); margin-bottom:10px;">// Live WebSocket Stream (ws://localhost:8000/api/v1/skye/stream)</div>
          {#each $SOCKET_FRAMES as frame}
            <div class="socket-frame">
              <span style="color:var(--text-muted);">{frame.time}</span>
              <span style="color:var(--accent); font-weight:600;">[{frame.type}]</span>
              <span style="color:var(--text-primary);">{JSON.stringify(frame.payload)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>

</div>

<style>
  .carbon-app-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 38px);
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  .carbon-telemetry-hud {
    background-color: var(--code-bg);
    border-bottom: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    font-family: var(--font-mono);
  }

  .hud-left, .hud-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hud-brand {
    color: var(--accent);
    font-weight: 700;
  }
  .hud-divider {
    color: var(--text-muted);
  }

  .carbon-nav-bar {
    height: 46px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }

  .tab-controls {
    display: flex;
    gap: 4px;
  }

  .nav-tab-btn {
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
  .nav-tab-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  .nav-tab-btn.active {
    background: var(--surface);
    color: var(--accent);
    border-color: var(--border);
    font-weight: 600;
  }

  .theme-picker-box {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .carbon-select {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }

  .carbon-viewport {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Console Layout */
  .console-split-layout {
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
    overflow-y: auto;
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

  .thread-list-scroll {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .thread-card {
    text-align: left;
    padding: 8px 10px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-primary);
  }
  .thread-card:hover {
    background: var(--bg-hover);
  }
  .thread-card.active {
    background: var(--accent-muted);
    border-left: 3px solid var(--accent);
  }
  .thread-title {
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .thread-meta {
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .console-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow: hidden;
  }

  .chat-header-bar {
    height: 40px;
    padding: 0 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .messages-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .msg-card {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .msg-card.user {
    background: var(--user-bubble);
    border: 1px solid var(--user-bubble-border);
  }
  .msg-card.skye {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .msg-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .code-box {
    margin-top: 8px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .code-head {
    background: rgba(255, 255, 255, 0.04);
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 10.5px;
  }
  .code-box pre {
    padding: 8px 12px;
    overflow-x: auto;
  }

  .input-deck {
    padding: 10px 14px;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .command-chips {
    display: flex;
    gap: 6px;
  }
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
  .chip:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .field-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* 2D Thought Graph */
  .graph-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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

  .canvas-container {
    flex: 1;
    position: relative;
    background: var(--graph-canvas-bg);
    overflow: hidden;
  }

  .svg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .carbon-thought-card {
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
  .carbon-thought-card:active {
    cursor: grabbing;
  }
  .carbon-thought-card.active {
    border-color: var(--accent);
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .node-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .node-title {
    font-weight: 600;
    font-size: 12.5px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .node-snippet {
    font-size: 11.5px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
  .node-foot {
    margin-top: 6px;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
  }

  .node-inspector {
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
  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
  }

  /* Admin & Socket Layouts */
  .admin-layout, .socket-layout {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .admin-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .carbon-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
  }

  .carbon-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .carbon-table th, .carbon-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  .socket-feed {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11.5px;
    line-height: 1.6;
  }
  .socket-frame {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
  }
</style>
