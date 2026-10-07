# API REST (`/api/v1`)

A descrição completa, gerada dos mesmos schemas zod que validam o conteúdo, é servida em `/api/v1/openapi.json` (OpenAPI 3.1). Este documento resume as regras.

## Endpoints

| Método e caminho | Acesso | O que faz |
|---|---|---|
| `GET /health` | público | Status e versão |
| `GET /posts` | público | Posts publicados, mais novos primeiro. Query: `page`, `pageSize` (até 100), `category`, `q` |
| `GET /posts/{slug}` | público | Post publicado com o corpo em Markdown |
| `GET /categories` | público | Categorias com a contagem de posts |
| `GET /products` | público | Nomes das listas de produtos |
| `GET /products/{list}` | público | Produtos de uma lista |
| `GET /openapi.json` | público | Descrição OpenAPI |
| `POST /contact` | público | Mensagem do formulário de contato |
| `POST /newsletter/subscribers` | público | Inscrição na newsletter (`email`); responde 202 sempre |
| `POST /newsletter/confirm` | público | Confirma a inscrição com o `token` do e-mail |
| `POST /newsletter/unsubscribe` | público | Descadastro com o `token` do e-mail |
| `POST /posts` | admin | Cria um post (`slug` + campos do post) |
| `PUT /posts/{slug}` | admin | Substitui o post (`sha` + campos do post) |
| `DELETE /posts/{slug}?sha=` | admin | Exclui o post |
| `POST /products` | admin | Cria uma lista (`name`, `products`) |
| `PUT /products/{list}` | admin | Substitui a lista (`sha`, `products`) |
| `DELETE /products/{list}?sha=` | admin | Exclui a lista; antes, os posts que a usam perdem o `<CardsTable>` dela e viram rascunho |
| `GET /media?folder=` | admin | Imagens de `covers` ou `posts` |
| `POST /media` | admin | Upload multipart (`file`, `folder`) |
| `POST /newsletter/dispatches` | admin | Coloca o aviso de um post (`slug`) na fila |
| `POST /newsletter/dispatches/run` | admin ou `CRON_SECRET` | Envia a fila; `GET` faz o mesmo só com o `CRON_SECRET` |
| `POST /google/sitemap` | admin | Reenvia o `sitemap.xml` ao Google Search Console; 503 sem as variáveis do Google, 502 quando o Google recusa (o motivo vem em `details`). Ver [google-console-analytics-setup.md](google-console-analytics-setup.md) |
| `POST /imports` | admin | Importa uma review de um site permitido como rascunho (`url`); com `MISTRAL_API_KEY`, reescreve resumo e FAQ (`rewritten`); monta a capa com 3 fotos (`cover`); o que ficou de fora vem em `warnings`. Ver [webscrapping-modelation.md](webscrapping-modelation.md) |

## Regras

- **Leitura** vem do conteúdo empacotado no build: rascunho e post agendado respondem 404, e uma alteração só aparece depois do deploy. As respostas de `GET` levam `Access-Control-Allow-Origin: *`.
- **Escrita** exige a sessão de admin (cookie do better-auth) e passa pelo serviço `cms.ts`, que valida e grava no `ContentStore`. Sem sessão: 401.
- **Versão:** `sha` é a versão do arquivo. Criar algo que já existe ou gravar com `sha` desatualizado responde 409, nunca sobrescreve.
- **Formato de sucesso:** `{ "data": ... }`; a lista de posts traz também `pagination` (`page`, `pageSize`, `totalItems`, `totalPages`). `DELETE` responde 204 sem corpo.
- **Formato de erro**, igual em todo endpoint: `{ "error": { "code", "message", "details"? } }`. `details` é uma lista de mensagens; nas falhas de conteúdo elas vêm em português, prontas para a tela.

| Status | `code` | Quando |
|---|---|---|
| 400 | `invalid_request` | Query ou corpo fora do formato |
| 400 | `validation_failed` | Conteúdo recusado pelo `cms.ts` |
| 401 | `unauthorized` | Escrita sem sessão de admin |
| 404 | `not_found` | Recurso não existe |
| 409 | `conflict` | Já existe, ou `sha` desatualizado |
| 429 | `rate_limited` | Mais de 60 escritas por minuto do mesmo endereço no mesmo endpoint, em todo `/api` (`Retry-After` em segundos) |
| 503 | `content_store_unavailable` | O deploy não tem `GITHUB_TOKEN` e `GITHUB_REPO` e o disco não aceita escrita |
| 500 | `internal_error` | Erro inesperado (detalhe só no log do servidor) |

## Limites conhecidos

- O limite de requisições fica na memória de cada instância do servidor. Em plataforma serverless cada instância conta separado; é uma barreira contra abuso simples, não uma garantia.
- Requisição de escrita sem corpo (o `DELETE`) feita fora do navegador precisa do cabeçalho `Origin` do próprio site: sem ele a proteção CSRF do SvelteKit responde 403.
- Não há endpoint para excluir lista de produtos nem imagem.
- `GET /newsletter/dispatches/run` altera estado apesar de ser `GET`: existe porque agendadores como o Vercel Cron só chamam com `GET`. Detalhes em [`newsletter.md`](newsletter.md).
- As operações não têm `operationId` no `openapi.json`.

## Onde fica o código

| Arquivo | Papel |
|---|---|
| `src/routes/api/v1/**/+server.ts` | Um arquivo por recurso |
| `src/lib/server/api.ts` | Formato de erro, `requireAdmin`, validação de query e corpo, limite de requisições |
| `src/lib/server/openapi.ts` | Documento OpenAPI |
| `src/hooks.server.ts` | Aplica o limite de escrita, o CORS de leitura e o `noindex` |
| `tests/integration/api.test.ts` | Todo endpoint (200, 400, 401, 404, 409) e a conferência entre rotas e `openapi.json` |
