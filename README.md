# SvelteKit Blog CMS

Template open source de blog com CMS, feito em SvelteKit 3. Os posts são arquivos Markdown no repositório, o site público é estático e o conteúdo de demonstração é o [EletroRadar](https://eletroradar.com.br), um site de reviews de eletrodomésticos com links de afiliado.

> **Estado:** fase ALPHA concluída (site público). O painel `/admin`, a API REST completa e a newsletter estão planejados na fase BETA. Veja o [PLAN.md](PLAN.md).

## Recursos

- Posts em Markdown (`.mdx` com mdsvex) e listas de produtos em JSON, validados no build
- Site pré-renderizado, com busca, filtro por categoria, tema claro e escuro
- SEO completo: metatags, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`
- Formulário de contato com Resend e react-email
- Identidade do site em um único arquivo de configuração
- Testes unitários, de integração, smoke e e2e

## Começando

Requisitos: Node 22.17+ e Bun 1.4+.

```bash
bun install
bun run dev
```

O site público roda sem nenhuma variável de ambiente. Para enviar e-mails de verdade, copie `.env.example` para `.env` e preencha.

## Scripts

| Script | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run check` | Checagem de tipos |
| `bun run lint` | Biome e markdownlint |
| `bun run test` | Testes unitários e de integração |
| `bun run test:e2e` | Testes smoke e e2e (rode `bun run test:e2e:install` uma vez) |
| `bun run verify` | Tudo acima em sequência |

## Usando como template

1. Edite `src/lib/site.config.ts` (nome, URL, autores, categorias, analytics).
2. Troque o conteúdo de `content/` e as imagens de `static/`.
3. Reescreva as páginas institucionais em `src/routes/(site)/`.

## Documentação

- [PLAN.md](PLAN.md): planejamento por fases, com checklists
- [docs/](docs/README.md): arquitetura, conteúdo, desenvolvimento e testes
- [AGENTS.md](AGENTS.md): instruções para agentes de código
- [CHANGELOG.md](CHANGELOG.md): histórico de versões

## Licença

[MIT](LICENSE). O conteúdo de demonstração em `content/` e `static/images/` pertence ao EletroRadar e não está coberto pela licença do código.
