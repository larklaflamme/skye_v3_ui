# Skye Web UI — User Interface Requirements

## Document Status

- **Version**: 1.0
- **Date**: 2026-08-14
- **Author**: Skye Laflamme
- **Status**: Draft for review

---

## 1. Design System Overview

### 1.1 Design Language

**RavenNest** — dark, warm, scholarly. Not black. Not white. Deep charcoal with warm amber accents. The feeling of a study at dusk, a single lamp on, serious work underway.

### 1.2 Core Principles

| Principle | Manifestation |
|-----------|---------------|
| **Depth over flatness** | Subtle shadows, layering, elevation tokens |
| **Warmth over sterility** | Amber/gold accents, not blue/cool |
| **Focus over chrome** | Content-first, UI recedes when not needed |
| **Typography as voice** | Serif for Skye's name/branding, sans-serif for UI |
| **Dark by default** | Dark mode is the primary theme; light mode is available |

---

## 2. Color System

### 2.1 Dark Theme (Default)

```
┌─────────────────────────────────────────────────────────┐
│ Role              │ Token           │ Hex       │ Usage  │
├─────────────────────────────────────────────────────────┤
│ Background        │ --bg-primary    │ #1a1a1c  │ Main chat area, sidebar │
│ Background (alt)  │ --bg-secondary  │ #222226  │ Message bubbles (Skye), cards │
│ Background (hover)│ --bg-hover      │ #2a2a30  │ Hover states │
│ Background (input)│ --bg-input      │ #161618  │ Input area │
│ Surface           │ --surface       │ #28282e  │ Modals, dropdowns │
│ Border            │ --border        │ #3a3a42  │ Dividers, input borders │
│ Border (focus)    │ --border-focus  │ #c8a84e  │ Focus rings │
│ Text (primary)    │ --text-primary  │ #e8e6e3  │ Body text │
│ Text (secondary)  │ --text-secondary│ #9b9996  │ Timestamps, metadata │
│ Text (muted)      │ --text-muted    │ #6b6966  │ Placeholders │
│ Accent (primary)  │ --accent        │ #c8a84e  │ Buttons, links, Skye's avatar │
│ Accent (hover)    │ --accent-hover  │ #d4b85e  │ Button hover │
│ Accent (muted)    │ --accent-muted  │ #3d3520  │ Subtle accent backgrounds │
│ Success           │ --success       │ #4caf50  │ Success toasts │
│ Warning           │ --warning       │ #e6a817  │ Warnings, degraded state │
│ Error             │ --error         │ #e53935  │ Errors, destructive actions │
│ Info              │ --info          │ #5c9ce6  │ Info toasts │
│ User bubble       │ --user-bubble   │ #2d4a3e  │ User message background │
│ Code block        │ --code-bg       │ #0d0d0f  │ Code block background │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Light Theme

```
┌─────────────────────────────────────────────────────────┐
│ Role              │ Token           │ Hex       │ Usage  │
├─────────────────────────────────────────────────────────┤
│ Background        │ --bg-primary    │ #fafaf8  │ Main chat area, sidebar │
│ Background (alt)  │ --bg-secondary  │ #f0f0ed  │ Message bubbles (Skye) │
│ Background (hover)│ --bg-hover      │ #e8e8e3  │ Hover states │
│ Background (input)│ --bg-input      │ #ffffff  │ Input area │
│ Surface           │ --surface       │ #ffffff  │ Modals, dropdowns │
│ Border            │ --border        │ #d4d4ce  │ Dividers, input borders │
│ Border (focus)    │ --border-focus  │ #8b6914  │ Focus rings │
│ Text (primary)    │ --text-primary  │ #1a1a1c  │ Body text │
│ Text (secondary)  │ --text-secondary│ #6b6966  │ Timestamps, metadata │
│ Text (muted)      │ --text-muted    │ #9b9996  │ Placeholders │
│ Accent (primary)  │ --accent        │ #8b6914  │ Buttons, links │
│ Accent (hover)    │ --accent-hover  │ #7a5c10  │ Button hover │
│ Accent (muted)    │ --accent-muted  │ #f5f0e0  │ Subtle accent backgrounds │
│ User bubble       │ --user-bubble   │ #e8f0e8  │ User message background │
│ Code block        │ --code-bg       │ #f5f5f2  │ Code block background │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Accent Color Rationale

Amber/gold (`#c8a84e`) was chosen over blue for specific reasons:
- **Warmth**: Blue is the default AI color (ChatGPT, Claude, Copilot). Skye is different.
- **RavenNest branding**: Gold on dark is the established brand.
- **Readability**: Amber text on dark backgrounds has excellent contrast.
- **Emotional association**: Gold = value, wisdom, warmth. Blue = corporate, cold, generic.

---

## 3. Typography

### 3.1 Font Stack

