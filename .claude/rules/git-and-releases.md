# Git, commits e releases

## Commits

- Conventional Commits, em inglês: `tipo(escopo opcional): descrição no imperativo`. O hook `commit-msg` (commitlint) recusa o que fugir.
- Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `content`.
- `content` é reservado a posts, produtos e imagens (é o tipo usado pelo painel `/admin`).
- Um commit por mudança lógica. Antes de commitar: `bun run check`, `bun run lint` e `bun run test` verdes.
- Os hooks do git repetem essa conferência: `pre-commit` roda o `check` e `pre-push` roda os três (tabela em `docs/tooling.md`). Hook que falha é corrigido na causa: nunca use `--no-verify` nem push forçado.
- Nunca commite `.env`, chaves ou tokens.
- Ao fim de cada grupo de tarefas do `PLAN.md`: atualize os checklists, faça o commit e o `git push` para `origin/main`.

## Versão e release: todo commit é uma release

- **Obrigatório em toda sessão:** cada commit leva a própria versão e é publicado. No mesmo commit entram a mudança, a versão nova no `package.json` e a seção da versão no `CHANGELOG.md`. Depois do commit: tag `vX.Y.Z`, `git push origin main vX.Y.Z` e `gh release create`.
- Não existe commit `chore(release)` separado, e nenhuma tarefa está entregue com o último commit sem tag e sem GitHub Release.
- Exceção única: commits `content:` feitos pelo painel em produção. Um commit `content:` feito em uma sessão de trabalho é uma release como qualquer outro.
- Comandos, regra de versão (SemVer) e como escrever o `CHANGELOG.md`: skill `project-release`. Automação pelo GitHub Actions, hoje inativa: `docs/ci-cd.md`.
- O push na `main` publica em produção. Confira o deploy depois (`docs/workflows.md`).
