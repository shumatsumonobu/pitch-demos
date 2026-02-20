import {esc} from '../lib/html.js';

export default (data) => `<!DOCTYPE html>
<html lang="ja" data-theme="light">
<head>
  <title>${esc(data.title)}</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
  <link href="/build/meal-intake.css" rel="stylesheet" type="text/css" />
</head>
<body class="min-h-screen bg-base-200">
  <!-- Navbar -->
  <div class="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow-lg">
          <li><a href="/" class="${data.isHome ? 'font-semibold' : ''}">食事摂取量</a></li>
          <li><a href="/status" class="${data.isStatus ? 'font-semibold' : ''}">使用状況</a></li>
        </ul>
      </div>
      <a href="/" class="btn btn-ghost text-xl font-bold tracking-tight">Pitch Demos</a>
      <div class="hidden lg:flex ml-6 gap-6">
        <a href="/" class="text-sm ${data.isHome ? 'text-base-content' : 'text-base-content/60 hover:text-base-content'} transition-colors">食事摂取量</a>
        <a href="/status" class="text-sm ${data.isStatus ? 'text-base-content' : 'text-base-content/60 hover:text-base-content'} transition-colors">使用状況</a>
      </div>
    </div>
  </div>

  <!-- Content -->
  <main class="container mx-auto p-4 lg:p-6">
    ${data.body}
  </main>

  ${data.script ? `<script src="${esc(data.script)}"></script>` : ''}
</body>
</html>`;
