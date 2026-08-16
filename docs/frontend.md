# Build a Front-End Web App with HTML, CSS, TypeScript, and Node.js

Modern frontend frameworks are useful, but they can sometimes hide the fundamentals.

Before learning React, Vue, or another framework, it is worth building a complete browser application with the platform itself:

- HTML for structure
- CSS for layout and visual design
- TypeScript for behavior and type safety
- Node.js for a local development server

That is what we’ll build in this tutorial.

The project will be a small task board called **Focus Board**. It will let users:

- Add tasks
- Mark tasks as complete
- Delete tasks
- Filter by all, active, or completed
- Search tasks
- Persist data in the browser with `localStorage`
- Run locally through a Node.js server

The final structure will look like this:

```text
focus-board/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── assets/
│       └── main.js
├── src/
│   ├── client/
│   │   └── main.ts
│   └── server.ts
├── .gitignore
├── .nvmrc
├── package.json
├── package-lock.json
├── tsconfig.client.json
└── tsconfig.server.json
```

---

## How the application works

The browser loads the page from Node.js:

```text
Browser
   │
   │ GET /
   ▼
Node.js static server
   │
   ├── public/index.html
   ├── public/styles.css
   └── public/assets/main.js
```

The TypeScript source is compiled into JavaScript:

```text
src/client/main.ts
          │
          ▼
public/assets/main.js
```

The browser cannot execute TypeScript directly. It executes JavaScript.

The development flow is therefore:

```text
Write TypeScript
      ↓
Compile TypeScript
      ↓
Browser loads JavaScript
      ↓
JavaScript manipulates the DOM
```

