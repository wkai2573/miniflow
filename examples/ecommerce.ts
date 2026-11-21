import type { FlowSpec } from '../src';
import type { Lang } from './shell-strings';

// 範例的做法：結構（節點、格位、連線、外框、版面）只寫在 createEcommerce 裡，
// 所有使用者可見文字從 EcommerceText 字典取得。字典是 Record<Lang, EcommerceText>，
// 任何語言缺鍵或多鍵都會在型別檢查失敗。
type NodeId =
  | 'cart'
  | 'checkout'
  | 'check_stock'
  | 'restock_alert'
  | 'pay_service'
  | 'stripe'
  | 'order_db'
  | 'logistics'
  | 'cust_notify';

/** 有連結的節點才有提示文字 */
type LinkedNodeId = 'cart' | 'checkout' | 'restock_alert' | 'stripe' | 'order_db' | 'logistics';

interface EcommerceText {
  title: string;
  legend: { title: string; frontend: string; backend: string; database: string; external: string };
  nodes: Record<NodeId, { label: string; sub: string }>;
  /** 節點的連結提示文字 */
  tips: Record<LinkedNodeId, string>;
  edges: {
    submitOrder: string;
    stockOk: string;
    stockLow: string;
    charge: string;
    paid: string;
    createWaybill: string;
    updateStatus: string;
    returnWaybill: string;
  };
  frames: { checkout: string; fulfillment: string; shipping: string };
}

const text: Record<Lang, EcommerceText> = {
  en: {
    title: 'E-commerce Order and Fulfillment',
    legend: {
      title: 'Component types',
      frontend: 'Client interface',
      backend: 'Core service',
      database: 'Data store',
      external: 'External / third-party service',
    },
    nodes: {
      cart: { label: 'Shopping cart', sub: 'Web / App' },
      checkout: { label: 'Checkout', sub: 'Enter shipping details' },
      check_stock: { label: 'Check stock', sub: 'Reserve inventory' },
      restock_alert: { label: 'Low-stock alert', sub: 'Send restock notice' },
      pay_service: { label: 'Create payment', sub: 'Compute discounts and shipping' },
      stripe: { label: 'ECPay / Stripe', sub: 'Credit card / mobile pay' },
      order_db: { label: 'Order & inventory DB', sub: 'PostgreSQL' },
      logistics: { label: 'Logistics system', sub: 'Black Cat Express' },
      cust_notify: { label: 'Shipping & notification', sub: 'LINE / Email notice' },
    },
    tips: {
      cart: 'Go to cart',
      checkout: 'Go to checkout',
      restock_alert: 'View restock list',
      stripe: 'Third-party payment gateway',
      order_db: 'Admin: order database',
      logistics: 'Track waybill number',
    },
    edges: {
      submitOrder: 'Submit order',
      stockOk: 'In stock',
      stockLow: 'Low stock',
      charge: 'Initiate charge',
      paid: 'Payment completed Webhook',
      createWaybill: 'Create waybill',
      updateStatus: 'Update status',
      returnWaybill: 'Return tracking number',
    },
    frames: {
      checkout: '01 Checkout',
      fulfillment: '02 Fulfillment and payment core',
      shipping: '03 Shipping and tracking',
    },
  },
  'zh-Hant': {
    title: '電商訂單與履約流程',
    legend: {
      title: '元件類型',
      frontend: '客戶端介面',
      backend: '核心服務',
      database: '資料存儲',
      external: '外部服務 / 第三方',
    },
    nodes: {
      cart: { label: '購物車', sub: 'Web / App' },
      checkout: { label: '結帳收銀台', sub: '填寫收件資訊' },
      check_stock: { label: '檢查庫存', sub: '即時鎖庫' },
      restock_alert: { label: '庫存不足通知', sub: '發送補貨通知' },
      pay_service: { label: '建立支付單', sub: '計算折扣與運費' },
      stripe: { label: '綠界 / Stripe', sub: '信用卡 / 行動支付' },
      order_db: { label: '訂單庫存庫', sub: 'PostgreSQL' },
      logistics: { label: '物流託運系統', sub: '黑貓宅急便' },
      cust_notify: { label: '出貨與通知服務', sub: 'LINE / Email 通知' },
    },
    tips: {
      cart: '前往購物車',
      checkout: '前往結帳',
      restock_alert: '檢視補貨清單',
      stripe: '第三方金流閘道',
      order_db: '管理後台：訂單資料庫',
      logistics: '追蹤託運單號',
    },
    edges: {
      submitOrder: '送出訂單',
      stockOk: '庫存充足',
      stockLow: '庫存不足',
      charge: '發起扣款',
      paid: '付款完成 Webhook',
      createWaybill: '產生託運單',
      updateStatus: '更新狀態',
      returnWaybill: '回傳單號',
    },
    frames: {
      checkout: '01 結帳階段',
      fulfillment: '02 履約與金流核心',
      shipping: '03 出貨與追蹤',
    },
  },
};

