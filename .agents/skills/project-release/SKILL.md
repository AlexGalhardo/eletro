---
name: project-release
description: Prepare e publique uma versão somente depois de um pedido explícito do dono.
---

# Release sob pedido

1. Confirme a versão pedida e confira as tags e releases existentes. Nunca mova uma tag já publicada.
2. Em branch `release/vX.Y.Z`, atualize a versão em `package.json` e `bun.lock` e mova as notas relevantes de `## [Unreleased]` para uma seção datada do `CHANGELOG.md`.
3. Rode `bun run check`, `bun run lint`, `bun run test`, `bun run build` e `bun run test:e2e`.
4. Abra PR com título Conventional Commit. Espere os checks verdes e faça o merge pelo GitHub.
5. Depois do merge, crie a tag no commit integrado, envie a tag e publique o GitHub Release com as notas verificadas.

Nenhum passo desta skill é executado em commits comuns. Veja `docs/ci-cd.md`.
