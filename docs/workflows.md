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
| 6 | Se `content/` mudou: `bun run post-status` e commitar `docs/post-status.md` | [`content.md`](content.md#status-dos-posts) |
| 7 | `bun run check && bun run lint && bun run test` | [`tooling.md`](tooling.md#qualidade) |
| 8 | Atualizar o documento do assunto, o `PLAN.md` e o `## [Unreleased]` do `CHANGELOG.md` | [`AGENTS.md`](../AGENTS.md) |
| 9 | Release: versão, commit, tag, push, GitHub Release | [Release](#release) |
| 10 | Conferir o deploy | [Deploy](#deploy) |

Uma mudança lógica é um microcommit, e um commit é uma release. Duas mudanças são dois commits e duas versões. Não junte assuntos diferentes no mesmo commit e não esmague um commit já publicado: a linha do changelog abre esse commit.

## Por tipo de tarefa

| Tarefa | Passos próprios | Documento |
|---|---|---|
| Post novo ou editado | Skill `project-new-post`; a lista de produtos vem antes; revisar em `/preview/<slug>`; depois `bun run post-status` | [`content.md`](content.md), [`feature-flags.md`](feature-flags.md) |
| Lista de produtos | Skill `project-new-product-list`; endereço real da loja nos campos de URL; depois `bun run post-status` | [`content.md`](content.md), [`affiliate-links.md`](affiliate-links.md) |
| Feature flag | Entrada em `content/flags.json` e em `flagDefaults`; se for de navegador, em `BROWSER_FLAGS` | [`feature-flags.md`](feature-flags.md) |
| Mudar o formato do conteúdo | Schema, testes de integração e `content.md` juntos | `.claude/rules/content.md` |
| Componente ou página | Runes, `#lib/...` com extensão, textos de `site.config.ts` | [`architecture.md`](architecture.md) |
| Endpoint da API | Validação com zod, teste do handler, descrição OpenAPI | [`api.md`](api.md) |
| Schema do banco | Editar `schema.ts`, `bun run db:generate`, revisar o SQL, commitar a migration; no Neon, `bun run db:migrate` à mão | [`cms.md`](cms.md), [`agent-setup.md`](agent-setup.md#3-banco) |
| Variável de ambiente nova | `src/env.ts`, `.env.example`, tabela de `development.md`; se o build do Pages precisar dela, secret do repositório | [`development.md`](development.md#variáveis-de-ambiente) |
| Dependência nova | Perguntar antes; versão estável exata conferida no registry | `.claude/rules/dependencies.md` |
| Autenticação, entrada de dados, integrações | Skill `security-and-hardening`; atualizar o modelo de ameaças | [`security.md`](security.md) |
| Imagens, fontes, carregamento | Medir antes e depois | [`performance.md`](performance.md) |
| Newsletter | | [`newsletter.md`](newsletter.md) |
| Importação por scraping | Lote: `bun webscrapping/batch.ts` lista o que falta; os rascunhos são reescritos depois | [`webscrapping-modelation.md`](webscrapping-modelation.md) |
| Documento novo em `docs/` | Entra no índice desta pasta e na tabela do `AGENTS.md` | [`README.md`](README.md) |

## Conteúdo: dois caminhos

| Caminho | Quem usa | Como chega ao site |
|---|---|---|
| Conteúdo no ar | Push na `main` | O GitHub Pages publica o HTML novo. O painel não roda nesse host. Não gera release quando o commit é `content:` |
| Arquivos em `content/`, em uma sessão de trabalho | Agentes e quem edita o código | Commit `content:` com release, como qualquer outro |

Os dois escrevem na `main`. Antes de editar conteúdo, puxe a `main`; em conflito, o que está no repositório remoto é o que o dono publicou.

Rascunho não sai no site, mas pode ser revisado antes de publicar: abra `/preview/<slug>` ou use `/admin/flags` (ver [`feature-flags.md`](feature-flags.md)). Os commits `content:` do painel não regeneram [`post-status.md`](post-status.md); a próxima sessão roda `bun run post-status`.

## Microcommits

O histórico fica em commits pequenos. Uma linha do changelog não descreve um pacote de mudanças soltas: ela descreve o microcommit que a introduziu e aponta para ele.

Cada linha nova de uma release termina assim:

```markdown
- **escopo:** Frase da mudança ([abcdef1](https://github.com/AlexGalhardo/eletro/commit/abcdef1<hash completo>))
```

- O hash entre colchetes tem 7 caracteres. A URL usa o hash completo de `git rev-parse HEAD`.
- O negrito é o escopo do Conventional Commit. Sem escopo, use o tipo (`feat`, `fix`, `docs`, `content`).
- Várias linhas podem apontar para o mesmo commit quando ele tem mais de um efeito visível.
- Vários microcommits na mesma release: uma linha por commit, cada uma com o próprio link.
- O `scripts/release.ts` recusa cortar a versão se alguma linha de lista não tiver esse link. Commits desde a tag anterior recebem o link sozinhos; se a mudança ainda não foi commitada, não há hash para apontar.

## Release

Obrigatória em todo commit. Comandos e verificação em [`agent-setup.md`](agent-setup.md#8-github-e-release); regra de versão em [`ci-cd.md`](ci-cd.md) e na skill `project-release`.

1. Microcommit do código. Anote o hash: `git rev-parse HEAD` e `git rev-parse --short=7 HEAD`.
2. Linha em `## [Unreleased]` já com o link desse microcommit (sem mudança visível, a nota é o assunto do commit, também linkada).
3. `bun scripts/release.ts --message "<mensagem>" --notes <arquivo>`: versão no `package.json` e seção no `CHANGELOG.md`.
4. Commit da release com a mesma mensagem, tag `vX.Y.Z`, `git push origin main vX.Y.Z`, `gh release create`.

A tarefa só está entregue quando o último commit tem tag e GitHub Release. A linha publicada abre o microcommit.

## Deploy

O push na `main` publica o site no GitHub Pages pelo workflow `.github/workflows/pages.yml`. Não há branch de homologação: trabalho que não pode ir ao ar fica em outra branch.

1. Depois do push, confira o workflow `pages` até ficar verde. A home `https://example.com/` responde 200 com `Server: GitHub.com` ([`deploy.md`](deploy.md)).
2. Deploy com falha: leia o log do job de build. As causas comuns são conteúdo inválido e o dashboard de links recusando o registro ([`affiliate-links.md`](affiliate-links.md)). O site continua na versão anterior.
3. Corrija com um commit novo (uma release nova). Não reescreva o histórico da `main`.

Variáveis de produção e deploy manual são do dono; um agente só mexe nelas a pedido.

## O que para o trabalho

Pare e pergunte ao dono antes de: apagar dados ou conteúdo publicado, mudar variável de produção, rodar migration no Neon, ativar os workflows de CI, acrescentar dependência, sair de uma versão `rc`, ou qualquer push que não seja um avanço simples da `main`.
