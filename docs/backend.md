# Building Web Backends with Node.js and TypeScript

Node.js is a remarkably capable backend runtime, but it does not give you a complete backend architecture by itself.

Node gives you the runtime and standard library. TypeScript gives you static types. A web framework gives you routing, middleware, request parsing, validation hooks, plugins, and a structure for building applications.

The challenge is deciding how much structure you actually need.

For a small API, Express or Fastify may be enough. For a large application with several teams, NestJS can provide useful conventions. For edge-friendly or multi-runtime applications, Hono is worth considering.

This tutorial explains the backend fundamentals first, compares the most useful Node.js and TypeScript frameworks, and then builds a small REST API with Fastify and TypeScript.

The example will be a notes API with endpoints for:

```text
GET    /health
GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

We will cover:

- Node.js backend architecture
- HTTP requests and responses
- Framework selection
- Project setup on Ubuntu
- TypeScript configuration
- Routing
- Validation
- Error handling
- Middleware and plugins
- Service and repository layers
- Testing
- Logging
- Configuration
- Security
- Graceful shutdown
- Production deployment

---

# What a backend actually does

A web backend receives requests, performs work, and sends responses.

A typical request looks like this:

```text
Client
  │
  │ HTTP request
  ▼
Web server
  │
  ├── Routing
  ├── Authentication
  ├── Validation
  ├── Business logic
  ├── Database access
  └── Response formatting
  │
  ▼
HTTP response
```

For example:

```http
POST /api/notes HTTP/1.1
Content-Type: application/json

{
  "title": "Learn Fastify",
  "body": "Build a small API"
}
```

The backend might respond:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "note_123",
  "title": "Learn Fastify",
  "body": "Build a small API"
}
```

A backend normally has several responsibilities:

- Accept requests
- Parse URLs, headers, cookies, and bodies
- Authenticate users
- Authorize actions
- Validate input
- Execute business rules
- Read and write data
- Call external services
- Return useful errors
- Produce logs and metrics
- Shut down cleanly
- Protect sensitive information

The framework helps with the mechanics, but your application is still responsible for the decisions.

---

# How Node.js works on the backend

