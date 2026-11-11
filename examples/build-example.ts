// 產生範例輸出到 examples/out：純 SVG、嵌在卡片裡的 HTML、以及用 Web Component 的 demo 頁。
// 執行：bun run example（會先建置 dist）
import { mkdirSync, writeFileSync } from 'node:fs';
import { render } from '../src';
import { mediator } from './mediator';

const out = new URL('./out/', import.meta.url);
mkdirSync(out, { recursive: true });

const svg = render(mediator);
writeFileSync(new URL('mediator.svg', out), svg);

const page = (body: string) => `<!doctype html>
<html lang="zh-Hant">
<meta charset="utf-8">
<title>miniflow 範例</title>
<style>
  body { margin: 0; padding: 32px 40px; font-family: system-ui, "Noto Sans TC", sans-serif; background: linear-gradient(#ecfeff99, #f8fafc); min-height: 100vh; }
  main { max-width: 72rem; margin: 0 auto; }
  h1 { margin: 0 0 24px; font-size: 24px; color: #0f172a; }
  .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #fff radial-gradient(circle at 1px 1px, #e2e7ec 1px, transparent 1.4px) 0 0 / 20px 20px; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 16px 40px -20px rgba(15,23,42,.18); }
</style>
<main>
<h1>Mediator 流程圖</h1>
<div class="card">${body}</div>
</main>`;

writeFileSync(new URL('mediator.html', out), page(`<div style="width:100%">${svg.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}</div>`));

const spec = JSON.stringify(mediator).replace(/</g, '\\u003c');
writeFileSync(
  new URL('demo-element.html', out),
  page(`<flow-diagram id="d"></flow-diagram>
<script src="../../dist/miniflow.js"></script>
<script>
  document.getElementById('d').spec = ${spec};
  document.getElementById('d').addEventListener('node-click', (e) => { e.preventDefault(); document.title = '點擊 ' + e.detail.id + ' → ' + e.detail.href; });
</script>`),
);

console.log('已輸出到 examples/out：mediator.svg、mediator.html、demo-element.html');
