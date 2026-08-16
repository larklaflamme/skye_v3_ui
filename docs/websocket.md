# WebSockets with Node.js and TypeScript: A Backend Developer’s Guide

HTTP is excellent for request-and-response APIs:

```text
Client → Request → Server
Client ← Response ← Server
```

But some applications need the server to send information without waiting for a new request.

Examples include:

- Chat applications
- Live notifications
- Multiplayer games
- Collaborative editing
- Trading dashboards
- Delivery tracking
- Real-time monitoring
- Build and deployment logs
- Presence indicators
- Live data feeds

That is where WebSockets are useful.

A WebSocket creates a long-lived, two-way connection between a client and a server. The browser can send messages to the backend, and the backend can send messages back whenever it needs to.

The browser has a native `WebSocket` API. On Node.js, one of the most widely used server libraries is `ws`. Fastify also provides an official WebSocket plugin built on top of `ws`. [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) [Fastify WebSocket plugin](https://www.npmjs.com/package/%40fastify/websocket)

This tutorial builds a real-time notification server with:

- Node.js
- TypeScript
- Fastify
- `@fastify/websocket`
- A browser client
- A Node.js service-to-service WebSocket client
- Message validation
- Authentication concepts
- Heartbeats
- Reconnection
- Rooms
- Backpressure
- Production deployment guidance

---

# WebSocket fundamentals

A WebSocket connection starts as an HTTP request.

The client sends an HTTP upgrade request:

```http
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ...
Sec-WebSocket-Version: 13
```

If the server accepts the upgrade, the connection changes from HTTP to WebSocket:

```text
HTTP handshake
      ↓
WebSocket connection
      ↓
Bidirectional messages
```

After the upgrade, messages can travel in either direction:

```text
Browser ───────────────► Backend
Browser ◄────────────── Backend
```

The connection remains open until:

- The client closes it
- The server closes it
- The network fails
- A proxy times it out
- The process shuts down

The browser API exposes events such as:

```ts
socket.addEventListener("open", ...)
socket.addEventListener("message", ...)
socket.addEventListener("error", ...)
socket.addEventListener("close", ...)
```

The browser WebSocket API does not provide automatic backpressure. If messages arrive faster than the application can process them, the browser may buffer too much data or become unresponsive. [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

That means real-time systems need to think about:

- Message rate
- Message size
- Connection limits
- Slow clients
- Reconnection
- Heartbeats
- Backpressure
- Authentication
- Authorization

---

# When WebSockets are appropriate

WebSockets are useful when the server needs to push events quickly.

Good use cases:

```text
Chat messages
Live notifications
Presence updates
Collaborative editing
Game state
Real-time dashboards
Streaming job progress
```

They are not automatically better than HTTP.

Use ordinary HTTP when:

- The client asks for a resource occasionally
- Updates do not need to be immediate
- The server does not need to initiate communication
- Caching is valuable
- A request-response API is simpler

Also consider Server-Sent Events when communication is only server-to-client:

```text
Server → Client
```

WebSockets are bidirectional:

```text
Server ⇄ Client
```

For durable service-to-service communication, a message broker such as NATS, RabbitMQ, Kafka, or Redis Streams is often a better fit. WebSockets are live connections; they do not automatically provide durable delivery, replay, consumer groups, or reliable acknowledgements.

---

# Create the project

Create a Node.js project:

```bash
mkdir -p ~/projects/realtime-api
cd ~/projects/realtime-api
```

Use an LTS Node version:

```bash
echo "22" > .nvmrc
nvm install
nvm use
```

Initialize npm:

```bash
npm init -y
```

Install runtime dependencies:

```bash
npm install fastify @fastify/websocket zod
```

Install development dependencies:

```bash
npm install --save-dev \
  typescript \
  tsx \
  @types/node \
  @types/ws
```

The `@fastify/websocket` plugin includes its own types, but TypeScript projects also need the types for the underlying `ws` package. [Fastify WebSocket package](https://www.npmjs.com/package/%40fastify/websocket)

Create the project structure:

```bash
mkdir -p src/ws
touch src/server.ts
touch src/app.ts
touch src/config.ts
touch src/ws/protocol.ts
touch src/ws/connection-manager.ts
touch src/ws/ws-routes.ts
touch tsconfig.json
touch .env.example
touch .gitignore
```

---

# Configure `package.json`

```json
{
  "name": "realtime-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/websocket": "^11.0.0",
    "fastify": "^5.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/ws": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

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
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Create `.env.example`:

```env
NODE_ENV=development
PORT=3000
WS_TOKEN=development-token
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

---

# Design a WebSocket message protocol

Do not send arbitrary strings throughout the application.

Define a message format.

A useful envelope looks like this:

```json
{
  "type": "chat.send",
  "requestId": "req-123",
  "payload": {
    "text": "Hello"
  }
}
```

The server might respond with:

```json
{
  "type": "chat.message",
  "payload": {
    "senderId": "user-1",
    "text": "Hello",
    "sentAt": "2026-08-14T12:00:00.000Z"
  }
}
```

For errors:

```json
{
  "type": "error",
  "requestId": "req-123",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "The message is invalid"
  }
}
```

The `type` field tells the receiver what kind of message it is.

The `requestId` lets a client match a response to the action that caused it.

The `payload` contains the event-specific data.

Create `src/ws/protocol.ts`:

```ts
import { z } from "zod";

export const clientMessageSchema = z.discriminatedUnion(
  "type",
  [
    z.object({
      type: z.literal("room.join"),
      requestId: z.string().min(1),
      payload: z.object({
        roomId: z.string().min(1).max(100)
      })
    }),

    z.object({
      type: z.literal("room.leave"),
      requestId: z.string().min(1),
      payload: z.object({
        roomId: z.string().min(1).max(100)
      })
    }),

    z.object({
      type: z.literal("chat.send"),
      requestId: z.string().min(1),
      payload: z.object({
        roomId: z.string().min(1).max(100),
        text: z.string().trim().min(1).max(2_000)
      })
    }),

    z.object({
      type: z.literal("ping"),
      requestId: z.string().min(1),
      payload: z.object({})
    })
  ]
);

export type ClientMessage = z.infer<
  typeof clientMessageSchema
>;

export interface ServerMessage {
  type:
    | "ready"
    | "room.joined"
    | "room.left"
    | "chat.message"
    | "pong"
    | "error";

  requestId?: string;

  payload: Record<string, unknown>;
}
```

The schema does two things:

1. Validates incoming messages at runtime.
2. Gives TypeScript a precise union type after validation.

This is better than:

```ts
const message = JSON.parse(raw) as ClientMessage;
```

A type assertion does not validate data. It only tells TypeScript to trust you.

Messages come from the network, so they must be validated.

---

# Build a connection manager

The application needs to track connected clients and room membership.

Create `src/ws/connection-manager.ts`:

```ts
import type { WebSocket } from "ws";
import type { ServerMessage } from "./protocol.js";

export interface ClientConnection {
  id: string;
  userId: string;
  socket: WebSocket;
  rooms: Set<string>;
  isAlive: boolean;
}

export class ConnectionManager {
  private readonly connections = new Map<
    string,
    ClientConnection
  >();

  add(connection: ClientConnection): void {
    this.connections.set(connection.id, connection);
  }

  remove(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  get(connectionId: string): ClientConnection | undefined {
    return this.connections.get(connectionId);
  }

  joinRoom(connectionId: string, roomId: string): void {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    connection.rooms.add(roomId);
  }

  leaveRoom(connectionId: string, roomId: string): void {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    connection.rooms.delete(roomId);
  }

  broadcastToRoom(
    roomId: string,
    message: ServerMessage
  ): void {
    for (const connection of this.connections.values()) {
      if (!connection.rooms.has(roomId)) {
        continue;
      }

      this.send(connection, message);
    }
  }

  broadcast(message: ServerMessage): void {
    for (const connection of this.connections.values()) {
      this.send(connection, message);
    }
  }

  markAlive(connectionId: string): void {
    const connection = this.connections.get(connectionId);

    if (connection) {
      connection.isAlive = true;
    }
  }

  all(): ClientConnection[] {
    return [...this.connections.values()];
  }

  private send(
    connection: ClientConnection,
    message: ServerMessage
  ): void {
    if (connection.socket.readyState !== connection.socket.OPEN) {
      return;
    }

    const serialized = JSON.stringify(message);

    connection.socket.send(serialized);
  }
}
```

This manager provides:

- Connection registration
- Connection removal
- Room membership
- Broadcast to all clients
- Broadcast to one room
- Heartbeat state

The application should not scatter raw socket references across unrelated modules. Centralizing connection management makes cleanup and testing much easier.

---

# Configure environment variables

Create `src/config.ts`:

```ts
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  WS_TOKEN: z.string().min(1)
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error(result.error.format());
  process.exit(1);
}

export const config = result.data;
```

For this tutorial, the token is intentionally simple.

In production, use:

- A session cookie
- A short-lived access token
- A ticket exchange over HTTPS
- A validated `Sec-WebSocket-Protocol` value

Avoid putting long-lived secrets in a URL:

```text
wss://example.com/ws?token=secret
```

URLs can appear in:

- Reverse-proxy logs
- Browser history
- Monitoring tools
- Traces
- Error reports

For a browser application, an HttpOnly session cookie is often a better option because the browser includes it during the WebSocket upgrade request.

---

# Build the WebSocket route

Create `src/ws/ws-routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import {
  ConnectionManager,
  type ClientConnection
} from "./connection-manager.js";
import {
  clientMessageSchema,
  type ServerMessage
} from "./protocol.js";

function send(
  socket: WebSocket,
  message: ServerMessage
): void {
  if (socket.readyState !== socket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(message));
}

function sendError(
  socket: WebSocket,
  requestId: string | undefined,
  code: string,
  message: string
): void {
  send(socket, {
    type: "error",
    requestId,
    payload: {
      code,
      message
    }
  });
}

function authenticate(request: {
  query: unknown;
}): string | null {
  const query = request.query as {
    token?: string;
  };

  if (query.token !== config.WS_TOKEN) {
    return null;
  }

  return "demo-user";
}

export async function registerWebSocketRoutes(
  app: FastifyInstance,
  manager: ConnectionManager
): Promise<void> {
  app.get(
    "/ws",
    {
      websocket: true
    },
    (socket, request) => {
      const userId = authenticate(request);

      if (!userId) {
        socket.close(1008, "Unauthorized");
        return;
      }

      const connection: ClientConnection = {
        id: randomUUID(),
        userId,
        socket,
        rooms: new Set<string>(),
        isAlive: true
      };

      manager.add(connection);

      send(socket, {
        type: "ready",
        payload: {
          connectionId: connection.id,
          userId: connection.userId
        }
      });

      socket.on("pong", () => {
        manager.markAlive(connection.id);
      });

      socket.on("message", (rawMessage) => {
        void handleMessage(
          connection,
          rawMessage.toString(),
          manager
        );
      });

      socket.on("close", () => {
        manager.remove(connection.id);
      });

      socket.on("error", (error) => {
        app.log.error(
          {
            connectionId: connection.id,
            error
          },
          "WebSocket error"
        );

        manager.remove(connection.id);
      });
    }
  );
}

async function handleMessage(
  connection: ClientConnection,
  rawMessage: string,
  manager: ConnectionManager
): Promise<void> {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawMessage);
  } catch {
    sendError(
      connection.socket,
      undefined,
      "INVALID_JSON",
      "Message must be valid JSON"
    );

    return;
  }

  const parsedMessage =
    clientMessageSchema.safeParse(parsedJson);

  if (!parsedMessage.success) {
    sendError(
      connection.socket,
      undefined,
      "INVALID_MESSAGE",
      "Message does not match the protocol"
    );

    return;
  }

  const message = parsedMessage.data;

  switch (message.type) {
    case "room.join": {
      manager.joinRoom(
        connection.id,
        message.payload.roomId
      );

      send(connection.socket, {
        type: "room.joined",
        requestId: message.requestId,
        payload: {
          roomId: message.payload.roomId
        }
      });

      return;
    }

    case "room.leave": {
      manager.leaveRoom(
        connection.id,
        message.payload.roomId
      );

      send(connection.socket, {
        type: "room.left",
        requestId: message.requestId,
        payload: {
          roomId: message.payload.roomId
        }
      });

      return;
    }

    case "chat.send": {
      manager.broadcastToRoom(
        message.payload.roomId,
        {
          type: "chat.message",
          requestId: message.requestId,
          payload: {
            senderId: connection.userId,
            roomId: message.payload.roomId,
            text: message.payload.text,
            sentAt: new Date().toISOString()
          }
        }
      );

      return;
    }

    case "ping": {
      send(connection.socket, {
        type: "pong",
        requestId: message.requestId,
        payload: {
          sentAt: new Date().toISOString()
        }
      });

      return;
    }
  }
}
```

The route does four important things:

1. Authenticates the connection.
2. Creates a connection record.
3. Registers event handlers.
4. Routes validated messages to application behavior.

The `@fastify/websocket` plugin allows WebSocket routes to use Fastify’s request lifecycle before the connection is upgraded. After the upgrade, normal response serialization and transmission hooks do not run, so your WebSocket handler must serialize and send messages itself. [Fastify WebSocket documentation](https://www.npmjs.com/package/%40fastify/websocket)

---

# Create the Fastify application

Create `src/app.ts`:

```ts
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { ConnectionManager } from "./ws/connection-manager.js";
import {
  registerWebSocketRoutes
} from "./ws/ws-routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  const manager = new ConnectionManager();

  await app.register(websocket);

  app.get("/health", async () => {
    return {
      status: "ok",
      connectedClients: manager.all().length
    };
  });

  await registerWebSocketRoutes(app, manager);

  return {
    app,
    manager
  };
}
```

Register the WebSocket plugin before registering WebSocket routes. The plugin uses Fastify’s router to intercept WebSocket upgrades.

---

# Add heartbeat handling

A WebSocket connection can appear open even after the underlying network has failed.

The server needs to detect dead connections.

Create `src/ws/heartbeat.ts`:

```ts
import type { ConnectionManager } from "./connection-manager.js";

export function startHeartbeat(
  manager: ConnectionManager
): NodeJS.Timeout {
  return setInterval(() => {
    for (const connection of manager.all()) {
      if (!connection.isAlive) {
        connection.socket.terminate();
        manager.remove(connection.id);
        continue;
      }

      connection.isAlive = false;
      connection.socket.ping();
    }
  }, 30_000);
}
```

The heartbeat works like this:

```text
Server sends ping
    ↓
Healthy client sends pong
    ↓
Server marks connection alive
```

If the next heartbeat arrives and the connection never responded:

```text
Server terminates connection
```

This avoids keeping dead sockets in memory forever.

---

# Start the server

Create `src/server.ts`:

```ts
import { buildApp } from "./app.js";
import { config } from "./config.js";
import { startHeartbeat } from "./ws/heartbeat.js";

const { app, manager } = await buildApp();

const heartbeat = startHeartbeat(manager);

await app.listen({
  host: "127.0.0.1",
  port: config.PORT
});

app.log.info(
  `HTTP and WebSocket server listening on ${config.PORT}`
);

async function shutdown(signal: string): Promise<void> {
  app.log.info(`Received ${signal}; shutting down`);

  clearInterval(heartbeat);

  for (const connection of manager.all()) {
    connection.socket.close(1001, "Server shutting down");
  }

  await app.close();
  process.exitCode = 0;
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
```

Run the server:

```bash
npm run dev
```

The HTTP server and WebSocket endpoint are now available on:

```text
http://127.0.0.1:3000
ws://127.0.0.1:3000/ws
```

---

# Connect from the browser

Create a simple browser client:

```html
<script>
  const token = "development-token";

  const socket = new WebSocket(
    `ws://127.0.0.1:3000/ws?token=${token}`
  );

  socket.addEventListener("open", () => {
    console.log("Connected");

    socket.send(
      JSON.stringify({
        type: "room.join",
        requestId: crypto.randomUUID(),
        payload: {
          roomId: "engineering"
        }
      })
    );
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    console.log("Message from server:", message);
  });

  socket.addEventListener("close", (event) => {
    console.log(
      "Disconnected:",
      event.code,
      event.reason
    );
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });
</script>
```

The browser uses the native `WebSocket` object. The `ws` package is for Node.js and does not run directly in browser code. [ws documentation](https://github.com/websockets/ws)

Send a chat message:

```js
socket.send(
  JSON.stringify({
    type: "chat.send",
    requestId: crypto.randomUUID(),
    payload: {
      roomId: "engineering",
      text: "The deployment has started"
    }
  })
);
```

The server broadcasts:

```json
{
  "type": "chat.message",
  "requestId": "...",
  "payload": {
    "senderId": "demo-user",
    "roomId": "engineering",
    "text": "The deployment has started",
    "sentAt": "..."
  }
}
```

---

# Build a reusable browser client

A frontend should not scatter raw `socket.send(JSON.stringify(...))` calls throughout the application.

Create a small client wrapper:

```ts
export interface ServerMessage {
  type: string;
  requestId?: string;
  payload: Record<string, unknown>;
}

export class RealtimeClient {
  private socket: WebSocket | null = null;

  private readonly listeners = new Set<
    (message: ServerMessage) => void
  >();

  constructor(
    private readonly url: string
  ) {}

  connect(): void {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      console.log("WebSocket connected");
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(
        event.data
      ) as ServerMessage;

      for (const listener of this.listeners) {
        listener(message);
      }
    });

    this.socket.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocket error", error);
    });
  }

  subscribe(
    listener: (message: ServerMessage) => void
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  send(
    type: string,
    payload: Record<string, unknown>
  ): void {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      throw new Error("WebSocket is not connected");
    }

    this.socket.send(
      JSON.stringify({
        type,
        requestId: crypto.randomUUID(),
        payload
      })
    );
  }

  close(): void {
    this.socket?.close(1000, "Client closing");
  }
}
```

Use it:

```ts
const client = new RealtimeClient(
  "ws://127.0.0.1:3000/ws?token=development-token"
);

