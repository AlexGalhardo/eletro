# Deploy

O site público de produção é o GitHub Pages, de graça. O workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) roda a cada push na `main`, gera `dist/` com `bun run build` e publica esse diretório. O domínio `eletroradar` aponta para os endereços do Pages.

O Pages só entrega arquivos. Não executa o painel, a API de escrita, o login, o formulário de contato, a newsletter nem um cron. Esse código continua no repositório e os testes de integração chamam essas funções. [`setup-vercel.md`](setup-vercel.md) é o roteiro antigo e não é o host atual.

## Visão geral

| Peça | Serviço | Para quê |
|---|---|---|
| Hospedagem | GitHub Pages | Site estático (`dist/`) |
| Banco | Neon (Postgres) | Sessões do painel e assinantes da newsletter |
| Login | OAuth App do GitHub | Entrada no painel |
| Conteúdo | Token fine-grained do GitHub | Commits de posts, produtos e imagens feitos pelo painel |
| E-mail | Resend | Formulário de contato e newsletter |

Cada push na `main` dispara o workflow. O site novo sai quando o job `deploy` termina.

## 1. Hospedagem

1. No repositório, Pages → Build and deployment → Source: **GitHub Actions**.
2. O workflow já está em `.github/workflows/pages.yml`. Ele usa Node 24 e Bun 1.4.4, e envia `dist/`.
3. O build grava `CNAME` com `eletroradar` e um `.nojekyll`.
4. DNS do domínio (os nameservers podem continuar onde estão). Registros do apex:

   | Tipo | Nome | Valor |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<usuário>.github.io` |

   Na Vercel, apague antes o ALIAS do apex e o ALIAS `*`. A Vercel recria esses dois enquanto o domínio segue ligado ao projeto, então tire o domínio do projeto e mantenha os TXT e o MX do Resend e o TXT de verificação do Google.

5. No Pages, confira o domínio customizado `eletroradar`. O certificado passa a valer depois que o DNS aponta para esses endereços.

`LINKS_DASHBOARD_TOKEN`, se existir como secret do repositório, é lido pelo workflow e o build registra os links de afiliado. Sem o secret o build só valida o catálogo. O build do Pages não define `VERCEL_ENV`, então não exige banco, login nem cron.

## 2. Banco (Neon)

1. Crie um projeto no [Neon](https://neon.tech) (ou use a integração da Vercel ou da Netlify, que já cria a variável).
2. Copie a string de conexão para `DATABASE_URL` na plataforma.
3. Crie as tabelas, uma vez e a cada migration nova, da sua máquina:

   ```bash
   DATABASE_URL="postgres://..." bun run db:migrate
   ```

Sem `DATABASE_URL` o servidor tenta usar um banco PGlite em disco, que não funciona em função serverless: em produção a variável é obrigatória para o painel e a newsletter.

## 3. Login (OAuth App do GitHub)

1. Em <https://github.com/settings/developers>, crie um "OAuth App".
2. Homepage URL: a URL do site. Authorization callback URL: `<URL do site>/api/auth/callback/github`.
3. Copie o Client ID e gere um Client Secret.

O login pede só a identidade. Ele não dá ao painel acesso aos seus repositórios.

## 4. Conteúdo (token do GitHub)

1. Em <https://github.com/settings/personal-access-tokens>, crie um token **fine-grained**.
2. Repository access: só o repositório do site. Permissions: "Contents: Read and write".
3. Guarde o token em `GITHUB_TOKEN`.

Sem `GITHUB_TOKEN` e `GITHUB_REPO` o painel grava no disco local, o que em produção se perde: as duas variáveis são obrigatórias para o painel publicar.

## 5. E-mail (Resend)

1. Crie uma conta no [Resend](https://resend.com) e verifique o domínio do remetente.
2. Crie uma chave de API.

Sem `RESEND_API_KEY` nenhum e-mail sai: o servidor só registra no log que deixou de enviar.

## 6. Variáveis de ambiente

Cadastre na plataforma, para o ambiente de produção. Todas estão declaradas em `src/env.ts` e descritas em `.env.example`.

`scripts/check-env.ts` confere o formato de toda variável presente. A lista obrigatória abaixo só vale quando `VERCEL_ENV=production`. O GitHub Pages não define essa variável: o site estático publica sem banco e sem login. Regras e formatos: [development.md](development.md#conferência-no-build).

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Obrigatória: string de conexão do Neon (`postgres://` ou `postgresql://`) |
| `BETTER_AUTH_SECRET` | Obrigatória: `openssl rand -base64 32` (no mínimo 32 caracteres) |
| `BETTER_AUTH_URL` | Obrigatória: URL pública do site com `https`, por exemplo `https://example.com` |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Do OAuth App. É obrigatório um par de login completo: este ou o do Google |
| `ADMIN_GITHUB_USERS` | Usuários do GitHub que podem entrar, separados por vírgula. É obrigatória ao menos uma das duas listas (esta ou `ADMIN_EMAILS`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Cliente OAuth do Google (ID terminado em `.apps.googleusercontent.com`, chave no formato `GOCSPX-...`), com a URI de redirecionamento `<URL do site>/api/auth/callback/google` |
| `ADMIN_EMAILS` | E-mails que podem entrar (necessário para o Google), separados por vírgula. Só entra quem tem o e-mail verificado pelo provedor |
| `GITHUB_TOKEN` | Obrigatória: token fine-grained |
| `GITHUB_REPO` | Obrigatória: `dono/repositorio` |
| `GITHUB_BRANCH` | Opcional; padrão `main` |
| `RESEND_API_KEY` | Opcional: chave do Resend |
| `RESEND_FROM_EMAIL` | Opcional: `Nome <no-reply@seu-dominio>` |
| `CONTACT_TO_EMAIL` | Opcional; padrão `contactEmail` de `site.config.ts` |
| `CRON_SECRET` | Obrigatória: `openssl rand -base64 32` (no mínimo 32 caracteres) |
| `LINKS_DASHBOARD_TOKEN` | Obrigatório em produção: chave do dashboard de links (a mesma em todos os sites). Sem ele o build de produção falha. Ver [affiliate-links.md](affiliate-links.md) |
| `MISTRAL_API_KEY` | Opcional: chave da Mistral (<https://console.mistral.ai/api-keys>, plano gratuito serve) para reescrever resumo e FAQ na importação |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE`, `GOOGLE_ANALYTICS_PROPERTY_ID` | Opcionais: dados do Search Console e do Analytics em `/admin/google` (passo a passo em [google-console-analytics-setup.md](google-console-analytics-setup.md)) |

**Quem entra no painel:** só quem está em `ADMIN_EMAILS` (com o e-mail verificado pelo provedor) ou em `ADMIN_GITHUB_USERS`. Para liberar apenas alguns e-mails, liste-os em `ADMIN_EMAILS` e deixe `ADMIN_GITHUB_USERS` sem ninguém além de quem deve entrar: um usuário listado ali entra pelo GitHub mesmo com outro e-mail.

Não defina `AUTH_TEST_LOGIN_TOKEN` nem `PGLITE_DIR` em produção. O login de testes já é ignorado quando existe `DATABASE_URL`, mas a variável não tem motivo para estar lá.

Se usar ambientes de preview, dê a eles um banco e um `BETTER_AUTH_SECRET` próprios: uma sessão criada em um preview que compartilha os dois com a produção vale na produção.

## 7. Agendador da newsletter

O GitHub Pages não chama rotas. A fila de avisos existe no código e nos testes (`GET /api/v1/newsletter/dispatches/run`, cabeçalho `Authorization: Bearer <CRON_SECRET>`). Não há cron no host de produção.

## Conferir depois do primeiro deploy

- [ ] O site público abre e as 64 páginas de post respondem.
- [ ] `curl -I` na home não traz `server: Vercel`. O Pages responde pelo domínio.
- [ ] `/admin` mostra a tela de login estática. Login, gravação, contato e newsletter não rodam nesse host; os testes de integração cobrem essas funções.
- [ ] PageSpeed Insights na home e em um post (meta: 90 ou mais; ver [`performance.md`](performance.md)).
- [ ] As cópias redimensionadas das capas existem (`/images/covers/w480/<arquivo>.webp` responde 200): o `sharp` rodou no build da plataforma.

Marque no [`PLAN.md`](../PLAN.md) o que for confirmado.

## CI

O deploy do site é o workflow `pages.yml`. Os workflows de CI e release continuam inativos; veja [`ci-cd.md`](ci-cd.md).