We will use Node’s built-in `http` module for the local server. Node’s HTTP API is deliberately low-level, which makes it useful for understanding what a web server actually does. [Node.js HTTP documentation](https://nodejs.org/api/http.html)

---

# 1. Install Node.js on Ubuntu

For Ubuntu development, use a Node version manager such as `nvm`. It lets you switch between Node versions without modifying system directories.

Install the prerequisites:

```bash
sudo apt update
sudo apt install -y curl git build-essential
```

Install `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

Reload Bash:

```bash
source ~/.bashrc
```

Verify the installation:

```bash
command -v nvm
```

Install the latest LTS version of Node.js:

```bash
nvm install --lts
```

Make it the default:

```bash
nvm alias default lts/*
```

Verify Node and npm:

```bash
node --version
npm --version
```

The `nvm` project supports installing and switching between different Node.js versions from the command line. [nvm documentation](https://github.com/nvm-sh/nvm)

---

# 2. Create the project

Create a directory:

```bash
mkdir -p ~/projects/focus-board
cd ~/projects/focus-board
```

Pin the Node version for the project:

```bash
echo "22" > .nvmrc
nvm install
nvm use
```

Initialize npm:

```bash
npm init -y
```

Install TypeScript:

```bash
npm install --save-dev typescript
```

We’ll use two TypeScript configuration files:

- One for browser code
- One for the Node.js server

This separation matters because the browser and Node have different runtime APIs.

The browser knows about:

```text
window
document
localStorage
HTMLElement
```

Node knows about:

```text
process
fs
path
http
```

Keeping the configurations separate prevents TypeScript from mixing the two environments accidentally.

---

# 3. Configure `package.json`

Replace the contents of `package.json` with:

```json
{
  "name": "focus-board",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "tsc -p tsconfig.client.json",
    "build:server": "tsc -p tsconfig.server.json",
    "dev:client": "tsc -p tsconfig.client.json --watch",
    "dev:server": "node --watch dist/server.js",
    "start": "node dist/server.js",
    "typecheck": "npm run typecheck:client && npm run typecheck:server",
    "typecheck:client": "tsc -p tsconfig.client.json --noEmit",
    "typecheck:server": "tsc -p tsconfig.server.json --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
```

The `"type": "module"` field tells Node to use modern ES module syntax for `.js` files. Node uses the nearest `package.json` to determine how `.js` files should be interpreted. [Node package documentation](https://nodejs.org/api/packages.html)

The important scripts are:

```json
"build": "npm run build:client && npm run build:server"
```

Compiles both parts of the application.

```json
"dev:client": "tsc -p tsconfig.client.json --watch"
```

Continuously recompiles browser TypeScript.

```json
"dev:server": "node --watch dist/server.js"
```

Restarts Node when the compiled server changes.

```json
"typecheck": "npm run typecheck:client && npm run typecheck:server"
```

Checks types without writing compiled output.

---

# 4. Create the project directories

```bash
mkdir -p public/assets
mkdir -p src/client
```

Create the files:

```bash
touch public/index.html
touch public/styles.css
touch src/client/main.ts
touch src/server.ts
touch tsconfig.client.json
touch tsconfig.server.json
touch .gitignore
```

---

# 5. Configure TypeScript for the browser

Create `tsconfig.client.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "rootDir": "src/client",
    "outDir": "public/assets",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "sourceMap": true
  },
  "include": ["src/client/**/*.ts"]
}
```

Important options:

- `target` defines the JavaScript language level.
- `module` controls generated module syntax.
- `rootDir` identifies the TypeScript source directory.
- `outDir` defines where compiled JavaScript is written.
- `strict` enables strict type checking.
- `lib` includes browser APIs such as the DOM and `localStorage`.
- `sourceMap` makes browser debugging easier.

A `tsconfig.json` file tells TypeScript which files belong to a project and which compiler options to use. [TypeScript `tsconfig.json` documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

---

# 6. Configure TypeScript for Node.js

Create `tsconfig.server.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "lib": ["ES2022"],
    "sourceMap": true
  },
  "include": ["src/server.ts"]
}
```

The server configuration is different because it does not use browser APIs.

We could install `@types/node` for richer Node type definitions, but our server example will use only built-in types that can be inferred or declared directly. For larger projects, install it:

```bash
npm install --save-dev @types/node
```

Then add:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

---

# 7. Create the HTML page

Create `public/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <meta
      name="description"
      content="A simple, focused task board for everyday work."
    />
    <title>Focus Board</title>
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="/assets/main.js" defer></script>
  </head>

  <body>
    <header class="site-header">
      <div class="container header-content">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true">✓</span>
          <span>Focus Board</span>
        </a>

        <span class="header-label">A calmer way to plan your day</span>
      </div>
    </header>

    <main class="container app-shell">
      <section class="intro">
        <p class="eyebrow">Today’s workspace</p>
        <h1>Get the important things done.</h1>
        <p class="intro-copy">
          Keep a short list, clear the noise, and make steady progress.
        </p>
      </section>

      <section class="board" aria-labelledby="board-title">
        <div class="board-header">
          <div>
            <h2 id="board-title">My tasks</h2>
            <p id="task-summary" class="task-summary">
              No tasks yet
            </p>
          </div>

          <button id="clear-completed" class="text-button" type="button">
            Clear completed
          </button>
        </div>

        <form id="task-form" class="task-form">
          <label class="sr-only" for="task-input">
            Add a task
          </label>

          <input
            id="task-input"
            name="task"
            type="text"
            placeholder="What needs your attention?"
            maxlength="120"
            autocomplete="off"
            required
          />

          <button class="primary-button" type="submit">
            Add task
          </button>
        </form>

        <div class="toolbar">
          <div class="filters" role="group" aria-label="Filter tasks">
            <button
              class="filter-button is-active"
              type="button"
              data-filter="all"
              aria-pressed="true"
            >
              All
            </button>

            <button
              class="filter-button"
              type="button"
              data-filter="active"
              aria-pressed="false"
            >
              Active
            </button>

            <button
              class="filter-button"
              type="button"
              data-filter="completed"
              aria-pressed="false"
            >
              Completed
            </button>
          </div>

          <label class="search-field">
            <span class="sr-only">Search tasks</span>
            <input
              id="search-input"
              type="search"
              placeholder="Search"
              autocomplete="off"
            />
          </label>
        </div>

        <ul id="task-list" class="task-list" aria-live="polite"></ul>

        <div id="empty-state" class="empty-state">
          <div class="empty-icon" aria-hidden="true">✦</div>
          <h3>Your list is clear</h3>
          <p>Add a task above and make today a little easier.</p>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>Saved locally in your browser.</p>
      </div>
    </footer>
  </body>
