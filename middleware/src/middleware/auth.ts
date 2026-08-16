import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import db from '../database.js';
import type { SafeUser } from '../types.js';

export interface JwtPayload {
  userId: string;
  sessionId: string;
}

/**
 * Express middleware that verifies the JWT token from the Authorization header.
 * Attaches `req.user` and `req.sessionId` on success.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Verify session exists and hasn't expired
    const session = db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND token = ? AND expires_at > datetime("now")'
    ).get(payload.sessionId, token) as { user_id: string } | undefined;

    if (!session) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    // Load user
    const user = db.prepare(
      'SELECT id, username, email, role, status, created_at, last_active FROM users WHERE id = ?'
    ).get(payload.userId) as SafeUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    req.user = user;
    req.sessionId = payload.sessionId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      next(err);
    }
  }
}

/**
 * Middleware that requires admin role.
 * Must be used AFTER requireAuth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

/**
 * Extract JWT payload from a token string (for WebSocket auth).
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
