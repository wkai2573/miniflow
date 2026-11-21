import { describe, expect, test } from 'bun:test';
import { posix } from 'node:path';
import { render } from '../src/render';
import type { FlowSpec } from '../src';
import { buildShowcase } from '../examples/showcase';
import { createEcommerce } from '../examples/ecommerce';
import type { Lang } from '../examples/shell-strings';
import { cicd } from '../examples/cicd';
import { rag } from '../examples/rag';

const files = buildShowcase();
const paths = Object.keys(files);
const pages = paths.filter((path) => path.endsWith('.html'));
const zhPages = pages.filter((p) => p.startsWith('zh-TW/'));
const enPages = pages.filter((p) => !p.startsWith('zh-TW/'));

const CJK = /[㐀-鿿]/;
// 移除流程圖與內嵌腳本的內容，只留頁面外殼
const stripSvgAndScript = (html: string) => html.replace(/<(svg|script)[\s\S]*?<\/\1>/g, '');
const internalHrefs = (html: string) =>
  [...stripSvgAndScript(html).matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1]!)
    .filter((h) => !/^https?:\/\//.test(h));
const metaContent = (html: string, attr: string, name: string) =>
  new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`).exec(html)?.[1];

describe('buildShowcase 頁面集合', () => {
  const names = [
    'cicd.html',
    'cicd.svg',
    'demo-element.html',
    'ecommerce.html',
    'ecommerce.svg',
    'index.html',
    'rag.html',
    'rag.svg',
  ];

  test('根目錄是英文頁面集合，涵蓋總覽頁、三張獨立流程頁、三份 SVG 與互動頁', () => {
    expect(paths.filter((p) => !p.startsWith('zh-TW/')).sort()).toEqual(names);
  });

  test('zh-TW/ 底下是繁中頁面集合，檔案清單與根目錄對稱', () => {
    expect(
      paths
        .filter((p) => p.startsWith('zh-TW/'))
        .map((p) => p.slice('zh-TW/'.length))
        .sort(),
    ).toEqual(names);
  });

  test('SVG 為完整的 svg 文件', () => {
    for (const path of paths.filter((p) => p.endsWith('.svg'))) {
      expect(files[path]).toMatch(/^<svg /);
    }
  });
});

describe('buildShowcase 語言標示與社群預覽', () => {
  test('英文頁面 lang 為 en，繁中頁面為 zh-Hant', () => {
    for (const p of enPages) expect(files[p]).toContain('<html lang="en">');
    for (const p of zhPages) expect(files[p]).toContain('<html lang="zh-Hant">');
  });

  test('各語言頁面都有 title、描述與社群預覽標籤', () => {
    for (const p of pages) {
      const html = files[p]!;
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(metaContent(html, 'name', 'description')).toBeTruthy();
      expect(metaContent(html, 'property', 'og:title')).toBeTruthy();
      expect(metaContent(html, 'property', 'og:description')).toBeTruthy();
    }
  });

  test('英文頁 og:image 指向主縮圖，繁中頁指向帶語言後綴的縮圖', () => {
    for (const p of enPages) {
      expect(metaContent(files[p]!, 'property', 'og:image')).toBe('thumb.webp');
    }
    for (const p of zhPages) {
      expect(metaContent(files[p]!, 'property', 'og:image')).toBe('../thumb.zh-TW.webp');
    }
  });

  test('英文頁面的外殼不含繁中字串，連結語言名稱以外', () => {
    for (const p of enPages) {
      const shell = stripSvgAndScript(files[p]!).replace(/<a [^>]*hreflang="zh-TW"[^>]*>[^<]*<\/a>/, '');
      expect(shell).not.toMatch(CJK);
    }
  });

  test('英文互動頁在瀏覽器內執行的字串不含繁中', () => {
    const script = files['demo-element.html']!.match(/<script>[\s\S]*?<\/script>/g)!.join('\n');
    // 規格 JSON 在後續票券才會依語言輸出，這裡先排除
    expect(script.replace(/const specs = .*;\n/, '')).not.toMatch(CJK);
  });

  test('繁中頁面保留原本的繁中內容', () => {
    const html = files['zh-TW/index.html']!;
    expect(html).toContain('<title>miniflow 範例圖集 Showcase - miniflow 範例</title>');
    expect(html).toContain('總覽 Showcase');
    expect(html).toContain('🛒 電商訂單履約');
    expect(html).toContain('開啟獨立頁面');
    expect(files['zh-TW/demo-element.html']).toContain('清空紀錄');
    expect(files['zh-TW/demo-element.html']).toContain('攔截點擊事件：nodeId=');
  });
});

describe('buildShowcase 站內導覽', () => {
  test('每個頁面的站內連結都指向存在的檔案', () => {
    for (const path of pages) {
      const hrefs = internalHrefs(files[path]!);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(paths).toContain(posix.join(posix.dirname(path), href));
      }
    }
  });

  test('每頁都有連到另一個語言同一頁的連結', () => {
    for (const path of enPages) {
      expect(internalHrefs(files[path]!)).toContain(`zh-TW/${path}`);
    }
    for (const path of zhPages) {
      expect(internalHrefs(files[path]!)).toContain(`../${path.slice('zh-TW/'.length)}`);
    }
  });

  test('站內導覽連結不跨語言', () => {
    for (const path of pages) {
      const dir = posix.dirname(path);
      const crossing = internalHrefs(files[path]!)
        .map((href) => posix.join(dir, href))
        .filter((target) => target.startsWith('zh-TW/') !== path.startsWith('zh-TW/'));
      // 唯一跨語言的連結是切換連結，且指向同一頁
      const sameName = posix.basename(path);
      expect(crossing.length).toBe(1);
      expect(posix.basename(crossing[0]!)).toBe(sameName);
    }
  });
});

const langs: Lang[] = ['en', 'zh-Hant'];

// 只取結構：節點 id 與格位、連線端點與基調、外框包住的節點
const structure = (spec: FlowSpec) => ({
  nodes: spec.nodes.map((n) => [n.id, n.kind, n.icon, n.row, n.col, n.rowSpan, n.colSpan, n.href]),
  edges: (spec.edges ?? []).map((e) => [e.from, e.to, e.tone, e.fromSide, e.toSide]),
  frames: (spec.frames ?? []).map((f) => f.wraps),
  layout: spec.layout,
});

describe('範例規格', () => {
  test.each(langs)('電商範例 %s 能通過 render 驗證而不拋錯', (lang) => {
    expect(() => render(createEcommerce(lang))).not.toThrow();
  });

  test.each([
    ['cicd', cicd],
    ['rag', rag],
  ])('%s 能通過 render 驗證而不拋錯', (_name, spec) => {
    expect(() => render(spec)).not.toThrow();
  });

  test('電商範例兩個語言的節點 id、格位與連線集合完全一致', () => {
    expect(structure(createEcommerce('en'))).toEqual(structure(createEcommerce('zh-Hant')));
  });

  test('英文電商範例的所有可見文字都是英文，繁中電商範例維持原文', () => {
    const visible = (spec: FlowSpec) =>
      JSON.stringify([
        spec.title,
        spec.legend,
        spec.nodes.map((n) => [n.label, n.sub, n.title]),
        spec.edges?.map((e) => e.label),
        spec.frames?.map((f) => f.label),
      ]);
    expect(visible(createEcommerce('en'))).not.toMatch(CJK);
    const zh = createEcommerce('zh-Hant');
    expect(zh.title).toBe('電商訂單與履約流程');
    expect(zh.nodes[1]).toMatchObject({ label: '結帳收銀台', sub: '填寫收件資訊', title: '前往結帳' });
    expect(zh.edges?.[5]?.label).toBe('付款完成 Webhook');
    expect(zh.frames?.[0]?.label).toBe('01 結帳階段');
  });

  test('各語言頁面與互動頁內嵌的電商圖使用該語言的文字', () => {
    expect(files['ecommerce.html']).toContain('E-commerce Order and Fulfillment');
    expect(files['ecommerce.svg']).toContain('Shopping cart');
    expect(files['ecommerce.svg']).toContain('Component types');
    expect(files['zh-TW/ecommerce.svg']).toContain('購物車');
    expect(files['zh-TW/ecommerce.svg']).toContain('元件類型');
    expect(files['demo-element.html']).toContain('Shopping cart');
    expect(files['zh-TW/demo-element.html']).toContain('購物車');
  });
});