</html>
```

## Why semantic HTML matters

The page uses meaningful elements:

- `<header>` for site-level content
- `<main>` for the primary application
- `<section>` for grouped content
- `<form>` for task creation
- `<button>` for actions
- `<ul>` and `<li>` for the task list
- `<label>` for form controls

Semantic HTML improves:

- Accessibility
- Keyboard navigation
- Screen-reader support
- Search-engine understanding
- Maintainability

A clickable `<button>` is usually better than a clickable `<div>` because browsers already understand how buttons behave.

---

# 8. Style the application with CSS

Create `public/styles.css`:

```css
:root {
  color-scheme: light;

  --page-bg: #f5f7fb;
  --surface: #ffffff;
  --surface-muted: #f8f9fc;
  --text: #172033;
  --text-muted: #788196;
  --border: #e7eaf1;
  --primary: #5d5fef;
  --primary-dark: #484bd2;
  --danger: #d95468;
  --shadow: 0 18px 50px rgba(35, 42, 70, 0.08);
  --radius-large: 24px;
  --radius-medium: 14px;
}

* {
  box-sizing: border-box;
}

html {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  background: var(--page-bg);
  color: var(--text);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(
      circle at top left,
      rgba(93, 95, 239, 0.1),
      transparent 32rem
    ),
    var(--page-bg);
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.container {
  width: min(100% - 2rem, 960px);
  margin: 0 auto;
}

.site-header {
  border-bottom: 1px solid rgba(231, 234, 241, 0.8);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--text);
  font-weight: 750;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 10px;
  background: var(--primary);
  color: white;
  font-size: 0.95rem;
}

.header-label {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.app-shell {
  padding: 5rem 0 4rem;
}

.intro {
  max-width: 650px;
  margin-bottom: 2.5rem;
}

.eyebrow {
  margin: 0 0 0.8rem;
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 600px;
  margin-bottom: 1rem;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.065em;
}

.intro-copy {
  max-width: 520px;
  margin-bottom: 0;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.65;
}

.board {
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid rgba(231, 234, 241, 0.9);
  border-radius: var(--radius-large);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.board-header h2 {
  margin-bottom: 0.35rem;
  font-size: 1.3rem;
  letter-spacing: -0.03em;
}

.task-summary {
  margin-bottom: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.text-button {
  border: 0;
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.text-button:hover {
  color: var(--danger);
}

.task-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.task-form input,
.search-field input {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
  outline: none;
  background: var(--surface-muted);
  color: var(--text);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    background 150ms ease;
}

.task-form input {
  width: 100%;
  padding: 0.95rem 1rem;
}

.task-form input:focus,
.search-field input:focus {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(93, 95, 239, 0.12);
}

.primary-button {
  flex: 0 0 auto;
  padding: 0.9rem 1.25rem;
  border: 0;
  border-radius: var(--radius-medium);
  background: var(--primary);
  color: white;
  font-weight: 700;
  transition:
    background 150ms ease,
    transform 150ms ease;
}

.primary-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters {
  display: inline-flex;
  gap: 0.3rem;
  padding: 0.3rem;
  border-radius: 12px;
  background: var(--surface-muted);
}

.filter-button {
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.filter-button:hover,
.filter-button.is-active {
  background: white;
  color: var(--text);
  box-shadow: 0 2px 8px rgba(35, 42, 70, 0.08);
}

.search-field {
  max-width: 220px;
  width: 100%;
}

.search-field input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
}

.task-list {
  display: grid;
  gap: 0.7rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 64px;
  padding: 0.75rem 0.8rem 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
  background: white;
}

.task-item:hover {
  border-color: #d4d8e5;
}

.task-check {
  display: grid;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 2px solid #c7ccdb;
  border-radius: 50%;
  background: white;
  color: white;
  font-size: 0.75rem;
  transition:
    border-color 150ms ease,
    background 150ms ease;
}

.task-check:hover {
  border-color: var(--primary);
}

.task-item.is-completed .task-check {
  border-color: var(--primary);
  background: var(--primary);
}

.task-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  line-height: 1.4;
}

.task-item.is-completed .task-title {
  color: var(--text-muted);
  text-decoration: line-through;
}

.delete-button {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #a2a9ba;
}

.delete-button:hover {
  background: #fff0f2;
  color: var(--danger);
}

.empty-state {
  padding: 3rem 1rem 2rem;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem;
  place-items: center;
  border-radius: 17px;
  background: #f0efff;
  color: var(--primary);
  font-size: 1.25rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 0;
  color: var(--text-muted);
}

.site-footer {
  padding: 0 0 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 650px) {
  .header-label {
    display: none;
  }

  .app-shell {
    padding-top: 3rem;
  }

  .task-form,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .filters {
    justify-content: center;
  }

  .search-field {
    max-width: none;
  }
}
```

This stylesheet demonstrates several useful patterns:

- CSS custom properties for design tokens
- Responsive layouts with media queries
- `clamp()` for fluid typography
- Flexbox for alignment
- Accessible visually hidden labels
- Focus states for keyboard users
- State classes such as `.is-completed`
- A mobile layout without JavaScript

---

# 9. Model the application state

Create `src/client/main.ts`.

Start with the types and state:

```ts
type Filter = "all" | "active" | "completed";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

interface AppState {
  tasks: Task[];
  filter: Filter;
  searchTerm: string;
}

const STORAGE_KEY = "focus-board.tasks";

const state: AppState = {
  tasks: loadTasks(),
  filter: "all",
  searchTerm: ""
};
```

The `Task` interface describes the data structure:

```ts
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}
```

Every task has:

- A unique ID
- A title
- A completion state
- A creation timestamp

The application state also includes the active filter and search text.

Keeping state in one place is important. It gives us a predictable source of truth:

```text
state changes
    ↓
save state
    ↓
render UI
```

---

# 10. Select DOM elements safely

Add this below the state:

```ts
const taskForm = getElement<HTMLFormElement>("task-form");
const taskInput = getElement<HTMLInputElement>("task-input");
const taskList = getElement<HTMLUListElement>("task-list");
const emptyState = getElement<HTMLDivElement>("empty-state");
const taskSummary = getElement<HTMLParagraphElement>("task-summary");
const searchInput = getElement<HTMLInputElement>("search-input");
const clearCompletedButton =
  getElement<HTMLButtonElement>("clear-completed");

const filterButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-filter]")
);
```

We need a helper:

```ts
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }

  return element as T;
}
```

Without this helper, every element could technically be `null`.

This is unsafe:

```ts
const input = document.getElementById("task-input");
input.value = "Hello";
```

TypeScript correctly warns that `input` may be `null`.

The helper checks at application startup and throws a clear error if the HTML and TypeScript fall out of sync.

---

# 11. Read and write local storage

Add:

```ts
function loadTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
```

Add the type guard:

```ts
function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    typeof candidate.createdAt === "number"
  );
}
```

`localStorage` stores key-value data for the current origin and persists it across browser sessions. It is synchronous, so it is appropriate for a small task list but not for large datasets or high-frequency writes. [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

Do not open the HTML directly with a `file://` URL and depend on storage behavior. Browser behavior for `localStorage` on local files is not guaranteed consistently. Use the Node server instead. [MDN `localStorage` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

