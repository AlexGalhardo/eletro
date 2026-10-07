---
name: project-release
description: Publica a release de um commit - calcula a versão pela mensagem, corta o CHANGELOG, cria a tag e o GitHub Release. Use em TODO commit deste repositório (cada commit é uma release), e quando pedirem uma versão, uma tag ou a saída do release candidate.
---

# Release

**Todo commit é uma release.** Cada commit leva a própria versão no `package.json`, a própria seção no `CHANGELOG.md`, uma tag `vX.Y.Z` e um GitHub Release. Não existe commit `chore(release)` separado: os arquivos de versão entram no mesmo commit da mudança. Detalhes em `docs/ci-cd.md`.

Única exceção: commits `content:` feitos pelo painel `/admin` em produção. Eles nascem pela API do GitHub, sem sessão de trabalho, e mantêm a versão do commit anterior.

## 1. Antes do commit

Escreva a mudança em `## [Unreleased]` no `CHANGELOG.md`, na subseção certa (`Added`, `Changed`, `Fixed`, `Removed`, `Security`). Mudança sem efeito visível (`docs`, `chore`, `test`) pode ficar sem texto: o script usa o assunto do commit como nota.

```bash
bun run check && bun run lint && bun run test
bun scripts/release.ts --message "feat: descrição do commit" --dry-run   # confere versão e notas
bun scripts/release.ts --message "feat: descrição do commit" --notes "$TMPDIR/notas.md"
```

O script atualiza `package.json` e move `Unreleased` para `## [X.Y.Z] - AAAA-MM-DD`, com os links do rodapé.

## 2. Regra de versão

| Mensagem do commit | Antes da 1.0.0 | A partir da 1.0.0 |
|---|---|---|
| `feat` | minor | minor |
| `fix`, `perf` | patch | patch |
| `!` ou `BREAKING CHANGE:` | minor | major |
| `docs`, `chore`, `test`, `ci`, `build`, `style`, `refactor`, `content` | patch | patch |
| Qualquer tipo, enquanto a versão é `X.Y.Z-rc.N` | `rc.N+1` | `rc.N+1` |

Sair do release candidate é decisão do dono: `--version 1.0.0`.

## 3. Commit, tag e publicação

```bash
git add <arquivos da mudança> CHANGELOG.md package.json
git commit --message "feat: descrição do commit"      # a mesma mensagem passada ao script
git tag vX.Y.Z
git push origin main vX.Y.Z
gh release create vX.Y.Z --title vX.Y.Z --notes-file "$TMPDIR/notas.md"   # --prerelease em rc
```

Um commit por mudança lógica continua valendo: dois commits são duas versões, duas tags e dois releases.

## 4. Conferir

```bash
git describe --tags --exact-match     # a tag aponta para o HEAD
gh release view vX.Y.Z --json tagName,isPrerelease
```

Tarefa só está entregue quando o último commit tem tag e GitHub Release. Faltou publicar a de um commit antigo? `bun scripts/release.ts --section X.Y.Z --notes notas.md` devolve as notas daquela versão.

## Automático

Com os workflows ativos (`docs/ci-cd.md`), o `release.yml` cria a tag e o GitHub Release da versão do commit depois de cada CI verde na `main`. Enquanto estiverem em `.github/workflows-disabled/`, o passo 3 é feito à mão em todo commit.
