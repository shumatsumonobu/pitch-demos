# Changelog

All notable changes to this project will be documented in this file.

---

## 2026-03-05 — 商品棚 在庫チェック デモ追加

### Added

- **商品棚 在庫チェック**デモを実装（`/shelf-stock`）
  - 商品棚の画像から各商品の在庫状況（十分 / 残少 / 欠品）と棚上の位置（上段・中段・下段）を AI が判定
  - API: `POST /api/shelf-stock` → `[{ name, stock, location }]`
- サンプル画像 3 枚を追加（Nano Banana で生成 — 在庫十分・残少・欠品）
- `services/analyzeShelfStock.js` — Gemini による棚画像解析サービス
- `prompts/shelf-stock.js` — 在庫チェック用プロンプト
- `views/shelf-stock.js` — 在庫チェックページテンプレート
- `client/src/shelf-stock.js`, `client/src/shelf-stock.css` — フロントエンド

---

## 2026-02-20 — KV 永続化 & Workers 本番稼働

### Added

- デイリーリミットのカウンターを **Workers KV** に永続化（ローカルはインメモリフォールバック）
- iconv-lite シム（`shims/iconv-lite.js`）— wrangler バグ [#9309](https://github.com/cloudflare/workers-sdk/issues/9309) の回避策
- README にログ確認・シークレット管理・Workers 固有対応のセクションを追記

### Changed

- Handlebars 依存を完全除去 — Workers が `new Function()` を禁止するため
  - テンプレートを JS template literal 関数に変換
  - `lib/html.js` に HTML エスケープユーティリティを追加
- Workers エントリを `httpServerHandler`（`cloudflare:node`）に変更
- Gemini クライアントを遅延初期化に変更（Workers シークレットのタイミング問題を解消）
- `express.static` を try/catch でラップ（バンドル後の `import.meta.url` 未定義に対応）
- サンプル画像ファイル名を日本語 → ASCII にリネーム（Wrangler マニフェスト生成の制約回避）

### Deployed

- Cloudflare Workers へ初回デプロイ

---

## 2026-02-19 — Cloudflare Workers 対応 & プロジェクト再構成

### Added

- `src/worker.js`（Workers エントリポイント）、`wrangler.toml` を追加
- `.env.example` を追加
- 使用状況ページ `/status` を追加
- 判定結果にタブ切り替えを追加（テーブル / JSON）

### Changed

- **Cloudflare Workers 対応**（ローカル互換を維持）
  - `express-handlebars` → `handlebars` 直接使用（テンプレートを JS template literal に変換）
  - プロンプトを `.md` ファイル → `.js` エクスポートに変換
  - Vertex AI サービスアカウント認証 → AI Studio API キー認証に切り替え
  - デイリーリミットのファイル永続化を廃止
- プロジェクト構成をフラット化（`ocr-suite/` → ルート直下）
- プロジェクト名を `ocr-suite` → `pitch-demos` にリネーム
- `compatibility_date` を `wrangler.toml` に設定

---

## 2026-02-18 — 初期リリース

### Added

- **食事摂取量 AI 判定**デモを実装
- Vertex AI（サービスアカウント認証）による推論基盤を構築（AI Studio 版はコメント保持）
- プロンプトを `prompts/meal-intake.md` に外部化
- 決定的出力設定（`temperature: 0`, `topK: 1`, `ThinkingLevel.LOW`）
- API 呼び出しのリクエストログ（開始・成功・失敗）
- 1 日 50 回の API リクエスト制限ミドルウェア
- `.gitignore` をプロジェクトルートに作成

### Changed

- レスポンスをトップレベル配列に変更
- UI 改善 — ボタン色、プログレスバーの色分け・スリム化、画像フル幅表示