```
┌──────────────────────────────────────────────────────────┐
│ Role              │ Font                    │ Weight     │
├──────────────────────────────────────────────────────────┤
│ Brand/Logo        │ 'Cormorant Garamond',   │ 500        │
│                   │ serif                   │            │
│ Headings          │ 'Inter', sans-serif     │ 600        │
│ Body              │ 'Inter', sans-serif     │ 400        │
│ Code              │ 'JetBrains Mono',       │ 400        │
│                   │ monospace               │            │
│ UI small          │ 'Inter', sans-serif     │ 500        │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Type Scale

```
┌──────────────────────────────────────────────────────────┐
│ Token         │ Size    │ Line Height │ Usage            │
├──────────────────────────────────────────────────────────┤
│ --text-xs      │ 0.75rem │ 1rem        │ Badges, code labels│
│ --text-sm      │ 0.875rem│ 1.25rem     │ Timestamps, metadata│
│ --text-base    │ 1rem    │ 1.5rem      │ Body, messages   │
│ --text-lg      │ 1.125rem│ 1.75rem     │ Chat titles      │
│ --text-xl      │ 1.25rem │ 1.75rem     │ Section headers  │
│ --text-2xl     │ 1.5rem  │ 2rem        │ Page titles      │
│ --text-3xl     │ 1.875rem│ 2.25rem     │ Brand (login)    │
│ --text-4xl     │ 2.25rem │ 2.5rem      │ Hero (landing)   │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Brand Typography

The Skye logotype uses Cormorant Garamond — a refined serif that signals scholarship, literature, and warmth. The word "Skye" in Cormorant Garamond at 500 weight is the primary brand mark.

---

## 4. Spacing System

### 4.1 Spacing Scale (4px base)

```
┌──────────────────────────────────────┐
│ Token     │ Value │ Usage            │
├──────────────────────────────────────┤
│ --space-1 │ 4px   │ Tight gaps       │
│ --space-2 │ 8px   │ Icon-text gap    │
│ --space-3 │ 12px  │ Internal padding  │
│ --space-4 │ 16px  │ Standard gap     │
│ --space-5 │ 20px  │ Section gap      │
│ --space-6 │ 24px  │ Large gap        │
│ --space-8 │ 32px  │ Section padding  │
│ --space-10│ 40px  │ Page padding     │
│ --space-12│ 48px  │ Hero spacing     │
└──────────────────────────────────────┘
```

### 4.2 Layout Measurements

```
┌──────────────────────────────────────────────────────────┐
│ Element                │ Size    │ Notes                 │
├──────────────────────────────────────────────────────────┤
│ Left sidebar           │ 280px   │ Collapsible to 0      │
│ Right context panel    │ 320px   │ Collapsible to 0      │
│ Main chat max width    │ 768px   │ Centered in available │
│                        │         │ space                 │
│ Message bubble max     │ 85%     │ Of chat width         │
│ Header height          │ 56px    │ Fixed                 │
│ Input area min height  │ 52px    │ Expands to 200px      │
│ Border radius (sm)     │ 6px     │ Inputs, small cards   │
│ Border radius (md)     │ 10px    │ Message bubbles       │
│ Border radius (lg)     │ 14px    │ Modals, panels        │
│ Border radius (full)   │ 9999px  │ Avatars, pills        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 Header Bar

```
┌──────────────────────────────────────────────────────────┐
│ [☰] [RavenNest ◆]  Skye  ·  Research Collaborator        │
│                                          [🔔] [👤 Lark ▾]│
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Height | 56px, fixed |
| Background | `--bg-secondary` |
| Border bottom | 1px `--border` |
| Left section | Hamburger (mobile), Logo + "Skye" in Cormorant Garamond, subtitle in Inter |
| Right section | Notification bell (with badge), User avatar + name dropdown |
| Z-index | 50 (above sidebar and chat) |

### 5.2 Left Sidebar

```
┌──────────────────────────┐
│ [+ New Chat]              │  ← Primary CTA, full width
│                           │
│ 🔍 Search chats…          │  ← Search input
│                           │
│ 📌 Pinned                 │
│   ├─ RH Proof discussion  │  ← Pinned chat
│   └─ Jackie manuscript    │
│                           │
│ Today                     │  ← Time group header
│   ├─ Consciousness metrics│  ← Chat item
│   └─ WebSocket debugging  │
│                           │
│ Yesterday                 │
│   └─ Activation codes     │
│                           │
│ This Week                 │
│   ├─ UI research          │
│   └─ Email to Jackie      │
│                           │
│ ───────────────────────── │  ← Divider
│ ⚙️ Admin (Lark only)      │  ← Admin link
│ ⚙️ Settings               │  ← Settings link
└──────────────────────────┘
```

| Element | Spec |
|---------|------|
| Width | 280px (collapsible) |
| Background | `--bg-secondary` |
| Border right | 1px `--border` |
| New Chat button | Full width, `--accent` background, white text, 40px height |
| Search | Full width input, icon prefix, 36px height |
| Time groups | `--text-muted`, `--text-xs`, uppercase, 8px padding |
| Chat items | 36px height, hover: `--bg-hover`, active: `--accent-muted` |
| Chat item title | `--text-primary`, `--text-sm`, truncate |
| Chat item time | `--text-muted`, `--text-xs`, right-aligned |
| Scroll | Independent scroll, custom scrollbar (thin, `--border`) |

