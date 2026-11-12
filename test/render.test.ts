import { describe, expect, test } from 'bun:test';
import { render } from '../src/render';
import type { FlowSpec, NodeSpec } from '../src/types';

const node = (id: string, row: number, col: number, extra: Partial<NodeSpec> = {}): NodeSpec => ({
  id,
  kind: 'frontend',
  label: id,
  row,
  col,
  ...extra,
});

describe('render 連線', () => {
  const two: FlowSpec = {
    nodes: [node('a', 0, 0), node('b', 1, 0)],
    edges: [{ from: 'a', to: 'b', label: '批號', tone: 'emphasis' }],
  };

  test('連線依節點位置畫出路徑，並帶箭頭與標籤', () => {
    const svg = render(two);
    expect(svg).toContain('d="M 75 60 L 75 150"');
    expect(svg).toContain('class="mf-edge mf-edge-emphasis"');
    expect(svg).toContain('marker-end="url(#mf-head-emphasis)"');
    expect(svg).toContain('>批號</text>');
  });

  test('轉角剛好落在終點時，標籤仍放在可見線段的中央，不壓在節點邊上', () => {
    const svg = render({
      nodes: [node('a', 0, 0), node('b', 0, 0, { pos: [75, 200] })],
      edges: [{ from: 'a', to: 'b', fromSide: 'bottom', toSide: 'left', label: 'X' }],
    });
    // 可見線段從 y=60 到 y=230，中央 145，膠囊高 17，所以膠囊頂端是 136.5
    expect(svg).toMatch(/class="mf-pill" x="[^"]+" y="136\.5"/);
  });

  test('連到不存在的節點時拋出指名的錯誤', () => {
    expect(() => render({ nodes: [node('a', 0, 0)], edges: [{ from: 'a', to: 'zzz' }] })).toThrow('連線的節點 "zzz" 不存在');
  });
});

describe('render 圖例', () => {
  const nodes = [node('a', 0, 0), node('b', 0, 1), node('c', 0, 2, { kind: 'external' })];

  test('圖例只列用到的類型，並附該類型的節點數', () => {
    const svg = render({ nodes, legend: true });
    expect(svg).toContain('>Frontend</text>');
    expect(svg).toContain('>External</text>');
    expect(svg).not.toContain('>Database</text>');
    expect(svg).toContain('>2</text>');
    expect(svg).toContain('>1</text>');
  });

  test('沒有要求圖例就不輸出', () => {
    expect(render({ nodes })).not.toContain('>Frontend</text>');
  });

  test('可自訂標題與各類型名稱，並關閉數量', () => {
    const svg = render({ nodes, legend: { title: '圖例', labels: { frontend: '前端' }, counts: false } });
    expect(svg).toContain('>圖例</text>');
    expect(svg).toContain('>前端</text>');
    expect(svg).toContain('>External</text>');
    expect(svg).not.toContain('>2</text>');
  });
});

describe('render 外框', () => {
  const spec: FlowSpec = {
    nodes: [node('a', 0, 0), node('b', 0, 1)],
    frames: [{ label: '01 上傳', wraps: ['a', 'b'] }],
  };

  test('外框包住指定節點，標籤顯示在外框上', () => {
    const svg = render(spec);
    expect(svg).toContain('<rect class="mf-frame" x="-20" y="-36" width="400" height="116"');
    expect(svg).toContain('>01 上傳</text>');
  });

  test('畫布範圍包含外框', () => {
    expect(render(spec)).toContain('viewBox="-30 -46 ');
  });

  test('可透過 layout.framePad 自訂外框留白', () => {
    const svg = render({ ...spec, layout: { framePad: { left: 10, right: 10 } } });
    expect(svg).toContain('<rect class="mf-frame" x="-10" y="-36" width="380" height="116"');
  });

  test('外框包住不存在的節點時拋出指名的錯誤', () => {
    expect(() => render({ nodes: [node('a', 0, 0)], frames: [{ label: 'x', wraps: ['q'] }] })).toThrow('外框包住的節點 "q" 不存在');
  });
});

describe('render 節點連結', () => {
  test('有 href 的節點包成連結，並帶提示文字', () => {
    const svg = render({ nodes: [node('a', 0, 0, { href: '/upload/crm', title: '前往：上傳 CRM' })] });
    expect(svg).toContain('<a class="mf-link" href="/upload/crm"');
    expect(svg).toContain('<title>前往：上傳 CRM</title>');
  });

  test('沒有 href 的節點不是連結', () => {
    expect(render({ nodes: [node('a', 0, 0)] })).not.toContain('<a ');
  });

  test('夾雜定位字元或實體寫法的變體也不會變成可執行的網址', () => {
    const tab = render({ nodes: [node('a', 0, 0, { href: 'java\tscript:alert(1)' })] });
    expect(tab).not.toContain('<a ');
    const entity = render({ nodes: [node('a', 0, 0, { href: 'jav&#x09;ascript:alert(1)' })] });
    expect(entity).toContain('href="jav&amp;#x09;ascript:alert(1)"');
    const data = render({ nodes: [node('a', 0, 0, { href: 'data:text/html,<script>1</script>' })] });
    expect(data).not.toContain('<a ');
  });

  test('javascript: 這類危險網址不會輸出', () => {
    const svg = render({ nodes: [node('a', 0, 0, { href: ' JavaScript:alert(1)' })] });
    expect(svg).not.toContain('<a ');
    expect(svg).not.toMatch(/javascript:/i);
  });
});

describe('render 輸入驗證', () => {
  test('節點 id 重複時拋出指名的錯誤', () => {
    expect(() => render({ nodes: [node('a', 0, 0), node('a', 1, 0)] })).toThrow('節點 id "a" 重複');
  });

  test('節點類型不認得時拋出指名的錯誤', () => {
    const bad = { ...node('a', 0, 0), kind: 'cache' } as unknown as NodeSpec;
    expect(() => render({ nodes: [bad] })).toThrow('節點 "a" 的 kind "cache" 不認得');
  });

  test('沒有任何節點時拋出錯誤', () => {
    expect(() => render({ nodes: [] })).toThrow('至少需要一個節點');
  });
});

describe('render 節點', () => {
  test('輸出 SVG，節點標籤與副標都在其中', () => {
    const svg = render({ nodes: [node('a', 0, 0, { label: 'CRM 檔', sub: '.csv' })] });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="');
    expect(svg).toContain('>CRM 檔</text>');
    expect(svg).toContain('>.csv</text>');
  });

  test('標籤中的特殊字元會跳脫，不能夾帶標籤', () => {
    const svg = render({ nodes: [node('a', 0, 0, { label: '<img src=x onerror=alert(1)>&"' })] });
    expect(svg).not.toContain('<img');
    expect(svg).toContain('&lt;img src=x onerror=alert(1)&gt;&amp;&quot;');
  });
});
