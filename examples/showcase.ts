// 展示站建置器：不接受外部輸入，回傳「相對路徑 → 檔案內容」對照表。
// 檔案寫入與資源複製由 build-example.ts 負責。
import { render, type FlowSpec } from '../src';
import { createEcommerce } from './ecommerce';
import { cicd } from './cicd';
import { rag } from './rag';
import { langs, shellStrings, type Lang } from './shell-strings';

type FlowKey = 'ecommerce' | 'cicd' | 'rag';
const flowKeys: FlowKey[] = ['ecommerce', 'cicd', 'rag'];
// 各語言的流程規格；cicd 與 rag 尚未字典化，兩個語言暫用同一份
export const flowsFor = (lang: Lang): Record<FlowKey, FlowSpec> => ({
  ecommerce: createEcommerce(lang),
  cicd,
  rag,
});

// 語言對應的輸出子目錄：英文在根目錄，繁中在 zh-TW/
const langDir: Record<Lang, string> = { en: '', 'zh-Hant': 'zh-TW/' };
const thumbFile: Record<Lang, string> = { en: 'thumb.webp', 'zh-Hant': 'thumb.zh-TW.webp' };

// 從某語言目錄回到輸出根目錄的相對前綴
const rootPrefix = (lang: Lang) => '../'.repeat(langDir[lang].split('/').length - 1);
const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'zh-Hant' : 'en');
// 目前語言頁面連到另一個語言同一頁的相對路徑
const switchHref = (lang: Lang, file: string) =>
  `${rootPrefix(lang)}${langDir[otherLang(lang)]}${file}`;

const fmtScript = `function fmt(t, v) { return Object.keys(v).reduce((r, k) => r.split('{' + k + '}').join(v[k]), t); }`;

// 節點點擊提示氣泡，流程頁與互動頁共用
const toastScript = `function showToast(label, id) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const pin = document.createTextNode(ui.toastPrefix);
    const strong = document.createElement('strong');
    strong.textContent = label;
    const suffix = document.createTextNode(' (' + id + ')' + ui.toastSuffix);
    toast.appendChild(pin);
    toast.appendChild(strong);
    toast.appendChild(suffix);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2000);
  }`;

const githubLink = (label: string) => `<a href="https://github.com/wkai2573/miniflow" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 12px; transition: background 0.15s ease;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        ${label} &nearr;
      </a>`;

const switchLink = (lang: Lang, file: string) =>
  `<a href="${switchHref(lang, file)}" hreflang="${otherLang(lang) === 'en' ? 'en' : 'zh-TW'}" lang="${otherLang(lang)}" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; color: #475569; text-decoration: none; font-weight: 500; font-size: 12px;">${shellStrings[lang].otherLanguageName}</a>`;

const navHtml = (lang: Lang, activeKey?: string) => {
  const s = shellStrings[lang];
  const item = (key: string, href: string, label: string) =>
    `<a href="${href}" class="${activeKey === key ? 'active' : ''}">${label}</a>`;
  return `<nav class="nav">
    ${item('index', 'index.html', s.navIndex)}
    ${item('ecommerce', 'ecommerce.html', s.navEcommerce)}
    ${item('cicd', 'cicd.html', s.navCicd)}
    ${item('rag', 'rag.html', s.navRag)}
    ${item('element', 'demo-element.html', s.navElement)}
  </nav>`;
};

// 內嵌進 <script> 的 JSON，避免 </script> 提前結束
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

// 共通頁面範本
const page = ({
  lang,
  file,
  title,
  subtitle,
  activeKey,
  body,
}: {
  lang: Lang;
  file: string;
  title: string;
  subtitle?: string;
  activeKey?: string;
  body: string;
}) => {
  const s = shellStrings[lang];
  const desc = subtitle || s.defaultDesc;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}${s.titleSuffix}</title>
  <meta property="og:title" content="${activeKey === 'index' ? s.ogIndexTitle : `${title} - miniflow`}">
  <meta name="description" content="${desc}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${rootPrefix(lang)}${thumbFile[lang]}">
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
        ${s.demoLink} &rarr;
      </a>
      ${switchLink(lang, file)}
      ${githubLink(s.githubRepo)}
    </div>
  </header>
  ${navHtml(lang, activeKey)}
  <div class="card">
    ${body}
  </div>
</main>
<div class="toast-container" id="toast-container"></div>
<script>
  const ui = ${scriptJson(s.runtime)};
  ${toastScript}

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
};