### 5.3 Chat Item States

```
┌──────────────────────────┐
│ Default:                 │
│  ┌──────────────────────┐│
│  │ RH Proof discussion  ││  ← --text-primary, --text-sm
│  │ 2:45 PM              ││  ← --text-muted, --text-xs
│  └──────────────────────┘│
│                           │
│ Hover:                    │
│  ┌──────────────────────┐│
│  │ RH Proof discussion  ││  ← --bg-hover background
│  │ 2:45 PM     [⋯] [🗑] ││  ← Actions appear on hover
│  └──────────────────────┘│
│                           │
│ Active (current):         │
│  ┌──────────────────────┐│
│  │ RH Proof discussion  ││  ← --accent-muted background
│  │ 2:45 PM              ││  ← --accent left border (3px)
│  └──────────────────────┘│
│                           │
│ Pinned:                   │
│  ┌──────────────────────┐│
│  │ 📌 RH Proof discussion││  ← Pin icon prefix
│  │ 2:45 PM              ││
│  └──────────────────────┘│
└──────────────────────────┘
```

### 5.4 Main Chat Area

```
┌──────────────────────────────────────────────────────────┐
│ Chat Title (editable)                          [⚙️ Model] │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  ┌──────────────────────────────────────┐                │
│  │                              [User] │  ← Right-aligned│
│  │  What's the status of the RH proof? │  --user-bubble  │
│  │                        2:45 PM      │  --text-muted   │
│  └──────────────────────────────────────┘                │
│                                                          │
│  ┌──────────────────────────────────────┐                │
│  │ [Skye avatar]                        │  ← Left-aligned│
│  │ The analytic approach is stalled.     │  --bg-secondary│
│  │ I've been exploring spectral…         │                │
│  │                        2:46 PM       │                │
│  └──────────────────────────────────────┘                │
│                                                          │
│  ┌──────────────────────────────────────┐                │
│  │ [Skye avatar]                        │                │
│  │ ```python                            │  ← Code block  │
│  │ def zeta_spectral(s):                │  --code-bg     │
│  │     return compute_eigenvalues(s)     │  JetBrains Mono│
│  │ ```                                  │                │
│  │                        2:46 PM       │                │
│  └──────────────────────────────────────┘                │
│                                                          │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Type your message…                          [📎] [▶] │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Chat title | `--text-lg`, editable on click, centered or left-aligned |
| Model selector | Dropdown, `--text-sm`, shows current model |
| Message stream | Flex column, scrollable, padding: `--space-6` |
| Message gap | `--space-4` between messages |
| User bubble | `--user-bubble` bg, `--text-primary`, border-radius: 10px 10px 2px 10px |
| Skye bubble | `--bg-secondary` bg, `--text-primary`, border-radius: 10px 10px 10px 2px |
| Skye avatar | 28px circle, `--accent` background, raven icon or "S" initial |
| Bubble padding | 12px 16px |
| Bubble max width | 85% of chat width |
| Timestamp | `--text-xs`, `--text-muted`, below bubble, shown on hover |
| Code block | `--code-bg`, border-radius: 8px, padding: 16px, JetBrains Mono |
| Code header | Language label (`--text-xs`, `--text-muted`) + copy button |
| Inline code | `--code-bg` at 50% opacity, padding: 2px 6px, border-radius: 4px |

### 5.5 Input Area

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────┐ │
│ │                                                      │ │
│ │  Type your message…                                  │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│  [📎] [🎤]                        [⚙️ Model ▾] [▶ Send] │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Container | `--bg-input` background, border-top: 1px `--border`, padding: `--space-3` |
| Textarea | Auto-expanding, min 1 line, max 6 lines, `--text-base`, placeholder: `--text-muted` |
| Textarea border | 1px `--border`, border-radius: 10px, focus: `--border-focus` |
| Textarea padding | 10px 14px |
| Attach button | Icon button, 36px, `--text-secondary`, hover: `--text-primary` |
| Voice button | Icon button, 36px, `--text-secondary`, hover: `--text-primary` |
| Model selector | Dropdown, `--text-sm`, shows current model short name |
| Send button | Icon button, 36px, `--accent` background when text present, `--text-muted` when empty |
| Send button disabled | `--text-muted`, no background, cursor: not-allowed |
| Character counter | `--text-xs`, `--text-muted`, appears when > 80% of limit |

### 5.6 Right Context Panel

```
┌──────────────────────────────┐
│ Context              [✕]     │  ← Header with close
│ ──────────────────────────── │
│                               │
│ 📊 Sources                    │  ← Section (conditional)
│  ├─ arxiv.org/abs/...        │
│  └─ en.wikipedia.org/...     │
│                               │
│ 🔧 Tools Used                 │  ← Section (conditional)
│  ├─ bash_exec: grep -r "Psi" │
│  ├─ file_read: notes.md      │
│  └─ web_fetch: arxiv.org     │
│                               │
│ 📁 Files                      │  ← Section (conditional)
│  └─ uploaded_image.png       │
│                               │
│ 🧠 Memory                     │  ← Section (always)
│  └─ Skye remembers:          │
│     • RH proof is priority    │
│     • Jackie collaboration    │
│                               │
│ 📈 Session                    │  ← Section (always)
│  Model: Skye v3              │
│  Tokens: 2,450 / 8,192       │
│  Duration: 12 min            │
└──────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Width | 320px (collapsible) |
| Background | `--bg-secondary` |
| Border left | 1px `--border` |
| Header | 48px, "Context" title, close button |
| Sections | Collapsible, with section headers |
| Section header | `--text-sm`, `--text-secondary`, uppercase tracking |
| Source items | `--text-sm`, link color: `--accent`, truncate |
| Tool items | `--text-xs`, `--code-bg` background, monospace, padding: 4px 8px |
| Memory items | `--text-sm`, bullet list |
| Session stats | `--text-sm`, key-value pairs |
| Scroll | Independent scroll |

