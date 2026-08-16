# Node.js, npm, npx, and nvm on Ubuntu: A Full-Stack Developer’s Setup Guide

Node.js development becomes much easier once four tools are clear:

- **Node.js** runs JavaScript outside the browser.
- **npm** installs packages and runs project scripts.
- **npx** executes package binaries without requiring a global installation.
- **nvm** lets you install and switch between Node.js versions.

They are related, but they solve different problems.

This guide walks through setting up a Node.js and TypeScript project on Ubuntu, explains how Node works, and covers practical patterns for full-stack development: project structure, dependency management, TypeScript configuration, environment variables, APIs, testing, scripts, production builds, and common mistakes.

---

## What Node.js actually is

Node.js is a JavaScript runtime built on Google’s V8 JavaScript engine. It lets you run JavaScript from a terminal or server instead of inside a web browser. The official Node.js documentation describes it as an open-source, cross-platform JavaScript runtime environment. [Node.js documentation](https://nodejs.org/learn)

That means you can use JavaScript or TypeScript to build:

- HTTP APIs
- Web servers
- Command-line tools
- Background workers
- WebSocket services
- Build tools
- Automation scripts
- Full-stack applications

A browser gives JavaScript access to browser APIs such as the DOM, cookies, and local storage.

Node gives JavaScript access to server-side capabilities such as:

- Filesystems
- Network sockets
- Processes
- Environment variables
- Streams
- TCP servers
- Operating-system signals

Node is not a programming language. It is the runtime that executes JavaScript.

TypeScript is not a runtime either. TypeScript adds static types and is usually transformed into JavaScript before Node runs it.

The relationship looks like this:

```text
TypeScript source
      ↓
TypeScript compiler or runtime tool
      ↓
JavaScript
      ↓
Node.js
```

---

# Node.js and the event loop

A Node process usually runs on a single main JavaScript thread. That does not mean Node can perform only one operation at a time.

Node is designed around asynchronous I/O.

When Node starts a network request, reads a file, or waits for a timer, it can continue handling other work instead of blocking the JavaScript thread.

A simplified example:

```ts
import { readFile } from "node:fs/promises";

console.log("Before");

const contents = await readFile("notes.txt", "utf8");

console.log(contents);
console.log("After");
```

While the file operation is pending, Node can process other events.

This model is particularly effective for applications that spend much of their time waiting for:

- Database responses
- HTTP requests
- File operations
- Message queues
- External APIs
- Client connections

It is less suitable for CPU-heavy work that runs for a long time on the main thread, such as:

- Large image transformations
- Video encoding
- Complex mathematical calculations
- Huge JSON transformations
- Machine-learning inference

For CPU-heavy work, consider worker threads, child processes, a separate service, or a job queue.

## A blocking example

This blocks the main thread:

```ts
import { readFileSync } from "node:fs";

const contents = readFileSync("large-file.txt", "utf8");
console.log(contents);
```

For small files during startup, that may be acceptable. In a request handler, synchronous filesystem calls are usually a bad idea because one slow operation can delay unrelated requests.

Prefer asynchronous APIs in request-handling code:

```ts
import { readFile } from "node:fs/promises";

const contents = await readFile("large-file.txt", "utf8");
```

---

# Installing Node.js on Ubuntu

There are several ways to install Node.js on Ubuntu:

- Ubuntu’s APT package
- NodeSource packages
- A version manager such as `nvm`
- A container image
- A system-level version manager

For individual development machines, `nvm` is often the most convenient because different projects may require different Node versions.

## Install prerequisites

```bash
sudo apt update
sudo apt install -y curl git build-essential
```

`build-essential` is useful because some npm packages include native code that must be compiled during installation.

## Install nvm

The official `nvm` project provides an installation script. The current installation instructions are maintained in the project’s GitHub repository. [nvm installation instructions](https://github.com/nvm-sh/nvm)

Run:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

Then close and reopen your terminal, or reload your Bash configuration:

```bash
source ~/.bashrc
```

Verify that `nvm` is available:

```bash
command -v nvm
```

You should see:

```text
nvm
```

`nvm` is a shell function, not a normal executable, which is why `command -v nvm` is more useful than `which nvm`.

## Install the latest LTS version of Node.js

For most projects, use the latest Long-Term Support release:

```bash
nvm install --lts
```

Make it the default for new terminal sessions:

```bash
nvm alias default lts/*
```

Check the installed versions:

```bash
node --version
npm --version
nvm current
```

## Install a specific Node version

```bash
nvm install 22
```

Use it:

```bash
nvm use 22
```

List installed versions:

```bash
nvm ls
```

List versions available for installation:

```bash
nvm ls-remote
```

Install the latest release, regardless of LTS status:

```bash
nvm install node
```

For production projects, prefer an LTS line unless you have a specific reason to use the current release.

## Use `.nvmrc` for project versions

Inside a project directory:

```bash
echo "22" > .nvmrc
```

Now developers can run:

```bash
nvm install
nvm use
```

`nvm install` reads the version from `.nvmrc` and installs it if necessary.

The `.nvmrc` file should usually be committed:

```bash
git add .nvmrc
git commit -m "Pin project Node version"
```

This does not automatically switch versions when you enter the directory. It gives everyone a shared version requirement.

---

# What npm is

npm originally stood for Node Package Manager. Today, npm includes:

- A package registry
- A command-line client
- Dependency resolution
- Lockfile support
- Package scripts
- Publishing tools
- Workspaces
- Security auditing

A project’s npm metadata normally lives in:

```text
package.json
```

A typical project might contain:

```json
{
  "name": "example-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Node uses the `"type"` field to determine how `.js` files are interpreted. With `"type": "module"`, `.js` files use ES module syntax by default. The `.mjs` and `.cjs` extensions can be used when you need explicit module formats. [Node.js package documentation](https://nodejs.org/api/packages.html)

I recommend setting `"type": "module"` explicitly for new projects rather than relying on Node’s default behavior.

---

# What npx is

`npx` runs package executables.

For example:

```bash
npx tsc --version
```

If the package is installed locally, `npx` can find its binary in:

```text
node_modules/.bin/
```

You can also use it to run a package temporarily:

```bash
npx create-vite@latest
```

Modern `npx` is implemented through `npm exec`. The npm documentation notes that the standalone `npx` package was deprecated in npm 7; the `npx` command remains available as part of npm. [npm npx documentation](https://docs.npmjs.com/cli/commands/npx/)

Be careful when running a package you have not inspected. `npx` can execute code downloaded from a registry.

Prefer specifying a version when reproducibility matters:

```bash
npx create-vite@latest
```

Or:

```bash
npx some-tool@4.2.1
```

For commands your project depends on, install the tool locally and invoke it through an npm script instead of relying on a global installation.

---

# Create a Node.js project

Create a directory:

```bash
mkdir -p ~/projects/example-api
cd ~/projects/example-api
```

Select the project’s Node version:

```bash
echo "22" > .nvmrc
nvm install
nvm use
```

Initialize npm:

```bash
npm init -y
```

This creates:

```text
package.json
```

Open it:

```bash
nano package.json
```

Or use your editor:

```bash
code .
```

A minimal package file might look like this:

```json
{
  "name": "example-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

The `"private": true` setting prevents accidental publishing to npm.

---

# Install dependencies

Install a runtime dependency:

```bash
npm install fastify
```

Install development-only dependencies:

```bash
npm install --save-dev typescript tsx @types/node
```

Runtime dependencies belong in:

```json
"dependencies": {}
```

Build tools, test runners, linters, and type definitions usually belong in:

```json
"devDependencies": {}
```

For example:

```json
{
  "dependencies": {
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

Do not install every package globally. Global packages are appropriate for tools you intentionally use across many projects, but project dependencies should normally be local and recorded in `package.json`.

Avoid commands like:

```bash
sudo npm install -g package-name
```

When using `nvm`, global packages install into your user-managed Node version. You generally do not need `sudo`.

---

# `package-lock.json` and reproducible installs

When npm installs dependencies, it creates:

```text
package-lock.json
```

The lockfile records the exact dependency tree selected by npm.

Commit it:

```bash
git add package.json package-lock.json
git commit -m "Initialize Node project"
```

For local development:

```bash
npm install
```

For CI and production builds:

```bash
npm ci
```

`npm ci` expects a lockfile and installs the dependency tree from it. It is designed for clean, repeatable installations.

A typical CI sequence is:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Do not casually delete `package-lock.json` to solve a dependency problem. First understand what changed and whether the lockfile is part of the issue.

---

# Set up TypeScript

Install TypeScript and Node types:

```bash
npm install --save-dev typescript tsx @types/node
```

Generate a configuration file:

```bash
npx tsc --init
```

A good server-side TypeScript configuration might look like this:

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
    "sourceMap": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

A `tsconfig.json` file identifies the root of a TypeScript project and controls compiler behavior. [TypeScript `tsconfig.json` documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

The most important options are:

- `target` — JavaScript language level emitted
- `module` — module format
- `moduleResolution` — how imports are resolved
- `rootDir` — source directory
- `outDir` — compiled output directory
- `strict` — enables strict type checking
- `sourceMap` — generates source maps for debugging
- `declaration` — generates `.d.ts` files
- `noUncheckedIndexedAccess` — treats indexed access as potentially undefined

For a new Node project using native ESM, `NodeNext` is a practical choice because it follows Node’s module-resolution behavior.

---

# ESM imports and file extensions

With this project structure:

```text
src/
├── config.ts
└── server.ts
```

`src/server.ts` should import the compiled extension:

```ts
import { config } from "./config.js";
```

Even though the source file is `config.ts`, TypeScript will compile it to `config.js`, and Node executes the compiled JavaScript.

This is one of the most confusing details when starting a TypeScript project with native ESM.

An alternative is to use a bundler or a framework-specific toolchain that handles module resolution for you. But for a straightforward Node service, explicit ESM behavior is easier to understand in the long run.

---

# A complete TypeScript API example

Create the source directory:

```bash
mkdir -p src
```

Create `src/config.ts`:

```ts
const portValue = process.env.PORT ?? "3000";
const port = Number(portValue);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid PORT value: ${portValue}`);
}

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development"
} as const;
```

Create `src/server.ts`:

```ts
import Fastify from "fastify";
import { config } from "./config.js";

const app = Fastify({
  logger: true
});

app.get("/health", async () => {
  return {
    status: "ok",
    environment: config.nodeEnv
  };
});

app.get<{ Params: { name: string } }>("/hello/:name", async (request) => {
  return {
    message: `Hello, ${request.params.name}`
  };
});

const start = async (): Promise<void> => {
  try {
    await app.listen({
      host: "127.0.0.1",
      port: config.port
    });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};

await start();
```

Run it in development:

```bash
npm run dev
```

Test it from another terminal:

```bash
curl http://127.0.0.1:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "environment": "development"
}
```

Test the parameterized route:

```bash
curl http://127.0.0.1:3000/hello/Ada
```

The `tsx` package runs TypeScript directly during development and watches for changes. It does not replace the need to produce a production build.

---

# Development mode versus production mode

A useful setup separates development execution from production execution.

Development:

```bash
npm run dev
```

This might run TypeScript directly with a watcher.

Production:

```bash
npm run build
npm start
```

The build process compiles TypeScript:

```text
src/**/*.ts → dist/**/*.js
```

A complete `package.json` might look like:

```json
{
  "name": "example-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

The exact package versions will change over time. Let the lockfile record the versions installed for your project.

---

# npm scripts

The `scripts` field is the project’s command interface.

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Run a script:

```bash
npm run typecheck
```

Some commands have special shorthand:

```bash
npm test
npm start
```

The npm documentation describes lifecycle scripts and the `npm run <script>` behavior. [npm scripts documentation](https://docs.npmjs.com/cli/v11/using-npm/scripts/)

A useful rule is:

> If a command is part of the project workflow, put it in `package.json`.

That means everyone runs the same command:

```bash
npm run lint
```

instead of inventing local variations such as:

```bash
node ./some/deep/path/run-linter.js
```

## Passing arguments to scripts

Use `--` to pass arguments through npm:

```bash
npm run test -- --coverage
```

This runs the project’s test script and passes `--coverage` to the test runner.

## Environment variables in scripts

On Linux, this works:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch src/server.ts"
  }
}
```

But it is not portable to Windows shells. If your team works across operating systems, use a package such as `cross-env` or configure environment variables through the process that launches the application.

---

# Environment variables and configuration

Do not hard-code environment-specific values:

```ts
const databaseUrl = "postgres://localhost/my_database";
```

Use environment variables:

```ts
const databaseUrl = process.env.DATABASE_URL;
```

Create a local environment file:

```text
.env
```

Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://localhost/example
```

Add it to `.gitignore`:

```gitignore
.env
.env.*
!.env.example
```

Commit a safe template:

```text
.env.example
```

Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=
```

Applications should validate required configuration when they start. Failing early is much better than starting successfully and failing unpredictably later.

A simple configuration module:

```ts
const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const config = {
  databaseUrl: required("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3000)
} as const;
```

For larger applications, use a schema-validation library so configuration types and validation stay together.

Never commit:

- API keys
- Passwords
- JWT secrets
- Cloud credentials
- Production `.env` files

---

# Build a full-stack project

A full-stack application commonly contains:

```text
web application
    ↓ HTTP or WebSocket
Node.js API
    ↓
database, cache, queue, or external services
```

You can organize this as one repository:

```text
example-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/
│       ├── src/
│       └── package.json
├── package.json
├── package-lock.json
└── README.md
```

Or as separate repositories:

```text
example-api
example-web
example-infrastructure
```

A monorepo is convenient when the frontend and backend share types, linting rules, and release workflows.

A multi-repository setup can be simpler when teams deploy and version services independently.

## npm workspaces

A root `package.json` can define workspaces:

```json
{
  "name": "example-app",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:api": "npm run dev --workspace apps/api",
    "build": "npm run build --workspaces"
  }
}
```

Run a command in one workspace:

```bash
npm run dev --workspace apps/api
```

Install a dependency in a specific workspace:

```bash
npm install fastify --workspace apps/api
```

Install a shared package:

```bash
npm install zod --workspace packages/shared
```

Workspaces are useful, but avoid introducing a monorepo merely because it sounds sophisticated. Start with the simplest structure that supports the project.

---

# Share types between frontend and backend

A shared package can contain request and response types:

```text
packages/shared/
└── src/
    └── api.ts
```

Example:

```ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}
```

The API and frontend can import these types through a workspace package.

However, TypeScript types disappear at runtime. A type definition does not validate incoming JSON.

This is unsafe:

```ts
const body = request.body as CreateUserRequest;
```

The assertion tells TypeScript to trust you. It does not check the data.

For data received over HTTP, validate at runtime:

```ts
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

const body = createUserSchema.parse(request.body);
```

The general rule is:

> Use TypeScript for code you control and runtime validation for data that crosses a boundary.

Boundaries include:

- HTTP requests
- Environment variables
- Database rows
- Message queues
- Files
- User input
- Third-party APIs

---

# API design practices

For backend services:

## Validate input

Never assume a request body is correct.

Validate:

- Required fields
- Types
- String lengths
- Numeric ranges
- Enumerated values
- Authentication claims
- Pagination limits

## Return useful status codes

Common examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Avoid returning HTTP 200 for every situation.

## Separate transport and business logic

Avoid putting everything in a route handler:

```ts
app.post("/users", async (request, reply) => {
  // validate
  // query database
  // send email
  // apply business rules
  // format response
});
```

A more maintainable structure is:

```text
route handler
    ↓
service
    ↓
repository or external client
```

The route handles HTTP concerns. The service handles business rules. The repository handles persistence.

## Use consistent errors

Create a consistent error response:

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "The requested user does not exist"
  }
}
```

Do not expose stack traces, SQL statements, tokens, or internal paths in production responses.

## Add request IDs

Request IDs help connect a user-facing error to server logs.

A request ID can be:

- Generated at the edge
- Passed through from a reverse proxy
- Generated by the API if missing

Include it in logs and error responses where appropriate.

---

# TypeScript best practices

## Keep strict mode enabled

Use:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Strict mode catches many bugs before runtime.

## Avoid `any`

This removes type checking:

```ts
const value: any = getValue();
```

Prefer `unknown` when you do not know the type:

```ts
const value: unknown = getValue();
```

Then narrow it:

```ts
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

## Prefer narrow types

Instead of:

```ts
function processUser(user: object) {}
```

Use:

```ts
interface User {
  id: string;
  email: string;
}

function processUser(user: User) {}
```

## Avoid unnecessary type assertions

This can hide errors:

```ts
const user = value as User;
```

Prefer validation or type guards.

## Keep types close to the domain

Group related types:

```text
src/
├── users/
│   ├── user.types.ts
│   ├── user.service.ts
│   └── user.routes.ts
```

## Use explicit return types at boundaries

For exported functions and important services:

```ts
export async function createUser(
  input: CreateUserInput
): Promise<User> {
  // ...
}
```

You do not need to annotate every small local function, but explicit public boundaries make refactoring safer.

---

# Testing a Node.js application

A healthy project should make tests easy to run:

```bash
npm test
```

Use separate layers:

## Unit tests

Test a small function without a database or network:

```ts
export const add = (a: number, b: number): number => a + b;
```

Test:

```ts
import { describe, expect, it } from "vitest";
import { add } from "./add.js";

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

## Integration tests

Test multiple pieces together, such as:

- API route plus service
- Service plus database
- Repository against a test database

## End-to-end tests

Test the application from the user’s perspective, often including the browser and backend.

Do not make every test an end-to-end test. They are valuable but slower and more complicated to diagnose.

A useful progression is:

```text
many unit tests
some integration tests
a smaller number of end-to-end tests
```

---

# Linting and formatting

Formatting and linting solve different problems.

Formatting answers:

> Is the code written consistently?

Linting answers:

> Are there suspicious or error-prone patterns?

Common tools include:

- ESLint
- Prettier
- Biome
- TypeScript compiler checks

Add scripts such as:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

Run them in CI:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

Do not rely on a developer remembering to run them manually.

---

# Debugging Node.js

Print a stack trace for an error:

```ts
try {
  await doWork();
} catch (error) {
  console.error(error);
}
```

Use structured logging in services rather than scattered `console.log` statements.

Node supports an inspector:

```bash
node --inspect dist/server.js
```

Then connect with browser developer tools or an editor debugger.

For a development TypeScript command:

```bash
node --inspect-brk node_modules/.bin/tsx src/server.ts
```

The exact debugger command can vary by toolchain.

Useful runtime options include:

```bash
node --trace-warnings dist/server.js
node --trace-uncaught dist/server.js
```

Inspect the process from Ubuntu:

```bash
ps aux | grep node
ss -ltnp | grep ':3000'
sudo lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Check environment variables:

```bash
printenv NODE_ENV
printenv PORT
```

---

# Graceful shutdown

A server should stop accepting new work and close resources when it receives a termination signal.

```ts
const shutdown = async (signal: string): Promise<void> => {
  app.log.info(`Received ${signal}; shutting down`);

  try {
    await app.close();
    process.exitCode = 0;
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
```

This matters when:

- Deployments replace containers
- Kubernetes stops a pod
- systemd restarts a service
- You press `Ctrl-c`
- A process manager sends a signal

Without graceful shutdown, the application may leave connections open or terminate while requests are still in progress.

---

# Security practices

## Keep dependencies updated

Inspect outdated dependencies:

```bash
npm outdated
```

Check for known vulnerabilities:

```bash
npm audit
```

Apply compatible fixes:

```bash
npm audit fix
```

Do not run `npm audit fix --force` automatically in an important project. It may introduce major-version upgrades and breaking changes.

## Use lockfiles

Commit:

```text
package-lock.json
```

Use:

```bash
npm ci
```

in repeatable environments.

## Avoid arbitrary install scripts

npm packages can run lifecycle scripts during installation. Use well-known dependencies and review unexpected packages before adding them.

## Never trust input

Validate and constrain:

- Request bodies
- Query parameters
- File paths
- URLs
- Headers
- Cookies
- WebSocket messages
- Environment variables

## Keep secrets out of logs

Avoid:

```ts
console.log(request.headers);
```

Headers may contain authorization tokens or cookies.

---

# Production deployment

A basic production build looks like this:

```bash
npm ci
npm run typecheck
npm test
npm run build
NODE_ENV=production npm start
```

The production environment should normally contain:

```text
package.json
package-lock.json
dist/
node_modules/
```

Do not ship TypeScript source unless you specifically need it.

A simple Dockerfile might look like:

```Dockerfile
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

The exact Node image should match your project’s supported version.

Avoid installing `nvm` inside a production container unless you have a strong reason. A container image should normally use one explicit Node version.

---

# Common Node.js mistakes

## Installing Node from multiple sources

Avoid mixing:

- Ubuntu’s APT Node.js
- NodeSource
- nvm
- manually compiled Node
- a system-wide installation

This can produce confusing results where:

```bash
node --version
npm --version
command -v node
command -v npm
```

do not refer to the versions you expected.

If you use `nvm`, verify:

```bash
command -v node
command -v npm
nvm current
```

## Using `sudo npm install`

When using nvm, do not use `sudo` for normal package installation:

```bash
npm install
npm install --save-dev typescript
```

Using `sudo` can create root-owned files and cause later permission errors.

## Depending on globally installed tools

Avoid requiring developers to install:

```bash
npm install -g typescript
npm install -g eslint
npm install -g prettier
```

Install tools locally and run them through npm scripts.

## Ignoring the lockfile

The lockfile is part of the application’s dependency state. Commit it unless you are intentionally publishing a reusable package with a different policy.

## Running TypeScript directly in production

Development tools such as `tsx` are convenient, but production should generally run compiled JavaScript:

```bash
npm run build
node dist/server.js
```

## Assuming TypeScript validates external data

This does not validate anything:

```ts
const user = request.body as User;
```

Use runtime validation at external boundaries.

## Putting everything in one file

A small prototype can start with one file. Once the application grows, separate:

```text
routes
services
repositories
configuration
middleware
schemas
types
```

The goal is not to create dozens of folders. The goal is to keep responsibilities understandable.

---

# A recommended project layout

For a medium-sized TypeScript API:

```text
example-api/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── health/
│   │   └── health.routes.ts
│   ├── users/
│   │   ├── user.routes.ts
│   │   ├── user.schema.ts
│   │   ├── user.service.ts
│   │   └── user.types.ts
│   ├── app.ts
│   └── server.ts
├── test/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── .nvmrc
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

A useful separation is:

```text
app.ts
```

Creates and configures the application.

```text
server.ts
```

Starts listening on a network port.

This makes it easier to test the app without binding to a real port.

For example:

```ts
// app.ts
import Fastify from "fastify";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
};
```

```ts
// server.ts
import { buildApp } from "./app.js";

const app = buildApp();

await app.listen({
  host: "127.0.0.1",
  port: Number(process.env.PORT ?? 3000)
});
```

That structure makes integration tests simpler because they can import `buildApp()` without starting the entire process.

---

# A practical development routine

When starting work:

```bash
cd ~/projects/example-api
nvm use
npm install
```

Before making changes:

```bash
git pull --rebase
```

Start development:

```bash
npm run dev
```

In another terminal, run checks:

```bash
npm run typecheck
npm test
```

Before committing:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

Build the production output:

```bash
npm run build
```

Inspect the result:

```bash
find dist -maxdepth 2 -type f
```

Run the compiled application:

```bash
NODE_ENV=production npm start
```

---

# Essential commands

## Node

```bash
node --version
node script.js
node --inspect script.js
node -e "console.log(process.version)"
```

## npm

```bash
npm init -y
npm install
npm install package-name
npm install --save-dev package-name
npm uninstall package-name
npm update
npm outdated
npm audit
npm ci
npm run script-name
```

## npx

```bash
npx tsc --init
npx package-name
npx package-name@version
```

## nvm

```bash
nvm ls
nvm ls-remote
nvm install --lts
nvm install 22
nvm use 22
nvm alias default 22
nvm current
```

## Project checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

---

# Final recommendations

For a new Node.js and TypeScript project on Ubuntu, this is a solid starting point:

1. Use `nvm` to manage Node versions.
2. Use an LTS version of Node for most production work.
3. Commit a `.nvmrc` file.
4. Keep dependencies local to the project.
5. Commit `package-lock.json`.
6. Use `npm ci` in CI and production builds.
7. Put common commands in `package.json` scripts.
8. Enable strict TypeScript checking.
9. Validate all external input at runtime.
10. Separate development execution from production execution.
11. Keep secrets in environment variables, not source code.
12. Test, type-check, lint, and build before opening a pull request.
13. Prefer asynchronous Node APIs in request-handling code.
14. Handle shutdown signals gracefully.
15. Keep the project structure understandable rather than overly abstract.

The tools themselves are not the hard part. The real skill is creating a predictable environment where another developer can clone the repository, run a few commands, and know exactly how the application is supposed to work.

That is what a good Node.js project should provide.