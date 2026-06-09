/**
 * Bootstrap da aplicação. Conecta serviço de domínio, store de UI e componentes.
 * Fluxo unidirecional: ação → service → store.notify → re-render.
 */
import { ContactService } from './services/contactService.js';
import { createUiStore } from './state/store.js';
import type { UiState } from './state/store.js';
import { Toolbar } from './ui/Toolbar.js';
import { ContactTable } from './ui/ContactTable.js';
import { Drawer } from './ui/Drawer.js';
import { Toaster } from './ui/Toast.js';
import { renderContactForm } from './ui/ContactForm.js';
import { confirmDialog } from './ui/confirm.js';
import { mustGet, el, clear } from './utils/dom.js';
import { STATUS_LABELS } from './types/contact.js';
import type { ContactStatus } from './types/contact.js';

function bootstrap(): void {
  const app = mustGet<HTMLElement>('#app');
  const service = new ContactService();
  const ui = createUiStore();
  const toaster = new Toaster(document.body);

  // --- Estrutura estática ---
  const statsBar = el('div', { class: 'metrics' });
  const plusIcon = el('span', { class: 'btn__icon' });
  plusIcon.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const newBtn = el('button', { class: 'btn btn--primary', type: 'button' }, [
    plusIcon,
    el('span', { text: 'Novo contato' }),
  ]);

  const header = el('header', { class: 'app__header' }, [
    el('div', { class: 'brand' }, [
      el('span', { class: 'brand__mark', text: '◆' }),
      el('div', { class: 'brand__text' }, [
        el('h1', { class: 'brand__title', text: 'Contatos' }),
        el('span', { class: 'brand__sub', text: 'CRM' }),
      ]),
    ]),
    el('div', { class: 'app__header-right' }, [statsBar, newBtn]),
  ]);

  const table = new ContactTable({
    onEdit: (id) => ui.setState({ drawer: id }),
    onDelete: (id) => void handleDelete(id),
    onSort: (column) => {
      const s = ui.getState();
      const sameCol = s.sortBy === column;
      ui.setState({ sortBy: column, sortDir: sameCol && s.sortDir === 'desc' ? 'asc' : 'desc' });
    },
  });

  const toolbar = new Toolbar({
    onSearch: (search) => ui.setState({ search }),
    onStatusChange: (statusFilter) => ui.setState({ statusFilter }),
    onExport: () => handleExport(),
    onImport: (file) => void handleImport(file),
  });

  const main = el('main', { class: 'app__main' }, [toolbar.root, table.root]);
  app.append(header, main);

  const drawer = new Drawer(document.body, () => ui.setState({ drawer: null }));
  newBtn.addEventListener('click', () => ui.setState({ drawer: 'new' }));

  // --- Renderização derivada do estado ---
  let lastDrawer: UiState['drawer'] = null;

  function render(state: UiState): void {
    const contacts = service.query({
      search: state.search,
      status: state.statusFilter,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
    });
    table.render(contacts, { sortBy: state.sortBy, sortDir: state.sortDir });
    renderStats();

    // Drawer só reage a mudanças de abertura/fechamento.
    if (state.drawer !== lastDrawer) {
      syncDrawer(state.drawer);
      lastDrawer = state.drawer;
    }
  }

  function renderStats(): void {
    const { total, byStatus } = service.stats();
    clear(statsBar);
    const metric = (label: string, value: number, mod = '', dot = false) =>
      el('div', { class: `metric ${mod}` }, [
        el('span', { class: 'metric__value' }, [
          ...(dot ? [el('span', { class: 'metric__dot' })] : []),
          el('span', { text: String(value) }),
        ]),
        el('span', { class: 'metric__label', text: label }),
      ]);
    const sep = () => el('span', { class: 'metric__sep', 'aria-hidden': 'true' });
    statsBar.append(
      metric('Total', total),
      sep(),
      metric(STATUS_LABELS.ativo, byStatus.ativo, 'metric--ativo', true),
      sep(),
      metric(STATUS_LABELS.inativo, byStatus.inativo, 'metric--inativo', true),
    );
  }

  function syncDrawer(drawerState: UiState['drawer']): void {
    if (drawerState === null) {
      drawer.close();
      return;
    }
    const isNew = drawerState === 'new';
    const contact = isNew ? null : service.getById(drawerState) ?? null;
    if (!isNew && !contact) {
      ui.setState({ drawer: null });
      return;
    }
    const form = renderContactForm(contact, {
      onSubmit: (draft) => {
        try {
          if (isNew) {
            service.create(draft);
            toaster.success('Contato criado.');
          } else {
            service.update(drawerState, draft);
            toaster.success('Alterações salvas.');
          }
          ui.setState({ drawer: null });
          render(ui.getState());
        } catch (err) {
          toaster.error(err instanceof Error ? err.message : 'Erro ao salvar.');
        }
      },
      onCancel: () => ui.setState({ drawer: null }),
    });
    drawer.open(isNew ? 'Novo contato' : 'Editar contato', form);
  }

  async function handleDelete(id: string): Promise<void> {
    const contact = service.getById(id);
    if (!contact) return;
    const ok = await confirmDialog({
      title: 'Excluir contato',
      message: `Remover "${contact.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    service.remove(id);
    if (ui.getState().drawer === id) ui.setState({ drawer: null });
    render(ui.getState());
    toaster.success('Contato excluído.');
  }

  function handleExport(): void {
    const blob = new Blob([service.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `contatos-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toaster.success('Backup exportado.');
  }

  async function handleImport(file: File): Promise<void> {
    try {
      const text = await file.text();
      const count = service.importJson(text);
      render(ui.getState());
      toaster.success(`${count} contato(s) importado(s).`);
    } catch (err) {
      toaster.error(err instanceof Error ? err.message : 'Falha ao importar arquivo.');
    }
  }

  // --- Seed opcional na primeira execução, para não abrir vazio ---
  maybeSeed(service);

  ui.subscribe(render);
  render(ui.getState());
}

/** Popula alguns contatos de exemplo apenas se o storage estiver totalmente vazio. */
function maybeSeed(service: ContactService): void {
  if (service.stats().total > 0) return;
  const seed: Array<{ name: string; email: string; phone: string; company: string; role: string; status: ContactStatus; notes: string }> = [
    { name: 'Ana Lima', email: 'ana.lima@acme.com', phone: '(11) 98888-1010', company: 'ACME Inc.', role: 'Head de Vendas', status: 'ativo', notes: 'Renovação de contrato em julho.' },
    { name: 'João Ribeiro', email: 'joao@globex.io', phone: '(21) 97777-2020', company: 'Globex', role: 'Procurement', status: 'ativo', notes: 'Fechou contrato anual.' },
    { name: 'Marina Souza', email: 'marina.souza@initech.com', phone: '(31) 96666-3030', company: 'Initech', role: 'CFO', status: 'inativo', notes: 'Sem retorno há 3 meses.' },
  ];
  for (const s of seed) service.create(s);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
