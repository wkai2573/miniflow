import type { FlowSpec } from '../src';
import type { Lang } from './shell-strings';

// 做法同 ecommerce.ts：結構只寫在 createCicd 裡，可見文字全部來自字典。
type NodeId =
  | 'git_pr'
  | 'ci_runner'
  | 'test_suite'
  | 'slack_alert'
  | 'docker_build'
  | 'registry'
  | 'deploy_staging'
  | 'smoke_test'
  | 'deploy_prod'
  | 'rollback';

/** 有連結的節點才有提示文字 */
type LinkedNodeId = 'git_pr' | 'slack_alert' | 'registry' | 'deploy_prod' | 'rollback';

interface CicdText {
  title: string;
  legend: { title: string; frontend: string; backend: string; database: string; external: string };
  nodes: Record<NodeId, { label: string; sub: string }>;
  /** 節點的連結提示文字 */
  tips: Record<LinkedNodeId, string>;
  edges: {
    triggerWebhook: string;
    testsPassed: string;
    testsFailed: string;
    pushImage: string;
    pullImage: string;
    triggerVerify: string;
    accepted: string;
    rollback: string;
  };
  frames: { ci: string; cd: string };
}

const text: Record<Lang, CicdText> = {
  en: {
    title: 'CI/CD Build and Deployment Pipeline',
    legend: {
      title: 'Pipeline stages',
      frontend: 'Developer interface',
      backend: 'Automation runner',
      database: 'Image registry',
      external: 'Third-party collaboration platform',
    },
    nodes: {
      git_pr: { label: 'GitHub PR', sub: 'PR to main branch' },
      ci_runner: { label: 'CI runner', sub: 'GitHub Actions' },
      test_suite: { label: 'Automated tests', sub: 'Unit / integration tests' },
      slack_alert: { label: 'Slack alert', sub: '#dev-alerts channel' },
      docker_build: { label: 'Build Docker image', sub: 'Multi-stage Build' },
      registry: { label: 'Artifact Registry', sub: 'OCI Image / Helm' },
      deploy_staging: { label: 'Deploy to Staging', sub: 'Pre-release verification environment' },
      smoke_test: { label: 'Smoke health check', sub: 'HTTP probes and E2E' },
      deploy_prod: { label: 'Release to production', sub: 'K8s rolling update' },
      rollback: { label: 'Auto rollback / alert', sub: 'PagerDuty On-Call' },
    },
    tips: {
      git_pr: 'View pull request',
      slack_alert: 'Go to Slack channel',
      registry: 'Browse container registry',
      deploy_prod: 'K8s cluster console',
      rollback: 'PagerDuty incident response',
    },
    edges: {
      triggerWebhook: 'Trigger Webhook',
      testsPassed: 'Tests passed',
      testsFailed: 'Tests failed, abort',
      pushImage: 'Push Image',
      pullImage: 'Pull Image',
      triggerVerify: 'Trigger verification',
      accepted: 'Accepted',
      rollback: 'Anomaly rollback',
    },
    frames: {
      ci: 'CI continuous integration checks',
      cd: 'CD continuous delivery and deployment',
    },
  },
  'zh-Hant': {
    title: 'CI/CD 自動化建置與部署流水線',
    legend: {
      title: '流水線階段',
      frontend: '開發者介面',
      backend: '自動化執行單元',
      database: '映像檔儲存庫',
      external: '第三方開發協作平台',
    },
    nodes: {
      git_pr: { label: 'GitHub PR', sub: 'main 分支 PR' },
      ci_runner: { label: 'CI 執行器', sub: 'GitHub Actions' },
      test_suite: { label: '自動化測試', sub: '單元 / 整合測試' },
      slack_alert: { label: 'Slack 告警', sub: '#dev-alerts 頻道' },
      docker_build: { label: '建置 Docker 映像', sub: 'Multi-stage Build' },
      registry: { label: 'Artifact Registry', sub: 'OCI Image / Helm' },
      deploy_staging: { label: '部署至 Staging', sub: '預發布驗證環境' },
      smoke_test: { label: '冒煙健康檢查', sub: 'HTTP 探針與 E2E' },
      deploy_prod: { label: '生產環境上線', sub: 'K8s 滾動更新' },
      rollback: { label: '自動復原 / 告警', sub: 'PagerDuty On-Call' },
    },
    tips: {
      git_pr: '檢視 Pull Request',
      slack_alert: '前往 Slack 頻道',
      registry: '瀏覽容器儲存庫',
      deploy_prod: 'K8s 叢集控制台',
      rollback: 'PagerDuty 事件回應',
    },
    edges: {
      triggerWebhook: '觸發 Webhook',
      testsPassed: '測試通過',
      testsFailed: '測試失敗中斷',
      pushImage: 'Push Image',
      pullImage: 'Pull Image',
      triggerVerify: '觸發驗證',
      accepted: '驗收通過',
      rollback: '異常回滾',
    },
    frames: {
      ci: 'CI 持續整合檢驗',
      cd: 'CD 持續交付與部署',
    },
  },
};

