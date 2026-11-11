import type { FlowSpec } from '../src';

const crm = { href: '/upload/crm', title: '前往：上傳 CRM' };
const erp = { href: '/upload/erp-import', title: '前往：匯入天心 ERP' };
const ack = { href: '/upload/ack', title: '前往：更新預計到貨週（ACK）' };
const arrivalWeek = { href: '/upload/arrival-week', title: '前往：更新實際到貨週' };
const arrival = { href: '/arrival', title: '前往：到貨查詢' };

/** KJ Mediator 的匯入流程，用來驗收 miniflow 的輸出與 kj-mediator 內手繪的版本一致 */
export const mediator: FlowSpec = {
  title: 'Mediator 流程圖',
  legend: { title: '圖例', labels: { frontend: '前端', backend: '後端', database: '資料庫', external: '外部系統' } },
  nodes: [
    { id: 'f1', kind: 'external', label: 'CRM 檔', sub: '.csv', row: 0, col: 0, ...crm },
    { id: 's1', kind: 'frontend', label: '上傳 CRM', row: 0, col: 2, ...crm },
    { id: 's2', kind: 'frontend', label: '選批號', row: 1, col: 2, ...erp },
    { id: 'd', kind: 'backend', icon: 'decision', label: 'E+H 產品？', row: 2, col: 2 },
    { id: 'n', kind: 'backend', label: '直接匯入', row: 2, col: 3 },
    { id: 'f2', kind: 'external', label: 'E+H order export', sub: '.xlsx', row: 3, col: 0, ...erp },
    { id: 'p', kind: 'frontend', label: '配對板', row: 3, col: 1, ...erp },
    { id: 'f3', kind: 'external', label: 'E+H ACK', sub: '.pdf', row: 4, col: 0, ...ack },
    { id: 's3', kind: 'frontend', label: '上傳 ACK', row: 4, col: 2, ...ack },
    { id: 'f4', kind: 'external', label: 'Shipping Invoice', sub: '.pdf', row: 5, col: 0, ...arrivalWeek },
    { id: 's4', kind: 'frontend', label: '上傳 Invoice', row: 5, col: 2, ...arrivalWeek },
    { id: 'erp', kind: 'database', label: '天心 ERP', sub: '受訂單', row: 2, col: 4, rowSpan: 4, ...arrival },
  ],
  edges: [
    { from: 'f1', to: 's1' },
    { from: 's1', to: 's2', label: '批號', tone: 'emphasis' },
    { from: 's2', to: 'd', tone: 'emphasis' },
    { from: 'd', to: 'p', label: '是', tone: 'emphasis' },
    { from: 'd', to: 'n', label: '否', tone: 'dashed' },
    { from: 'f2', to: 'p' },
    { from: 'p', to: 'erp', label: '確認匯入', tone: 'emphasis' },
    { from: 'n', to: 'erp', tone: 'dashed' },
    { from: 'f3', to: 's3' },
    { from: 's3', to: 'erp', label: 'ACK 週', tone: 'emphasis' },
    { from: 'f4', to: 's4' },
    { from: 's4', to: 'erp', label: '到貨週', tone: 'emphasis' },
  ],
  frames: [
    { label: '01 上傳 CRM', wraps: ['f1', 's1'] },
    { label: '02 匯入天心 ERP', wraps: ['s2', 'd', 'n', 'f2', 'p'] },
    { label: '03 E+H ACK', wraps: ['f3', 's3'] },
    { label: '04 Shipping Invoice', wraps: ['f4', 's4'] },
  ],
};
