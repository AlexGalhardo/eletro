# Arquitetura

## Stack

| Camada | Escolha |
|---|---|
| Framework | SvelteKit 3, Svelte 5 (runes), Vite 8 |
| Markdown | mdsvex (arquivos `.mdx`) |
| Estilo | Tailwind CSS 4 + `@tailwindcss/typography` |
| Validação | zod |
| E-mail | Resend + react-email |
| Hospedagem | Vercel ou Netlify, via `adapter-auto` |
| Qualidade | Biome, markdownlint, svelte-check, Vitest, Playwright |

## Pastas

```text
content/
  posts/<slug>.mdx          posts; o nome do arquivo é a URL
  products/<lista>.json     listas de produtos usadas pelo <CardsTable>
static/                     imagens e arquivos servidos como estão
src/
  app.html, app.css         casca HTML e estilos globais
  env.ts                    declaração das variáveis de ambiente
  hooks.server.ts           idioma do HTML e noindex em /admin e /api
  lib/
    site.config.ts          identidade do site (nome, URL, autores, categorias)
    content/                schema, parser e pré-processador de Markdown
    components/             componentes Svelte
    seo/                    JSON-LD e URLs absolutas
    server/                 código só de servidor (conteúdo, e-mail)
  routes/
    (site)/                 páginas públicas, com cabeçalho e rodapé
    api/v1/                 API REST
    sitemap.xml, robots.txt, llms.txt
tests/
  integration/              validação do conteúdo real
  e2e/                      Playwright (smoke e e2e)
docs/                       esta documentação
```

## Fluxo de uma página de post

1. No build, `src/lib/server/content.ts` importa todos os `.mdx` como texto (`import.meta.glob` com `?raw`), valida o frontmatter com zod e monta a lista de posts publicados.
2. `routes/(site)/[slug]/+page.server.ts` devolve os metadados do post e as listas de produtos que o corpo referencia.
3. `routes/(site)/[slug]/+page.ts` importa o componente compilado daquele `.mdx` (um chunk por post).
4. `+page.svelte` renderiza o componente e publica as listas de produtos por contexto; o `<CardsTable>` dentro do Markdown lê esse contexto.
5. O pré-processador `injectContentComponents` insere o `import` do `CardsTable` antes de o mdsvex compilar, para o post não precisar declará-lo.

Todas as rotas em `(site)` têm `prerender = true`: o resultado é HTML estático.

## Decisões

| Decisão | Motivo |
|---|---|
| Conteúdo em arquivos, não em banco | Markdown como fonte da verdade, histórico pelo Git, site estático |
| Metadados lidos do texto bruto, componente lido do mdsvex | O servidor precisa do frontmatter e da contagem de palavras sem carregar 64 componentes; o navegador só baixa o post aberto |
| Produtos por contexto, não importados no componente | Render no servidor (bom para SEO) sem enviar todas as listas ao navegador |
| Ordem dos produtos embaralhada só no navegador | Mantém o rodízio do site original sem tornar o HTML do servidor instável |
| JSON-LD no HTML do servidor | No site original era injetado por JavaScript; assim os buscadores leem sem executar script |
| Ícones de marca como dados SVG em `src/lib/icons/icons.ts` | Mesmo desenho do site original sem depender de biblioteca de ícones React |
| Analytics desligado em desenvolvimento | Tráfego local não polui os relatórios |
| Variáveis de ambiente todas opcionais | Um clone novo roda sem configuração |

## Limites conhecidos

- Post com data futura só aparece depois de um novo build nessa data.
- O índice de busca (título e slug de todos os posts) é enviado em toda página. Adequado até algumas centenas de posts.
- As páginas Sobre, Termos e Privacidade são rotas Svelte com texto próprio do EletroRadar; ainda não são conteúdo editável.
