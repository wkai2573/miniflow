// 展示站建置器：不接受外部輸入，回傳「相對路徑 → 檔案內容」對照表。
// 檔案寫入與資源複製由 build-example.ts 負責。
import { render, type FlowSpec } from '../src';
import { ecommerce } from './ecommerce';
import { cicd } from './cicd';
import { rag } from './rag';

const flows: Record<string, { spec: FlowSpec; name: string; desc: string }> = {
  ecommerce: {
    spec: ecommerce,
    name: '電商訂單與履約',
    desc: '展示購物車、庫存決策、第三方金流扣款、跨列訂單資料庫與出貨通知。',
  },
  cicd: {
    spec: cicd,
    name: 'CI/CD 自動化管線',
    desc: '展示 Pull Request 觸發、測試決策分支、Docker 建置、製品庫、預發與正式環境部屬。',
  },
  rag: {
    spec: rag,
    name: 'AI / RAG 檢索問答',
    desc: '展示 Web Chat 對話、API Gateway、意圖路由、向量知識庫檢索、LLM 推理與串流輸出。',
  },
};

// 共通頁面範本
const page = ({
  title,
  subtitle,
  activeKey,
  body,
}: {
  title: string;
  subtitle?: string;
  activeKey?: string;
  body: string;
}) => `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - miniflow 範例</title>
  <meta property="og:title" content="${activeKey === 'index' ? 'miniflow 流程圖' : `${title} - miniflow`}">
  <meta name="description" content="${subtitle || '輕量、好嵌入的簡易流程圖：以格狀描述節點，輸出 SVG 或 Web Component。'}">
  <meta property="og:description" content="${subtitle || '輕量、好嵌入的簡易流程圖：以格狀描述節點，輸出 SVG 或 Web Component。'}">
  <meta property="og:image" content="thumb.webp">
  <style>
    body {
      margin: 0;
      padding: 32px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      color: #0f172a;
      min-height: 100vh;
      box-sizing: border-box;
    }
    main { max-width: 82rem; margin: 0 auto; }
    header {
      margin-bottom: 24px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    h1 { margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; }
    .desc { color: #64748b; font-size: 14px; margin-top: 6px; }
    .nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .nav a {
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #475569;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      transition: all 0.15s ease-in-out;
    }
    .nav a:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
    .nav a.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
      font-weight: 600;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      background: #ffffff radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 1.4px) 0 0 / 20px 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
      overflow-x: auto;
    }
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      border: 1px solid #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: auto;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
<main>
  <header>
    <div>
      <h1>${title}</h1>
      ${subtitle ? `<div class="desc">${subtitle}</div>` : ''}
    </div>
    <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
      <a href="demo-element.html" style="color: #0284c7; text-decoration: none; font-weight: 500;">
        ⚡ 查看 Web Component 互動 Demo &rarr;
      </a>
      <a href="https://github.com/wkai2573/miniflow" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 12px; transition: background 0.15s ease;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub 倉庫 &nearr;
      </a>
    </div>
  </header>
  <nav class="nav">
    <a href="index.html" class="${activeKey === 'index' ? 'active' : ''}">總覽 Showcase</a>
    <a href="ecommerce.html" class="${activeKey === 'ecommerce' ? 'active' : ''}">🛒 電商訂單履約</a>
    <a href="cicd.html" class="${activeKey === 'cicd' ? 'active' : ''}">🚀 CI/CD 自動化管線</a>
    <a href="rag.html" class="${activeKey === 'rag' ? 'active' : ''}">🤖 AI / RAG 問答管線</a>
    <a href="demo-element.html" class="${activeKey === 'element' ? 'active' : ''}">⚡ Web Component 互動體驗</a>
  </nav>
  <div class="card">
    ${body}
  </div>
</main>
<div class="toast-container" id="toast-container"></div>
<script>
  function showToast(label, id) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const pin = document.createTextNode('📌 點擊節點：');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const suffix = document.createTextNode(' (' + id + ')（範例已停用外部跳轉）');
    toast.appendChild(pin);
    toast.appendChild(strong);
    toast.appendChild(suffix);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2000);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a.mf-link');
    if (!link) return;
    e.preventDefault();
    const id = link.getAttribute('data-id') || '';
    const textEl = link.querySelector('.mf-text');
    const label = textEl ? textEl.textContent : id;
    showToast(label, id);
  });
</script>
</body>
</html>`;

