# Suite de testes automatizados — CRM Contatos

Testes end-to-end (E2E) desenvolvidos com **Cypress** + **TypeScript** para o CRM de contatos hospedado em [crm-users-peach.vercel.app](https://crm-users-peach.vercel.app/).

## Objetivo

Automatizar fluxos de teste regressivo manual, reduzindo tempo de execução e aumentando a confiabilidade das entregas.

## Stack

- **Cypress** — framework de testes E2E
- **TypeScript** — tipagem estática
- **GitHub** — versionamento

## Estrutura da suite

| Arquivo | Testes | Cobertura |
|---|---|---|
| `busca.cy.ts` | 5 | Busca por nome, email, empresa, telefone e usuário inexistente |
| `filtros.cy.ts` | 2 | Filtro por status (ativo/inativo) e retorno ao estado padrão |
| `contatos.cy.ts` | 1 | Cadastro de novo contato |
| `validacoes.cy.ts` | 3 | Obrigatoriedade de campos (nome e email) |
| `editar.cy.ts` | 1 | Edição de contatos existentes |
| `excluir.cy.ts` | 2 | Exclusão com confirmação e cancelamento |
| `carga.cy.ts` | 1 | Cadastro em massa (10 contatos via loop) |

**Total: 15 testes automatizados**

## Tipos de teste aplicados

- **Testes positivos** — validam que o sistema funciona como esperado (busca, cadastro, edição)
- **Testes negativos** — validam o comportamento correto quando algo não deveria funcionar (busca sem resultado, campo obrigatório vazio)
- **Testes de regressão** — fluxos críticos que antes eram validados manualmente a cada sprint

## Como rodar

```bash
# Instalar dependências
npm install

# Abrir o Cypress no modo visual (recomendado)
npx cypress open

# Rodar todos os testes em modo headless
npm test
```

> Os testes rodam diretamente contra o ambiente hospedado — não é necessário subir o projeto localmente.

## Próximos passos

- Configurar CI/CD com GitHub Actions para execução automática a cada push
- Adicionar testes de exportação/importação de dados
- Criar comandos customizados para reduzir repetição de código
