# 採用語意化 SVG 而非 Canvas 或 WebGL

我們選擇輸出語意化的 SVG 字串與 SVG DOM 元素，而非基於 Canvas 或 WebGL 的即時繪圖畫布。

雖然 Canvas 在繪製極大規模（數萬節點）以及平移縮放視口時效能較高，但 miniflow 的定位是輕量、容易嵌入靜態頁面、文件與後端產物的簡易流程圖。使用 SVG 帶來了零外部執行期相依、可被搜尋引擎檢索與無障礙讀取、文字可反白選取、以及能完全透過外層 CSS 自訂屬性（CSS Custom Properties）自由切換色彩主題的關鍵優勢。
