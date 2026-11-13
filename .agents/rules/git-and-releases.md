# Git, PRs e releases

- Trabalhe em uma branch criada a partir de `main`. Nenhum commit de trabalho vai diretamente para `main`.
- Commits e títulos de PR seguem Conventional Commits em inglês. Abra um PR, espere `Lint, types, tests and build` e `End-to-end tests` verdes, então faça o merge pelo GitHub. Não force push nem apague a `main`.
- O painel estático salva em uma branch `cms/*` e abre um PR. A publicação do Pages ocorre depois do merge.
- Commits comuns não alteram `package.json` por versão, não cortam `CHANGELOG.md`, não criam tags nem GitHub Releases.
- Release só quando o dono pedir. Nessa ocasião, use a skill `project-release`, gere as notas a partir dos commits integrados e publique a versão por PR.
- Não reescreva tags publicadas nem seções históricas do changelog. Nunca commite `.env`, chaves ou tokens.
