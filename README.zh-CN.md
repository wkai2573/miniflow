# miniflow

[English](README.md) | [繁體中文](README.zh-TW.md) | **简体中文**

轻量、易嵌入的简易流程图。用 JSON 描述节点在第几行第几列、谁连到谁，输出一段 SVG，或者直接放一个 `<flow-diagram>` 标签。

设计思路参考 [archify](https://github.com/tt-a1i/archify)，但是全新实现，没有共用任何代码。只保留最常用的部分：网格布局、自动连线、外框、图例，不含查看器、缩放、导出。

## 快速开始

### 纯函数

输入规格，输出 SVG 字符串。可用于任何框架、后端或静态页。

```ts
import { render } from 'miniflow';

const svg = render({
  title: '电商订单与履约流程',
  nodes: [
    { id: 'cart', kind: 'frontend', label: '购物车', sub: 'Web / App', row: 0, col: 0, href: '/cart' },
    { id: 'checkout', kind: 'frontend', label: '结算收银台', row: 0, col: 1, href: '/checkout' },
    { id: 'stock', kind: 'backend', icon: 'decision', label: '检查库存', row: 0, col: 2 },
    { id: 'stripe', kind: 'external', label: '支付宝 / Stripe', row: 0, col: 3 },
    { id: 'db', kind: 'database', label: '订单库存库', row: 0, col: 4 },
  ],
  edges: [
    { from: 'cart', to: 'checkout' },
    { from: 'checkout', to: 'stock', label: '提交订单', tone: 'emphasis' },
    { from: 'stock', to: 'stripe', label: '充足扣款', tone: 'emphasis' },
    { from: 'stripe', to: 'db', label: '支付完成 Webhook', tone: 'emphasis' },
  ],
});
```

### Web Component

```html
<script src="miniflow.js"></script>
<flow-diagram id="flow"></flow-diagram>
<script>
  document.getElementById('flow').spec = { nodes: [/* 同上 */] };
</script>
```

也可以把规格写在属性里：`<flow-diagram spec='{"nodes":[...]}'>`。以模块方式使用时：

```ts
import { defineFlowDiagram } from 'miniflow/element';
defineFlowDiagram();
```

点击带有 `href` 的节点时，组件会先派发可取消的 `node-click` 事件，事件的 `detail` 带有节点的 `id` 与 `href`。宿主项目用自己的路由处理导航时，在事件里调用 `preventDefault()` 即可，不会整页跳转。

规格有错误时，组件在原位显示错误信息，不会让页面崩溃。

## 规格

### 节点 `nodes`

| 字段 | 说明 |
| --- | --- |
| `id` | 必填，不可重复 |
| `kind` | 必填，节点类型，`frontend`、`backend`、`database`、`external` 之一，决定颜色 |
| `label` | 必填，主标签 |
| `sub` | 副标题 |
| `row`、`col` | 必填，网格单元，从 0 开始。行由上往下，列由左往右 |
| `rowSpan`、`colSpan` | 跨行、跨列，默认 1 |
| `icon` | 左上角图标，默认按 `kind` 决定。可用 `decision` 或 `none` |
| `href` | 点击后前往的网址。以 `javascript:`、`data:`、`vbscript:` 开头的网址不会输出 |
| `title` | 鼠标悬停时的提示文字 |
| `pos`、`size` | 手动指定坐标与大小，优先于网格单元 |

### 连线 `edges`

| 字段 | 说明 |
| --- | --- |
| `from`、`to` | 必填，节点 id |
| `label` | 连线上的标签 |
| `tone` | 连线基调：`default`、`emphasis`、`dashed` |
| `fromSide`、`toSide` | 手动指定出入的边：`left`、`right`、`top`、`bottom`。两个要一起指定，且不可相同 |

自动路由规则：

1. 两个节点上下相叠时，画垂直直线。
2. 左右相邻且高度有重叠时，画水平直线，高度取来源中心，目标比来源高时仍水平接入。
3. 其他情况，水平离开来源，转一个弯，垂直进入目标。

### 外框 `frames`

`{ label, wraps: ['id', ...] }`，自动画出包住这些节点的外框，标签放在左上角。

### 图例 `legend`

`true` 或 `{ title, labels, counts }`。只列出实际用到的类型。默认标签为英文，用 `labels` 改名，`counts: false` 关闭节点数量。

### 布局 `layout`

`{ nodeW, nodeH, gapX, gapY, framePad }`，节点大小与间距默认为 150、60、60、90；外框留白 `framePad` 默认为 `{ left: 20, right: 20, top: 36, bottom: 20 }`（相邻外框之间自动保留 20px 空隙，避免粘在一起）。

## 更换主题

颜色全部走 CSS 变量并附默认值。在外层设置变量就能配合宿主项目，Web Component 的 Shadow 边界不会挡住变量。

| 变量 | 用途 |
| --- | --- |
| `--mf-font` | 字体 |
| `--mf-text`、`--mf-muted` | 主要与次要文字 |
| `--mf-surface` | 节点底色与标签底色，用来遮住底下的连线 |
| `--mf-frontend`、`--mf-backend`、`--mf-database`、`--mf-external` | 各节点类型的边框与图标颜色 |
| `--mf-frontend-fill` 等同名加 `-fill` | 各节点类型的填充色 |
| `--mf-arrow`、`--mf-arrow-emphasis`、`--mf-arrow-dashed` | 三种连线颜色 |
| `--mf-pill-border` | 连线标签的边框 |
| `--mf-frame-fill`、`--mf-frame-stroke` | 外框的填充色与边框 |
| `--mf-frame-label-bg`、`--mf-frame-label-border`、`--mf-frame-text` | 外框标签 |
| `--mf-badge-border` | 图例数量徽章的边框 |

背景默认透明，直接沿用宿主页面的底色。

## 限制

- 自动路由只处理直线与单一转角，不会避让中间的其他节点。连线会穿过节点时，改用 `fromSide` 与 `toSide` 指定，或调整网格单元。
- 外框是矩形，不处理外框之间互相重叠。
- 标签胶囊的宽度用字符类别估算，换成差异很大的字体时可能略宽或略窄。
- 没有缩放、拖拽、导出，也没有内置的深色主题色板，需要时自行覆盖变量。

## 开发

```sh
bun install
bun test            # 单元测试
bun run typecheck   # 类型检查
bun run build       # 输出 dist
bun run example     # 在 examples/out 生成示例页
```

完整的旗舰示例规格请参阅 `examples/` 目录：
- `examples/ecommerce.ts`：电商订单与支付履约流程
- `examples/cicd.ts`：CI/CD 自动化构建与部署流水线
- `examples/rag.ts`：AI / RAG 检索增强问答管线

### 重新生成社交预览缩略图

`examples/thumb.webp` 是唯一一张 800x500 的 `og:image` 文件，所有语言与根页面共用，标签为英文。它是手动一次性生成，不属于构建脚本，示例改版时要重做。需要 Microsoft Edge、ImageMagick 与 `cwebp`。

```sh
bun run example   # 先构建页面
# 1. 以 1400x700 对英文版 RAG 页面截图
msedge --headless=new --hide-scrollbars --window-size=1400,700 \
  --screenshot=rag-full.png file:///<repo>/examples/out/en/rag.html
# 2. 裁剪流程图卡片、缩放到宽度 800、在白底上补成 800x500，再转成 webp
magick rag-full.png -crop 1272x369+66+197 +repage -resize 800x \
  -background white -gravity center -extent 800x500 rag-thumb.png
cwebp -q 80 rag-thumb.png -o examples/thumb.webp
```

页面布局若有变动，请调整裁剪偏移量，确保整张流程图与图例都在画面内，且没有标签被裁掉或互相重叠。

## 许可证

MIT