client.subscribe((message) => {
  if (message.type === "chat.message") {
    console.log("New chat message", message.payload);
  }
});

client.connect();
```

In a real application, the browser client should validate server messages too. The frontend should not blindly trust every message received from the network.

---

# Reconnection

Connections fail. Wi-Fi changes. Laptops sleep. Mobile browsers suspend tabs. Proxies terminate idle connections. Servers restart during deployments.

The browser client needs reconnection logic.

```ts
export class ReconnectingClient {
  private socket: WebSocket | null = null;
  private stopped = false;
  private attempt = 0;

  constructor(
    private readonly url: string,
    private readonly maxDelayMs = 30_000
  ) {}

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    this.socket?.close(1000, "Client stopped");
  }

  private connect(): void {
    if (this.stopped) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      this.attempt = 0;
      console.log("Connected");
    });

    this.socket.addEventListener("close", () => {
      if (this.stopped) {
        return;
      }

      const delay = Math.min(
        1_000 * 2 ** this.attempt,
        this.maxDelayMs
      );

      this.attempt += 1;

      setTimeout(() => {
        this.connect();
      }, delay);
    });
  }
}
```

This uses exponential backoff:

```text
Attempt 1: 1 second
Attempt 2: 2 seconds
Attempt 3: 4 seconds
Attempt 4: 8 seconds
...
```

Always add jitter in production so thousands of clients do not reconnect at exactly the same time:

```ts
const jitter = Math.random() * 500;
const delayWithJitter = delay + jitter;
```

After reconnecting, the client should restore its state:

```text
Reconnect
    ↓
