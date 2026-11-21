// 展示頁外殼的所有使用者可見文字，以語言為鍵。
// ShellStrings 是唯一的鍵定義：任何語言缺鍵或多鍵都會在型別檢查失敗。
// 支援語言的唯一來源：Lang 型別由它推導，所有以 Lang 為鍵的 Record 都會在新增語言時要求補齊。
export const langs = ['en', 'zh-Hant'] as const;

export type Lang = (typeof langs)[number];

export interface FlowStrings {
  /** 頁面與總覽卡片使用的流程標題 */
  title: string;
  /** 頁面副標與總覽卡片說明 */
  desc: string;
}

/** 在瀏覽器內執行的字串，會以 JSON 內嵌進頁面腳本 */
export interface RuntimeStrings {
  toastPrefix: string;
  /** 接在「(節點 id)」之後 */
  toastSuffix: string;
  /** {title} */
  specChange: string;
  /** {id} {href} */
  nodeClick: string;
  logEmpty: string;
  logCleared: string;
}

export interface ShellStrings {
  /** 頁面標題後綴，接在流程標題之後 */
  titleSuffix: string;
  ogIndexTitle: string;
  defaultDesc: string;
  indexTitle: string;
  navIndex: string;
  navEcommerce: string;
  navCicd: string;
  navRag: string;
  navElement: string;
  demoLink: string;
  githubRepo: string;
  openStandalone: string;
  viewSvg: string;
  flows: {
    ecommerce: FlowStrings;
    cicd: FlowStrings;
    rag: FlowStrings;
  };
  demo: {
    title: string;
    ogTitle: string;
    /** 允許含 <flow-diagram> 原樣文字 */
    desc: string;
    controlsLabel: string;
    tabEcommerce: string;
    tabCicd: string;
    tabRag: string;
    logHeader: string;
    clearLog: string;
  };
  runtime: RuntimeStrings;
}

export const shellStrings: Record<Lang, ShellStrings> = {
  en: {
    titleSuffix: ' - miniflow examples',
    ogIndexTitle: 'miniflow flowcharts',
    defaultDesc:
      'A lightweight, embeddable flowchart: describe nodes on a grid, output SVG or a Web Component.',
    indexTitle: 'miniflow Example Gallery',
    navIndex: 'Showcase',
    navEcommerce: '🛒 E-commerce orders',
    navCicd: '🚀 CI/CD pipeline',
    navRag: '🤖 AI / RAG Q&A pipeline',
    navElement: '⚡ Web Component demo',
    demoLink: '⚡ View the interactive Web Component demo',
    githubRepo: 'GitHub repository',
    openStandalone: 'Open standalone page',
    viewSvg: 'View SVG',
    flows: {
      ecommerce: {
        title: 'E-commerce Order and Fulfillment',
        desc: 'Shopping cart, stock decision, third-party payment charge, cross-row order database and shipping notification.',
      },
      cicd: {
        title: 'CI/CD Build and Deploy Pipeline',
        desc: 'Pull request trigger, test decision branch, Docker build, artifact registry, staging and production deployment.',
      },
      rag: {
        title: 'AI / RAG Retrieval Q&A',
        desc: 'Web chat, API gateway, intent routing, vector knowledge base retrieval, LLM inference and streamed output.',
      },
    },
    demo: {
      title: 'miniflow Web Component Interactive Demo',
      ogTitle: 'miniflow Web Component Interactive Demo',
      desc: 'Switch the <flow-diagram> spec on the fly and see how node-click events are intercepted.',
      controlsLabel: 'Switch flow spec:',
      tabEcommerce: '🛒 E-commerce orders',
      tabCicd: '🚀 CI/CD pipeline',
      tabRag: '🤖 AI / RAG Q&A',
      logHeader: 'Event Log (click a node with a link above to test interception)',
      clearLog: 'Clear log',
    },
    runtime: {
      toastPrefix: '📌 Node clicked: ',
      toastSuffix: ' (external navigation is disabled in this demo)',
      specChange: 'Switched to {title}',
      nodeClick:
        'Intercepted click: nodeId="{id}" → href="{href}" (full-page navigation prevented)',
      logEmpty: '(No node-click events yet. Click a node with a link in the diagram.)',
      logCleared: '(Log cleared)',
    },
  },
  'zh-Hant': {
    titleSuffix: ' - miniflow 範例',
    ogIndexTitle: 'miniflow 流程圖',
    defaultDesc: '輕量、好嵌入的簡易流程圖：以格狀描述節點，輸出 SVG 或 Web Component。',
    indexTitle: 'miniflow 範例圖集 Showcase',
    navIndex: '總覽 Showcase',
    navEcommerce: '🛒 電商訂單履約',
    navCicd: '🚀 CI/CD 自動化管線',
    navRag: '🤖 AI / RAG 問答管線',
    navElement: '⚡ Web Component 互動體驗',
    demoLink: '⚡ 查看 Web Component 互動 Demo',
    githubRepo: 'GitHub 倉庫',
    openStandalone: '開啟獨立頁面',
    viewSvg: '檢視 SVG',
    flows: {
      ecommerce: {
        title: '電商訂單與履約流程',
        desc: '展示購物車、庫存決策、第三方金流扣款、跨列訂單資料庫與出貨通知。',
      },
      cicd: {
        title: 'CI/CD 自動化建置與部署流水線',
        desc: '展示 Pull Request 觸發、測試決策分支、Docker 建置、製品庫、預發與正式環境部屬。',
      },
      rag: {
        title: 'AI / RAG 智慧問答與檢索管線',
        desc: '展示 Web Chat 對話、API Gateway、意圖路由、向量知識庫檢索、LLM 推理與串流輸出。',
      },
    },
    demo: {
      title: 'miniflow Web Component 互動展示',
      ogTitle: 'miniflow Web Component 互動 Demo',
      desc: '動態切換 <flow-diagram> 元件規格並示範 node-click 事件攔截機制。',
      controlsLabel: '切換流程規格：',
      tabEcommerce: '🛒 電商訂單履約',
      tabCicd: '🚀 CI/CD 自動化管線',
      tabRag: '🤖 AI / RAG 檢索問答',
      logHeader: 'Event Log (點擊上方含有超連結的節點測試攔截)',
      clearLog: '清空紀錄',
    },
    runtime: {
      toastPrefix: '📌 點擊節點：',
      toastSuffix: '（範例已停用外部跳轉）',
      specChange: '切換為 {title}',
      nodeClick: '攔截點擊事件：nodeId="{id}" → href="{href}" (已防止全頁跳轉)',
      logEmpty: '(尚未觸發任何 node-click 事件，請點擊圖表中帶有連結的節點)',
      logCleared: '(紀錄已清空)',
    },
  },
};