Node.js is a JavaScript runtime built around the V8 JavaScript engine. It can run JavaScript outside the browser and provides APIs for files, networking, processes, streams, and operating-system integration. [Node.js introduction](https://nodejs.org/learn)

Node is especially good at I/O-heavy work:

- HTTP APIs
- WebSocket servers
- Database-backed applications
- Proxies
- Queues
- Real-time services
- Command-line tools

Node uses an event-driven model. When the application is waiting for a database or network response, the JavaScript thread can continue handling other events.

A simplified example:

```ts
const user = await database.users.findById(id);
return user;
```

The process is waiting for the database, but it does not need to sit idle in the same way a blocking program would.

## What Node is not ideal for

Node is not automatically the best choice for long-running CPU-heavy work such as:

- Video encoding
- Large image processing
- Scientific computation
- Complex data analysis
- Cryptographic workloads performed synchronously

For those workloads, consider:

- Worker threads
- Child processes
- A separate service
- A job queue
- A specialized runtime

The important rule is:

> Avoid blocking the main event loop with expensive synchronous work.

This is usually problematic inside an HTTP request handler:

```ts
import { readFileSync } from "node:fs";

app.get("/report", () => {
  const report = readFileSync("large-report.json", "utf8");
  return report;
});
```

Prefer asynchronous APIs:

```ts
import { readFile } from "node:fs/promises";

app.get("/report", async () => {
  const report = await readFile("large-report.json", "utf8");
  return report;
});
```

---

# The main Node.js backend frameworks

There is no single “best” framework. The right choice depends on how much structure, performance, compatibility, and portability you need.

## Express

Express is the most familiar general-purpose Node web framework.

It is:

- Minimal
- Flexible
- Widely used
- Easy to understand
- Supported by a large middleware ecosystem

Express does not force a project architecture. That is both its strength and its weakness.

A small Express application can be very clear:

```ts
import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(3000);
```

Express is a good choice when:

- You want minimal abstraction
- You are joining an existing Express codebase
- You want a huge middleware ecosystem
- Your team already knows Express
- You prefer to design your own architecture

Express does not include its own TypeScript definitions, so TypeScript projects commonly install `@types/express` and `@types/node`. [Express TypeScript setup](https://expressjs.com/en/5x/starter/installing/)

## Fastify

Fastify is a performance-oriented Node.js framework with a plugin architecture, schema support, structured logging, and strong TypeScript support.

Fastify is a good choice when:

- You want a relatively lightweight framework
- You care about throughput and low overhead
- You want structured plugins
- You want request and response schemas
- You prefer a more opinionated foundation than Express

Fastify’s plugin model encourages you to isolate features such as:

- Authentication
- Database connections
- Routes
- Metrics
- Serialization
- Configuration

We will use Fastify for the example in this tutorial.

## NestJS

NestJS is a structured application framework built with and for TypeScript. It uses concepts such as:

- Modules
- Controllers
- Providers
- Dependency injection
- Guards
- Pipes
- Interceptors
- Exception filters

NestJS uses Express by default and can also use Fastify as an adapter. [NestJS introduction](https://docs.nestjs.com/introduction)

Nest is a good choice when:

- You are building a large application
- Multiple teams need consistent conventions
- Dependency injection is valuable to your design
- You want built-in patterns for authentication, validation, testing, and modules
- Your team likes Angular-style architecture

The downside is that Nest adds more framework-specific concepts. For a small service, that may be unnecessary overhead.

## Hono

Hono is a lightweight framework built around Web Standards APIs. It can run on Node.js and several other JavaScript runtimes and platforms. [Hono on Node.js](https://hono.dev/docs/getting-started/nodejs)

Hono is a good option when:

- You want a small and fast routing layer
- You may deploy to multiple runtimes
- You are building edge functions or serverless services
- You prefer the Fetch API model
- You want a portable framework

It is especially interesting for applications that may run on Node.js, Cloudflare Workers, Deno, Bun, or other environments.

## Koa

Koa comes from the creators of Express and is a smaller, middleware-focused framework.

It is useful when:

- You want a small core
- You like async middleware
- You are comfortable assembling your own stack

Koa is less convention-heavy than NestJS and less batteries-included than some newer options.

## AdonisJS

AdonisJS is a more integrated backend framework with conventions for:

- Routing
- Validation
- Authentication
- ORM
- Migrations
- Queues
- Mail
- Testing

It can be a good choice when you want a framework that feels closer to a traditional full-stack MVC framework rather than assembling every backend component yourself.

---

# Which framework should you choose?

A practical decision guide:

| Situation                               | Good starting point  |
| --------------------------------------- | -------------------- |
| Small API or internal service           | Fastify or Express   |
| Existing Express ecosystem              | Express              |
| Large TypeScript application            | NestJS               |
| Edge or multi-runtime deployment        | Hono                 |
| Full-stack convention-heavy application | AdonisJS             |
| Maximum control and minimal abstraction | Node HTTP or Fastify |

For this tutorial, Fastify is a good middle ground. It is lightweight enough to understand, but it provides useful features that you would otherwise have to assemble yourself.

---

# Install Node.js on Ubuntu

Use `nvm` to manage Node versions:

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

Install the current LTS line:

```bash
nvm install --lts
nvm alias default lts/*
```

Check your versions:

```bash
node --version
npm --version
```

Create a project directory:

```bash
mkdir -p ~/projects/notes-api
cd ~/projects/notes-api
```

Pin a Node version:

```bash
echo "22" > .nvmrc
nvm install
nvm use
```

---

# Create the Fastify project

Initialize npm:

```bash
npm init -y
```

Install runtime dependencies:

```bash
npm install fastify zod
```

Install development dependencies:

```bash
npm install --save-dev \
  typescript \
  tsx \
  @types/node
```

We are using:

- `fastify` for HTTP routing and server behavior
- `zod` for runtime validation
- `typescript` for static type checking
- `tsx` for running TypeScript during development
- `@types/node` for Node.js type definitions

---

# Configure `package.json`

Replace the generated `package.json` with:

```json
{
  "name": "notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "node --test"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

The exact versions may differ when you install them. The lockfile records the versions actually selected.

Create the source directory:

```bash
mkdir src
touch src/server.ts
touch tsconfig.json
touch .gitignore
```

Add `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

---

# Configure TypeScript

Create `tsconfig.json`:

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
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

The important settings are:

```json
"strict": true
```

Enable strict type checking.

```json
"module": "NodeNext"
```

Use Node-compatible module behavior.

```json
"rootDir": "src",
"outDir": "dist"
```

Compile source files into `dist`.

```json
"sourceMap": true
```

Make debugging compiled code easier.

---

# Create the application structure

Start with this layout:

```text
src/
├── app.ts
├── config.ts
├── errors.ts
├── server.ts
└── notes/
    ├── note.repository.ts
    ├── note.routes.ts
    ├── note.schemas.ts
    ├── note.service.ts
    └── note.types.ts
```

This may look like a lot of files for a small example, but each file has a clear job.

```text
config.ts
    Environment configuration

errors.ts
    Application error types

app.ts
    Fastify application setup

server.ts
    Process startup and shutdown

note.types.ts
    Domain types

note.schemas.ts
    Runtime input validation

note.repository.ts
    Data access

note.service.ts
    Business rules

note.routes.ts
    HTTP routes
```

This separation is more useful than organizing files by arbitrary technical labels such as “controllers” and “utils” without a clear purpose.

---

# Configuration

Create `src/config.ts`:

```ts
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("127.0.0.1")
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid environment configuration");
  console.error(parsedEnvironment.error.format());
  process.exit(1);
}

export const config = parsedEnvironment.data;
```

Environment variables are external input. Although they come from the operating system, they are still untrusted strings.

The schema converts:

```text
PORT="3000"
```

into:

```ts
PORT: 3000
```

Create an optional `.env.example`:

```env
NODE_ENV=development
PORT=3000
HOST=127.0.0.1
```

Do not commit a real `.env` file containing secrets.

For this example, we are using the shell environment directly. In a larger application, load environment files through a dedicated configuration package or your deployment platform.

---

# Define the note type

Create `src/notes/note.types.ts`:

```ts
export interface Note {
  id: string;
  title: string;
  body: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  body: string;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  archived?: boolean;
}
```

These types are useful inside the application, but they do not validate HTTP request bodies.

TypeScript disappears at runtime. If a client sends invalid JSON, TypeScript cannot protect your application by itself.

That is why the next file uses Zod.

---

# Validate request data

Create `src/notes/note.schemas.ts`:

```ts
import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(10_000)
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    body: z.string().trim().max(10_000).optional(),
    archived: z.boolean().optional()
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided"
  );

export const noteIdSchema = z.object({
  id: z.string().min(1)
});

export type CreateNoteBody = z.infer<typeof createNoteSchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteSchema>;
```

There are two distinct layers here:

```text
TypeScript
    Helps developers write correct code

Zod
    Validates actual runtime data
```

Use runtime validation at boundaries:

- HTTP request bodies
- Query parameters
- Environment variables
- Database results
- Message queue payloads
- External API responses

---

# Build a repository

Create `src/notes/note.repository.ts`:

```ts
import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput
} from "./note.types.js";

export interface NoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | undefined>;
  create(input: CreateNoteInput): Promise<Note>;
  update(id: string, input: UpdateNoteInput): Promise<Note | undefined>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes = new Map<string, Note>();

  async findAll(): Promise<Note[]> {
    return [...this.notes.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  async findById(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const now = new Date().toISOString();

    const note: Note = {
      id: crypto.randomUUID(),
      title: input.title,
      body: input.body,
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    this.notes.set(note.id, note);

    return note;
  }

  async update(
    id: string,
    input: UpdateNoteInput
  ): Promise<Note | undefined> {
    const existing = this.notes.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Note = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.notes.set(id, updated);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }
}
```

This repository stores data in memory. It is useful for learning, but the data disappears whenever the process restarts.

The important design decision is that the rest of the application depends on the `NoteRepository` interface rather than directly on the `Map`.

Later, we can replace the implementation with:

```text
PostgresNoteRepository
MongoNoteRepository
SqliteNoteRepository
```

without changing the routes or service layer.

---

# Add application errors

Create `src/errors.ts`:

```ts
export class NotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
```

A typed error makes it possible for the application to distinguish:

```text
Not found
Validation failure
Authentication failure
Permission failure
Unexpected server failure
```

from one another.

---

# Build the service layer

Create `src/notes/note.service.ts`:

```ts
import { NotFoundError } from "../errors.js";
import type { NoteRepository } from "./note.repository.js";
import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput
} from "./note.types.js";

export class NoteService {
  constructor(private readonly repository: NoteRepository) {}

  async listNotes(): Promise<Note[]> {
    return this.repository.findAll();
  }

  async getNote(id: string): Promise<Note> {
    const note = await this.repository.findById(id);

    if (!note) {
      throw new NotFoundError(`Note ${id} was not found`);
    }

    return note;
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    return this.repository.create(input);
  }

  async updateNote(
    id: string,
    input: UpdateNoteInput
  ): Promise<Note> {
    const note = await this.repository.update(id, input);

    if (!note) {
      throw new NotFoundError(`Note ${id} was not found`);
    }

    return note;
  }

  async deleteNote(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Note ${id} was not found`);
    }
  }
}
```

The service layer contains application behavior.

The route should not need to know:

- Whether data lives in memory or PostgreSQL
- How IDs are generated
- How a missing note is represented
- How updates are persisted

That is the service’s job.

A clean backend often has this flow:

```text
HTTP route
   ↓
