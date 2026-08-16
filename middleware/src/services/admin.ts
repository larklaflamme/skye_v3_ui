import db from '../database.js';
import { generateActivationCode } from './auth.js';
import type { SafeUser, ActivationCode } from '../types.js';

// ── Users ─────────────────────────────────────────────────────────

export function listUsers(): SafeUser[] {
  return db.prepare(
    'SELECT id, username, email, role, status, created_at, last_active FROM users ORDER BY created_at DESC'
  ).all() as SafeUser[];
}

export function getUserById(userId: string): SafeUser | null {
  return db.prepare(
    'SELECT id, username, email, role, status, created_at, last_active FROM users WHERE id = ?'
  ).get(userId) as SafeUser | undefined || null;
}

// ── Activation Codes ──────────────────────────────────────────────

export function listCodes(): ActivationCode[] {
  return db.prepare(
    'SELECT * FROM activation_codes ORDER BY created_at DESC'
  ).all() as ActivationCode[];
}

export function createCode(email: string, role: 'admin' | 'trusted' | 'guest'): ActivationCode {
  return generateActivationCode(email, role);
}

// ── Audit Logs ────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: string;
  user: string;
  action: string;
}

// In-memory audit log for now — will be replaced with DB table
const auditLog: AuditLogEntry[] = [];

export function addAuditLog(level: string, user: string, action: string): void {
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    level,
    user,
    action,
  };
  auditLog.push(entry);
  // Keep only last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.shift();
  }
}

export function getAuditLogs(limit: number = 50): AuditLogEntry[] {
  return auditLog.slice(-limit).reverse();
}
