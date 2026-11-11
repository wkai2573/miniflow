import type { LayoutOptions, NodeSpec, Rect } from './types';

const DEFAULTS = { nodeW: 150, nodeH: 60, gapX: 60, gapY: 90 };

/** 外框與被包住節點的距離。上方多留空間放標籤 */
const FRAME_PAD = { left: 30, right: 30, top: 36, bottom: 20 };

/** 包住一組節點的外框 */
export function frameRect(rects: Rect[]): Rect {
  if (!rects.length) throw new Error('外框至少要包住一個節點');
  const left = Math.min(...rects.map((r) => r.x));
  const top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  return {
    x: left - FRAME_PAD.left,
    y: top - FRAME_PAD.top,
    w: right - left + FRAME_PAD.left + FRAME_PAD.right,
    h: bottom - top + FRAME_PAD.top + FRAME_PAD.bottom,
  };
}

/** 依格位算出每個節點的矩形，以節點 id 為鍵 */
export function layoutNodes(nodes: NodeSpec[], options: LayoutOptions = {}): Record<string, Rect> {
  const { nodeW, nodeH, gapX, gapY } = { ...DEFAULTS, ...options };
  const rects: Record<string, Rect> = {};
  for (const n of nodes) {
    const colSpan = n.colSpan ?? 1;
    const rowSpan = n.rowSpan ?? 1;
    const grid: Rect = {
      x: n.col * (nodeW + gapX),
      y: n.row * (nodeH + gapY),
      w: colSpan * nodeW + (colSpan - 1) * gapX,
      h: rowSpan * nodeH + (rowSpan - 1) * gapY,
    };
    rects[n.id] = {
      x: n.pos?.[0] ?? grid.x,
      y: n.pos?.[1] ?? grid.y,
      w: n.size?.[0] ?? grid.w,
      h: n.size?.[1] ?? grid.h,
    };
  }
  return rects;
}
