# CI/CD e releases

Os workflows do GitHub Actions estão escritos e testados, mas **inativos**: ficam em `.github/workflows-disabled/`, e o GitHub só executa o que está em `.github/workflows/`. Eles continuam assim até o billing do GitHub ser corrigido e o dono pedir a ativação.

## O que cada workflow faz

| Arquivo | Quando roda | O que faz |
|---|---|---|
| `ci.yml` | Push em `main` e todo pull request | Job `quality`: `bun install --frozen-lockfile`, `bun run lint`, `bun run check`, `bun run test`, `bun run build`. Job `e2e` (depois do `quality`): instala o Chromium e roda `bun run test:e2e`; se falhar, guarda o relatório do Playwright por 7 dias |
| `release.yml` | Quando o `CI` termina com sucesso em um push na `main` | Lê a versão do `package.json` do commit. Se a tag `vX.Y.Z` ainda não existe: cria a tag e o GitHub Release com as notas daquela versão no `CHANGELOG.md` |

- Nenhum dos dois precisa de segredo cadastrado: os testes não usam rede nem chave, e a release usa o token que o próprio Actions fornece.
- As actions de terceiros estão fixadas pelo hash do commit (com a versão no comentário), e Bun e Node têm versão fixa.
- A release só envia a tag. O push feito com o token do workflow não dispara outro workflow: não há como entrar em laço.

## Todo commit é uma release

Regra obrigatória para pessoas e agentes: **cada commit leva a própria versão e é publicado como release.** Não existe commit `chore(release)` separado. No mesmo commit da mudança entram a versão nova no `package.json` e a seção `## [X.Y.Z] - AAAA-MM-DD` no `CHANGELOG.md`; depois do commit vêm a tag `vX.Y.Z` e o GitHub Release.

Única exceção: os commits `content:` que o painel `/admin` faz em produção pela API do GitHub. Eles mantêm a versão do commit anterior.

### Regra de versão

`scripts/release.ts --message "<mensagem>"` calcula a versão pela mensagem do commit que vai ser feito:

| Mensagem do commit | Antes da 1.0.0 | A partir da 1.0.0 |
|---|---|---|
| `feat` | minor | minor |
| `fix`, `perf` | patch | patch |
| Mudança incompatível (`!` ou `BREAKING CHANGE:`) | minor | major |
| `docs`, `chore`, `test`, `ci`, `build`, `style`, `refactor`, `content` | patch | patch |
| Qualquer tipo, enquanto a versão é `X.Y.Z-rc.N` | `rc.N+1` | `rc.N+1` |

Sair do release candidate é decisão do dono: `bun scripts/release.ts --version 1.0.0`.

As notas da versão são o texto que está em `## [Unreleased]` no `CHANGELOG.md`. Com `Unreleased` vazio (commit sem mudança visível, como `docs` ou `chore`), a nota é o assunto do commit.

### Passo a passo de cada commit

```bash
bun run check && bun run lint && bun run test
bun scripts/release.ts --message "feat: descrição" --dry-run            # mostra a versão e as notas
bun scripts/release.ts --message "feat: descrição" --notes notas.md     # atualiza CHANGELOG.md e package.json
git add <arquivos da mudança> CHANGELOG.md package.json
git commit --message "feat: descrição"
git tag vX.Y.Z
git push origin main vX.Y.Z
gh release create vX.Y.Z --title vX.Y.Z --notes-file notas.md           # --prerelease em release candidate
```

Conferência: `git describe --tags --exact-match` mostra a tag no `HEAD`, e `gh release view vX.Y.Z` mostra o release. As notas de uma versão já cortada saem com `bun scripts/release.ts --section X.Y.Z`.

### Histórico

Os 30 commits anteriores a esta regra receberam tag e GitHub Release de forma retroativa em 2026-10-06, pela mesma tabela: `v0.1.0` a `v0.8.5` até o primeiro release candidate, e `v1.0.0-rc.2` a `v1.0.0-rc.10` depois dele. As notas de cada um são a mensagem do commit.

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
| Versão e notas que um commit geraria | `bun scripts/release.ts --message "feat: x" --dry-run` |

`actionlint` e `act` não são dependências do projeto: instale as ferramentas à parte.

Resultado da última simulação e o que ela não cobre: grupo R1 do [`PLAN.md`](../PLAN.md). Em rede com inspeção de TLS (antivírus ou proxy corporativo), o `act` falha ao baixar o Chromium dentro do contêiner com `self-signed certificate in certificate chain`: desligue a inspeção durante a simulação. Isso não acontece nos runners do GitHub.

## Deploy

O site público é publicado pelo workflow `.github/workflows/pages.yml` a cada push na `main`. Os workflows desta pasta continuam inativos. O passo a passo da hospedagem está em [`deploy.md`](deploy.md).
