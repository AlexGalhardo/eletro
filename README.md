# EletroRadar

Blog de reviews de eletrodomésticos com links de afiliado, em produção em <https://eletroradar.com.br>. O código é um CMS de blog em Astro 7.4, com ilhas Svelte 5, publicado no GitHub Pages.

- **Conteúdo:** posts em Markdown (`content/posts/*.mdx`) e listas de produtos em JSON (`content/products/*.json`), no próprio repositório.
- **Site público:** estático, gerado no build.
- **Painel `/admin`:** login com GitHub ou Google, restrito a uma lista de usuários. Cada alteração vira um commit e entra no ar no deploy seguinte.
- **Links de afiliado:** gerenciados pelo dashboard de links (`links.lekzera.xyz`). O build registra os links lá e os botões passam pelo redirect dele. Ver [`docs/affiliate-links.md`](docs/affiliate-links.md).

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

## Licença

[MIT](LICENSE). O conteúdo de `content/` e `static/images/` pertence ao EletroRadar e não está coberto pela licença do código.
