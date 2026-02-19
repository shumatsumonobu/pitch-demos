import {Router} from 'express';
import {getStatus} from '../../middlewares/dailyLimit.js';

const router = Router();

/**
 * API使用状況
 * @name GET /api/status
 */
router.get('/status', (req, res) => {
  const {requestCount, dailyLimit} = getStatus();
  res.json({
    requestCount,
    dailyLimit,
    remaining: dailyLimit - requestCount,
    usagePercent: Math.round((requestCount / dailyLimit) * 100),
    isWarning: requestCount / dailyLimit > 0.8,
  });
});

export default router;
