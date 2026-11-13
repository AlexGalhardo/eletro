# Contribuindo com o EletroRadar

Obrigado por considerar contribuir. O EletroRadar é um CMS de blog de reviews feito com Astro 7.4 e TypeScript, publicado no GitHub Pages.

## Antes de começar

- Leia o [índice da documentação](docs/README.md) e o [`PLAN.md`](PLAN.md) (estado atual e itens em aberto).
- Para algo maior que uma correção pequena, abra uma issue antes para combinar a abordagem.

## Configuração local

Requisitos: [Bun](https://bun.sh) 1.4 ou mais novo e Node 24.

```bash
bash setups/setup-windows-local.sh   # Windows (Git Bash)
bash setups/setup-unix-local.sh      # macOS, Linux, WSL
```

Ou à mão: `bun install` e `bun run dev` (<http://localhost:5173>). O site público roda sem nenhuma variável de ambiente. O passo a passo completo está em [`docs/development.md`](docs/development.md).

| Comando | O que faz |
| --- | --- |
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Confere as variáveis de ambiente, valida o conteúdo, sincroniza os links de afiliado e gera o build |
| `bun run check` | Checagem de tipos |
| `bun run lint` | Biome e markdownlint |
| `bun run format` | Correções automáticas |
| `bun run test` | Testes unitários e de integração |
| `bun run test:e2e` | Testes smoke e e2e (antes, uma vez: `bun run test:e2e:install`) |
| `bun run verify` | Todos os anteriores em sequência |

## Fazendo uma mudança

- Código, comentários e commits em inglês; documentação e textos de interface em português do Brasil.
- Escreva o teste junto com a mudança e mantenha o foco em um assunto.
- Sem dependência nova sem combinar antes; versões exatas, sempre a última estável.
- Atualize a documentação afetada na mesma mudança.

## Verificações

Rode antes de abrir o pull request:

```bash
bun run verify
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) em inglês: `tipo(escopo opcional): descrição no imperativo`. Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert` e o extra `content`, reservado a posts, produtos e imagens (usado pelo painel `/admin`). O commitlint confere o cabeçalho no hook `commit-msg`. Nunca use `--no-verify`.

Todo commit entra por PR com CI verde. A versão, a tag e o GitHub Release só mudam quando o dono pedir uma release (detalhes em [`docs/ci-cd.md`](docs/ci-cd.md)).

## Pull requests

1. Crie um branch a partir da `main`.
2. Faça um commit por mudança lógica, com testes, e deixe o `bun run verify` verde.
3. Abra o pull request contra a `main`, descrevendo o que mudou e como testou. O pull request é mesclado por rebase.

## Bugs e segurança

- Bugs e ideias: abra uma issue com passos para reproduzir.
- Vulnerabilidades: não abra issue pública; siga o [SECURITY.md](SECURITY.md).
