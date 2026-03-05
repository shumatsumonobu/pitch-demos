import './shelf-stock.css';
import axios from 'axios';

// DOM要素
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewImage = document.getElementById('preview-image');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const resultArea = document.getElementById('result-area');
const resultBody = document.getElementById('result-body');
const errorArea = document.getElementById('error-area');
const errorMessage = document.getElementById('error-message');
const elapsedTime = document.getElementById('elapsed-time');
const resultJson = document.getElementById('result-json');

// 現在の画像データ
let currentImageData = null;

// 経過秒数タイマー
let elapsedTimer = null;

// サンプル画像パス
const SAMPLES = {
  'full':  '/build/media/samples/shelf-stock/full.jpg',
  'low':   '/build/media/samples/shelf-stock/low.jpg',
  'empty': '/build/media/samples/shelf-stock/empty.jpg',
};

// 在庫ラベル
const STOCK_LABELS = {
  full: {text: '十分', badge: 'badge-success'},
  low: {text: '残少', badge: 'badge-warning'},
  empty: {text: '欠品', badge: 'badge-error'},
};

/**
 * 画像をリサイズしてData URLに変換する（長辺1024px以下に縮小）
 */
function resizeImage(dataUrl, maxSize = 1024) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const {width, height} = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }
      const scale = maxSize / Math.max(width, height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

/**
 * 画像をプレビュー表示する
 */
function showPreview(dataUrl) {
  currentImageData = dataUrl;
  previewImage.src = dataUrl;
  previewImage.classList.remove('hidden');
  uploadPlaceholder.classList.add('hidden');
  dropZone.classList.remove('p-8');
  dropZone.classList.add('p-0');
  analyzeBtn.disabled = false;
}

/**
 * UI状態をリセットする
 */
function resetResult() {
  resultArea.classList.add('hidden');
  errorArea.classList.add('hidden');
  emptyState.classList.remove('hidden');
  loading.classList.add('hidden');
}

/**
 * 判定結果をテーブルに表示する
 */
function showResult(items) {
  resultBody.innerHTML = '';
  for (const item of items) {
    const label = STOCK_LABELS[item.stock] || {text: item.stock, badge: ''};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-medium">${item.name}</td>
      <td><span class="badge ${label.badge} badge-sm">${label.text}</span></td>
      <td class="text-sm text-base-content/60">${item.location}</td>
    `;
    resultBody.appendChild(tr);
  }
  resultJson.textContent = JSON.stringify(items, null, 2);
  emptyState.classList.add('hidden');
  loading.classList.add('hidden');
  errorArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
}

/**
 * エラーを表示する
 */
function showError(message) {
  errorMessage.textContent = message;
  emptyState.classList.add('hidden');
  loading.classList.add('hidden');
  resultArea.classList.add('hidden');
  errorArea.classList.remove('hidden');
}

/**
 * ファイルを読み込んでプレビューする
 */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/'))
    return;
  const reader = new FileReader();
  reader.onload = async e => {
    const resized = await resizeImage(e.target.result);
    showPreview(resized);
  };
  reader.readAsDataURL(file);
  resetResult();
}

/**
 * 判定APIを呼び出す
 */
async function analyze() {
  if (!currentImageData)
    return;

  loading.classList.remove('hidden');
  emptyState.classList.add('hidden');
  resultArea.classList.add('hidden');
  errorArea.classList.add('hidden');
  analyzeBtn.disabled = true;

  // 経過秒数タイマー開始
  const startTime = performance.now();
  elapsedTime.textContent = '0.0 秒';
  elapsedTimer = setInterval(() => {
    const sec = ((performance.now() - startTime) / 1000).toFixed(1);
    elapsedTime.textContent = `${sec} 秒`;
  }, 100);

  try {
    const {data} = await axios.post('/api/shelf-stock', {image: currentImageData});
    showResult(data);
  } catch (err) {
    const message = err.response?.data?.errors?.[0]?.msg || err.message || '判定に失敗しました';
    showError(message);
  } finally {
    clearInterval(elapsedTimer);
    analyzeBtn.disabled = false;
  }
}

// イベントリスナー

// クリックでファイル選択
dropZone.addEventListener('click', () => fileInput.click());

// ファイル選択
fileInput.addEventListener('change', e => {
  if (e.target.files.length > 0)
    handleFile(e.target.files[0]);
});

// ドラッグ&ドロップ
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0)
    handleFile(e.dataTransfer.files[0]);
});

// サンプル画像プルダウン
const sampleSelect = document.getElementById('sample-select');
sampleSelect.addEventListener('change', async () => {
  const url = SAMPLES[sampleSelect.value];
  if (!url) return;
  try {
    sampleSelect.disabled = true;
    const response = await fetch(encodeURI(url));
    const blob = await response.blob();
    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(blob);
    });
    const resized = await resizeImage(dataUrl);
    showPreview(resized);
    resetResult();
  } catch {
    showError('サンプル画像の読み込みに失敗しました');
  } finally {
    sampleSelect.disabled = false;
  }
});

// タブ切り替え
for (const tab of resultArea.querySelectorAll('[role="tab"]')) {
  tab.addEventListener('click', () => {
    for (const t of resultArea.querySelectorAll('[role="tab"]'))
      t.classList.remove('tab-active');
    tab.classList.add('tab-active');
    const target = tab.dataset.tab;
    document.getElementById('tab-table').classList.toggle('hidden', target !== 'table');
    document.getElementById('tab-json').classList.toggle('hidden', target !== 'json');
  });
}

// 判定ボタン
analyzeBtn.addEventListener('click', analyze);
