# RavenNest Skye v3 — Official Web UI (Svelte + Flowbite)

This directory is the **official, production-ready web application** for **Skye v3**, built using **Svelte + Flowbite Svelte + Tailwind CSS** based on the chosen design from `ui_mock` and Prototype 6 (Command Hub & 2D Thought Graph).

---

## ⚡ Key Features

### 1. 🎨 10 Curated Themes (5 Dark + 5 Light)
Instant theme switching is accessible via the top-right header dropdown or via the `/theme [name]` CLI command. Themes automatically synchronize with Tailwind's `.dark` class mode:

| Mode | Theme Name | Palette Description |
|:---|:---|:---|
| **🌙 Dark 1** | **Raven Charcoal & Amber (Canonical)** | Deep charcoal (`#1a1a1c`, `#222226`) with warm scholarly gold (`#c8a84e`) and emerald user bubbles (`#2d4a3e`). |
| **🌙 Dark 2** | **Obsidian & Electric Copper** | Ultra-dark obsidian (`#0f0f12`) with metallic terracotta/copper (`#e07a5f`). |
| **🌙 Dark 3** | **Midnight Sapphire & Celestial Gold** | Twilight navy (`#0c101a`, `#131929`) with celestial gold (`#d4af37`). |
| **🌙 Dark 4** | **Scholarly Forest & Ochre** | Shadowy pine (`#101713`, `#17221c`) with warm ochre amber (`#d99b26`). |
| **🌙 Dark 5** | **Ethereal Amethyst & Silver Smoke** | Slate-aubergine (`#15131a`) with antique silver & platinum (`#d8d4cf`). |
| **☀️ Light 1** | **Parchment & Warm Gold (Canonical Light)** | Soft warm ivory parchment (`#fafaf8`) with burnished gold (`#8b6914`). |
| **☀️ Light 2** | **Nordic Fog & Ochre** | Crisp cool mist (`#f4f6f8`) with Scandinavian amber/ochre (`#b07d1e`). |
| **☀️ Light 3** | **Alabaster & Terracotta Earth** | Warm alabaster stone (`#fbf8f5`) with Mediterranean terracotta (`#a8523b`). |
| **☀️ Light 4** | **Botanical Herbarium & Bronze** | Tea-tinted botanical cream (`#f6f8f4`) with antique bronze (`#786438`). |
| **☀️ Light 5** | **Classic Manuscript & Ink Gold** | High-contrast editorial linen (`#fdfbf7`) with deep manuscript ink gold (`#7c5e10`). |

---

### 2. 🕸️ '2D Thought Graph' Tab (Per Conversation)
- **Dynamic Topology Mapping**: Switching conversations automatically loads and lays out the reasoning graph for that exact thread.
- **Draggable Cognitive Cards**: Move node cards freely across the canvas; SVG bezier connector curves recompute coordinates in real time.
- **Node Inspector Drawer**: Click any node to inspect details and click **"Jump to Conversation Turn →"** to navigate directly to the message in the Research Console.
- **`+ Fork Hypothesis Node`**: Interactively spawn speculative branches onto the canvas.
- **Canvas HUD Controls**: Zoom In, Zoom Out, and Reset Pan/Zoom controls.

---

### 3. 💬 Research Console & Context Panel
- **Multi-Turn Chat**: Typewriter streaming simulation with stop button, display LaTeX math blocks, and inline math.
- **Interactive Code Blocks**: Code syntax formatting, filename headers, and 1-click clipboard copy.
- **320px Collapsible Right Panel**:
  - **Sources**: arXiv citations, snippets, external domain links.
  - **Tools**: Live MCP tool execution traces (`bash_exec`, `file_read`, `web_fetch`) with arguments, outputs, and latencies.
  - **Memory**: Persistent indexed cognitive memory items.
  - **Session**: Token usage meters, model selectors, and session telemetry.
- **Slash Commands**: `/theme [name]`, `/model [name]`, `/status`, `/clear`, etc.

---

### 4. 🛡️ Admin Command Deck & Telemetry HUD
- **Top Telemetry HUD**: Monitors `EBv3 Daemon (PID 1279218)`, `Skye Engine Port (:8765)`, `MCP 47 tools (18ms)`, `Neon Postgres (24ms)`, CPU & RAM gauges, and persona switcher.
- **User Directory**: Search, role tier badges, and status toggle (Active/Disabled).
- **Cryptographic Activation Key Vault**: Generates and validates keys matching `RN-SKYE-510510-XXXXXX-XXXXXX` (constant $510510 = 2 \times 3 \times 5 \times 7 \times 11 \times 13 \times 17$).
- **Audit Logs**: Filterable log records (`ALL`, `INFO`, `WARN`, `AUTH`).
- **Live WebSocket Stream**: Protocol frame inspector (`ws://localhost:8000/api/v1/skye/stream`).

---

## 🚀 Running the Official UI

### Start Development Server
```bash
cd /home/ubuntu/skye_v3_ui/ui
npm run dev
```

### Build Production Bundle
```bash
cd /home/ubuntu/skye_v3_ui/ui
npm run build
npm run preview
```
