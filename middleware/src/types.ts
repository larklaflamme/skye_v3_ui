import { z } from 'zod';

// ── User ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'trusted' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_active: string | null;
}

export type SafeUser = Omit<User, 'password_hash'>;

// ── Session ───────────────────────────────────────────────────────
export interface Session {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
}

// ── Thread ────────────────────────────────────────────────────────
export interface Thread {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// ── Message ───────────────────────────────────────────────────────
export interface Message {
  id: string;
  thread_id: string;
  user_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// ── Activation Code ───────────────────────────────────────────────
export interface ActivationCode {
  code: string;
  recipient_email: string | null;
  role: 'admin' | 'trusted' | 'guest';
  status: 'unused' | 'used' | 'expired';
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
  used_by: string | null;
}

// ── Message Envelope (matches Skye Engine format) ─────────────────
export interface MessageEnvelope {
  envelope_version: number;
  message_id: string;
  conversation_id: string;
  channel: string;
  text: string;
  attachments: Array<{ uri: string; mime: string }>;
  metadata: Record<string, unknown>;
  created_at: number;
}

// ── Telemetry ─────────────────────────────────────────────────────
export interface TelemetryMetrics {
  ebv3Pid: number | null;
  skyePort: number;
  mcpTools: number;
  mcpLatency: string;
  neonPing: string;
  cpu: number;
  ram: string;
  disk: string;
  uptime: string;
  middlewareUptime: string;
}

// ── Zod Schemas ───────────────────────────────────────────────────
export const LoginSchema = z.object({
  loginId: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const SignupSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  activationCode: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(10000),
});

export const CreateThreadSchema = z.object({
  title: z.string().max(200).optional(),
});

export const GenerateCodeSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'trusted', 'guest']).default('trusted'),
});

// ── Express extensions ────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionId?: string;
    }
  }
}
