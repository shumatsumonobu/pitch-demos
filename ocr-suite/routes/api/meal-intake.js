import {Router} from 'express';
import {body, validationResult} from 'express-validator';
import analyzeMealIntake from '#~/services/analyzeMealIntake.js';

const router = Router();

/**
 * 食事摂取量を判定する
 * @name POST /api/meal-intake
 */
router.post('/meal-intake', [
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

    const result = await analyzeMealIntake(req.body.image);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
