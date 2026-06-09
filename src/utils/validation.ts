/**
 * Validação do rascunho de contato com Zod.
 * O schema é a fonte da verdade; `validateDraft` adapta a saída para o
 * formato campo -> mensagem que a UI consome.
 */
import { z } from 'zod';
import type { ContactDraft } from '../types/contact.js';
import { CONTACT_STATUSES } from '../types/contact.js';

// Telefone: dígitos, espaços, +, -, ( ) — entre 8 e 20 caracteres úteis.
const PHONE_RE = /^[+()\d\s-]{8,20}$/;
// Nome não deve conter dígitos (regra "fictícia" de exemplo).
const NO_DIGITS_RE = /^[^\d]+$/;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter ao menos 2 caracteres.')
    .max(80, 'O nome é muito longo (máx. 80 caracteres).')
    .regex(NO_DIGITS_RE, 'O nome não deve conter números.'),

  email: z
    .string()
    .trim()
    .min(1, 'O email é obrigatório.')
    .email('Informe um email válido (ex.: nome@empresa.com).')
    .max(120, 'O email é muito longo.'),

  // Opcional: vazio passa; preenchido precisa bater o formato.
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || PHONE_RE.test(v), 'Telefone inválido (use 8 a 20 dígitos).'),

  company: z.string().trim().max(60, 'Nome da empresa muito longo (máx. 60).'),

  role: z.string().trim().max(60, 'Cargo muito longo (máx. 60).'),

  status: z.enum(CONTACT_STATUSES as unknown as [string, ...string[]]),

  notes: z.string().trim().max(500, 'As notas devem ter no máximo 500 caracteres.'),
});

export type ValidationErrors = Partial<Record<keyof ContactDraft, string>>;

/** Roda o schema e devolve a primeira mensagem de erro por campo. */
export function validateDraft(draft: ContactDraft): ValidationErrors {
  const result = contactSchema.safeParse(draft);
  if (result.success) return {};

  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ContactDraft | undefined;
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