# 12. Create task operations

Add:

```ts
function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now()
  };
}

function addTask(title: string): void {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return;
  }

  state.tasks.unshift(createTask(normalizedTitle));
  saveTasks(state.tasks);
  render();
}

function toggleTask(id: string): void {
  state.tasks = state.tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks(state.tasks);
  render();
}

function deleteTask(id: string): void {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveTasks(state.tasks);
  render();
}

function clearCompleted(): void {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveTasks(state.tasks);
  render();
}
```

These operations do not manipulate the DOM directly.

They update application state:

```text
addTask()
toggleTask()
deleteTask()
clearCompleted()
        ↓
saveTasks()
        ↓
render()
```

This is a simple version of a pattern used by larger frontend frameworks: state changes cause the interface to be recalculated.

---

# 13. Filter and search tasks

Add:

```ts
function getVisibleTasks(): Task[] {
  return state.tasks.filter((task) => {
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "active" && !task.completed) ||
      (state.filter === "completed" && task.completed);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}
```

This keeps filtering separate from rendering.

The function answers one question:

> Which tasks should be visible right now?

That makes the rendering function simpler.

---

# 14. Render the task list

Add:

```ts
function render(): void {
  const visibleTasks = getVisibleTasks();

  taskList.replaceChildren(
    ...visibleTasks.map((task) => createTaskElement(task))
  );

  emptyState.hidden = visibleTasks.length > 0;

  updateSummary();
  updateFilterButtons();
}
```

Create a task element:

