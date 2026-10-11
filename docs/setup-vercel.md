# Setup na Vercel, passo a passo

Roteiro completo para colocar este projeto no ar na Vercel, do zero até o painel `/admin` publicando posts. Os exemplos usam o repositório `AlexGalhardo/eletroradar.com.br-cms` e o domínio `eletroradar.com.br`; troque pelos seus.

O resumo de todas as plataformas (inclusive Netlify) está em [`deploy.md`](deploy.md). Este documento detalha só a Vercel.

> **Estado:** escrito a partir do código e da documentação da Vercel. Nenhum deploy desta versão foi feito ainda. Os nomes de menus podem mudar de lugar no painel da Vercel; o que importa é o valor de cada campo.

## O que você vai criar

| Ordem | Onde | O quê | Obrigatório para |
|---|---|---|---|
| 1 | Vercel | Projeto ligado ao repositório | Site público |
| 2 | Vercel | Domínio | Site público no endereço final |
| 3 | Neon | Banco Postgres | Painel e newsletter |
| 4 | GitHub | OAuth App | Login no painel |
| 5 | GitHub | Token fine-grained | Painel publicar conteúdo |
| 6 | Resend | Domínio e chave de API | Contato e newsletter |
| 7 | Vercel | Variáveis de ambiente | Tudo acima funcionar |
| 8 | Vercel | Cron | Envio automático da newsletter (opcional) |

O site público funciona só com o passo 1. Faça o passo 1, confira que o site abre, e siga para os demais.

## Antes de começar

