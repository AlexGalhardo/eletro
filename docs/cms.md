# CMS (fase BETA)

Estado em 2026-10-06: a camada de servidor abaixo está escrita e testada, o painel publica posts, listas de produtos e imagens, a API de conteúdo está em [`api.md`](api.md) e a newsletter em [`newsletter.md`](newsletter.md). O que falta está no [`PLAN.md`](../PLAN.md).

## Peças

| Arquivo | Papel | Testado |
|---|---|---|
| `src/lib/server/db/schema.ts` | Tabelas do better-auth, `subscriber`, `newsletter_dispatch` e `newsletter_delivery` | sim (PGlite) |
| `src/lib/server/db/index.ts` | `getDb()`: Neon com `DATABASE_URL`, PGlite local sem ela | sim (PGlite; Neon real ainda não) |
| `drizzle/` | Migrations SQL geradas pelo drizzle-kit | sim |
| `src/lib/server/auth.ts` | better-auth com GitHub; `getAdmin(headers)` devolve o admin ou `null`; `testLogin` para testes | sim |
| `src/hooks.server.ts` | Protege `/admin`, entrega `/api/auth/*` ao better-auth, aplica `noindex` | sim (e2e) |
| `src/routes/admin/` | Telas do painel (ver "Painel" abaixo) | sim (e2e) |
| `src/lib/admin/` | Editores, campo de imagem, status do deploy e cliente da API usados pelas telas | sim (e2e) |
| `src/lib/server/deploy.ts` | Diz se uma versão de post ou lista já está no deploy em execução | sim (e2e manual, ver abaixo) |
| `src/routes/api/test/login/` | Login de testes, só com `AUTH_TEST_LOGIN_TOKEN` | sim (e2e) |
| `src/lib/server/store/` | `ContentStore`: GitHub (commits) ou disco local | sim |
| `src/lib/server/cms.ts` | Regras de posts, listas de produtos e imagens | sim |
| `src/lib/content/validate-body.ts` | Recusa no corpo do post o que o mdsvex trataria como código | sim |

## Banco

- Com `DATABASE_URL`, usa Neon pelo driver HTTP. As migrations são aplicadas com `bun run db:migrate`.
- Sem `DATABASE_URL`, usa PGlite em `.data/pglite` (ou `PGLITE_DIR`) e aplica as migrations ao iniciar.
- Mudou o schema: `bun run db:generate` e commit do SQL gerado.
- O driver HTTP do Neon não tem transação interativa. Use comandos atômicos.

## Autenticação

- Login pelo GitHub e pelo Google. Os dois pedem apenas identidade; cada um aparece em `/admin/login` quando as suas duas variáveis estão definidas.
- `ADMIN_GITHUB_USERS` é a lista de usuários do GitHub permitidos, e `ADMIN_EMAILS` a de e-mails permitidos (é a que vale para o Google). O e-mail só conta quando o provedor o marca como verificado. Quem está fora não ganha conta, e as listas são conferidas de novo a cada requisição.
- Login e e-mail não mudam depois de a conta existir: um hook recusa a alteração pelo `update-user`, para ninguém se renomear para dentro da lista.
- Quem entra pelo Google não tem usuário do GitHub: os commits de conteúdo saem com o nome da pessoa e o endereço `<domínio do site>@users.noreply.github.com`.
- `missingAuthConfig()` lista as variáveis que faltam; sem elas `getAuth()` devolve `null` e o painel fica indisponível, sem derrubar o site.
- `AUTH_TEST_LOGIN_TOKEN` liga o plugin de testes do better-auth para os testes automatizados criarem sessão. Só vale com o banco PGlite local: é ignorado quando existe `DATABASE_URL` e em produção (`VERCEL_ENV` ou `CONTEXT` igual a `production`).
- `POST /api/test/login` com `{ "token", "githubLogin" }` devolve o cookie de sessão. Sem a variável a rota responde 404; token errado, 401; usuário fora da lista, 403.
- `/admin/login` mostra os botões "Entrar com GitHub" e "Entrar com Google" (os que estiverem configurados) ou, se faltar configuração, a lista das variáveis ausentes. O layout do painel (`src/routes/admin/+layout.svelte`) tem a navegação e o botão "Sair".
- Páginas do painel não carregam os scripts de analytics.

## Painel

| Tela | O que faz |
|---|---|
| `/admin` | Totais de posts por status, listas, assinantes confirmados, itens aguardando deploy e últimos commits de conteúdo |
| `/admin/posts` | Lista com busca, filtro por status e categoria |
| `/admin/posts/new`, `/admin/posts/<slug>` | Editor: campos do frontmatter, Markdown com pré-visualização, FAQ, capa, inserção de lista de produtos, exclusão |
| `/admin/products`, `/admin/products/new`, `/admin/products/<lista>` | Editor de produtos em formulário: dados, links, vantagens, ficha técnica, ordem |
| `/admin/media` | Imagens de `covers` e `posts`, com upload |
| `/admin/import` | Importa uma review de um site permitido e cria um rascunho (ver "Importação por web scraping") |

