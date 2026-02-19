export default `<div class="max-w-lg mx-auto mt-6">
  <div class="card bg-base-100 shadow-none border border-base-300">
    <div class="card-body">
      <h2 class="card-title text-lg font-normal">API 使用状況</h2>

      <div class="mt-4 space-y-4">
        <!-- 使用率プログレスバー -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-base-content/60">本日の使用率</span>
            <span class="font-medium">{{usagePercent}}%</span>
          </div>
          <progress class="progress {{#if isWarning}}progress-error{{else}}progress-primary{{/if}} w-full" value="{{requestCount}}" max="{{dailyLimit}}"></progress>
        </div>

        <!-- 詳細 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-base-200 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold">{{requestCount}}</div>
            <div class="text-xs text-base-content/60 mt-1">使用済み</div>
          </div>
          <div class="bg-base-200 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold">{{remaining}}</div>
            <div class="text-xs text-base-content/60 mt-1">残り</div>
          </div>
        </div>

        <div class="text-xs text-base-content/40 text-center">
          1日あたりの上限: {{dailyLimit}}回（日付が変わるとリセット）
        </div>
      </div>
    </div>
  </div>
</div>`;
