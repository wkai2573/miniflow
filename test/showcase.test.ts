import { describe, expect, test } from 'bun:test';
import { posix } from 'node:path';
import { render } from '../src/render';
import type { FlowSpec } from '../src';
import { buildShowcase, langDir } from '../examples/showcase';
import { createEcommerce } from '../examples/ecommerce';
import { langs, type Lang } from '../examples/shell-strings';
import { createCicd } from '../examples/cicd';
import { createRag } from '../examples/rag';

const files = buildShowcase();
const paths = Object.keys(files);
const pages = paths.filter((path) => path.endsWith('.html'));
// 檔案所在的語言目錄（以輸出路徑的目錄前綴比對，語言清單來自單一來源）
const dirOf = (path: string) => path.slice(0, path.length - posix.basename(path).length);
const inLang = (path: string, lang: Lang) => dirOf(path) === langDir[lang];
const langOf = (path: string) => langs.find((lang) => inLang(path, lang));
const pagesOf = (lang: Lang) => pages.filter((p) => inLang(p, lang));
const enPages = pagesOf('en');
const zhPages = pagesOf('zh-Hant');

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

  test('每個檔案都屬於某個支援語言', () => {
    for (const p of paths) expect(langOf(p)).toBeDefined();
  });

  test.each(langs)('%s 的頁面集合涵蓋總覽頁、三張獨立流程頁、三份 SVG 與互動頁', (lang) => {
    expect(
      paths
        .filter((p) => inLang(p, lang))
        .map((p) => posix.basename(p))
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
  test('每個頁面的 lang 屬性是所屬語言', () => {
    for (const p of pages) expect(files[p]).toContain(`<html lang="${langOf(p)}">`);
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

  test('英文頁面整頁（含流程圖、內嵌腳本與規格）不含繁中字串', () => {
    for (const p of enPages) expect(files[p]).not.toMatch(CJK);
  });

  test('英文 SVG 不含繁中字串', () => {
    for (const p of paths.filter((p) => p.endsWith('.svg') && inLang(p, 'en'))) {
      expect(files[p]).not.toMatch(CJK);
    }
  });

  test('繁中頁面保留原本的繁中內容', () => {
    const html = files[`${langDir['zh-Hant']}index.html`]!;
    expect(html).toContain('<title>miniflow 範例圖集 Showcase - miniflow 範例</title>');
    expect(html).toContain('總覽 Showcase');
    expect(html).toContain('🛒 電商訂單履約');
    expect(html).toContain('開啟獨立頁面');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('清空紀錄');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('攔截點擊事件：nodeId=');
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

  test('站內連結不跨語言，頁面沒有語言切換連結', () => {
    for (const path of pages) {
      const dir = posix.dirname(path);
      const crossing = internalHrefs(files[path]!)
        .map((href) => posix.join(dir, href))
        .filter((target) => langOf(target) !== langOf(path));
      expect(crossing).toEqual([]);
    }
  });
});

// 只取結構：節點 id 與格位、連線端點與基調、外框包住的節點
const structure = (spec: FlowSpec) => ({
  nodes: spec.nodes.map((n) => [n.id, n.kind, n.icon, n.row, n.col, n.rowSpan, n.colSpan, n.href]),
  edges: (spec.edges ?? []).map((e) => [e.from, e.to, e.tone, e.fromSide, e.toSide]),
  frames: (spec.frames ?? []).map((f) => f.wraps),
  layout: spec.layout,
});

const factories = [
  ['電商', createEcommerce],
  ['CI/CD', createCicd],
  ['RAG', createRag],
] as const;

describe('範例規格', () => {
  describe.each(factories)('%s範例', (_name, create) => {
    test.each(langs)('%s 能通過 render 驗證而不拋錯', (lang) => {
      expect(() => render(create(lang))).not.toThrow();
    });

    test('所有語言的節點 id、格位與連線集合完全一致', () => {
      const [first, ...rest] = langs;
      for (const lang of rest) expect(structure(create(lang))).toEqual(structure(create(first)));
    });

    test('英文版的所有可見文字都是英文', () => {
      const spec = create('en');
      const visible = JSON.stringify([
        spec.title,
        spec.legend,
        spec.nodes.map((n) => [n.label, n.sub, n.title]),
        spec.edges?.map((e) => e.label),
        spec.frames?.map((f) => f.label),
      ]);
      expect(visible).not.toMatch(CJK);
    });
  });

  test('繁中電商範例維持原文', () => {
    const zh = createEcommerce('zh-Hant');
    expect(zh.title).toBe('電商訂單與履約流程');
    expect(zh.nodes[1]).toMatchObject({ label: '結帳收銀台', sub: '填寫收件資訊', title: '前往結帳' });
    expect(zh.edges?.[5]?.label).toBe('付款完成 Webhook');
    expect(zh.frames?.[0]?.label).toBe('01 結帳階段');
  });

  test('繁中 CI/CD 範例維持原文', () => {
    const zh = createCicd('zh-Hant');
    expect(zh.title).toBe('CI/CD 自動化建置與部署流水線');
    expect((zh.legend as { title?: string }).title).toBe('流水線階段');
    expect(zh.nodes[2]).toMatchObject({ label: '自動化測試', sub: '單元 / 整合測試' });
    expect(zh.nodes[9]).toMatchObject({ label: '自動復原 / 告警', title: 'PagerDuty 事件回應' });
    expect(zh.edges?.[3]?.label).toBe('測試失敗中斷');
    expect(zh.frames?.[1]?.label).toBe('CD 持續交付與部署');
  });

  test('繁中 RAG 範例維持原文', () => {
    const zh = createRag('zh-Hant');
    expect(zh.title).toBe('AI / RAG 智慧問答與檢索管線');
    expect((zh.legend as { title?: string }).title).toBe('架構圖例');
    expect(zh.nodes[2]).toMatchObject({ label: '意圖路由分析', sub: 'Function Calling' });
    expect(zh.nodes[7]).toMatchObject({ label: '串流回應接收', title: '串流偵錯監聽' });
    expect(zh.edges?.[8]?.label).toBe('快取命中直接回傳');
    expect(zh.frames?.[1]?.label).toBe('02 向量知識庫檢索 (RAG)');
  });

  test('各語言頁面與互動頁內嵌的圖使用該語言的文字', () => {
    expect(files['ecommerce.html']).toContain('E-commerce Order and Fulfillment');
    expect(files['ecommerce.svg']).toContain('Shopping cart');
    expect(files['ecommerce.svg']).toContain('Component types');
    expect(files['cicd.svg']).toContain('Pipeline stages');
    expect(files['cicd.html']).toContain('CI/CD Build and Deployment Pipeline');
    expect(files['rag.svg']).toContain('Architecture legend');
    expect(files['rag.html']).toContain('Vector embedding');
    expect(files[`${langDir['zh-Hant']}ecommerce.svg`]).toContain('購物車');
    expect(files[`${langDir['zh-Hant']}ecommerce.svg`]).toContain('元件類型');
    expect(files[`${langDir['zh-Hant']}cicd.svg`]).toContain('流水線階段');
    expect(files[`${langDir['zh-Hant']}rag.svg`]).toContain('架構圖例');
    expect(files['demo-element.html']).toContain('Shopping cart');
    expect(files['demo-element.html']).toContain('Pipeline stages');
    expect(files['demo-element.html']).toContain('Architecture legend');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('購物車');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('流水線階段');
  });
});
