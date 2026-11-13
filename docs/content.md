# Conteúdo

O conteúdo publicado pelo painel estático é salvo numa branch `cms/*` e revisado em PR. O build do PR valida posts, produtos e imagens antes do merge. O editor de `/admin` trabalha com MDX e JSON em texto.

## Flags e prévias

Os padrões do build ficam em `content/flags.json`. `/admin/flags` mostra o status dos posts e permite trocar flags de navegador apenas na aba local. `previewDrafts` gera `/preview/<slug>` para rascunhos; essas páginas têm `noindex` e não entram no sitemap. `showDrafts` pode exibir rascunhos no site, mas não os coloca na API pública nem no sitemap.

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
| `cover` | não | `/images/covers/<arquivo>` que exista em `static/`, ou uma URL `https://` |
| `draft` | não | `true` tira o post do site, do sitemap e da API |
| `author` | não | Uma chave de `site.authors`; padrão `site.defaultAuthor` |
| `faqData` | não | Vira JSON-LD `FAQPage` |
| `blogPostId`, `ref` | não | Mantidos do site original; não são exibidos |

O schema é `postFrontmatterSchema` em `src/lib/content/schema.ts`. Frontmatter inválido derruba o build com o nome do post e do campo.

Não use `{` nem `}` no texto: o mdsvex trata como expressão Svelte.

## Categorias

`category` aceita um `id` de `site.categories` em `src/lib/site.config.ts`:

- `ferramentas`, `limpeza`, `climatizacao`, `moveis`, `lavanderia`, `cozinha`, `cuidados-pessoais`
- `banheiro`, `cama-mesa-banho`, `iluminacao`, `infantil`, `jardim`

A categoria só aparece no rodapé quando tem post publicado. Categoria nova precisa de entrada em `site.categories` e de ícone em `src/lib/components/CategoryIcon.astro` (`src/lib/icons/lucide.json`).

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

- `id` é único dentro da lista e dentro do post que a exibe. Ele faz parte do id do link no dashboard: não o mude depois de publicado.
- Cada link de loja com endereço `https://` vira um botão, que passa pelo dashboard de links. `#`, vazio e `null` não geram botão; a exceção é `mercadolivreUrl: "#"`, que mantém o botão do Mercado Livre apontando para a oferta padrão. Sem nenhum link, o produto usa a oferta padrão (`site.fallbackAffiliateUrl`). Ver [affiliate-links.md](affiliate-links.md).
- São exibidos os 10 primeiros produtos e as 5 primeiras vantagens de cada um.
- Detalhe técnico com valor vazio ou "não especificado" é omitido.
- Campos extras são aceitos e ignorados na exibição.

## Componentes no Markdown

| Componente | Uso |
|---|---|
| `<CardsTable list="<lista>" />` | Cartões dos produtos da lista. `shuffle={false}` mantém a ordem do arquivo |

Com a flag `allStoreButtons` ligada no navegador ([content.md](content.md)), o `CardsTable` mostra os três botões mesmo com link `"#"`; o botão sem link real aponta para a oferta padrão.

Para criar um componente novo: adicione o arquivo `.astro` em `src/lib/components/`, aceite o nome em `CONTENT_COMPONENTS` (`src/lib/content/validate-body.ts`) e documente nesta tabela. O `renderPostBody` é quem insere o componente no HTML.

## Imagens

- Capas: `static/images/covers/`, WebP, proporção 16:9. Envie no tamanho que tiver: o build gera as cópias menores (ver [`performance.md`](performance.md)). As pastas `w480/`, `w768/` e `w1280/` são saída de build.
- Produtos: `static/images/posts/`.
- Autores: `static/images/avatars/`.

## Validação

`bun run test` roda `tests/integration/content.test.ts`, que confere todo post e toda lista: schema, slug, capa e imagens existentes, listas referenciadas existentes e ids sem repetição.

## Status dos posts

`bun run post-status` gera [`post-status.md`](post-status.md) a partir de `content/`: uma linha por post, com rascunho, produtos, links de loja reais e pendentes (campos com `"#"`). Não edite esse arquivo à mão.

- Rode o comando depois de mudar `content/posts` ou `content/products`, e commite o arquivo junto.
- `tests/integration/post-status.test.ts` falha quando o arquivo está desatualizado. O hook `pre-push` roda os testes, então ele não sai velho.
- Commits `content:` feitos pelo painel em produção não regeneram o arquivo: a próxima sessão roda `bun run post-status`.
- `/admin/posts` mostra a mesma informação: coluna "Links" e filtro "Links de afiliado".

## Rascunhos e prévia

- `draft: true` e data futura ficam fora do site. Com `previewDrafts` ligado em `content/flags.json`, o build gera `/preview/<slug>` para eles: página com faixa "Prévia de rascunho", `noindex`, fora do sitemap, do `llms.txt`, da API pública e do dashboard de links.
- Para revisar um rascunho, abra `/preview/<slug>`, ou escolha o post na lista de `/admin/flags`.
- Detalhes das flags e como desligar a prévia: [content.md](content.md).
