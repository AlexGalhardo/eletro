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

- **Slug:** minúsculas, números e hífens, sem acento, de 3 a 96 caracteres. É o nome do arquivo e a URL.
- **O slug não muda depois de publicado.** Além de quebrar a URL, ele faz parte do id de cada produto no dashboard de links (`<site.url>/<slug do post>/<id do produto>`): trocar o slug cria registros novos e apaga os cliques dos antigos no próximo build. Ver `docs/affiliate-links.md`.
- **Frontmatter:** campos e regras na tabela de `docs/content.md`, validados por `postFrontmatterSchema` (`src/lib/content/schema.ts`). O que mais derruba o build: `category` e `author` precisam existir em `src/lib/site.config.ts`, e `cover` local precisa existir em `static/images/covers/`.
- **Corpo:** Markdown, mais `<CardsTable list="<lista>" />` onde os produtos aparecem. Um post pode exibir mais de uma lista, mas o mesmo `id` de produto não pode aparecer duas vezes no post: o build falha.
- **Links de loja só nas listas de produtos.** Link de afiliado escrito direto no texto não passa pelo dashboard de links e fica sem contagem de cliques.

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
bun run test         # valida frontmatter, corpo, listas e imagens de todo o conteúdo
bun run post-status  # atualiza docs/post-status.md (rascunho, produtos, links e pendentes); commite o arquivo junto
bun run sync-links   # valida os links de afiliado dos posts publicados; sem a chave, não envia nada
bun run build        # compila o post de verdade
```

Com `draft: true` ou data futura o post não pode aparecer em lugar nenhum, e os produtos dele ficam fora do dashboard de links até a publicação: os testes smoke (`bun run test:e2e`) conferem o site. Para revisar o rascunho, abra `/preview/<slug>` (com `previewDrafts` ligado em `content/flags.json`).

## Commit

Tipo `content`: `content: add post <slug>`. Imagens e lista de produtos do post vão no mesmo commit ou em commits `content` próprios. Feito em uma sessão de trabalho, o commit é uma release como qualquer outro (skill `project-release`); só os commits que o painel faz em produção ficam sem versão.

## Pelo painel

O mesmo post pode ser criado em `/admin/posts/new`, ou importado como rascunho em `/admin/import` a partir de um site de origem permitido (`site.postImport` em `site.config.ts`). O painel aplica as mesmas validações.

Em lote, `bun webscrapping/batch.ts` cria rascunhos dos posts da origem que ainda não existem aqui (`--write --limit N` para importar). Cada rascunho sai com texto de esqueleto: a reescrita é um passo separado, ver `docs/webscrapping-modelation.md`.
