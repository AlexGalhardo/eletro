# Newsletter

Aviso por e-mail de post novo, com confirmação da inscrição (double opt-in) e descadastro sem login.

## Fluxo

1. **Inscrição:** o formulário do rodapé (`NewsletterForm.svelte`) chama `POST /api/v1/newsletter/subscribers`. O endereço entra como `pending` e recebe o e-mail de confirmação. A resposta é sempre a mesma (202), para o formulário não revelar quem já é assinante.
2. **Confirmação:** o link do e-mail abre `/newsletter/confirmar?token=...`, que marca o assinante como `confirmed`. Só quem confirmou recebe e-mail.
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
| Caixa de entrada não vira alvo | Endereço `pending` só recebe nova confirmação depois de 10 minutos; a API limita escritas por endereço IP |

## Estados

- Assinante: `pending` → `confirmed` → `unsubscribed`. Quem saiu pode se inscrever de novo (volta a `pending` com token novo).
- Envio: `pending` → `sending` → `sent` ou `failed`. Um envio `failed` (ou parado em `sending`) não é refeito sozinho: use "Tentar de novo" em `/admin/newsletter` e depois "Enviar fila agora".

## Configuração

| Variável | Efeito |
|---|---|
| `RESEND_API_KEY` | Sem ela os e-mails não saem: ficam registrados em memória e no log (é assim nos testes) |
| `RESEND_FROM_EMAIL` | Remetente; o domínio precisa estar verificado no Resend |
| `CRON_SECRET` | Token que o agendador envia para rodar a fila |

O agendador não está configurado no repositório. Sem ele, a fila só anda pelo botão do painel. Para automatizar, agende uma chamada a `/api/v1/newsletter/dispatches/run` com o `CRON_SECRET` (passo a passo previsto para `docs/deploy.md`).

## Limites conhecidos

- Os links dos e-mails usam `site.url` em produção (nunca o cabeçalho `Host` da requisição) e a origem da requisição em desenvolvimento.
- Se o processo cair entre o envio de um lote (até 100 e-mails) e o registro dele, a nova tentativa repete aquele lote.
- O descadastro pede um clique na página, não acontece ao abrir o link: leitores de e-mail abrem links sozinhos e cancelariam inscrições por engano. O `POST` de um clique do RFC 8058 não é oferecido, porque a proteção CSRF do SvelteKit recusa `POST` de formulário vindo de outra origem.
- Agendador deve chamar com `GET`. Um `POST` sem corpo vindo de fora do navegador é recusado pela proteção CSRF do SvelteKit (403), a não ser que envie `Content-Type: application/json`.
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