```ts
function createTaskElement(task: Task): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "task-item";

  if (task.completed) {
    item.classList.add("is-completed");
  }

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-check";
  toggleButton.type = "button";
  toggleButton.setAttribute(
    "aria-label",
    task.completed
      ? `Mark "${task.title}" as active`
      : `Mark "${task.title}" as completed`
  );
  toggleButton.textContent = task.completed ? "✓" : "";
  toggleButton.addEventListener("click", () => {
    toggleTask(task.id);
  });

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute(
    "aria-label",
    `Delete "${task.title}"`
  );
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  item.append(toggleButton, title, deleteButton);

  return item;
}
```

Notice that we use:

```ts
title.textContent = task.title;
```

rather than:

```ts
title.innerHTML = task.title;
```

`textContent` treats the task title as plain text.

`innerHTML` would interpret user input as HTML, which could create a cross-site scripting vulnerability.

For user-controlled text, prefer:

```ts
element.textContent = value;
```

unless you have a very specific reason to render trusted HTML.

---

# 15. Update the summary and filters

Add:

```ts
function updateSummary(): void {
  const activeCount = state.tasks.filter(
    (task) => !task.completed
  ).length;

  if (state.tasks.length === 0) {
    taskSummary.textContent = "No tasks yet";
    return;
  }

  const taskLabel = activeCount === 1 ? "task" : "tasks";
  taskSummary.textContent = `${activeCount} active ${taskLabel}`;
}

function updateFilterButtons(): void {
  for (const button of filterButtons) {
    const filter = button.dataset.filter;

    if (!isFilter(filter)) {
      continue;
    }

    const isActive = filter === state.filter;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function isFilter(value: string | undefined): value is Filter {
  return (
    value === "all" ||
    value === "active" ||
    value === "completed"
  );
}
```

This is a useful TypeScript pattern:

```ts
function isFilter(value: string | undefined): value is Filter
```

The `value is Filter` return type tells TypeScript that the value has been narrowed after the function returns `true`.

---

# 16. Wire up event handlers

Add:

```ts
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  addTask(taskInput.value);
  taskForm.reset();
  taskInput.focus();
});

searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value;
  render();
});

clearCompletedButton.addEventListener("click", () => {
  clearCompleted();
});

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    if (isFilter(filter)) {
      state.filter = filter;
      render();
    }
  });
}
```

The browser sends a `submit` event when the form is submitted. We call:

```ts
event.preventDefault();
```

to stop the browser from navigating away or reloading the page.

Then we:

1. Read the input
2. Add the task
3. Clear the form
4. Return focus to the input

That last step is small, but it makes the interface more pleasant for keyboard users.

Finally, initialize the UI:

```ts
render();
```

At this point, `src/client/main.ts` is complete.

---

# 17. Create the Node.js server

Now create `src/server.ts`:

