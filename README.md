# miniflow

**English** | [繁體中文](README.zh-TW.md)

A lightweight, easy-to-embed flowchart library. Describe in JSON which grid row and column each node sits in and what connects to what, and get back an SVG, or drop in a single `<flow-diagram>` tag.

The design is inspired by [archify](https://github.com/tt-a1i/archify), but it is a fresh implementation that shares no code. It keeps only the most commonly used parts: grid layout, automatic edge routing, frames and a legend. There is no viewer, zoom or export.

## Quick start

### Pure function

Pass in a spec, get back an SVG string. Works with any framework, on a backend, or in a static page.

```ts
import { render } from 'miniflow';

const svg = render({
  title: 'E-commerce Order and Fulfillment',
  nodes: [
    { id: 'cart', kind: 'frontend', label: 'Shopping cart', sub: 'Web / App', row: 0, col: 0, href: '/cart' },
    { id: 'checkout', kind: 'frontend', label: 'Checkout', row: 0, col: 1, href: '/checkout' },
    { id: 'stock', kind: 'backend', icon: 'decision', label: 'Check stock', row: 0, col: 2 },
    { id: 'stripe', kind: 'external', label: 'ECPay / Stripe', row: 0, col: 3 },
    { id: 'db', kind: 'database', label: 'Order & inventory DB', row: 0, col: 4 },
  ],
  edges: [
    { from: 'cart', to: 'checkout' },
    { from: 'checkout', to: 'stock', label: 'Submit order', tone: 'emphasis' },
    { from: 'stock', to: 'stripe', label: 'Charge if in stock', tone: 'emphasis' },
    { from: 'stripe', to: 'db', label: 'Payment completed Webhook', tone: 'emphasis' },
  ],
});
```

### Web Component

```html
<script src="miniflow.js"></script>
<flow-diagram id="flow"></flow-diagram>
<script>
  document.getElementById('flow').spec = { nodes: [/* same as above */] };
</script>
```

You can also put the spec in an attribute: `<flow-diagram spec='{"nodes":[...]}'>`. When using it as a module:

```ts
import { defineFlowDiagram } from 'miniflow/element';
defineFlowDiagram();
```

When a node that has an `href` is clicked, the component first dispatches a cancelable `node-click` event whose `detail` carries the node's `id` and `href`. If the host project handles navigation with its own router, call `preventDefault()` in the event handler and the page will not navigate away.

When the spec has errors, the component shows the error message in place instead of breaking the page.

## Spec

### Nodes `nodes`

| Field | Description |
| --- | --- |
| `id` | Required, must be unique |
| `kind` | Required, the node kind: one of `frontend`, `backend`, `database`, `external`. Determines the color |
| `label` | Required, the main label |
| `sub` | Subtitle |
| `row`, `col` | Required, the grid cell, starting from 0. Rows go top to bottom, columns go left to right |
| `rowSpan`, `colSpan` | Number of rows or columns to span, default 1 |
| `icon` | Icon in the top-left corner, defaults to one chosen by `kind`. Can be `decision` or `none` |
| `href` | URL to go to when clicked. URLs starting with `javascript:`, `data:` or `vbscript:` are not output |
| `title` | Tooltip text shown on hover |
| `pos`, `size` | Manual position and size, which take precedence over the grid cell |

### Edges `edges`

| Field | Description |
| --- | --- |
| `from`, `to` | Required, node ids |
| `label` | Label on the edge |
| `tone` | The edge tone: `default`, `emphasis`, `dashed` |
| `fromSide`, `toSide` | Manually choose the sides to leave and enter: `left`, `right`, `top`, `bottom`. Specify both together, and they must differ |

Automatic routing rules:

1. When two nodes are stacked vertically, draw a straight vertical line.
2. When they are horizontally adjacent and overlap in height, draw a straight horizontal line at the height of the source's center. If the target is higher than the source, it is still entered horizontally.
3. Otherwise, leave the source horizontally, make one turn, and enter the target vertically.

### Frames `frames`

`{ label, wraps: ['id', ...] }`. Automatically draws a frame around those nodes, with the label in the top-left corner.

### Legend `legend`

`true` or `{ title, labels, counts }`. Only the kinds actually in use are listed. The default labels are in English; use `labels` to rename them, and `counts: false` to turn off the node counts.

### Layout `layout`

`{ nodeW, nodeH, gapX, gapY, framePad }`. Node size and gaps default to 150, 60, 60 and 90. The frame padding `framePad` defaults to `{ left: 20, right: 20, top: 36, bottom: 20 }` (a 20px gap is automatically kept between adjacent frames so they do not touch).

## Theming

All colors go through CSS variables with default values. Set the variables on an outer element to match the host project; the shadow boundary of the Web Component does not block them.

| Variable | Purpose |
| --- | --- |
| `--mf-font` | Font |
| `--mf-text`, `--mf-muted` | Primary and secondary text |
| `--mf-surface` | Fill of nodes and label pills, used to hide the edges underneath |
| `--mf-frontend`, `--mf-backend`, `--mf-database`, `--mf-external` | Border and icon color of each node kind |
| `--mf-frontend-fill` etc., the same names with `-fill` | Fill color of each node kind |
| `--mf-arrow`, `--mf-arrow-emphasis`, `--mf-arrow-dashed` | Colors of the three edge tones |
| `--mf-pill-border` | Border of the edge label pill |
| `--mf-frame-fill`, `--mf-frame-stroke` | Fill and border of frames |
| `--mf-frame-label-bg`, `--mf-frame-label-border`, `--mf-frame-text` | Frame labels |
| `--mf-badge-border` | Border of the legend count badge |

The background is transparent by default and simply takes on the host page's background.

## Limitations

- Automatic routing only handles straight lines and a single corner, and does not route around other nodes in between. When an edge would pass through a node, set `fromSide` and `toSide` instead, or adjust the grid cells.
- Frames are rectangles, and overlapping between frames is not handled.
- The width of a label pill is estimated from character classes, so with a very different font it may come out slightly too wide or too narrow.
- There is no zoom, drag or export, and no built-in dark theme palette; override the variables yourself when you need one.

## Development

```sh
bun install
bun test            # unit tests
bun run typecheck   # type check
bun run build       # output dist
bun run example     # generate the example pages in examples/out
```

See the `examples/` directory for the complete flagship example specs:
- `examples/ecommerce.ts`: e-commerce order and payment fulfillment flow
- `examples/cicd.ts`: CI/CD automated build and deployment pipeline
- `examples/rag.ts`: AI / RAG retrieval-augmented question answering pipeline

### Regenerating the social preview thumbnails

`examples/thumb.webp` (English) and `examples/thumb.zh-TW.webp` (Traditional Chinese) are the 800x500 `og:image` files. They are produced once by hand and are not part of the build script. Redo them when an example changes. Requires Microsoft Edge, ImageMagick and `cwebp`.

```sh
bun run example   # build the pages first
# 1. Screenshot the RAG page at 1400x700 (use zh-TW/rag.html for the Chinese one)
msedge --headless=new --hide-scrollbars --window-size=1400,700 \
  --screenshot=rag-full.png file:///<repo>/examples/out/rag.html
# 2. Crop the diagram card, scale to width 800, pad to 800x500 on white, encode as webp
magick rag-full.png -crop 1272x369+66+197 +repage -resize 800x \
  -background white -gravity center -extent 800x500 rag-thumb.png
cwebp -q 80 rag-thumb.png -o examples/thumb.webp   # zh-TW: examples/thumb.zh-TW.webp
```

If the page layout changes, adjust the crop offsets so the whole diagram and legend stay inside the frame, and check that no label is clipped or overlapping.

## License

MIT