- Conta na [Vercel](https://vercel.com) com acesso à conta do GitHub dona do repositório.
- O código na branch `main` do repositório (`git push origin main`).
- Bun e o projeto rodando na sua máquina (`bash setups/setup-windows-local.sh` ou `bash setups/setup-unix-local.sh`): o passo 3 roda um comando local.
- Na sua máquina, `bun run build` termina sem erro. Um build que falha localmente falha na Vercel também.

## 1. Criar o projeto

1. Abra <https://vercel.com/new>.
2. Em **Import Git Repository**, escolha `eletroradar.com.br-cms`. Se ele não aparecer, clique em **Adjust GitHub App Permissions** e dê à Vercel acesso ao repositório (ele é privado).
3. Na tela de configuração, confira:

   | Campo | Valor |
   |---|---|
   | Framework Preset | `SvelteKit` (detectado sozinho) |
   | Root Directory | `./` |
   | Build Command | padrão (`vite build`), ou `bun run build` |
   | Output Directory | padrão |
   | Install Command | padrão: a Vercel vê o `bun.lock` e usa `bun install` |

4. Não preencha variáveis de ambiente ainda. Clique em **Deploy**.
5. Espere o build (de 2 a 4 minutos na primeira vez: o `sharp` gera as cópias das capas). Ao terminar, abra o endereço `*.vercel.app` e confira a home e um post.

A versão do Node vem de `engines` no `package.json` (`24.x`) e vale mais que a escolhida em **Settings → Build and Deployment → Node.js Version**.

### Se o build falhar

| Mensagem | Causa | O que fazer |
|---|---|---|
| `Invalid vercel.json` | Erro de sintaxe ou campo fora do schema no `vercel.json` | Corrija o arquivo; o schema está em <https://openapi.vercel.sh/vercel.json> |
| Erro de validação de post ou produto | Conteúdo inválido em `content/` | Rode `bun run build` localmente; a mensagem aponta o arquivo |

## 2. Domínio

1. **Settings → Domains → Add Domain**. Digite `eletroradar.com.br`.
2. Aceite a sugestão de adicionar também `www.eletroradar.com.br` com redirecionamento para o domínio principal.
3. A Vercel mostra os registros de DNS a criar (um `A` para o domínio raiz e um `CNAME` para `www`). Crie exatamente os que ela mostrar, no painel de quem gerencia o seu DNS.
4. Espere o status passar para **Valid Configuration**. O certificado HTTPS é emitido sozinho.

A URL final precisa ser a mesma de `url` em `src/lib/site.config.ts` (`https://eletroradar.com.br`): é ela que vai para o sitemap, o canonical e o RSS.

Se o domínio ainda aponta para o site antigo, deixe este passo por último: todo o resto pode ser testado no endereço `*.vercel.app`. Nesse caso, use esse endereço nos passos 4 e 7 e troque depois.

## 3. Banco (Neon)

Em produção o painel e a newsletter precisam de um Postgres do Neon. O banco embutido (PGlite) do desenvolvimento não funciona em função serverless, e o servidor só fala com o Neon: outro Postgres não serve sem mudar `src/lib/server/db/index.ts`.

1. No projeto da Vercel, abra **Storage → Create Database → Neon**.
2. Escolha a região mais próxima dos visitantes (`São Paulo (sa-east-1)`, se disponível no plano) e o plano gratuito.
3. Em **Environments**, deixe só **Production** marcado, a não ser que você queira o painel funcionando nos previews (ver "Previews" abaixo).
4. Conclua. A integração cria a variável `DATABASE_URL` no projeto.
5. Copie o valor de `DATABASE_URL` (**Settings → Environment Variables**, ou o painel do Neon) e crie as tabelas, da sua máquina:

   ```bash
   DATABASE_URL="postgres://..." bun run db:migrate
   ```

   No PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgres://..."; bun run db:migrate
   ```

Repita o comando do item 5 sempre que uma versão nova trouxer um arquivo novo em `drizzle/`. O deploy não aplica migrations.

Prefere criar o banco direto em <https://neon.tech>? Funciona igual: crie o projeto, copie a string de conexão e cadastre `DATABASE_URL` no passo 7.

## 4. Login (OAuth App do GitHub)

1. Abra <https://github.com/settings/developers> → **OAuth Apps → New OAuth App**.
2. Preencha:

   | Campo | Valor |
   |---|---|
   | Application name | `EletroRadar CMS` |
   | Homepage URL | `https://eletroradar.com.br` |
   | Authorization callback URL | `https://eletroradar.com.br/api/auth/callback/github` |

3. **Register application**.
4. Copie o **Client ID**. Clique em **Generate a new client secret** e copie o valor na hora: ele só aparece uma vez.

O login pede só a identidade. Ele não dá ao painel acesso aos seus repositórios.

Um OAuth App tem uma única callback URL. Para entrar com o GitHub também em `http://localhost:5173`, crie um segundo OAuth App com essa URL e use as chaves dele no `.env` local.

## 5. Conteúdo (token do GitHub)

O painel publica fazendo commits no repositório com este token.

1. Abra <https://github.com/settings/personal-access-tokens> → **Generate new token** (fine-grained).
2. Preencha:

   | Campo | Valor |
   |---|---|
   | Token name | `eletroradar-cms-content` |
   | Expiration | Uma data; anote na agenda para renovar |
   | Repository access | **Only select repositories** → `eletroradar.com.br-cms` |
   | Permissions → Repository → Contents | **Read and write** |

3. **Generate token** e copie o valor (começa com `github_pat_`).

Quando o token expira, o painel para de salvar. Gere outro e troque `GITHUB_TOKEN` na Vercel.

## 6. E-mail (Resend)

1. Crie a conta em <https://resend.com>.
2. **Domains → Add Domain** → `eletroradar.com.br`. Crie no seu DNS os registros que o Resend mostrar (SPF, DKIM) e espere o status **Verified**.
3. **API Keys → Create API Key**, permissão **Sending access**, restrita ao domínio. Copie a chave (começa com `re_`).

Sem `RESEND_API_KEY` nada quebra: o formulário de contato e a newsletter só registram no log que deixaram de enviar. Dá para fazer este passo depois.

## 7. Variáveis de ambiente

Abra **Settings → Environment Variables**. Para cada linha: nome, valor, ambiente **Production**, e marque **Sensitive** nas que são segredo.

Gere os dois segredos aleatórios na sua máquina, um comando para cada:

```bash
openssl rand -base64 32
```

| Variável | Valor | Segredo |
|---|---|---|
| `DATABASE_URL` | Já criada pela integração do Neon (passo 3) | sim |
| `BETTER_AUTH_SECRET` | Primeiro valor gerado com `openssl` | sim |
| `BETTER_AUTH_URL` | `https://eletroradar.com.br` (sem barra no fim) | não |
| `GITHUB_CLIENT_ID` | Client ID do OAuth App (passo 4) | não |
| `GITHUB_CLIENT_SECRET` | Client secret do OAuth App (passo 4) | sim |
| `ADMIN_GITHUB_USERS` | `AlexGalhardo` (vários: separados por vírgula) | não |
| `GOOGLE_CLIENT_ID` | Opcional: ID do cliente OAuth do Google (ver abaixo) | não |
| `GOOGLE_CLIENT_SECRET` | Opcional: chave secreta do cliente OAuth do Google | sim |
| `ADMIN_EMAILS` | E-mails que podem entrar pelo Google, separados por vírgula | não |
| `GITHUB_TOKEN` | Token fine-grained (passo 5) | sim |
| `GITHUB_REPO` | `AlexGalhardo/eletroradar.com.br-cms` | não |
| `GITHUB_BRANCH` | Opcional; padrão `main` | não |
| `RESEND_API_KEY` | Chave do Resend (passo 6) | sim |
| `RESEND_FROM_EMAIL` | `EletroRadar <no-reply@eletroradar.com.br>` | não |
| `CONTACT_TO_EMAIL` | Opcional; padrão `contactEmail` de `site.config.ts` | não |
| `CRON_SECRET` | Segundo valor gerado com `openssl` (mínimo de 32 caracteres) | sim |
| `LINKS_DASHBOARD_TOKEN` | Chave do dashboard de links (`site.linksDashboardUrl`), a mesma em todos os sites. Sem ele o build de produção falha | sim |
| `MISTRAL_API_KEY` | Opcional: chave da Mistral para reescrever resumo e FAQ em `/admin/import` | sim |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Opcional: `client_email` da conta de serviço ([google-console-analytics-setup.md](google-console-analytics-setup.md)) | não |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Opcional: `private_key` da conta de serviço | sim |
| `GOOGLE_SEARCH_CONSOLE_SITE` | Opcional: `sc-domain:eletroradar.com.br` ou `https://eletroradar.com.br/` | não |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | Opcional: ID numérico da propriedade do GA4 | não |

Login pelo Google (opcional): em <https://console.cloud.google.com/apis/credentials>, crie um **ID do cliente OAuth** do tipo "Aplicativo da Web" com a URI de redirecionamento autorizada `https://eletroradar.com.br/api/auth/callback/google`. Sem `ADMIN_EMAILS` ninguém entra pelo Google: a conta só é aceita quando o e-mail verificado está nessa lista.

**Não cadastre** `AUTH_TEST_LOGIN_TOKEN`, `PGLITE_DIR` nem `CONTENT_ROOT`: são só para desenvolvimento.

Variável nova ou alterada só vale em um deploy novo. Depois de cadastrar tudo: **Deployments → menu `⋯` do último deploy → Redeploy**.

### Pela linha de comando

Com a [Vercel CLI](https://vercel.com/docs/cli), na pasta do projeto:

```bash
vercel link                                   # liga a pasta ao projeto
vercel env add BETTER_AUTH_SECRET production  # pede o valor; repita para cada variável
vercel env ls production                      # confere o que está cadastrado
vercel --prod                                 # novo deploy de produção
```

Não use `vercel env pull` para criar o seu `.env` local: ele traria as chaves de produção para a sua máquina, e o painel local passaria a escrever no banco e no repositório de produção.

## 8. Agendador da newsletter (opcional)

Os avisos de post novo ficam em uma fila. Sem agendador, a fila anda pelo botão **Enviar fila agora** em `/admin/newsletter`. Para automatizar, acrescente ao `vercel.json`, no mesmo nível de `headers`:

```json
"crons": [{ "path": "/api/v1/newsletter/dispatches/run", "schedule": "0 12 * * *" }]
```

- O horário é em UTC: `0 12 * * *` roda todo dia às 9h de Brasília.
- No plano Hobby o cron roda no máximo uma vez por dia, e um agendamento mais frequente faz o deploy falhar. No Pro, `*/15 * * * *` roda a cada 15 minutos.
- A Vercel envia o `CRON_SECRET` do projeto no cabeçalho `Authorization: Bearer ...`. Sem a variável cadastrada, o endpoint recusa a chamada.
- O cron só roda no deploy de produção. Confira em **Settings → Cron Jobs** e teste com o botão **Run**.

## 9. Conferir

Com o deploy novo no ar:

```bash
curl -I https://eletroradar.com.br
```

- [ ] A resposta traz `x-frame-options`, `x-content-type-options`, `referrer-policy` e `strict-transport-security`.
- [ ] A home e um post abrem; `/sitemap.xml` e `/robots.txt` usam o domínio final.
- [ ] `https://eletroradar.com.br/images/covers/w480/<arquivo>.webp` responde 200 (o `sharp` rodou no build).
- [ ] `/admin` leva ao login sem listar variáveis faltando.
- [ ] O login pelo GitHub entra com um usuário de `ADMIN_GITHUB_USERS` e recusa outro.
- [ ] O login pelo Google entra com um e-mail de `ADMIN_EMAILS` e recusa outro.
- [ ] Salvar um post no painel cria um commit `content:` no repositório, a Vercel inicia um deploy e o indicador do editor passa de "Publicando" para "No ar".
- [ ] Enviar uma imagem pela biblioteca de mídia funciona.
- [ ] A inscrição na newsletter envia o e-mail de confirmação e o link confirma.
- [ ] `curl -H "Authorization: Bearer <CRON_SECRET>" https://eletroradar.com.br/api/v1/newsletter/dispatches/run` responde 200, e sem o cabeçalho responde 401.
- [ ] Uma importação em `/admin/import` termina (são cerca de 9 commits em sequência; o limite padrão da função é 300 s).

Marque o que passar na lista "Conferir depois do primeiro deploy" de [`deploy.md`](deploy.md) e no [`PLAN.md`](../PLAN.md).

## Problemas comuns

| Sintoma | Causa provável | Correção |
|---|---|---|
| `/admin/login` lista variáveis faltando | Variável cadastrada depois do último deploy, ou em outro ambiente | Confira o ambiente **Production** e faça **Redeploy** |
| GitHub mostra "The redirect_uri is not associated with this application" | Callback do OAuth App diferente de `BETTER_AUTH_URL` | As duas precisam ter o mesmo domínio, com `https` e sem `www` sobrando |
| O GitHub autoriza, mas o painel não deixa entrar | Usuário fora de `ADMIN_GITHUB_USERS` | Acrescente o usuário e faça **Redeploy** |
| Erro 500 no login ou na newsletter | Tabelas não criadas | Rode `bun run db:migrate` com a `DATABASE_URL` de produção |
| Painel salva mas responde erro 401 ou 404 do GitHub | Token expirado, sem permissão de Contents ou `GITHUB_REPO` errado | Refaça o passo 5 e confira `dono/repositorio` |
| Post salvo não aparece no site | O deploy do commit falhou ou foi bloqueado | Abra **Deployments** e leia o log do deploy daquele commit |
| Deploy de um commit do painel aparece como bloqueado | No plano Hobby, com repositório privado, a Vercel só publica commits de autores com acesso ao projeto | O e-mail da sua conta do GitHub precisa estar ligado à sua conta da Vercel |
| E-mails não chegam | Domínio não verificado no Resend, ou `RESEND_FROM_EMAIL` de outro domínio | Confira o status em **Domains** no Resend |
| Deploy falha depois de acrescentar o cron | Agendamento mais frequente que o plano permite | Use um horário diário, ou mude de plano |

Para ler o log do servidor: **Logs** no projeto, ou `vercel logs <url-do-deploy>`.

## Previews

Cada branch e pull request ganha um deploy de preview, protegido por login da Vercel. Sem variáveis no ambiente **Preview**, o site público funciona e o painel fica desligado, que é o comportamento mais seguro.

Se quiser o painel nos previews, dê a eles um banco e um `BETTER_AUTH_SECRET` próprios. Uma sessão criada em um preview que compartilha os dois com a produção vale na produção.

## Como o conteúdo chega ao site

1. Você salva um post no `/admin`.
2. O painel faz um commit `content: ...` na `main` com o `GITHUB_TOKEN`.
3. A Vercel vê o commit e faz o build (1 a 2 minutos).
4. O post entra no ar. O indicador do editor compara o que foi salvo com o que está publicado.

Todo push na `main` publica em produção. Trabalho em andamento vai em outra branch.
