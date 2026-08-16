import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { collectTelemetry } from '../services/telemetry.js';

const router = Router();

// GET /api/telemetry
router.get('/', requireAuth, (_req: Request, res: Response) => {
  const metrics = collectTelemetry();
  res.json({ metrics });
});

export default router;
