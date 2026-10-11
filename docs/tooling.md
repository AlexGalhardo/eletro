# Ferramentas

O que cada ferramenta do projeto faz, onde está a configuração e qual comando a aciona. Os scripts do `package.json` estão listados em [`development.md`](development.md#scripts); a escolha de cada biblioteca do site está em [`architecture.md`](architecture.md#stack).

## Execução

| Ferramenta | Papel | Configuração |
|---|---|---|
| Bun | Gerenciador de pacotes e executor dos scripts (`bun install`, `bun run`, `bunx`) | `bunfig.toml` (força versão exata), `bun.lock` |
| Node 24 | Onde o Vite, o SvelteKit e os testes rodam | `engines` no `package.json` |
| Vite 8 e SvelteKit 3 | Servidor de desenvolvimento, build e preview | `vite.config.ts` (não existe `svelte.config.js`) |

Não use npm, yarn nem pnpm: o lockfile é o do Bun.

## Qualidade

| Ferramenta | Verifica | Comando | Configuração |
|---|---|---|---|
| svelte-check e TypeScript 6 | Tipos em `.ts` e `.svelte` | `bun run check` | `tsconfig.json` |
| Biome 2 | Formatação e lint do código | `bun run lint:code`, `bun run format` | `biome.json`, `.editorconfig` |
| markdownlint-cli2 | Documentação, regras e skills do projeto | `bun run lint:md` | `.markdownlint-cli2.jsonc` |
| Vitest | Testes unitários e de integração | `bun run test` | bloco `test` de `vite.config.ts` |
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
| `scripts/cover-variants.ts` | Plugin do Vite que gera as cópias redimensionadas das capas | [`performance.md`](performance.md) |
| `webscrapping/cli.ts` | Lê um post de um site de origem e mostra o rascunho | [`webscrapping-modelation.md`](webscrapping-modelation.md) |
| `setups/*.sh` | Preparam a máquina e sobem o projeto, local ou em Docker | [`development.md`](development.md#setup-automático) |

## Docker

| Arquivo | Papel |
|---|---|
| `infra/Dockerfile` | Imagem `oven/bun` com tag fixa e o Node 24: instala, roda `bun run build` e serve com `vite preview` |
| `infra/docker-compose.yml` | Sobe a imagem com o `.env` da raiz e um volume para o banco embutido |
| `.dockerignore` | Fica na raiz porque a raiz é o contexto do build; deixa de fora `.env`, `.git`, `node_modules` e o que não entra na imagem |

Uso e limites em [`development.md`](development.md#docker). O Docker serve para rodar e conferir o build de produção na máquina; a produção roda na Vercel.

## Linha de comando externa

| Ferramenta | Uso neste projeto | Documento |
|---|---|---|
| `gh` | Push autenticado, tag e GitHub Release de todo commit | [`ci-cd.md`](ci-cd.md) |
| `vercel` | Ligar a pasta ao projeto, cadastrar variáveis, ler deploys e logs | [`agent-setup.md`](agent-setup.md#9-vercel), [`setup-vercel.md`](setup-vercel.md) |
| `docker` | Rodar o build de produção em container | [`development.md`](development.md#docker) |
| `actionlint`, `act` | Validar os workflows inativos; não são dependências do projeto | [`ci-cd.md`](ci-cd.md#como-validar-sem-ativar) |

## Ferramentas dos agentes

| O quê | Onde | Para quê |
|---|---|---|
| MCP do Svelte | `.mcp.json` | Documentação atual do SvelteKit 3 e do Svelte 5, mais novos que o treino da maioria dos modelos |
| Skills de engenharia | `.claude/skills/` | Carregadas conforme a tarefa; a lista e a ordem estão no [`AGENTS.md`](../AGENTS.md) |
| Skills do projeto | `.claude/skills/project-*/` | `project-new-post`, `project-new-product-list`, `project-release` |
| Regras | `.claude/rules/` | Estilo, conteúdo, dependências, git e testes |
| Agentes especializados | `.claude/agents/` | `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor` |
| Checklists | `.claude/references/` | Segurança, desempenho, acessibilidade, testes, definição de pronto |
| graphify | `graphify-out/` (fora do git) | Grafo de conhecimento do código; opcional, exige Python |

## Acrescentar ou atualizar uma ferramenta

Vale a regra das dependências: versão estável mais nova, exata, conferida no registry (`.claude/rules/dependencies.md`). Ferramenta nova entra nesta página e, se tiver comando, na tabela de scripts de [`development.md`](development.md#scripts).
