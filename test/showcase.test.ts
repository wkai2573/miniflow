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
const ROOT_PAGE = 'index.html';
const pages = paths.filter((path) => path.endsWith('.html') && path !== ROOT_PAGE);
// 檔案所在的語言目錄（以輸出路徑的目錄前綴比對，語言清單來自單一來源）
const dirOf = (path: string) => path.slice(0, path.length - posix.basename(path).length);
const inLang = (path: string, lang: Lang) => dirOf(path) === langDir[lang];
const langOf = (path: string) => langs.find((lang) => inLang(path, lang));
const pagesOf = (lang: Lang) => pages.filter((p) => inLang(p, lang));
const enPages = pagesOf('en');
const zhPages = pagesOf('zh-Hant');
const hansPages = pagesOf('zh-Hans');

const CJK = /[㐀-鿿]/;
// 移除流程圖與內嵌腳本的內容，只留頁面外殼
const stripSvgAndScript = (html: string) => html.replace(/<(svg|script)[\s\S]*?<\/\1>/g, '');
const internalHrefs = (html: string) =>
  [...stripSvgAndScript(html).matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1]!)
    .filter((h) => !/^https?:\/\//.test(h));
// 指向目錄的連結（結尾斜線）解析成該目錄的 index.html
const targetOf = (dir: string, href: string) => {
  const target = posix.join(dir, href);
  return href.endsWith('/') ? `${target}/index.html`.replace(/^\//, '') : target;
};
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

  test('根目錄只有導向頁，其餘檔案都屬於某個支援語言', () => {
    expect(paths.filter((p) => dirOf(p) === '')).toEqual([ROOT_PAGE]);
    for (const p of paths.filter((p) => p !== ROOT_PAGE)) expect(langOf(p)).toBeDefined();
  });

  test('各語言目錄的檔案清單兩兩對稱', () => {
    const names = (lang: Lang) =>
      paths
        .filter((p) => inLang(p, lang))
        .map((p) => p.slice(langDir[lang].length))
        .sort();
    for (const lang of langs) expect(names(lang)).toEqual(names(langs[0]));
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
      expect(metaContent(files[p]!, 'property', 'og:image')).toBe('../thumb.webp');
    }
    for (const p of zhPages) {
      expect(metaContent(files[p]!, 'property', 'og:image')).toBe('../thumb.zh-TW.webp');
    }
  });

  test('簡中頁的 og:image 沿用英文縮圖，路徑隨目錄深度計算', () => {
    for (const p of hansPages) {
      expect(metaContent(files[p]!, 'property', 'og:image')).toBe('../thumb.webp');
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

describe('buildShowcase 簡體中文頁面', () => {
  const hans = (name: string) => files[`${langDir['zh-Hans']}${name}`]!;
  const hant = (name: string) => files[`${langDir['zh-Hant']}${name}`]!;
  // 簡體字專用字形，繁體頁面不應出現
  const simplifiedOnly = /[览图个们发线节络点户务库区这构测试开关务据]/;

  test('簡中頁面 lang 為 zh-Hans，並有簡體的標題、描述與社群預覽標籤', () => {
    const html = hans('index.html');
    expect(html).toContain('<html lang="zh-Hans">');
    expect(html).toContain('<title>miniflow 示例图集 Showcase - miniflow 示例</title>');
    expect(metaContent(html, 'name', 'description')).toBe(
      '轻量、易嵌入的简易流程图：以网格描述节点，输出 SVG 或 Web Component。',
    );
    expect(metaContent(html, 'property', 'og:title')).toBe('miniflow 流程图');
    expect(metaContent(html, 'property', 'og:description')).toContain('节点');
  });

  test('導覽、按鈕、提示氣泡與事件紀錄是簡體', () => {
    const demo = hans('demo-element.html');
    expect(hans('index.html')).toContain('打开独立页面');
    expect(demo).toContain('清空日志');
    expect(demo).toContain('拦截点击事件：nodeId=');
    expect(demo).toContain('点击节点：');
    expect(demo).toContain('🛒 电商订单履约');
  });

  test('互動頁內嵌三份簡體規格', () => {
    const demo = hans('demo-element.html');
    expect(demo).toContain('购物车');
    expect(demo).toContain('流水线阶段');
    expect(demo).toContain('架构图例');
  });

  test.each(['ecommerce', 'cicd', 'rag'])('%s 的簡體 SVG 是簡體且與繁體不同', (key) => {
    const svg = hans(`${key}.svg`);
    expect(svg).toMatch(simplifiedOnly);
    expect(svg).not.toBe(hant(`${key}.svg`));
  });

  test('簡體頁面文字與繁體頁面的對應文字不同', () => {
    for (const name of ['index.html', 'ecommerce.html', 'cicd.html', 'rag.html', 'demo-element.html']) {
      expect(stripSvgAndScript(hans(name))).not.toBe(stripSvgAndScript(hant(name)));
    }
    expect(stripSvgAndScript(hans('index.html'))).toMatch(simplifiedOnly);
  });

  test('簡體用詞與詞彙表的簡體對照一致', () => {
    // 詞彙表：節點→节点、連線→连线、網格單元→网格单元
    expect(hans('index.html')).toContain('以网格描述节点');
    expect(hans('demo-element.html')).toContain('点击节点');
  });
});

describe('buildShowcase 站內導覽', () => {
  test('每個頁面的站內連結都指向存在的檔案', () => {
    for (const path of pages) {
      const hrefs = internalHrefs(files[path]!);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(paths).toContain(targetOf(posix.dirname(path), href));
      }
    }
  });

  test('站內連結不跨語言，頁面沒有語言切換連結', () => {
    for (const path of pages) {
      const dir = posix.dirname(path);
      const crossing = internalHrefs(files[path]!)
        .map((href) => targetOf(dir, href))
        .filter((target) => langOf(target) !== langOf(path));
      expect(crossing).toEqual([]);
    }
  });
});

describe('buildShowcase 根目錄導向頁', () => {
  const root = files[ROOT_PAGE]!;
  const hrefs = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]!);

  test('導向頁是英文頁面，並指向共用縮圖', () => {
    expect(root).toContain('<html lang="en">');
    expect(metaContent(root, 'property', 'og:image')).toBe('thumb.webp');
  });

  test('頁面本身是語言選單：三個語言各一個連結，名稱用該語言自己的文字', () => {
    const body = root.replace(/<script[\s\S]*?<\/script>/g, '');
    expect(hrefs(body).sort()).toEqual(langs.map((lang) => langDir[lang]).sort());
    for (const name of ['English', '繁體中文', '简体中文']) expect(body).toContain(`>${name}</a>`);
  });

  test('各語言版本有 hreflang 替代連結，預設版本標為 x-default 並指向英文', () => {
    const alternate = (hreflang: string) =>
      new RegExp(`<link rel="alternate" hreflang="${hreflang}" href="([^"]*)">`).exec(root)?.[1];
    for (const lang of langs) expect(alternate(lang)).toBe(langDir[lang]);
    expect(alternate('x-default')).toBe(langDir.en);
  });

  test('語言選單連結指向存在的語言目錄頁面', () => {
    for (const lang of langs) expect(paths).toContain(`${langDir[lang]}index.html`);
  });
});

describe('buildShowcase 根目錄導向行為', () => {
  // 取出導向頁的內嵌腳本，在假的偏好語言清單與假的網址位置下執行
  const script = /<script>([\s\S]*?)<\/script>/.exec(files[ROOT_PAGE]!)![1]!;
  const run = (languages: readonly string[], pathname = '/miniflow/') => {
    const calls: string[] = [];
    const navigator = { languages, language: languages[0] };
    const location = {
      pathname,
      replace: (url: string) => calls.push(url),
      assign: (url: string) => calls.push(`assign:${url}`),
      set href(url: string) {
        calls.push(`href:${url}`);
      },
    };
    new Function('navigator', 'location', script)(navigator, location);
    return calls;
  };
  const dest = run;
  const to = (lang: Lang, prefix = '/miniflow/') => [`${prefix}${langDir[lang]}`];

  test.each([
    ['zh-TW', 'zh-Hant'],
    ['zh-HK', 'zh-Hant'],
    ['zh-MO', 'zh-Hant'],
    ['zh-Hant', 'zh-Hant'],
    ['zh-Hant-CN', 'zh-Hant'],
    ['zh-CN', 'zh-Hans'],
    ['zh-SG', 'zh-Hans'],
    ['zh-Hans', 'zh-Hans'],
    ['zh-Hans-TW', 'zh-Hans'],
    ['zh', 'zh-Hans'],
    ['en', 'en'],
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['fr', 'en'],
  ] as const)('偏好語言 %s 導向 %s', (tag, lang) => {
    expect(dest([tag])).toEqual(to(lang));
  });

  test('依偏好順序取第一個有對應的語言，略過不支援的語言', () => {
    expect(dest(['ja', 'zh-TW'])).toEqual(to('zh-Hant'));
    expect(dest(['ja-JP', 'ko', 'zh-CN', 'zh-TW'])).toEqual(to('zh-Hans'));
  });

  test('第一偏好是英文時，不看後面的中文', () => {
    expect(dest(['en-US', 'zh-TW'])).toEqual(to('en'));
  });

  test('比對不分大小寫', () => {
    expect(dest(['ZH-tw'])).toEqual(to('zh-Hant'));
    expect(dest(['zh-hANs-cn'])).toEqual(to('zh-Hans'));
    expect(dest(['EN-us'])).toEqual(to('en'));
    expect(dest(['ZH-HANT-CN'])).toEqual(to('zh-Hant'));
  });

  test('清單為空或全無對應時導向英文', () => {
    expect(dest([])).toEqual(to('en'));
    expect(dest(['ja', 'ko', 'de'])).toEqual(to('en'));
  });

  test('網址缺結尾斜線時補上，並以所在目錄為基準', () => {
    expect(dest(['zh-TW'], '/miniflow')).toEqual(to('zh-Hant'));
    expect(dest(['zh-CN'], '/')).toEqual(to('zh-Hans', '/'));
    expect(dest(['en'], '/a/b/index.html')).toEqual(to('en', '/a/b/'));
    expect(dest(['zh-TW'], '/nested/miniflow')).toEqual(to('zh-Hant', '/nested/miniflow/'));
  });

  test('導向時取代目前紀錄，不新增瀏覽紀錄', () => {
    // run 的假位置只有 replace 會被記成純網址，assign 與 href 設定會帶前綴
    for (const call of run(['zh-TW'])) expect(call).not.toMatch(/^(assign|href):/);
    expect(run(['zh-TW'])).toHaveLength(1);
  });

  test('每個內容頁都不含導向腳本，直接進入語言目錄的網址不被導向', () => {
    for (const p of pages) expect(files[p]).not.toContain('location.replace');
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
    expect(files[`${langDir.en}ecommerce.html`]).toContain('E-commerce Order and Fulfillment');
    expect(files[`${langDir.en}ecommerce.svg`]).toContain('Shopping cart');
    expect(files[`${langDir.en}ecommerce.svg`]).toContain('Component types');
    expect(files[`${langDir.en}cicd.svg`]).toContain('Pipeline stages');
    expect(files[`${langDir.en}cicd.html`]).toContain('CI/CD Build and Deployment Pipeline');
    expect(files[`${langDir.en}rag.svg`]).toContain('Architecture legend');
    expect(files[`${langDir.en}rag.html`]).toContain('Vector embedding');
    expect(files[`${langDir['zh-Hant']}ecommerce.svg`]).toContain('購物車');
    expect(files[`${langDir['zh-Hant']}ecommerce.svg`]).toContain('元件類型');
    expect(files[`${langDir['zh-Hant']}cicd.svg`]).toContain('流水線階段');
    expect(files[`${langDir['zh-Hant']}rag.svg`]).toContain('架構圖例');
    expect(files[`${langDir.en}demo-element.html`]).toContain('Shopping cart');
    expect(files[`${langDir.en}demo-element.html`]).toContain('Pipeline stages');
    expect(files[`${langDir.en}demo-element.html`]).toContain('Architecture legend');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('購物車');
    expect(files[`${langDir['zh-Hant']}demo-element.html`]).toContain('流水線階段');
  });
});
