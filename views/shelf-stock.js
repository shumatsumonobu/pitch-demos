export default () => `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- 左: 画像アップロード -->
  <div class="card bg-base-100 shadow-none rounded-sm border border-base-300">
    <div class="card-body">
      <h2 class="text-lg font-normal">商品棚画像</h2>
      <p class="text-sm text-base-content/80">商品棚の画像をアップロードすると、AIが各商品の在庫状況を自動判定します</p>
      <div class="flex items-center gap-2">
        <!-- サンプル画像プルダウン -->
        <select id="sample-select" class="select select-sm select-bordered w-56 h-10 min-h-0">
          <option value="" disabled selected>サンプル画像を選択</option>
          <option value="full">在庫十分</option>
          <option value="low">在庫少</option>
          <option value="empty">欠品</option>
        </select>
        <!-- 判定ボタン -->
        <button id="analyze-btn" class="btn btn-sm btn-primary !font-normal h-10 min-h-0 gap-1" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          判定する
        </button>
      </div>

      <!-- ドラッグ&ドロップエリア -->
      <div id="drop-zone" class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer">
        <div id="upload-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-2 text-base-content/80">画像をドラッグ&ドロップ、またはクリックして選択</p>
        </div>
        <img id="preview-image" class="hidden w-full h-auto rounded" alt="プレビュー" />
      </div>

      <input type="file" id="file-input" accept="image/*" class="hidden" />
    </div>
  </div>

  <!-- 右: 判定結果 -->
  <div class="card bg-base-100 shadow-none rounded-sm border border-base-300">
    <div class="card-body">
      <h2 class="text-lg font-normal">判定結果</h2>

      <!-- ローディング -->
      <div id="loading" class="hidden flex flex-col items-center justify-center py-12">
        <span class="loading loading-dots loading-lg text-primary"></span>
        <p class="mt-3 text-sm text-base-content/60">AIが画像を解析しています</p>
        <p id="elapsed-time" class="mt-1 text-xs tabular-nums text-base-content/70">0.0 秒</p>
      </div>

      <!-- 初期状態 -->
      <div id="empty-state" class="flex flex-col items-center justify-center py-12 text-base-content/40">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-base-content/60">画像をアップロードして判定してください</p>
      </div>

      <!-- 結果 -->
      <div id="result-area" class="hidden">
        <div role="tablist" class="tabs tabs-bordered mb-3">
          <button role="tab" class="tab tab-active" data-tab="table">テーブル</button>
          <button role="tab" class="tab" data-tab="json">JSON</button>
        </div>

        <!-- テーブルタブ -->
        <div id="tab-table">
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>在庫状況</th>
                  <th>位置</th>
                </tr>
              </thead>
              <tbody id="result-body">
              </tbody>
            </table>
          </div>
        </div>

        <!-- JSONタブ -->
        <div id="tab-json" class="hidden">
          <pre id="result-json" class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto"></pre>
        </div>
      </div>

      <!-- エラー -->
      <div id="error-area" class="hidden">
        <div class="alert alert-error">
          <span id="error-message"></span>
        </div>
      </div>
    </div>
  </div>
</div>`;