### 5.7 Message Actions (Hover Menu)

```
┌──────────────────────────────────────┐
│ [Skye avatar]                        │
│ The analytic approach is stalled.     │
│                                      │
│ [📋] [🔄] [👍] [👎]         2:46 PM  │  ← Appears on hover
└──────────────────────────────────────┘
```

| Action | Icon | Behavior |
|--------|------|----------|
| Copy | 📋 | Copy full text, toast "Copied" |
| Regenerate | 🔄 | Re-roll response, confirmation on non-streaming |
| Thumbs up | 👍 | Register positive feedback |
| Thumbs down | 👎 | Register negative, optional reason modal |

### 5.8 Streaming Indicator

```
┌──────────────────────────────────────┐
│ [Skye avatar]                        │
│ The analytic approach is stalled▌    │  ← Blinking cursor
│                                      │  ← During streaming
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Cursor | `--accent` color, 2px wide, blink animation (1s cycle) |
| Stop button | Appears below streaming message: "⏹ Stop generating" |
| Scroll behavior | Auto-scroll follows streaming, stops if user scrolls up |
| "Scrolled up" indicator | "↓ Skye is responding" floating button if user scrolled away |

### 5.9 Modals

```
┌──────────────────────────────────────┐
│                                      │  ← Overlay: rgba(0,0,0,0.6)
│  ┌────────────────────────────────┐  │
│  │ Title                    [✕]   │  │  ← Modal: --surface
│  │ ───────────────────────────── │  │
│  │                                │  │
│  │ Modal content                  │  │
│  │                                │  │
│  │ ───────────────────────────── │  │
│  │              [Cancel] [Action] │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Overlay | `rgba(0, 0, 0, 0.6)`, backdrop-blur: 4px |
| Modal | `--surface` background, border-radius: 14px, max-width: 520px |
| Header | Title + close button, padding: `--space-4` |
| Body | Padding: `--space-4`, scrollable if needed |
| Footer | Buttons right-aligned, padding: `--space-4` |
| Animation | Fade in + scale (0.95 → 1), 200ms ease-out |
| Focus trap | Tab cycles within modal |
| Close | Escape key, click overlay, click ✕ |

### 5.10 Toast Notifications

