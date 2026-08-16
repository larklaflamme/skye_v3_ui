/**
 * Skye Web UI - Shared Utilities & Interactive Engines
 */

const SkyeUtils = {
  // Simple markdown & math renderer
  renderMarkdown(text) {
    if (!text) return "";
    
    let html = text;
    
    // LaTeX Display Math $$ ... $$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, eq) => {
      return `<div class="math-block"><code>${SkyeUtils.escapeHtml(eq.trim())}</code></div>`;
    });
    
    // LaTeX Inline Math $ ... $
    html = html.replace(/\$([^\$\n]+?)\$/g, (match, eq) => {
      return `<code class="math-inline" style="font-family:serif; font-style:italic; padding:1px 4px; background:rgba(200,168,78,0.08); border-radius:3px;">${SkyeUtils.escapeHtml(eq.trim())}</code>`;
    });
    
    // Code blocks with syntax highlighting simulation
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `
        <div class="code-block">
          <div class="code-header">
            <span>${language}</span>
            <button class="btn btn-ghost" style="padding: 2px 8px; font-size: 11px;" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(code)}')">
              📋 Copy
            </button>
          </div>
          <pre class="code-content"><code class="language-${language}">${SkyeUtils.syntaxHighlight(code, language)}</code></pre>
        </div>
      `;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono); background:var(--code-bg); padding:2px 6px; border-radius:4px; font-size:0.88em; border:1px solid var(--border);">$1</code>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Citations [1], [2]
    html = html.replace(/\[([0-9]+)\]/g, '<span class="citation-badge" onclick="SkyeUtils.triggerCitation($1)" title="View source citation">$1</span>');
    
    // Line breaks (if not inside blocks)
    html = html.replace(/\n\n/g, '<p style="margin-bottom: 12px;"></p>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
  },

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  escapeForAttr(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  },

  syntaxHighlight(code, lang) {
    let esc = SkyeUtils.escapeHtml(code);
    if (lang === 'python') {
      esc = esc.replace(/\b(def|return|import|as|from|class|if|else|elif|for|in|while|print)\b/g, '<span style="color:#c8a84e; font-weight:600;">$1</span>');
      esc = esc.replace(/\b(self|True|False|None)\b/g, '<span style="color:#e6a817;">$1</span>');
      esc = esc.replace(/(#.*)$/gm, '<span style="color:#6b6966; font-style:italic;">$1</span>');
      esc = esc.replace(/(['"].*?['"])/g, '<span style="color:#4caf50;">$1</span>');
      esc = esc.replace(/\b([0-9]+\.?[0-9]*j?)\b/g, '<span style="color:#5c9ce6;">$1</span>');
    } else if (lang === 'javascript' || lang === 'js') {
      esc = esc.replace(/\b(const|let|var|function|return|import|export|if|else|switch|case|break)\b/g, '<span style="color:#c8a84e; font-weight:600;">$1</span>');
      esc = esc.replace(/(['"].*?['"])/g, '<span style="color:#4caf50;">$1</span>');
      esc = esc.replace(/(\/\/.*)$/gm, '<span style="color:#6b6966; font-style:italic;">$1</span>');
    }
    return esc;
  },

  showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("skye-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "skye-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px;" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 240ms ease';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      SkyeUtils.showToast("Copied to clipboard", "success");
    }).catch(() => {
      SkyeUtils.showToast("Failed to copy", "error");
    });
  },

  triggerCitation(num) {
    SkyeUtils.showToast(`Navigated to Citation [${num}] in Context Panel`, "info");
    const contextPanel = document.getElementById("right-context-panel");
    if (contextPanel) {
      contextPanel.classList.remove("collapsed");
      const sourcesTab = document.querySelector('[data-tab="sources"]');
      if (sourcesTab) sourcesTab.click();
    }
  },

  // Simulated live streaming text engine
  streamResponse(containerElement, fullText, codeObj, onComplete, speed = 18) {
    containerElement.innerHTML = '';
    const textChunkSpan = document.createElement("span");
    const cursorSpan = document.createElement("span");
    cursorSpan.className = "streaming-cursor";
    
    containerElement.appendChild(textChunkSpan);
    containerElement.appendChild(cursorSpan);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        index += Math.min(3, fullText.length - index);
        textChunkSpan.innerHTML = SkyeUtils.renderMarkdown(fullText.substring(0, index));
        // Auto scroll to bottom
        const scrollContainer = containerElement.closest('.messages-scroll-area') || containerElement.closest('.chat-messages');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      } else {
        clearInterval(interval);
        cursorSpan.remove();
        if (codeObj) {
          const codeWrapper = document.createElement("div");
          codeWrapper.innerHTML = `
            <div class="code-block" style="margin-top: 12px;">
              <div class="code-header">
                <span>${codeObj.language} (${codeObj.filename || 'snippet'})</span>
                <button class="btn btn-ghost" style="padding: 2px 8px; font-size: 11px;" onclick="SkyeUtils.copyToClipboard('${SkyeUtils.escapeForAttr(codeObj.content)}')">
                  📋 Copy
                </button>
              </div>
              <pre class="code-content"><code class="language-${codeObj.language}">${SkyeUtils.syntaxHighlight(codeObj.content, codeObj.language)}</code></pre>
            </div>
          `;
          containerElement.appendChild(codeWrapper);
        }
        if (onComplete) onComplete();
      }
    }, speed);
    
    return {
      stop: () => {
        clearInterval(interval);
        cursorSpan.remove();
        if (onComplete) onComplete();
      }
    };
  },

  // Generate activation codes matching specification
  generateActivationCode(email = "user@domain.com") {
    const magic = "510510"; // 2*3*5*7*11*13*17
    const randomHex1 = Math.random().toString(16).substring(2, 8).toUpperCase();
    const randomHex2 = Math.random().toString(16).substring(2, 8).toUpperCase();
    return `RN-SKYE-${magic}-${randomHex1}-${randomHex2}`;
  },

  // Validate activation code format
  validateActivationCode(code) {
    if (!code) return { valid: false, message: "Activation code is required" };
    const clean = code.trim().toUpperCase();
    const regex = /^RN-SKYE-510510-[A-F0-9]{6}-[A-F0-9]{6}$/;
    if (!clean.startsWith("RN-SKYE-")) {
      return { valid: false, message: "Code must start with RN-SKYE-" };
    }
    if (!clean.includes("510510")) {
      return { valid: false, message: "Invalid cryptographic magic segment" };
    }
    if (clean.length !== 28 && clean.length !== 26) {
      return { valid: false, message: "Invalid code length. Expected 26-28 characters." };
    }
    return { valid: true, message: "Activation code valid" };
  },

  // Inject top prototype switcher nav
  injectPrototypeNav(currentId) {
    const banner = document.createElement("div");
    banner.className = "prototype-banner";
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color:var(--accent); font-weight:600; font-family:var(--font-serif); font-size:1.1rem;">RavenNest</span>
        <span style="color:var(--text-muted);">|</span>
        <span style="color:var(--text-primary); font-weight:500;">Skye v3 UI Prototypes</span>
      </div>
      <div class="prototype-nav-links">
        <a href="../index.html" style="font-weight:600; color:var(--text-primary);">⚡ Overview Hub</a>
        <a href="../prototype-1-classic-scholar/index.html" class="${currentId === 1 ? 'active' : ''}">1. Classic Scholar</a>
        <a href="../prototype-2-workbench-ide/index.html" class="${currentId === 2 ? 'active' : ''}">2. Workbench IDE</a>
        <a href="../prototype-3-focus-zen/index.html" class="${currentId === 3 ? 'active' : ''}">3. Focus Zen</a>
        <a href="../prototype-4-graph-canvas/index.html" class="${currentId === 4 ? 'active' : ''}">4. Graph Canvas</a>
        <a href="../prototype-5-command-hub/index.html" class="${currentId === 5 ? 'active' : ''}">5. Command HUD</a>
        <a href="../prototype-6-command-graph/index.html" class="${currentId === 6 ? 'active' : ''}" style="color:var(--accent); font-weight:600;">★ 6. Command + 2D Graph (10 Themes)</a>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <select id="prototype-persona-select" class="input-text" style="padding:2px 8px; font-size:12px; width:auto;" onchange="SkyeUtils.switchPersona(this.value)">
          <option value="user_lark" ${window.SKYE_DATA?.currentUser?.id === 'user_lark' ? 'selected' : ''}>👤 Lark (Admin)</option>
          <option value="user_theresa" ${window.SKYE_DATA?.currentUser?.id === 'user_theresa' ? 'selected' : ''}>👤 Theresa (Trusted)</option>
          <option value="user_jackie" ${window.SKYE_DATA?.currentUser?.id === 'user_jackie' ? 'selected' : ''}>👤 Jackie (Trusted)</option>
          <option value="user_guest_01" ${window.SKYE_DATA?.currentUser?.id === 'user_guest_01' ? 'selected' : ''}>👤 Guest</option>
        </select>
        <button class="btn btn-ghost" style="padding:2px 6px; font-size:12px;" onclick="SkyeUtils.toggleTheme()" title="Toggle Light/Dark Theme">🌓</button>
      </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  },

  switchPersona(userId) {
    const user = window.SKYE_DATA.users.find(u => u.id === userId) || window.SKYE_DATA.users[0];
    window.SKYE_DATA.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.name[0],
      tier: user.role === 'admin' ? 'Admin' : user.role === 'trusted' ? 'Trusted Collaborator' : 'Guest'
    };
    SkyeUtils.showToast(`Switched active persona to ${user.name} (${user.role.toUpperCase()})`, "info");
    // Trigger any registered persona listeners
    if (window.onPersonaChange) {
      window.onPersonaChange(window.SKYE_DATA.currentUser);
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    SkyeUtils.showToast(`Theme switched to ${next.toUpperCase()}`, "info");
  }
};

if (typeof window !== 'undefined') {
  window.SkyeUtils = SkyeUtils;
}
