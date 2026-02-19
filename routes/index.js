import {Router} from 'express';
import {renderView} from '../lib/render.js';
import {getStatus} from '../middlewares/dailyLimit.js';

const router = Router();

/**
 * 食事摂取量判定ビュー
 * @name GET /
 */
router.get('/', (req, res) => {
  renderView(res, 'meal-intake', {
    title: '食事摂取量 AI 判定 | Pitch Demos',
    script: '/build/meal-intake.js',
    isHome: true,
  });
});

/**
 * 使用状況ビュー
 * @name GET /status
 */
router.get('/status', (req, res) => {
  const {requestCount, dailyLimit} = getStatus();
  renderView(res, 'status', {
    title: '使用状況 | Pitch Demos',
    isStatus: true,
    requestCount,
    dailyLimit,
    remaining: dailyLimit - requestCount,
    usagePercent: Math.round((requestCount / dailyLimit) * 100),
    isWarning: requestCount / dailyLimit > 0.8,
  });
});

export default router;
