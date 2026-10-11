# Desenvolvimento

## Requisitos

- Node 24 (fixado em `engines` do `package.json`)
- Bun 1.4 ou mais novo
- Docker com Compose v2, opcional, só para rodar o build de produção em container
- Python 3 com `graphifyy`, opcional, só para o grafo de conhecimento usado pelos agentes

## Primeiro uso

```bash
bun install
bun run dev
```

O site público roda sem nenhuma variável de ambiente.

### Setup automático

Os scripts em `setups/` fazem o primeiro uso inteiro e sobem o projeto com o painel pronto para a "Entrada local":

```bash
bash setups/setup-unix-local.sh            # macOS, Linux e WSL: servidor de desenvolvimento
bash setups/setup-windows-local.sh         # Windows, pelo Git Bash: servidor de desenvolvimento
bash setups/setup-unix-with-docker.sh      # macOS, Linux e WSL: build de produção em Docker
bash setups/setup-windows-with-docker.sh   # Windows, pelo Git Bash: build de produção em Docker
```

Os quatro são finos: definem a plataforma e chamam as funções de `setups/_common.sh`. Todos podem ser rodados de novo sem efeito colateral, param com código diferente de zero e uma mensagem `[error]` no primeiro problema, e nunca mostram o valor de um segredo.

O que os `-local` fazem, nesta ordem:

| Etapa | Se der errado |
|---|---|
| Confere Node 24 | Para e diz como instalar |
| Confere Bun 1.4.0 ou mais novo | Para e diz como instalar ou atualizar |
| `bun install` | Para com o erro do Bun |
| `.env` | Cria a partir do `.env.example`; preenche `BETTER_AUTH_SECRET` e `AUTH_TEST_LOGIN_TOKEN` com valores aleatórios e `ADMIN_GITHUB_USERS` com o usuário do `gh`, só se estiverem vazias; avisa sobre `DATABASE_URL` definida, `GITHUB_REPO` sem token e `CRON_SECRET` curto |
| Porta 5173 | Ocupada: usa a próxima livre e avisa. Com `PORT=` definido, para em vez de trocar |
| `bun run dev` | |

O que os `-with-docker` fazem: conferem `docker`, `docker compose` e se o daemon está rodando (dizendo o que instalar ou iniciar), preparam o `.env` do mesmo jeito, escolhem a porta a partir da 8080, buildam a imagem e sobem o container, esperando ele ficar saudável. Não exigem Node nem Bun na máquina.

Opções, nos quatro:

| Opção | Efeito |
|---|---|
| `--no-start` ou `SETUP_NO_START=1` | Prepara tudo sem subir o servidor (nos de Docker, builda a imagem e não sobe o container) |
| `PORT=5180 bash setups/...` | Usa essa porta e falha se ela estiver ocupada |
| `--help` | Mostra as opções |

O banco local é o PGlite embutido, criado e migrado sozinho na primeira subida: não há container de banco. Um Postgres em Docker não serve, porque com `DATABASE_URL` o servidor usa o driver HTTP do Neon (`src/lib/server/db/index.ts`), que um Postgres comum não atende.

Roteiro completo de um clone novo até a produção, com a verificação de cada passo: [`agent-setup.md`](agent-setup.md).

### Docker

Os arquivos ficam em `infra/`, e o contexto do build é a raiz do repositório (por isso o `.dockerignore` está na raiz).

| Arquivo | O que faz |
|---|---|
| `infra/Dockerfile` | Parte de `oven/bun` com tag fixa, acrescenta o Node 24, roda `bun install --frozen-lockfile` e `bun run build`, e serve com `vite preview` na porta 4173, como usuário sem privilégio |
| `infra/docker-compose.yml` | Publica a porta só em `127.0.0.1` (padrão 8080, variável `APP_PORT`), passa o `.env` da raiz ao container e guarda o banco embutido em um volume |

```bash
docker compose --file infra/docker-compose.yml up --build --detach --wait   # o que o script de setup roda
docker compose --file infra/docker-compose.yml logs --follow
docker compose --file infra/docker-compose.yml down                         # --volumes apaga também o banco
```

- O build da imagem não recebe `LINKS_DASHBOARD_TOKEN` nem `VERCEL_ENV`: o `scripts/sync-links.ts` só valida os links de afiliado e não envia nada ao dashboard. O `.env` nunca entra na imagem; ele só é lido quando o container sobe.
- É o build de produção, o mesmo artefato dos testes e2e. O site público é estático: conteúdo salvo pelo painel dentro do container fica só no container e não aparece no site sem um build novo. Para editar conteúdo, use o servidor de desenvolvimento.
- A porta padrão é a 8080 para não colidir com a 4173, que os testes e2e usam na máquina.
- A produção não usa Docker: roda na Vercel ([`deploy.md`](deploy.md)).

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
| Links de afiliado | `LINKS_DASHBOARD_TOKEN` | O build só valida o catálogo de links e não envia nada ao dashboard |
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
