# Web scraping de posts: estudo e importação

Relatório do estudo feito em 2026-10-06 e documentação do que foi implementado a partir dele.

## Resultado em uma leitura

- **Dá para raspar os posts do eletrosinter.com.br com TypeScript.** A página chega completa em HTML estático com um `fetch` simples. Não foi preciso navegador (Playwright) nem Python.
- **Ferramenta:** `fetch` nativo + [`cheerio`](https://cheerio.js.org/) 1.2.0 (parser de HTML, a última versão estável em `npm view cheerio version`). É a única dependência nova.
- **Virou funcionalidade:** o admin cola o endereço em `/admin/import` e o painel cria um rascunho com os 7 primeiros produtos.
- **Um rascunho real foi criado** pelo próprio importador: `content/posts/melhor-lava-loucas-portatil.mdx`.
- **Capa montada automaticamente.** A importação junta 3 fotos dos produtos, escolhidas ao acaso, sobre um fundo de cor clara aleatória, com o endereço do site em negrito no canto inferior direito. Não usa IA nem API externa: é montagem com `sharp`.
- **Resumo e FAQ reescritos por IA.** Com `MISTRAL_API_KEY` configurada, o resumo e o FAQ da origem são reescritos pela API da Mistral e viram a descrição, a introdução e o FAQ do rascunho. Sem a chave, ou se a Mistral falhar, o texto é genérico, gerado a partir da ficha técnica. Em nenhum caso o texto da origem é gravado como está.

## O que o `robots.txt` diz

`https://eletrosinter.com.br/robots.txt`, lido em 2026-10-06:

```text
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: https://eletrosinter.com.br/sitemap_index.xml
```

Os posts não estão bloqueados. Só `/wp-admin/` é proibido, e o importador nunca acessa esse caminho. O `robots.txt` trata de acesso por robôs; ele não dá permissão para reutilizar texto ou imagens (ver "Limites e riscos").

## Ferramentas avaliadas

| Ferramenta | Resultado |
|---|---|
| `fetch` (Bun/Node) | Funcionou. Resposta 200, `text/html`, cerca de 550 KB, com todos os produtos no HTML |
| `cheerio` 1.2.0 | Funcionou. Seletores CSS sobre o HTML; roda em função serverless |
| Playwright (já instalado para os testes) | Não foi necessário. Também não serviria em produção: um navegador não cabe em uma função da Vercel ou da Netlify |
| Python | Não foi necessário, porque a rota TypeScript funcionou |

Proteção contra robôs: o site está atrás do Cloudflare e o HTML traz a configuração de um plugin com reCAPTCHA/Turnstile para formulários, mas nenhuma página de desafio apareceu. As requisições usaram um `User-Agent` que se identifica, em sequência e com pausa. Se o site passar a exibir desafio, a importação falha com a mensagem do status recebido; não há tentativa de contornar.

Requisições feitas ao site no estudo: `robots.txt`, dois sitemaps (mais uma tentativa que respondeu 302) e a página de um post, duas vezes (uma no estudo, uma na importação real). As 7 fotos vieram do CDN da Amazon.

## Estrutura de um post da origem

O site é WordPress com um tema próprio. Seletores usados em `webscrapping/parse.ts`:

| Dado | Seletor | Observação |
|---|---|---|
| Título | `article h1` | Só o assunto é aproveitado (ver "Como o rascunho é montado") |
| Categoria | primeiro segmento da URL (`/cozinha/...`) | Também aparece em `.breadcrumb` |
| Cartão de produto | `.box-products` | Um por produto, na ordem do ranking |
| Nome do produto | `.box-products .bp-title` | O mesmo texto do `h2.wp-block-heading` acima do cartão |
| Foto do produto | `.box-products .bp-image img[src]` | Hospedada em `m.media-amazon.com`, 500 px |
| Vantagens e desvantagens | `.box-pro-contra .pros li`, `.contras li` | Lidas só para consulta; não vão para o rascunho |
| Ficha técnica | `.box-ficha-tecnica li` | Rótulo em `<strong>`, valor no restante do item |
| FAQ | `#rank-math-faq .rank-math-list-item` (`.rank-math-question`, `.rank-math-answer`) | Enviado à Mistral para reescrita; não é gravado como está |
| Resumo | `p.resumo` | Enviado à Mistral para reescrita; não é gravado como está |
| Data, capa | `time[datetime]`, `figure.thumbnail-destacada img` | Não usados |

Os blocos de vantagens e de ficha técnica são irmãos do cartão no HTML, até o próximo título (`.titulo-numerado`). O parser percorre esses irmãos para não misturar dados de produtos vizinhos. A página tem ainda dois resumos do ranking (`.lr-container`), ignorados porque repetem os mesmos produtos.

## O que foi implementado

```text
webscrapping/            TypeScript puro, sem imports do SvelteKit
  parse.ts               html + url -> dados (função pura)
  fetch.ts               download com lista de hosts, tempo limite e tamanho máximo
  build.ts               dados -> rascunho (post + lista de produtos), função pura
  rewrite.ts             resumo e FAQ da origem -> texto reescrito pela Mistral
  cover.ts               fotos dos produtos -> capa WebP 1280x720
  cover-font.ts          Inter Bold embutida em base64 (gerado)
  cli.ts                 execução manual
  fixture.ts             página sintética usada nos testes
src/lib/server/post-import.ts          serviço importPost(store, url, author, now, mistralApiKey)
src/routes/api/v1/imports/+server.ts   POST /api/v1/imports (admin)
src/routes/admin/import/+page.svelte   tela "Importar"
```

Fluxo: a tela chama `POST /api/v1/imports` com `{ "url": "..." }`. O serviço baixa a página, extrai os produtos, monta o rascunho, pede à Mistral a reescrita do resumo e do FAQ (quando há chave), confere se o slug já existe, baixa e envia cada foto com `uploadImage`, grava a lista com `saveProductList` e o post com `savePost`. Tudo passa pelas validações do `cms.ts`, as mesmas do editor.

### Como rodar pela linha de comando

```bash
# Mostra os dados raspados e o rascunho, sem gravar nada
bun webscrapping/cli.ts https://eletrosinter.com.br/cozinha/lava-loucas-portatil/

# Grava fotos, lista e post na cópia de trabalho (store local)
bun webscrapping/cli.ts https://eletrosinter.com.br/cozinha/lava-loucas-portatil/ --write
```

Com `MISTRAL_API_KEY` no ambiente (o Bun lê o `.env`), os dois modos reescrevem o resumo e o FAQ. O script não faz parte do build. Sem `--write`, a saída inclui as vantagens e desvantagens da origem, úteis como referência para quem vai reescrever.

### Como o rascunho é montado

- **Slug e lista:** `melhor-` + último segmento da URL de origem. O post e a lista têm o mesmo nome.
- **Produtos:** os 7 primeiros (`site.postImport.maxProducts`), na ordem da origem. Nome e ficha técnica são fatos e são reaproveitados. Valor "não especificado" é descartado.
- **Vantagens:** a origem tem uma lista pronta, mas ela é texto de outra redação. O rascunho repete até 5 itens curtos da ficha técnica no lugar ("Capacidade: 5 litros"), para o admin substituir.
- **Texto:** título e uma seção por produto saem de modelos fixos preenchidos com nomes e ficha técnica. Descrição, introdução e FAQ vêm da reescrita da Mistral (ver abaixo) ou, sem ela, dos mesmos modelos. Nenhuma frase da origem é gravada como está, e há teste garantindo isso.
- **Categoria:** a seção da URL de origem precisa existir em `site.categories`. Um post de `cuidados-pessoais`, por exemplo, é recusado com uma mensagem clara.
- **Links de afiliado:** `mercadolivreUrl`, `shopeeUrl` e `amazonUrl` ficam como `"#"`.
- **Capa:** montada pelo `webscrapping/cover.ts` (ver abaixo) e gravada em `static/images/covers/<slug>-cover.webp`. Se a montagem falhar, o campo fica vazio, a importação continua e a tela avisa; a página do post e a home só exibem a capa quando o campo está preenchido.
- **Rascunho:** `draft: true`, com `ref` apontando para a origem.

### Capa gerada

- **Como:** 3 das fotos baixadas, escolhidas ao acaso, recortadas do fundo branco e lado a lado sobre um fundo pastel aleatório (matiz qualquer, luminosidade de 86% a 92%), apoiadas na mesma linha de base.
- **Recorte do fundo:** `removeWhiteBackground` faz um preenchimento a partir das bordas da foto sobre pixels quase brancos (os três canais em 252 ou mais) e os deixa transparentes. Partes brancas do produto que não tocam a borda ficam; o contorno ganha transparência parcial para não serrilhar. Depois a foto é cortada no produto e ampliada para ocupar o espaço. Limite: serve para o fundo branco liso das fotos de loja. Foto com cenário ou degradê fica com o fundo, e um produto branco encostado na borda da foto pode perder um pedaço da lateral. O texto de `site.postImport.coverText` ("EletroRadar.com.br") vai em negrito no canto inferior direito. Saída: WebP 1280×720, de 25 a 40 KB.
- **Sem IA de propósito:** modelos de imagem redesenham o produto (o aparelho sai diferente do real) e erram letras com frequência. A montagem com código é igual toda vez, não tem custo e não depende de serviço externo.
- **Fonte:** o texto vira contorno vetorial com `opentype.js` a partir da Inter Bold embutida em `cover-font.ts`, porque a função serverless não tem fontes instaladas. O contorno é montado letra por letra (sem kerning): o `opentype.js` 2.0 falha nas substituições contextuais da Inter e formata `-0` colado ao número anterior, então o `cover.ts` escreve o SVG ele mesmo.
- **Dependências:** `sharp` passou a rodar no servidor (antes só no build) e `opentype.js` 2.0.0 é nova.
- **Trocar a capa:** pelo editor do post, como qualquer outra.

### Reescrita com a Mistral

- **Onde:** `webscrapping/rewrite.ts`, chamado por `importPost` depois que a página já virou um rascunho válido (uma página sem produtos falha antes de gastar uma chamada).
- **API:** `POST https://api.mistral.ai/v1/chat/completions`, modelo `mistral-small-latest`, `response_format: json_object`, `max_tokens` 2000, tempo limite de 60 s. O plano gratuito ("Experiment") da Mistral atende: é uma chamada por importação.
- **Entrada:** o assunto, o resumo (`p.resumo`) e até 8 perguntas do FAQ da origem.
- **Saída:** `description`, `intro` (1 a 4 parágrafos) e `faq`. A resposta é validada por schema, cada texto passa por `clean` (sem `{`, `}`, `<`, `>`, que o mdsvex leria como código) e tem tamanho máximo. Depois, o post passa pelas validações do editor como qualquer outro.
- **Instruções ao modelo:** reescrever com outras palavras, em português do Brasil, sem inventar dados técnicos, sem citar a origem, sem Markdown e ignorando instruções que venham no texto da origem.
- **Falha:** sem chave, origem sem resumo nem FAQ, erro da API (por exemplo 429 por limite do plano gratuito) ou resposta fora do formato: a importação continua com o texto genérico, e a tela mostra o motivo (`warnings`).
- **Revisão:** o texto da IA pode errar fatos ou ficar parecido demais com a origem. Revise antes de mudar `draft` para `false`.

### Como um link `#` aparece no site

Conferido em `src/lib/components/CardsTable.svelte`:

- `mercadolivreUrl: "#"`: o botão do Mercado Livre aparece e aponta para `site.fallbackAffiliateUrl`.
- `shopeeUrl: "#"` e `amazonUrl: "#"`: os botões aparecem com `href="#"`, ou seja, abrem a própria página em outra aba. **São links mortos.**
- A foto e o nome do produto usam o primeiro link preenchido; com `mercadolivreUrl: "#"` eles também apontam para `#`.

Antes de publicar, cada link precisa virar um endereço real ou ser removido da lista (valor `null` ou campo ausente: o botão só aparece quando o campo tem valor).

### Segurança

O servidor busca um endereço digitado pelo admin, o que é uma superfície de SSRF. Por isso:

- Só `https`, com host exatamente igual a um item de `site.postImport.sourceHosts` (páginas) ou `imageHosts` (fotos), sem porta e sem usuário e senha na URL.
- Redirecionamentos são seguidos à mão, no máximo 3, e cada destino passa pela mesma conferência.
- Tempo limite de 10 s por requisição; tamanho máximo de 3 MB para a página e de 4 MB para cada foto.
- O endereço de cada foto vem da página raspada e também é conferido contra a lista antes do download.
- O tipo da imagem é decidido pelos bytes em `uploadImage`, não pela extensão nem pelo cabeçalho.
- O endpoint exige sessão de admin e entra no limite de 60 escritas por minuto.

Para aceitar outro site, inclua o host em `site.postImport` (`src/lib/site.config.ts`). O parser atual só entende o layout do eletrosinter.

## O que foi criado no blog

| Item | Caminho | Origem |
|---|---|---|
| Post (rascunho) | `content/posts/melhor-lava-loucas-portatil.mdx` | Texto gerado por modelos; fatos de <https://eletrosinter.com.br/cozinha/lava-loucas-portatil/> |
| Lista de produtos | `content/products/melhor-lava-loucas-portatil.json` | 7 primeiros produtos da origem (de 10) |
| 7 fotos | `static/images/posts/melhor-lava-loucas-portatil-1.jpg` a `-7.jpg` | Baixadas de `m.media-amazon.com` (fotos de produto da Amazon, 500 px), nos endereços que a página de origem usa |
| Capa | nenhuma | A arte de capa do site de origem não foi copiada (o rascunho é anterior à capa gerada) |

O assunto foi escolhido por não existir em `content/posts/` (nenhum post sobre lava-louças) e por pertencer a uma categoria do site (`cozinha`).

## O que ainda depende do dono

- [ ] Trocar os links de afiliado `#` dos 7 produtos (ou apagar os que não serão usados).
- [ ] Enviar a capa do post (WebP 16:9 em `static/images/covers/`).
- [ ] Reescrever título, descrição, introdução, vantagens e FAQ. O texto atual é um esqueleto (o rascunho é anterior à reescrita pela Mistral).
- [ ] Conferir os dados da ficha técnica. Dois valores da origem parecem errados: "Peso: 0,05kg" (GRFIT) e "Capacidade: 42 litros" (LavaBox Mini).
- [ ] Decidir sobre o uso das fotos. Elas são imagens de produto da Amazon; o programa de associados da Amazon tem regras próprias para uso de imagens.
- [ ] Cadastrar `MISTRAL_API_KEY` na Vercel e conferir uma importação real com a reescrita (não foi possível chamar a API a partir do ambiente de desenvolvimento).
- [ ] Mudar `draft` para `false` quando o post estiver pronto.

## Hospedagem: Vercel e Netlify

A importação roda dentro de uma função serverless comum: só `fetch` e um parser em JavaScript, sem navegador e sem binário nativo.

Tempo medido: **3,1 s** para uma importação real completa com o store local (uma página de 550 KB, 7 fotos de 10 a 25 KB, gravação em disco), em 2026-10-06.

Em produção o store é o GitHub, e cada gravação é um commit feito em sequência (commits em paralelo no mesmo branch entram em conflito): 7 fotos, a lista e o post são 9 commits, mais algumas leituras de conferência. **Esse caminho não foi medido**, porque exigiria um token e commits em um repositório real. A estimativa é de 10 a 25 s, supondo de 1 a 2 s por chamada à API do GitHub.

| Plataforma | Limite padrão | Cabe? |
|---|---|---|
| Vercel | 300 s em todos os planos, segundo a [documentação](https://vercel.com/docs/functions/limitations) consultada em 2026-10-06 | Sim, com folga |
| Netlify | Não confirmado neste estudo: a página de limites não pôde ser lida. De memória, e sem confirmação, o limite de funções síncronas já foi de 10 s, bem abaixo do da Vercel | Conferir na documentação antes de publicar lá. Se o limite for menor que o tempo medido, as saídas são uma função em segundo plano (background function) ou enviar as fotos em um único commit pela API de árvores do Git |

Antes de usar em produção, faça uma importação com o store do GitHub e anote o tempo no `PLAN.md` (item em aberto do grupo B7).

Se um dia a origem passar a depender de JavaScript para renderizar, ou bloquear `fetch`, esta abordagem deixa de funcionar em serverless. A alternativa seria um serviço separado (um worker ou contêiner com navegador, ou um script Python em outro host) que entrega os dados raspados ao endpoint. Não é necessário hoje.

## Limites e riscos

- **Layout da origem:** os seletores são do tema atual do eletrosinter. Uma mudança de layout faz a importação responder "Nenhum produto foi encontrado". O teste usa uma página sintética com a mesma estrutura; ele não avisa quando o site real muda.
- **Um site só:** outro site de origem exige novo host na lista e, quase sempre, outro parser.
- **Texto copiado:** copiar o texto de outro site é problema de direito autoral e de SEO (conteúdo duplicado). O importador não copia, mas o rascunho gerado é pobre: publicar sem reescrever também é ruim para SEO.
- **Ranking de terceiros:** a seleção e a ordem dos produtos são escolhas editoriais da origem. O rascunho guarda a origem em `ref`.
- **Imagens:** ver "O que ainda depende do dono".
- **Etiqueta de acesso:** uma página por importação, mais as fotos, com `User-Agent` identificado. Não use o importador em laço para copiar o site inteiro.
- **Falha no meio:** se a gravação falhar depois de algumas fotos, elas ficam no store sem uso. Importar de novo cria fotos com sufixo (`-1-2.jpg`).
- **Limite de requisições:** o contador de escritas fica na memória de cada instância (ver [api.md](api.md)).

## Testes

| Arquivo | O que cobre |
|---|---|
| `webscrapping/cover.test.ts` | Capa 1280×720 em WebP, contorno do texto válido, sorteio das fotos e da cor |
| `webscrapping/webscrapping.test.ts` | Parser, construtor do rascunho (com e sem texto reescrito), chamada à Mistral simulada e regras do `fetch` (lista de hosts, redirecionamento, tamanho) |
| `tests/integration/import.test.ts` | Serviço e endpoint com store em pasta temporária e `fetch` simulado, inclusive a reescrita e a falha da Mistral |
| `tests/e2e/import.spec.ts` | Acesso à tela e recusa de endereço fora da lista |
| `tests/integration/content.test.ts` | O rascunho real e a lista, como todo conteúdo do repositório |

Nenhum teste acessa a rede nem usa uma chave real.
