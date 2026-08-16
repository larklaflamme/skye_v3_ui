import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { listUsers, listCodes, createCode, getAuditLogs, addAuditLog } from '../services/admin.js';
import { GenerateCodeSchema } from '../types.js';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', (_req: Request, res: Response) => {
  const users = listUsers();
  res.json({ users });
});

// GET /api/admin/codes
router.get('/codes', (_req: Request, res: Response) => {
  const codes = listCodes();
  res.json({ codes });
});

// POST /api/admin/codes
router.post('/codes', (req: Request, res: Response) => {
  const parsed = GenerateCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { email, role } = parsed.data;
  const code = createCode(email, role);

  addAuditLog('ADMIN', req.user!.username, `Generated activation code for ${email} (${role})`);
  res.status(201).json({ code });
});

// GET /api/admin/logs
router.get('/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const logs = getAuditLogs(limit);
  res.json({ logs });
});

export default router;