- As telas leem do `ContentStore` nos `+page.server.ts` e gravam pela API `/api/v1` (`src/lib/admin/api.ts`), que é o único caminho de escrita.
- O formulário de produtos preserva as chaves que não conhece em cada produto. Id de produto deixado vazio é gerado do nome ao salvar.
- A pré-visualização do Markdown roda em um `iframe` com `sandbox`: nenhum script do texto executa. Ela não renderiza os cartões de produto, só indica onde a lista entra.
- **Status do deploy:** o painel compara o hash do arquivo salvo com o do arquivo empacotado no build em execução (`deploy.ts`). Diferente significa "aguardando deploy"; no editor a página se recarrega a cada 20 s até o deploy novo responder. Com o store local o aviso é "aparece no próximo build".
- Limites conhecidos: um post cujo frontmatter não é mais válido aparece na lista como "Com erro" mas não abre no editor (corrija o arquivo no repositório); post excluído que ainda está no ar não entra na contagem "aguardando deploy"; imagem recém-enviada só carrega na biblioteca depois do deploy; os últimos commits só aparecem com o store do GitHub.

## Importação por web scraping

`/admin/import` recebe o endereço de uma review, chama `POST /api/v1/imports` e o serviço `importPost` (`src/lib/server/post-import.ts`) faz, em sequência: baixa a página, extrai os produtos (`webscrapping/parse.ts`), monta o rascunho (`webscrapping/build.ts`), envia as fotos com `uploadImage`, grava a lista com `saveProductList` e o post com `savePost`.

- **Só sites permitidos:** `site.postImport` em `src/lib/site.config.ts` lista os hosts de página (`sourceHosts`) e de imagem (`imageHosts`). Só `https`, host exato, sem porta nem credenciais; cada redirecionamento é conferido de novo; toda requisição tem tempo limite e tamanho máximo.
- **O que vem da origem:** nomes, fotos, ficha técnica e ordem dos `maxProducts` primeiros produtos. O texto da origem não é copiado: título, descrição, corpo e FAQ saem de modelos genéricos sobre a ficha técnica e precisam ser reescritos.
- **O que fica para o admin:** links de afiliado (`#`), capa (vazia), revisão do texto e dos direitos das fotos. O post nasce com `draft: true`.
- Importar a mesma página duas vezes é recusado antes de qualquer gravação. Se uma etapa falhar no meio, as fotos já enviadas ficam no store sem uso.
- O parser é escrito para o layout do primeiro site de origem. Site novo exige host na lista e, quase sempre, parser novo.

Relatório completo, limites e como rodar pela linha de comando: [webscrapping-modelation.md](webscrapping-modelation.md).

## Armazenamento de conteúdo

`getStore()` escolhe a implementação:

| Condição | Store | Efeito de salvar |
|---|---|---|
| `GITHUB_TOKEN` e `GITHUB_REPO` definidos | GitHub | Commit em `GITHUB_BRANCH`, que dispara o deploy |
| Caso contrário | Disco local | Grava na cópia de trabalho (`CONTENT_ROOT` ou a pasta atual) |

- `history(dir, limit)` devolve os últimos commits de uma pasta (GitHub) ou uma lista vazia (disco local).
- `sha` é o hash de blob do Git e funciona como versão. Gravar ou remover com `sha` desatualizado lança `ConflictError`; criar um arquivo que já existe também.
- Os commits de conteúdo são assinados com o nome do admin e o e-mail `<login>@users.noreply.github.com`, nunca o e-mail privado da conta.
- Use um token fine-grained com permissão "Contents: Read and write" só no repositório do site.
- Limite conhecido: a API de conteúdo do GitHub lista até 1.000 arquivos por pasta.

## Serviço (`cms.ts`)

Todas as funções recebem o store, o que permite testar com uma pasta temporária.

| Função | Regra principal |
|---|---|
| `listPosts(store, bundled)` | Lista todos os posts com status; só lê do store os arquivos que mudaram desde o build |
| `getPost`, `savePost`, `deletePost` | Slug validado, frontmatter pelo schema, corpo por `validateBody`, listas referenciadas e capa local precisam existir |
| `listProductLists`, `getProductList`, `saveProductList` | Schema de produto, ids sem repetição, ao menos um produto, imagens locais precisam existir |
| `uploadImage`, `listImages` | WebP, JPEG ou PNG reconhecidos pela assinatura do arquivo, até 4 MB, nome normalizado, nunca sobrescreve |

Imagem local (`/images/...`) que não está no store é recusada porque o site é pré-renderizado: uma página apontando para um arquivo que não existe derruba o build, e com ele o deploy. URLs externas não são conferidas.

Erros: `ValidationError` (mensagens em português, prontas para a tela), `NotFoundError` e `ConflictError`.

## Variáveis de ambiente

Declaradas em `src/env.ts` e descritas em `.env.example`: `DATABASE_URL`, `PGLITE_DIR`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_GITHUB_USERS`, `AUTH_TEST_LOGIN_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CONTENT_ROOT`, `CRON_SECRET`.
