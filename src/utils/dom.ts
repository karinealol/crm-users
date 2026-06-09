/**
 * Helpers de DOM tipados — uma camada fina para evitar boilerplate
 * e manter os componentes legíveis, sem trazer nenhuma biblioteca.
 */

type Attrs = Record<string, string | number | boolean | null | undefined>;

/**
 * Cria um elemento com atributos e filhos.
 * Atributos especiais: `class`, `text`, `html`, e qualquer `on*` (ex: onClick).
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: Array<Node | string> = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') {
      node.className = String(value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key === 'html') {
      node.innerHTML = String(value);
    } else if (key === 'dataset') {
      // tratado abaixo apenas se for objeto — ignorado aqui por simplicidade
    } else if (key.startsWith('data-') || key.startsWith('aria-')) {
      node.setAttribute(key, String(value));
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    node.append(child);
  }
  return node;
}

/** Remove todos os filhos de um elemento. */
export function clear(node: Element): void {
  node.replaceChildren();
}

/** Atalho tipado para querySelector que lança se não encontrar (uso em bootstrap). */
export function mustGet<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector);
  if (!found) {
    throw new Error(`Elemento não encontrado: ${selector}`);
  }
  return found;
}

/** Listener com retorno de cleanup. */
export function on<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Document | Window,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void
): () => void {
  target.addEventListener(type, handler as EventListener);
  return () => target.removeEventListener(type, handler as EventListener);
}

/** Debounce simples para inputs de busca. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Escapa texto para uso seguro em innerHTML (quando html é inevitável). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
