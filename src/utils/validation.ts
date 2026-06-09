/**
 * Validação pura do rascunho de contato.
 * Retorna um mapa campo -> mensagem. Vazio = válido.
 */
import type { ContactDraft } from '../types/contact.js';

export type ValidationErrors = Partial<Record<keyof ContactDraft, string>>;

// Regex de email pragmático (não tenta cobrir a RFC inteira de propósito).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Aceita dígitos, espaços, +, -, ( ) — entre 8 e 20 caracteres úteis.
const PHONE_RE = /^[+()\d\s-]{8,20}$/;

export function validateDraft(draft: ContactDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.name.trim()) {
    errors.name = 'O nome é obrigatório.';
  } else if (draft.name.trim().length < 2) {
    errors.name = 'O nome deve ter ao menos 2 caracteres.';
  }

  if (!draft.email.trim()) {
    errors.email = 'O email é obrigatório.';
  } else if (!EMAIL_RE.test(draft.email.trim())) {
    errors.email = 'Informe um email válido.';
  }

  // Telefone é opcional, mas se preenchido precisa ter formato plausível.
  if (draft.phone.trim() && !PHONE_RE.test(draft.phone.trim())) {
    errors.phone = 'Telefone inválido (use 8 a 20 dígitos).';
  }

  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
