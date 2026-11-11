import { render } from './render';
import type { FlowSpec } from './types';

const HOST_STYLE = ':host{display:block}svg{display:block;width:100%;height:auto}.error{color:#b91c1c;font:13px/1.5 system-ui,sans-serif}';

/**
 * `<flow-diagram spec='{"nodes":[...]}'>`，或設定 `.spec` 屬性。
 * 點擊有 href 的節點會先送出可取消的 `node-click` 事件，寄主專案用路由器處理時呼叫 `preventDefault()`。
 */
export class FlowDiagram extends HTMLElement {
  static observedAttributes = ['spec'];

  private current: FlowSpec | null = null;
  private readonly root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.root.addEventListener('click', (e) => this.onClick(e));
  }

  get spec(): FlowSpec | null {
    return this.current;
  }

  set spec(value: FlowSpec | null) {
    this.current = value;
    this.draw();
  }

  connectedCallback() {
    this.draw();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name !== 'spec') return;
    try {
      this.current = value ? (JSON.parse(value) as FlowSpec) : null;
    } catch {
      this.show(`<p class="error">spec 不是有效的 JSON</p>`);
      return;
    }
    this.draw();
  }

  private draw() {
    if (!this.current) return this.show('');
    try {
      this.show(render(this.current));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.show(`<p class="error">${message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)}</p>`);
    }
  }

  private show(html: string) {
    this.root.innerHTML = `<style>${HOST_STYLE}</style>${html}`;
  }

  private onClick(e: Event) {
    const link = (e.target as Element).closest?.('a.mf-link');
    if (!link) return;
    const detail = { id: link.getAttribute('data-id') ?? '', href: link.getAttribute('href') ?? '' };
    const proceed = this.dispatchEvent(new CustomEvent('node-click', { detail, bubbles: true, composed: true, cancelable: true }));
    if (!proceed) e.preventDefault();
  }
}

/** 註冊自訂標籤，預設為 `flow-diagram` */
export function defineFlowDiagram(tag = 'flow-diagram') {
  if (!customElements.get(tag)) customElements.define(tag, FlowDiagram);
}
