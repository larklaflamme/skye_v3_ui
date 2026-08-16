/**
 * Skye v3 - Prototype 5: Command HUD & Admin Cockpit Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(5);

  let currentChatId = "chat-rh-proof";

  const threadList = document.getElementById("hub-thread-list");
  const messagesScroll = document.getElementById("hub-messages-scroll");
  const activeTitle = document.getElementById("hub-active-title");
  const cliInput = document.getElementById("hub-cli-input");
  const cliSend = document.getElementById("hub-cli-send");
  const userRows = document.getElementById("hub-user-rows");
  const codeRows = document.getElementById("hub-code-rows");
  const socketLogsFeed = document.getElementById("socket-logs-feed");

  // Initialize
  renderThreads();
  renderChat();
  renderAdminTables();
  startSocketSimulation();

  // Tab Panel Switching
  document.querySelectorAll(".hub-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".hub-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const panel = btn.dataset.panel;
      document.querySelectorAll(".hub-panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById(`panel-${panel}`);
      if (target) target.classList.add("active");
    });
  });

  // Autocomplete chips
  document.querySelectorAll(".command-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      cliInput.value = chip.dataset.cmd;
      cliInput.focus();
    });
  });

  // Quick key generator buttons
  document.getElementById("hub-quick-gen-btn").onclick = () => generateNewKey();
  document.getElementById("hub-table-gen-key").onclick = () => generateNewKey();

  // CLI Command Execution
  cliSend.addEventListener("click", () => handleCliSubmit());
  cliInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCliSubmit();
    }
  });

  function handleCliSubmit() {
    const text = cliInput.value.trim();
    if (!text) return;

    if (text.startsWith("/")) {
      handleSlashCommand(text);
    } else {
      handleResearchMessage(text);
    }
    cliInput.value = "";
  }

  function handleSlashCommand(cmdStr) {
    const parts = cmdStr.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    appendCliOutput(`skye> ${cmdStr}`, "command");

    if (cmd === "/status") {
      appendCliOutput(`[SYSTEM STATUS]\nEBv3 Daemon: Online (PID 1279218)\nSkye Engine: Port 8765 Active\nMCP Tools: 47 tools connected (18ms)\nPostgres: Connected (Neon 8/20)`, "system");
      SkyeUtils.showToast("System telemetry refreshed", "info");
    } else if (cmd === "/model") {
      const model = arg || "skye-v3-research";
      appendCliOutput(`Active substrate changed to: ${model}`, "system");
      SkyeUtils.showToast(`Switched model to ${model}`, "success");
    } else if (cmd === "/keygen") {
      const email = arg || "collab@ravennest.science";
      const key = SkyeUtils.generateActivationCode(email);
      window.SKYE_DATA.activationCodes.unshift({
        code: key,
        recipient: email,
        role: "trusted",
        status: "unused",
        usedBy: null,
        usedAt: null,
        expiresAt: "2026-08-21"
      });
      renderAdminTables();
      appendCliOutput(`Generated key for ${email}:\n${key}`, "success");
      SkyeUtils.showToast(`Key generated: ${key}`, "success", 6000);
    } else if (cmd === "/exec") {
      appendCliOutput(`Executing: ${arg || 'python3 spectral_hamiltonian.py'}...\nOutput: Computed eigenvalues = [14.134725, 21.022039, 25.010857] (Success)`, "success");
      SkyeUtils.showToast("Command executed via MCP sandbox", "info");
    } else if (cmd === "/memory") {
      const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
      appendCliOutput(`Cognitive Context:\n${chat.memory.map(m => "• " + m).join("\n")}`, "system");
    } else if (cmd === "/clear") {
      const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
      chat.messages = [];
      renderChat();
      SkyeUtils.showToast("Chat context cleared", "info");
    } else {
      appendCliOutput(`Unknown command '${cmd}'. Available: /status, /model, /keygen, /exec, /memory, /clear`, "error");
    }
  }

  function handleResearchMessage(text) {
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
    if (!chat) return;

    chat.messages.push({
      id: "cm_" + Date.now(),
      sender: "user",
      senderName: window.SKYE_DATA.currentUser.name,
      avatar: window.SKYE_DATA.currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });

    renderChat();

    // Log to WebSocket feed
    logSocketFrame("client_message", { content: text, model: chat.model });

    setTimeout(() => {
      const skyeMsg = {
        id: "cm_s_" + Date.now(),
        sender: "skye",
        senderName: "Skye",
        avatar: "S",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Command evaluated. Matrix operator spectrum confirmed on critical line $\\text{Re}(s) = 1/2$. All boundary constraints satisfied.`
      };
      chat.messages.push(skyeMsg);
      renderChat();
      logSocketFrame("server_token_stream_end", { status: "complete", tokens: 28 });
    }, 450);
  }

  function appendCliOutput(text, type) {
    const msgDiv = document.createElement("div");
    msgDiv.style.fontFamily = "var(--font-mono)";
    msgDiv.style.fontSize = "12px";
    msgDiv.style.padding = "8px 12px";
    msgDiv.style.borderRadius = "4px";
    msgDiv.style.background = "#0c0c0e";
    msgDiv.style.border = "1px solid var(--border)";
    msgDiv.style.whiteSpace = "pre-wrap";
    msgDiv.style.color = type === "command" ? "var(--accent)" : type === "success" ? "var(--success)" : type === "error" ? "var(--error)" : "var(--text-secondary)";
    msgDiv.textContent = text;
    messagesScroll.appendChild(msgDiv);
    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  function renderThreads() {
    threadList.innerHTML = "";
    window.SKYE_DATA.chats.forEach(c => {
      const div = document.createElement("div");
      div.style.padding = "8px 10px";
      div.style.marginBottom = "2px";
      div.style.borderRadius = "4px";
      div.style.cursor = "pointer";
      div.style.fontSize = "12px";
      div.style.background = c.id === currentChatId ? "var(--accent-muted)" : "transparent";
      div.style.borderLeft = c.id === currentChatId ? "2px solid var(--accent)" : "2px solid transparent";
      div.innerHTML = `
        <div style="font-weight:500; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.pinned ? '📌 ' : ''}${c.title}</div>
        <div style="font-size:10px; color:var(--text-muted);">${c.updatedAt} · ${c.model}</div>
      `;
      div.onclick = () => {
        currentChatId = c.id;
        activeTitle.textContent = c.title;
        renderThreads();
        renderChat();
      };
      threadList.appendChild(div);
    });
  }

  function renderChat() {
    messagesScroll.innerHTML = "";
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];

    chat.messages.forEach(msg => {
      const isUser = msg.sender === "user";
      const card = document.createElement("div");
      card.style.padding = "10px 14px";
      card.style.borderRadius = "6px";
      card.style.background = isUser ? "var(--user-bubble)" : "var(--bg-secondary)";
      card.style.border = `1px solid ${isUser ? 'var(--user-bubble-border)' : 'var(--border)'}`;
      card.style.fontSize = "13px";
      card.style.lineHeight = "1.5";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
          <strong style="color:${isUser ? '#86efac' : 'var(--accent)'}; font-family:var(--font-mono);">${msg.senderName}</strong>
          <span style="color:var(--text-muted);">${msg.time}</span>
        </div>
        <div>${SkyeUtils.renderMarkdown(msg.text)}</div>
      `;
      messagesScroll.appendChild(card);
    });

    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  function renderAdminTables() {
    // Users
    userRows.innerHTML = window.SKYE_DATA.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td style="font-family:var(--font-mono); color:var(--text-secondary);">${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-accent' : 'badge-muted'}">${u.role.toUpperCase()}</span></td>
        <td><span class="status-dot ${u.status === 'active' ? 'online' : 'error'}"></span> ${u.status}</td>
        <td style="color:var(--text-muted); font-size:11px;">${u.lastActive}</td>
        <td>
          <button class="btn btn-ghost" style="padding:2px 6px; font-size:11px;" onclick="SkyeUtils.showToast('Updated status for ${u.name}', 'info')">
            ${u.status === 'active' ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join("");

    // Codes
    codeRows.innerHTML = window.SKYE_DATA.activationCodes.map(c => `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:600; color:var(--text-primary);">${c.code}</td>
        <td>${c.recipient}</td>
        <td><span class="badge badge-accent">${c.role}</span></td>
        <td><span class="badge ${c.status === 'used' ? 'badge-success' : c.status === 'unused' ? 'badge-warning' : 'badge-error'}">${c.status}</span></td>
        <td style="font-size:11px; color:var(--text-muted);">${c.expiresAt}</td>
        <td>
          <button class="btn btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="SkyeUtils.copyToClipboard('${c.code}')">
            📋 Copy
          </button>
        </td>
      </tr>
    `).join("");
  }

  function generateNewKey() {
    const key = SkyeUtils.generateActivationCode("researcher@ias.edu");
    window.SKYE_DATA.activationCodes.unshift({
      code: key,
      recipient: "collab-math@ias.edu",
      role: "trusted",
      status: "unused",
      usedBy: null,
      usedAt: null,
      expiresAt: "2026-08-21"
    });
    renderAdminTables();
    SkyeUtils.showToast(`New activation key issued: ${key}`, "success", 6000);
  }

  function logSocketFrame(type, payload) {
    const row = document.createElement("div");
    row.style.marginBottom = "4px";
    row.style.lineHeight = "1.4";
    const time = new Date().toISOString().substring(11, 23);
    row.innerHTML = `<span style="color:var(--text-muted);">${time}</span> <span style="color:var(--accent);">[FRAME:${type}]</span> <span style="color:#d1d5db;">${JSON.stringify(payload)}</span>`;
    socketLogsFeed.appendChild(row);
    socketLogsFeed.scrollTop = socketLogsFeed.scrollHeight;
  }

  function startSocketSimulation() {
    setInterval(() => {
      const pingTime = new Date().toISOString().substring(11, 23);
      const row = document.createElement("div");
      row.style.color = "rgba(255,255,255,0.2)";
      row.style.fontSize = "11px";
      row.innerHTML = `${pingTime} [WS_HEARTBEAT] ping -> pong (latency: 18ms)`;
      socketLogsFeed.appendChild(row);
      if (socketLogsFeed.children.length > 50) {
        socketLogsFeed.removeChild(socketLogsFeed.children[1]);
      }
      socketLogsFeed.scrollTop = socketLogsFeed.scrollHeight;
    }, 8000);
  }
});
