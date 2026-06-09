# CRM de Contatos

CRUD completo de contatos, **somente frontend**, em **TypeScript puro** (sem nenhuma
biblioteca de runtime). Os dados ficam no **localStorage** do navegador. Design dark,
denso, estilo dashboard (Linear/Vercel), com painel lateral (drawer) para criar/editar.

## Como rodar

Pré-requisito: Node.js (apenas para o compilador TypeScript — não há lib de runtime).

```bash
npm install      # instala só o typescript (devDependency)
npm run build    # compila src/ -> dist/ com type-check estrito
```

Depois abra a aplicação:

```bash
npm run serve    # sobe um servidor estático (npx serve) e abre no navegador
# ou simplesmente abra index.html — ele carrega dist/main.js como módulo ES
```

> Para desenvolver com recompilação automática: `npm run watch`.

## Funcionalidades

- **CRUD completo**: criar, listar, editar e excluir contatos (nome, email, telefone,
  empresa, cargo, status, notas, datas de criação/atualização).
- **Busca** por nome/email/empresa/cargo e **filtro** por status (lead/ativo/inativo).
- **Ordenação** por nome, empresa ou data de atualização (clique no cabeçalho).
- **Validação inline** (nome/email obrigatórios, formato de email e telefone).
- **Painel lateral** (drawer) com Esc/clique fora para fechar; confirmação de exclusão.
- **Toasts** de feedback e **estatísticas** no cabeçalho.
- **Backup**: exportar/importar todos os contatos em JSON.
- Dados de exemplo (seed) na primeira execução; persistem em localStorage.

## Arquitetura

Camadas com responsabilidade única e fluxo de dados unidirecional
(`ação → service → store.notify → re-render`):

```
src/
├── types/contact.ts          Domínio e tipos puros
├── data/contactRepository.ts Persistência (único ponto que toca localStorage)
├── services/contactService.ts Regras de negócio + CRUD/consulta/stats/backup
├── state/store.ts            Store observável (pub/sub) do estado de UI
├── utils/                    id, validação, format, helpers de DOM
├── ui/                       Toolbar, ContactTable, Drawer, ContactForm, Toast, confirm
└── main.ts                   Bootstrap e wiring
```

Trocar o backend (IndexedDB, API REST) significa reescrever **apenas**
`data/contactRepository.ts`. A camada de serviço e a UI não conhecem localStorage.

Estilos em `styles/` separados por responsabilidade: `reset`, `tokens` (design tokens —
a fonte da verdade visual), `layout` e `components`.

## Próximos passos recomendados

1. **Testes unitários** de `contactService` e `validation` com Vitest (dev only) — a
   arquitetura já isola o domínio do DOM para isso.
2. **Paginação / virtualização** da tabela quando a lista crescer muito.
3. **Tema claro** alternável: já há tokens em `styles/tokens.css`; basta um
   `:root[data-theme="light"]` sobrescrevendo as variáveis.
4. **Máscara de telefone** e detecção de duplicados por email.
5. **Desfazer (undo)** ao excluir, via toast com ação.
6. **Versionamento de schema** na chave do storage (`crm.contacts.v1`) para migrações.
7. **Acessibilidade**: trap de foco no drawer e navegação por teclado na tabela.
