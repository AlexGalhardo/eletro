# CI, proteção da main e releases

## Pull requests

Toda mudança de código ou conteúdo chega à `main` por PR. O ruleset ativo do GitHub exige PR, histórico linear, proíbe exclusão e push forçado e aguarda os checks `Lint, types, tests and build` e `End-to-end tests`. A configuração desejada fica em [`.config/ruleset-protect-main.json`](../.config/ruleset-protect-main.json). Reaplique com `gh api -X PUT repos/AlexGalhardo/eletro/rulesets/<id> --input .config/ruleset-protect-main.json` se houver mudança intencional.

O workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) roda em PR: instala dependências, faz lint, confere tipos, testa, compila e roda Playwright. O [workflow do Pages](../.github/workflows/pages.yml) publica a `main` depois do merge. O workflow automático de release continua em `.github/workflows-disabled/release.yml`.

O [`release.yml`](../.github/workflows/release.yml) roda ao empurrar uma tag estável `vX.Y.Z` (tags `-rc` não disparam): cria o GitHub Release com a seção do `CHANGELOG.md` (`scripts/release.ts --section`) e publica a imagem de `infra/Dockerfile` (nginx servindo o `dist/`) em `ghcr.io/alexgalhardo/eletro` e `docker.io/<DOCKERHUB_USERNAME>/eletro` com as tags `X.Y.Z`, `X.Y` e `latest`, assinada com cosign. Precisa das variáveis de repositório `SITE_URL` e `DOCKERHUB_USERNAME` e do segredo `DOCKERHUB_TOKEN`. A imagem é só o site estático: sem `/admin` com login de servidor, API, contato, newsletter nem cron.

Para liberar a entrada no `/admin` apenas com senha, cadastre `ADMIN_GITHUB_TOKEN` e `ADMIN_PASSWORD` em **Settings → Secrets and variables → Actions**. O build do Pages produz somente a credencial criptografada. Os dois segredos precisam estar presentes e a senha deve ter pelo menos 20 caracteres. Reexecute o workflow do Pages após cadastrá-los ou alterá-los.

O painel `/admin` também abre PR: o primeiro salvamento cria uma branch `cms/*`, faz commit e abre a revisão. Outros salvamentos na mesma aba atualizam o mesmo PR. O conteúdo só entra no site depois do merge e do build do Pages.

## Releases sob pedido

Commits e merges comuns mantêm a versão. `CHANGELOG.md` acumula notas em `## [Unreleased]`. Quando o dono pedir uma release, siga a skill `.agents/skills/project-release/SKILL.md`: prepare a versão em branch `release/vX.Y.Z`, valide, abra PR, faça merge, crie a tag no commit integrado e publique o GitHub Release. Nunca mova uma tag publicada.

As releases e tags antigas `v0.11.0`, `v0.11.1`, `v0.12.0` e `v0.13.0` foram removidas em 2026-11-13 a pedido do dono. Uma nova `v0.11.0` foi publicada no mesmo dia após pedido explícito e validação dos PRs. Esta é a última release publicada.
