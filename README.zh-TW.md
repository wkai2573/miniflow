# miniflow

[English](README.md) | **繁體中文**

輕量、好嵌入的簡易流程圖。用 JSON 描述節點在第幾列第幾欄、誰連到誰，輸出一段 SVG，或直接放一個 `<flow-diagram>` 標籤。

設計概念參考 [archify](https://github.com/tt-a1i/archify)，但是全新實作，沒有共用任何程式碼。只保留最常用的部分：格狀版面、自動連線、外框、圖例，不含檢視器、縮放、匯出。

## 快速開始

### 純函式

輸入規格，輸出 SVG 字串。可用於任何框架、後端或靜態頁。

```ts
import { render } from 'miniflow';

const svg = render({
  title: '電商訂單與履約流程',
  nodes: [
    { id: 'cart', kind: 'frontend', label: '購物車', sub: 'Web / App', row: 0, col: 0, href: '/cart' },
    { id: 'checkout', kind: 'frontend', label: '結帳收銀台', row: 0, col: 1, href: '/checkout' },
    { id: 'stock', kind: 'backend', icon: 'decision', label: '檢查庫存', row: 0, col: 2 },
    { id: 'stripe', kind: 'external', label: '綠界 / Stripe', row: 0, col: 3 },
    { id: 'db', kind: 'database', label: '訂單庫存庫', row: 0, col: 4 },
  ],
  edges: [
    { from: 'cart', to: 'checkout' },
    { from: 'checkout', to: 'stock', label: '送出訂單', tone: 'emphasis' },
    { from: 'stock', to: 'stripe', label: '充足扣款', tone: 'emphasis' },
    { from: 'stripe', to: 'db', label: '付款完成 Webhook', tone: 'emphasis' },
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

也可以把規格寫在屬性裡：`<flow-diagram spec='{"nodes":[...]}'>`。模組方式使用時：

```ts
import { defineFlowDiagram } from 'miniflow/element';
defineFlowDiagram();
```

點擊有 `href` 的節點時，元件會先送出可取消的 `node-click` 事件，事件的 `detail` 帶有節點的 `id` 與 `href`。寄主專案用自己的路由器處理導覽時，在事件裡呼叫 `preventDefault()` 即可，不會整頁跳轉。

規格有錯誤時，元件在原位顯示錯誤訊息，不會讓頁面壞掉。

## 規格

### 節點 `nodes`

| 欄位 | 說明 |
| --- | --- |
| `id` | 必填，不可重複 |
| `kind` | 必填，`frontend`、`backend`、`database`、`external` 其中之一，決定顏色 |
| `label` | 必填，主標籤 |
| `sub` | 副標 |
| `row`、`col` | 必填，格位，從 0 開始。列由上往下，欄由左往右 |
| `rowSpan`、`colSpan` | 跨列、跨欄，預設 1 |
| `icon` | 左上角圖示，預設依 `kind` 決定。可用 `decision` 或 `none` |
| `href` | 點擊後前往的網址。`javascript:`、`data:`、`vbscript:` 開頭的網址不會輸出 |
| `title` | 滑過時的提示文字 |
| `pos`、`size` | 手動座標與大小，優先於格位 |

### 連線 `edges`

| 欄位 | 說明 |
| --- | --- |
| `from`、`to` | 必填，節點 id |
| `label` | 連線上的標籤 |
| `tone` | `default`、`emphasis`、`dashed` |
| `fromSide`、`toSide` | 手動指定出入的邊：`left`、`right`、`top`、`bottom`。兩個要一起指定，且不可相同 |

自動路由規則：

1. 兩個節點上下相疊時，畫垂直直線。
2. 左右相鄰且高度有重疊時，畫水平直線，高度取來源中心，目標比來源高時仍水平接入。
3. 其他情況，水平離開來源，轉一個彎，垂直進入目標。

### 外框 `frames`

`{ label, wraps: ['id', ...] }`，自動畫出包住這些節點的外框，標籤放在左上角。

### 圖例 `legend`

`true` 或 `{ title, labels, counts }`。只列出實際用到的類型。預設標籤為英文，用 `labels` 改名，`counts: false` 關閉節點數量。

### 版面 `layout`

`{ nodeW, nodeH, gapX, gapY, framePad }`，節點大小與間距預設為 150、60、60、90；外框留白 `framePad` 預設為 `{ left: 20, right: 20, top: 36, bottom: 20 }`（相鄰外框之間自動保留 20px 空隙，避免相黏）。

## 換主題

顏色全部走 CSS 變數並附預設值。在外層設定變數就能配合寄主專案，Web Component 的陰影邊界不會擋住變數。

| 變數 | 用途 |
| --- | --- |
| `--mf-font` | 字型 |
| `--mf-text`、`--mf-muted` | 主要與次要文字 |
| `--mf-surface` | 節點底色與標籤底色，用來遮住底下的連線 |
| `--mf-frontend`、`--mf-backend`、`--mf-database`、`--mf-external` | 各類型的框線與圖示顏色 |
| `--mf-frontend-fill` 等同名加 `-fill` | 各類型的填色 |
| `--mf-arrow`、`--mf-arrow-emphasis`、`--mf-arrow-dashed` | 三種連線顏色 |
| `--mf-pill-border` | 連線標籤的框線 |
| `--mf-frame-fill`、`--mf-frame-stroke` | 外框的填色與框線 |
| `--mf-frame-label-bg`、`--mf-frame-label-border`、`--mf-frame-text` | 外框標籤 |
| `--mf-badge-border` | 圖例數量徽章的框線 |

背景預設透明，直接沿用寄主頁面的底色。

## 限制

- 自動路由只處理直線與單一轉角，不會閃避中間的其他節點。連線會穿過節點時，改用 `fromSide` 與 `toSide` 指定，或調整格位。
- 外框是矩形，不處理外框之間互相重疊。
- 標籤膠囊的寬度用字元類別估算，換成差異很大的字型時可能略寬或略窄。
- 沒有縮放、拖曳、匯出，也沒有深色主題的內建色票，需要時自行覆蓋變數。

## 開發

```sh
bun install
bun test            # 單元測試
bun run typecheck   # 型別檢查
bun run build       # 輸出 dist
bun run example     # 在 examples/out 產生範例頁
```

完整的旗艦範例規格請參閱 `examples/` 目錄：
- `examples/ecommerce.ts`：電商訂單與金流履約流程
- `examples/cicd.ts`：CI/CD 自動化建置與部署流水線
- `examples/rag.ts`：AI / RAG 檢索增強問答管線

### 重新產生社群預覽縮圖

`examples/thumb.webp`（英文）與 `examples/thumb.zh-TW.webp`（繁體中文）是 800x500 的 `og:image` 檔案。它們是手動一次性產生，不屬於建置腳本，範例改版時要重做。需要 Microsoft Edge、ImageMagick 與 `cwebp`。

```sh
bun run example   # 先建置頁面
# 1. 以 1400x700 對 RAG 頁面截圖（中文版請改用 zh-TW/rag.html）
msedge --headless=new --hide-scrollbars --window-size=1400,700 \
  --screenshot=rag-full.png file:///<repo>/examples/out/zh-TW/rag.html
# 2. 裁切流程圖卡片、縮放到寬度 800、在白底上補成 800x500，再轉成 webp
magick rag-full.png -crop 1272x369+66+197 +repage -resize 800x \
  -background white -gravity center -extent 800x500 rag-thumb.png
cwebp -q 80 rag-thumb.png -o examples/thumb.zh-TW.webp   # 英文版：examples/thumb.webp
```

頁面版面若有變動，請調整裁切位移，確保整張流程圖與圖例都在畫面內，且沒有標籤被裁切或互相重疊。

## 授權

MIT
