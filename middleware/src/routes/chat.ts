import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listThreads,
  createThread,
  getThread,
  getThreadMessages,
  sendMessage,
  injectToSkyeEngine,
} from '../services/chat.js';
import { CreateThreadSchema, SendMessageSchema } from '../types.js';
import { addAuditLog } from '../services/admin.js';

const router = Router();

// All chat routes require auth
router.use(requireAuth);

// GET /api/chat/threads
router.get('/threads', (req: Request, res: Response) => {
  const threads = listThreads(req.user!.id);
  res.json({ threads });
});

// POST /api/chat/threads
router.post('/threads', (req: Request, res: Response) => {
  const parsed = CreateThreadSchema.safeParse(req.body);
  const title = parsed.success ? parsed.data.title : undefined;

  const thread = createThread(req.user!.id, title);
  res.status(201).json({ thread });
});

// GET /api/chat/threads/:id
router.get('/threads/:id', (req: Request, res: Response) => {
  const threadId = req.params.id as string;
  const thread = getThread(threadId, req.user!.id);
  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  const messages = getThreadMessages(threadId);
  res.json({ thread, messages });
});

// POST /api/chat/threads/:id/messages
router.post('/threads/:id/messages', async (req: Request, res: Response) => {
  const threadId = req.params.id as string;
  const thread = getThread(threadId, req.user!.id);
  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  const parsed = SendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { message, envelope } = sendMessage(
    threadId,
    req.user!.id,
    req.user!,
    parsed.data.text
  );

  // Inject into Skye Engine (non-blocking — response comes via WebSocket)
  injectToSkyeEngine(envelope).catch((err) => {
    console.error('[chat] Failed to inject message to Skye Engine:', err);
  });

  addAuditLog('INFO', req.user!.username, `Message sent to thread ${threadId}`);

  // Return the user message immediately. Skye's response will arrive via WebSocket.
  res.status(201).json({
    message,
    envelope_message_id: envelope.message_id,
  });
});

export default router;