Authenticate again
    ↓
Join rooms again
    ↓
Request missed events or refresh state
```

A WebSocket does not automatically replay messages that arrived while the client was disconnected.

---

# Message delivery and acknowledgements

Sending a message does not prove that the application processed it.

The client can send:

```json
{
  "type": "chat.send",
  "requestId": "req-123",
  "payload": {
    "roomId": "engineering",
    "text": "Hello"
  }
}
```

The server can acknowledge it:

```json
{
  "type": "chat.accepted",
  "requestId": "req-123",
  "payload": {
    "messageId": "msg-987"
  }
}
```

If the server persists the message, the acknowledgement should be sent after persistence succeeds.

For important messages, use explicit states:

```text
received
validated
persisted
published
delivered
```

A production protocol may include:

```json
{
  "type": "event",
  "eventId": "evt-123",
  "sequence": 42,
  "payload": {}
}
```

The `sequence` number helps a reconnecting client ask:

```text
Give me events after sequence 42
```

Without sequence numbers or a durable event log, the client cannot reliably detect what it missed.

---

# Communicating with other services over WebSocket

There are two different patterns.

## Frontend WebSocket gateway

```text
Browser
   ⇄
WebSocket gateway
   ⇄
Application services
```

The gateway manages many browser connections and translates internal events into client messages.

## Service-to-service WebSocket connection

```text
Service A ⇄ WebSocket ⇄ Service B
```

This can be useful when:

- A service needs a low-latency live stream
- A service maintains a long-lived subscription
- A third-party provider exposes WebSockets
- A gateway connects to a specialized real-time service

But WebSockets are not usually the first choice for durable internal events.

For service-to-service communication, consider:

- NATS
- RabbitMQ
- Kafka
- Redis Streams
- gRPC
- HTTP
- Server-Sent Events

WebSockets have no built-in guarantee that a disconnected service will receive events later.

---

# Build a Node.js WebSocket client

The `ws` package can act as both a server and a client. [ws README](https://github.com/websockets/ws)

Create `src/ws/service-client.ts`:

```ts
import WebSocket from "ws";