export function buildShowcase(): Record<string, string> {
  const files: Record<string, string> = {};

  // 1. 獨立的 SVG 與 HTML
  for (const [key, { spec, name, desc }] of Object.entries(flows)) {
    const svg = render(spec);
    files[`${key}.svg`] = svg;

    files[`${key}.html`] = page({
      title: spec.title || name,
      subtitle: desc,
      activeKey: key,
      body: `<div style="width: 100%; min-width: 720px;">
      ${svg.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}
    </div>`,
    });
  }

  // 2. 總覽頁面 index.html
  const indexCards = Object.entries(flows)
    .map(([key, { spec, desc }]) => {
      const svg = render(spec);
      return `
    <section style="margin-bottom: 36px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; color: #1e293b;">
          ${spec.title}
        </h2>
        <div style="font-size: 13px;">
          <a href="${key}.html" style="color: #0284c7; text-decoration: none; margin-right: 12px;">開啟獨立頁面</a>
          <a href="${key}.svg" target="_blank" style="color: #64748b; text-decoration: none;">檢視 SVG</a>
        </div>
      </div>
      <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">${desc}</p>
      <div class="card" style="margin-bottom: 8px;">
        <div style="width: 100%; min-width: 680px;">
          ${svg.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}
        </div>
      </div>
    </section>
  `;
    })
    .join('\n');

  files['index.html'] = page({
    title: 'miniflow 範例圖集 Showcase',
    subtitle: '輕量、好嵌入的簡易流程圖：以格狀描述節點，輸出 SVG 或 Web Component。',
    activeKey: 'index',
    body: indexCards,
  });

  // 3. Web Component 互動頁 demo-element.html (Tab 切換 + 即時 Event Log)
const specsJson = JSON.stringify({
  ecommerce,
  cicd,
  rag,
}).replace(/</g, '\\u003c');

const demoElementHtml = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>miniflow Web Component 互動 Demo</title>
  <meta property="og:title" content="miniflow Web Component 互動 Demo">
  <meta name="description" content="動態切換 <flow-diagram> 元件規格並示範 node-click 事件攔截機制。">
  <meta property="og:description" content="動態切換 <flow-diagram> 元件規格並示範 node-click 事件攔截機制。">
  <meta property="og:image" content="thumb.webp">
  <style>
    body {
      margin: 0;
      padding: 32px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      color: #0f172a;
      min-height: 100vh;
      box-sizing: border-box;
    }
    main { max-width: 82rem; margin: 0 auto; }
    header {
      margin-bottom: 24px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    h1 { margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; }
    .desc { color: #64748b; font-size: 14px; margin-top: 6px; }
    .nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .nav a {
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #475569;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      transition: all 0.15s ease-in-out;
    }
    .nav a:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
    .nav a.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
      font-weight: 600;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .tab-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tab-btn:hover { background: #f1f5f9; }
    .tab-btn.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      background: #ffffff radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 1.4px) 0 0 / 20px 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
      overflow-x: auto;
    }
    .console-card {
      margin-top: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #0f172a;
      color: #f8fafc;
      padding: 16px 20px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding-bottom: 8px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .log-item {
      margin: 4px 0;
      line-height: 1.5;
    }
    .log-tag {
      display: inline-block;
      padding: 2px 6px;
      background: #0369a1;
      color: #e0f2fe;
      border-radius: 4px;
      font-size: 11px;
      margin-right: 8px;
    }
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      border: 1px solid #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: auto;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
<main>
  <header>
    <div>
      <h1>miniflow Web Component 互動展示</h1>
      <div class="desc">動態切換 &lt;flow-diagram&gt; 元件規格並示範 node-click 事件攔截機制。</div>
    </div>
    <div style="font-size: 13px;">
      <a href="https://github.com/wkai2573/miniflow" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 12px; transition: background 0.15s ease;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub 倉庫 &nearr;
      </a>
    </div>
  </header>
  <nav class="nav">
    <a href="index.html">總覽 Showcase</a>
    <a href="ecommerce.html">🛒 電商訂單履約</a>
    <a href="cicd.html">🚀 CI/CD 自動化管線</a>
    <a href="rag.html">🤖 AI / RAG 問答管線</a>
    <a href="demo-element.html" class="active">⚡ Web Component 互動體驗</a>
  </nav>

  <div class="controls">
    <span style="font-size: 14px; font-weight: 600; color: #475569;">切換流程規格：</span>
    <button class="tab-btn active" data-flow="ecommerce">🛒 電商訂單履約</button>
    <button class="tab-btn" data-flow="cicd">🚀 CI/CD 自動化管線</button>
    <button class="tab-btn" data-flow="rag">🤖 AI / RAG 檢索問答</button>
  </div>

  <div class="card">
    <flow-diagram id="diagram" style="display: block; width: 100%; min-width: 720px;"></flow-diagram>
  </div>

  <div class="console-card">
    <div class="console-header">
      <span>Event Log (點擊上方含有超連結的節點測試攔截)</span>
      <button id="clear-btn" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;">清空紀錄</button>
    </div>
    <div id="logs">
      <div style="color: #64748b;">(尚未觸發任何 node-click 事件，請點擊圖表中帶有連結的節點)</div>
    </div>
  </div>
</main>
<div class="toast-container" id="toast-container"></div>

<script src="miniflow.js"></script>
<script>
  const specs = ${specsJson};
  const diagram = document.getElementById('diagram');
  const logsEl = document.getElementById('logs');
  const clearBtn = document.getElementById('clear-btn');
  const buttons = document.querySelectorAll('.tab-btn');

  function showToast(label, id) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const pin = document.createTextNode('📌 點擊節點：');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const suffix = document.createTextNode(' (' + id + ')（範例已停用外部跳轉）');
    toast.appendChild(pin);
    toast.appendChild(strong);
    toast.appendChild(suffix);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2000);
  }

  // 初始化預設規格
  diagram.spec = specs.ecommerce;

  // 切換按鈕事件
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const flowKey = btn.getAttribute('data-flow');
      const targetSpec = specs[flowKey];
      if (!targetSpec) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      diagram.spec = targetSpec;
      addLog('SPEC_CHANGE', '切換為 ' + (targetSpec.title || flowKey));
    });
  });

  // 攔截 node-click 事件
  diagram.addEventListener('node-click', (e) => {
    // 阻止瀏覽器跳轉
    e.preventDefault();
    const { id, href } = e.detail;
    addLog('NODE_CLICK', '攔截點擊事件：nodeId="' + id + '" → href="' + href + '" (已防止全頁跳轉)');
    const nodeEl = diagram.shadowRoot && diagram.shadowRoot.querySelector('a.mf-link[data-id="' + id + '"]');
    const textEl = nodeEl && nodeEl.querySelector('.mf-text');
    const label = textEl ? textEl.textContent : id;
    showToast(label, id);
  });

  function addLog(type, text) {
    if (logsEl.innerHTML.includes('(尚未觸發任何')) {
      logsEl.innerHTML = '';
    }
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = '<span style="color:#64748b">[' + time + ']</span> <span class="log-tag">' + type + '</span> ' + text;
    logsEl.prepend(item);
  }

  clearBtn.addEventListener('click', () => {
    logsEl.innerHTML = '<div style="color: #64748b;">(紀錄已清空)</div>';
  });
</script>
</body>
</html>`;

  files['demo-element.html'] = demoElementHtml;
  return files;
}
