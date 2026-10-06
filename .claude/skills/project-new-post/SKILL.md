---
name: project-new-post
description: Cria ou edita um post do blog em content/posts/*.mdx seguindo o schema e o portão de segurança do projeto. Use quando pedirem um post novo, uma review, um rascunho, ou a correção de um post existente.
---

# Novo post

Um post é um arquivo `content/posts/<slug>.mdx`. O corpo vira um componente Svelte no build: o que não for Markdown simples pode quebrar o deploy ou executar código. Siga os passos na ordem.

## Antes de escrever

1. Leia `docs/content.md` e um post existente da mesma categoria.
2. Confira que o assunto ainda não existe: `ls content/posts | grep <termo>`.
3. Os prompts que o dono usa para o texto, o FAQ e o JSON de produtos estão em `docs/prompts/`. Siga a estrutura e o tom deles.
4. O post quase sempre exibe produtos: a lista vem primeiro. Use a skill `project-new-product-list`.

## Arquivo

- **Slug:** minúsculas, números e hífens, sem acento, de 3 a 96 caracteres. É o nome do arquivo e a URL, e não muda depois.
- **Frontmatter**, validado por `postFrontmatterSchema` (`src/lib/content/schema.ts`):

  | Campo | Regra |
  |---|---|
  | `title` | obrigatório |
  | `description` | usado na home, nas metatags e no `llms.txt` |
  | `date` | `AAAA-MM-DD`; data futura agenda o post |
  | `category` | um `id` de `site.categories` em `src/lib/site.config.ts` |
  | `cover` | `/images/covers/<arquivo>` que **exista** em `static/`, uma URL `https://`, ou vazio |
  | `draft` | `true` deixa o post fora do site, do sitemap e da API |
  | `author` | uma chave de `site.authors` |
  | `faqData` | lista de `question` e `answer`; vira JSON-LD `FAQPage` |

- **Corpo:** Markdown, mais `<CardsTable list="<lista>" />` onde os produtos aparecem.

## O que o corpo não pode ter

`validateBody` (`src/lib/content/validate-body.ts`) recusa, e os testes de integração aplicam a mesma regra a todo post do repositório:

- chaves `{` `}`, literais ou codificadas (`&#123;`, `&lbrace;`, `%7B`);
- entidades HTML fora de `&amp; &lt; &gt; &quot; &apos; &nbsp; &mdash; &ndash; &hellip; &copy; &reg; &deg;`;
- as tags `script`, `style`, `iframe`, `object`, `embed`, `base`, `meta`, `link`, `form`, `button`, `input`, `textarea`, `select`, `svg`, `math`, `template`, `noscript` e qualquer `svelte:`;
- atributos de evento (`onclick`...) e o atributo `style`;
- endereços `javascript:`, `vbscript:` e `data:` em links e imagens;
- componentes além dos registrados em `src/lib/content/mdx-preprocess.ts`.

Feche toda tag HTML que abrir: uma tag sem fechar passa pela validação mas quebra o build.

## Texto

Escreva texto original em português do Brasil. Não copie parágrafos de outro site: é problema de direito autoral e de SEO. Nomes de produto e ficha técnica são fatos e podem ser usados.

## Conferir

```bash
bun run test     # valida frontmatter, corpo, listas e imagens de todo o conteúdo
bun run build    # compila o post de verdade
```

Com `draft: true` o post não pode aparecer em lugar nenhum: os testes smoke (`bun run test:e2e`) conferem isso.

## Commit

Tipo `content`, que não gera release: `content: add post <slug>`. Imagens e lista de produtos do post vão no mesmo commit ou em commits `content` próprios.

## Pelo painel

O mesmo post pode ser criado em `/admin/posts/new`, ou importado como rascunho em `/admin/import` a partir de um site de origem permitido (`site.postImport` em `site.config.ts`). O painel aplica as mesmas validações.
