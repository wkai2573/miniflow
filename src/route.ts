import type { Rect, Side } from './types';

export type Point = [number, number];

/** 直線接在節點邊上時，離角落至少保留的距離 */
const INSET = 12;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** 兩段區間在縮進後的交集，沒有交集回傳 null */
function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): [number, number] | null {
  const lo = Math.max(aStart, bStart) + INSET;
  const hi = Math.min(aEnd, bEnd) - INSET;
  return lo <= hi ? [lo, hi] : null;
}

const num = (n: number) => String(Math.round(n * 100) / 100);

/** 去掉連續相同的點。沒有長度的線段會在圓角計算時除以 0，也會讓標籤找錯最後一段 */
const dedupe = (points: Point[]): Point[] =>
  points.filter((p, i) => i === 0 || p[0] !== (points[i - 1] as Point)[0] || p[1] !== (points[i - 1] as Point)[1]);
const dist = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** 把折點連成 SVG 路徑，轉角用二次曲線做圓角 */
export function toPath(input: Point[], radius = 8): string {
  const points = dedupe(input);
  const first = points[0];
  if (!first) return '';
  let d = `M ${num(first[0])} ${num(first[1])}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1] as Point;
    const cur = points[i] as Point;
    const next = points[i + 1];
    if (!next) {
      d += ` L ${num(cur[0])} ${num(cur[1])}`;
      continue;
    }
    const r = Math.min(radius, dist(prev, cur) / 2, dist(cur, next) / 2);
    const inLen = dist(prev, cur);
    const outLen = dist(cur, next);
    const start: Point = [cur[0] - ((cur[0] - prev[0]) / inLen) * r, cur[1] - ((cur[1] - prev[1]) / inLen) * r];
    const end: Point = [cur[0] + ((next[0] - cur[0]) / outLen) * r, cur[1] + ((next[1] - cur[1]) / outLen) * r];
    d += ` L ${num(start[0])} ${num(start[1])} Q ${num(cur[0])} ${num(cur[1])} ${num(end[0])} ${num(end[1])}`;
  }
  return d;
}

export interface RouteOptions {
  fromSide?: Side;
  toSide?: Side;
}

const isHorizontal = (side: Side) => side === 'left' || side === 'right';

/** 節點某一邊的中點 */
function anchor(rect: Rect, side: Side): Point {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  if (side === 'left') return [rect.x, cy];
  if (side === 'right') return [rect.x + rect.w, cy];
  if (side === 'top') return [cx, rect.y];
  return [cx, rect.y + rect.h];
}

/** 兩端的邊都已指定時的折點 */
function routeBySides(from: Rect, to: Rect, fromSide: Side, toSide: Side): Point[] {
  const start = anchor(from, fromSide);
  const end = anchor(to, toSide);
  const fromH = isHorizontal(fromSide);
  const toH = isHorizontal(toSide);
  if (fromH && !toH) return [start, [end[0], start[1]], end];
  if (!fromH && toH) return [start, [start[0], end[1]], end];
  if (fromSide === toSide) throw new Error('fromSide 與 toSide 不可相同');
  if (fromH) {
    if (start[1] === end[1]) return [start, end];
    const mx = (start[0] + end[0]) / 2;
    return [start, [mx, start[1]], [mx, end[1]], end];
  }
  if (start[0] === end[0]) return [start, end];
  const my = (start[1] + end[1]) / 2;
  return [start, [start[0], my], [end[0], my], end];
}

/** 兩個節點之間的連線折點。指定 fromSide 與 toSide 時依指定的邊走，否則自動判斷 */
export function routeEdge(from: Rect, to: Rect, options: RouteOptions = {}): Point[] {
  if (Boolean(options.fromSide) !== Boolean(options.toSide)) throw new Error('fromSide 與 toSide 要一起指定');
  if (options.fromSide && options.toSide) return dedupe(routeBySides(from, to, options.fromSide, options.toSide));
  return routeAuto(from, to);
}

/** 沒有指定邊時，依兩個節點的相對位置自動判斷 */
function routeAuto(from: Rect, to: Rect): Point[] {
  const fromCx = from.x + from.w / 2;
  const fromCy = from.y + from.h / 2;

  const xRange = overlap(from.x, from.x + from.w, to.x, to.x + to.w);
  if (xRange) {
    const x = clamp(fromCx, ...xRange);
    return from.y < to.y
      ? [[x, from.y + from.h], [x, to.y]]
      : [[x, from.y], [x, to.y + to.h]];
  }

  const yRange = overlap(from.y, from.y + from.h, to.y, to.y + to.h);
  if (yRange) {
    const y = clamp(fromCy, ...yRange);
    return from.x < to.x
      ? [[from.x + from.w, y], [to.x, y]]
      : [[from.x, y], [to.x + to.w, y]];
  }

  // 兩軸都沒有重疊：水平離開來源，轉一個彎，垂直進入目標
  const toCx = to.x + to.w / 2;
  const startX = from.x < to.x ? from.x + from.w : from.x;
  const endY = from.y < to.y ? to.y : to.y + to.h;
  return [[startX, fromCy], [toCx, fromCy], [toCx, endY]];
}
