import { iconMarkup } from './icons';
import { frameRect, layoutNodes } from './layout';
import { routeEdge, toPath, type Point } from './route';
import { STYLE } from './style';
import { textWidth } from './text';
import type { FlowSpec, Kind, NodeSpec, Rect, Tone } from './types';

const MARGIN = 10;

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const num = (n: number) => String(Math.round(n * 100) / 100);

/** 會執行程式碼的網址不輸出。判斷前先去掉空白與控制字元，避免用夾雜字元繞過 */
function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  const scheme = href.replace(/[\u0000- ]/g, '');
  return /^(javascript|data|vbscript):/i.test(scheme) ? null : href.trim();
}

function nodeMarkup(n: NodeSpec, r: Rect): string {
  const inner = nodeBody(n, r);
  const title = n.title ? `<title>${escapeXml(n.title)}</title>` : '';
  const href = safeHref(n.href);
  if (href) return `<a class="mf-link" href="${escapeXml(href)}" data-id="${escapeXml(n.id)}">${title}${inner}</a>`;
  return title ? `<g>${title}${inner}</g>` : inner;
}

function nodeBody(n: NodeSpec, r: Rect): string {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const labelY = n.sub ? cy - 1 : cy + 5;
  return (
    `<rect class="mf-surface" x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}" rx="8"/>` +
    `<rect class="mf-box mf-${n.kind}" x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}" rx="8"/>` +
    iconMarkup(n.kind, n.icon, r.x, r.y) +
    `<text class="mf-text" x="${num(cx)}" y="${num(labelY)}" font-size="14" font-weight="600" text-anchor="middle">${escapeXml(n.label)}</text>` +
    (n.sub
      ? `<text class="mf-muted" x="${num(cx)}" y="${num(cy + 15)}" font-size="11" text-anchor="middle">${escapeXml(n.sub)}</text>`
      : '')
  );
}

const TONES: Tone[] = ['default', 'emphasis', 'dashed'];
const PILL_H = 17;
/** 水平連線的標籤底部離線的距離 */
const PILL_GAP = 9;

