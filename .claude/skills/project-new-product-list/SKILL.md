---
name: project-new-product-list
description: Cria ou edita uma lista de produtos em content/products/*.json, exibida nos posts pelo componente CardsTable. Use quando pedirem produtos para uma review, links de afiliado, ficha técnica, ou a correção de uma lista existente.
---

# Nova lista de produtos

Uma lista é um arquivo `content/products/<lista>.json` com um array de produtos. O post a exibe com `<CardsTable list="<lista>" />`.

## Antes de escrever

1. Leia a seção de produtos de `docs/content.md` e uma lista existente.
2. O prompt que o dono usa para gerar o JSON está em `docs/prompts/PROMPT-CRIAR-JSON.md`.
3. O nome da lista segue a regra do slug: minúsculas, números e hífens, de 3 a 96 caracteres.

## Formato

Validado por `productListSchema` (`src/lib/content/schema.ts`). Chaves que o schema não conhece são mantidas como estão.

```json
[
  {
    "id": "philco-gourmet-pfr13p",
    "name": "Philco Gourmet PFR13P (8,1 litros)",
    "image": "/images/posts/airfryers-8-litros-5.jpg",
    "mercadolivreUrl": "https://meli.la/...",
    "shopeeUrl": null,
    "amazonUrl": null,
    "advantages": ["Cesto de 8,1 litros", "Painel digital"],
    "technicalDetails": [{ "label": "Potência", "value": "1900 W" }]
  }
]
```

| Campo | Regra |
|---|---|
| `id` | obrigatório, sem repetir dentro da lista |
| `name` | obrigatório |
| `image` | `/images/posts/<arquivo>` que **exista** em `static/`, uma URL `https://`, ou `#` enquanto não há foto |
| `mercadolivreUrl`, `shopeeUrl`, `amazonUrl` | `https://...`, `null`, vazio, ou `#` enquanto o link não existe |
| `advantages` | lista de textos curtos |
| `technicalDetails` | lista de `label` e `value` |

O arquivo real é indentado com tab (o exemplo acima usa espaços só por causa do Markdown).

## Cuidados

- **Imagem local precisa existir.** O site é pré-renderizado: uma página que aponta para um arquivo que não existe derruba o build e o deploy. Coloque a foto em `static/images/posts/` antes de referenciá-la.
- **Links `#`:** `mercadolivreUrl: "#"` cai no link de afiliado padrão do site (`site.fallbackAffiliateUrl`). `shopeeUrl` e `amazonUrl` com `#` viram botões que não levam a lugar nenhum: use `null` quando a loja não se aplica.
- **Só `https`.** `http://` e `javascript:` são recusados.
- **A ordem do arquivo é a ordem de destaque.** No navegador os cartões são embaralhados a cada visita, mas o HTML do servidor e o JSON-LD seguem o arquivo.
- **Direito de imagem:** foto baixada de outro site ou de uma loja precisa de decisão do dono antes de publicar.

## Conferir

```bash
bun run test     # schema, ids repetidos, imagens e listas referenciadas
bun run build
```

## Commit

Tipo `content`: `content: add product list <lista>`.

## Pelo painel

`/admin/products/new` cria a lista em formulário, com upload das fotos. Id deixado vazio é gerado a partir do nome.
