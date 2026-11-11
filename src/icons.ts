import type { Icon, Kind } from './types';

const NS = 'vector-effect="non-scaling-stroke"';

/** 節點左上角的小圖示，座標系為 16×16 */
const GLYPH: Record<Exclude<Icon, 'none'>, (kind: Kind) => string> = {
  external: () =>
    `<rect x="2.5" y="5" width="8.5" height="8" rx="1.5" ${NS}/><path d="M8 2.5h5.5V8M13.5 2.5 7.5 8.5" ${NS}/>`,
  frontend: () =>
    `<rect x="2" y="3" width="12" height="10" rx="2" ${NS}/><path d="M2 6.5h12" ${NS}/>` +
    `<circle cx="4.1" cy="4.8" r=".7" class="mf-dot"/><circle cx="6.3" cy="4.8" r=".7" class="mf-dot"/>`,
  backend: () => `<path d="M6 3 3 8l3 5M10 3l3 5-3 5" ${NS}/>`,
  decision: () => `<path d="M8 2.2 13.8 8 8 13.8 2.2 8Z" ${NS}/>`,
  database: () =>
    `<ellipse cx="8" cy="4" rx="5" ry="2" ${NS}/>` +
    `<path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" ${NS}/>`,
};

/** 圖示的 SVG 標記。icon 為 none 時回傳空字串，未指定時依 kind 決定 */
export function iconMarkup(kind: Kind, icon: Icon | undefined, x: number, y: number): string {
  const which = icon ?? kind;
  if (which === 'none') return '';
  return `<g class="mf-icon mf-ico-${kind}" transform="translate(${x + 6} ${y + 6}) scale(0.6875)">${GLYPH[which](kind)}</g>`;
}
