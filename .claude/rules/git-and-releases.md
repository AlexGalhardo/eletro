# Git, commits e releases

## Commits

- Conventional Commits, em inglês: `tipo(escopo opcional): descrição no imperativo`.
- Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `content`.
- `content` é reservado a posts, produtos e imagens (é o tipo usado pelo painel `/admin`). Feito pelo painel em produção, não gera release.
- Um commit por mudança lógica. Antes de commitar: `bun run check`, `bun run lint` e `bun run test` verdes.
- Nunca commite `.env`, chaves ou tokens. Nunca use `--no-verify`.
- Ao fim de cada grupo de tarefas do `PLAN.md`: atualize os checklists, faça o commit e o `git push` para `origin/main`.

## Versão e release: todo commit é uma release

- **Obrigatório em toda sessão:** cada commit leva a própria versão e é publicado. No mesmo commit entram a mudança, a versão nova no `package.json` e a seção da versão no `CHANGELOG.md`. Depois do commit: tag `vX.Y.Z`, `git push origin main vX.Y.Z` e `gh release create`.
- Passo a passo: skill `project-release` e `docs/ci-cd.md`. O cálculo é do `bun scripts/release.ts --message "<mensagem do commit>"`.
- SemVer: `feat` sobe a minor; `fix`, `perf` e os demais tipos sobem a patch. Enquanto a versão é `X.Y.Z-rc.N`, todo commit vira `rc.N+1`. Sair do release candidate (`--version 1.0.0`) é decisão do dono.
- `CHANGELOG.md` segue o Keep a Changelog. Escreva a mudança em `## [Unreleased]`, na subseção certa (`Added`, `Changed`, `Fixed`, `Removed`, `Security`); o script move o texto para a seção da versão. Sem mudança visível, a nota é o assunto do commit.
- Não existe commit `chore(release)` separado, e nenhuma tarefa está entregue com o último commit sem tag e sem GitHub Release.
- Exceção única: commits `content:` feitos pelo painel em produção.

## CI

- Os workflows ficam em `.github/workflows-disabled/` e não rodam. Não os mova para `.github/workflows/` sem o dono pedir.