/** CI/CD 自動化建置與部署流水線 */
export function createCicd(lang: Lang): FlowSpec {
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
        id: 'git_pr',
        kind: 'external',
        ...t.nodes.git_pr,
        row: 0,
        col: 0,
        href: '#git_pr',
        title: t.tips.git_pr,
      },
      { id: 'ci_runner', kind: 'backend', ...t.nodes.ci_runner, row: 0, col: 1 },
      { id: 'test_suite', kind: 'backend', icon: 'decision', ...t.nodes.test_suite, row: 0, col: 2 },
      {
        id: 'slack_alert',
        kind: 'external',
        ...t.nodes.slack_alert,
        row: 1,
        col: 2,
        href: '#slack_alert',
        title: t.tips.slack_alert,
      },
      { id: 'docker_build', kind: 'backend', ...t.nodes.docker_build, row: 0, col: 3 },
      {
        id: 'registry',
        kind: 'database',
        ...t.nodes.registry,
        row: 0,
        col: 4,
        rowSpan: 2,
        href: '#registry',
        title: t.tips.registry,
      },
      { id: 'deploy_staging', kind: 'backend', ...t.nodes.deploy_staging, row: 0, col: 5 },
      { id: 'smoke_test', kind: 'backend', icon: 'decision', ...t.nodes.smoke_test, row: 0, col: 6 },
      {
        id: 'deploy_prod',
        kind: 'backend',
        ...t.nodes.deploy_prod,
        row: 0,
        col: 7,
        href: '#deploy_prod',
        title: t.tips.deploy_prod,
      },
      {
        id: 'rollback',
        kind: 'external',
        ...t.nodes.rollback,
        row: 1,
        col: 6,
        href: '#rollback',
        title: t.tips.rollback,
      },
    ],
    edges: [
      { from: 'git_pr', to: 'ci_runner', label: t.edges.triggerWebhook },
      { from: 'ci_runner', to: 'test_suite', tone: 'emphasis' },
      { from: 'test_suite', to: 'docker_build', label: t.edges.testsPassed, tone: 'emphasis' },
      { from: 'test_suite', to: 'slack_alert', label: t.edges.testsFailed, tone: 'dashed' },
      { from: 'docker_build', to: 'registry', label: t.edges.pushImage, tone: 'emphasis' },
      { from: 'registry', to: 'deploy_staging', label: t.edges.pullImage, tone: 'emphasis' },
      { from: 'deploy_staging', to: 'smoke_test', label: t.edges.triggerVerify },
      { from: 'smoke_test', to: 'deploy_prod', label: t.edges.accepted, tone: 'emphasis' },
      { from: 'smoke_test', to: 'rollback', label: t.edges.rollback, tone: 'dashed' },
    ],
    frames: [
      { label: t.frames.ci, wraps: ['git_pr', 'ci_runner', 'test_suite', 'slack_alert', 'docker_build'] },
      { label: t.frames.cd, wraps: ['registry', 'deploy_staging', 'smoke_test', 'rollback', 'deploy_prod'] },
    ],
  };
}
