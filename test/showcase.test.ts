import { describe, expect, test } from 'bun:test';
import { render } from '../src/render';
import { buildShowcase } from '../examples/showcase';
import { ecommerce } from '../examples/ecommerce';
import { cicd } from '../examples/cicd';
import { rag } from '../examples/rag';

const files = buildShowcase();
const pages = Object.keys(files).filter((path) => path.endsWith('.html'));

describe('buildShowcase 頁面集合', () => {
  test('涵蓋總覽頁、三張獨立流程頁、三份 SVG 與互動頁', () => {
    expect(Object.keys(files).sort()).toEqual([
      'cicd.html',
      'cicd.svg',
      'demo-element.html',
      'ecommerce.html',
      'ecommerce.svg',
      'index.html',
      'rag.html',
      'rag.svg',
    ]);
  });

  test('SVG 為完整的 svg 文件', () => {
    for (const path of Object.keys(files).filter((p) => p.endsWith('.svg'))) {
      expect(files[path]).toMatch(/^<svg /);
    }
  });
});

describe('buildShowcase 站內導覽', () => {
  test('每個頁面的站內連結都指向存在的檔案', () => {
    for (const path of pages) {
      // 流程圖內節點自帶的連結與內嵌腳本字串不屬於站內導覽，先移除再檢查頁面外殼
      const shell = files[path]!.replace(/<(svg|script)[\s\S]*?<\/\1>/g, '');
      const hrefs = [...shell.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
      const internal = hrefs.filter((h) => !/^https?:\/\//.test(h));
      expect(internal.length).toBeGreaterThan(0);
      for (const href of internal) {
        expect(Object.keys(files)).toContain(href);
      }
    }
  });
});

describe('範例規格', () => {
  test.each([
    ['ecommerce', ecommerce],
    ['cicd', cicd],
    ['rag', rag],
  ])('%s 能通過 render 驗證而不拋錯', (_name, spec) => {
    expect(() => render(spec)).not.toThrow();
  });
});
