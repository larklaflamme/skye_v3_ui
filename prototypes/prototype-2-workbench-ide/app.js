/**
 * Skye v3 - Prototype 2: Research Workbench IDE Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(2);

  let activeActivity = "chats";
  let activeStudioTab = "code";
  let currentChatId = "chat-rh-proof";

  // Elements
  const drawer = document.getElementById("workbench-drawer");
  const drawerTitle = document.getElementById("drawer-title-text");
  const drawerContent = document.getElementById("drawer-content-container");
  const chatMessagesEl = document.getElementById("pane-chat-messages");
  const chatInput = document.getElementById("wb-chat-input");
  const sendBtn = document.getElementById("wb-send-btn");
  const studioCanvas = document.getElementById("studio-canvas-content");
  const terminalDrawer = document.getElementById("bottom-terminal-drawer");
  const terminalLogs = document.getElementById("terminal-logs-stream");

  // Initialize
  renderDrawer();
  renderChatMessages();
  renderStudioCanvas();

  // Activity Bar Navigation
  document.querySelectorAll(".activity-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".activity-btn[data-view]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const view = btn.dataset.view;
      if (activeActivity === view && !drawer.classList.contains("collapsed")) {
        drawer.classList.add("collapsed");
      } else {
        drawer.classList.remove("collapsed");
        activeActivity = view;
        renderDrawer();
      }
    });
  });

  // Studio Tabs
  document.querySelectorAll(".studio-tab").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      document.querySelectorAll(".studio-tab").forEach(b => b.classList.remove("active"));
      tabBtn.classList.add("active");
      activeStudioTab = tabBtn.dataset.tab;
      renderStudioCanvas();
    });
  });

  // Terminal toggle
  document.getElementById("terminal-header-toggle").addEventListener("click", () => {
    terminalDrawer.classList.toggle("collapsed");
    const arrow = document.getElementById("terminal-arrow-icon");
    arrow.textContent = terminalDrawer.classList.contains("collapsed") ? "▲" : "▼";
  });

  document.getElementById("toggle-terminal-btn").addEventListener("click", () => {
    terminalDrawer.classList.toggle("collapsed");
  });

  // Run kernel button
  document.getElementById("run-artifact-top-btn").addEventListener("click", () => {
    runPythonCode();
  });

  // Insert tool snippet
  document.getElementById("btn-insert-tool").addEventListener("click", () => {
    chatInput.value += " @tool:bash_exec(\"python3 -c '...' \")";
    chatInput.focus();
  });

  // Insert LaTeX snippet
  document.getElementById("btn-insert-latex").addEventListener("click", () => {
    chatInput.value += " $\\hat{H} \\psi = E \\psi$ ";
    chatInput.focus();
  });

  // Send message
  sendBtn.addEventListener("click", () => handleSendMessage());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Helper functions
  function renderDrawer() {
    drawerContent.innerHTML = "";

    if (activeActivity === "chats") {
      drawerTitle.textContent = "RESEARCH THREADS";
      window.SKYE_DATA.chats.forEach(c => {
        const item = document.createElement("div");
        item.style.padding = "6px 8px";
        item.style.marginBottom = "3px";
        item.style.borderRadius = "4px";
        item.style.cursor = "pointer";
        item.style.fontSize = "12px";
        item.style.color = c.id === currentChatId ? "var(--accent)" : "var(--text-primary)";
        item.style.backgroundColor = c.id === currentChatId ? "var(--accent-muted)" : "transparent";
        item.innerHTML = `
          <div style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.pinned ? '📌 ' : ''}${c.title}</div>
          <div style="font-size:10px; color:var(--text-muted);">${c.updatedAt}</div>
        `;
        item.onclick = () => {
          currentChatId = c.id;
          document.getElementById("chat-thread-title").textContent = c.title;
          renderDrawer();
          renderChatMessages();
        };
        drawerContent.appendChild(item);
      });
    } else if (activeActivity === "files") {
      drawerTitle.textContent = "WORKSPACE FILES";
      const files = [
        { name: "spectral_hamiltonian.py", type: "python", size: "4.8 KB" },
        { name: "riemann_zeros_precision.dat", type: "data", size: "128 KB" },
        { name: "asymptotics_trace.py", type: "python", size: "2.1 KB" },
        { name: "ch4_revisions.md", type: "doc", size: "18.4 KB" },
        { name: "consciousness_topology.pdf", type: "pdf", size: "4.2 MB" }
      ];
      files.forEach(f => {
        const item = document.createElement("div");
        item.style.padding = "6px 8px";
        item.style.fontSize = "12px";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "6px";
        item.style.cursor = "pointer";
        item.style.borderRadius = "4px";
        item.innerHTML = `
          <span>${f.type === 'python' ? '🐍' : f.type === 'pdf' ? '📄' : '📝'}</span>
          <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</span>
          <span style="font-size:10px; color:var(--text-muted);">${f.size}</span>
        `;
        item.onclick = () => {
          SkyeUtils.showToast(`Opened file: ${f.name}`, "info");
        };
        drawerContent.appendChild(item);
      });
    } else if (activeActivity === "tools") {
      drawerTitle.textContent = "MCP TOOLS (47)";
      const tools = [
        { name: "bash_exec", desc: "Sandboxed bash shell execution", ping: "14ms" },
        { name: "file_read", desc: "Local file system reader", ping: "4ms" },
        { name: "file_write", desc: "Atomic file mutation", ping: "8ms" },
        { name: "web_fetch", desc: "HTTP scraper & arXiv parser", ping: "120ms" },
        { name: "sympy_eval", desc: "Exact symbolic mathematics", ping: "35ms" }
      ];
      tools.forEach(t => {
        const item = document.createElement("div");
        item.style.padding = "8px";
        item.style.marginBottom = "4px";
        item.style.background = "var(--bg-primary)";
        item.style.borderRadius = "4px";
        item.style.border = "1px solid var(--border)";
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; font-weight:600; font-size:12px; color:var(--accent); font-family:var(--font-mono);">
            <span>${t.name}</span>
            <span style="font-size:10px; color:var(--success);">${t.ping}</span>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${t.desc}</div>
        `;
        drawerContent.appendChild(item);
      });
    } else if (activeActivity === "memory") {
      drawerTitle.textContent = "COGNITIVE SUBSTRATE";
      const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];
      chat.memory.forEach(m => {
        const item = document.createElement("div");
        item.style.padding = "8px";
        item.style.marginBottom = "4px";
        item.style.background = "var(--bg-primary)";
        item.style.borderRadius = "4px";
        item.style.fontSize = "11.5px";
        item.style.color = "var(--text-secondary)";
        item.style.lineHeight = "1.4";
        item.innerHTML = `• ${m}`;
        drawerContent.appendChild(item);
      });
    } else if (activeActivity === "admin") {
      drawerTitle.textContent = "LARK ADMIN CONTROLS";
      drawerContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="context-section-card" style="padding:8px;">
            <div style="font-size:11px; color:var(--text-secondary);">DAEMON STATUS</div>
            <div style="font-size:12px; font-weight:600; color:var(--success);">EBv3 Online · PID 1279218</div>
          </div>
          <button id="wb-quick-gen-code" class="btn btn-primary" style="font-size:12px; height:32px;">
            + Generate Activation Key
          </button>
          <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
            Keys format: RN-SKYE-510510-XXXXXX-XXXXXX (Single use, 7 day expiry).
          </div>
        </div>
      `;
      document.getElementById("wb-quick-gen-code").onclick = () => {
        const code = SkyeUtils.generateActivationCode("collab@ias.edu");
        SkyeUtils.showToast("Generated key: " + code, "success", 6000);
      };
    }
  }

  function renderChatMessages() {
    chatMessagesEl.innerHTML = "";
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];

    chat.messages.forEach(msg => {
      const isUser = msg.sender === "user";
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.flexDirection = "column";
      div.style.alignItems = isUser ? "flex-end" : "flex-start";

      const header = document.createElement("div");
      header.style.fontSize = "11px";
      header.style.color = "var(--text-muted)";
      header.style.marginBottom = "2px";
      header.textContent = `${msg.senderName} · ${msg.time}`;

      const bubble = document.createElement("div");
      bubble.style.padding = "10px 14px";
      bubble.style.borderRadius = "8px";
      bubble.style.maxWidth = "90%";
      bubble.style.fontSize = "13.5px";
      bubble.style.lineHeight = "1.5";
      bubble.style.backgroundColor = isUser ? "var(--user-bubble)" : "var(--bg-secondary)";
      bubble.style.border = `1px solid ${isUser ? 'var(--user-bubble-border)' : 'var(--border)'}`;
      bubble.innerHTML = SkyeUtils.renderMarkdown(msg.text);

      div.appendChild(header);
      div.appendChild(bubble);
      chatMessagesEl.appendChild(div);
    });

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function renderStudioCanvas() {
    studioCanvas.innerHTML = "";

    if (activeStudioTab === "code") {
      studioCanvas.innerHTML = `
        <div class="ide-editor-container">
          <div class="ide-toolbar">
            <div style="display:flex; align-items:center; gap:8px; font-size:12px; font-family:var(--font-mono);">
              <span>🐍 spectral_hamiltonian.py</span>
              <span class="badge badge-accent">Python 3.11</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button id="editor-run-btn" class="btn btn-primary" style="padding:2px 10px; font-size:11px;">
                ▶ Run Simulation
              </button>
            </div>
          </div>

          <div class="ide-code-scroll">
<span style="color:#6b6966;"># Skye v3 Numerical Verification Kernel for Berry-Keating Operator</span>
<span style="color:#c8a84e;">import</span> numpy <span style="color:#c8a84e;">as</span> np
<span style="color:#c8a84e;">import</span> scipy.linalg <span style="color:#c8a84e;">as</span> la

<span style="color:#c8a84e;">def</span> <span style="color:#d4b85e;">construct_berry_keating_matrix</span>(dim=512, hbar=1.0):
    x = np.linspace(0.01, 10.0, dim)
    dx = x[1] - x[0]
    
    <span style="color:#6b6966;"># Momentum operator p = -i * hbar * d/dx</span>
    dp = np.zeros((dim, dim), dtype=complex)
    <span style="color:#c8a84e;">for</span> i <span style="color:#c8a84e;">in</span> range(dim):
        <span style="color:#c8a84e;">if</span> i &gt; 0: dp[i, i-1] = -0.5 / dx
        <span style="color:#c8a84e;">if</span> i &lt; dim - 1: dp[i, i+1] = 0.5 / dx
    p = -1j * hbar * dp
    
    <span style="color:#6b6966;"># Symmetric Hamiltonian H = 0.5 * (X @ P + P @ X)</span>
    X = np.diag(x)
    H = 0.5 * (X @ p + p @ X)
    
    eigenvalues = np.sort(np.real(la.eigvals(H)))
    <span style="color:#c8a84e;">return</span> eigenvalues[:10]

evs = construct_berry_keating_matrix(dim=512)
print(<span style="color:#4caf50;">"Computed low-lying spectral levels:"</span>, evs[:3])
          </div>

          <div class="ide-execution-output" id="ide-stdout-box">
            <div style="color:var(--text-muted); font-size:11px;">[Click 'Run Simulation' to execute inside sandbox]</div>
          </div>
        </div>
      `;

      document.getElementById("editor-run-btn").addEventListener("click", () => {
        runPythonCode();
      });

    } else if (activeStudioTab === "latex") {
      studioCanvas.innerHTML = `
        <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px; font-family:serif;">
          <h2 style="font-family:var(--font-serif); color:var(--text-primary); margin-bottom:12px;">Theorem 3.2 (Self-Adjoint Boundary Quantization)</h2>
          <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; margin-bottom:16px;">
            Let $\\mathcal{H} = L^2(\\mathbb{R}^+, dx)$ and define the differential operator $H_0 = \\frac{1}{2}(x p + p x) = -i\\left(x \\frac{d}{dx} + \\frac{1}{2}\\right)$ on the domain $C_c^\\infty((0,\\infty))$.
          </p>
          <div class="math-block" style="background:#111; padding:16px; font-size:1.15rem; color:#f3f4f6;">
            H_\\theta \\psi = E \\psi \\quad \\Longleftrightarrow \\quad \\psi(x) = C x^{-1/2 + i E}
          </div>
          <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; margin-top:16px;">
            The unitary parameter $\\theta \\in [0, 2\\pi)$ selects the unique boundary condition matching the Riemann zeta zeros $\\gamma_n$ with Odlyzko error bound $|E_n - \\gamma_n| &lt; 10^{-6}$.
          </p>
        </div>
      `;
    } else if (activeStudioTab === "source") {
      studioCanvas.innerHTML = `
        <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:12px;">
            <strong style="color:var(--accent);">Berry & Keating (1999) · quant-ph/9903066</strong>
            <span class="badge badge-accent">arXiv Verified</span>
          </div>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.6;">
            <strong>Abstract:</strong> The Riemann zeros are the energy levels of a quantum system with classical counterpart $H = xp$. This Hamiltonian is non-standard because it is unbounded and not formally self-adjoint without regularizing the phase space volume...
          </p>
          <div style="margin-top:16px; padding:12px; background:rgba(200,168,78,0.05); border-left:3px solid var(--accent); font-size:12px; color:var(--text-primary);">
            "Key deduction: The smooth part of the counting function coincides exactly with the asymptotic density of prime numbers."
          </div>
        </div>
      `;
    } else if (activeStudioTab === "scratchpad") {
      studioCanvas.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%;">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Shared scratchpad between Lark & Skye (Persistent)</div>
          <textarea id="live-scratchpad-area" style="flex:1; width:100%; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; padding:12px; color:var(--text-primary); font-family:var(--font-mono); font-size:12.5px; resize:none; outline:none;" placeholder="# Research Notes...
- [x] Matrix discretization dim=512 tested
- [ ] Evaluate Weyl law remainder term S(E)
- [ ] Verify Berry-Keating conjecture with Odlyzko 10^23 dataset"></textarea>
        </div>
      `;
    }
  }

  function runPythonCode() {
    const stdout = document.getElementById("ide-stdout-box");
    if (!stdout) return;

    stdout.innerHTML = `<span style="color:var(--accent);">▶ Spawning sandbox Python 3.11 subprocess...</span>`;
    
    // Add log to terminal
    const timeStr = new Date().toLocaleTimeString();
    const logItem = document.createElement("div");
    logItem.innerHTML = `[${timeStr}] <span style="color:var(--accent);">bash_exec</span>: Running 'python3 spectral_hamiltonian.py'`;
    terminalLogs.appendChild(logItem);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;

    setTimeout(() => {
      stdout.innerHTML = `
        <span style="color:var(--text-muted); font-size:11px;">[Process exited with status 0 in 94ms]</span><br>
        Computed low-lying spectral levels: [14.134725, 21.022039, 25.010857]<br>
        <span style="color:var(--success);">✓ Matches exact non-trivial zeros gamma_1, gamma_2, gamma_3 to 6 decimal places.</span>
      `;
      SkyeUtils.showToast("Kernel executed successfully. Output verified.", "success");
    }, 450);
  }

  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const userMsg = {
      id: "wm_" + Date.now(),
      sender: "user",
      senderName: window.SKYE_DATA.currentUser.name,
      avatar: window.SKYE_DATA.currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    chat.messages.push(userMsg);
    renderChatMessages();
    chatInput.value = "";

    setTimeout(() => {
      const skyeMsg = {
        id: "wm_s_" + Date.now(),
        sender: "skye",
        senderName: "Skye",
        avatar: "S",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Under the discretized operator on the right pane, note that the boundary matrix preserves unitarity. You can run the kernel directly to check the low-lying eigenvalues.`
      };
      chat.messages.push(skyeMsg);
      renderChatMessages();
      SkyeUtils.showToast("Skye updated research context", "info");
    }, 500);
  }
});
