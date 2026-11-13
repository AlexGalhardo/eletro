# Fluxo de trabalho

1. Leia `AGENTS.md`, `PLAN.md`, o índice `docs/README.md` e as regras em `.agents/rules/`.
2. Crie uma branch a partir da `main` atual e entenda o fluxo afetado. Para UI, leia a skill `ui-sdk` e os docs instalados. Para API de framework, consulte a fonte oficial.
3. Escreva um critério verificável, implemente a menor mudança e acrescente testes para lógica nova.
4. Se `content/` mudou, rode `bun run post-status` e inclua `docs/post-status.md`.
5. Rode `bun run check`, `bun run lint`, `bun run test`, `bun run build` e os testes e2e relevantes.
6. Atualize o documento do assunto, o `PLAN.md` e `## [Unreleased]` no changelog.
7. Faça um commit Conventional Commit em inglês, envie a branch e abra um PR. Aguarde CI verde e integre pelo GitHub. O Pages publica a `main` após o merge.

Versões, tags e GitHub Releases são criadas somente quando o dono pedir. Veja [`ci-cd.md`](ci-cd.md).

## Conteúdo pelo painel

O editor estático de `/admin` recebe um token fine-grained do GitHub, limitado ao repositório. Salvar um arquivo ou imagem faz um commit numa branch `cms/*` e abre um PR. O token vive apenas na memória da aba. O editor aceita MDX e JSON como texto e imagens PNG, JPEG ou WebP; revise o PR e os checks antes de integrar. Rascunhos podem ser vistos em `/preview/<slug>` depois do build, quando a flag está ligada.

## Revisão

Confira no PR os arquivos alterados, os resultados do CI e a prévia visual quando a interface mudar. Se o build falhar, corrija na mesma branch. Não faça push direto na `main` nem force atualização de tags.
