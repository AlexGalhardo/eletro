# AGENTS.md

Guia para agentes de código neste repositório. O detalhamento de arquitetura está
em [`CLAUDE.md`](./CLAUDE.md); mantenha os dois arquivos em sincronia ao mudar
build, convenções ou estrutura.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · conteúdo MDX ·
**Bun** como runtime e gerenciador de pacotes. Blog de reviews de eletrodomésticos
em português, deploy na Vercel.

## Comandos

```bash
bun install
bun run dev        # dev server (limpa .next antes)
bun run build      # roda os scripts de validação + next build
bun run format     # update-dates + biome format
bun run linter     # biome check --fix --unsafe (app/, components/)
bun run lint       # next lint
bun run check-mdx  # valida frontmatter dos .mdx
```

Sem suíte de testes. `next.config.js` ignora erros de tipo no build — valide TS à
parte. Husky roda `format` + scripts de sitemap/mdx no `pre-commit`.

## Convenções

- Biome é a fonte de verdade: **tab**, largura 4, linha 120, aspas duplas.
  Imports/variáveis não usados são erro.
- Comentários só para decisões não óbvias, edge cases e trade-offs.
- Alias `@/*` aponta para a raiz.

## Fluxo de conteúdo (o essencial)

- Um post = `app/[slug]/content/<slug>.mdx`; rota `/<slug>`.
- `lib/blog.ts` esconde `draft: true` e posts com `date` no futuro.
- `scripts/update-dates.ts` **reescreve** o `date:` de todos os posts publicados
  (agenda Seg/Qua/Sex) no build/format/pre-commit — não fixe datas à mão.
- Frontmatter validado por `scripts/check-mdx.ts`: `category` em
  `all|ferramentas|limpeza|climatizacao|moveis|lavanderia|cozinha`, `cover` sob
  `/images/covers/`, `date` `YYYY-MM-DD`.
- Comparativo de produtos: `<CardsTable category="chaveCamelCase" />` → JSON em
  `data/` registrado em `components/CardsTable.tsx` (`categoryData`).
- `proxy.ts` (middleware do Next 16): redirects 301 de slugs legados.
