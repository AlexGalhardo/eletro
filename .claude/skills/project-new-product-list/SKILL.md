---
name: project-new-product-list
description: Cria ou edita uma lista de produtos em content/products/*.json, exibida nos posts pelo componente CardsTable. Use quando pedirem produtos para uma review, links de afiliado, ficha técnica, ou a correção de uma lista existente.
---

# Nova lista de produtos

Uma lista é um arquivo `content/products/<lista>.json` com um array de produtos. O post a exibe com `<CardsTable list="<lista>" />`.

## Antes de escrever

1. Leia a seção de produtos de `docs/content.md`, `docs/affiliate-links.md` e uma lista existente.
2. O prompt que o dono usa para gerar o JSON está em `docs/prompts/PROMPT-CRIAR-JSON.md`.
3. O nome da lista segue a regra do slug: minúsculas, números e hífens, de 3 a 96 caracteres.

## Formato

Exemplo completo em `docs/content.md`; o schema é `productListSchema` (`src/lib/content/schema.ts`). Chaves que o schema não conhece são mantidas como estão. O arquivo é indentado com tab.

| Campo | Regra |
|---|---|
| `id` | obrigatório; ver "Id do produto" abaixo |
| `name` | obrigatório |
| `image` | `/images/posts/<arquivo>` que **exista** em `static/`, uma URL `https://`, ou `#` enquanto não há foto |
| `mercadolivreUrl`, `shopeeUrl`, `amazonUrl` | o endereço real da loja em `https://`; `null`, vazio ou `#` quando não há link |
| `advantages` | lista de textos curtos; o cartão mostra as 5 primeiras |
| `technicalDetails` | lista de `label` e `value` |

## Id do produto

O `id` identifica o produto no dashboard de links, junto com o post que o exibe:

```text
<site.url>/<slug do post>/<id do produto>
```

- **Não mude o `id` de um produto publicado** (nem o slug do post). O próximo build cria um registro novo no dashboard e remove o antigo, com todos os cliques dele. Para corrigir nome, foto ou link, edite os outros campos e deixe o `id` como está.
- **Um `id` não pode aparecer duas vezes no mesmo post**, nem na mesma lista, nem em duas listas que o post exibe: o build falha e mostra os ids repetidos.
- O mesmo produto em dois posts são dois registros, cada um com a própria contagem.
- Use um id estável e descritivo, em minúsculas com hífens (`philco-gourmet-pfr13p`), e não a posição na lista.

## Links de loja

- Escreva no JSON o **endereço real da loja**, nunca o do dashboard. O site monta o redirect sozinho: cada botão aponta para `<dashboard>/link?id=<id>&store=<loja>`, e o build registra os links no dashboard (`bun run sync-links`).
- **Só `https://`.** `http://`, `javascript:` e qualquer outro esquema são recusados pelo schema.
- **Campo com `null`, vazio ou `#` não é link**: a loja não é registrada no dashboard. `shopeeUrl` e `amazonUrl` nesses casos não geram botão. Em `mercadolivreUrl`, `null` e vazio também não geram botão; `#` mantém o botão do Mercado Livre, que leva à oferta padrão do site.
- **Produto sem nenhum link real** não entra no dashboard: a foto e o título do cartão levam à oferta padrão (`site.fallbackAffiliateUrl`, registrada como `<site.url>/ofertas`).
- Trocar o endereço de uma loja não muda o `id` do produto.
- Se o dashboard estiver fora do ar quando o visitante abre a página, os botões vão direto ao endereço da loja.

## Outros cuidados

- **Imagem local precisa existir.** O site é pré-renderizado: uma página que aponta para um arquivo que não existe derruba o build e o deploy. Coloque a foto em `static/images/posts/` antes de referenciá-la.
- **A ordem do arquivo é a ordem de destaque**, e só os 10 primeiros produtos são exibidos. No navegador os cartões são embaralhados a cada visita, mas o HTML do servidor e o JSON-LD seguem o arquivo.
- **Direito de imagem:** foto baixada de outro site ou de uma loja precisa de decisão do dono antes de publicar.

## Conferir

```bash
bun run test         # schema, ids repetidos na lista, imagens e listas referenciadas
bun run sync-links   # catálogo dos posts publicados: id repetido no mesmo post falha aqui; sem a chave, não envia nada
bun run build
```

Lista que nenhum post publicado exibe não entra no catálogo: o `sync-links` só a confere depois que o post sai do rascunho.

## Commit

Tipo `content`: `content: add product list <lista>`. Feito em uma sessão de trabalho, é uma release como qualquer outro commit (skill `project-release`). O build de produção falha se o dashboard recusar o catálogo ou estiver fora do ar, e o site continua na versão anterior: confira o deploy depois do push.

## Pelo painel

`/admin/products/new` cria a lista em formulário, com upload das fotos. Id deixado vazio é gerado a partir do nome; depois de publicado, o campo não deve ser alterado.
