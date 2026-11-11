import { describe, expect, test } from 'bun:test';
import { routeEdge, toPath } from '../src/route';

const box = (x: number, y: number, w = 150, h = 60) => ({ x, y, w, h });

describe('routeEdge', () => {
  test('上下相疊的節點用一條垂直直線，從上方節點下緣接到下方節點上緣', () => {
    expect(routeEdge(box(450, 60), box(450, 210))).toEqual([
      [525, 120],
      [525, 210],
    ]);
  });

  test('左右相鄰且目標比來源高時，用水平直線，高度取來源中心', () => {
    expect(routeEdge(box(250, 510, 130, 60), box(900, 360, 130, 510))).toEqual([
      [380, 540],
      [900, 540],
    ]);
  });

  test('兩軸都沒有重疊時，水平離開來源、轉一個彎、垂直進入目標上緣', () => {
    expect(routeEdge(box(460, 360, 130, 60), box(250, 510, 130, 60))).toEqual([
      [460, 390],
      [315, 390],
      [315, 510],
    ]);
  });
});

describe('routeEdge 手動指定出入邊', () => {
  test('從下緣出、從左緣進，轉一個彎', () => {
    expect(routeEdge(box(0, 0), box(300, 200), { fromSide: 'bottom', toSide: 'left' })).toEqual([
      [75, 60],
      [75, 230],
      [300, 230],
    ]);
  });

  test('右出左進但高度不同時，在兩者中間折兩個彎', () => {
    expect(routeEdge(box(0, 0), box(300, 200), { fromSide: 'right', toSide: 'left' })).toEqual([
      [150, 30],
      [225, 30],
      [225, 230],
      [300, 230],
    ]);
  });

  test('出入邊相同時拋出清楚的錯誤，不畫出穿過節點的線', () => {
    expect(() => routeEdge(box(0, 0), box(300, 200), { fromSide: 'right', toSide: 'right' })).toThrow('fromSide 與 toSide 不可相同');
  });

  test('下出上進但水平位置不同時，在兩者中間折兩個彎', () => {
    expect(routeEdge(box(0, 0), box(300, 200), { fromSide: 'bottom', toSide: 'top' })).toEqual([
      [75, 60],
      [75, 130],
      [375, 130],
      [375, 200],
    ]);
  });
});

describe('routeEdge 與 toPath 的退化情況', () => {
  test('轉角剛好落在終點上時，不會產生 NaN 路徑', () => {
    const points = routeEdge(box(0, 0), box(75, 200), { fromSide: 'bottom', toSide: 'left' });
    expect(toPath(points)).toBe('M 75 60 L 75 230');
  });

  test('只指定一邊時拋出錯誤，不默默改走自動路由', () => {
    expect(() => routeEdge(box(0, 0), box(300, 0), { fromSide: 'bottom' })).toThrow('fromSide 與 toSide 要一起指定');
    expect(() => routeEdge(box(0, 0), box(300, 0), { toSide: 'left' })).toThrow('fromSide 與 toSide 要一起指定');
  });
});

describe('toPath', () => {
  test('直線只有起點與終點', () => {
    expect(toPath([[170, 90], [460, 90]])).toBe('M 170 90 L 460 90');
  });

  test('轉角以二次曲線做圓角，半徑 8', () => {
    expect(toPath([[460, 390], [315, 390], [315, 510]])).toBe('M 460 390 L 323 390 Q 315 390 315 398 L 315 510');
  });

  test('線段太短時，圓角半徑縮小到線段的一半', () => {
    expect(toPath([[0, 0], [10, 0], [10, 100]])).toBe('M 0 0 L 5 0 Q 10 0 10 5 L 10 100');
  });
});
