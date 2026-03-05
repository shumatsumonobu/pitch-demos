import layoutFn from '../views/layout.js';
import mealIntakeFn from '../views/meal-intake.js';
import shelfStockFn from '../views/shelf-stock.js';
import statusFn from '../views/status.js';

const views = {
  'meal-intake': mealIntakeFn,
  'shelf-stock': shelfStockFn,
  'status': statusFn,
};

/**
 * テンプレートをレンダリングしてレスポンスに送信する
 */
export function renderView(res, viewName, data = {}) {
  const body = views[viewName](data);
  const html = layoutFn({...data, body});
  res.send(html);
}
