/**
 * Barra de ferramentas: busca, filtro por status e ações de backup.
 * Emite mudanças via callbacks; não guarda estado próprio.
 */
import { CONTACT_STATUSES, STATUS_LABELS } from '../types/contact.js';
import type { ContactStatus } from '../types/contact.js';
import { el, debounce } from '../utils/dom.js';

interface ToolbarCallbacks {
  onSearch: (term: string) => void;
  onStatusChange: (status: ContactStatus | 'all') => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export class Toolbar {
  readonly root: HTMLElement;
  private chips = new Map<ContactStatus | 'all', HTMLElement>();

  constructor(cb: ToolbarCallbacks) {
    const search = el('input', {
      class: 'search__input',
      type: 'search',
      placeholder: 'Buscar por nome, email, empresa…',
      'aria-label': 'Buscar contatos',
    }) as HTMLInputElement;
    search.addEventListener('input', debounce(() => cb.onSearch(search.value), 180));

    const icon = el('span', { class: 'search__icon' });
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

    const searchBox = el('div', { class: 'search' }, [
      icon,
      search,
    ]);

    const filters = el('div', { class: 'filters', role: 'group', 'aria-label': 'Filtrar por status' });
    const makeChip = (value: ContactStatus | 'all', label: string) => {
      const chip = el('button', { class: 'chip', type: 'button', text: label, 'data-value': value });
      if (value === 'all') chip.classList.add('is-active');
      chip.addEventListener('click', () => {
        for (const c of this.chips.values()) c.classList.remove('is-active');
        chip.classList.add('is-active');
        cb.onStatusChange(value);
      });
      this.chips.set(value, chip);
      filters.append(chip);
    };
    makeChip('all', 'Todos');
    for (const s of CONTACT_STATUSES) makeChip(s, STATUS_LABELS[s]);

    // Export / Import
    const exportBtn = el('button', { class: 'btn btn--ghost', type: 'button', text: 'Exportar' });
    exportBtn.addEventListener('click', cb.onExport);

    const fileInput = el('input', { type: 'file', accept: 'application/json', hidden: true }) as HTMLInputElement;
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) cb.onImport(file);
      fileInput.value = '';
    });
    const importBtn = el('button', { class: 'btn btn--ghost', type: 'button', text: 'Importar' });
    importBtn.addEventListener('click', () => fileInput.click());

    const backup = el('div', { class: 'toolbar__backup' }, [exportBtn, importBtn, fileInput]);

    this.root = el('div', { class: 'toolbar' }, [
      searchBox,
      el('div', { class: 'toolbar__right' }, [filters, backup]),
    ]);
  }
}
