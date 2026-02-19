# Changelog

## 2026-02-19

- Cloudflare Workers 対応（ローカル互換維持）
  - `express-handlebars` → `handlebars` 直接使用（テンプレートをJS template literalに変換）
  - プロンプトを `.md` → `.js` エクスポートに変換
  - Vertex AI サービスアカウント → AI Studio APIキー認証に切り替え
  - デイリーリミットのファイル永続化を削除（インメモリのみ）
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
