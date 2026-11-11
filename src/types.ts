export type Kind = 'frontend' | 'backend' | 'database' | 'external';
export type Icon = Kind | 'decision' | 'none';
export type Tone = 'default' | 'emphasis' | 'dashed';
export type Side = 'left' | 'right' | 'top' | 'bottom';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NodeSpec {
  id: string;
  kind: Kind;
  label: string;
  sub?: string;
  icon?: Icon;
  /** 格位。列由上往下、欄由左往右，從 0 開始 */
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  /** 手動座標與大小，優先於格位 */
  pos?: [number, number];
  size?: [number, number];
  /** 點擊後前往的網址 */
  href?: string;
  title?: string;
}

export interface EdgeSpec {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  fromSide?: Side;
  toSide?: Side;
}

export interface FrameSpec {
  label: string;
  wraps: string[];
}

export interface LegendSpec {
  title?: string;
  labels?: Partial<Record<Kind, string>>;
  counts?: boolean;
}

export interface LayoutOptions {
  nodeW?: number;
  nodeH?: number;
  gapX?: number;
  gapY?: number;
}

export interface FlowSpec {
  title?: string;
  nodes: NodeSpec[];
  edges?: EdgeSpec[];
  frames?: FrameSpec[];
  legend?: boolean | LegendSpec;
  layout?: LayoutOptions;
}
