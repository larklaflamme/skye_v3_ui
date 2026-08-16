# Skye v3 — Svelte UI Prototypes (5 Framework Variations & 10 Themes)

This directory contains **5 distinct Svelte implementations** based on **Prototype 6 (Command Hub & 2D Thought Graph)** for Skye v3.

Each prototype features:
- **10 Curated Themes** (5 Dark Themes + 5 Light Themes) with instant switching.
- A dedicated **'2D Thought Graph'** tab per conversation with interactive draggable nodes, dynamic SVG bezier connectors, node inspector, and hypothesis branching (`+ Fork Hypothesis Node`).
- **Research Console** with multi-turn messages, math rendering, and code syntax highlighting.
- **Top Telemetry HUD** (EBv3 Daemon PID 1279218, Skye Engine :8765, MCP 47 tools 18ms, Postgres Neon, CPU & RAM metrics).
- **Admin Command Deck** with user directory and cryptographic activation key generation (`RN-SKYE-510510-XXXXXX-XXXXXX`).
- **Live WebSocket Frames** stream monitor.

---

## The 5 Svelte Prototype Implementations

| # | Prototype | Stack / Library | Key Focus & Philosophy |
|---|---|---|---|
| **1** | **Svelte + IBM Carbon** | [`carbon-components-svelte`](https://svelte.carbondesignsystem.com/) + `carbon-icons-svelte` | Enterprise-grade structured design system with Carbon headers, tags, tables, and modal dialogs. |
| **2** | **Svelte + Packages** | [`svelte-packages`](https://svelte.dev/packages) + [`@lucide/svelte`](https://lucide.dev) | Rich community ecosystem widgets, Lucide iconography, flexible search filter, and reactive drawers. |
| **3** | **Svelte + Flowbite** | [`flowbite-svelte`](https://flowbite-svelte.com/) + `flowbite-svelte-icons` | Tailwind-inspired card components, status indicators, badges, and modern responsive viewports. |
| **4** | **Svelte + SVAR** | [`@svar-ui/svelte-core`](https://svar.dev/svelte/) / `wx-svelte-core` | High-density core widgets, structured tree sidebars, toolbar docks, and compact administration tables. |
| **5** | **Pure Svelte (Svelte only)** | **Svelte 5 Runes & Custom Transitions (Zero Ext Libs)** | Ultra-lightweight (0 dependencies), maximum performance, fine-grained Svelte transitions (`fade`, `fly`, `scale`), bespoke canvas. |

---

## 🎨 10 Curated Themes (5 Dark + 5 Light)

### 🌙 Dark Themes (5)
1. **Raven Charcoal & Amber (Canonical)** — `#1a1a1c` / `#222226` with warm amber `#c8a84e` and emerald `#2d4a3e`.
2. **Obsidian & Electric Copper** — `#0f0f12` with terracotta copper `#e07a5f`.
3. **Midnight Sapphire & Celestial Gold** — `#0c101a` / `#131929` with celestial gold `#d4af37`.
4. **Scholarly Forest & Ochre** — `#101713` / `#17221c` with warm ochre `#d99b26`.
5. **Ethereal Amethyst & Silver Smoke** — `#15131a` with antique platinum `#d8d4cf`.

### ☀️ Light Themes (5)
6. **Parchment & Warm Gold (Canonical Light)** — Soft ivory `#fafaf8` with antique gold `#8b6914`.
7. **Nordic Fog & Ochre** — Paper mist `#f4f6f8` with Scandinavian ochre `#b07d1e`.
8. **Alabaster & Terracotta Earth** — Warm alabaster `#fbf8f5` with Mediterranean terracotta `#a8523b`.
9. **Botanical Herbarium & Bronze** — Tea-tinted cream `#f6f8f4` with antique bronze `#786438`.
10. **Classic Manuscript & Ink Gold** — Editorial linen `#fdfbf7` with deep manuscript ink gold `#7c5e10`.

---

## Running and Previewing

### Development Server
```bash
cd /home/ubuntu/skye_v3_ui/ui_mock
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
