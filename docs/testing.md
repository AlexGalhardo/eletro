# Testes

| Tipo | Onde | Ferramenta | Cobre |
|---|---|---|---|
| Unitário | `src/**/*.test.ts`, `tests/unit/` | Vitest | Parser de posts, pré-processador de Markdown, JSON-LD, formatação, script de release |
| Integração | `tests/integration/` | Vitest | Todo o conteúdo real (schema, slugs, imagens, listas), serviço do CMS, banco (PGlite + migrations), autenticação, todo endpoint da API e newsletter |
| Smoke | `tests/e2e/smoke.spec.ts` | Playwright (HTTP) | Toda URL pública responde; sitemap, robots e llms sem área privada |
| E2E | `tests/e2e/site.spec.ts` | Playwright (navegador) | Filtro, rolagem, busca, tema, cookies, post, contato, menu móvel, 404 |
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
- `$app/env/private` só é preenchido quando o servidor do SvelteKit sobe. Teste de integração que depende de variável de ambiente simula o módulo com `vi.mock("$app/env/private", ...)` e o helper `tests/integration/env.ts`.
- O e2e do painel usa um admin descartável definido em `playwright.config.ts` (`webServer.env`): banco em memória, login de testes (`POST /api/test/login`) no lugar do GitHub e conteúdo gravado em uma pasta temporária (`CONTENT_ROOT`, em `tests/e2e/env.ts`), nunca no conteúdo real.
- Nos specs do painel, abra páginas com `open(page, url)` de `tests/e2e/env.ts`: ele espera a página hidratar. Um clique antes disso encontra o botão sem o handler e não faz nada.
- Os testes smoke leem `content/posts/` e separam publicados de rascunhos e agendados: os primeiros têm de responder, os outros têm de dar 404 e ficar fora do sitemap, do `llms.txt` e da API.
- Os testes da API chamam os handlers de `+server.ts` direto, com um evento mínimo, e gravam em uma pasta temporária (`CONTENT_ROOT`).
- Os testes de conteúdo leem os arquivos reais: um post quebrado falha o teste antes de falhar o deploy.
- Seletores por papel e nome acessível (`getByRole`, `getByLabel`); `data-testid` só onde não há papel natural.
- Regras de trabalho em `.claude/rules/testing.md`.
