# Setup do zero, para agentes

Roteiro para um agente de código (ou uma pessoa) levar este projeto de um clone novo até a produção. Cada passo tem o comando exato e uma verificação: só siga adiante quando a verificação passar.

Os comandos são de `bash`. No Windows, use o Git Bash. Onde aparece `$TEMP` (Windows), use `$TMPDIR` no macOS e no Linux.

Este documento é o roteiro. O detalhe de cada assunto está no documento ligado em cada passo; não repita aqui o que já está lá.

## Atalho

Os passos 1 a 4 em um comando só, com as mesmas verificações embutidas:

| Script | Onde roda | O que faz |
|---|---|---|
| `bash setups/setup-windows-local.sh` | Windows, Git Bash | Confere Node e Bun, instala as dependências, prepara o `.env`, escolhe a porta e sobe o `bun run dev` |
| `bash setups/setup-unix-local.sh` | macOS, Linux, WSL | O mesmo |
| `bash setups/setup-windows-with-docker.sh` | Windows, Git Bash | Confere o Docker, prepara o `.env`, builda a imagem de `infra/` e sobe o container |
| `bash setups/setup-unix-with-docker.sh` | macOS, Linux, WSL | O mesmo |

Opções, mensagens de erro e comportamento em [`development.md`](development.md#setup-automático). Um agente que não pode deixar um servidor rodando usa `--no-start`.

## 0. Ferramentas

| Ferramenta | Versão | Para quê | Verificação |
|---|---|---|---|
| Node | 24 (`engines` do `package.json`) | Vite e SvelteKit | `node --version` mostra `v24.` |
| Bun | 1.4.0 ou mais nova | Instalar dependências e rodar os scripts | `bun --version` |
| Git | qualquer recente | Versionar; no Windows traz o Git Bash | `git --version` |
| GitHub CLI | qualquer recente | Push, tag e GitHub Release | `gh auth status` |
| Docker com Compose v2 | opcional | Só para o passo 5 | `docker info` e `docker compose version` |
| Vercel CLI | opcional | Só para o passo 9 | `vercel --version` |

Faltou Bun: `curl -fsSL https://bun.sh/install | bash` (macOS, Linux) ou `irm bun.sh/install.ps1 | iex` no PowerShell (Windows). O resto das ferramentas do projeto vem pelo `bun install`; veja [`tooling.md`](tooling.md).

## 1. Dependências

```bash
bun install
```

Verificação: termina sem erro e `git status --short` não mostra `bun.lock` alterado. As versões são exatas; para acrescentar um pacote, siga `.claude/rules/dependencies.md`.

## 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Todas as variáveis são opcionais: o site público roda com o `.env` vazio. Preencha só o que a tarefa pede.

| Para | Variáveis | Sem elas |
|---|---|---|
| Abrir o painel `/admin` na máquina | `BETTER_AUTH_SECRET`, `AUTH_TEST_LOGIN_TOKEN`, `ADMIN_GITHUB_USERS` | `/admin/login` lista o que falta |
| Banco de produção | `DATABASE_URL` | Banco embutido (PGlite) em `.data/pglite` |
| Login pelo GitHub ou Google | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `BETTER_AUTH_URL` | Só a entrada local |
| Painel gravar no repositório | `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | Grava nos arquivos do projeto |
| E-mail e newsletter | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CRON_SECRET` | O e-mail só aparece no log |
| Links de afiliado | `LINKS_DASHBOARD_TOKEN` | O build valida os links e não envia nada |
| Importação e Google | `MISTRAL_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_*`, `GOOGLE_SEARCH_CONSOLE_SITE`, `GOOGLE_ANALYTICS_PROPERTY_ID` | Recursos desligados |

Os scripts de `setups/` criam o `.env` e preenchem com valores aleatórios `BETTER_AUTH_SECRET` e `AUTH_TEST_LOGIN_TOKEN`, e `ADMIN_GITHUB_USERS` com o usuário do `gh`. Eles nunca trocam um valor que já existe e nunca mostram um segredo.

Verificação: `git status --short` não mostra o `.env` (ele está no `.gitignore`), e depois do passo 4 `/admin/login` mostra o formulário "Entrada local" sem lista de variáveis faltando.

Regras:

- Nunca rode `vercel env pull` para criar o `.env`: ele traz as chaves de produção, e o painel local passaria a gravar no banco e no repositório de produção.
- A entrada local (`AUTH_TEST_LOGIN_TOKEN`) só vale sem `DATABASE_URL`.
- Variável nova precisa ser declarada em `src/env.ts`, descrita no `.env.example` e na tabela de [`development.md`](development.md#variáveis-de-ambiente).

## 3. Banco

| Ambiente | Banco | Migrations |
|---|---|---|
| Local, testes e Docker | PGlite, um Postgres embutido em `.data/pglite` | Aplicadas sozinhas na primeira conexão |
| Produção | Neon, pela `DATABASE_URL` | Aplicadas à mão |

Não existe container de banco: com `DATABASE_URL` o servidor fala com o Neon pelo driver HTTP, que um Postgres comum não atende.

```bash
bun run db:generate                                   # depois de mudar src/lib/server/db/schema.ts: gera o SQL em drizzle/
DATABASE_URL="postgres://..." bun run db:migrate      # aplica no Neon; nunca no build
```

Verificação local: depois de entrar no painel uma vez, a pasta `.data/pglite` existe. Verificação da migration: `bun run test` passa (os testes de integração aplicam todas as migrations em um banco em memória) e o `db:migrate` termina sem erro. Detalhes em [`cms.md`](cms.md).

## 4. Rodar na máquina

```bash
bun run dev
```

Verificação, em outro terminal:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/              # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/admin/login   # 200
```

Para entrar no painel: `http://localhost:5173/admin`, formulário "Entrada local", com um usuário de `ADMIN_GITHUB_USERS` e o valor de `AUTH_TEST_LOGIN_TOKEN`.

Porta ocupada: `bun run dev --port 5180`. Os scripts de `setups/` escolhem a próxima porta livre sozinhos, ou falham com mensagem clara se a porta foi pedida com `PORT=`.

## 5. Rodar em Docker

```bash
bash setups/setup-windows-with-docker.sh    # ou setup-unix-with-docker.sh
```

O script builda `infra/Dockerfile` e sobe `infra/docker-compose.yml`: o build de produção servido em `http://localhost:8080`, com o banco embutido em um volume. O build da imagem não recebe `LINKS_DASHBOARD_TOKEN` nem `VERCEL_ENV`, então só valida os links de afiliado e não envia nada.

Verificação: o script termina com `Container ... Healthy` e imprime os endereços.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/    # 200
docker compose --file infra/docker-compose.yml ps                  # STATUS com (healthy)
docker compose --file infra/docker-compose.yml down                # para; --volumes apaga também o banco
```

O que é e o que não é: [`development.md`](development.md#docker). A produção não usa Docker.

## 6. Testes

```bash
bun run check              # svelte-check e TypeScript
bun run lint               # Biome e markdownlint
bun run test               # Vitest: unitários e integração
bun run test:e2e:install   # uma vez: baixa o Chromium do Playwright
bun run test:e2e           # builda, sobe o preview na porta 4173 e testa
```

Verificação: cada comando termina com código 0. Os três primeiros são também os hooks do git (`pre-commit` roda o `check`; `pre-push` roda os três), então um commit ou push que falha neles não sai. Nenhum teste usa rede ou segredo. Detalhes em [`testing.md`](testing.md).

## 7. Conteúdo

| Tarefa | Como |
|---|---|
| Post novo ou editado | Skill `project-new-post` (`.claude/skills/project-new-post/SKILL.md`) |
| Lista de produtos | Skill `project-new-product-list` |
| Formato dos arquivos | [`content.md`](content.md) e `.claude/rules/content.md` |
| Pelo navegador | Painel `/admin` (passo 4) |

Verificação:

```bash
bun run test        # os testes de integração leem todo o conteúdo real
bun run sync-links  # valida os links de afiliado; sem a chave, não envia nada
```

Um post inválido falha no teste antes de falhar no deploy.

## 8. GitHub e release

```bash
gh auth status                  # logado em github.com
git remote --verbose            # origin aponta para github.com/AlexGalhardo/eletroradar.com.br
```

Faltou o remoto: `git remote add origin https://github.com/AlexGalhardo/eletroradar.com.br.git`.

Todo commit é uma release, sem exceção para `docs` e `chore`. A sequência, depois de escrever a mudança em `## [Unreleased]` no `CHANGELOG.md` e de atualizar o `PLAN.md`:

```bash
bun run check && bun run lint && bun run test
bun scripts/release.ts --message "docs: describe the change" --notes "$TEMP/notes.md"
git add --all
git commit --message "docs: describe the change"     # a mesma mensagem passada ao script
git tag vX.Y.Z                                       # a versão que o script imprimiu
git push origin main vX.Y.Z
gh release create vX.Y.Z --repo AlexGalhardo/eletroradar.com.br --title vX.Y.Z --notes-file "$TEMP/notes.md"
```

Verificação:

```bash
git describe --tags --exact-match                       # a tag está no HEAD
gh release view vX.Y.Z --json tagName,url               # o release existe
git status --short --branch                             # nada pendente, main igual a origin/main
```

Regra de versão e casos especiais: skill `project-release` e [`ci-cd.md`](ci-cd.md). Nunca use `--no-verify` nem push forçado.

## 9. Vercel

O site em produção é o projeto `eletroradar.com.br` na Vercel. O push na `main` publica em produção; não existe passo de deploy manual. Criar o projeto do zero (domínio, Neon, OAuth, Resend): [`setup-vercel.md`](setup-vercel.md).

```bash
vercel whoami                                       # logado; senão, vercel login
vercel link --yes --project eletroradar.com.br      # liga a pasta ao projeto
vercel env ls production                            # nomes das variáveis cadastradas
vercel env add NOME_DA_VARIAVEL production          # pede o valor; uma variável por vez
```

Verificação do vínculo: `.vercel/project.json` existe (a pasta `.vercel` fica fora do git).

Variável nova ou alterada só vale em um deploy novo. A lista do que cadastrar está em [`deploy.md`](deploy.md#6-variáveis-de-ambiente). Não cadastre `AUTH_TEST_LOGIN_TOKEN`, `PGLITE_DIR` nem `CONTENT_ROOT`.

Conferir o deploy de um push:

```bash
vercel ls eletroradar.com.br                        # o deploy mais novo, com o status (Building, Ready, Error)
vercel inspect <url-do-deploy>                      # detalhes; com --logs, o log do build
curl -s -o /dev/null -w '%{http_code}\n' https://eletroradar.com.br/    # 200
```

O deploy leva de 2 a 4 minutos. `Error` quase sempre é conteúdo inválido ou o dashboard de links recusando o registro: leia o log do build. Com o MCP da Vercel disponível, as mesmas leituras saem por ele (listar os deploys do projeto, ler os eventos do build); a CLI é o caminho padrão.

Um agente não muda variável de produção nem dispara deploy manual (`vercel --prod`) sem o dono pedir.

## 10. Dashboard de links

Os botões de loja passam por um dashboard externo, definido em `site.linksDashboardUrl`. A ligação é uma variável só:

```bash
vercel env add LINKS_DASHBOARD_TOKEN production     # a chave do dashboard (o LINKS_API_KEY dele)
```

Não há cadastro do site no dashboard: o build de produção se identifica pelo endereço do site, e o dashboard cria o projeto no primeiro build que chega com a chave. Um site novo precisa estar no ar antes de receber a chave, porque o dashboard só aceita links de um site que responde.

| Build | Com a chave | Sem a chave |
|---|---|---|
| Produção na Vercel (`VERCEL_ENV=production`) | Envia o catálogo; falha se o dashboard recusar | Falha |
| Local, Docker, testes, preview | Envia o catálogo | Valida e não envia nada |

Verificação: no log do build de produção aparece `Links sincronizados com <dashboard>: N produtos (...)`. Localmente, `bun run sync-links` imprime `LINKS_DASHBOARD_TOKEN não definido: N produtos validados, nada enviado.`

Por isso a chave não vai no `.env` local. Contrato, identidade dos produtos e limites: [`affiliate-links.md`](affiliate-links.md).

## Depois do setup

Como trabalhar no dia a dia, tarefa por tarefa: [`workflows.md`](workflows.md).
