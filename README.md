# psychology-web

Frontend do consultório — interface do psicólogo para a
[psychology-api](https://github.com/erickbordin/psychology-api).

> **Status:** as cinco telas da spec estão de pé — agenda, pacientes, ficha
> (anotações, lembretes, consultas), série semanal e trilha de auditoria. Falta
> hospedar: hoje o conjunto só roda local, com a API em `localhost:8080`.

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

## Telas

| Rota | O que faz |
|---|---|
| `/agenda?de&ate` | agenda do intervalo; sem parâmetros, hoje. Agendar, remarcar, mudar status, excluir |
| `/agenda` → série | série semanal com preview das datas antes de criar, e cancelamento da série inteira |
| `/pacientes?nome` | lista com busca, cadastro, edição e exclusão |
| `/pacientes/:id/anotacoes` | registrar e ler as sessões |
| `/pacientes/:id/lembretes` | pendências do paciente, com conclusão otimista |
| `/pacientes/:id/consultas` | histórico de consultas, só leitura |
| `/auditoria?entidade&entidadeId&page` | trilha de tudo que foi criado, alterado e excluído |

Filtro e paginação vivem na URL, nunca em `useState`: recarregar preserva, o
link é compartilhável e cada parâmetro casa um a um com o da API.

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
`PagedModel`, `401`. O E2E percorre `registrar → entrar → cadastrar paciente →
anotar → lembrar → agendar → série → trilha` contra a API de verdade, e é o único
teste capaz de pegar contrato desalinhado entre os dois repositórios.

Ele já provou o valor duas vezes: pegou a tela morta em que o login caía depois
de autenticar, e pegou que este projeto lia `erros[].mensagem` onde a API manda
`erros[].erro` — com todos os mocks errados junto, então a suíte inteira ficava
verde enquanto, contra a API real, um `400` de validação não mostrava nada na
tela. Por isso existe um teste de fumaça que provoca um `400` de verdade.

## Documentação

- `docs/superpowers/specs/2026-08-26-frontend-design.md` — design e alternativas rejeitadas
- `docs/superpowers/plans/2026-08-26-esqueleto-vertical.md` — plano desta entrega
