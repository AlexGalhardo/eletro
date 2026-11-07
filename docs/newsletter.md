# Newsletter

Aviso por e-mail de post novo, com confirmação da inscrição (double opt-in) e descadastro sem login.

## Fluxo

1. **Inscrição:** o formulário do rodapé (`NewsletterForm.svelte`) chama `POST /api/v1/newsletter/subscribers`. O endereço entra como `pending` e recebe o e-mail de confirmação. A resposta é sempre a mesma (202), para o formulário não revelar quem já é assinante.
2. **Confirmação:** o link do e-mail abre `/newsletter/confirmar?token=...`. A página pede um clique no botão, que chama `POST /api/v1/newsletter/confirm` e marca o assinante como `confirmed`. Só quem confirmou recebe e-mail.
3. **Aviso de post:** no editor do post, a opção "Avisar assinantes da newsletter quando o post estiver no ar" cria um envio `pending` para aquele post (`POST /api/v1/newsletter/dispatches`).
4. **Envio:** `POST /api/v1/newsletter/dispatches/run` envia cada envio da fila cujo post já está publicado no deploy em execução. Quem chama: o botão "Enviar fila agora" em `/admin/newsletter`, ou um agendador com `Authorization: Bearer <CRON_SECRET>` (também aceita `GET`, que é como o Vercel Cron chama).
5. **Descadastro:** todo e-mail de post traz o link `/newsletter/sair?token=...` (e o cabeçalho `List-Unsubscribe`). A página pede um clique no botão, que chama `POST /api/v1/newsletter/unsubscribe`.

## Garantias

| Regra | Como é garantida |
|---|---|
| Um e-mail por assinante confirmado | O envio lê só `status = confirmed` |
| Nunca duas vezes o mesmo post | `newsletter_dispatch.slug` é único; pedir de novo não cria outro envio |
| Retomar sem duplicar | Cada e-mail enviado vira uma linha em `newsletter_delivery`; uma nova tentativa pula quem já recebeu |
| Duas execuções ao mesmo tempo | A execução "pega" o envio com um `UPDATE ... WHERE status = 'pending'`; só uma consegue |
| Só depois de o post estar no ar | O envio confere o conteúdo empacotado no build: rascunho, post agendado ou ainda não publicado fica na fila |
| Caixa de entrada não vira alvo | Endereço `pending` recebe no máximo uma confirmação a cada 24 horas; no total saem até 60 confirmações por hora; a API limita escritas por endereço IP |

## Estados

- Assinante: `pending` → `confirmed` → `unsubscribed`. Quem saiu pode se inscrever de novo (volta a `pending` com token novo).
- Envio: `pending` → `sending` → `sent` ou `failed`. Um envio `failed` (ou parado em `sending`) não é refeito sozinho: use "Tentar de novo" em `/admin/newsletter` e depois "Enviar fila agora".

## Configuração

| Variável | Efeito |
|---|---|
| `RESEND_API_KEY` | Sem ela os e-mails não saem: ficam registrados em memória e no log (é assim nos testes) |
| `RESEND_FROM_EMAIL` | Remetente; o domínio precisa estar verificado no Resend |
| `CRON_SECRET` | Token que o agendador envia para rodar a fila. Com menos de 32 caracteres é ignorado |

O agendador não está configurado no repositório. Sem ele, a fila só anda pelo botão do painel. Para automatizar, agende uma chamada a `/api/v1/newsletter/dispatches/run` com o `CRON_SECRET` (passo a passo em [`deploy.md`](deploy.md)).

## Limites conhecidos

- Os links dos e-mails usam `site.url` em produção (nunca o cabeçalho `Host` da requisição) e a origem da requisição em desenvolvimento.
- Se o processo cair entre o envio de um lote (até 100 e-mails) e o registro dele, a nova tentativa repete aquele lote.
- Com o teto de 60 confirmações por hora atingido, novas inscrições ficam registradas mas não recebem o e-mail naquela hora (o servidor registra um aviso no log).
- As páginas da newsletter não carregam os scripts de analytics: o endereço delas leva o token do assinante.
- A confirmação e o descadastro pedem um clique na página, não acontecem ao abrir o link: leitores de e-mail abrem links sozinhos e cancelariam inscrições por engano. O host de produção é o GitHub Pages, que não executa esse `POST`; o handler continua coberto pelos testes de integração.
- O agendador, quando houver um servidor para a fila, chama com `GET /api/v1/newsletter/dispatches/run`. O GitHub Pages não dispara essa rota.
- `/admin/newsletter` mostra os 200 assinantes e os 100 envios mais recentes, sem busca.

## Onde fica o código

| Arquivo | Papel |
|---|---|
| `src/lib/server/newsletter.ts` | `subscribe`, `confirm`, `unsubscribe`, `requestDispatch`, `runDispatches` |
| `src/lib/server/emails/NewsletterEmails.tsx` | Templates react-email de confirmação e de post novo |
| `src/lib/server/db/schema.ts` | Tabelas `subscriber`, `newsletter_dispatch`, `newsletter_delivery` |
| `src/routes/api/v1/newsletter/` | Endpoints |
| `src/routes/(site)/newsletter/` | Páginas de confirmação e de descadastro |
| `src/routes/admin/newsletter/` | Assinantes, envios, fila e nova tentativa |
| `tests/integration/newsletter.test.ts`, `tests/e2e/newsletter.spec.ts` | Testes |