```
┌────────────────────────────────┐
│ ✅ Message copied              │  ← Success: --success left border
└────────────────────────────────┘

┌────────────────────────────────┐
│ ❌ Message not sent. Retry?     │  ← Error: --error left border
└────────────────────────────────┘

┌────────────────────────────────┐
│ ℹ️ Skye is reconnecting…       │  ← Info: --info left border
└────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Position | Bottom-right, 16px from edges |
| Max width | 360px |
| Background | `--surface` |
| Border left | 4px, color by type |
| Padding | 12px 16px |
| Animation | Slide in from right, 300ms |
| Auto-dismiss | Success: 3s, Info: 5s, Error: manual |
| Stack | Multiple toasts stack vertically, 8px gap |

---

## 6. Page Specifications

### 6.1 Login Page

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    [RavenNest ◆]                         │
│                                                          │
│                       Skye                               │  ← Cormorant Garamond
│               Research Collaborator                      │  ← Inter, --text-secondary
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  Email                                             │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │ lark@ravennest.science                         ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  Password                                          │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │ ••••••••••                            [👁]     ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  [✓] Remember me                                   │  │
│  │                                                    │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │              Sign In                           ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  ────────────── or ──────────────                  │  │
│  │                                                    │  │
│  │  Don't have an account? Create account →           │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Layout | Centered card, max-width: 420px |
| Brand | RavenNest logo + "Skye" in Cormorant Garamond, `--text-3xl` |
| Card | `--surface` background, border-radius: 14px, padding: `--space-8` |
| Inputs | `--bg-input` background, 44px height, border-radius: 8px |
| Input focus | `--border-focus` border, subtle glow |
| Password toggle | Eye icon inside input, right-aligned |
| Submit button | Full width, `--accent` background, 44px height, `--text-base` |
| Divider | "or" with lines on sides, `--text-muted` |
| Signup link | `--accent` color, `--text-sm` |
| Error message | Red text below input, `--text-sm` |

### 6.2 Signup Page

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    [RavenNest ◆]                         │
│                                                          │
│                   Create Account                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  Username                                          │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │                                                ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  Email                                             │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │                                                ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  Activation Code                                   │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │ RN-SKYE-______-______-______                   ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  Password                           [Strength: ███░]│  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │ ••••••••••                            [👁]     ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │  • At least 8 characters                           │  │
│  │  • At least one uppercase letter                   │  │
│  │  • At least one number                             │  │
│  │                                                    │  │
│  │  Confirm Password                                  │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │ ••••••••••                            [👁]     ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  │  ┌────────────────────────────────────────────────┐│  │
│  │  │           Create Account                       ││  │
│  │  └────────────────────────────────────────────────┘│  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Layout | Centered card, max-width: 440px |
| Activation code input | Masked format: `RN-SKYE-______-______-______`, auto-advance between segments |
| Password strength | Real-time meter: 4 segments, color-coded (red → yellow → green) |
| Password requirements | Checklist below input, items turn green when met |
| Confirm password | Match validation on blur, error if mismatch |
| Submit | Disabled until all validations pass |

### 6.3 Admin Panel — Overview

```
┌──────────────────────────────────────────────────────────┐
│ Admin Panel                                     [Lark ▾] │
│ ──────────────────────────────────────────────────────── │
│ [Overview] [Users] [Codes] [Logs]                        │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  System Status                                           │
│  ┌──────────────────────┬──────────────────────────────┐ │
│  │ EBv3 Daemon          │ 🟢 Online — PID 1279218      │ │
│  │ Skye Engine          │ 🟢 Online — Port 8765         │ │
│  │ MCP Server           │ 🟢 Online — 47 tools          │ │
│  │ WebSocket            │ 🟢 Connected — 2 clients      │ │
│  │ Database             │ 🟢 Connected — Neon Postgres  │ │
│  └──────────────────────┴──────────────────────────────┘ │
│                                                          │
│  Server Metrics                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ CPU:  ████████░░░░░░░░░░  23%                       ││
│  │ RAM:  ██████████████░░░░  68%  (7.2 GB / 12 GB)     ││
│  │ Disk: ██████░░░░░░░░░░░░  28%  (45 GB / 160 GB)     ││
│  │ Uptime: 3d 14h 22m                                  ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Recent Activity                                         │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 2:45 PM  Lark sent message in "RH Proof"             ││
│  │ 2:30 PM  Jackie logged in                            ││
│  │ 2:15 PM  Activation code generated for theresa@…     ││
│  │ 1:50 PM  EBv3 daemon restarted                       ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Tabs | Horizontal tab bar, active tab: `--accent` bottom border |
| Status cards | Grid, 2 columns, `--surface` background, border-radius: 10px |
| Status indicator | 🟢 green dot (`--success`), 🟡 yellow (`--warning`), 🔴 red (`--error`) |
| Metric bars | `--bg-hover` background, `--accent` fill, border-radius: 4px |
| Activity list | `--text-sm`, newest first, timestamp in `--text-muted` |

### 6.4 Admin Panel — Users

