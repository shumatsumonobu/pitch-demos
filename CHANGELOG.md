# Changelog

## 2026-02-20

- デイリーリミットのカウンターを Workers KV に永続化（ローカルはインメモリフォールバック）
- Cloudflare Workers へ初回デプロイ
- Handlebars 依存を完全に除去（Workers が `new Function()` を禁止するため）
  - テンプレートを JS template literal 関数に変換
  - `lib/html.js` に HTMLエスケープユーティリティ追加
- iconv-lite シム追加（`shims/iconv-lite.js`、wrangler バグ [#9309](https://github.com/cloudflare/workers-sdk/issues/9309) 回避）
- Workers エントリを `httpServerHandler`（`cloudflare:node`）に変更
- Gemini クライアントを遅延初期化（Workers シークレットのタイミング対応）
- `express.static` を try/catch でラップ（バンドル後の `import.meta.url` 対応）
- サンプル画像ファイル名を日本語 → ASCII にリネーム（Wrangler のマニフェスト制約）
- README にログ・シークレット管理・Workers 固有対応を追記

## 2026-02-19

- Cloudflare Workers 対応（ローカル互換維持）
  - `express-handlebars` → `handlebars` 直接使用（テンプレートをJS template literalに変換）
  - プロンプトを `.md` → `.js` エクスポートに変換
  - Vertex AI サービスアカウント → AI Studio APIキー認証に切り替え
  - デイリーリミットのファイル永続化を削除
  - `src/worker.js` (Workersエントリポイント)、`wrangler.toml` 追加
- プロジェクト構成をフラット化（`ocr-suite/` → ルート直下）
- プロジェクト名を `ocr-suite` → `pitch-demos` にリネーム
- `compatibility_date` を `wrangler.toml` に追加
- `.env.example` 追加
- 使用状況ページ追加 (`/status`)
- 判定結果にタブ切り替え追加（テーブル / JSON）

## 2026-02-18

- Vertex AI (サービスアカウント認証) に移行、AI Studio版はコメント保持
- プロンプトを `prompts/meal-intake.md` に外部化
- レスポンスをトップレベル配列に変更
- 決定的出力設定 (`temperature: 0`, `topK: 1`, `ThinkingLevel.LOW`)
- API呼び出しのリクエストログ追加（開始・成功・失敗）
- 1日50回のAPIリクエスト制限ミドルウェア追加
- UI改善（ボタン色、プログレスバー色分け・スリム化、画像フル幅表示）
- `.gitignore` をプロジェクトルートに作成
