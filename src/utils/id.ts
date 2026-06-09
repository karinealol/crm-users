/**
 * Geração de identificadores únicos.
 * Usa crypto.randomUUID quando disponível, com fallback determinístico-o-suficiente.
 */
export function createId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // Fallback: timestamp + aleatório. Suficiente para uso local single-user.
  const rand = Math.random().toString(36).slice(2, 10);
  return `c_${Date.now().toString(36)}_${rand}`;
}
