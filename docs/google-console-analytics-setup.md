# Google Search Console e Analytics no painel

Passo a passo para a tela `/admin/google` mostrar os dados do Google Search Console e do Google Analytics 4 e reenviar o `sitemap.xml`. Leva cerca de 15 minutos e não tem custo.

## Como funciona

O servidor fala com o Google como uma **conta de serviço**: uma conta de robô criada no Google Cloud, com e-mail próprio e uma chave privada. Você dá a esse e-mail acesso à propriedade do Search Console e à propriedade do Analytics, do mesmo jeito que daria a uma pessoa. Não há tela de consentimento, token para renovar nem dependência nova: o código está em `src/lib/server/google.ts` e usa só `fetch` e `node:crypto`.

| Variável | O que é |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Campo `client_email` do JSON da chave |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Campo `private_key` do JSON da chave |
| `GOOGLE_SEARCH_CONSOLE_SITE` | Nome da propriedade no Search Console |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | ID numérico da propriedade do GA4 |

As duas primeiras são obrigatórias. Com só `GOOGLE_SEARCH_CONSOLE_SITE`, a tela mostra só o Search Console; com só `GOOGLE_ANALYTICS_PROPERTY_ID`, só o Analytics. O que falta aparece listado no topo da tela.

Isto é separado do login do painel pelo Google (`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`) e do ID de medição `G-XXXX` em `site.config.ts`, que é o que coleta as visitas. Nenhum dos dois muda.

## 1. Projeto e APIs no Google Cloud

1. Abra <https://console.cloud.google.com/> e escolha um projeto. Pode ser o mesmo do login pelo Google; se não tiver nenhum, crie um.
2. Em **APIs e serviços > Biblioteca**, ative as duas APIs:
   - **Google Search Console API**
   - **Google Analytics Data API**

## 2. Conta de serviço e chave

1. Em **IAM e administrador > Contas de serviço**, clique em **Criar conta de serviço**. Dê um nome (por exemplo `painel-blog`) e conclua. Não precisa de nenhum papel no projeto.
2. Abra a conta criada, vá em **Chaves > Adicionar chave > Criar nova chave**, tipo **JSON**. O navegador baixa um arquivo.
3. Do arquivo você usa dois campos:
   - `client_email`, algo como `painel-blog@seu-projeto.iam.gserviceaccount.com`
   - `private_key`, que começa com `-----BEGIN PRIVATE KEY-----`

Se o Google recusar a criação da chave, a conta pertence a uma organização com a política `iam.disableServiceAccountKeyCreation` ativa. Use um projeto de uma conta pessoal ou peça a liberação ao administrador.

## 3. Acesso no Search Console

1. Abra <https://search.google.com/search-console> e selecione a propriedade do site.
2. Em **Configurações > Usuários e permissões > Adicionar usuário**, cole o `client_email` e escolha a permissão **Total**. Com **Restrita** os relatórios funcionam, mas o reenvio do sitemap é recusado.
3. Anote o nome da propriedade para `GOOGLE_SEARCH_CONSOLE_SITE`. Ele depende do tipo:

   | Tipo da propriedade | Valor |
   |---|---|
   | Domínio | `sc-domain:eletroradar.com.br` |
   | Prefixo do URL | `https://eletroradar.com.br/` (igual ao cadastrado, com a barra no fim) |

   O tipo aparece no seletor de propriedades, no canto superior esquerdo: propriedades de domínio mostram só o domínio, as de prefixo mostram o endereço completo.

## 4. Acesso no Analytics

1. Abra <https://analytics.google.com/> e vá em **Administrador**.
2. Na coluna da propriedade, em **Gerenciamento de acesso à propriedade**, adicione o `client_email` com o papel **Leitor**.
3. Em **Detalhes da propriedade**, copie o **ID da propriedade**: só números, como `123456789`. Não é o `G-XXXX`.

## 5. Variáveis de ambiente

No `.env` local, a chave fica em uma linha só, entre aspas, com os `\n` como vêm no JSON:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=painel-blog@seu-projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
GOOGLE_SEARCH_CONSOLE_SITE=sc-domain:eletroradar.com.br
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
```

Na Vercel (**Settings > Environment Variables**), cadastre as quatro em **Production**. Em `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, cole o valor de `private_key` sem as aspas e marque como **Sensitive**. O código aceita a chave tanto com `\n` literais quanto com quebras de linha de verdade. Variável nova só vale depois de um novo deploy.

## 6. Conferir

Abra `/admin/google`:

- **Search Console:** cliques, impressões, CTR e posição média dos últimos 28 dias, as 10 consultas e as 10 páginas com mais cliques, e a lista de sitemaps com a data do envio e da última leitura.
- **Reenviar sitemap ao Google:** envia `https://<site>/sitemap.xml` à propriedade. Na primeira vez, cadastra o sitemap; nas seguintes, pede uma nova leitura. Use depois de publicar posts. O arquivo em si é gerado pelo site a cada deploy, não precisa de nenhuma ação.
- **Analytics:** usuários, sessões e visualizações dos últimos 28 dias e as 10 páginas mais vistas.

Os dados do Search Console chegam com dois a três dias de atraso: uma propriedade nova aparece zerada.

## Problemas comuns

| Mensagem na tela | Causa |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY não é uma chave privada válida` | A chave foi colada pela metade ou com as aspas do JSON |
| `O Google respondeu 400: Invalid JWT Signature` ou `invalid_grant` | A chave foi excluída no Google Cloud, ou o e-mail não é o da mesma conta de serviço |
| `O Google respondeu 403` com `sufficient permission` no Search Console | O `client_email` não é usuário da propriedade, ou `GOOGLE_SEARCH_CONSOLE_SITE` está com o tipo errado (`sc-domain:` contra prefixo do URL) |
| `O Google respondeu 403` só ao reenviar o sitemap | A permissão no Search Console é **Restrita**; troque para **Total** |
| `O Google respondeu 403` com `has not been used in project` ou `is disabled` | A API não foi ativada no projeto (passo 1) |
| `O Google respondeu 403` ou `404` no Analytics | O `client_email` não tem acesso à propriedade, ou o ID é o `G-XXXX` em vez do número |

## Segurança

- O JSON da chave é um segredo: não entra no repositório. Depois de cadastrar as variáveis, apague o arquivo baixado.
- A conta de serviço só alcança o que você liberou: leitura no Analytics e a propriedade do Search Console. Ela não tem papel no projeto do Google Cloud.
- Para trocar a chave, crie uma nova no passo 2, atualize a variável, faça o deploy e exclua a antiga em **Chaves**.
- `/admin/google` e `POST /api/v1/google/sitemap` exigem a sessão de admin, como o resto do painel.

## Limites

- Cada abertura da tela faz cinco chamadas ao Google, sem cache. As cotas gratuitas das duas APIs são muito maiores do que o uso de um painel.
- O período é fixo em 28 dias (`REPORT_DAYS` em `src/lib/server/google.ts`).
- O reenvio do sitemap é manual. Publicar um post não avisa o Google sozinho.
