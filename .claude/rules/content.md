# Conteúdo

- Post: `content/posts/<slug>.mdx`. O nome do arquivo é o slug e a URL (`/<slug>`). Slug em minúsculas, com hífens, sem acento.
- Frontmatter validado por `postFrontmatterSchema` em `src/lib/content/schema.ts`: `title`, `description`, `date` (AAAA-MM-DD), `category` (um id de `site.categories`), `cover`, `draft`, `author` (uma chave de `site.authors`), `faqData`.
- `draft: true` ou data futura mantém o post fora do site, do sitemap e da API pública.
- Lista de produtos: `content/products/<lista>.json`, um array validado por `productListSchema`. O post exibe a lista com `<CardsTable list="<lista>" />`.
- Componentes disponíveis no Markdown ficam registrados em `src/lib/content/mdx-preprocess.ts`. Não use chaves `{` `}` no texto do post: o mdsvex as interpreta como expressão Svelte.
- Imagens em `static/images/` (`covers/` em WebP 16:9, `posts/` para produtos, `avatars/`).
- Mudou o formato do conteúdo? Atualize o schema, os testes de integração e `docs/content.md` juntos.