export class ServiceWebSocketClient {
  private socket: WebSocket | null = null;
  private stopped = false;
  private reconnectAttempt = 0;

  constructor(
    private readonly url: string,
    private readonly onMessage: (
      message: unknown
    ) => void
  ) {}

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    this.socket?.close(1000, "Service stopping");
  }

  send(message: unknown): void {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      throw new Error("Service WebSocket is not connected");
    }

    this.socket.send(JSON.stringify(message));
  }

  private connect(): void {
    if (this.stopped) {
      return;
    }

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.on("open", () => {
      this.reconnectAttempt = 0;
      console.log("Connected to upstream service");
    });

    socket.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.onMessage(message);
      } catch (error) {
        console.error(
          "Invalid message from upstream service",
          error
        );
      }
    });

    socket.on("close", () => {
      if (this.stopped) {
        return;
      }

      this.scheduleReconnect();
    });

    socket.on("error", (error) => {
      console.error("Upstream WebSocket error", error);
    });
  }

  private scheduleReconnect(): void {
    const baseDelay = Math.min(
      1_000 * 2 ** this.reconnectAttempt,
      30_000
    );

    const jitter = Math.random() * 500;
    const delay = baseDelay + jitter;

    this.reconnectAttempt += 1;

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}
```

In production, add:

- Authentication
- Message validation
- Heartbeats
- Connection timeout
- Maximum reconnect attempts or circuit breaking
- Metrics
- Duplicate event handling
- Subscription restoration

---

# WebSockets behind a load balancer

A WebSocket connection is tied to a specific backend process.

If a client connects to instance A, that socket remains on instance A:

```text
Client 1 → Instance A
Client 2 → Instance B
```

If Client 1 sends a message and Instance A broadcasts only to its own memory, Client 2 on Instance B will not receive it.

This is the distributed broadcast problem.

## Solution: shared pub/sub

Use a shared system:

```text
Instance A ─┐
Instance B ─┼── Redis Pub/Sub or NATS
Instance C ─┘
```

When one instance receives an event:

```text
1. Persist or publish the event centrally
2. Publish it to the shared bus
3. Every WebSocket instance receives it
4. Each instance sends it to its local clients
```

The connection manager remains local, but the event bus is shared.

Do not depend on sticky sessions as the only solution. Sticky sessions can help route a client back to the same process, but they do not solve:

- Process crashes
- Cross-instance broadcasts
- Deployments
- Event replay
- Horizontal scaling

---

# Authentication patterns

## Cookie-based authentication

If the frontend and backend share a domain, the browser can send an HttpOnly session cookie during the WebSocket upgrade.

The server authenticates the upgrade request before accepting the connection.

Advantages:

- Tokens are not exposed to JavaScript
- Tokens are not included in the URL
- Works naturally with browser cookies

Be sure to configure:

- Secure cookies
- SameSite policy
- Origin validation
- CSRF protections where applicable

## Short-lived WebSocket ticket

A frontend can call an HTTP endpoint:

```text
POST /api/ws-ticket
```

The backend returns a short-lived one-time ticket:

```json
{
  "ticket": "temporary-token"
}
```

The frontend uses it once to connect:

```text
wss://example.com/ws?ticket=temporary-token
```

The ticket should:

- Expire quickly
- Be single-use
- Be scoped to the user
- Be safe if logged accidentally

## Subprotocol authentication

A client can pass subprotocol values:

```ts
const socket = new WebSocket(
  "wss://example.com/ws",
  ["access-token", token]
);
```

This requires careful server-side handling and should be designed deliberately.

---

# Authorization and rooms

Authentication identifies the user.

Authorization decides which rooms and events they may access.

Never allow a client to join any arbitrary room:

```ts
room.join("admin-private-room");
```

The server should check:

```ts
if (!userCanAccessRoom(userId, roomId)) {
  closeOrReject();
}
```

For a multi-tenant system, always associate room membership with an authenticated tenant:

```text
tenant-a:project-123
tenant-b:project-123
```

Do not let the room ID alone determine access.

---

# Message size and rate limits

A client can send unlimited messages unless the server imposes limits.

Protect the server by limiting:

- Maximum message size
- Messages per second
- Number of rooms per connection
- Number of connections per user
- Number of connections per IP
- Maximum payload depth
- Maximum string lengths

Reject messages that exceed limits:

```ts
if (rawMessage.length > 64_000) {
  socket.close(1009, "Message too large");
  return;
}
```

The WebSocket close code `1009` indicates that a message is too large.

Rate limiting can be applied per:

```text
IP address
user ID
connection ID
room ID
message type
```

---

# Backpressure and slow clients

Suppose the server broadcasts 1,000 messages per second but one browser can process only 100.

If the server keeps sending, the client’s buffer grows.

With `ws`, inspect the socket’s buffered amount:

```ts
const bufferedAmount =
  connection.socket.bufferedAmount;
