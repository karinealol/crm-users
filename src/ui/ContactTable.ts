/**
 * Tabela densa de contatos. Renderiza avatar, status, metadados e ações.
 * Cabeçalhos clicáveis para ordenar. Estado vazio dedicado.
 */
import type { Contact } from '../types/contact.js';
import { STATUS_LABELS } from '../types/contact.js';
import { el, clear } from '../utils/dom.js';
import { formatDate, initials, avatarHue } from '../utils/format.js';

interface TableCallbacks {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort: (column: 'name' | 'company' | 'updatedAt') => void;
}

interface SortState {
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export class ContactTable {
  readonly root: HTMLElement;
  private cb: TableCallbacks;

  constructor(cb: TableCallbacks) {
    this.cb = cb;
    this.root = el('div', { class: 'table-wrap' });
  }

  render(contacts: Contact[], sort: SortState): void {
    clear(this.root);

    if (contacts.length === 0) {
      this.root.append(this.emptyState());
      return;
    }

    const table = el('table', { class: 'table' }, [
      this.head(sort),
      this.body(contacts),
    ]);
    this.root.append(table);
  }

  private head(sort: SortState): HTMLElement {
    const sortable = (label: string, col: 'name' | 'company' | 'updatedAt'): HTMLElement => {
      const active = sort.sortBy === col;
      const caret = active ? (sort.sortDir === 'asc' ? '↑' : '↓') : '';
      const th = el('th', { class: `table__th table__th--sortable${active ? ' is-active' : ''}`, scope: 'col' }, [
        el('span', { text: label }),
        el('span', { class: 'table__caret', text: caret }),
      ]);
      th.addEventListener('click', () => this.cb.onSort(col));
      return th;
    };

    return el('thead', {}, [
      el('tr', {}, [
        sortable('Contato', 'name'),
        sortable('Empresa', 'company'),
        el('th', { class: 'table__th', scope: 'col', text: 'Telefone' }),
        el('th', { class: 'table__th', scope: 'col', text: 'Status' }),
        sortable('Atualizado', 'updatedAt'),
        el('th', { class: 'table__th table__th--actions', scope: 'col', 'aria-label': 'Ações' }),
      ]),
    ]);
  }

  private body(contacts: Contact[]): HTMLElement {
    const rows = contacts.map((c) => this.row(c));
    return el('tbody', {}, rows);
  }

  private row(c: Contact): HTMLElement {
    const avatar = el('span', {
      class: 'avatar',
      text: initials(c.name),
      style: `--hue:${avatarHue(c.name)}`,
    });

    const identity = el('div', { class: 'cell-identity' }, [
      avatar,
      el('div', { class: 'cell-identity__text' }, [
        el('span', { class: 'cell-identity__name', text: c.name }),
        el('span', { class: 'cell-identity__email', text: c.email || '—' }),
      ]),
    ]);

    const company = el('div', { class: 'cell-company' }, [
      el('span', { class: 'cell-company__name', text: c.company || '—' }),
      c.role ? el('span', { class: 'cell-company__role', text: c.role }) : el('span'),
    ]);

    const editBtn = el('button', { class: 'icon-btn', type: 'button', title: 'Editar', 'aria-label': 'Editar', text: '✎' });
    const delBtn = el('button', { class: 'icon-btn icon-btn--danger', type: 'button', title: 'Excluir', 'aria-label': 'Excluir', text: '🗑' });
    editBtn.addEventListener('click', () => this.cb.onEdit(c.id));
    delBtn.addEventListener('click', () => this.cb.onDelete(c.id));

    const tr = el('tr', { class: 'table__row', 'data-id': c.id }, [
      el('td', { class: 'table__td' }, [identity]),
      el('td', { class: 'table__td' }, [company]),
      el('td', { class: 'table__td table__td--mono', text: c.phone || '—' }),
      el('td', { class: 'table__td' }, [this.badge(c)]),
      el('td', { class: 'table__td table__td--muted', text: formatDate(c.updatedAt) }),
      el('td', { class: 'table__td table__td--actions' }, [el('div', { class: 'row-actions' }, [editBtn, delBtn])]),
    ]);

    // clicar na linha (fora dos botões) abre edição
    tr.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.row-actions')) return;
      this.cb.onEdit(c.id);
    });

    return tr;
  }

  private badge(c: Contact): HTMLElement {
    return el('span', { class: `badge badge--${c.status}` }, [
      el('span', { class: 'badge__dot' }),
      el('span', { text: STATUS_LABELS[c.status] }),
    ]);
  }

  private emptyState(): HTMLElement {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'empty__glyph', text: '◍' }),
      el('p', { class: 'empty__title', text: 'Nenhum contato por aqui' }),
      el('p', { class: 'empty__hint', text: 'Ajuste a busca/filtros ou crie um novo contato para começar.' }),
    ]);
  }
}
