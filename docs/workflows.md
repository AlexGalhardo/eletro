# Fluxos de trabalho

Como uma tarefa anda neste projeto, do pedido à produção. Esta página diz a ordem e aponta o documento de cada etapa. Máquina ainda não preparada: [`agent-setup.md`](agent-setup.md).

## Toda sessão

1. Faça o início de sessão do [`AGENTS.md`](../AGENTS.md): skills, [`PLAN.md`](../PLAN.md), [`README.md`](README.md) desta pasta e `.claude/rules/`.
2. `git status --short --branch` e `git pull --ff-only origin main`: o painel em produção faz commits `content:` na `main`, então a sua cópia pode estar atrás.
3. Leia só o documento do assunto em que vai mexer.

## Toda mudança

| Etapa | O quê | Onde está o detalhe |
|---|---|---|
| 1 | Entender o pedido; se estiver ambíguo, perguntar antes | Skill `interview-me` |
| 2 | Mudança em vários arquivos: escrever o plano antes de editar | Skills `spec-driven-development` e `planning-and-task-breakdown` |
| 3 | API de framework: conferir na fonte, não de memória | MCP do Svelte, skill `source-driven-development` |
| 4 | Lógica nova começa pelo teste | `.claude/rules/testing.md`, [`testing.md`](testing.md) |
| 5 | Implementar o mínimo que resolve | `.claude/rules/code-style.md`, skill `ponytail` |
| 6 | `bun run check && bun run lint && bun run test` | [`tooling.md`](tooling.md#qualidade) |
| 7 | Atualizar o documento do assunto, o `PLAN.md` e o `## [Unreleased]` do `CHANGELOG.md` | [`AGENTS.md`](../AGENTS.md) |
| 8 | Release: versão, commit, tag, push, GitHub Release | [Release](#release) |
| 9 | Conferir o deploy | [Deploy](#deploy) |

Uma mudança lógica é um commit, e um commit é uma release. Duas mudanças são dois commits e duas versões.

## Por tipo de tarefa

| Tarefa | Passos próprios | Documento |
|---|---|---|
| Post novo ou editado | Skill `project-new-post`; a lista de produtos vem antes | [`content.md`](content.md) |
| Lista de produtos | Skill `project-new-product-list`; endereço real da loja nos campos de URL | [`content.md`](content.md), [`affiliate-links.md`](affiliate-links.md) |
| Mudar o formato do conteúdo | Schema, testes de integração e `content.md` juntos | `.claude/rules/content.md` |
| Componente ou página | Runes, `#lib/...` com extensão, textos de `site.config.ts` | [`architecture.md`](architecture.md) |
| Endpoint da API | Validação com zod, teste do handler, descrição OpenAPI | [`api.md`](api.md) |
| Schema do banco | Editar `schema.ts`, `bun run db:generate`, revisar o SQL, commitar a migration; no Neon, `bun run db:migrate` à mão | [`cms.md`](cms.md), [`agent-setup.md`](agent-setup.md#3-banco) |
| Variável de ambiente nova | `src/env.ts`, `.env.example`, tabela de `development.md`; se o build do Pages precisar dela, secret do repositório | [`development.md`](development.md#variáveis-de-ambiente) |
| Dependência nova | Perguntar antes; versão estável exata conferida no registry | `.claude/rules/dependencies.md` |
| Autenticação, entrada de dados, integrações | Skill `security-and-hardening`; atualizar o modelo de ameaças | [`security.md`](security.md) |
| Imagens, fontes, carregamento | Medir antes e depois | [`performance.md`](performance.md) |
| Newsletter | | [`newsletter.md`](newsletter.md) |
| Importação por scraping | | [`webscrapping-modelation.md`](webscrapping-modelation.md) |
| Documento novo em `docs/` | Entra no índice desta pasta e na tabela do `AGENTS.md` | [`README.md`](README.md) |

## Conteúdo: dois caminhos

| Caminho | Quem usa | Como chega ao site |
|---|---|---|
| Conteúdo no ar | Push na `main` | O GitHub Pages publica o HTML novo. O painel não roda nesse host. Não gera release quando o commit é `content:` |
| Arquivos em `content/`, em uma sessão de trabalho | Agentes e quem edita o código | Commit `content:` com release, como qualquer outro |

Os dois escrevem na `main`. Antes de editar conteúdo, puxe a `main`; em conflito, o que está no repositório remoto é o que o dono publicou.

## Release

Obrigatória em todo commit. Comandos e verificação em [`agent-setup.md`](agent-setup.md#8-github-e-release); regra de versão em [`ci-cd.md`](ci-cd.md) e na skill `project-release`.

1. Texto da mudança em `## [Unreleased]` (sem mudança visível, a nota é o assunto do commit).
2. `bun scripts/release.ts --message "<mensagem>" --notes <arquivo>`: versão no `package.json` e seção no `CHANGELOG.md`.
3. Commit com a mesma mensagem, tag `vX.Y.Z`, `git push origin main vX.Y.Z`, `gh release create`.

A tarefa só está entregue quando o último commit tem tag e GitHub Release.

## Deploy

O push na `main` é o deploy de produção. Não há branch de homologação: trabalho que não pode ir ao ar fica em outra branch, que ganha um deploy de preview.

1. Depois do push, confira o deploy: `vercel ls eletroradar` até `Ready`, depois a home responde 200 ([`agent-setup.md`](agent-setup.md#9-vercel)).
2. Deploy com `Error`: leia o log do build. As causas comuns são conteúdo inválido e o dashboard de links recusando o registro ([`affiliate-links.md`](affiliate-links.md)). O site continua na versão anterior.
3. Corrija com um commit novo (uma release nova). Não reescreva o histórico da `main`.

Variáveis de produção e deploy manual são do dono; um agente só mexe nelas a pedido.

## O que para o trabalho

Pare e pergunte ao dono antes de: apagar dados ou conteúdo publicado, mudar variável de produção, rodar migration no Neon, ativar os workflows de CI, acrescentar dependência, sair de uma versão `rc`, ou qualquer push que não seja um avanço simples da `main`.
