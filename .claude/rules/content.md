# Conteúdo

O formato dos arquivos (campos, exemplos, componentes, imagens) está em `docs/content.md`; as regras dos links de afiliado, em `docs/affiliate-links.md`. Para criar ou editar, use as skills `project-new-post` e `project-new-product-list`. Aqui fica só o que não pode ser quebrado:

- O nome do arquivo `content/posts/<slug>.mdx` é o slug e a URL (`/<slug>`). Slug e `id` de produto são identidade: os dois entram no id do link no dashboard (`<site.url>/<slug do post>/<id do produto>`). Mudar qualquer um apaga o histórico de cliques daquele produto.
- O mesmo `id` de produto não pode aparecer duas vezes no mesmo post, mesmo em listas diferentes: o build falha.
- Os campos de loja guardam o endereço real da loja (`https://`). O redirect pelo dashboard é montado pelo site; não escreva o endereço do dashboard no JSON nem link de loja direto no texto do post.
- `draft: true` ou data futura mantém o post fora do site, do sitemap, da API pública e do dashboard de links.
- Não use chaves `{` `}` no texto do post: a validação do corpo recusa. O único componente no Markdown é `<CardsTable list="..." />`, separado do HTML pelo `renderPostBody`.
- Imagem local referenciada precisa existir em `static/images/`: o site é pré-renderizado e um arquivo ausente derruba o build.
- Mudou o formato do conteúdo? Atualize o schema (`src/lib/content/schema.ts`), os testes de integração e `docs/content.md` juntos.
