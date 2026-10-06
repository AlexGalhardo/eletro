---
name: project-release
description: Lança uma versão do projeto - calcula o número pelos Conventional Commits, corta o CHANGELOG, cria o commit, a tag e o GitHub Release. Use quando pedirem uma release, uma nova versão, uma tag, ou um release candidate.
---

# Release

A versão sai dos commits desde a última tag `v*`, e as notas saem de `## [Unreleased]` no `CHANGELOG.md`. O trabalho de arquivo é do `scripts/release.ts`; commit, tag e publicação são passos à parte. Detalhes em `docs/ci-cd.md`.

Tag e GitHub Release são públicos e difíceis de desfazer: **só execute os passos 4 e 5 com o pedido explícito do dono.**

## 1. Pré-condições

```bash
git status                 # árvore limpa, na main, em dia com origin/main
bun run verify             # check, lint, test, build e e2e
bun scripts/release.ts --dry-run
```

O `--dry-run` mostra a próxima versão e as notas e não altera nada. Leia as notas: é o texto que vai para o GitHub Release.

- "No release": não há `feat`, `fix`, `perf` nem mudança incompatível desde a última tag. Commits `content`, `docs`, `chore`, `test`, `ci`, `build`, `style` e `refactor` não geram versão.
- "Nothing under [Unreleased]": escreva as mudanças no `CHANGELOG.md` antes.

## 2. Regra de versão

| Commits | Antes da 1.0.0 | A partir da 1.0.0 |
|---|---|---|
| Algum `feat` | minor | minor |
| Só `fix` ou `perf` | patch | patch |
| `!` ou `BREAKING CHANGE:` | minor | major |

Versão que a regra não calcula (release candidate, primeira estável) é forçada: `--version 1.0.0-rc.1`.

## 3. Cortar a versão

```bash
bun scripts/release.ts --notes "$TMPDIR/notas.md"
git diff                   # CHANGELOG.md e package.json, nada mais
```

Confira no `CHANGELOG.md`: a seção `## [X.Y.Z] - AAAA-MM-DD` criada, `## [Unreleased]` vazia, e os links do rodapé (`[Unreleased]` comparando a partir da tag nova, e a linha da versão nova).

## 4. Commit e tag

```bash
git commit --all --message "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main vX.Y.Z
```

## 5. GitHub Release

```bash
gh release create vX.Y.Z --title vX.Y.Z --notes-file "$TMPDIR/notas.md"
```

Para um release candidate, acrescente `--prerelease`.

## Depois

- `git status` limpo e `git describe --tags` mostrando a tag nova.
- Atualize o `PLAN.md` se a release fecha um grupo.

## Automático

Com os workflows ativos (`docs/ci-cd.md`), o `release.yml` faz os passos 3 a 5 depois de cada CI verde na `main`. Enquanto estiverem em `.github/workflows-disabled/`, a release é feita à mão.
