import type { FlowSpec } from '../src';
import type { Lang } from './shell-strings';

// 做法同 ecommerce.ts：結構只寫在 createRag 裡，可見文字全部來自字典。
type NodeId =
  | 'chat_ui'
  | 'api_gw'
  | 'intent_router'
  | 'embed_svc'
  | 'vector_db'
  | 'llm_core'
  | 'redis_cache'
  | 'stream_client';

/** 有連結的節點才有提示文字 */
type LinkedNodeId = 'chat_ui' | 'vector_db' | 'llm_core' | 'stream_client';

interface RagText {
  title: string;
  legend: { title: string; frontend: string; backend: string; database: string; external: string };
  nodes: Record<NodeId, { label: string; sub: string }>;
  /** 節點的連結提示文字 */
  tips: Record<LinkedNodeId, string>;
  edges: {
    userQuestion: string;
    generalChat: string;
    needDomainKnowledge: string;
    cosineSearch: string;
    topKContext: string;
    writeCache: string;
    sseChunk: string;
    cacheHit: string;
  };
  frames: { intake: string; retrieval: string; inference: string };
}

const text: Record<Lang, RagText> = {
  en: {
    title: 'AI / RAG Question Answering and Retrieval Pipeline',
    legend: {
      title: 'Architecture legend',
      frontend: 'User interaction',
      backend: 'Logic service',
      database: 'Vector and cache store',
      external: 'LLM API',
    },
    nodes: {
      chat_ui: { label: 'Web chat window', sub: 'Next.js / React' },
      api_gw: { label: 'API Gateway', sub: 'JWT auth and rate limiting' },
      intent_router: { label: 'Intent routing', sub: 'Function Calling' },
      embed_svc: { label: 'Vector embedding', sub: 'Text Embeddings' },
      vector_db: { label: 'Knowledge vector DB', sub: 'pgvector / Qdrant' },
      llm_core: { label: 'LLM inference engine', sub: 'Gemini 2.5 Flash' },
      redis_cache: { label: 'Semantic answer cache', sub: 'Redis Cluster' },
      stream_client: { label: 'Streaming response', sub: 'SSE typewriter effect' },
    },
    tips: {
      chat_ui: 'Go to chat interface',
      vector_db: 'View vector index status',
      llm_core: 'Google AI Studio',
      stream_client: 'Stream debug listener',
    },
    edges: {
      userQuestion: 'User question',
      generalChat: 'General chat',
      needDomainKnowledge: 'Needs domain knowledge',
      cosineSearch: 'Cosine similarity search',
      topKContext: 'Top-K reference context',
      writeCache: 'Write to cache',
      sseChunk: 'SSE streaming Chunk',
      cacheHit: 'Cache hit, return directly',
    },
    frames: {
      intake: '01 Request intake and intent analysis',
      retrieval: '02 Vector knowledge base retrieval (RAG)',
      inference: '03 Model inference and streaming output',
    },
  },
  'zh-Hant': {
    title: 'AI / RAG 智慧問答與檢索管線',
    legend: {
      title: '架構圖例',
      frontend: '使用者互動端',
      backend: '邏輯處理服務',
      database: '向量與快取儲存',
      external: '大語言模型 API',
    },
    nodes: {
      chat_ui: { label: 'Web 對話視窗', sub: 'Next.js / React' },
      api_gw: { label: 'API Gateway', sub: 'JWT 驗證與限流' },
      intent_router: { label: '意圖路由分析', sub: 'Function Calling' },
      embed_svc: { label: '向量特徵抽取', sub: 'Text Embeddings' },
      vector_db: { label: '知識庫向量庫', sub: 'pgvector / Qdrant' },
      llm_core: { label: 'LLM 推理引擎', sub: 'Gemini 2.5 Flash' },
      redis_cache: { label: '語意問答快取', sub: 'Redis Cluster' },
      stream_client: { label: '串流回應接收', sub: 'SSE 打字機效果' },
    },
    tips: {
      chat_ui: '前往對話介面',
      vector_db: '檢視向量索引狀態',
      llm_core: 'Google AI Studio',
      stream_client: '串流偵錯監聽',
    },
    edges: {
      userQuestion: '使用者提問',
      generalChat: '通用對話',
      needDomainKnowledge: '需要領域知識',
      cosineSearch: 'Cosine 相似檢索',
      topKContext: 'Top-K 參考上下文',
      writeCache: '寫入快取',
      sseChunk: 'SSE 串流 Chunk',
      cacheHit: '快取命中直接回傳',
    },
    frames: {
      intake: '01 請求接入與意圖分析',
      retrieval: '02 向量知識庫檢索 (RAG)',
      inference: '03 模型推理與串流輸出',
    },
  },
};

/** AI / RAG 智慧問答與檢索管線 */
export function createRag(lang: Lang): FlowSpec {
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
        id: 'chat_ui',
        kind: 'frontend',
        ...t.nodes.chat_ui,
        row: 0,
        col: 0,
        href: '#chat_ui',
        title: t.tips.chat_ui,
      },
      { id: 'api_gw', kind: 'backend', ...t.nodes.api_gw, row: 0, col: 1 },
      { id: 'intent_router', kind: 'backend', icon: 'decision', ...t.nodes.intent_router, row: 0, col: 2 },
      { id: 'embed_svc', kind: 'backend', ...t.nodes.embed_svc, row: 1, col: 2 },
      {
        id: 'vector_db',
        kind: 'database',
        ...t.nodes.vector_db,
        row: 1,
        col: 3,
        href: '#vector_db',
        title: t.tips.vector_db,
      },
      {
        id: 'llm_core',
        kind: 'external',
        ...t.nodes.llm_core,
        row: 0,
        col: 3,
        href: '#llm_core',
        title: t.tips.llm_core,
      },
      { id: 'redis_cache', kind: 'database', ...t.nodes.redis_cache, row: 0, col: 4, rowSpan: 2 },
      {
        id: 'stream_client',
        kind: 'frontend',
        ...t.nodes.stream_client,
        row: 0,
        col: 5,
        href: '#stream_client',
        title: t.tips.stream_client,
      },
    ],
    edges: [
      { from: 'chat_ui', to: 'api_gw', label: t.edges.userQuestion, tone: 'emphasis' },
      { from: 'api_gw', to: 'intent_router' },
      { from: 'intent_router', to: 'llm_core', label: t.edges.generalChat, tone: 'dashed' },
      { from: 'intent_router', to: 'embed_svc', label: t.edges.needDomainKnowledge, tone: 'emphasis' },
      { from: 'embed_svc', to: 'vector_db', label: t.edges.cosineSearch, tone: 'emphasis' },
      { from: 'vector_db', to: 'llm_core', label: t.edges.topKContext, tone: 'emphasis' },
      { from: 'llm_core', to: 'redis_cache', label: t.edges.writeCache },
      { from: 'llm_core', to: 'stream_client', label: t.edges.sseChunk, tone: 'emphasis' },
      { from: 'redis_cache', to: 'stream_client', label: t.edges.cacheHit, tone: 'dashed' },
    ],
    frames: [
      { label: t.frames.intake, wraps: ['chat_ui', 'api_gw', 'intent_router'] },
      { label: t.frames.retrieval, wraps: ['embed_svc', 'vector_db'] },
      { label: t.frames.inference, wraps: ['llm_core', 'redis_cache', 'stream_client'] },
    ],
  };
}
