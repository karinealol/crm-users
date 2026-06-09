/** Diálogo de confirmação baseado em <dialog> nativo, com Promise. */
import { el } from '../utils/dom.js';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  const { title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false } = opts;

  return new Promise((resolve) => {
    const confirmBtn = el('button', {
      class: `btn ${danger ? 'btn--danger' : 'btn--primary'}`,
      type: 'button',
      text: confirmLabel,
    });
    const cancelBtn = el('button', { class: 'btn btn--ghost', type: 'button', text: cancelLabel });

    const dialog = el('dialog', { class: 'confirm' }, [
      el('div', { class: 'confirm__body' }, [
        el('h2', { class: 'confirm__title', text: title }),
        el('p', { class: 'confirm__msg', text: message }),
      ]),
      el('div', { class: 'confirm__actions' }, [cancelBtn, confirmBtn]),
    ]) as HTMLDialogElement;

    const close = (result: boolean) => {
      dialog.close();
      dialog.addEventListener('transitionend', () => dialog.remove(), { once: true });
      // fallback caso não haja transição
      setTimeout(() => dialog.remove(), 250);
      resolve(result);
    };

    confirmBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      close(false);
    });

    document.body.append(dialog);
    dialog.showModal();
  });
}