/** 電商訂單與履約流程 */
export function createEcommerce(lang: Lang): FlowSpec {
  const t = text[lang];
  return {
    title: t.title,
    legend: {
      title: t.legend.title,
      labels: {
        frontend: t.legend.frontend,
        backend: t.legend.backend,
        database: t.legend.database,
        external: t.legend.external,
      },
      counts: true,
    },
    nodes: [
      {
        id: 'cart',
        kind: 'frontend',
        ...t.nodes.cart,
        row: 0,
        col: 0,
        href: '#cart',
        title: t.tips.cart,
      },
      {
        id: 'checkout',
        kind: 'frontend',
        ...t.nodes.checkout,
        row: 0,
        col: 1,
        href: '#checkout',
        title: t.tips.checkout,
      },
      { id: 'check_stock', kind: 'backend', icon: 'decision', ...t.nodes.check_stock, row: 0, col: 2 },
      {
        id: 'restock_alert',
        kind: 'backend',
        ...t.nodes.restock_alert,
        row: 1,
        col: 2,
        href: '#restock_alert',
        title: t.tips.restock_alert,
      },
      { id: 'pay_service', kind: 'backend', ...t.nodes.pay_service, row: 0, col: 3 },
      {
        id: 'stripe',
        kind: 'external',
        ...t.nodes.stripe,
        row: 0,
        col: 4,
        href: '#stripe',
        title: t.tips.stripe,
      },
      {
        id: 'order_db',
        kind: 'database',
        ...t.nodes.order_db,
        row: 0,
        col: 5,
        rowSpan: 2,
        href: '#order_db',
        title: t.tips.order_db,
      },
      {
        id: 'logistics',
        kind: 'external',
        ...t.nodes.logistics,
        row: 0,
        col: 6,
        href: '#logistics',
        title: t.tips.logistics,
      },
      { id: 'cust_notify', kind: 'backend', ...t.nodes.cust_notify, row: 1, col: 6 },
    ],
    edges: [
      { from: 'cart', to: 'checkout' },
      { from: 'checkout', to: 'check_stock', label: t.edges.submitOrder, tone: 'emphasis' },
      { from: 'check_stock', to: 'pay_service', label: t.edges.stockOk, tone: 'emphasis' },
      { from: 'check_stock', to: 'restock_alert', label: t.edges.stockLow, tone: 'dashed' },
      { from: 'pay_service', to: 'stripe', label: t.edges.charge, tone: 'emphasis' },
      { from: 'stripe', to: 'order_db', label: t.edges.paid, tone: 'emphasis' },
      { from: 'order_db', to: 'logistics', label: t.edges.createWaybill, tone: 'emphasis' },
      { from: 'order_db', to: 'cust_notify', label: t.edges.updateStatus },
      { from: 'logistics', to: 'cust_notify', label: t.edges.returnWaybill },
    ],
    frames: [
      { label: t.frames.checkout, wraps: ['cart', 'checkout'] },
      {
        label: t.frames.fulfillment,
        wraps: ['check_stock', 'restock_alert', 'pay_service', 'stripe', 'order_db'],
      },
      { label: t.frames.shipping, wraps: ['logistics', 'cust_notify'] },
    ],
  };
}
