/**
 * Domínio: Contato do CRM.
 * Tipos puros, sem dependência de DOM ou persistência.
 */

export type ContactStatus = 'ativo' | 'inativo';

export const CONTACT_STATUSES: readonly ContactStatus[] = ['ativo', 'inativo'] as const;

export const STATUS_LABELS: Record<ContactStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
};

/** Registro completo persistido. Datas em ISO 8601. */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: ContactStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Dados editáveis pelo usuário (o que o formulário produz). */
export type ContactDraft = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

/** Cria um rascunho vazio com defaults sensatos. */
export function emptyDraft(): ContactDraft {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    status: 'ativo',
    notes: '',
  };
}

/** Extrai apenas os campos editáveis de um contato existente. */
export function toDraft(contact: Contact): ContactDraft {
  const { id, createdAt, updatedAt, ...draft } = contact;
  void id;
  void createdAt;
  void updatedAt;
  return draft;
}
