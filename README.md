# psychology-web

Frontend do consultório — interface do psicólogo para a
[psychology-api](https://github.com/erickbordin/psychology-api).

> **Status:** esqueleto vertical. Entrar, cadastrar paciente e registrar anotação
> de sessão funcionam. Agenda, série recorrente, lembretes e trilha de auditoria
> ainda não foram construídos, e o visual final não foi aplicado.

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite |
| Linguagem | React + TypeScript |
| Rotas | React Router |
| Dados | TanStack Query |
| Estilo | Tailwind v4 (tokens CSS-first) |
| Testes | Vitest + Testing Library + MSW |
| E2E | Playwright |

## Rodando localmente

**Requisitos:** Node 20 e a `psychology-api` no ar em `localhost:8080`.

```bash
npm install
npm run dev
```

O Vite proxia `/auth`, `/pacientes`, `/consultas`, `/anotacoes`, `/lembretes` e
`/auditoria` para a API. O proxy **espelha os caminhos**, sem prefixo `/api`: o
cookie de refresh é `Path=/auth`, e sob um prefixo o navegador não o enviaria.

## Sessão

O access token vive **apenas em memória**. Quem sustenta o recarregamento é o
cookie `HttpOnly` de refresh: no boot, um `POST /auth/refresh` restaura a sessão
sem que exista token persistido em lugar nenhum.

Chamadas que tomam `401` compartilham **uma** promise de renovação. A API rotaciona
o refresh a cada uso e revoga a cadeia inteira ao ver um refresh reapresentado —
renovações concorrentes seriam lidas como token roubado e derrubariam a sessão de
um usuário legítimo.

## Testes

```bash
npm test          # unitários e integração de componente, com MSW
npm run e2e       # E2E de fumaça (exige a API no ar)
```

Os handlers do MSW respondem o contrato real da API — envelope de erro,
`PagedModel`, `401`. O E2E percorre `registrar → entrar → cadastrar → anotar`
contra a API de verdade, e é o único teste que pega contrato desalinhado entre os
dois repositórios. Ele já provou o valor: pegou a tela morta em que o login caía
depois de autenticar, que nenhum teste de componente enxergava.

## Documentação

- `docs/superpowers/specs/2026-08-26-frontend-design.md` — design e alternativas rejeitadas
- `docs/superpowers/plans/2026-08-26-esqueleto-vertical.md` — plano desta entrega
