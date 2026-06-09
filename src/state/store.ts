/**
 * Store observável mínimo — padrão pub/sub, sem dependências.
 * Mantém o estado de UI (filtros, seleção, drawer) separado dos dados de domínio.
 */
export type Listener<S> = (state: S) => void;

export class Store<S> {
  private state: S;
  private listeners = new Set<Listener<S>>();

  constructor(initial: S) {
    this.state = initial;
  }

  getState(): Readonly<S> {
    return this.state;
  }

  /** Aplica um patch parcial e notifica os assinantes. */
  setState(patch: Partial<S> | ((prev: S) => Partial<S>)): void {
    const delta = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...delta };
    this.emit();
  }

  subscribe(listener: Listener<S>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}

import type { ContactStatus } from '../types/contact.js';

export interface UiState {
  search: string;
  statusFilter: ContactStatus | 'all';
  sortBy: 'name' | 'company' | 'updatedAt';
  sortDir: 'asc' | 'desc';
  drawer: string | 'new' | null;
}

export function createUiStore(): Store<UiState> {
  return new Store<UiState>({
    search: '',
    statusFilter: 'all',
    sortBy: 'updatedAt',
    sortDir: 'desc',
    drawer: null,
  });
}
