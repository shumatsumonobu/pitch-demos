import Handlebars from 'handlebars';
import layoutSrc from '../views/layout.js';
import mealIntakeSrc from '../views/meal-intake.js';
import statusSrc from '../views/status.js';

const layout = Handlebars.compile(layoutSrc);
const views = {
  'meal-intake': Handlebars.compile(mealIntakeSrc),
  'status': Handlebars.compile(statusSrc),
};

/**
 * Handlebarsテンプレートをレンダリングしてレスポンスに送信する
 * express-handlebarsの代替（fs不要）
 */
export function renderView(res, viewName, data = {}) {
  const body = views[viewName](data);
  const html = layout({...data, body: new Handlebars.SafeString(body)});
  res.send(html);
}