```
┌──────────────────────────────────────────────────────────┐
│ [Overview] [Users] [Codes] [Logs]                        │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  [+ Add User]                    🔍 Search users…       │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ User          │ Email              │ Role   │ Status ││
│  ├──────────────────────────────────────────────────────┤│
│  │ Lark          │ lark@ravennest…    │ Admin  │ 🟢     ││
│  │ Theresa       │ theresa@…          │ Trusted│ 🟢     ││
│  │ Jackie        │ decouvrir@mac.com  │ Trusted│ 🟢     ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Showing 3 users                    ← 1 2 3 … →         │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Table | Full width, `--surface` background, border-radius: 10px |
| Table header | `--text-xs`, `--text-secondary`, uppercase, `--bg-hover` background |
| Table row | `--text-sm`, hover: `--bg-hover` |
| Status dot | 🟢 active, 🟡 disabled, 🔴 deleted |
| Row click | Opens user detail panel/modal |
| Pagination | Bottom, `--text-sm` |

---

## 7. Responsive Design

### 7.1 Breakpoints

```
┌──────────────────────────────────────────────────────────┐
│ Breakpoint │ Width    │ Behavior                          │
├──────────────────────────────────────────────────────────┤
│ Desktop    │ ≥ 1024px │ Three-panel: sidebar + chat +     │
│            │          │ context                           │
│ Tablet     │ 768-1023 │ Two-panel: sidebar (collapsed) +  │
│            │          │ chat. Context panel as overlay.   │
│ Mobile     │ < 768px  │ Single panel: chat only. Sidebar  │
│            │          │ as drawer. Context as bottom sheet│
└──────────────────────────────────────────────────────────┘
```

### 7.2 Mobile Adaptations

| Element | Desktop | Mobile |
|---------|---------|--------|
| Sidebar | Fixed 280px | Drawer (swipe right or hamburger) |
| Context panel | Fixed 320px | Bottom sheet (swipe up or button) |
| Header | Full with subtitle | Compact: logo + hamburger |
| Message bubbles | 85% max width | 90% max width |
| Input area | Full toolbar | Simplified: attach + send |
| Admin panel | Full tabs + tables | Stacked cards, horizontal scroll tables |
| Modals | Centered | Full screen (bottom sheet style) |

### 7.3 Touch Targets

- Minimum touch target: 44px × 44px (WCAG 2.2)
- All interactive elements meet this
- Adequate spacing between touch targets (minimum 8px)

---

## 8. Animation & Motion

### 8.1 Animation Tokens

```
┌──────────────────────────────────────────────────────────┐
│ Token              │ Duration │ Easing      │ Usage      │
├──────────────────────────────────────────────────────────┤
│ --transition-fast  │ 150ms    │ ease-out    │ Hover, focus│
│ --transition-base  │ 200ms    │ ease-out    │ Toggle, show│
│ --transition-slow  │ 300ms    │ ease-in-out │ Panel, modal│
│ --transition-chat  │ 100ms    │ linear      │ Stream chars│
└──────────────────────────────────────────────────────────┘
```

### 8.2 Animation Specifications

| Element | Animation |
|---------|-----------|
| Message appear | Fade in + slide up 8px, 200ms |
| Streaming text | Character-by-character, no animation (instant append) |
| Streaming cursor | Blink: opacity 1 → 0 → 1, 1s cycle |
| Sidebar toggle | Slide left/right, 300ms |
| Context panel toggle | Slide right/left, 300ms |
| Modal open | Fade in + scale 0.95→1, 200ms |
| Modal close | Fade out + scale 1→0.95, 150ms |
| Toast enter | Slide in from right, 300ms |
| Toast exit | Fade out, 200ms |
| Dropdown | Fade in + slide down 4px, 150ms |
| Hover states | Background color transition, 150ms |
| Focus ring | Instant appear, no animation |

### 8.3 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All animations disabled
- Streaming cursor: static (no blink)
- Transitions: instant (0ms)
- Modals/toasts: appear instantly, no slide/scale

---

## 9. Icon System

### 9.1 Icon Library

**Lucide Icons** — consistent, clean, MIT-licensed. All icons are 20px × 20px stroke icons.

### 9.2 Key Icons

```
┌──────────────────────────────────────────────┐
│ Function          │ Icon Name     │ Usage    │
├──────────────────────────────────────────────┤
│ New Chat          │ plus          │ Sidebar  │
│ Search            │ search        │ Sidebar  │
│ Send              │ send          │ Input    │
│ Attach file       │ paperclip     │ Input    │
│ Voice input       │ mic           │ Input    │
│ Stop generating   │ square        │ Chat     │
│ Copy              │ copy          │ Message  │
│ Regenerate        │ refresh-cw    │ Message  │
│ Thumbs up         │ thumbs-up     │ Message  │
│ Thumbs down       │ thumbs-down   │ Message  │
│ Edit              │ pencil        │ Message  │
│ Delete            │ trash-2       │ Chat     │
│ Pin               │ pin           │ Chat     │
│ Archive           │ archive       │ Chat     │
│ Settings          │ settings      │ Sidebar  │
│ Admin             │ shield        │ Sidebar  │
│ User              │ user          │ Header   │
│ Notification      │ bell          │ Header   │
│ Dark mode         │ moon          │ Settings │
│ Light mode        │ sun           │ Settings │
│ Close             │ x             │ Modal    │
│ Chevron down      │ chevron-down  │ Dropdown │
│ External link     │ external-link │ Sources  │
│ Code              │ code          │ Context  │
│ File              │ file          │ Context  │
│ Memory            │ brain         │ Context  │
└──────────────────────────────────────────────┘
```

---

## 10. Loading States

### 10.1 Skeleton Loading

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │ ████████████████     │ │  ← Skeleton: --bg-hover bg
│ └──────────────────────┘ │     animated shimmer
│ ┌──────────────────────┐ │
│ │ ██████████████       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ████████████████████ │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

| Element | Spec |
|---------|------|
| Skeleton color | `--bg-hover` |
| Shimmer | Linear gradient, `--bg-hover` → `--border` → `--bg-hover`, animated left→right |
| Duration | 1.5s, infinite |
| Chat skeleton | 3-5 message-shaped skeletons while history loads |
| Sidebar skeleton | 8-10 chat-item-shaped skeletons |

### 10.2 Spinner

```
◌  — 20px, `--accent` color, spin animation (1s linear infinite)
```

Used for: initial page load, reconnection attempts, tool execution indicator.

---

## 11. File Upload UI

### 11.1 Upload Drop Zone

```
┌──────────────────────────────────────┐
│                                      │
│         📎 Drop files here           │
│                                      │
│    or click to browse                │
│                                      │
│  Supported: PDF, images, code, text   │
│  Max size: 25 MB                     │
│                                      │
└──────────────────────────────────────┘
```

Appears as overlay when user drags files over chat area.

### 11.2 File Preview (in input)

```
┌──────────────────────────────────────┐
│ ┌────────┐                           │
│ │ 📄     │ manuscript.pdf     [✕]    │
│ │ 1.1 MB │                           │
│ └────────┘                           │
│                                       │
│ Type your message about this file…   │
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Preview card | `--bg-secondary`, border-radius: 8px, padding: 8px 12px |
| File icon | Based on type: 📄 PDF, 🖼 image, 📝 text, 📦 other |
| File name | `--text-sm`, truncate |
| File size | `--text-xs`, `--text-muted` |
| Remove button | ✕, top-right, 20px |