const demoPage = (lang: Lang, specsJson: string) => {
  const s = shellStrings[lang];
  const d = s.demo;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${d.ogTitle}</title>
  <meta property="og:title" content="${d.ogTitle}">
  <meta name="description" content="${d.desc}">
  <meta property="og:description" content="${d.desc}">
  <meta property="og:image" content="${rootPrefix(lang)}${thumbFile[lang]}">
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
      <h1>${d.title}</h1>
      <div class="desc">${d.desc.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
      ${switchLink(lang, 'demo-element.html')}
      ${githubLink(s.githubRepo)}
    </div>
  </header>
  ${navHtml(lang, 'element')}

  <div class="controls">
    <span style="font-size: 14px; font-weight: 600; color: #475569;">${d.controlsLabel}</span>
    <button class="tab-btn active" data-flow="ecommerce">${d.tabEcommerce}</button>
    <button class="tab-btn" data-flow="cicd">${d.tabCicd}</button>
    <button class="tab-btn" data-flow="rag">${d.tabRag}</button>
  </div>

  <div class="card">
    <flow-diagram id="diagram" style="display: block; width: 100%; min-width: 720px;"></flow-diagram>
  </div>

  <div class="console-card">
    <div class="console-header">
      <span>${d.logHeader}</span>
      <button id="clear-btn" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;">${d.clearLog}</button>
    </div>
    <div id="logs">
      <div class="log-placeholder" style="color: #64748b;">${s.runtime.logEmpty}</div>
    </div>
  </div>
</main>
<div class="toast-container" id="toast-container"></div>

<script src="${rootPrefix(lang)}miniflow.js"></script>
<script>
  const ui = ${scriptJson(s.runtime)};
  const specs = ${specsJson};
  const diagram = document.getElementById('diagram');
  const logsEl = document.getElementById('logs');
  const clearBtn = document.getElementById('clear-btn');
  const buttons = document.querySelectorAll('.tab-btn');

  ${fmtScript}
  ${toastScript}

  // Initialize the default spec
  diagram.spec = specs.ecommerce;

  // Tab switch buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const flowKey = btn.getAttribute('data-flow');
      const targetSpec = specs[flowKey];
      if (!targetSpec) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      diagram.spec = targetSpec;
      addLog('SPEC_CHANGE', fmt(ui.specChange, { title: targetSpec.title || flowKey }));
    });
  });

  // Intercept node-click events
  diagram.addEventListener('node-click', (e) => {
    // Prevent browser navigation
    e.preventDefault();
    const { id, href } = e.detail;
    addLog('NODE_CLICK', fmt(ui.nodeClick, { id: id, href: href }));
    const nodeEl = diagram.shadowRoot && diagram.shadowRoot.querySelector('a.mf-link[data-id="' + id + '"]');
    const textEl = nodeEl && nodeEl.querySelector('.mf-text');
    const label = textEl ? textEl.textContent : id;
    showToast(label, id);
  });

  function addLog(type, text) {
    // Detect an empty log by the placeholder element, not by any language's text
    if (logsEl.querySelector('.log-placeholder')) {
      logsEl.innerHTML = '';
    }
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = '<span style="color:#64748b">[' + time + ']</span> <span class="log-tag">' + type + '</span> ' + text;
    logsEl.prepend(item);
  }

  clearBtn.addEventListener('click', () => {
    logsEl.innerHTML = '';
    const note = document.createElement('div');
    note.className = 'log-placeholder';
    note.style.color = '#64748b';
    note.textContent = ui.logCleared;
    logsEl.appendChild(note);
  });
</script>
</body>
</html>`;
};

export function buildShowcase(): Record<string, string> {
  const files: Record<string, string> = {};

  for (const lang of langs) {
    const s = shellStrings[lang];
    const dir = langDir[lang];
    const flows = flowsFor(lang);

    // 1. 獨立的 SVG 與 HTML
    for (const key of flowKeys) {
      const { title, desc } = s.flows[key];
      const svg = render(flows[key]);
      files[`${dir}${key}.svg`] = svg;

      files[`${dir}${key}.html`] = page({
        lang,
        file: `${key}.html`,
        title,
        subtitle: desc,
        activeKey: key,
        body: `<div style="width: 100%; min-width: 720px;">
      ${svg.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}
    </div>`,
      });
    }

    // 2. 總覽頁面 index.html
    const indexCards = flowKeys
      .map((key) => {
        const { title, desc } = s.flows[key];
        const svg = render(flows[key]);
        return `
    <section style="margin-bottom: 36px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; color: #1e293b;">
          ${title}
        </h2>
        <div style="font-size: 13px;">
          <a href="${key}.html" style="color: #0284c7; text-decoration: none; margin-right: 12px;">${s.openStandalone}</a>
          <a href="${key}.svg" target="_blank" style="color: #64748b; text-decoration: none;">${s.viewSvg}</a>
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

    files[`${dir}index.html`] = page({
      lang,
      file: 'index.html',
      title: s.indexTitle,
      subtitle: s.defaultDesc,
      activeKey: 'index',
      body: indexCards,
    });

    // 3. Web Component 互動頁 (Tab 切換 + 即時 Event Log)
    files[`${dir}demo-element.html`] = demoPage(lang, scriptJson(flows));
  }

  return files;
}
