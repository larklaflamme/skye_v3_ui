import { Router, Request, Response } from 'express';
import { loginUser, signupUser, getUserById, validateCodeFormat } from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { LoginSchema, SignupSchema } from '../types.js';
import { addAuditLog } from '../services/admin.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const result = loginUser(parsed.data.loginId, parsed.data.password);
  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  addAuditLog('AUTH', result.user.username, 'Login successful');
  res.json(result);
});

// POST /api/auth/signup
router.post('/signup', (req: Request, res: Response) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { username, email, activationCode, password } = parsed.data;

  // Validate code format
  if (!validateCodeFormat(activationCode)) {
    res.status(400).json({ error: 'Invalid activation code format. Must match RN-SKYE-510510-XXXXXX-XXXXXX' });
    return;
  }

  const result = signupUser(username, email, activationCode, password);
  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  addAuditLog('AUTH', username, `Account created with role: ${result.user.role}`);
  res.status(201).json(result);
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

export default router;
