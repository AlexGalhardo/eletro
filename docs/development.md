# Desenvolvimento

## Requisitos

- Node 24 (fixado em `engines` do `package.json`)
- Bun 1.4 ou mais novo
- Python 3 com `graphifyy`, opcional, só para o grafo de conhecimento usado pelos agentes

## Primeiro uso

```bash
bun install
bun run dev
```

O site público roda sem nenhuma variável de ambiente.

### Setup automático

Os scripts em `setups/` fazem o primeiro uso inteiro e sobem o servidor com o painel pronto para a "Entrada local":

```bash
bash setups/setup-unix.sh      # macOS, Linux e WSL
bash setups/setup-windows.sh   # Windows, pelo Git Bash
```

Os dois compartilham `setups/_common.sh` e diferem só em como instalam o Bun e liberam a porta. O que fazem, nesta ordem:

| Etapa | Se der errado |
|---|---|
| Confere Node 24 | Para e diz o que instalar |
| Confere Bun 1.4 ou mais novo | Instala o Bun se faltar; atualiza se for antigo |
| `bun install` | Apaga `node_modules` e tenta de novo uma vez |
| `.env` | Cria a partir do `.env.example`; preenche `BETTER_AUTH_SECRET`, `AUTH_TEST_LOGIN_TOKEN` e `ADMIN_GITHUB_USERS` só se estiverem vazias; avisa sobre `DATABASE_URL` local, `GITHUB_REPO` sem token e `CRON_SECRET` curto |
| Porta 5173 | Encerra o processo que a ocupa; se não conseguir, o Vite usa a próxima livre |
| `bun run dev` | |

Opções: `--no-start` prepara sem subir o servidor; `PORT=5180 bash setups/...` usa outra porta.

O banco local é o PGlite embutido, criado e migrado sozinho na primeira subida: não há container a subir. Um Postgres em Docker não serve, porque com `DATABASE_URL` o servidor usa o driver HTTP do Neon (`src/lib/server/db/index.ts`), que um Postgres comum não atende.

## Scripts

| Script | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção; falha se algum post ou produto for inválido |
| `bun run preview` | Serve o build localmente |
| `bun run check` | svelte-check e TypeScript |
| `bun run lint` | Biome (código) e markdownlint (documentação) |
| `bun run format` | Aplica as correções automáticas dos dois |
| `bun run test` | Vitest: unitários e integração |
| `bun run test:e2e` | Playwright contra o build de produção |
| `bun run test:e2e:install` | Baixa o Chromium do Playwright (uma vez) |
| `bun run verify` | Tudo acima em sequência; rode antes de um push |
| `bun run db:generate` | Gera a migration SQL depois de mudar `src/lib/server/db/schema.ts` |
| `bun run db:migrate` | Aplica as migrations no banco de `DATABASE_URL` |
| `bun scripts/release.ts --dry-run` | Mostra a próxima versão e as notas (ver [`ci-cd.md`](ci-cd.md)) |
| `bun webscrapping/cli.ts <url>` | Lê um post de um site de origem e mostra o rascunho (ver [`webscrapping-modelation.md`](webscrapping-modelation.md)) |

## Variáveis de ambiente

Declaradas e validadas em `src/env.ts`; modelo em `.env.example`. Todas são opcionais.

| Grupo | Variáveis | Sem elas |
|---|---|---|
| Banco | `DATABASE_URL`, `PGLITE_DIR` | Usa um Postgres embutido (PGlite) em `.data/pglite` |
| Painel | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_GITHUB_USERS`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` | `/admin/login` lista o que falta |
| Entrada local | `AUTH_TEST_LOGIN_TOKEN` | Sem entrada local; só vale com o PGlite |
| Conteúdo | `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CONTENT_ROOT` | O painel grava nos arquivos do projeto |
| E-mail | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL` | O e-mail é só registrado no log |
| Newsletter | `CRON_SECRET` | A fila de avisos só roda pelo botão do painel |
| Importação | `MISTRAL_API_KEY` | O rascunho importado fica com o texto genérico, sem reescrita por IA |
| Google | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE`, `GOOGLE_ANALYTICS_PROPERTY_ID` | `/admin/google` lista o que falta (ver [`google-console-analytics-setup.md`](google-console-analytics-setup.md)) |

Como abrir o painel na sua máquina: seção "Abrindo o painel" do [`README.md`](../README.md). Valores de produção: [`deploy.md`](deploy.md).

No SvelteKit 3 as variáveis são importadas de `$app/env/private` (servidor) ou `$app/env/public` (navegador). Variável nova precisa ser declarada em `src/env.ts`.

## Convenções

- Formatação e lint pelo Biome: tab de largura 4, 110 colunas, aspas duplas.
- Imports internos com `#lib/...` e extensão explícita.
- Commits no padrão Conventional Commits; o hook `commit-msg` recusa o que fugir.
- Dependências com versão exata; ver `.claude/rules/dependencies.md`.
- Regras completas em `.claude/rules/`.

## SvelteKit 3: o que muda em relação ao 2

| Antes | Agora |
|---|---|
| `svelte.config.js` | Opções no plugin `sveltekit()` em `vite.config.ts` |
| `$lib/foo` | `#lib/foo.ts` (subpath imports do Node, extensão obrigatória) |
| `$app/environment` | `$app/env` |
| `$app/stores` | `$app/state` |
| `$env/static/private` | `$app/env/private`, com declaração em `src/env.ts` |
| `import type { Handle } from "@sveltejs/kit"` | `from "@sveltejs/kit/hooks"` |

Referência: <https://svelte.dev/docs/kit/migrating-to-sveltekit-3>. O MCP do Svelte está configurado em `.mcp.json`.

## Usando como template

O passo a passo está no [`README.md`](../README.md), seção "Usando como template".
