/**
 * Formulário de criar/editar dentro do drawer lateral.
 * Controlado, com validação inline ao submeter e ao sair de cada campo.
 */
import { CONTACT_STATUSES, STATUS_LABELS, emptyDraft, toDraft } from '../types/contact.js';
import type { Contact, ContactDraft } from '../types/contact.js';
import { validateDraft, isValid } from '../utils/validation.js';
import type { ValidationErrors } from '../utils/validation.js';
import { el } from '../utils/dom.js';

interface FormCallbacks {
  onSubmit: (draft: ContactDraft) => void;
  onCancel: () => void;
}

interface FieldDef {
  key: keyof ContactDraft;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  /** Texto de apoio exibido abaixo do campo enquanto não há erro. */
  hint?: string;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Nome', type: 'text', placeholder: 'Ana Lima', required: true, hint: 'Nome completo, sem números (2 a 80 caracteres).' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'ana@empresa.com', required: true, hint: 'Usado como identificador principal do contato.' },
  { key: 'phone', label: 'Telefone', type: 'tel', placeholder: '(11) 99999-0000', hint: 'Opcional. Aceita 8 a 20 dígitos, com (), + ou -.' },
  { key: 'company', label: 'Empresa', type: 'text', placeholder: 'ACME Inc.', hint: 'Organização onde o contato trabalha (até 60 caracteres).' },
  { key: 'role', label: 'Cargo', type: 'text', placeholder: 'Head de Vendas', hint: 'Função ou cargo atual (até 60 caracteres).' },
  { key: 'status', label: 'Status', type: 'select', hint: 'Ativo = cliente atual · Inativo = sem relação no momento.' },
  { key: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Contexto, próximos passos…', hint: 'Anotações internas (até 500 caracteres).' },
];

export function renderContactForm(contact: Contact | null, cb: FormCallbacks): HTMLElement {
  const draft: ContactDraft = contact ? toDraft(contact) : emptyDraft();
  let errors: ValidationErrors = {};

  const fieldNodes = new Map<keyof ContactDraft, { input: HTMLElement; error: HTMLElement; hint: HTMLElement }>();

  const form = el('form', { class: 'cform', novalidate: true }) as HTMLFormElement;

  for (const def of FIELDS) {
    const errorNode = el('span', { class: 'cform__error', id: `err-${def.key}` });
    const hintNode = el('span', { class: 'cform__hint', id: `hint-${def.key}`, text: def.hint ?? '' });
    const input = buildControl(def, draft, () => {
      // valida o campo individual ao alterar, se já houve erro nele
      if (errors[def.key]) {
        errors = validateDraft(draft);
        paintErrors();
      }
    });

    const field = el('div', { class: `cform__field cform__field--${def.type}` }, [
      el('label', { class: 'cform__label', for: `f-${def.key}`, text: def.label + (def.required ? ' *' : '') }),
      input,
      errorNode,
      hintNode,
    ]);
    fieldNodes.set(def.key, { input, error: errorNode, hint: hintNode });
    form.append(field);
  }

  const actions = el('div', { class: 'cform__actions' }, [
    el('button', { class: 'btn btn--ghost', type: 'button', text: 'Cancelar' }),
    el('button', { class: 'btn btn--primary', type: 'submit', text: contact ? 'Salvar alterações' : 'Criar contato' }),
  ]);
  (actions.firstElementChild as HTMLButtonElement).addEventListener('click', cb.onCancel);
  form.append(actions);

  function paintErrors(): void {
    for (const [key, { input, error, hint }] of fieldNodes) {
      const msg = errors[key];
      input.classList.toggle('is-invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      input.setAttribute('aria-describedby', msg ? `err-${key}` : `hint-${key}`);
      error.textContent = msg ?? '';
      // O erro substitui o helper text enquanto estiver visível.
      hint.hidden = !!msg;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errors = validateDraft(draft);
    paintErrors();
    if (isValid(errors)) {
      cb.onSubmit(draft);
    } else {
      // foca o primeiro campo inválido
      const firstKey = FIELDS.find((f) => errors[f.key])?.key;
      if (firstKey) fieldNodes.get(firstKey)?.input.focus();
    }
  });

  // foca o primeiro campo ao montar
  requestAnimationFrame(() => fieldNodes.get('name')?.input.focus());

  return form;
}

function buildControl(def: FieldDef, draft: ContactDraft, onInput: () => void): HTMLElement {
  const id = `f-${def.key}`;
  const common = { id, name: def.key, class: 'cform__input', 'aria-describedby': `err-${def.key}` };

  if (def.type === 'textarea') {
    const ta = el('textarea', { ...common, rows: 3, placeholder: def.placeholder ?? '' }) as HTMLTextAreaElement;
    ta.value = draft[def.key];
    ta.addEventListener('input', () => {
      (draft[def.key] as string) = ta.value;
      onInput();
    });
    return ta;
  }

  if (def.type === 'select') {
    const select = el('select', { ...common, class: 'cform__input cform__select' }) as HTMLSelectElement;
    for (const status of CONTACT_STATUSES) {
      const opt = el('option', { value: status, text: STATUS_LABELS[status] }) as HTMLOptionElement;
      if (draft.status === status) opt.selected = true;
      select.append(opt);
    }
    select.addEventListener('change', () => {
      draft.status = select.value as ContactDraft['status'];
      onInput();
    });
    return select;
  }

  const input = el('input', { ...common, type: def.type, placeholder: def.placeholder ?? '' }) as HTMLInputElement;
  input.value = draft[def.key] as string;
  input.addEventListener('input', () => {
    (draft[def.key] as string) = input.value;
    onInput();
  });
  return input;
}
