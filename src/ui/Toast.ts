/** Notificações efêmeras, empilhadas no canto. Sem libs. */
import { el } from '../utils/dom.js';

type ToastKind = 'success' | 'error' | 'info';

const ICONS: Record<ToastKind, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

export class Toaster {
  private container: HTMLElement;

  constructor(root: HTMLElement) {
    this.container = el('div', { class: 'toaster', 'aria-live': 'polite' });
    root.append(this.container);
  }

  show(message: string, kind: ToastKind = 'info', timeout = 3200): void {
    const toast = el('div', { class: `toast toast--${kind}`, role: 'status' }, [
      el('span', { class: 'toast__icon', text: ICONS[kind] }),
      el('span', { class: 'toast__msg', text: message }),
    ]);
    this.container.append(toast);
    // Força reflow para a transição de entrada.
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    const remove = () => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };
    const timer = setTimeout(remove, timeout);
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      remove();
    });
  }

  success(msg: string): void {
    this.show(msg, 'success');
  }
  error(msg: string): void {
    this.show(msg, 'error');
  }
}