const defsMarkup = () =>
  `<defs>${TONES.map(
    (t) =>
      `<marker id="mf-head-${t}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon class="mf-head-${t}" points="0 0, 10 3.5, 0 7"/></marker>`,
  ).join('')}</defs>`;

/** 標籤放在連線的最後一段中央。垂直段壓在線上，水平段浮在線的上方 */
function pillMarkup(text: string, tone: Tone, points: Point[]): string {
  const w = textWidth(text, 10.5) + 14;
  const a = points[points.length - 2] as Point;
  const b = points[points.length - 1] as Point;
  const vertical = a[0] === b[0];
  const cx = (a[0] + b[0]) / 2;
  const cy = vertical ? (a[1] + b[1]) / 2 : a[1] - PILL_GAP - PILL_H / 2;
  return (
    `<rect class="mf-pill" x="${num(cx - w / 2)}" y="${num(cy - PILL_H / 2)}" width="${num(w)}" height="${PILL_H}" rx="8.5"/>` +
    `<text class="mf-pill-${tone}" x="${num(cx)}" y="${num(cy + 4)}" font-size="10.5" text-anchor="middle">${escapeXml(text)}</text>`
  );
}

const KINDS: Kind[] = ['frontend', 'backend', 'database', 'external'];
const KIND_NAMES: Record<Kind, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  external: 'External',
};

/** 圖例：只列用到的類型，與外框的下緣隔開一段距離，左緣對齊最左的節點 */
function legendMarkup(spec: FlowSpec, left: number, top: number): { markup: string; bottom: number } {
  const opts = typeof spec.legend === 'object' ? spec.legend : {};
  const names = { ...KIND_NAMES, ...opts.labels };
  const showCounts = opts.counts ?? true;
  const used = KINDS.filter((k) => spec.nodes.some((n) => n.kind === k));
  const titleY = top + 12;
  const rowY = titleY + 21;
  let x = left;
  let out = opts.title ? `<text class="mf-text" x="${num(left)}" y="${num(titleY)}" font-size="15" font-weight="650">${escapeXml(opts.title)}</text>` : '';
  const itemsY = opts.title ? rowY : titleY;
  for (const kind of used) {
    const name = names[kind];
    const count = spec.nodes.filter((n) => n.kind === kind).length;
    const nameW = textWidth(name, 12);
    out +=
      `<rect class="mf-${kind}" x="${num(x)}" y="${num(itemsY - 10)}" width="18" height="12" rx="3" stroke-width="1"/>` +
      `<text class="mf-muted" x="${num(x + 26)}" y="${num(itemsY)}" font-size="12" font-weight="500">${escapeXml(name)}</text>`;
    let width = 26 + nameW;
    if (showCounts) {
      const badgeW = Math.max(16, String(count).length * 6 + 8);
      const bx = x + 26 + nameW + 4;
      out +=
        `<rect class="mf-badge" x="${num(bx)}" y="${num(itemsY - 13)}" width="${num(badgeW)}" height="16" rx="8"/>` +
        `<text class="mf-muted" x="${num(bx + badgeW / 2)}" y="${num(itemsY - 1.5)}" font-size="9.5" font-weight="700" text-anchor="middle">${count}</text>`;
      width += 4 + badgeW;
    }
    x += width + 28;
  }
  return { markup: out, bottom: itemsY + 4 };
}

function validateNodes(nodes: NodeSpec[]) {
  if (!nodes.length) throw new Error('至少需要一個節點');
  const seen = new Set<string>();
  for (const n of nodes) {
    if (seen.has(n.id)) throw new Error(`節點 id "${n.id}" 重複`);
    seen.add(n.id);
    if (!KINDS.includes(n.kind)) throw new Error(`節點 "${n.id}" 的 kind "${n.kind}" 不認得`);
  }
}

/** 把流程圖規格畫成 SVG 字串 */
export function render(spec: FlowSpec): string {
  validateNodes(spec.nodes);
  const rects = layoutNodes(spec.nodes, spec.layout);
  const nodes = spec.nodes.map((n) => nodeMarkup(n, rects[n.id] as Rect));

  const edges: string[] = [];
  const pills: string[] = [];
  for (const e of spec.edges ?? []) {
    const from = rects[e.from];
    const to = rects[e.to];
    if (!from) throw new Error(`連線的節點 "${e.from}" 不存在`);
    if (!to) throw new Error(`連線的節點 "${e.to}" 不存在`);
    const tone = e.tone ?? 'default';
    const points = routeEdge(from, to, { fromSide: e.fromSide, toSide: e.toSide });
    edges.push(`<path class="mf-edge mf-edge-${tone}" d="${toPath(points)}" marker-end="url(#mf-head-${tone})"/>`);
    if (e.label) pills.push(pillMarkup(e.label, tone, points));
  }

  const frameRects: Rect[] = [];
  const frames: string[] = [];
  const frameLabels: string[] = [];
  for (const f of spec.frames ?? []) {
    const wrapped = f.wraps.map((id) => {
      const r = rects[id];
      if (!r) throw new Error(`外框包住的節點 "${id}" 不存在`);
      return r;
    });
    const fr = frameRect(wrapped, spec.layout?.framePad);
    frameRects.push(fr);
    frames.push(
      `<rect class="mf-frame" x="${num(fr.x)}" y="${num(fr.y)}" width="${num(fr.w)}" height="${num(fr.h)}" rx="12"/>`,
    );
    const labelW = textWidth(f.label, 11.5, true) + 18;
    frameLabels.push(
      `<rect class="mf-frame-label" x="${num(fr.x + 4)}" y="${num(fr.y + 8)}" width="${num(labelW)}" height="20" rx="5"/>` +
        `<text class="mf-frame-text" x="${num(fr.x + 9)}" y="${num(fr.y + 22.5)}" font-size="11.5" font-weight="600">${escapeXml(f.label)}</text>`,
    );
  }

  const all = [...Object.values(rects), ...frameRects];
  const minX = Math.min(...all.map((r) => r.x)) - MARGIN;
  const minY = Math.min(...all.map((r) => r.y)) - MARGIN;
  const maxX = Math.max(...all.map((r) => r.x + r.w)) + MARGIN;
  let maxY = Math.max(...all.map((r) => r.y + r.h)) + MARGIN;

  let legend = '';
  if (spec.legend) {
    const left = Math.min(...Object.values(rects).map((r) => r.x));
    const result = legendMarkup(spec, left, maxY - MARGIN + 30);
    legend = result.markup;
    maxY = result.bottom + MARGIN;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="mf" role="img" aria-label="${escapeXml(spec.title ?? '流程圖')}" ` +
    `viewBox="${num(minX)} ${num(minY)} ${num(maxX - minX)} ${num(maxY - minY)}">` +
    `<style>${STYLE}</style>` +
    defsMarkup() +
    frames.join('') +
    edges.join('') +
    nodes.join('') +
    pills.join('') +
    frameLabels.join('') +
    legend +
    `</svg>`
  );
}
