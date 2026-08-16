import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import db from '../database.js';
import { config } from '../config.js';
import type { SafeUser, ActivationCode } from '../types.js';

const SALT_ROUNDS = 12;

// ── Login ─────────────────────────────────────────────────────────

export function loginUser(
  loginId: string,
  password: string
): { user: SafeUser; token: string } | { error: string; status: number } {
  // Find user by username or email
  const user = db.prepare(
    'SELECT * FROM users WHERE (username = ? OR email = ?) AND status = ?'
  ).get(loginId, loginId, 'active') as
    | { id: string; username: string; email: string; password_hash: string; role: string; status: string; created_at: string; last_active: string | null }
    | undefined;

  if (!user) {
    return { error: 'Invalid credentials', status: 401 };
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return { error: 'Invalid credentials', status: 401 };
  }

  // Create session
  const sessionId = uuidv4();
  const token = jwt.sign(
    { userId: user.id, sessionId },
    config.jwt.secret,
    { expiresIn: config.jwt.expires } as jwt.SignOptions
  );

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  db.prepare(
    'INSERT INTO sessions (id, user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(sessionId, user.id, token, now, expiresAt);

  // Update last active
  db.prepare('UPDATE users SET last_active = ? WHERE id = ?').run(now, user.id);

  const safeUser: SafeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as SafeUser['role'],
    status: user.status as SafeUser['status'],
    created_at: user.created_at,
    last_active: now,
  };

  return { user: safeUser, token };
}

// ── Signup ────────────────────────────────────────────────────────

export function signupUser(
  username: string,
  email: string,
  activationCode: string,
  password: string
): { user: SafeUser; token: string } | { error: string; status: number } {
  // Validate activation code
  const code = db.prepare(
    'SELECT * FROM activation_codes WHERE code = ? AND status = ?'
  ).get(activationCode, 'unused') as ActivationCode | undefined;

  if (!code) {
    return { error: 'Invalid or already used activation code', status: 400 };
  }

  // Check expiry
  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    db.prepare('UPDATE activation_codes SET status = ? WHERE code = ?').run('expired', activationCode);
    return { error: 'Activation code has expired', status: 400 };
  }

  // Check if username or email already exists
  const existing = db.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ?'
  ).get(username, email);

  if (existing) {
    return { error: 'Username or email already taken', status: 409 };
  }

  // Create user
  const userId = uuidv4();
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, role, status, created_at, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, username, email, passwordHash, code.role, 'active', now, now);

  // Mark code as used
  db.prepare(
    'UPDATE activation_codes SET status = ?, used_at = ?, used_by = ? WHERE code = ?'
  ).run('used', now, userId, activationCode);

  // Create session
  const sessionId = uuidv4();
  const token = jwt.sign(
    { userId, sessionId },
    config.jwt.secret,
    { expiresIn: config.jwt.expires } as jwt.SignOptions
  );

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO sessions (id, user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(sessionId, userId, token, now, expiresAt);

  const safeUser: SafeUser = {
    id: userId,
    username,
    email,
    role: code.role as SafeUser['role'],
    status: 'active',
    created_at: now,
    last_active: now,
  };

  return { user: safeUser, token };
}

// ── Get current user ──────────────────────────────────────────────

export function getUserById(userId: string): SafeUser | null {
  const user = db.prepare(
    'SELECT id, username, email, role, status, created_at, last_active FROM users WHERE id = ?'
  ).get(userId) as SafeUser | undefined;
  return user || null;
}

// ── Activation code generation ────────────────────────────────────

export function generateActivationCode(
  email: string,
  role: 'admin' | 'trusted' | 'guest'
): ActivationCode {
  // SEG2: first 6 hex chars of SHA-256(email)
  const emailHash = createHash('sha256').update(email).digest('hex');
  const seg2 = emailHash.slice(0, 6).toUpperCase();

  // SEG3: checksum — first 6 hex chars of SHA-256(SEG2 + email + timestamp)
  const timestamp = Date.now().toString();
  const checksumInput = seg2 + email + timestamp;
  const checksum = createHash('sha256').update(checksumInput).digest('hex').slice(0, 6).toUpperCase();

  const code = `${config.activationCode.prefix}-${seg2}-${checksum}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + config.activationCode.expiryDays * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    'INSERT INTO activation_codes (code, recipient_email, role, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(code, email, role, 'unused', now, expiresAt);

  return {
    code,
    recipient_email: email,
    role,
    status: 'unused',
    created_at: now,
    expires_at: expiresAt,
    used_at: null,
    used_by: null,
  };
}

// ── Validate activation code format ───────────────────────────────

export function validateCodeFormat(code: string): boolean {
  const parts = code.trim().toUpperCase().split('-');
  if (parts.length !== 5) return false;
  if (parts[0] !== 'RN' || parts[1] !== 'SKYE') return false;
  if (parts[2] !== '510510') return false;
  if (parts[3].length !== 6 || parts[4].length !== 6) return false;
  return /^[0-9A-F]{6}$/.test(parts[3]) && /^[0-9A-F]{6}$/.test(parts[4]);
}
