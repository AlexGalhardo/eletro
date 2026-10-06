# CI/CD e releases

Os workflows do GitHub Actions estão escritos e testados, mas **inativos**: ficam em `.github/workflows-disabled/`, e o GitHub só executa o que está em `.github/workflows/`. Eles continuam assim até o billing do GitHub ser corrigido e o dono pedir a ativação.

## O que cada workflow faz

| Arquivo | Quando roda | O que faz |
|---|---|---|
| `ci.yml` | Push em `main` e todo pull request | Job `quality`: `bun install --frozen-lockfile`, `bun run lint`, `bun run check`, `bun run test`, `bun run build`. Job `e2e` (depois do `quality`): instala o Chromium e roda `bun run test:e2e`; se falhar, guarda o relatório do Playwright por 7 dias |
| `release.yml` | Quando o `CI` termina com sucesso em um push na `main` | Roda `scripts/release.ts`. Se houver versão nova: atualiza `CHANGELOG.md` e `package.json`, faz o commit `chore(release): vX.Y.Z`, cria a tag e o GitHub Release com as notas da versão |

- Nenhum dos dois precisa de segredo cadastrado: os testes não usam rede nem chave, e a release usa o token que o próprio Actions fornece.
- As actions de terceiros estão fixadas pelo hash do commit (com a versão no comentário), e Bun e Node têm versão fixa.
- O push feito pela release usa o token do workflow, que não dispara outro workflow. Não há como entrar em laço.

## Regra de versão

`scripts/release.ts` lê os commits desde a última tag `v*`:

| Commits desde a última tag | Antes da 1.0.0 | A partir da 1.0.0 |
|---|---|---|
| Algum `feat` | minor | minor |
| Só `fix` ou `perf` | patch | patch |
| Mudança incompatível (`!` ou `BREAKING CHANGE:`) | minor | major |
| Só `content`, `docs`, `chore`, `test`, `ci`, `build`, `style`, `refactor` | sem release | sem release |

As notas da versão são o texto que está em `## [Unreleased]` no `CHANGELOG.md`. Com `Unreleased` vazio o script para com erro: escreva as mudanças antes.

## Release à mão

```bash
bun scripts/release.ts --dry-run            # mostra a próxima versão e as notas, não altera nada
bun scripts/release.ts --notes notas.md     # atualiza CHANGELOG.md e package.json e grava as notas
git commit --all --message "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main vX.Y.Z
gh release create vX.Y.Z --title vX.Y.Z --notes-file notas.md
```

Para uma versão que a regra não calcula (release candidate, primeira estável): `bun scripts/release.ts --version 1.0.0-rc.1`.

## Como ativar

1. Corrija o billing do GitHub (Settings → Billing and plans).
2. Mova os arquivos e faça o commit:

   ```bash
   git mv .github/workflows-disabled .github/workflows
   git commit --message "ci: enable the workflows"
   git push
   ```

3. Em Settings → Actions → General → Workflow permissions, deixe "Read repository contents" como padrão. O `release.yml` pede a permissão de escrita só no job que precisa.
4. Se a `main` tiver proteção de branch, permita que o `github-actions[bot]` faça push nela, ou a release falha no `git push`.
5. Atualize a regra de CI no `AGENTS.md`, em `.claude/rules/git-and-releases.md` e esta página.

## Como validar sem ativar

| Verificação | Comando |
|---|---|
| Sintaxe e expressões dos workflows | `actionlint .github/workflows-disabled/*.yml` |
| Jobs do CI em contêiner, como no GitHub | `act push --workflows .github/workflows-disabled/ci.yml` (precisa de Docker) |
| Passos do CI em um clone limpo | os comandos do job `quality`, um a um, em `git clone` novo |
| Versão e notas que a release geraria | `bun scripts/release.ts --dry-run` |

`actionlint` e `act` não são dependências do projeto: instale as ferramentas à parte.

## Deploy

O deploy não passa pelo Actions: Vercel e Netlify publicam a cada push na `main`, inclusive os commits `content:` feitos pelo painel. O passo a passo da hospedagem fica para `docs/deploy.md`.