Input validation
   ↓
Service
   ↓
Repository
   ↓
Database or external system
```

---

# Create the routes

Create `src/notes/note.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import {
  createNoteSchema,
  noteIdSchema,
  updateNoteSchema
} from "./note.schemas.js";
import type { NoteService } from "./note.service.js";

export async function registerNoteRoutes(
  app: FastifyInstance,
  noteService: NoteService
): Promise<void> {
  app.get("/api/notes", async () => {
    return noteService.listNotes();
  });

  app.get<{ Params: { id: string } }>(
    "/api/notes/:id",
    async (request) => {
      const params = noteIdSchema.parse(request.params);

      return noteService.getNote(params.id);
    }
  );

  app.post("/api/notes", async (request, reply) => {
    const input = createNoteSchema.parse(request.body);
    const note = await noteService.createNote(input);

    return reply.code(201).send(note);
  });

  app.patch<{ Params: { id: string } }>(
    "/api/notes/:id",
    async (request) => {
      const params = noteIdSchema.parse(request.params);
      const input = updateNoteSchema.parse(request.body);

      return noteService.updateNote(params.id, input);
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/api/notes/:id",
    async (request, reply) => {
      const params = noteIdSchema.parse(request.params);

      await noteService.deleteNote(params.id);

      return reply.code(204).send();
    }
  );
}
```

The generic type:

```ts
app.get<{ Params: { id: string } }>(
  "/api/notes/:id",
  async (request) => {
    // request.params.id is typed as string
  }
);
```

tells TypeScript what route parameters exist.

The runtime schema still validates the actual value:

```ts
const params = noteIdSchema.parse(request.params);
```

Static typing and runtime validation complement each other.

---

# Create the Fastify application

Create `src/app.ts`:

```ts
import Fastify, {
  type FastifyInstance
} from "fastify";
import { ZodError } from "zod";
import { ValidationError } from "./errors.js";
import {
  InMemoryNoteRepository
} from "./notes/note.repository.js";
import { registerNoteRoutes } from "./notes/note.routes.js";
import { NoteService } from "./notes/note.service.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  const noteRepository = new InMemoryNoteRepository();
  const noteService = new NoteService(noteRepository);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "notes-api"
    };
  });

  app.register(async (notesApp) => {
    await registerNoteRoutes(notesApp, noteService);
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "The request data is invalid",
          details: error.issues
        }
      });
    }

    if (error instanceof ValidationError) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    app.log.error(error);

    return reply.code(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred"
      }
    });
  });

  return app;
}
```

The `buildApp()` function creates the application but does not start listening on a port.

That distinction is valuable:

```text
buildApp()
    Creates an application for tests or production

