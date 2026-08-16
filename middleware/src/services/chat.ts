import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { pushToInbox } from '../redis.js';
import type { Thread, Message, MessageEnvelope, SafeUser } from '../types.js';

// ── Threads ───────────────────────────────────────────────────────

export function listThreads(userId: string): Thread[] {
  return db.prepare(
    'SELECT * FROM threads WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(userId) as Thread[];
}

export function createThread(userId: string, title?: string): Thread {
  const id = uuidv4();
  const now = new Date().toISOString();
  const threadTitle = title || 'New Conversation';

  db.prepare(
    'INSERT INTO threads (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, threadTitle, now, now);

  return { id, user_id: userId, title: threadTitle, created_at: now, updated_at: now };
}

export function getThread(threadId: string, userId: string): Thread | null {
  return db.prepare(
    'SELECT * FROM threads WHERE id = ? AND user_id = ?'
  ).get(threadId, userId) as Thread | undefined || null;
}

export function getThreadMessages(threadId: string): Message[] {
  return db.prepare(
    'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC'
  ).all(threadId) as Message[];
}

// ── Messages ──────────────────────────────────────────────────────

export function sendMessage(
  threadId: string,
  userId: string,
  user: SafeUser,
  text: string
): { message: Message; envelope: MessageEnvelope } {
  const now = new Date().toISOString();
  const messageId = uuidv4();

  // Save user message
  const message: Message = {
    id: messageId,
    thread_id: threadId,
    user_id: userId,
    role: 'user',
    content: text,
    created_at: now,
  };

  db.prepare(
    'INSERT INTO messages (id, thread_id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(messageId, threadId, userId, 'user', text, now);

  // Update thread timestamp
  db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, threadId);

  // Build MessageEnvelope for Skye Engine
  const envelope: MessageEnvelope = {
    envelope_version: 1,
    message_id: messageId,
    conversation_id: threadId,
    channel: 'web',
    text,
    attachments: [],
    metadata: {
      user: user.username,
      user_id: userId,
      thread_id: threadId,
      message_id: messageId,
    },
    created_at: Date.now() / 1000,
  };

  return { message, envelope };
}

export async function injectToSkyeEngine(envelope: MessageEnvelope): Promise<void> {
  await pushToInbox(JSON.stringify(envelope));
}

export function saveAssistantMessage(threadId: string, content: string): Message {
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO messages (id, thread_id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, threadId, null, 'assistant', content, now);

  db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, threadId);

  return {
    id,
    thread_id: threadId,
    user_id: null,
    role: 'assistant',
    content,
    created_at: now,
  };
}
