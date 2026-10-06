# Git, commits e releases

## Commits

- Conventional Commits, em inglês: `tipo(escopo opcional): descrição no imperativo`.
- Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `content`.
- `content` é reservado a posts, produtos e imagens (é o tipo usado pelo painel `/admin`). Nunca gera release.
- Um commit por mudança lógica. Antes de commitar: `bun run check`, `bun run lint` e `bun run test` verdes.
- Nunca commite `.env`, chaves ou tokens. Nunca use `--no-verify`.
- Ao fim de cada grupo de tarefas do `PLAN.md`: atualize os checklists, faça o commit e o `git push` para `origin/main`.

## Versão e changelog

- SemVer. Antes da `1.0.0`: `feat` sobe a minor, `fix` sobe a patch.
- `CHANGELOG.md` segue o Keep a Changelog. Toda mudança visível para quem usa o site ou o template entra em `## [Unreleased]`, na subseção certa (`Added`, `Changed`, `Fixed`, `Removed`, `Security`), no mesmo commit da mudança.
- A release move `Unreleased` para a nova versão, atualiza `package.json`, cria a tag `vX.Y.Z` e o GitHub Release com as notas daquela versão.

## CI

- Os workflows ficam em `.github/workflows-disabled/` e não rodam. Não os mova para `.github/workflows/` sem o dono pedir.