```

A simple policy might disconnect slow clients:

```ts
if (connection.socket.bufferedAmount > 1_000_000) {
  connection.socket.close(
    1008,
    "Client is too slow"
  );
}
```

More sophisticated systems use:

- Per-client queues
- Event coalescing
- Dropping stale updates
- Snapshot plus delta protocols
- Backpressure-aware streams
- Separate channels for high- and low-priority events

For example, if a dashboard receives CPU updates, it may be better to send only the newest value rather than queueing every historical value.

---

# Observability

Track WebSocket-specific metrics:

```text
active connections
connections opened
connections closed
connection duration
messages received
messages sent
message validation failures
authentication failures
bytes received
bytes sent
broadcast fan-out
slow-client disconnects
reconnect attempts
```

Log connection lifecycle events:

```ts
app.log.info(
  {
    connectionId: connection.id,
    userId: connection.userId
  },
  "WebSocket connected"
);
```

Include:

- Connection ID
- User ID
- Room ID
- Message type
- Request ID
- Error code
- Close code

Do not log message payloads automatically. Payloads may contain sensitive data.

---

# WebSocket testing

Test the protocol, not only the connection.

A test should verify:

1. A client can connect.
2. An unauthenticated client is rejected.
3. A client receives a `ready` event.
4. A client can join a room.
5. A client receives messages from that room.
6. A client outside the room does not receive them.
7. Invalid JSON results in an error.
8. Invalid message types are rejected.
9. Dead connections are cleaned up.
10. The server closes sockets gracefully.

The Fastify WebSocket plugin provides `injectWS` support for testing WebSocket routes. [Fastify WebSocket package](https://www.npmjs.com/package/%40fastify/websocket)

A conceptual test might look like:

```ts
const socket = await app.injectWS(
  "/ws?token=development-token"
);

