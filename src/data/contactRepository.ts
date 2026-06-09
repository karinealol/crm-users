import type { Contact } from '../types/contact.js';
import { CONTACT_STATUSES } from '../types/contact.js';

const STORAGE_KEY = 'crm.contacts.v1';

/** Coage status legado/desconhecido (ex.: 'lead' removido) para um válido. */
function normalizeStatus(value: unknown): Contact['status'] {
  return CONTACT_STATUSES.includes(value as Contact['status']) ? (value as Contact['status']) : 'ativo';
}

function readRaw(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filtro defensivo: descarta entradas sem id/nome (dados corrompidos)
    // e normaliza o status para os valores suportados atualmente.
    return parsed
      .filter((c): c is Contact => !!c && typeof c.id === 'string' && typeof c.name === 'string')
      .map((c) => ({ ...c, status: normalizeStatus(c.status) }));
  } catch (err) {
    console.error('[repository] falha ao ler contatos:', err);
    return [];
  }
}

function writeRaw(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    // Quota excedida ou storage indisponível (modo privado).
    console.error('[repository] falha ao salvar contatos:', err);
    throw new Error('Não foi possível salvar. O armazenamento local pode estar cheio ou indisponível.');
  }
}

export const contactRepository = {
  getAll(): Contact[] {
    return readRaw();
  },
  saveAll(contacts: Contact[]): void {
    writeRaw(contacts);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
