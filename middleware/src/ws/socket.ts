import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';
import { subscribeToStream } from '../redis.js';
import { saveAssistantMessage } from '../services/chat.js';
import { collectTelemetry } from '../services/telemetry.js';
import { config } from '../config.js';
import type { JwtPayload } from '../middleware/auth.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// Track active stream subscriptions
const activeSubscriptions = new Map<string, () => void>();

export function setupWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: '/ws',
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    // Socket.io v4 defaults to polling first, then upgrade
    transports: ['polling', 'websocket'],
  });

  // Auth middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      next(new Error('Authentication required'));
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      next(new Error('Invalid or expired token'));
      return;
    }

    socket.userId = payload.userId;
    socket.username = `user_${payload.userId.slice(0, 8)}`;
    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[ws] Client connected: ${socket.userId} (${socket.id})`);

    // Join a personal room for targeted messages
    socket.join(`user:${socket.userId}`);

    // ── Client → Server ──────────────────────────────────────────

    // Subscribe to a thread's stream
    socket.on('subscribe:thread', async ({ threadId }: { threadId: string }) => {
      if (!threadId) return;

      console.log(`[ws] ${socket.userId} subscribing to thread ${threadId}`);

      // Join the Socket.io room for this thread
      socket.join(`thread:${threadId}`);

      // Subscribe to Redis stream for this conversation
      try {
        const unsubscribe = await subscribeToStream(threadId, (data) => {
          if (data.done) {
            // Final message — save to DB and emit
            const content = data.token; // Final token is the complete message
            if (content && content.trim()) {
              const message = saveAssistantMessage(threadId, content);
              io.to(`thread:${threadId}`).emit('stream:complete', {
                threadId,
                message,
              });
            }
            // Clean up subscription
            unsubscribe();
            activeSubscriptions.delete(threadId);
          } else {
            // Streaming token
            io.to(`thread:${threadId}`).emit('stream:token', {
              threadId,
              token: data.token,
              index: data.index,
            });
          }
        });

        // Store unsubscribe function
        const existing = activeSubscriptions.get(threadId);
        if (existing) existing(); // Replace existing subscription
        activeSubscriptions.set(threadId, unsubscribe);
      } catch (err) {
        console.error(`[ws] Failed to subscribe to stream for ${threadId}:`, err);
        socket.emit('stream:error', { threadId, error: 'Failed to subscribe to stream' });
      }
    });

    // Unsubscribe from a thread's stream
    socket.on('unsubscribe:thread', ({ threadId }: { threadId: string }) => {
      socket.leave(`thread:${threadId}`);
      const unsubscribe = activeSubscriptions.get(threadId);
      if (unsubscribe) {
        unsubscribe();
        activeSubscriptions.delete(threadId);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`[ws] Client disconnected: ${socket.userId} (${socket.id})`);
    });
  });

  // ── Telemetry broadcast (every 30s) ────────────────────────────

  setInterval(() => {
    const metrics = collectTelemetry();
    io.emit('telemetry:update', { metrics });
  }, 30000);

  console.log('[ws] WebSocket server initialized');
  return io;
}
