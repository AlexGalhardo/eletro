# Testes

| Tipo | Onde | Ferramenta | Cobre |
|---|---|---|---|
| Unitário | `src/**/*.test.ts`, `tests/unit/`, `webscrapping/*.test.ts` | Vitest | Parser de posts, pré-processador de Markdown, JSON-LD, formatação, script de release, importação em lote (`webscrapping/batch.test.ts`), status dos posts (`src/lib/content/post-status.test.ts`), feature flags (`src/lib/flags.test.ts`) |
| Integração | `tests/integration/` | Vitest | Todo o conteúdo real (schema, slugs, imagens, listas), status dos posts (`tests/integration/post-status.test.ts`, falha se `docs/post-status.md` estiver desatualizado), serviço do CMS, banco (PGlite + migrations), autenticação, todo endpoint da API e newsletter |
| Smoke | `tests/e2e/smoke.spec.ts` | Playwright (HTTP) | Toda URL pública responde; sitemap, robots e llms sem área privada |
| E2E | `tests/e2e/site.spec.ts` | Playwright (navegador) | Filtro, rolagem, busca, tema, cookies, post, contato, menu móvel, página inexistente |
| E2E | `tests/e2e/cms.spec.ts` | Playwright (navegador) | Review nova só pelo navegador: lista com dois produtos, capa, post, edição, recusa de conteúdo inválido, exclusão |
| E2E | `tests/e2e/newsletter.spec.ts` | Playwright (navegador) | Inscrição pelo rodapé, assinante pendente no painel, links com token inválido, páginas fora dos buscadores |
| E2E | `tests/e2e/admin.spec.ts` | Playwright (navegador) | Redirecionamento para o login, recusa de quem não é admin, entrada e saída do painel; API pública, 401 nas escritas sem sessão |

## Como rodar

```bash
bun run test                 # unitários e integração
bun run test:e2e:install     # uma vez, baixa o Chromium
bun run test:e2e             # builda, sobe o preview na porta 4173 e testa
bunx playwright test --ui    # modo interativo
```

O e2e roda em dois projetos, `desktop` e `mobile` (Pixel 7), sempre contra o build de produção.

## Princípios

- Nenhum teste depende de rede externa ou de segredo. Sem `RESEND_API_KEY`, o envio de e-mail é registrado em memória e a rota responde sucesso.
- Variáveis de servidor vêm de `#env` (`src/env.ts`). Teste de integração que depende delas simula o módulo com `vi.mock("#env", ...)` e o helper `tests/integration/env.ts`.
- O e2e sobe o `astro preview` do build estático. O painel no Pages é a tela de login; criar e editar posts fica nos testes de integração, que gravam em uma pasta temporária (`CONTENT_ROOT`), nunca no conteúdo real.
- Nos specs que clicam em botões com script, abra páginas com `open(page, url)` de `tests/e2e/env.ts`: ele espera a página ficar quieta. Um clique antes do script encontrar o botão sem o handler e não faz nada.
- Os testes smoke leem `content/posts/` e separam publicados de rascunhos e agendados: os primeiros têm de responder, os outros têm de responder 404 em `/<slug>`, como qualquer página inexistente, e ficar fora do sitemap, do `llms.txt` e da API. Com `previewDrafts` ligado, `/preview/<slug>` responde 200 com `noindex`, e continua fora de tudo isso ([feature-flags.md](feature-flags.md)).
- Os testes da API chamam os handlers de `server.ts` direto, com um evento mínimo, e gravam em uma pasta temporária (`CONTENT_ROOT`).
- Os testes de conteúdo leem os arquivos reais: um post quebrado falha o teste antes de falhar o deploy.
- Seletores por papel e nome acessível (`getByRole`, `getByLabel`); `data-testid` só onde não há papel natural.
- Regras de trabalho em `.claude/rules/testing.md`.