```ts
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = join(currentFile, "..");

const projectRoot = join(currentDirectory, "..");
const publicDirectory = join(projectRoot, "public");

const port = Number(process.env.PORT ?? 3000);

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendText(
  response: ServerResponse,
  statusCode: number,
  message: string
): void {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  response.end(message);
}

function getSafeFilePath(requestPath: string): string | null {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = normalize(decodedPath);
  const relativePath = relative("/", normalizedPath);

  if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
    return null;
  }

  const filePath = join(publicDirectory, relativePath || "index.html");
  const relativeToPublic = relative(publicDirectory, filePath);

  if (
    relativeToPublic.startsWith(`..${sep}`) ||
    relativeToPublic === ".."
  ) {
    return null;
  }

  return filePath;
}

async function serveStaticFile(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const requestUrl = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`
  );

  const filePath = getSafeFilePath(requestUrl.pathname);

  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    const contentType =
      contentTypes[extname(filePath)] ??
      "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, "Not found");
  }
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  void serveStaticFile(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Focus Board running at http://127.0.0.1:${port}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server stopped");
  });
});
```

This server does a few things:

1. Creates an HTTP server.
2. Accepts `GET` and `HEAD` requests.
3. Maps URLs to files in `public/`.
4. Sets the correct content type.
5. Streams files to the browser.
6. Prevents path traversal.
7. Listens on port `3000`.

The URL-to-file mapping looks like this:

```text
GET /             → public/index.html
GET /styles.css   → public/styles.css
GET /assets/main.js → public/assets/main.js
```

## Why path traversal protection matters

A naïve server might do this:

```ts
const filePath = join(publicDirectory, request.url);
```

An attacker could request something like:

```text
/../../etc/passwd
```

and attempt to access files outside the public directory.

The example checks that the normalized requested path remains inside `public/`.

For production applications, use a mature static server or framework rather than maintaining your own static-file server indefinitely. This example is primarily for learning and local development.

---

# 18. Ignore generated files

Create `.gitignore`:

```gitignore
node_modules/
dist/
public/assets/*.js
public/assets/*.js.map
.env
```

The compiled client JavaScript is generated from TypeScript, so it does not need to be committed.

Your repository should contain:

```text
src/client/main.ts
```

rather than only:

```text
public/assets/main.js
```

---

# 19. Build the application

Run:

```bash
npm run build
```

You should now have:

```text
dist/
└── server.js

public/
├── assets/
│   ├── main.js
│   └── main.js.map
├── index.html
└── styles.css
```

Check the types without generating files:

```bash
npm run typecheck
```

Start the server:

```bash
npm start
```

Open:

```text
http://127.0.0.1:3000
```

You should see the Focus Board interface.

---

# 20. Development mode

Use two terminal windows.

In the first terminal:

```bash
npm run dev:client
```

This watches `src/client/main.ts` and recompiles it whenever you save.

In the second terminal:

```bash
npm run build:server
npm run dev:server
```

The Node process watches the compiled server file and restarts when it changes.

The browser will not automatically refresh when the client JavaScript changes. Refresh the page manually.

A more advanced setup could add:

- A file watcher
- Browser live reload
- Vite
- esbuild
- Parcel
- Webpack
- A framework development server

But it is worth learning the underlying process first:

```text
TypeScript compiler writes JavaScript
Node serves files
Browser executes JavaScript
```

---

# 21. Test the application manually

Try these interactions:

1. Add a task.
2. Add several tasks.
3. Mark one complete.
4. Filter to active tasks.
5. Filter to completed tasks.
6. Search for a task.
7. Delete a task.
8. Reload the page.
9. Click “Clear completed.”

The tasks should remain after reloading because they are stored in `localStorage`.

Inspect the data in browser developer tools:

```text
Application → Local Storage → http://127.0.0.1:3000
```

You should see a key:

```text
focus-board.tasks
```

The value is JSON:

```json
[
  {
    "id": "8cf1...",
    "title": "Review API design",
    "completed": false,
    "createdAt": 1780000000000
  }
]
```

---

# 22. Add dark mode

A simple dark mode can be implemented with a CSS class.

Add these variables to `styles.css`:

```css
body.dark-theme {
  --page-bg: #151722;
  --surface: #202331;
  --surface-muted: #292c3c;
  --text: #f2f4fa;
  --text-muted: #a6acc0;
  --border: #363b50;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
}
```

Add a button to the HTML:

```html
<button id="theme-toggle" class="text-button" type="button">
  Toggle theme
</button>
```

In TypeScript:

```ts
const themeToggle =
  getElement<HTMLButtonElement>("theme-toggle");

const savedTheme = localStorage.getItem("focus-board.theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");

  localStorage.setItem(
    "focus-board.theme",
    isDark ? "dark" : "light"
  );
});
```

This illustrates the same general pattern:

```text
read persisted state
      ↓
apply it to the DOM
      ↓
save future changes
```

---

# 23. Improve accessibility

The application already has several accessibility features:

- Semantic HTML
- Labels for inputs
- Button elements for actions
- `aria-label` on icon-only buttons
- `aria-live` for list updates
- `aria-pressed` for filter state
- Visible focus styles
- Keyboard-compatible controls

There are still things you could improve:

## Add keyboard shortcuts carefully

Keyboard shortcuts should not interfere with text input. If you add them, check:

```ts
const target = event.target;

if (
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement
) {
  return;
}
```

## Keep focus visible

Do not remove outlines globally:

```css
*:focus {
  outline: none;
}
```

Instead, define a visible focus style:

```css
button:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(93, 95, 239, 0.4);
  outline-offset: 3px;
}
```

## Do not communicate state only with color

A completed task uses:

- A check mark
- Different text styling
- A visual state class

Color alone should not be the only indicator.

---

# 24. Separate state, rendering, and events

As the application grows, avoid putting everything in one function.

A useful mental model is:

```text
State
  ↓
Derived data
  ↓
Rendering
  ↓
DOM events
  ↓
State updates
```

In this application:

```text
state.tasks
state.filter
state.searchTerm
        ↓
getVisibleTasks()
        ↓
render()
        ↓
button and form events
        ↓
addTask(), toggleTask(), deleteTask()
```

This is the same basic architecture used by many larger frontend systems.

The important idea is that the DOM should be a reflection of application state, not the application’s database.

---

# 25. Use modules as the app grows

Our example uses one client file. That is fine for a small app, but a real application might look like this:

```text
src/client/
├── main.ts
├── state/
│   └── task-store.ts
├── ui/
│   ├── task-list.ts
│   ├── filters.ts
│   └── notifications.ts
├── storage/
│   └── task-storage.ts
└── types/
    └── task.ts
```

For example:

```ts
// src/client/types/task.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}
```

```ts
// src/client/storage/task-storage.ts
import type { Task } from "../types/task.js";

const STORAGE_KEY = "focus-board.tasks";

export function loadTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
```

Then import the functions where needed:

```ts
import {
  loadTasks,
  saveTasks
} from "./storage/task-storage.js";
```

Split code when it makes responsibility clearer, not merely to increase the number of files.

---

# 26. Add a backend later

At the moment, the app stores tasks only in the browser.

That is useful for a local prototype, but it has limitations:

- Data is tied to one browser
- Data is tied to one origin
- There is no login
- There is no synchronization between devices
- The server cannot access the task list
- Clearing browser data removes the tasks

A full-stack version could add an API:

```text
Browser UI
    │
    │ GET /api/tasks
    │ POST /api/tasks
    │ PATCH /api/tasks/:id
    │ DELETE /api/tasks/:id
    ▼
Node.js API
    │
    ▼
Database
```

Example API routes:

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Then TypeScript could call the API:

```ts
async function loadTasksFromApi(): Promise<Task[]> {
  const response = await fetch("/api/tasks");

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return (await response.json()) as Task[];
}
```

For external JSON, the type assertion alone is not enough. In production, validate the response at runtime with a schema validator.

A frontend type describes what you expect. It does not prove that the server returned valid data.

---

# 27. Common mistakes

## Opening the HTML directly

Avoid:

```text
file:///home/user/projects/focus-board/public/index.html
```

Use the Node server:

```bash
npm run build
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

This gives the page a proper origin and makes storage behavior predictable.

## Forgetting to compile TypeScript

If `main.js` does not exist, run:

```bash
npm run build:client
```

Or use watch mode:

```bash
npm run dev:client
```

## Running the wrong Node version

Check:

```bash
nvm current
node --version
```

Then:

```bash
nvm use
```

## Using `innerHTML` for user input

Avoid:

```ts
element.innerHTML = task.title;
```

Prefer:

```ts
element.textContent = task.title;
```

## Treating TypeScript as runtime validation

This is not validation:

```ts
const task = value as Task;
```

Data from storage, HTTP, or users should be checked at runtime.

## Putting generated files in source control

Do not commit:

```text
node_modules/
dist/
compiled JavaScript generated from TypeScript
```

Commit the source and configuration instead.

## Forgetting responsive behavior

A desktop layout can look good and still be difficult to use on a phone. Test the application at narrow widths.

---

# 28. A practical build checklist

Before considering the project complete:

```bash
npm run typecheck
npm run build
```

Then verify:

- The page loads from Node.
- The CSS loads correctly.
- The compiled JavaScript loads without console errors.
- Tasks can be created.
- Tasks can be completed.
- Tasks can be deleted.
- Filters work.
- Search works.
- Data survives a page reload.
- The layout works on a narrow screen.
- Keyboard focus is visible.
- User-entered task text is rendered safely.
- The project can be cloned and installed with:

```bash
npm install
npm run build
npm start
```

---

# Final project workflow

For everyday development:

```bash
cd ~/projects/focus-board
nvm use
npm install
npm run dev:client
```

In another terminal:

```bash
npm run build:server
npm run dev:server
```

For a production-style build:

```bash
npm run typecheck
npm run build
npm start
```

The final architecture is simple:

```text
HTML
  defines the document

CSS
  defines the appearance

TypeScript
  defines the behavior

Node.js
  serves the application

Browser
  executes the compiled JavaScript
```

That combination is enough to build a surprising amount of useful software. Frameworks add powerful abstractions, but the underlying ideas stay the same: data, state, events, rendering, network requests, and persistence.

Once you understand those pieces without a framework doing all the work for you, frontend frameworks become much easier to learn—and much easier to debug when something goes wrong.