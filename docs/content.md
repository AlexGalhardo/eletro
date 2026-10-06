# Conteúdo

## Post

Arquivo: `content/posts/<slug>.mdx`. O slug é o nome do arquivo e vira a URL `/<slug>`.

```mdx
---
title: "Melhor Air Fryer 8 Litros Para Comprar em 2026"
description: "Confira as melhores air fryers de 8 litros."
date: "2026-09-04"
category: "cozinha"
cover: "/images/covers/melhor-airfryer-8-litros-cover.webp"
draft: false
author: "bruno"
faqData:
  - question: "Serve para quantas pessoas?"
    answer: "De 4 a 6 pessoas."
---

Texto em Markdown.

<CardsTable list="airfryers-8-litros" />

## Perguntas Frequentes
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `title` | sim | Texto |
| `description` | não | Usado na home, em metatags e no `llms.txt` |
| `date` | sim | `AAAA-MM-DD`. Data futura agenda o post |
| `category` | sim | Um `id` de `site.categories` |
| `cover` | não | Caminho em `static/` ou URL absoluta |
| `draft` | não | `true` tira o post do site, do sitemap e da API |
| `author` | não | Uma chave de `site.authors`; padrão `site.defaultAuthor` |
| `faqData` | não | Vira JSON-LD `FAQPage` |
| `blogPostId`, `ref` | não | Mantidos do site original; não são exibidos |

O schema é `postFrontmatterSchema` em `src/lib/content/schema.ts`. Frontmatter inválido derruba o build com o nome do post e do campo.

Não use `{` nem `}` no texto: o mdsvex trata como expressão Svelte.

## Lista de produtos

Arquivo: `content/products/<lista>.json`, um array de produtos.

```json
[
    {
        "id": "arno-dual-afd2-8-3l",
        "name": "Arno Dual AFD2 (8,3 litros) 1800W",
        "image": "/images/posts/airfryers-8-litros-1.jpg",
        "mercadolivreUrl": "https://meli.la/1qG3vci",
        "shopeeUrl": null,
        "amazonUrl": null,
        "advantages": ["Dois cestos independentes"],
        "technicalDetails": [{ "label": "Capacidade", "value": "8,3 litros" }]
    }
]
```

- `id` é único dentro da lista.
- Cada link de loja preenchido vira um botão. Sem nenhum link, usa `site.fallbackAffiliateUrl`.
- São exibidos os 10 primeiros produtos e as 5 primeiras vantagens de cada um.
- Detalhe técnico com valor vazio ou "não especificado" é omitido.
- Campos extras são aceitos e ignorados na exibição.

## Componentes no Markdown

| Componente | Uso |
|---|---|
| `<CardsTable list="<lista>" />` | Cartões dos produtos da lista. `shuffle={false}` mantém a ordem do arquivo |

Para criar um componente novo: adicione o arquivo em `src/lib/components/`, registre o nome em `CONTENT_COMPONENTS` (`src/lib/content/mdx-preprocess.ts`) e documente nesta tabela.

## Imagens

- Capas: `static/images/covers/`, WebP, proporção 16:9.
- Produtos: `static/images/posts/`.
- Autores: `static/images/avatars/`.

## Validação

`bun run test` roda `tests/integration/content.test.ts`, que confere todo post e toda lista: schema, slug, capa e imagens existentes, listas referenciadas existentes e ids sem repetição.
