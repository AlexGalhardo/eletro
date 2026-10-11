# Deploy

Como colocar o site e o painel no ar na Vercel ou na Netlify.

> **Estado:** este passo a passo foi escrito a partir do código e da documentação das plataformas. **Nenhum deploy desta versão foi feito ainda**, então nada aqui foi exercitado de ponta a ponta. A seção "Conferir depois do primeiro deploy" lista o que precisa ser validado.

Vai publicar na Vercel? O passo a passo detalhado, tela por tela, está em [`setup-vercel.md`](setup-vercel.md).

O site público não precisa de nenhuma configuração: conecte o repositório e publique. Tudo abaixo é para o painel `/admin`, a newsletter e o envio de e-mails.

## Visão geral

| Peça | Serviço | Para quê |
|---|---|---|
| Hospedagem | Vercel ou Netlify | Site estático e funções do painel e da API |
| Banco | Neon (Postgres) | Sessões do painel e assinantes da newsletter |
| Login | OAuth App do GitHub | Entrada no painel |
| Conteúdo | Token fine-grained do GitHub | Commits de posts, produtos e imagens feitos pelo painel |
| E-mail | Resend | Formulário de contato e newsletter |

Cada commit na `main`, inclusive os feitos pelo painel, dispara um deploy. É assim que o conteúdo chega ao site: de 1 a 2 minutos depois de salvar.

## 1. Hospedagem

O projeto usa `@sveltejs/adapter-vercel`. O `adapter-auto` foi trocado porque instalava o adaptador durante o build, e o segundo build na Vercel, com cache, falhava (`ERR_PACKAGE_PATH_NOT_EXPORTED` em `estree-walker`).

**Vercel:** importe o repositório. Framework "SvelteKit", comando de build `bun run build` (ou o padrão), gerenciador Bun. O arquivo `vercel.json` do repositório define os cabeçalhos de segurança e o cache das imagens.

**Netlify:** troque antes o adaptador por `@sveltejs/adapter-netlify` em `vite.config.ts`. Depois importe o repositório, com comando de build `bun run build`. O arquivo `static/_headers` faz o papel do `vercel.json`.

Use Node 24 nas duas: é a versão fixada em `engines` do `package.json`.

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

O build de produção na Vercel (`VERCEL_ENV=production`) confere as variáveis antes de tudo (`scripts/check-env.ts`) e **falha** quando falta uma obrigatória ou quando alguma está com o formato errado. A mensagem lista uma linha por variável, sem mostrar valores. Regras e formatos: [development.md](development.md#conferência-no-build).

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

Os avisos de post ficam na fila até alguém rodar o envio. Sem agendador, isso é feito pelo botão "Enviar fila agora" em `/admin/newsletter`. Para automatizar, agende uma chamada `GET` a `/api/v1/newsletter/dispatches/run` com o cabeçalho `Authorization: Bearer <CRON_SECRET>`.

**Vercel:** acrescente ao `vercel.json`:

```json
"crons": [{ "path": "/api/v1/newsletter/dispatches/run", "schedule": "*/15 * * * *" }]
```

A Vercel envia o `CRON_SECRET` do projeto como `Bearer` nas chamadas de cron. No plano gratuito o cron roda no máximo uma vez por dia: use um horário diário, como `0 12 * * *`, ou o deploy falha.

**Netlify ou outro:** use um serviço de agendamento que chame a URL com o cabeçalho.

## Conferir depois do primeiro deploy

- [ ] O site público abre e as 64 páginas de post respondem.
- [ ] `curl -I` na home mostra `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Strict-Transport-Security` (vêm de `vercel.json` ou `static/_headers`).
- [ ] `/admin` leva ao login, e o login pelo GitHub entra com um usuário da lista e recusa um de fora.
- [ ] Salvar um post pelo painel cria um commit `content:` no repositório e o post aparece no site depois do deploy; o indicador do editor passa de "Publicando" para "No ar".
- [ ] Enviar uma imagem pela biblioteca de mídia funciona e a imagem carrega depois do deploy.
- [ ] A inscrição na newsletter envia o e-mail de confirmação, e o link confirma.
- [ ] Importar um post em `/admin/import` termina dentro do tempo limite da função. Com o store do GitHub são cerca de 9 commits em sequência; a Vercel dá 300 s por padrão, e o limite da Netlify não foi confirmado.
- [ ] PageSpeed Insights na home e em um post (meta: 90 ou mais; ver [`performance.md`](performance.md)).
- [ ] As cópias redimensionadas das capas existem (`/images/covers/w480/<arquivo>.webp` responde 200): o `sharp` rodou no build da plataforma.

Marque no [`PLAN.md`](../PLAN.md) o que for confirmado.

## CI

O deploy não depende do GitHub Actions. Os workflows de CI e release estão inativos; veja [`ci-cd.md`](ci-cd.md).