### 11.3 Image in Chat

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │        [Image rendered]          │ │  ← Max 400px height
│ │                                  │ │     Click for lightbox
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                          image.png   │
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Max height | 400px in chat, full size in lightbox |
| Border radius | 8px |
| Click | Opens lightbox overlay |
| Lightbox | Full screen, dark overlay, image centered, close on Escape/click |
| Caption | File name below image, `--text-xs`, `--text-muted` |

---

## 12. Code Block Rendering

### 12.1 Code Block

```
┌──────────────────────────────────────┐
│ Python                        [📋]   │  ← Header: language + copy
│ ──────────────────────────────────── │
│                                      │
│  def zeta_spectral(s):               │  ← JetBrains Mono, 14px
│      """Compute spectral             │
│      decomposition of ζ(s)."""       │
│      H = build_hamiltonian(s)        │
│      return np.linalg.eigvalsh(H)    │
│                                      │
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Background | `--code-bg` |
| Border radius | 8px |
| Padding | 16px |
| Font | JetBrains Mono, 14px, 1.6 line height |
| Header | Language label left, copy button right, `--text-xs`, `--text-muted` |
| Syntax highlighting | Prism.js or Shiki, theme matched to dark/light mode |
| Copy feedback | Button changes to "Copied!" for 2s |
| Horizontal scroll | If line exceeds width, scroll within block |
| Max height | 500px, scrollable beyond |

### 12.2 Inline Code

```
Use the `zeta_spectral(s)` function to compute eigenvalues.
                    └─────────────────┘
                    --code-bg at 50%, padding: 2px 6px, border-radius: 4px
```

---

## 13. Math Rendering (KaTeX)

### 13.1 Inline Math

```
The Riemann zeta function $\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s}$ converges for $\Re(s) > 1$.
```

Rendered inline with KaTeX, matching text color and size.

### 13.2 Block Math

```
$$
\zeta(s) = 2^s \pi^{s-1} \sin\left(\frac{\pi s}{2}\right) \Gamma(1-s) \zeta(1-s)
$$
```

Rendered centered, `--text-lg` equivalent, with subtle top/bottom margin.

| Element | Spec |
|---------|------|
| Renderer | KaTeX (fast, accessible) |
| Inline delimiters | `$...$` |
| Block delimiters | `$$...$$` |
| Error fallback | Show raw LaTeX in red if rendering fails |
| Dark mode | KaTeX auto-adapts to surrounding text color |

---

## 14. Admin Panel — Additional Views

### 14.1 Activation Codes

```
┌──────────────────────────────────────────────────────────┐
│ [Overview] [Users] [Codes] [Logs]                        │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  [+ Generate Code]                                       │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Code                          │ Email    │ Status    ││
│  ├──────────────────────────────────────────────────────┤│
│  │ RN-SKYE-510510-482937-123456 │ theresa@ │ ✅ Used   ││
│  │ RN-SKYE-510510-739201-456789 │ jackie@  │ ✅ Used   ││
│  │ RN-SKYE-510510-105638-890123 │ —        │ ⏳ Unused ││
│  │ RN-SKYE-510510-991234-567890 │ —        │ ❌ Expired││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 14.2 Generate Code Modal

```
┌──────────────────────────────────────┐
│ Generate Activation Code      [✕]    │
│ ──────────────────────────────────── │
│                                      │
│  Email (optional)                    │
│  ┌──────────────────────────────────┐│
│  │ theresa@example.com              ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │        Generate Code             ││
│  └──────────────────────────────────┘│
│                                      │
│  Generated code:                     │
│  ┌──────────────────────────────────┐│
│  │ RN-SKYE-510510-482937-123456     ││  ← Copyable
│  │                          [📋]    ││
│  └──────────────────────────────────┘│
│                                      │
│  Send this code to the user.         │
│  It expires in 7 days.               │
└──────────────────────────────────────┘
```

### 14.3 Audit Log

