/**
 * SVG 內嵌的樣式。顏色全部走 CSS 變數並附預設值，寄主專案只要在外層設定變數就能換主題。
 * 可用的變數見 README。
 */
export const STYLE = `
.mf{font-family:var(--mf-font,inherit)}
.mf-text{fill:var(--mf-text,#111827)}
.mf-muted{fill:var(--mf-muted,#5b6474)}
.mf-surface{fill:var(--mf-surface,#fff)}
.mf-box{stroke-width:1.25;filter:drop-shadow(0 1px 1px rgba(17,24,39,.05)) drop-shadow(0 6px 12px rgba(17,24,39,.06))}
.mf-frontend{fill:var(--mf-frontend-fill,rgba(34,211,238,.15));stroke:var(--mf-frontend,#0891b2)}
.mf-backend{fill:var(--mf-backend-fill,rgba(52,211,153,.18));stroke:var(--mf-backend,#059669)}
.mf-database{fill:var(--mf-database-fill,rgba(167,139,250,.2));stroke:var(--mf-database,#7c3aed)}
.mf-external{fill:var(--mf-external-fill,rgba(148,163,184,.18));stroke:var(--mf-external,#64748b)}
.mf-icon{fill:none;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round;opacity:.76}
.mf-ico-frontend{stroke:var(--mf-frontend,#0891b2);color:var(--mf-frontend,#0891b2)}
.mf-ico-backend{stroke:var(--mf-backend,#059669);color:var(--mf-backend,#059669)}
.mf-ico-database{stroke:var(--mf-database,#7c3aed);color:var(--mf-database,#7c3aed)}
.mf-ico-external{stroke:var(--mf-external,#64748b);color:var(--mf-external,#64748b)}
.mf-dot{fill:currentColor;stroke:none}
.mf-edge{fill:none}
.mf-edge-default{stroke:var(--mf-arrow,#64748b);stroke-width:1.5}
.mf-edge-emphasis{stroke:var(--mf-arrow-emphasis,#059669);stroke-width:1.8}
.mf-edge-dashed{stroke:var(--mf-arrow-dashed,#7c3aed);stroke-width:1.5;stroke-dasharray:4 4}
.mf-head-default{fill:var(--mf-arrow,#64748b)}
.mf-head-emphasis{fill:var(--mf-arrow-emphasis,#059669)}
.mf-head-dashed{fill:var(--mf-arrow-dashed,#7c3aed)}
.mf-pill{fill:var(--mf-surface,#fff);stroke:var(--mf-pill-border,#cbd5e1);stroke-width:.75}
.mf-pill-default{fill:var(--mf-arrow,#64748b)}
.mf-pill-emphasis{fill:var(--mf-arrow-emphasis,#059669)}
.mf-pill-dashed{fill:var(--mf-arrow-dashed,#7c3aed)}
.mf-frame{fill:var(--mf-frame-fill,rgba(217,119,6,.03));stroke:var(--mf-frame-stroke,#d1ad85);stroke-width:1}
.mf-frame-label{fill:var(--mf-frame-label-bg,#fbf1e6);stroke:var(--mf-frame-label-border,#f1cba0);stroke-width:.8}
.mf-frame-text{fill:var(--mf-frame-text,#d97706)}
.mf-badge{fill:var(--mf-surface,#fff);stroke:var(--mf-badge-border,#e5e7eb);stroke-width:1}
.mf-link{cursor:pointer;outline:none}
.mf-link:hover,.mf-link:focus-visible{filter:brightness(.95)}
`.replace(/\n/g, '');
