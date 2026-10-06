# CMS (fase BETA)

Estado em 2026-10-06: a camada de servidor abaixo está escrita. Só o armazenamento e o serviço de conteúdo têm testes. Não existe nenhuma tela em `/admin` nem rota de API de conteúdo ainda. O que falta está no [`PLAN.md`](../PLAN.md).

## Peças

| Arquivo | Papel | Testado |
|---|---|---|
| `src/lib/server/db/schema.ts` | Tabelas do better-auth, `subscriber` e `newsletter_dispatch` | não |
| `src/lib/server/db/index.ts` | `getDb()`: Neon com `DATABASE_URL`, PGlite local sem ela | não |
| `drizzle/` | Migrations SQL geradas pelo drizzle-kit | não |
| `src/lib/server/auth.ts` | better-auth com GitHub; `getAdmin(headers)` devolve o admin ou `null` | não |
| `src/hooks.server.ts` | Protege `/admin`, entrega `/api/auth/*` ao better-auth, aplica `noindex` | parcial (e2e do `noindex`) |
| `src/lib/server/store/` | `ContentStore`: GitHub (commits) ou disco local | sim |
| `src/lib/server/cms.ts` | Regras de posts, listas de produtos e imagens | sim |
| `src/lib/content/validate-body.ts` | Recusa no corpo do post o que o mdsvex trataria como código | sim |

## Banco

- Com `DATABASE_URL`, usa Neon pelo driver HTTP. As migrations são aplicadas com `bun run db:migrate`.
- Sem `DATABASE_URL`, usa PGlite em `.data/pglite` (ou `PGLITE_DIR`) e aplica as migrations ao iniciar.
- Mudou o schema: `bun run db:generate` e commit do SQL gerado.
- O driver HTTP do Neon não tem transação interativa. Use comandos atômicos.

## Autenticação

- Login só pelo GitHub. O OAuth pede apenas identidade.
- `ADMIN_GITHUB_USERS` é a lista de usuários permitidos. Quem está fora não ganha conta, e a lista é conferida de novo a cada requisição.
- `missingAuthConfig()` lista as variáveis que faltam; sem elas `getAuth()` devolve `null` e o painel fica indisponível, sem derrubar o site.
- `AUTH_TEST_LOGIN_TOKEN` liga o plugin de testes do better-auth para os testes automatizados criarem sessão. É ignorado em produção (`VERCEL_ENV` ou `CONTEXT` igual a `production`). A rota que o usa ainda não foi escrita.

## Armazenamento de conteúdo

`getStore()` escolhe a implementação:

| Condição | Store | Efeito de salvar |
|---|---|---|
| `GITHUB_TOKEN` e `GITHUB_REPO` definidos | GitHub | Commit em `GITHUB_BRANCH`, que dispara o deploy |
| Caso contrário | Disco local | Grava na cópia de trabalho (`CONTENT_ROOT` ou a pasta atual) |

- `sha` é o hash de blob do Git e funciona como versão. Gravar ou remover com `sha` desatualizado lança `ConflictError`; criar um arquivo que já existe também.
- Use um token fine-grained com permissão "Contents: Read and write" só no repositório do site.
- Limite conhecido: a API de conteúdo do GitHub lista até 1.000 arquivos por pasta.

## Serviço (`cms.ts`)

Todas as funções recebem o store, o que permite testar com uma pasta temporária.

| Função | Regra principal |
|---|---|
| `listPosts(store, bundled)` | Lista todos os posts com status; só lê do store os arquivos que mudaram desde o build |
| `getPost`, `savePost`, `deletePost` | Slug validado, frontmatter pelo schema, corpo por `validateBody`, listas referenciadas precisam existir |
| `listProductLists`, `getProductList`, `saveProductList` | Schema de produto, ids sem repetição, ao menos um produto |
| `uploadImage`, `listImages` | WebP, JPEG ou PNG reconhecidos pela assinatura do arquivo, até 4 MB, nome normalizado, nunca sobrescreve |

Erros: `ValidationError` (mensagens em português, prontas para a tela), `NotFoundError` e `ConflictError`.

## Variáveis de ambiente

Declaradas em `src/env.ts` e descritas em `.env.example`: `DATABASE_URL`, `PGLITE_DIR`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_GITHUB_USERS`, `AUTH_TEST_LOGIN_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CONTENT_ROOT`, `CRON_SECRET`.