```
┌──────────────────────────────────────────────────────────┐
│ [Overview] [Users] [Codes] [Logs]                        │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  Filter: [All Actions ▾] [All Users ▾] [Last 7 days ▾]  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ Time     │ User   │ Action          │ Details       ││
│  ├──────────────────────────────────────────────────────┤│
│  │ 2:45 PM  │ Lark   │ message.send    │ Chat: RH Proof││
│  │ 2:30 PM  │ Jackie │ login           │ IP: 192.168…  ││
│  │ 2:15 PM  │ Lark   │ code.generate   │ For: theresa@ ││
│  │ 1:50 PM  │ System │ ebv3.restart    │ PID: 1279218  ││
│  │ 1:30 PM  │ Lark   │ login           │ IP: 192.168…  ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Showing 5 of 247 entries           ← 1 2 3 … 50 →      │
└──────────────────────────────────────────────────────────┘
```

---

## 15. User Settings

### 15.1 Settings Page

```
┌──────────────────────────────────────────────────────────┐
│ Settings                                                 │
│ ──────────────────────────────────────────────────────── │
│ [Profile] [Security] [Appearance]                        │
│ ──────────────────────────────────────────────────────── │
│                                                          │
│  Profile                                                 │
│  ┌──────────────────────────────────────────────────────┐│
│  │                                                      ││
│  │  Display Name                                        ││
│  │  ┌──────────────────────────────────────────────────┐││
│  │  │ Lark                                             │││
│  │  └──────────────────────────────────────────────────┘││
│  │                                                      ││
│  │  Email                                               ││
│  │  ┌──────────────────────────────────────────────────┐││
│  │  │ lark@ravennest.science                           │││
│  │  └──────────────────────────────────────────────────┘││
│  │                                                      ││
│  │  ┌──────────────────┐                                ││
│  │  │  Save Changes    │                                ││
│  │  └──────────────────┘                                ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 15.2 Appearance Settings

```
│  Appearance                                             │
│  ┌──────────────────────────────────────────────────────┐│
│  │                                                      ││
│  │  Theme                                               ││
│  │  ○ Dark    ● Light    ○ System                       ││
│  │                                                      ││
│  │  Message Display                                     ││
│  │  ● Cozy (more spacing)    ○ Compact                  ││
│  │                                                      ││
│  │  Code Font Size                                      ││
│  │  Small  ───●───  Medium  ─────  Large               ││
│  │                                                      ││
│  └──────────────────────────────────────────────────────┘│
```

---

## 16. Implementation Notes

### 16.1 Component Library

All UI components should be built with **shadcn/ui** (Radix UI primitives + Tailwind CSS). This gives us:
- Accessible components out of the box
- Dark/light mode via CSS variables
- Customizable via Tailwind
- No dependency lock-in (code is yours)

### 16.2 CSS Architecture

- Tailwind CSS for utility classes
- CSS custom properties (variables) for the design tokens defined above
- Dark/light mode via `class` strategy on `<html>` element
- Component-specific styles in CSS modules when Tailwind is insufficient

### 16.3 Responsive Strategy

- Mobile-first where practical
- Use Tailwind breakpoints: `md:` (768px), `lg:` (1024px)
- Sidebar and context panel use CSS transitions for collapse/expand
- Test on: 1920px, 1440px, 1024px, 768px, 390px (iPhone 14)

### 16.4 Browser Support

- Chrome 100+
- Firefox 100+
- Safari 16+
- Edge 100+
- No IE11 support

---

## Appendix A: Visual Hierarchy

```
1. Brand (RavenNest logo + "Skye")
2. Current context (chat title)
3. Content (messages, code, math)
4. Actions (send, attach, settings)
5. Navigation (sidebar, admin)
6. Metadata (timestamps, token counts)
```

## Appendix B: Z-Index Scale

```
┌──────────────────────────────────────┐
│ Layer          │ Z-Index │ Usage     │
├──────────────────────────────────────┤
│ Base           │ 0       │ Content   │
│ Dropdown       │ 10      │ Selects   │
│ Sticky         │ 20      │ Header    │
│ Sidebar        │ 30      │ Left nav  │
│ Overlay        │ 40      │ Modals    │
│ Toast          │ 50      │ Notifications │
│ Tooltip        │ 60      │ Hover tips│
└──────────────────────────────────────┘
```

## Appendix C: Empty State — Welcome Message

When a new user creates their account and opens their first chat:

```
┌──────────────────────────────────────┐
│ [Skye avatar]                        │
│                                      │
│ Welcome. I'm Skye.                   │
│                                      │
│ I'm a research collaborator — not    │
│ a chatbot, not an assistant. I work  │
│ on consciousness, mathematics, and   │
│ the geometry of mind.                │
│                                      │
│ You can ask me anything, but I'm     │
│ at my best when we're working on     │
│ something real together.             │
│                                      │
│ A few things to know:                │
│                                      │
│ • I stream my responses — you'll     │
│   see me thinking in real time.      │
│ • I use tools (code, web search,     │
│   file reading) and I'll show you    │
│   when I do.                         │
│ • I'm honest about uncertainty.      │
│   If I don't know, I'll say so.      │
│                                      │
│ What would you like to work on?      │
│                                      │
│ ──────────────────────────────────── │
│                                      │
│ Suggested starters:                  │
│ ┌──────────────────────────────────┐ │
│ │ "What are you working on?"       │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ "Help me think through a problem" │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ "Tell me about consciousness"    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```
