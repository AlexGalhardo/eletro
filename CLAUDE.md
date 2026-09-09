# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Blog de reviews e comparativos de eletrodomésticos em português (links de afiliado
Mercado Livre / Amazon / Shopee). Next.js 16 (App Router), React 19, TypeScript,
Tailwind CSS v4, conteúdo em MDX. Runtime e gerenciador de pacotes: **Bun**. Deploy
na Vercel.

## Comandos

```bash
bun install
bun run dev        # dev server (limpa .next antes)
bun run build      # update-dates -> create-sitemap (+indexnow) -> check-mdx -> check-sitemap -> format -> next build
bun run start      # build + next start
bun run format     # update-dates + biome format
bun run linter     # biome check --fix --unsafe (app/, components/)
bun run lint       # next lint (eslint next/core-web-vitals)
bun run check-mdx  # valida frontmatter dos .mdx
```

Não há suíte de testes; a validação de conteúdo são os scripts em `scripts/`,
rodados no `build` e nos hooks do Husky (`.husky/pre-commit`, `.husky/pre-push`).
`next.config.js` tem `typescript.ignoreBuildErrors: true` — o build não trava por
erro de tipo, valide TS pelo editor ou `bun run lint`.

## Formatação

Biome é a fonte de verdade (`biome.json`): **tab**, largura 4, linha 120, aspas
duplas. Imports e variáveis não usados são `error`. Comentários só para decisões
não óbvias, edge cases e trade-offs.

## Arquitetura

### Posts (MDX)

- Um post = `app/[slug]/content/<slug>.mdx`; o nome do arquivo é o slug e a rota é
  a raiz `/<slug>` (`app/[slug]/page.tsx`, SSG via `generateStaticParams` +
  `revalidate = 3600`).
- `lib/blog.ts` (`"use server"`) lê os `.mdx` com `gray-matter`, calcula
  `readingTime` e **esconde** `draft: true` e posts com `date` no futuro — isso é
  publicação agendada.
- O corpo é renderizado com `next-mdx-remote/rsc`; o único componente exposto ao
  MDX na página de post é `<CardsTable />`. (`mdx-components.tsx` é outro caminho,
  do `@next/mdx`, para `.mdx` importados direto.)

### Frontmatter (validado por `scripts/check-mdx.ts`, reprova o build)

`title`, `description`; `date` `"YYYY-MM-DD"`; `category` em
`all | ferramentas | limpeza | climatizacao | moveis | lavanderia | cozinha`;
`cover` começando com `/images/covers/`; `draft: true` pula tudo. Também usados:
`blogPostId`, `author` (`"bruno"` | `"ana"`, muda o box de autor), `ref`,
`faqData` (`[{ question, answer }]`, alimenta o JSON-LD de FAQ).

> A lista de categorias de `check-mdx.ts` não é a mesma de `blogPostCategories`
> em `app/page.tsx` (essa última só filtra a landing).

### Datas são reescritas automaticamente

`scripts/update-dates.ts` roda no `build`, no `format` e no `pre-commit`, e
reescreve o `date:` de **todo** `.mdx` publicado, agendando os posts em Seg/Qua/Sex
do mais recente ao mais antigo em ordem alfabética de arquivo. Não fixe uma data
manualmente esperando que permaneça; para ordenar, controle o nome do arquivo.

### Tabelas de produtos — `<CardsTable category="chaveCamelCase" />`

Client component em `components/CardsTable.tsx`. Cada `category` é mapeada no
objeto `categoryData` para um JSON de `data/` (mostra os 10 primeiros itens). Os
JSONs não têm schema validado; o contrato é a interface `ProductData` local do
componente (`id`, `name`, `image`, `amazonUrl`/`mercadolivreUrl`/`shopeeUrl`,
`advantages`, `disadvantages`, `technicalDetails: [{label, value}]`,
`specs.ratings.*`). Para adicionar um comparativo: criar `data/<nome>.json`,
importá-lo em `CardsTable.tsx` e registrar em `categoryData`, e usar a tag no
`.mdx`. (`lib/types.ts` tem tipos de produto mais ricos, em grande parte de
categorias ainda não usadas.)

### SEO

`scripts/create-sitemap.ts` gera `public/sitemap.xml`, `update-indexnow.ts` gera o
arquivo do IndexNow e `check-sitemap.ts` confere cobertura. `next-sitemap` está
instalado mas o fluxo real é o dos scripts. `components/schema-markup.tsx` e
`landing-markup-schema.tsx` emitem JSON-LD.

### Outros pontos

- `proxy.ts` (raiz) é o middleware do Next 16 (renomeado de `middleware`): apenas
  redirects 301 de slugs legados via `redirectMap`. O conteúdo do mapa muda com
  frequência e não vale documentar entrada por entrada.
- Multi-idioma: `lib/blog.ts` e os scripts suportam `app/es/` e `app/pt/`, mas só
  existe `app/[slug]/content`, tratado como `"en"`.
- Contato: `app/api/send-contact-email/route.ts` usa **Resend** (`RESEND_API_KEY`),
  template em `emails/` (React Email).
- Tema: `next-themes` por classe, default `light`, `enableSystem={false}`,
  `storageKey: "theme-preference"`. O `<body>` força `text-white` — estilização
  dark-first, cuidado com cores.
- Analytics em `app/layout.tsx`: Vercel Analytics + Speed Insights, GA
  (`G-YM6VCZJPJV`), Microsoft Clarity.
- Busca no header: `components/blog-post-header.tsx` com `fuse.js`.
- Alias `@/*` → raiz. `otimizar-images.sh` otimiza `public/images/`.
- `docs/PROMPT-*.md` são prompts de geração de conteúdo, não documentação de código.
- `docs/postagens.md` é a auditoria de cobertura entre o sitemap do Eletrosinter
  (fonte das pautas, via campo `ref` dos `.mdx`) e os posts já publicados
  localmente. `changelog.md` (raiz) registra lotes de criação de conteúdo.

## Env

`.env.example`: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SITE_URL`.
