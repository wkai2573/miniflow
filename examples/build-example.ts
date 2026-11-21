// 產生範例輸出到 examples/out：純 SVG、嵌在卡片裡的獨立 HTML、總覽展示頁、以及 Web Component 互動切換 Demo。
// 執行：bun run example（會先建置 dist）
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { buildShowcase } from './showcase';

const out = new URL('./out/', import.meta.url);
mkdirSync(out, { recursive: true });
copyFileSync(new URL('../dist/miniflow.js', import.meta.url), new URL('miniflow.js', out));
copyFileSync(new URL('./thumb.webp', import.meta.url), new URL('thumb.webp', out));

const files = buildShowcase();
for (const [path, content] of Object.entries(files)) {
  const target = new URL(path, out);
  mkdirSync(new URL('./', target), { recursive: true });
  writeFileSync(target, content);
}

console.log('已輸出到 examples/out：');
for (const path of Object.keys(files)) console.log(` - ${path}`);
