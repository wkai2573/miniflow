import { describe, expect, test } from 'bun:test';
import { frameRect, layoutNodes } from '../src/layout';
import type { NodeSpec } from '../src/types';

const node = (id: string, row: number, col: number, extra: Partial<NodeSpec> = {}): NodeSpec => ({
  id,
  kind: 'frontend',
  label: id,
  row,
  col,
  ...extra,
});

describe('layoutNodes', () => {
  test('依列與欄排進格位，預設節點 150×60、欄距 60、列距 90', () => {
    const rects = layoutNodes([node('a', 0, 0), node('b', 2, 3)]);
    expect(rects['a']).toEqual({ x: 0, y: 0, w: 150, h: 60 });
    expect(rects['b']).toEqual({ x: 630, y: 300, w: 150, h: 60 });
  });

  test('跨列的節點高度包含中間的列距', () => {
    const rects = layoutNodes([node('erp', 2, 4, { rowSpan: 4 })]);
    expect(rects['erp']).toEqual({ x: 840, y: 300, w: 150, h: 510 });
  });

  test('跨欄的節點寬度包含中間的欄距', () => {
    const rects = layoutNodes([node('wide', 0, 1, { colSpan: 2 })]);
    expect(rects['wide']).toEqual({ x: 210, y: 0, w: 360, h: 60 });
  });

  test('手動座標與大小優先於格位', () => {
    const rects = layoutNodes([node('free', 5, 5, { pos: [100, 50], size: [80, 40] })]);
    expect(rects['free']).toEqual({ x: 100, y: 50, w: 80, h: 40 });
  });

  test('可調整節點大小與間距', () => {
    const rects = layoutNodes([node('a', 1, 1)], { nodeW: 100, nodeH: 40, gapX: 20, gapY: 10 });
    expect(rects['a']).toEqual({ x: 120, y: 50, w: 100, h: 40 });
  });
});

describe('frameRect', () => {
  test('包住一組節點，左右留 20、上方留 36 放標籤、下方留 20', () => {
    const frame = frameRect([
      { x: 40, y: 60, w: 150, h: 60 },
      { x: 450, y: 60, w: 150, h: 60 },
    ]);
    expect(frame).toEqual({ x: 20, y: 24, w: 600, h: 116 });
  });

  test('可自訂外框間距', () => {
    const frame = frameRect([{ x: 40, y: 60, w: 150, h: 60 }], { left: 10, right: 10, top: 20, bottom: 15 });
    expect(frame).toEqual({ x: 30, y: 40, w: 170, h: 95 });
  });

  test('沒有節點時拋出錯誤', () => {
    expect(() => frameRect([])).toThrow('外框至少要包住一個節點');
  });
});
