import Redis from 'ioredis';
import { config } from './config.js';

let redisClient: Redis | null = null;
let subscriberClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('[redis] Client error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[redis] Connected to', config.redis.url);
    });
  }
  return redisClient;
}

export function getSubscriber(): Redis {
  if (!subscriberClient) {
    subscriberClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    subscriberClient.on('error', (err) => {
      console.error('[redis:sub] Subscriber error:', err.message);
    });
  }
  return subscriberClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  const sub = getSubscriber();
  await Promise.all([client.connect(), sub.connect()]);
  console.log('[redis] Both clients connected');
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) await redisClient.quit();
  if (subscriberClient) await subscriberClient.quit();
  redisClient = null;
  subscriberClient = null;
}

/**
 * Push a message envelope to the Skye Engine inbox.
 */
export async function pushToInbox(envelopeJson: string): Promise<void> {
  const redis = getRedis();
  await redis.rpush(config.skyeEngine.inboxKey, envelopeJson);
}

/**
 * Subscribe to streaming tokens for a conversation.
 * Calls `onToken` for each token received.
 * Returns an unsubscribe function.
 */
export async function subscribeToStream(
  conversationId: string,
  onToken: (data: { token: string; index: number; done: boolean }) => void
): Promise<() => void> {
  const sub = getSubscriber();
  const channel = `${config.skyeEngine.streamPrefix}${conversationId}`;

  await sub.subscribe(channel);

  const handler = (chan: string, message: string) => {
    if (chan !== channel) return;
    try {
      const data = JSON.parse(message);
      onToken(data);
    } catch {
      // Ignore malformed messages
    }
  };

  sub.on('message', handler);

  return () => {
    sub.off('message', handler);
    sub.unsubscribe(channel).catch(() => {});
  };
}

/**
 * Poll the outbox for a response to a specific message.
 * Returns the response envelope or null if timeout.
 */
export async function pollOutbox(
  messageId: string,
  timeoutMs: number = 120000
): Promise<Record<string, unknown> | null> {
  const redis = getRedis();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // Use BRPOPLPUSH-like pattern: move from outbox to processing
    const result = await redis.lpop(config.skyeEngine.outboxKey);
    if (result) {
      try {
        const envelope = JSON.parse(result);
        // Check if this response is for our message
        if (envelope.metadata?.message_id === messageId || 
            envelope.conversation_id === messageId) {
          return envelope;
        }
        // Not ours — push back (simplified: we lose ordering, but for web it's fine)
        await redis.rpush(config.skyeEngine.outboxKey, result);
      } catch {
        // Malformed — skip
      }
    }
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return null;
}