socket.send(
  JSON.stringify({
    type: "room.join",
    requestId: "req-1",
    payload: {
      roomId: "engineering"
    }
  })
);

const response = await nextMessage(socket);

expect(response.type).toBe("room.joined");
```

Test both valid and invalid protocol messages.

---

# Deployment with HTTPS

In production, use:

```text
wss://example.com/ws
```

not:

```text
ws://example.com/ws
```

`wss://` is WebSocket over TLS.

A reverse proxy such as Nginx, Caddy, or a cloud load balancer must support WebSocket upgrades.

For Nginx, the proxy configuration usually needs:

```nginx
location /ws {
    proxy_pass http://127.0.0.1:3000;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Also configure idle timeouts. A proxy with a short idle timeout may terminate apparently healthy WebSocket connections.

---

# Common mistakes

## Treating WebSockets like HTTP

WebSockets do not automatically have:

- Request-scoped response serialization
- REST status codes for each message
- Automatic retries
- Durable delivery
- Message replay
- Database transactions

You must design those pieces explicitly.

## Trusting TypeScript types at runtime

This is not validation:

```ts
const message = JSON.parse(raw) as ClientMessage;
```

Use a runtime schema.

## No heartbeat

Without heartbeats, dead connections can stay in memory.

## No reconnection logic

Clients will disconnect. Design for it.

## No authorization on room joins

Never assume that an authenticated user can join every room.

## Broadcasting only from process memory

This fails as soon as multiple backend instances are running.

## Sending unbounded data

Use message-size limits, pagination, snapshots, and event filtering.

## Using WebSockets for durable events

If missing one message is unacceptable, use a durable event system or add explicit persistence and replay.

---

# A practical message lifecycle

A robust event should follow a predictable lifecycle:

```text
Client sends message
       ↓
