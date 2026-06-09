/**
 * Painel deslizante à direita (drawer). Hospeda o formulário de criar/editar.
 * Fecha com Esc, clique no backdrop ou no X.
 */
import { el, clear } from '../utils/dom.js';

export class Drawer {
  readonly root: HTMLElement;
  private backdrop: HTMLElement;
  private panel: HTMLElement;
  private titleEl: HTMLElement;
  private bodyEl: HTMLElement;
  private onClose: () => void;
  private keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.requestClose();
  };

  constructor(host: HTMLElement, onClose: () => void) {
    this.onClose = onClose;

    this.backdrop = el('div', { class: 'drawer__backdrop' });
    this.titleEl = el('h2', { class: 'drawer__title', id: 'drawer-title' });
    this.bodyEl = el('div', { class: 'drawer__body' });

    const closeBtn = el('button', { class: 'drawer__close', type: 'button', 'aria-label': 'Fechar', text: '✕' });
    closeBtn.addEventListener('click', () => this.requestClose());

    this.panel = el('aside', {
      class: 'drawer__panel',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'drawer-title',
    }, [
      el('header', { class: 'drawer__header' }, [this.titleEl, closeBtn]),
      this.bodyEl,
    ]);

    this.root = el('div', { class: 'drawer', hidden: true }, [this.backdrop, this.panel]);
    this.backdrop.addEventListener('click', () => this.requestClose());

    host.append(this.root);
  }

  open(title: string, content: HTMLElement): void {
    this.titleEl.textContent = title;
    clear(this.bodyEl);
    this.bodyEl.append(content);
    this.root.hidden = false;
    requestAnimationFrame(() => this.root.classList.add('is-open'));
    document.addEventListener('keydown', this.keyHandler);
  }

  close(): void {
    this.root.classList.remove('is-open');
    document.removeEventListener('keydown', this.keyHandler);
    const finish = () => {
      this.root.hidden = true;
      clear(this.bodyEl);
    };
    this.panel.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 300);
  }

  private requestClose(): void {
    this.onClose();
  }
}
