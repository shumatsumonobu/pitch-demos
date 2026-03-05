import {Router} from 'express';
import {body, validationResult} from 'express-validator';
import analyzeShelfStock from '#~/services/analyzeShelfStock.js';

const router = Router();

/**
 * 商品棚の在庫状況を判定する
 * @name POST /api/shelf-stock
 */
router.post('/shelf-stock', [
  body('image')
    .notEmpty().withMessage('画像が必要です')
    .custom(value => {
      if (typeof value === 'string' && value.startsWith('data:'))
        return true;
      throw new Error('無効な画像形式です');
    }),
], async (req, res, next) => {
  try {
    // バリデーションチェック
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({errors: errors.array()});

    const result = await analyzeShelfStock(req.body.image);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
