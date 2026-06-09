/**
 * Regras de negócio do CRM. Orquestra repositório + geração de id/datas.
 * Não conhece DOM — totalmente testável de forma isolada.
 */
import type { Contact, ContactDraft, ContactStatus } from '../types/contact.js';
import { contactRepository } from '../data/contactRepository.js';
import { createId } from '../utils/id.js';

function nowIso(): string {
  return new Date().toISOString();
}

function sanitize(draft: ContactDraft): ContactDraft {
  return {
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    company: draft.company.trim(),
    role: draft.role.trim(),
    status: draft.status,
    notes: draft.notes.trim(),
  };
}

export interface QueryOptions {
  search?: string;
  status?: ContactStatus | 'all';
  sortBy?: 'name' | 'company' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
}

export class ContactService {
  private contacts: Contact[];

  constructor() {
    this.contacts = contactRepository.getAll();
  }

  /** Lista filtrada/ordenada para a UI. Não muta o estado interno. */
  query(opts: QueryOptions = {}): Contact[] {
    const { search = '', status = 'all', sortBy = 'updatedAt', sortDir = 'desc' } = opts;
    const term = search.trim().toLowerCase();

    let result = this.contacts.filter((c) => {
      const matchesStatus = status === 'all' || c.status === status;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.role.toLowerCase().includes(term)
      );
    });

    result = result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a[sortBy];
      const bv = b[sortBy];
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });

    return result;
  }

  getById(id: string): Contact | undefined {
    return this.contacts.find((c) => c.id === id);
  }

  create(draft: ContactDraft): Contact {
    const clean = sanitize(draft);
    const ts = nowIso();
    const contact: Contact = {
      id: createId(),
      ...clean,
      createdAt: ts,
      updatedAt: ts,
    };
    this.contacts = [contact, ...this.contacts];
    this.persist();
    return contact;
  }

  update(id: string, draft: ContactDraft): Contact {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Contato não encontrado: ${id}`);
    const updated: Contact = {
      ...existing,
      ...sanitize(draft),
      updatedAt: nowIso(),
    };
    this.contacts = this.contacts.map((c) => (c.id === id ? updated : c));
    this.persist();
    return updated;
  }

  remove(id: string): void {
    this.contacts = this.contacts.filter((c) => c.id !== id);
    this.persist();
  }

  /** Estatísticas para o cabeçalho. */
  stats(): { total: number; byStatus: Record<ContactStatus, number> } {
    const byStatus: Record<ContactStatus, number> = { ativo: 0, inativo: 0 };
    for (const c of this.contacts) byStatus[c.status]++;
    return { total: this.contacts.length, byStatus };
  }

  /** Exporta todos os contatos como JSON (backup). */
  exportJson(): string {
    return JSON.stringify(this.contacts, null, 2);
  }

  /** Importa contatos de um JSON, mesclando por id. Retorna quantos foram importados. */
  importJson(json: string): number {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('JSON inválido: esperado um array de contatos.');
    const byId = new Map(this.contacts.map((c) => [c.id, c]));
    let count = 0;
    for (const raw of parsed) {
      if (raw && typeof raw.id === 'string' && typeof raw.name === 'string') {
        byId.set(raw.id, raw as Contact);
        count++;
      }
    }
    this.contacts = [...byId.values()];
    this.persist();
    return count;
  }

  private persist(): void {
    contactRepository.saveAll(this.contacts);
  }
}
