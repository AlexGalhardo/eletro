# Ferramentas

O que cada ferramenta do projeto faz, onde está a configuração e qual comando a aciona. Os scripts do `package.json` estão listados em [`development.md`](development.md#scripts); a escolha de cada biblioteca do site está em [`architecture.md`](architecture.md#stack).

## Execução

| Ferramenta | Papel | Configuração |
|---|---|---|
| Bun | Gerenciador de pacotes e executor dos scripts (`bun install`, `bun run`, `bunx`) | `bunfig.toml` (força versão exata), `bun.lock` |
| Node 24 | Onde o Astro, o Vite e os testes rodam | `engines` no `package.json` |
| Astro 7.4 | Servidor de desenvolvimento, build e preview | `astro.config.ts` (não existe `svelte.config.js` nem `vite.config.ts`) |

Não use npm, yarn nem pnpm: o lockfile é o do Bun.

## Qualidade

| Ferramenta | Verifica | Comando | Configuração |
|---|---|---|---|
| svelte-check e TypeScript 6 | Tipos em `.ts` e `.svelte` | `bun run check` | `tsconfig.json` |
| Biome 2 | Formatação e lint do código | `bun run lint:code`, `bun run format` | `biome.json`, `.editorconfig` |
| markdownlint-cli2 | Documentação, regras e skills do projeto | `bun run lint:md` | `.markdownlint-cli2.jsonc` |
| Vitest | Testes unitários e de integração | `bun run test` | `vitest.config.ts` |
| Playwright | Smoke e e2e contra o build de produção | `bun run test:e2e` | `playwright.config.ts` |
| commitlint | Mensagem no padrão Conventional Commits | hook `commit-msg` | `commitlint.config.js` |

Não existem ESLint nem Prettier no projeto, e não devem entrar. O que cada tipo de teste cobre está em [`testing.md`](testing.md).

## Hooks do git

Instalados pelo husky no `bun install` (script `prepare`), em `.husky/`:

| Hook | Roda | Se falhar |
|---|---|---|
| `pre-commit` | `bun run check` | O commit não é criado |
| `commit-msg` | commitlint | O commit não é criado |
| `pre-push` | `bun run check && bun run lint && bun run test` | O push não sai |

Hook que falha é corrigido na causa. `--no-verify` é proibido (`.claude/rules/git-and-releases.md`).

## Banco

| Ferramenta | Papel | Comando |
|---|---|---|
| Drizzle ORM | Schema e consultas (`src/lib/server/db/`) | |
| drizzle-kit | Gera e aplica migrations em `drizzle/` | `bun run db:generate`, `bun run db:migrate` (`drizzle.config.ts`) |
| PGlite | Postgres embutido do desenvolvimento, dos testes e do Docker | sobe sozinho |

## Scripts próprios

| Arquivo | O que faz | Documento |
|---|---|---|
| `scripts/release.ts` | Calcula a versão pela mensagem do commit e corta o `CHANGELOG.md` | [`ci-cd.md`](ci-cd.md) |
| `scripts/check-env.ts` | Confere as variáveis de ambiente (regras em `src/lib/env-check.ts`); roda no começo de todo build | [`development.md`](development.md#conferência-no-build) |
| `scripts/sync-links.ts` | Valida os links de afiliado e os envia ao dashboard; roda antes de todo build | [`affiliate-links.md`](affiliate-links.md) |
| `scripts/cover-variants.ts` | Gera as cópias redimensionadas das capas antes do `astro build` | [`performance.md`](performance.md) |
| `webscrapping/cli.ts` | Lê um post de um site de origem e mostra o rascunho | [`webscrapping-modelation.md`](webscrapping-modelation.md) |
| `webscrapping/batch.ts` | Lista ou importa em lote os posts do eletrosinter que faltam, em sequência e com pausa | [`webscrapping-modelation.md`](webscrapping-modelation.md#importação-em-lote) |
| `scripts/post-status.ts` | Gera `docs/post-status.md` (status, links e pendentes de cada post); a lógica fica em `src/lib/content/post-status.ts`. O teste de integração falha se o arquivo estiver desatualizado | [`content.md`](content.md#status-dos-posts) |
| `setups/*.sh` | Preparam a máquina e sobem o projeto, local ou em Docker | [`development.md`](development.md#setup-automático) |

## Docker

| Arquivo | Papel |
|---|---|
| `infra/Dockerfile` | Imagem `oven/bun` com tag fixa e o Node 24: instala, roda `bun run build` e serve com `astro preview` |
| `infra/docker-compose.yml` | Sobe a imagem com o `.env` da raiz e um volume para o banco embutido |
| `.dockerignore` | Fica na raiz porque a raiz é o contexto do build; deixa de fora `.env`, `.git`, `node_modules` e o que não entra na imagem |

Uso e limites em [`development.md`](development.md#docker). O Docker serve para rodar e conferir o build de produção na máquina; a produção roda no GitHub Pages.

## Linha de comando externa

| Ferramenta | Uso neste projeto | Documento |
|---|---|---|
| `gh` | Push autenticado, tag, GitHub Release e o workflow `pages` que publica a produção | [`ci-cd.md`](ci-cd.md), [`deploy.md`](deploy.md) |
| `docker` | Rodar o build de produção em container | [`development.md`](development.md#docker) |
| `actionlint`, `act` | Validar os workflows inativos; não são dependências do projeto | [`ci-cd.md`](ci-cd.md#como-validar-sem-ativar) |

## Ferramentas dos agentes

| O quê | Onde | Para quê |
|---|---|---|
| MCP do Svelte | `.mcp.json` | Documentação atual do Svelte 5, usado nas ilhas. O site é Astro 7.4, sem SvelteKit |
| Skills de engenharia | `.claude/skills/` | Carregadas conforme a tarefa; a lista e a ordem estão no [`AGENTS.md`](../AGENTS.md) |
| Skills do projeto | `.claude/skills/project-*/` | `project-new-post`, `project-new-product-list`, `project-release` |
| Regras | `.claude/rules/` | Estilo, conteúdo, dependências, git e testes |
| Agentes especializados | `.claude/agents/` | `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor` |
| Checklists | `.claude/references/` | Segurança, desempenho, acessibilidade, observabilidade, testes, orquestração de agentes, definição de pronto |
| graphify | `graphify-out/` (fora do git) | Grafo de conhecimento do código; opcional, exige Python. Gerar e atualizar: `python -m graphify update .` (ver [`AGENTS.md`](../AGENTS.md#grafo-de-conhecimento-opcional)) |

## Acrescentar ou atualizar uma ferramenta

Vale a regra das dependências: versão estável mais nova, exata, conferida no registry (`.claude/rules/dependencies.md`). Ferramenta nova entra nesta página e, se tiver comando, na tabela de scripts de [`development.md`](development.md#scripts).