server.ts
    Starts the process and binds to a port
```

Testing is much easier when application construction and process startup are separate.

---

# Start the server

Create `src/server.ts`:

```ts
import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = buildApp();

try {
  await app.listen({
    host: config.HOST,
    port: config.PORT
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}

async function shutdown(signal: string): Promise<void> {
  app.log.info(`Received ${signal}; shutting down`);

  try {
    await app.close();
    process.exitCode = 0;
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
```

This server:

- Builds the Fastify app
- Listens on the configured host and port
- Logs startup failures
- Handles `SIGINT`
- Handles `SIGTERM`
- Closes the application cleanly

Graceful shutdown matters when:

- A container is being replaced
- A process manager restarts the application
- Kubernetes terminates a pod
- A deployment is rolling forward
- You stop the server with `Ctrl-C`

---

# Run the API

Start development mode:

```bash
npm run dev
```

You should see Fastify start on:

```text
http://127.0.0.1:3000
```

Check the health endpoint:

```bash
curl http://127.0.0.1:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "notes-api"
}
```

Create a note:

```bash
curl -X POST http://127.0.0.1:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Fastify",
    "body": "Build a small API with TypeScript"
  }'
```

List notes:

```bash
curl http://127.0.0.1:3000/api/notes
```

Copy the returned ID and retrieve the note:

```bash
curl http://127.0.0.1:3000/api/notes/NOTE_ID
```

Update it:

```bash
curl -X PATCH http://127.0.0.1:3000/api/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "archived": true
  }'
```

Delete it:

```bash
curl -X DELETE http://127.0.0.1:3000/api/notes/NOTE_ID
```

---

# Check invalid input

Send an invalid request:

```bash
curl -i -X POST http://127.0.0.1:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }'
```

The API should return a `400` response with structured error information.

A useful API error shape looks like:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "path": ["title"],
        "message": "Too small: expected string to have >=1 characters"
      }
    ]
  }
}
```

Clients can use the stable `code` field programmatically, while the `message` remains readable by developers and users.

---

# REST API design

Our API follows common REST conventions.

## List resources

```http
GET /api/notes
```

Returns:

```http
200 OK
```

## Read one resource

```http
GET /api/notes/:id
```

Returns:

```http
200 OK
```

or:

```http
404 Not Found
```

## Create a resource

```http
POST /api/notes
```

Returns:

```http
201 Created
```

## Update a resource

```http
PATCH /api/notes/:id
```

`PATCH` is useful for partial updates.

Returns:

```http
200 OK
```

## Delete a resource

```http
DELETE /api/notes/:id
```

Returns:

```http
204 No Content
```

The HTTP method and status code should communicate what happened. Avoid returning `200 OK` for every possible result.

---

# Add pagination

An endpoint that returns every row will eventually become a problem.

A basic pagination model might use:

```http
GET /api/notes?page=2&pageSize=20
```

A route can parse query parameters:

```ts
import { z } from "zod";

const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
});
```

The service can return:

```json
{
  "items": [],
  "page": 2,
  "pageSize": 20,
  "total": 148,
  "totalPages": 8
}
```

Use a maximum page size. Never let a client request:

```http
?pageSize=100000000
```

without limits.

For large datasets, cursor-based pagination may be better:

```http
GET /api/notes?cursor=eyJpZCI6...
```

---

# Add authentication and authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this action?

These are different problems.

A typical request pipeline looks like:

```text
Request
  ↓
Parse credentials
  ↓
Authenticate identity
  ↓
Load user
  ↓
Check permission
  ↓
Run business logic
```

Do not confuse authentication with authorization.

A user may be authenticated but still unable to:

- Delete another user’s note
- Read an admin-only resource
- Change billing settings
- Access a private project

Authorization should be enforced on the backend, not only in the frontend.

---

# Database integration

Our in-memory repository is easy to replace.

The rest of the application depends on:

```ts
export interface NoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | undefined>;
  create(input: CreateNoteInput): Promise<Note>;
  update(id: string, input: UpdateNoteInput): Promise<Note | undefined>;
  delete(id: string): Promise<boolean>;
}
```

A PostgreSQL implementation can satisfy the same interface:

```ts
export class PostgresNoteRepository
  implements NoteRepository
{
  async findAll(): Promise<Note[]> {
    // Query PostgreSQL
  }

  async findById(id: string): Promise<Note | undefined> {
    // Query PostgreSQL
  }

  async create(input: CreateNoteInput): Promise<Note> {
    // Insert row
  }

  async update(
    id: string,
    input: UpdateNoteInput
  ): Promise<Note | undefined> {
    // Update row
  }

  async delete(id: string): Promise<boolean> {
    // Delete row
  }
}
```

The service does not need to know whether the data comes from:

- A `Map`
- PostgreSQL
- MySQL
- MongoDB
- Redis
- Another HTTP service

That is the purpose of the repository boundary.

Popular Node.js database tools include:

- Prisma
- Drizzle
- Knex
- TypeORM
- Sequelize
- Mongoose for MongoDB
- Native database drivers

Choose based on your database, team experience, migration needs, and query complexity.

Do not choose an ORM simply because it is fashionable. If your application depends on complex SQL, make sure the ORM gives you a comfortable escape hatch.

---

# Testing the application

The application is structured so `buildApp()` can be imported into tests.

Node has a built-in test runner:

```bash
npm test
```

Create a test file:

```bash
mkdir test
touch test/health.test.ts
```

Because Node’s built-in test runner does not automatically execute TypeScript in every project setup, you can use a script with `tsx`:

```json
{
  "scripts": {
    "test": "tsx --test test/**/*.test.ts"
  }
}
```

Example test:

```ts
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildApp } from "../src/app.js";

describe("health endpoint", () => {
  const app = buildApp();

  before(async () => {
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it("returns an ok response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      status: "ok",
      service: "notes-api"
    });
  });
});
```

Fastify’s injection mechanism allows you to test routes without opening a real TCP port.

You should test at several levels:

## Unit tests

Test a small function or service in isolation.

```text
NoteService
Note validation
Pagination logic
Authorization rules
```

## Integration tests

Test multiple components together:

```text
Route + service + repository
API + test database
```

## End-to-end tests

Test the full system from outside:

```text
HTTP client → running application → database
```

A balanced test suite usually contains many fast unit tests, a useful set of integration tests, and fewer end-to-end tests.

---

# Logging

Logging is more useful than scattered `console.log` statements.

A production backend should be able to answer:

- Which request failed?
- Which user made it?
- How long did it take?
- Which external dependency timed out?
- What changed immediately before the failure?

Fastify includes structured logging through Pino.

The application already enables it:

```ts
const app = Fastify({
  logger: true
});
```

Log useful events:

```ts
app.log.info({ noteId }, "Note created");
```

Log failures with context:

```ts
app.log.error(
  {
    error,
    noteId
  },
  "Failed to load note"
);
```

Do not log:

- Passwords
- Access tokens
- Session cookies
- Full authorization headers
- Payment information
- Unfiltered personal data

Use request IDs so logs can be correlated across services.

---

# Error handling

A backend should distinguish expected errors from unexpected errors.

Expected errors:

```text
400 Invalid input
401 Missing authentication
403 Insufficient permission
404 Resource not found
409 Conflict
429 Too many requests
```

Unexpected errors:

```text
Database unavailable
Programming bug
Corrupt response from external service
Out-of-memory failure
```

Do not expose internal details:

```ts
return reply.code(500).send({
  error: error.stack
});
```

That can reveal:

- File paths
- SQL statements
- Secrets embedded in messages
- Internal architecture
- Sensitive identifiers

Return a safe public message and log the detailed error privately.

---

# Security fundamentals

## Validate input

Validate all external input:

- Request body
- Query strings
- Route parameters
- Headers
- Cookies
- File uploads
- WebSocket messages
- Environment variables

## Use parameterized database queries

Never build SQL with string concatenation:

```ts
const query = `SELECT * FROM users WHERE id = '${id}'`;
```

Use parameterized queries or a safe query builder.

## Set security headers

Use framework-supported security middleware or a reverse proxy to configure headers such as:

- Content Security Policy
- Strict Transport Security
- X-Content-Type-Options
- Referrer Policy
- Frame protections

## Configure CORS deliberately

Do not automatically allow every origin in production:

```ts
origin: "*"
```

Explicitly configure the frontend origins that should be allowed.

## Rate-limit public endpoints

Rate limits are useful for:

- Login
- Password reset
- Account creation
- Search
- Expensive reports
- Public APIs

## Keep dependencies updated

Run:

```bash
npm outdated
npm audit
```

Do not blindly apply major upgrades to production without testing.

## Keep secrets outside Git

Use environment variables or a secret manager.

Never commit:

```text
.env
private keys
API tokens
database passwords
cloud credentials
```

---

# Performance practices

## Avoid unnecessary synchronous work

Do not use synchronous filesystem or cryptographic functions inside request handlers unless the operation is trivial and intentional.

## Paginate database queries

Never return an unbounded table.

## Add timeouts

External requests should have timeouts:

```ts
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 5_000);

try {
  const response = await fetch("https://example.com/data", {
    signal: controller.signal
  });

  return await response.json();
} finally {
  clearTimeout(timeout);
}
```

## Cache carefully

Cache data that is:

- Expensive to calculate
- Read frequently
- Safe to reuse briefly

Be careful with stale data and invalidation.

## Use background jobs

Do not make users wait for work that could happen asynchronously:

```text
HTTP request
   ↓
Create job
   ↓
Return 202 Accepted
   ↓
Worker processes job
```

Examples:

- Sending email
- Generating reports
- Image processing
- Importing large files
- Synchronizing external data

---

# Production build

Build the TypeScript:

```bash
npm run build
```

The output should look like:

```text
dist/
├── app.js
├── config.js
├── errors.js
├── server.js
└── notes/
    ├── note.repository.js
    ├── note.routes.js
    ├── note.schemas.js
    ├── note.service.js
    └── note.types.js
```

Install exactly from the lockfile:

```bash
npm ci
```

Run type checking:

```bash
npm run typecheck
```

Start the compiled application:

```bash
NODE_ENV=production npm start
```

A typical CI pipeline should run:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

---

# Containerize the application

A basic Dockerfile:

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

Important container practices:

- Use a specific Node major version.
- Do not run as root when unnecessary.
- Use `npm ci`.
- Copy only the files needed at runtime.
- Keep secrets out of the image.
- Configure environment variables at deployment time.
- Expose the port the application listens on.

---

# Production architecture

A typical production Node backend looks like:

```text
Internet
   ↓
Load balancer or reverse proxy
   ↓
Node.js application instances
   ↓
Database
   ├── Redis
   ├── Queue
   └── External services
```

Node processes are usually kept stateless.

That means:

- Store sessions in a shared store, not process memory.
- Store uploads in object storage, not the local filesystem.
- Store data in a database, not a local `Map`.
- Use external queues for durable background work.
- Keep configuration outside the application image.

If you run multiple Node instances, do not assume a request will reach the same instance twice.

---

# How the frameworks differ in practice

## Express architecture

With Express, you usually assemble the application yourself:

```text
server.ts
  ├── middleware
  ├── routes
  ├── controllers
  ├── services
  ├── repositories
  └── error handler
```

This can remain simple, but teams need to agree on conventions.

## Fastify architecture

Fastify’s plugin model maps naturally to feature modules:

```text
app.ts
  ├── auth plugin
  ├── database plugin
  ├── notes plugin
  ├── metrics plugin
  └── error handling
```

This makes Fastify attractive for services that want modularity without a large framework layer.

## NestJS architecture

NestJS typically looks like:

```text
app.module.ts
  ├── NotesModule
  │   ├── NotesController
  │   ├── NotesService
  │   └── NotesRepository
  ├── UsersModule
  ├── AuthModule
  └── DatabaseModule
```

Nest’s conventions can make large codebases easier to navigate, especially when many developers are involved.

## Hono architecture

Hono often has a compact route-oriented shape:

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (context) => {
  return context.json({ status: "ok" });
});
```

Its Web Standards-oriented API is useful when code may run across Node.js, edge runtimes, and serverless platforms.

---

# Recommended backend habits

A good Node.js backend should generally:

1. Use an LTS Node version.
2. Pin the project version with `.nvmrc` or `engines`.
3. Use TypeScript strict mode.
4. Validate runtime input.
5. Keep routes thin.
6. Put business rules in services.
7. Keep database access behind a repository boundary.
8. Use structured logging.
9. Handle shutdown signals.
10. Use consistent error responses.
11. Add request timeouts.
12. Paginate list endpoints.
13. Avoid synchronous work in request handlers.
14. Keep secrets outside the repository.
15. Run type checks and tests in CI.
16. Use `npm ci` for reproducible installation.
17. Document local setup in `README.md`.
18. Make health checks easy to call.
19. Separate application construction from process startup.
20. Keep the architecture understandable.

---

# Final thoughts

Node.js gives you a fast, flexible foundation for backend development. TypeScript makes large codebases easier to reason about. Frameworks provide the layer between raw HTTP and your application’s business logic.

The best framework is usually the one that matches the project’s size and the team’s working style:

- Use Express when you want familiarity and flexibility.
- Use Fastify when you want a lightweight, structured, high-performance API framework.
- Use NestJS when you need strong conventions and a large application architecture.
- Use Hono when portability across runtimes matters.
- Use AdonisJS when you want a more integrated, full-stack backend framework.

The framework is not the architecture.

A maintainable backend still needs clear boundaries:

```text
HTTP transport
    ↓
Validation
    ↓
Business logic
    ↓
Persistence
    ↓
External systems
```

Once those boundaries are clear, changing frameworks becomes much less frightening. The routing syntax may change, but the important design decisions—validation, authorization, error handling, persistence, observability, and deployment—remain familiar.