Parse JSON
       ↓
Validate schema
       ↓
Authenticate user
       ↓
Authorize action
       ↓
Execute business logic
       ↓
Persist event if required
       ↓
Publish event
       ↓
Send acknowledgement
       ↓
Broadcast to authorized subscribers
```

For a chat message:

```text
chat.send
    ↓
Validate text and room
    ↓
Check room membership
    ↓
Save message
    ↓
Publish message event
    ↓
Send chat.message
```

For a live dashboard update:

```text
Backend event
    ↓
Publish to shared bus
    ↓
WebSocket instance receives event
    ↓
Filter authorized clients
    ↓
Send current update
```

---

# Final architecture

A production WebSocket backend often looks like this:

```text
                         ┌─────────────┐
                         │   Browser   │
                         └──────┬──────┘
                                │ WebSocket
                                ▼
                       ┌─────────────────┐
                       │ WebSocket       │
                       │ Gateway         │
                       └──────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     Auth service       Application API       Event bus
                                                   │
                            ┌──────────────────────┼─────────────┐
                            ▼                      ▼             ▼
                        Instance A             Instance B     Worker
```

The gateway handles:

- Connections
- Authentication
- Rooms
- Protocol messages
- Heartbeats
- Reconnection support
- Client-specific delivery

The event bus handles:

- Cross-instance events
- Durable delivery where supported
- Service-to-service communication
- Fan-out
- Replay or retry patterns

---

# Final checklist

Before shipping a WebSocket backend, verify that you have:

- A documented message protocol
- Runtime validation
- Authentication
- Authorization
- Heartbeats
- Reconnection
- Message acknowledgements
- Maximum message size
- Rate limiting
- Slow-client handling
- Graceful shutdown
- Structured logging
- Connection metrics
- Cross-instance broadcasting
- A decision about event durability
- TLS through `wss://`
- Tests for invalid and unauthorized messages

WebSockets are relatively easy to demonstrate and surprisingly easy to get wrong in production.

The connection itself is only the beginning. The real engineering work is designing the protocol, handling failure, keeping authorization correct, and deciding which events can be transient and which ones must be persisted.

Use WebSockets when you need live, bidirectional communication. Use HTTP when request-response is enough. Use a message broker when service-to-service events must survive disconnections.