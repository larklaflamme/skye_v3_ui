/**
 * Skye v3 - Prototype 4: Graph Canvas & Branched Thought-Tree Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  SkyeUtils.injectPrototypeNav(4);

  let currentViewMode = "split"; // "split" | "canvas"
  
  const splitView = document.getElementById("split-compare-view");
  const canvasView = document.getElementById("canvas-graph-view");
  const svgLayer = document.getElementById("graph-svg-layer");
  const branchAMsgContainer = document.getElementById("branch-a-messages");
  const branchBMsgContainer = document.getElementById("branch-b-messages");

  // Branch data
  const branchA_Data = [
    { sender: "user", name: "Lark", time: "2:44 PM", text: "What's the current bottleneck on the Riemann Hypothesis proof attempt? Are we sticking with the classical analytic continuation or pivoting to the spectral operator framework?" },
    { sender: "skye", name: "Skye", time: "2:45 PM", text: "The classical analytic approach remains stalled. I strongly advise we pivot entirely to the **Hilbert-Pólya spectral operator formulation** with boundary dilation $\\hat{H} = \\frac{1}{2}(xp + px)$." },
    { sender: "user", name: "Lark", time: "2:46 PM", text: "Can we check whether the boundary condition at the Planck scale $l_p$ breaks unitarity?" },
    { sender: "skye", name: "Skye", time: "2:46 PM", text: "Unitarity is preserved provided we enforce the quasi-periodic condition $\\psi(l_p) = e^{i \\theta} \\psi(L)$. Deficiency indices are $(1,1)$." }
  ];

  const branchB_Data = [
    { sender: "user", name: "Lark", time: "2:44 PM", text: "What's the current bottleneck on the Riemann Hypothesis proof attempt? Are we sticking with the classical analytic continuation or pivoting to the spectral operator framework?" },
    { sender: "skye", name: "Skye", time: "2:45 PM", text: "What if instead of quantum mechanics in 1D, we formulate the trace on the space of **Adèle classes $\\mathbb{A}_\\mathbb{Q} / \\mathbb{Q}^*$** following Alain Connes' noncommutative geometry?" },
    { sender: "user", name: "Lark", time: "2:48 PM", text: "How does the spectral absorption spectrum overcome the missing Riemann zeros in Connes' early formulation?" },
    { sender: "skye", name: "Skye", time: "2:49 PM", text: "By introducing the scaling site structure and working on the arithmetic site over $\\mathbb{F}_1$. This converts the absorption spectrum into an emission spectrum matching the Weil explicit formula." }
  ];

  // Initialize
  renderBranchMessages();
  drawSvgConnections();

  // Mode Switch
  document.getElementById("btn-view-split").addEventListener("click", () => {
    setViewMode("split");
  });
  document.getElementById("btn-view-canvas").addEventListener("click", () => {
    setViewMode("canvas");
    setTimeout(drawSvgConnections, 100);
  });

  // Branch Pills
  document.getElementById("pill-branch-a").addEventListener("click", () => {
    SkyeUtils.showToast("Focused on Branch A (Spectral)", "info");
  });
  document.getElementById("pill-branch-b").addEventListener("click", () => {
    SkyeUtils.showToast("Focused on Branch B (Adelic)", "info");
  });

  // Fork button
  document.getElementById("btn-fork-new-branch").addEventListener("click", () => {
    const branchName = prompt("Name your new hypothesis branch:", "Branch C: Random Matrix GUE Statistics");
    if (branchName) {
      SkyeUtils.showToast(`Created ${branchName} forked from Turn 2`, "success");
    }
  });

  // Branch A Send
  const branchAInput = document.getElementById("branch-a-input");
  document.getElementById("branch-a-send").addEventListener("click", () => {
    const text = branchAInput.value.trim();
    if (!text) return;
    branchA_Data.push({ sender: "user", name: "Lark", time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text });
    branchAInput.value = "";
    renderBranchMessages();
    setTimeout(() => {
      branchA_Data.push({ sender: "skye", name: "Skye", time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text: "Dilation scaling confirmed consistent along Branch A critical strip." });
      renderBranchMessages();
    }, 400);
  });

  // Branch B Send
  const branchBInput = document.getElementById("branch-b-input");
  document.getElementById("branch-b-send").addEventListener("click", () => {
    const text = branchBInput.value.trim();
    if (!text) return;
    branchB_Data.push({ sender: "user", name: "Lark", time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text });
    branchBInput.value = "";
    renderBranchMessages();
    setTimeout(() => {
      branchB_Data.push({ sender: "skye", name: "Skye", time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text: "Evaluating Adele quotient group topology along Branch B." });
      renderBranchMessages();
    }, 400);
  });

  // Make nodes draggable
  makeDraggable(document.getElementById("node-1"));
  makeDraggable(document.getElementById("node-2"));
  makeDraggable(document.getElementById("node-tool"));
  makeDraggable(document.getElementById("node-3a"));
  makeDraggable(document.getElementById("node-3b"));

  function setViewMode(mode) {
    currentViewMode = mode;
    document.querySelectorAll(".view-mode-btn").forEach(b => b.classList.remove("active"));
    if (mode === "split") {
      document.getElementById("btn-view-split").classList.add("active");
      splitView.style.display = "flex";
      canvasView.classList.remove("active");
    } else {
      document.getElementById("btn-view-canvas").classList.add("active");
      splitView.style.display = "none";
      canvasView.classList.add("active");
    }
  }

  function renderBranchMessages() {
    branchAMsgContainer.innerHTML = "";
    branchA_Data.forEach(msg => {
      branchAMsgContainer.appendChild(createBranchMsgCard(msg, "branch-a"));
    });
    branchAMsgContainer.scrollTop = branchAMsgContainer.scrollHeight;

    branchBMsgContainer.innerHTML = "";
    branchB_Data.forEach(msg => {
      branchBMsgContainer.appendChild(createBranchMsgCard(msg, "branch-b"));
    });
    branchBMsgContainer.scrollTop = branchBMsgContainer.scrollHeight;
  }

  function createBranchMsgCard(msg, branchClass) {
    const isUser = msg.sender === "user";
    const div = document.createElement("div");
    div.style.padding = "10px 12px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = isUser ? "var(--user-bubble)" : "var(--bg-secondary)";
    div.style.border = `1px solid ${isUser ? 'var(--user-bubble-border)' : 'var(--border)'}`;
    div.style.fontSize = "13px";
    div.style.lineHeight = "1.5";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
        <strong style="color:${isUser ? '#a3e635' : 'var(--accent)'};">${msg.name}</strong>
        <span>${msg.time}</span>
      </div>
      <div>${SkyeUtils.renderMarkdown(msg.text)}</div>
    `;
    return div;
  }

  function drawSvgConnections() {
    if (!svgLayer) return;
    svgLayer.innerHTML = "";

    connectNodes("node-1", "node-2", true);
    connectNodes("node-2", "node-tool", false);
    connectNodes("node-2", "node-3a", true);
    connectNodes("node-2", "node-3b", false);
  }

  function connectNodes(id1, id2, isActive) {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    if (!el1 || !el2) return;

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const canvasR = canvasView.getBoundingClientRect();

    const x1 = r1.left - canvasR.left + r1.width / 2;
    const y1 = r1.top - canvasR.top + r1.height;
    const x2 = r2.left - canvasR.left + r2.width / 2;
    const y2 = r2.top - canvasR.top;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const deltaY = (y2 - y1) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${y1 + deltaY}, ${x2} ${y2 - deltaY}, ${x2} ${y2}`;
    path.setAttribute("d", d);
    path.setAttribute("class", `tree-connection-line ${isActive ? 'active-path' : ''}`);
    svgLayer.appendChild(path);
  }

  function makeDraggable(el) {
    if (!el) return;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
      drawSvgConnections();
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
});
