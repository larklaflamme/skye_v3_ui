/**
 * Skye v3 - Prototype 1: Classic Scholar JavaScript Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(1);

  let currentChatId = "chat-rh-proof";
  let activeContextTab = "sources";
  let streamingController = null;

  // DOM Elements
  const messagesContainer = document.getElementById("chat-messages-container");
  const messagesScrollArea = document.getElementById("messages-scroll-area");
  const historyContainer = document.getElementById("sidebar-history-container");
  const chatInput = document.getElementById("chat-user-input");
  const sendBtn = document.getElementById("btn-send-message");
  const stopStreamBtn = document.getElementById("btn-stop-stream");
  const activeTitleText = document.getElementById("title-text");
  const leftSidebar = document.getElementById("left-sidebar");
  const rightContextPanel = document.getElementById("right-context-panel");
  const contextTabContent = document.getElementById("context-tab-content");
  const adminModal = document.getElementById("admin-modal");
  const signupModal = document.getElementById("signup-modal");

  // Initialize UI
  renderSidebar();
  loadChat(currentChatId);
  renderContextPanel();

  // Event Listeners
  document.getElementById("toggle-sidebar-btn").addEventListener("click", () => {
    leftSidebar.classList.toggle("collapsed");
  });

  document.getElementById("toggle-context-btn").addEventListener("click", () => {
    rightContextPanel.classList.toggle("collapsed");
  });

  document.getElementById("close-context-btn").addEventListener("click", () => {
    rightContextPanel.classList.add("collapsed");
  });

  document.getElementById("new-chat-btn").addEventListener("click", () => {
    startNewChat();
  });

  document.getElementById("admin-panel-btn").addEventListener("click", () => {
    if (window.SKYE_DATA.currentUser.role !== 'admin') {
      SkyeUtils.showToast("Admin console restricted to Lark (Admin tier)", "warning");
      return;
    }
    renderAdminViews();
    adminModal.classList.add("active");
  });

  document.getElementById("signup-demo-btn").addEventListener("click", () => {
    signupModal.classList.add("active");
  });

  document.getElementById("shortcuts-btn").addEventListener("click", () => {
    SkyeUtils.showToast("Shortcuts: ⌘K Search, ⌘Enter Send, ⌘B Sidebar, ⌘. Context", "info", 5000);
  });

  document.getElementById("notifications-btn").addEventListener("click", () => {
    SkyeUtils.showToast("Security Alert: Failed login attempt logged from 185.220.101.5", "warning", 5000);
  });

  // Admin tabs
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.classList.add("btn-ghost");
        b.classList.remove("btn-secondary");
      });
      btn.classList.add("active");
      btn.classList.add("btn-secondary");
      btn.classList.remove("btn-ghost");

      const tab = btn.dataset.adminTab;
      document.querySelectorAll(".admin-view-panel").forEach(p => p.style.display = 'none');
      const target = document.getElementById(`admin-view-${tab}`);
      if (target) target.style.display = 'block';
    });
  });

  // Context Tabs
  document.querySelectorAll(".context-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".context-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeContextTab = btn.dataset.tab;
      renderContextPanel();
    });
  });

  // Search Filter
  const searchInput = document.getElementById("chat-search-input");
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderSidebar(q);
  });

  // Send Message Actions
  sendBtn.addEventListener("click", () => handleSendMessage());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Stop Streaming
  stopStreamBtn.addEventListener("click", () => {
    if (streamingController) {
      streamingController.stop();
      streamingController = null;
      stopStreamBtn.style.display = "none";
      sendBtn.style.display = "inline-flex";
      SkyeUtils.showToast("Response streaming interrupted", "info");
    }
  });

  // Signup form validation simulation
  const signupCodeInput = document.getElementById("signup-code");
  const codeFeedback = document.getElementById("code-validation-feedback");
  signupCodeInput.addEventListener("input", (e) => {
    const res = SkyeUtils.validateActivationCode(e.target.value);
    if (res.valid) {
      codeFeedback.textContent = "✓ " + res.message;
      codeFeedback.style.color = "var(--success)";
    } else {
      codeFeedback.textContent = "✗ " + res.message;
      codeFeedback.style.color = "var(--error)";
    }
  });

  document.getElementById("signup-submit-btn").addEventListener("click", () => {
    const validation = SkyeUtils.validateActivationCode(signupCodeInput.value);
    if (!validation.valid) {
      SkyeUtils.showToast("Invalid activation code: " + validation.message, "error");
      return;
    }
    signupModal.classList.remove("active");
    SkyeUtils.showToast("Account created successfully! Welcome to RavenNest.", "success");
  });

  // Global Keyboard Shortcuts
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "b") {
      e.preventDefault();
      leftSidebar.classList.toggle("collapsed");
    } else if ((e.metaKey || e.ctrlKey) && e.key === ".") {
      e.preventDefault();
      rightContextPanel.classList.toggle("collapsed");
    }
  });

  // Persona switch callback
  window.onPersonaChange = (user) => {
    document.getElementById("user-display-name").textContent = user.name;
    document.getElementById("user-avatar-badge").textContent = user.avatar;
    const adminBtn = document.getElementById("admin-panel-btn");
    if (user.role !== 'admin') {
      adminBtn.style.opacity = '0.4';
    } else {
      adminBtn.style.opacity = '1';
    }
  };

  // --- Core Render Functions ---

  function renderSidebar(searchQuery = "") {
    historyContainer.innerHTML = "";
    const chats = window.SKYE_DATA.chats;

    const filtered = searchQuery
      ? chats.filter(c => c.title.toLowerCase().includes(searchQuery) || c.preview.toLowerCase().includes(searchQuery))
      : chats;

    if (filtered.length === 0) {
      historyContainer.innerHTML = `<div style="padding:16px; font-size:12px; color:var(--text-muted); text-align:center;">No conversations found</div>`;
      return;
    }

    // Pinned
    const pinned = filtered.filter(c => c.pinned);
    if (pinned.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.innerHTML = `<div class="history-group-title">📌 Pinned Research</div>`;
      pinned.forEach(c => groupEl.appendChild(createChatItemEl(c)));
      historyContainer.appendChild(groupEl);
    }

    // Today
    const today = filtered.filter(c => !c.pinned && c.timeGroup === 'today');
    if (today.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.innerHTML = `<div class="history-group-title">Today</div>`;
      today.forEach(c => groupEl.appendChild(createChatItemEl(c)));
      historyContainer.appendChild(groupEl);
    }

    // Yesterday
    const yesterday = filtered.filter(c => !c.pinned && c.timeGroup === 'yesterday');
    if (yesterday.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.innerHTML = `<div class="history-group-title">Yesterday</div>`;
      yesterday.forEach(c => groupEl.appendChild(createChatItemEl(c)));
      historyContainer.appendChild(groupEl);
    }

    // Earlier / This Week
    const earlier = filtered.filter(c => !c.pinned && c.timeGroup === 'thisWeek');
    if (earlier.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.innerHTML = `<div class="history-group-title">This Week</div>`;
      earlier.forEach(c => groupEl.appendChild(createChatItemEl(c)));
      historyContainer.appendChild(groupEl);
    }
  }

  function createChatItemEl(chat) {
    const item = document.createElement("div");
    item.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
    item.innerHTML = `
      <div class="chat-item-meta">
        <div class="chat-item-title">${chat.title}</div>
        <div class="chat-item-subtitle">${chat.updatedAt} · ${chat.preview.substring(0, 32)}...</div>
      </div>
      <div class="chat-item-actions">
        <button class="btn-icon" style="width:22px; height:22px; font-size:11px;" title="Options">⋯</button>
      </div>
    `;
    item.addEventListener("click", () => {
      currentChatId = chat.id;
      renderSidebar();
      loadChat(chat.id);
      renderContextPanel();
    });
    return item;
  }

  function loadChat(chatId) {
    const chat = window.SKYE_DATA.chats.find(c => c.id === chatId) || window.SKYE_DATA.chats[0];
    currentChatId = chat.id;
    activeTitleText.textContent = chat.title;
    messagesContainer.innerHTML = "";

    if (!chat.messages || chat.messages.length === 0) {
      messagesContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; text-align:center; color:var(--text-muted);">
          <span style="font-size:2.5rem; color:var(--accent); margin-bottom:12px;">◆</span>
          <h2 class="font-serif" style="font-size:1.6rem; color:var(--text-primary); margin-bottom:8px;">Welcome to Skye's Study</h2>
          <p style="max-width:440px; font-size:14px; line-height:1.6;">
            A research substrate for non-trivial mathematics, conceptual synthesis, and formal inquiry. What are we exploring today?
          </p>
        </div>
      `;
      return;
    }

    chat.messages.forEach(msg => {
      appendMessageToDOM(msg);
    });

    messagesScrollArea.scrollTop = messagesScrollArea.scrollHeight;
  }

  function appendMessageToDOM(msg) {
    const row = document.createElement("div");
    const isUser = msg.sender === "user";
    row.className = `message-row ${isUser ? 'user-row' : 'skye-row'}`;
    row.id = `msg-${msg.id}`;

    let bodyHtml = SkyeUtils.renderMarkdown(msg.text);

    if (msg.code) {
      bodyHtml += `
        <div class="code-block">
          <div class="code-header">
            <span>${msg.code.language} (${msg.code.filename || 'snippet'})</span>
            <button class="btn btn-ghost" style="padding: 2px 8px; font-size: 11px;" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(msg.code.content)}')">
              📋 Copy
            </button>
          </div>
          <pre class="code-content"><code class="language-${msg.code.language}">${SkyeUtils.syntaxHighlight(msg.code.content, msg.code.language)}</code></pre>
        </div>
      `;
    }

    const avatarHtml = isUser
      ? `<div class="message-avatar avatar-user">${msg.avatar || 'U'}</div>`
      : `<div class="message-avatar avatar-skye">S</div>`;

    row.innerHTML = `
      ${!isUser ? avatarHtml : ''}
      <div class="message-bubble-wrapper">
        <div class="message-bubble ${isUser ? 'user-bubble' : 'skye-bubble'}">
          <div class="message-text-content">${bodyHtml}</div>
        </div>
        <div class="message-actions-bar" style="justify-content: ${isUser ? 'flex-end' : 'flex-start'};">
          <button class="btn-icon" style="width:24px; height:24px; font-size:11px;" title="Copy message" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(msg.text)}')">📋</button>
          ${!isUser ? `
            <button class="btn-icon" style="width:24px; height:24px; font-size:11px;" title="Regenerate" onclick="SkyeUtils.showToast('Regenerating response...', 'info')">🔄</button>
            <button class="btn-icon" style="width:24px; height:24px; font-size:11px;" title="Helpful" onclick="SkyeUtils.showToast('Feedback noted (+1)', 'success')">👍</button>
            <button class="btn-icon" style="width:24px; height:24px; font-size:11px;" title="Needs revision" onclick="SkyeUtils.showToast('Feedback recorded', 'warning')">👎</button>
          ` : `
            <button class="btn-icon" style="width:24px; height:24px; font-size:11px;" title="Fork & edit" onclick="SkyeUtils.showToast('Conversation branched at this point', 'info')">🌿</button>
          `}
          <span class="message-time">${msg.time}</span>
        </div>
      </div>
      ${isUser ? avatarHtml : ''}
    `;

    messagesContainer.appendChild(row);
  }

  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
    if (!chat) return;

    // Create user message
    const userMsg = {
      id: "m_" + Date.now(),
      sender: "user",
      senderName: window.SKYE_DATA.currentUser.name,
      avatar: window.SKYE_DATA.currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    chat.messages.push(userMsg);
    appendMessageToDOM(userMsg);
    chatInput.value = "";
    messagesScrollArea.scrollTop = messagesScrollArea.scrollHeight;

    // Simulated Skye streaming response
    setTimeout(() => {
      simulateSkyeResponse(chat, text);
    }, 400);
  }

  function simulateSkyeResponse(chat, prompt) {
    const skyeMsgId = "m_" + (Date.now() + 1);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Prepare response placeholder
    const row = document.createElement("div");
    row.className = "message-row skye-row";
    row.id = `msg-${skyeMsgId}`;
    row.innerHTML = `
      <div class="message-avatar avatar-skye">S</div>
      <div class="message-bubble-wrapper">
        <div class="message-bubble skye-bubble">
          <div class="message-text-content" id="streaming-content-${skyeMsgId}"></div>
        </div>
        <div class="message-actions-bar">
          <span class="message-time">${timeStr}</span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(row);
    messagesScrollArea.scrollTop = messagesScrollArea.scrollHeight;

    sendBtn.style.display = "none";
    stopStreamBtn.style.display = "inline-flex";

    const streamContainer = document.getElementById(`streaming-content-${skyeMsgId}`);

    // Context-rich generated responses based on prompt keywords
    let responseText = "I have integrated that into our active research context. Running spectral verification across the boundary conditions now.";
    let codeBlock = null;

    if (prompt.toLowerCase().includes("proof") || prompt.toLowerCase().includes("riemann") || prompt.toLowerCase().includes("spectral")) {
      responseText = "Under the self-adjoint dilation extension with phase $\\theta = \\pi/4$, the spectrum remains strictly real. Notice how the trace asymptotics match the Riemann-von Mangoldt formula:\n\n$$N(E) = \\frac{E}{2\\pi} \\log \\left( \\frac{E}{2\\pi e} \\right) + \\frac{7}{8} + S(E)$$\n\nBelow is the verified test kernel:";
      codeBlock = {
        language: "python",
        filename: "trace_asymptotics.py",
        content: `def verify_trace_formula(E_max=100.0):\n    # Asymptotic number of zeros up to height E\n    import numpy as np\n    N_smooth = (E_max / (2 * np.pi)) * np.log(E_max / (2 * np.pi * np.e)) + 7/8\n    print(f"Smooth count up to {E_max}: {N_smooth:.4f}")\n    return N_smooth\n\nverify_trace_formula(100.0)`
      };
      // Add tool use record to chat
      chat.toolsUsed.unshift({
        name: "bash_exec",
        args: "python3 trace_asymptotics.py",
        output: "Smooth count up to 100.0: 29.4271",
        timestamp: timeStr,
        duration: "89ms"
      });
      renderContextPanel();
    } else {
      responseText = `I have analyzed your query from our existing memory substrate. \n\nWe are operating in the high-fidelity **${document.getElementById('chat-model-select').value}** configuration. All constraints remain consistent.`;
    }

    const fullSkyeMsg = {
      id: skyeMsgId,
      sender: "skye",
      senderName: "Skye",
      avatar: "S",
      time: timeStr,
      text: responseText,
      code: codeBlock
    };

    streamingController = SkyeUtils.streamResponse(streamContainer, responseText, codeBlock, () => {
      chat.messages.push(fullSkyeMsg);
      sendBtn.style.display = "inline-flex";
      stopStreamBtn.style.display = "none";
      streamingController = null;
      SkyeUtils.showToast("Response complete", "info", 1500);
    });
  }

  function startNewChat() {
    const newId = "chat-" + Date.now();
    const newChat = {
      id: newId,
      title: "Untitled Research Investigation",
      pinned: false,
      timeGroup: "today",
      updatedAt: "Just now",
      preview: "New conversation initiated...",
      model: "skye-v3-research",
      tokens: { used: 120, max: 8192, percent: 1 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: ["New session established with Skye v3."],
      messages: []
    };
    window.SKYE_DATA.chats.unshift(newChat);
    currentChatId = newId;
    renderSidebar();
    loadChat(newId);
    renderContextPanel();
    SkyeUtils.showToast("Started new research thread", "success");
  }

  function renderContextPanel() {
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];
    contextTabContent.innerHTML = "";

    if (activeContextTab === "sources") {
      if (chat.sources.length === 0) {
        contextTabContent.innerHTML = `<div style="color:var(--text-muted); font-size:12px; text-align:center; padding:20px;">No academic sources cited yet in this thread.</div>`;
        return;
      }
      chat.sources.forEach((s, idx) => {
        const card = document.createElement("div");
        card.className = "context-section-card";
        card.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:4px;">
            <span class="badge badge-accent" style="font-size:10px;">[${idx + 1}]</span>
            <a href="${s.url}" target="_blank" style="color:var(--text-primary); text-decoration:none; font-weight:600; font-size:12.5px;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-primary)'">
              ${s.title} ↗
            </a>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin-bottom:6px;">${s.snippet}</div>
          <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${s.domain}</div>
        `;
        contextTabContent.appendChild(card);
      });
    } else if (activeContextTab === "tools") {
      if (chat.toolsUsed.length === 0) {
        contextTabContent.innerHTML = `<div style="color:var(--text-muted); font-size:12px; text-align:center; padding:20px;">No tool invocations recorded yet.</div>`;
        return;
      }
      chat.toolsUsed.forEach(t => {
        const card = document.createElement("div");
        card.className = "context-section-card";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-family:var(--font-mono); font-weight:600; color:var(--accent); font-size:12px;">🔧 ${t.name}</span>
            <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${t.duration}</span>
          </div>
          <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); background:var(--bg-input); padding:6px; border-radius:4px; margin-bottom:6px; overflow-x:auto;">
            ${t.args}
          </div>
          <div style="font-size:11px; color:var(--success); line-height:1.4;">
            ↳ ${t.output}
          </div>
        `;
        contextTabContent.appendChild(card);
      });
    } else if (activeContextTab === "memory") {
      const card = document.createElement("div");
      card.className = "context-section-card";
      card.innerHTML = `
        <div class="context-section-title">
          <span>Active Cognitive Context</span>
          <span class="badge badge-accent">${chat.memory.length} items</span>
        </div>
        <ul style="padding-left:16px; font-size:12px; color:var(--text-secondary); line-height:1.6;">
          ${chat.memory.map(m => `<li>${m}</li>`).join('')}
        </ul>
      `;
      contextTabContent.appendChild(card);
    } else if (activeContextTab === "session") {
      const card = document.createElement("div");
      card.className = "context-section-card";
      card.innerHTML = `
        <div class="context-section-title">Telemetry & Tokens</div>
        <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>Context Fill</span>
              <span style="font-weight:600;">${chat.tokens.used} / ${chat.tokens.max} (${chat.tokens.percent}%)</span>
            </div>
            <div style="background:var(--bg-input); height:6px; border-radius:3px; overflow:hidden;">
              <div style="background:var(--accent); width:${chat.tokens.percent}%; height:100%;"></div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.05); padding-top:6px;">
            <span style="color:var(--text-secondary);">Active Substrate</span>
            <span style="font-family:var(--font-mono); color:var(--accent);">${chat.model}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-secondary);">Session Duration</span>
            <span>18m 42s</span>
          </div>
        </div>
      `;
      contextTabContent.appendChild(card);
    }
  }

  function renderAdminViews() {
    // Codes
    const codesList = document.getElementById("admin-codes-list");
    codesList.innerHTML = window.SKYE_DATA.activationCodes.map(c => `
      <div class="context-section-card" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-family:var(--font-mono); font-size:12.5px; font-weight:600; color:var(--text-primary);">${c.code}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">For: ${c.recipient} · Role: ${c.role} · Expires: ${c.expiresAt}</div>
        </div>
        <span class="badge ${c.status === 'used' ? 'badge-success' : c.status === 'unused' ? 'badge-accent' : 'badge-error'}">
          ${c.status.toUpperCase()}
        </span>
      </div>
    `).join('');

    // Generate Code Button
    document.getElementById("admin-generate-code-btn").onclick = () => {
      const newCode = SkyeUtils.generateActivationCode("collab@ravennest.science");
      window.SKYE_DATA.activationCodes.unshift({
        code: newCode,
        recipient: "new-collaborator@ias.edu",
        role: "trusted",
        status: "unused",
        usedBy: null,
        usedAt: null,
        expiresAt: "2026-08-21"
      });
      renderAdminViews();
      SkyeUtils.showToast("Generated new cryptographic code: " + newCode, "success", 5000);
    };

    // Users
    const usersList = document.getElementById("admin-users-list");
    usersList.innerHTML = window.SKYE_DATA.users.map(u => `
      <div class="context-section-card" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="avatar-user" style="width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">${u.name[0]}</div>
          <div>
            <div style="font-size:13px; font-weight:600;">${u.name} <span style="font-size:11px; color:var(--text-muted);">(${u.email})</span></div>
            <div style="font-size:11px; color:var(--text-muted);">Role: <strong>${u.role}</strong> · ${u.chatsCount} chats · Active: ${u.lastActive}</div>
          </div>
        </div>
        <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-error'}">${u.status}</span>
      </div>
    `).join('');

    // Logs
    const logsList = document.getElementById("admin-logs-list");
    logsList.innerHTML = window.SKYE_DATA.auditLogs.map(l => `
      <div style="padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
        <span><strong style="color:var(--accent);">${l.timestamp}</strong> [${l.level.toUpperCase()}] ${l.user}: ${l.action} - ${l.details}</span>
        <span style="color:var(--text-muted);">${l.ip}</span>
      </div>
    `).join('');
  }
});
