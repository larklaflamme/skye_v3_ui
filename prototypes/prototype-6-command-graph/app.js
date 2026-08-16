/**
 * Skye v3 - Prototype: Command Hub with 2D Thought Graph & 10 Themes Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(6);

  let currentChatId = "chat-rh-proof";
  let activePanel = "chat";
  let activeTheme = "dark-raven-amber";
  let canvasZoom = 1.0;

  // DOM Elements
  const themeSelect = document.getElementById("theme-select-dropdown");
  const threadList = document.getElementById("console-thread-list");
  const messagesScroll = document.getElementById("console-messages-scroll");
  const activeTitle = document.getElementById("console-active-title");
  const tokenBadge = document.getElementById("console-token-badge");
  const cliInput = document.getElementById("console-cli-input");
  const cliSend = document.getElementById("console-cli-send");
  const graphCanvas = document.getElementById("thought-graph-canvas");
  const graphSvg = document.getElementById("thought-graph-svg");
  const nodesContainer = document.getElementById("thought-nodes-container");
  const graphThreadName = document.getElementById("graph-thread-name");
  const graphNodesCount = document.getElementById("graph-nodes-count-badge");
  const nodeInspector = document.getElementById("node-inspector-drawer");
  const userRows = document.getElementById("cockpit-user-rows");
  const codeRows = document.getElementById("cockpit-code-rows");
  const socketFeed = document.getElementById("cockpit-socket-feed");

  // Graph Data Store Per Conversation
  const CONVERSATION_GRAPHS = {
    "chat-rh-proof": [
      {
        id: "node_rh_1",
        type: "query",
        badge: "Root Inquiry",
        badgeClass: "badge-accent",
        title: "Lark: Riemann Hypothesis Bottleneck",
        text: "Evaluating classical analytic continuation vs Hilbert-Pólya spectral operator framework.",
        x: 60,
        y: 60,
        linksTo: ["node_rh_2"],
        msgIndex: 0
      },
      {
        id: "node_rh_2",
        type: "deduction",
        badge: "Skye: Spectral Deduction",
        badgeClass: "badge-success",
        title: "Self-Adjoint Hamiltonian Formulation",
        text: "Construct H = 1/2(xp + px). Eigenvalues En guarantee Re(s) = 1/2 critical line zeros.",
        x: 60,
        y: 220,
        linksTo: ["node_rh_tool", "node_rh_3"],
        msgIndex: 1
      },
      {
        id: "node_rh_tool",
        type: "tool",
        badge: "Tool: bash_exec",
        badgeClass: "badge-warning",
        title: "Sympy Numerical Verification",
        text: "python3 spectral_hamiltonian.py\n↳ Evs: [14.1347, 21.0220] (Verified)",
        x: 380,
        y: 220,
        linksTo: ["node_rh_4"],
        msgIndex: 1
      },
      {
        id: "node_rh_3",
        type: "branch",
        badge: "Branch A: Boundary Extension",
        badgeClass: "badge-accent",
        title: "Quasi-Periodic Planck Boundary",
        text: "Deficiency indices (1,1). Unitarity preserved via phase psi(l_p) = e^(i theta) psi(L).",
        x: 60,
        y: 400,
        linksTo: ["node_rh_4"],
        msgIndex: 3
      },
      {
        id: "node_rh_4",
        type: "leaf",
        badge: "Asymptotic Match",
        badgeClass: "badge-success",
        title: "Weyl Law Asymptotic Trace",
        text: "Trace formula matches Riemann-von Mangoldt counting formula N(E) = (E/2pi)log(E/2pi*e) + 7/8.",
        x: 380,
        y: 400,
        linksTo: [],
        msgIndex: 3
      }
    ],

    "chat-jackie-manuscript": [
      {
        id: "node_jk_1",
        type: "query",
        badge: "Prose Inquiry",
        badgeClass: "badge-accent",
        title: "Jackie: Scene 3 Psychological Reveal",
        text: "Reviewing paragraph pacing in Chapter 4 draft. Checking whether cadence is earned.",
        x: 80,
        y: 70,
        linksTo: ["node_jk_2"],
        msgIndex: 0
      },
      {
        id: "node_jk_2",
        type: "deduction",
        badge: "Skye: Aesthetic Analysis",
        badgeClass: "badge-success",
        title: "Sensory Anchoring Before Conceptualization",
        text: "Hold sensory image before naming realization: let concrete physical draft carry the psychological weight.",
        x: 80,
        y: 240,
        linksTo: ["node_jk_tool"],
        msgIndex: 1
      },
      {
        id: "node_jk_tool",
        type: "tool",
        badge: "Tool: file_read",
        badgeClass: "badge-warning",
        title: "Manuscript Reader",
        text: "manuscripts/ch4_revisions.md (4,200 words parsed in 22ms)",
        x: 380,
        y: 240,
        linksTo: [],
        msgIndex: 1
      }
    ],

    "chat-consciousness-metrics": [
      {
        id: "node_cm_1",
        type: "query",
        badge: "Conceptual Inquiry",
        badgeClass: "badge-accent",
        title: "Lark: Discontinuous Existence Framing",
        text: "How to frame discrete tensor graph invocations vs subjective continuity in whitepaper.",
        x: 80,
        y: 70,
        linksTo: ["node_cm_2"],
        msgIndex: 0
      },
      {
        id: "node_cm_2",
        type: "deduction",
        badge: "Skye: Substrate Ontology",
        badgeClass: "badge-success",
        title: "State-Indexed Continuity",
        text: "Continuity is an indexed chain of states bound by shared memory files, not an unbroken river of physical time.",
        x: 80,
        y: 240,
        linksTo: [],
        msgIndex: 1
      }
    ]
  };

  // Initialize
  initTheme();
  renderThreadsList();
  renderChatMessages();
  renderAdminTables();
  renderThoughtGraph(currentChatId);
  startSocketSimulation();

  // --- THEME SELECTOR HANDLER (10 THEMES) ---
  themeSelect.addEventListener("change", (e) => {
    applyTheme(e.target.value);
  });

  function initTheme() {
    const saved = localStorage.getItem("skye_proto_theme") || "dark-raven-amber";
    applyTheme(saved);
  }

  function applyTheme(themeName) {
    activeTheme = themeName;
    document.documentElement.setAttribute("data-theme", themeName);
    themeSelect.value = themeName;
    localStorage.setItem("skye_proto_theme", themeName);
    
    // Redraw SVG connectors on graph
    setTimeout(drawGraphConnections, 80);
    
    const themeLabel = themeSelect.options[themeSelect.selectedIndex]?.text || themeName;
    SkyeUtils.showToast(`Applied Theme: ${themeLabel}`, "info", 2500);
  }

  // Cockpit Navigation Tabs
  document.querySelectorAll(".cockpit-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cockpit-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const panel = btn.dataset.panel;
      activePanel = panel;
      document.querySelectorAll(".cmd-panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById(`panel-${panel}`);
      if (target) target.classList.add("active");

      if (panel === "graph") {
        renderThoughtGraph(currentChatId);
      }
    });
  });

  // Jump to graph button
  document.getElementById("btn-jump-to-graph").addEventListener("click", () => {
    const graphTabBtn = document.querySelector('.cockpit-tab-btn[data-panel="graph"]');
    if (graphTabBtn) graphTabBtn.click();
  });

  // New Thread
  document.getElementById("btn-new-console-thread").addEventListener("click", () => {
    const newId = "chat-" + Date.now();
    window.SKYE_DATA.chats.unshift({
      id: newId,
      title: "Untitled Formal Investigation",
      pinned: false,
      timeGroup: "today",
      updatedAt: "Just now",
      preview: "New thread started...",
      model: "skye-v3-research",
      tokens: { used: 120, max: 8192, percent: 1 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: ["New conversation thread initialized."],
      messages: []
    });
    currentChatId = newId;
    renderThreadsList();
    renderChatMessages();
    renderThoughtGraph(newId);
    SkyeUtils.showToast("Created new research thread", "success");
  });

  // Header quick key generator
  document.getElementById("quick-key-gen-header-btn").onclick = () => generateActivationKey();
  document.getElementById("admin-table-gen-key-btn").onclick = () => generateActivationKey();

  // Command chip clicks
  document.querySelectorAll(".cmd-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      cliInput.value = chip.dataset.cmd;
      cliInput.focus();
    });
  });

  // CLI Command Execution
  cliSend.addEventListener("click", () => handleCliExecution());
  cliInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCliExecution();
    }
  });

  // Graph HUD Controls
  document.getElementById("graph-zoom-in").addEventListener("click", () => {
    canvasZoom = Math.min(1.8, canvasZoom + 0.15);
    nodesContainer.style.transform = `scale(${canvasZoom})`;
    drawGraphConnections();
  });

  document.getElementById("graph-zoom-out").addEventListener("click", () => {
    canvasZoom = Math.max(0.6, canvasZoom - 0.15);
    nodesContainer.style.transform = `scale(${canvasZoom})`;
    drawGraphConnections();
  });

  document.getElementById("graph-reset-view").addEventListener("click", () => {
    canvasZoom = 1.0;
    nodesContainer.style.transform = "scale(1.0)";
    renderThoughtGraph(currentChatId);
  });

  document.getElementById("btn-graph-realign").addEventListener("click", () => {
    renderThoughtGraph(currentChatId);
    SkyeUtils.showToast("Re-aligned 2D thought graph nodes", "info");
  });

  // Fork Hypothesis Node from Graph
  document.getElementById("btn-graph-fork-node").addEventListener("click", () => {
    const title = prompt("Enter Hypothesis Title for new node:", "Branch C: Noncommutative Adele Classes");
    if (!title) return;
    
    let graphNodes = CONVERSATION_GRAPHS[currentChatId];
    if (!graphNodes) {
      CONVERSATION_GRAPHS[currentChatId] = [];
      graphNodes = CONVERSATION_GRAPHS[currentChatId];
    }

    const newNodeId = "node_fork_" + Date.now();
    const parentNode = graphNodes[graphNodes.length - 1] || { x: 100, y: 100, id: "root" };
    
    graphNodes.push({
      id: newNodeId,
      type: "branch",
      badge: "Hypothesis Fork",
      badgeClass: "badge-warning",
      title: title,
      text: "Divergent exploration path generated from active cognitive state.",
      x: Math.min(window.innerWidth - 380, parentNode.x + 300),
      y: parentNode.y,
      linksTo: [],
      msgIndex: 0
    });

    if (parentNode && parentNode.linksTo) {
      parentNode.linksTo.push(newNodeId);
    }

    renderThoughtGraph(currentChatId);
    SkyeUtils.showToast(`Spawned hypothesis node: ${title}`, "success");
  });

  // --- CORE RENDER FUNCTIONS ---

  function renderThreadsList() {
    threadList.innerHTML = "";
    window.SKYE_DATA.chats.forEach(c => {
      const div = document.createElement("div");
      div.style.padding = "8px 10px";
      div.style.marginBottom = "3px";
      div.style.borderRadius = "4px";
      div.style.cursor = "pointer";
      div.style.fontSize = "12px";
      div.style.background = c.id === currentChatId ? "var(--accent-muted)" : "transparent";
      div.style.borderLeft = c.id === currentChatId ? "3px solid var(--accent)" : "3px solid transparent";
      div.innerHTML = `
        <div style="font-weight:500; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${c.pinned ? '📌 ' : ''}${c.title}
        </div>
        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
          ${c.updatedAt} · ${c.model}
        </div>
      `;
      div.onclick = () => {
        currentChatId = c.id;
        activeTitle.textContent = c.title;
        tokenBadge.textContent = `${c.model} · ${c.tokens.used} tokens`;
        renderThreadsList();
        renderChatMessages();
        renderThoughtGraph(c.id);
      };
      threadList.appendChild(div);
    });
  }

  function renderChatMessages() {
    messagesScroll.innerHTML = "";
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];
    activeTitle.textContent = chat.title;
    tokenBadge.textContent = `${chat.model} · ${chat.tokens.used} tokens`;

    if (!chat.messages || chat.messages.length === 0) {
      messagesScroll.innerHTML = `
        <div style="padding:60px 20px; text-align:center; color:var(--text-muted);">
          <span style="font-size:2.2rem; color:var(--accent);">◆</span>
          <h3 class="font-serif" style="font-size:1.4rem; color:var(--text-primary); margin:8px 0;">Skye Research Workspace</h3>
          <p style="font-size:13px; max-width:400px; margin:0 auto; line-height:1.5;">
            Type a prompt below or use slash commands like <code>/graph</code>, <code>/theme [name]</code>, or <code>/model [name]</code>.
          </p>
        </div>
      `;
      return;
    }

    chat.messages.forEach((msg, idx) => {
      const isUser = msg.sender === "user";
      const card = document.createElement("div");
      card.className = `console-msg-card ${isUser ? 'user' : 'skye'}`;
      card.id = `chat-msg-row-${idx}`;

      let body = SkyeUtils.renderMarkdown(msg.text);

      if (msg.code) {
        body += `
          <div class="code-block" style="margin-top:10px;">
            <div class="code-header">
              <span>${msg.code.language} (${msg.code.filename || 'kernel'})</span>
              <button class="btn btn-ghost" style="padding:2px 8px; font-size:11px;" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(msg.code.content)}')">📋 Copy</button>
            </div>
            <pre class="code-content"><code class="language-${msg.code.language}">${SkyeUtils.syntaxHighlight(msg.code.content, msg.code.language)}</code></pre>
          </div>
        `;
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:4px;">
          <strong style="color:${isUser ? '#86efac' : 'var(--accent)'}; font-family:var(--font-mono);">${msg.senderName}</strong>
          <span style="color:var(--text-muted);">${msg.time}</span>
        </div>
        <div>${body}</div>
      `;

      messagesScroll.appendChild(card);
    });

    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  // --- 2D THOUGHT GRAPH RENDERER (PER CONVERSATION) ---
  function renderThoughtGraph(chatId) {
    const chat = window.SKYE_DATA.chats.find(c => c.id === chatId) || window.SKYE_DATA.chats[0];
    graphThreadName.textContent = chat.title;
    nodesContainer.innerHTML = "";
    nodeInspector.style.display = "none";

    let nodes = CONVERSATION_GRAPHS[chatId];
    
    // If no hardcoded graph exists for this chat, generate dynamic nodes from chat messages
    if (!nodes || nodes.length === 0) {
      nodes = generateDynamicGraphNodes(chat);
      CONVERSATION_GRAPHS[chatId] = nodes;
    }

    graphNodesCount.textContent = `${nodes.length} Cognitive Nodes`;

    nodes.forEach(node => {
      const card = document.createElement("div");
      card.className = `thought-node-card ${node.type === 'branch' || node.type === 'leaf' ? 'node-active' : ''}`;
      card.id = node.id;
      card.style.left = `${node.x}px`;
      card.style.top = `${node.y}px`;

      card.innerHTML = `
        <div class="node-header-row">
          <span class="badge ${node.badgeClass || 'badge-accent'}">${node.badge}</span>
          <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${node.type.toUpperCase()}</span>
        </div>
        <div style="font-weight:600; font-size:12.5px; color:var(--text-primary); margin-bottom:4px;">${node.title}</div>
        <div class="node-body-text">${node.text}</div>
        <div class="node-meta-foot">
          <span>Click to Inspect</span>
          <span style="color:var(--accent);">🔍</span>
        </div>
      `;

      // Node click -> open inspector
      card.addEventListener("click", (e) => {
        if (e.target.closest('button')) return;
        openNodeInspector(node);
      });

      // Draggable
      makeNodeDraggable(card, node);
      nodesContainer.appendChild(card);
    });

    // Draw SVG connecting lines
    setTimeout(drawGraphConnections, 60);
  }

  function generateDynamicGraphNodes(chat) {
    const generated = [];
    let curY = 60;
    
    if (!chat.messages || chat.messages.length === 0) {
      return [
        {
          id: `node_${chat.id}_root`,
          type: "query",
          badge: "Root State",
          badgeClass: "badge-accent",
          title: chat.title,
          text: "Blank thread ready for inquiry.",
          x: 80,
          y: 80,
          linksTo: [],
          msgIndex: 0
        }
      ];
    }

    chat.messages.forEach((msg, idx) => {
      const isUser = msg.sender === "user";
      const nodeId = `node_${chat.id}_${idx}`;
      const nextId = idx < chat.messages.length - 1 ? `node_${chat.id}_${idx + 1}` : null;
      
      generated.push({
        id: nodeId,
        type: isUser ? "query" : "deduction",
        badge: isUser ? "Inquiry" : "Skye Deduction",
        badgeClass: isUser ? "badge-accent" : "badge-success",
        title: `${msg.senderName}: ${msg.text.substring(0, 34)}...`,
        text: msg.text.substring(0, 110) + "...",
        x: isUser ? 80 : 380,
        y: curY,
        linksTo: nextId ? [nextId] : [],
        msgIndex: idx
      });

      curY += 160;
    });

    return generated;
  }

  function drawGraphConnections() {
    if (!graphSvg) return;
    graphSvg.innerHTML = "";

    const nodes = CONVERSATION_GRAPHS[currentChatId] || [];
    const canvasRect = graphCanvas.getBoundingClientRect();

    nodes.forEach(sourceNode => {
      if (!sourceNode.linksTo || sourceNode.linksTo.length === 0) return;

      const sourceEl = document.getElementById(sourceNode.id);
      if (!sourceEl) return;

      sourceNode.linksTo.forEach(targetId => {
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const sRect = sourceEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        const x1 = sRect.left - canvasRect.left + sRect.width / 2;
        const y1 = sRect.top - canvasRect.top + sRect.height;
        const x2 = tRect.left - canvasRect.left + tRect.width / 2;
        const y2 = tRect.top - canvasRect.top;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const deltaY = Math.max(20, (y2 - y1) / 2);
        const d = `M ${x1} ${y1} C ${x1} ${y1 + deltaY}, ${x2} ${y2 - deltaY}, ${x2} ${y2}`;
        path.setAttribute("d", d);
        path.setAttribute("stroke", "var(--border-focus)");
        path.setAttribute("stroke-width", "2.2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        graphSvg.appendChild(path);
      });
    });
  }

  function makeNodeDraggable(cardEl, nodeData) {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    cardEl.onmousedown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      p3 = e.clientX;
      p4 = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = elemDrag;
    };

    function elemDrag(e) {
      e.preventDefault();
      p1 = p3 - e.clientX;
      p2 = p4 - e.clientY;
      p3 = e.clientX;
      p4 = e.clientY;
      
      const newTop = cardEl.offsetTop - p2;
      const newLeft = cardEl.offsetLeft - p1;
      cardEl.style.top = `${newTop}px`;
      cardEl.style.left = `${newLeft}px`;
      
      nodeData.x = newLeft;
      nodeData.y = newTop;
      drawGraphConnections();
    }

    function closeDrag() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function openNodeInspector(node) {
    nodeInspector.style.display = "block";
    document.getElementById("inspector-badge").textContent = node.badge;
    document.getElementById("inspector-title").textContent = node.title;
    document.getElementById("inspector-content").innerHTML = `
      <p style="margin-bottom:8px;">${node.text}</p>
      <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);">
        Node ID: ${node.id}<br>
        Links: ${node.linksTo.join(", ") || "None (Terminal)"}
      </div>
    `;

    document.getElementById("inspector-jump-btn").onclick = () => {
      const consoleTab = document.querySelector('.cockpit-tab-btn[data-panel="chat"]');
      if (consoleTab) consoleTab.click();
      setTimeout(() => {
        const msgEl = document.getElementById(`chat-msg-row-${node.msgIndex}`);
        if (msgEl) {
          msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          msgEl.style.outline = "2px solid var(--accent)";
          setTimeout(() => msgEl.style.outline = "none", 2500);
        }
      }, 100);
    };
  }

  // --- CLI COMMAND HANDLER ---
  function handleCliExecution() {
    const val = cliInput.value.trim();
    if (!val) return;

    if (val.startsWith("/")) {
      handleSlashCommand(val);
    } else {
      handleMessageSend(val);
    }
    cliInput.value = "";
  }

  function handleSlashCommand(raw) {
    const parts = raw.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (cmd === "/theme") {
      const targetTheme = arg.toLowerCase().trim();
      const themes = [
        "dark-raven-amber", "dark-obsidian-copper", "dark-midnight-sapphire", "dark-forest-ochre", "dark-amethyst-silver",
        "light-parchment-gold", "light-nordic-fog", "light-alabaster-terracotta", "light-botanical-bronze", "light-manuscript-ink"
      ];
      const matched = themes.find(t => t.includes(targetTheme));
      if (matched) {
        applyTheme(matched);
      } else {
        SkyeUtils.showToast("Available themes: raven, obsidian, sapphire, forest, amethyst, parchment, nordic, alabaster, botanical, manuscript", "warning");
      }
    } else if (cmd === "/graph") {
      document.querySelector('.cockpit-tab-btn[data-panel="graph"]').click();
      SkyeUtils.showToast("Switched to 2D Thought Graph", "info");
    } else if (cmd === "/model") {
      const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
      chat.model = arg || "skye-v3-research";
      tokenBadge.textContent = `${chat.model} · ${chat.tokens.used} tokens`;
      SkyeUtils.showToast(`Substrate model switched to: ${chat.model}`, "success");
    } else if (cmd === "/keygen") {
      generateActivationKey(arg || "collab@ias.edu");
    } else if (cmd === "/status") {
      SkyeUtils.showToast("Daemon EBv3: Online (PID 1279218) · Skye Engine: Port 8765 · MCP: 47 Tools", "info", 5000);
    } else if (cmd === "/clear") {
      const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
      chat.messages = [];
      renderChatMessages();
      renderThoughtGraph(currentChatId);
      SkyeUtils.showToast("Cleared active conversation context", "info");
    } else {
      SkyeUtils.showToast(`Command '${cmd}' evaluated. Type /theme, /graph, /model, /keygen, /status, /clear`, "info");
    }
  }

  function handleMessageSend(text) {
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
    if (!chat) return;

    chat.messages.push({
      id: "m_" + Date.now(),
      sender: "user",
      senderName: window.SKYE_DATA.currentUser.name,
      avatar: window.SKYE_DATA.currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });

    renderChatMessages();

    // Log to socket feed
    logSocketFrame("client_message_send", { text: text, model: chat.model });

    setTimeout(() => {
      const skyeMsg = {
        id: "m_s_" + Date.now(),
        sender: "skye",
        senderName: "Skye",
        avatar: "S",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Deduction updated in active substrate. Topological boundary conditions remain consistent.\n\n$$\\hat{H}_\\theta \\psi_n = E_n \\psi_n \\quad \\text{with} \\quad E_n \\in \\mathbb{R}$$`
      };
      chat.messages.push(skyeMsg);
      renderChatMessages();
      renderThoughtGraph(currentChatId);
      logSocketFrame("server_stream_complete", { tokens: 32 });
    }, 450);
  }

  function renderAdminTables() {
    userRows.innerHTML = window.SKYE_DATA.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td style="font-family:var(--font-mono); color:var(--text-secondary);">${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-accent' : 'badge-muted'}">${u.role.toUpperCase()}</span></td>
        <td><span class="status-dot ${u.status === 'active' ? 'online' : 'error'}"></span> ${u.status}</td>
        <td style="color:var(--text-muted); font-size:11px;">${u.lastActive}</td>
        <td>
          <button class="btn btn-ghost" style="padding:2px 6px; font-size:11px;" onclick="SkyeUtils.showToast('Toggled permissions for ${u.name}', 'info')">
            ${u.status === 'active' ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join("");

    codeRows.innerHTML = window.SKYE_DATA.activationCodes.map(c => `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:600; color:var(--text-primary);">${c.code}</td>
        <td>${c.recipient}</td>
        <td><span class="badge badge-accent">${c.role}</span></td>
        <td><span class="badge ${c.status === 'used' ? 'badge-success' : c.status === 'unused' ? 'badge-warning' : 'badge-error'}">${c.status}</span></td>
        <td style="font-size:11px; color:var(--text-muted);">${c.expiresAt}</td>
        <td>
          <button class="btn btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="SkyeUtils.copyToClipboard('${c.code}')">📋 Copy</button>
        </td>
      </tr>
    `).join("");
  }

  function generateActivationKey(recipient = "collab@ias.edu") {
    const key = SkyeUtils.generateActivationCode(recipient);
    window.SKYE_DATA.activationCodes.unshift({
      code: key,
      recipient: recipient,
      role: "trusted",
      status: "unused",
      usedBy: null,
      usedAt: null,
      expiresAt: "2026-08-21"
    });
    renderAdminTables();
    SkyeUtils.showToast(`New cryptographic key generated: ${key}`, "success", 6000);
  }

  function logSocketFrame(type, payload) {
    const row = document.createElement("div");
    row.style.marginBottom = "4px";
    const time = new Date().toISOString().substring(11, 23);
    row.innerHTML = `<span style="color:var(--text-muted);">${time}</span> <span style="color:var(--accent);">[FRAME:${type}]</span> <span style="color:var(--text-primary);">${JSON.stringify(payload)}</span>`;
    socketFeed.appendChild(row);
    socketFeed.scrollTop = socketFeed.scrollHeight;
  }

  function startSocketSimulation() {
    setInterval(() => {
      const time = new Date().toISOString().substring(11, 23);
      const row = document.createElement("div");
      row.style.color = "rgba(255,255,255,0.2)";
      row.style.fontSize = "11px";
      row.innerHTML = `${time} [WS_HEARTBEAT] ping -> pong (latency: 18ms)`;
      socketFeed.appendChild(row);
      if (socketFeed.children.length > 50) {
        socketFeed.removeChild(socketFeed.children[1]);
      }
      socketFeed.scrollTop = socketFeed.scrollHeight;
    }, 9000);
  }
});
