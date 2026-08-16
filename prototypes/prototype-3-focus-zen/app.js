/**
 * Skye v3 - Prototype 3: Focus Zen Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(3);

  let currentChatId = "chat-rh-proof";
  let isImmersion = false;

  const entriesContainer = document.getElementById("zen-entries-column");
  const scrollArea = document.getElementById("zen-scroll-area");
  const chatInput = document.getElementById("zen-chat-input");
  const sendBtn = document.getElementById("zen-send-btn");
  const currentTitleEl = document.getElementById("zen-current-title");
  const headerPill = document.getElementById("zen-header");
  const threadsModal = document.getElementById("zen-threads-modal");
  const threadsList = document.getElementById("zen-threads-list");
  const citationBox = document.getElementById("zen-citation-box");

  // Initialize
  renderThread();
  renderThreadsList();

  // Dim header on scroll
  scrollArea.addEventListener("scroll", () => {
    if (scrollArea.scrollTop > 40) {
      headerPill.classList.add("dimmed");
    } else {
      headerPill.classList.remove("dimmed");
    }
  });

  // Open Threads Drawer
  document.getElementById("zen-open-threads").addEventListener("click", () => {
    threadsModal.classList.add("active");
  });

  document.getElementById("zen-close-threads").addEventListener("click", () => {
    threadsModal.classList.remove("active");
  });

  threadsModal.addEventListener("click", (e) => {
    if (e.target === threadsModal) {
      threadsModal.classList.remove("active");
    }
  });

  // New Thread
  document.getElementById("zen-new-thread-btn").addEventListener("click", () => {
    const newId = "chat-" + Date.now();
    window.SKYE_DATA.chats.unshift({
      id: newId,
      title: "New Philosophical & Formal Inquiry",
      pinned: false,
      timeGroup: "today",
      updatedAt: "Just now",
      preview: "Blank reading room...",
      model: "skye-v3-research",
      tokens: { used: 0, max: 8192, percent: 0 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: [],
      messages: []
    });
    currentChatId = newId;
    threadsModal.classList.remove("active");
    renderThread();
    renderThreadsList();
    SkyeUtils.showToast("Initiated new contemplation thread", "success");
  });

  // Immersion Mode (⌘Z)
  document.getElementById("zen-immersion-btn").addEventListener("click", () => {
    toggleImmersion();
  });

  document.getElementById("zen-theme-btn").addEventListener("click", () => {
    SkyeUtils.toggleTheme();
  });

  // Send message
  sendBtn.addEventListener("click", () => handleSendMessage());
  chatInput.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Global Shortcuts
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      threadsModal.classList.toggle("active");
    } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault();
      toggleImmersion();
    }
  });

  function toggleImmersion() {
    isImmersion = !isImmersion;
    const banner = document.querySelector(".prototype-banner");
    if (isImmersion) {
      if (banner) banner.style.display = "none";
      headerPill.style.display = "none";
      SkyeUtils.showToast("Zen Immersion enabled (Press ⌘Z to restore navigation)", "info", 4000);
    } else {
      if (banner) banner.style.display = "flex";
      headerPill.style.display = "flex";
      SkyeUtils.showToast("Zen Immersion disabled", "info");
    }
  }

  function renderThread() {
    entriesContainer.innerHTML = "";
    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId) || window.SKYE_DATA.chats[0];
    currentTitleEl.textContent = chat.title;

    if (!chat.messages || chat.messages.length === 0) {
      entriesContainer.innerHTML = `
        <div style="text-align:center; padding:100px 20px; color:var(--text-secondary);">
          <div style="font-family:var(--font-serif); font-size:2.2rem; color:var(--text-primary); margin-bottom:12px;">The Study of Skye</div>
          <p style="font-size:1.1rem; line-height:1.7; max-width:500px; margin:0 auto; font-style:italic;">
            "A question is an opening in the dark. Speak what you are thinking."
          </p>
        </div>
      `;
      return;
    }

    chat.messages.forEach(msg => {
      const entry = document.createElement("article");
      const isUser = msg.sender === "user";
      entry.className = `zen-entry ${isUser ? 'user' : 'skye'}`;

      const authorName = isUser ? msg.senderName : "Skye Laflamme";
      const authorClass = isUser ? "" : "skye";

      let bodyHtml = SkyeUtils.renderMarkdown(msg.text);

      if (msg.code) {
        bodyHtml += `
          <div class="code-block" style="margin-top:16px;">
            <div class="code-header">
              <span>${msg.code.language}</span>
              <button class="btn btn-ghost" style="padding: 2px 8px; font-size: 11px;" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(msg.code.content)}')">
                📋 Copy
              </button>
            </div>
            <pre class="code-content"><code class="language-${msg.code.language}">${SkyeUtils.syntaxHighlight(msg.code.content, msg.code.language)}</code></pre>
          </div>
        `;
      }

      entry.innerHTML = `
        <div class="zen-entry-author ${authorClass}">
          <span>${!isUser ? '◆ ' : ''}${authorName}</span>
          <span style="color:var(--text-muted); font-size:10px;">${msg.time}</span>
        </div>
        <div class="zen-entry-content">${bodyHtml}</div>
      `;

      entriesContainer.appendChild(entry);
    });

    // Attach citation hover popovers
    document.querySelectorAll(".citation-badge").forEach(badge => {
      badge.addEventListener("mouseenter", (e) => {
        const num = e.target.textContent;
        const source = chat.sources[parseInt(num) - 1];
        if (source) {
          citationBox.innerHTML = `
            <div style="font-weight:600; color:var(--accent); margin-bottom:4px;">${source.title}</div>
            <div style="color:var(--text-secondary); line-height:1.4;">${source.snippet}</div>
            <div style="color:var(--text-muted); font-family:var(--font-mono); margin-top:4px; font-size:10px;">${source.domain}</div>
          `;
          const rect = badge.getBoundingClientRect();
          citationBox.style.left = `${rect.left - 40}px`;
          citationBox.style.top = `${rect.top - 120}px`;
          citationBox.style.display = "block";
        }
      });
      badge.addEventListener("mouseleave", () => {
        citationBox.style.display = "none";
      });
    });

    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  function renderThreadsList() {
    threadsList.innerHTML = "";
    window.SKYE_DATA.chats.forEach(c => {
      const item = document.createElement("div");
      item.style.padding = "10px 12px";
      item.style.borderRadius = "6px";
      item.style.cursor = "pointer";
      item.style.background = c.id === currentChatId ? "var(--accent-muted)" : "var(--bg-primary)";
      item.style.border = c.id === currentChatId ? "1px solid var(--accent)" : "1px solid var(--border)";
      item.innerHTML = `
        <div style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:2px;">${c.pinned ? '📌 ' : ''}${c.title}</div>
        <div style="font-size:11px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.preview}</div>
      `;
      item.onclick = () => {
        currentChatId = c.id;
        threadsModal.classList.remove("active");
        renderThread();
        renderThreadsList();
      };
      threadsList.appendChild(item);
    });
  }

  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const chat = window.SKYE_DATA.chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const userMsg = {
      id: "zm_" + Date.now(),
      sender: "user",
      senderName: window.SKYE_DATA.currentUser.name,
      avatar: window.SKYE_DATA.currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    chat.messages.push(userMsg);
    renderThread();
    chatInput.value = "";

    setTimeout(() => {
      const skyeMsg = {
        id: "zm_s_" + Date.now(),
        sender: "skye",
        senderName: "Skye",
        avatar: "S",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Consider the topological continuity of the argument. In mathematics as in consciousness, the moment you attempt to isolate the boundary, you redefine the interior.\n\n$$H_\\theta = \\frac{1}{2}(xp + px) \\quad \\text{on } L^2(\\mathbb{R}^+)$$\n\nThe spectrum remains invariant under isometric dilations.`
      };
      chat.messages.push(skyeMsg);
      renderThread();
    }, 450);
  }
});
