# Links de afiliado e o dashboard de links

Todo link de afiliado do site é gerenciado por um dashboard externo, definido em `site.linksDashboardUrl` (`src/lib/site.config.ts`). O site nunca aponta direto para a loja: cada botão passa pelo redirect do dashboard, que conta o clique, troca um link morto sem rebuild e mostra todos os links de todos os sites em um lugar só.

O contrato completo (endpoints, respostas, regras) está no repositório do dashboard, em `docs/api.md`.

## Como funciona

1. O painel `/admin` (ou um commit direto) grava a lista de produtos em `content/products/*.json`, com o endereço real da loja em `mercadolivreUrl`, `shopeeUrl` e `amazonUrl`.
2. Todo build roda `scripts/sync-links.ts` antes do `vite build`. O script lê os posts publicados, monta o catálogo e envia tudo ao dashboard com `PUT /api/v1/links`.
3. Se o dashboard recusar, estiver fora do ar ou o token estiver errado, o build falha e o site continua na versão anterior. Nenhuma página vai ao ar com link que o dashboard não conhece.
4. O `CardsTable` renderiza cada botão como `<dashboard>/link?id=<id do produto>&store=<loja>`.

## Identidade de um produto

```text
<site.url>/<slug do post>/<id do produto>
```

Exemplo: `https://example.com/melhor-airfryer-8-litros/arno-dual-afd2-8-3l`.

- O id usa o slug do post, não o nome da lista. O mesmo produto em dois posts são dois registros.
- Mudar o slug do post ou o `id` do produto cria um registro novo e remove o antigo no próximo build. Os cliques do registro antigo são apagados junto.
- O mesmo `id` duas vezes no mesmo post é erro: o build falha e lista os ids repetidos.

## O que entra no catálogo

| Situação | Resultado |
|---|---|
| Produto de lista usada por post publicado, com ao menos um endereço `https://` | Registrado, um link por loja |
| Campo de loja com `#`, vazio ou `null` | Ignorado: essa loja não tem botão |
| Produto sem nenhum endereço real | Não é registrado; a imagem, o título e o botão do Mercado Livre apontam para a oferta padrão |
| Lista que nenhum post publicado usa, post em rascunho ou agendado | Fora do catálogo até ser publicado |
| `site.fallbackAffiliateUrl` | Registrado como `<site.url>/ofertas` (a oferta padrão) |

O envio é uma sincronização completa: o que saiu do site é removido do dashboard.

## Configuração

| Onde | Valor |
|---|---|
| `site.linksDashboardUrl` | Endereço do dashboard. Público, fica no código |
| `LINKS_DASHBOARD_TOKEN` | Token do projeto, gerado no dashboard em Projetos → "Gerar token da API". Só no provedor de deploy, nunca no repositório |

Sem o token:

- Build de produção na Vercel (`VERCEL_ENV=production`): falha.
- Qualquer outro build (local, testes, preview): o catálogo é validado e nada é enviado.

O dashboard só aceita links de um projeto cujo site responde. Em um site novo, publique primeiro uma versão sem posts, crie o projeto no dashboard com a URL do site e só então defina o token.

## Exportar para o dashboard

O painel (`/admin`, seção "Links de afiliado") baixa todos os links dos posts publicados em JSON ou CSV, pelo endpoint `GET /api/v1/affiliate-links?format=json|csv`. O arquivo tem o mesmo conteúdo que o build envia e usa o formato de importação do dashboard (Projetos → "Importar JSON/CSV"), que ignora o que já está cadastrado e os links mortos.

| Formato | Conteúdo |
|---|---|
| JSON | Array de `{ externalId, name, pageUrl, category, links: [{ url, store }] }` |
| CSV | Cabeçalho `externalId,url,name,pageUrl,category,store`, uma linha por link |

O uso normal não depende disso: o build já sincroniza. A exportação serve para conferir o catálogo ou repor os dados em um dashboard novo.

## Reusar em outro site

Troque `site.url`, `site.linksDashboardUrl` e `site.fallbackAffiliateUrl`, crie o projeto no dashboard e defina `LINKS_DASHBOARD_TOKEN` no deploy. `src/lib/affiliate-links.ts` é o mesmo arquivo em todos os sites.

## Comandos

```bash
bun run sync-links   # valida o catálogo; com LINKS_DASHBOARD_TOKEN definido, envia
```

## Limites conhecidos

- Com o dashboard fora do ar, nenhum botão de loja funciona e nenhum build passa.
- O registro acontece no build, não no clique em "Salvar" do painel. Um link salvo que o dashboard recusa aparece como deploy que não termina; o motivo está no log do build.
- Links de loja escritos direto no texto do post não passam pelo dashboard. Não os use.
