# Testes

| Tipo | Onde | Ferramenta | Cobre |
|---|---|---|---|
| Unitário | `src/**/*.test.ts` | Vitest | Parser de posts, pré-processador de Markdown, JSON-LD, formatação |
| Integração | `tests/integration/` | Vitest | Todo o conteúdo real: schema, slugs, imagens, listas referenciadas |
| Smoke | `tests/e2e/smoke.spec.ts` | Playwright (HTTP) | Toda URL pública responde; sitemap, robots e llms sem área privada |
| E2E | `tests/e2e/site.spec.ts` | Playwright (navegador) | Filtro, rolagem, busca, tema, cookies, post, contato, menu móvel, 404 |

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
- Os testes de conteúdo leem os arquivos reais: um post quebrado falha o teste antes de falhar o deploy.
- Seletores por papel e nome acessível (`getByRole`, `getByLabel`); `data-testid` só onde não há papel natural.
- Regras de trabalho em `.claude/rules/testing.md`.
