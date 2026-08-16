import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config.js';
import { initDatabase } from './database.js';
import { connectRedis, disconnectRedis } from './redis.js';
import { setupWebSocket } from './ws/socket.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import telemetryRoutes from './routes/telemetry.js';
import { addAuditLog } from './services/admin.js';

const app = express();
const httpServer = createServer(app);

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[http] ${req.method} ${req.path}`);
  next();
});

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/telemetry', telemetryRoutes);

// ── 404 ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ──────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[http] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── WebSocket ──────────────────────────────────────────────────────
const io = setupWebSocket(httpServer);

// ── Start ──────────────────────────────────────────────────────────
async function start() {
  // Initialize database (async — sql.js WASM)
  await initDatabase();
  console.log('[db] Database initialized');

  // Connect to Redis (optional — graceful degradation)
  try {
    await connectRedis();
    console.log('[redis] Connected');
  } catch (err) {
    console.warn('[redis] Failed to connect — running without Redis:', (err as Error).message);
    console.warn('[redis] Chat messages will be saved but not forwarded to Skye Engine');
  }

  httpServer.listen(config.port, () => {
    console.log(`\n  🐦‍⬛ Skye v3 Middleware`);
    console.log(`  ──────────────────────────────`);
    console.log(`  HTTP:  http://localhost:${config.port}`);
    console.log(`  WS:    ws://localhost:${config.port}/ws`);
    console.log(`  Mode:  ${config.nodeEnv}`);
    console.log(`  CORS:  ${config.corsOrigin}\n`);

    addAuditLog('INFO', 'System', 'Middleware started');
  });
}

// ── Graceful shutdown ──────────────────────────────────────────────
async function shutdown() {
  console.log('\n[server] Shutting down...');
  addAuditLog('INFO', 'System', 'Middleware shutting down');

  io.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await disconnectRedis();
  console.log('[server] Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
