<div align="center">

<h1><strong><a href="https://example.com" target="_blank">EletroRadar</a></strong></h1>

[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![Bun 1.4](https://img.shields.io/badge/bun-1.4-000000?logo=bun&logoColor=white)](package.json)
[![Astro 7.4](https://img.shields.io/badge/astro-7.4-BC52EE?logo=astro&logoColor=white)](package.json)

<h3><strong>Blog de reviews de eletrodomésticos com links de afiliado</strong></h3>

</div>

## Introdução

Blog de reviews de eletrodomésticos com links de afiliado, em produção em <https://example.com>. O código é um CMS de blog em Astro 7.4, com ilhas Svelte 5, publicado no GitHub Pages.

- **Conteúdo:** posts em Markdown (`content/posts/*.mdx`) e listas de produtos em JSON (`content/products/*.json`), no próprio repositório.
- **Site público:** estático, gerado no build.
- **Painel `/admin`:** login com GitHub ou Google, restrito a uma lista de usuários. Cada alteração vira um commit e entra no ar no deploy seguinte.
- **Links de afiliado:** gerenciados pelo dashboard de links (`links.lekzera.xyz`). O build registra os links lá e os botões passam pelo redirect dele. Ver [`docs/affiliate-links.md`](docs/affiliate-links.md).

## Sumário

- [Introdução](#introdução)
- [Rodar](#rodar)
- [Comandos](#comandos)
- [Usar como template](#usar-como-template)
- [Documentação](#documentação)
- [Estabilidade](#estabilidade)
- [Contribuindo](#contribuindo)
- [Código de conduta](#código-de-conduta)
- [Vulnerabilidades de segurança](#vulnerabilidades-de-segurança)
- [Licença](#licença)

## Rodar

Requisitos: [Bun](https://bun.sh) 1.4 ou mais novo e Node 24.

```bash
bash setups/setup-windows-local.sh   # Windows (Git Bash)
bash setups/setup-unix-local.sh      # macOS, Linux, WSL
```

O script confere as ferramentas, instala as dependências, cria o `.env`, escolhe uma porta livre e sobe o servidor. O site público roda sem nenhuma variável de ambiente.

Em Docker, sem Bun nem Node na máquina: `bash setups/setup-windows-with-docker.sh` ou `bash setups/setup-unix-with-docker.sh` (arquivos em `infra/`).

Manual:

```bash
bun install
bun run dev        # http://localhost:5173
```

Painel na sua máquina, variáveis de ambiente e roteiro completo: [`docs/agent-setup.md`](docs/agent-setup.md) e [`docs/development.md`](docs/development.md).

## Comandos

| Comando | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Confere as variáveis de ambiente, valida o conteúdo, sincroniza os links de afiliado e gera o build |
| `bun run check` | Checagem de tipos |
| `bun run lint` | Biome e markdownlint |
| `bun run format` | Correções automáticas |
| `bun run test` | Testes unitários e de integração |
| `bun run test:e2e` | Testes smoke e e2e (antes, uma vez: `bun run test:e2e:install`) |
| `bun run verify` | Todos os anteriores em sequência |

## Usar como template

1. Edite `src/lib/site.config.ts`: nome, URL, autores, categorias, analytics.
2. Troque o conteúdo de `content/` e as imagens de `static/images/`. Formato em [`docs/content.md`](docs/content.md).
3. Reescreva Sobre, Contato, Termos e Privacidade em `src/routes/(site)/`.
4. Ajuste em `tests/` os números e nomes que conferem o conteúdo de demonstração.
5. Publique seguindo [`docs/deploy.md`](docs/deploy.md).
6. Defina `LINKS_DASHBOARD_TOKEN` no deploy: o dashboard de links cria o projeto do site no primeiro build.

## Documentação

O índice completo está em [`docs/README.md`](docs/README.md). Os mais usados:

| Documento | Assunto |
|---|---|
| [`docs/agent-setup.md`](docs/agent-setup.md) | Preparar o projeto do zero |
| [`docs/architecture.md`](docs/architecture.md) | Pastas, fluxo de dados e decisões |
| [`docs/content.md`](docs/content.md) | Formato de posts e produtos |
| [`docs/cms.md`](docs/cms.md) | Painel, banco, autenticação e armazenamento |
| [`docs/affiliate-links.md`](docs/affiliate-links.md) | Links de afiliado e o dashboard de links |
| [`docs/workflows.md`](docs/workflows.md) | Commits, release e deploy |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de código |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de versões |

## Estabilidade

O projeto segue [SemVer](https://semver.org/lang/pt-BR/) e publica cada versão como tag `vX.Y.Z` com GitHub Release. O histórico está em [`CHANGELOG.md`](CHANGELOG.md), no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## Contribuindo

O guia completo (requisitos, comandos e verificações) está em [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Pull requests

1. Crie um branch a partir da `main`.
2. Faça um commit por mudança lógica, com testes, e deixe o `bun run verify` verde.
3. Abra o pull request contra a `main`.

### Commits

[Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) em inglês, com o tipo extra `content` para posts, produtos e imagens, validados pelo commitlint no hook `commit-msg`.

## Código de conduta

Leia e siga o [Código de Conduta](CODE_OF_CONDUCT.md).

## Vulnerabilidades de segurança

Siga a [política de segurança](SECURITY.md) em vez de abrir uma issue pública.

## Licença

[MIT](LICENSE). O conteúdo de `content/` e `static/images/` pertence ao EletroRadar e não está coberto pela licença do código.
