# Testes

- Lógica nova nasce com teste. Correção de bug começa por um teste que reproduz o bug.
- **Unitário** (`src/**/*.test.ts`, ao lado do código): funções puras, schemas, formatação, SEO.
- **Integração** (`tests/integration/`): conteúdo real do repositório, stores, banco (PGlite), endpoints.
- **Smoke e e2e** (`tests/e2e/`, Playwright): rotas públicas no build de produção e fluxos do painel.
- Verificação exploratória no navegador: `agent-browser` ou Playwright. Achado relevante vira teste automatizado.
- Não enfraqueça teste para ficar verde: nada de `.skip`, asserção removida ou limite afrouxado sem o dono concordar.
- Um item do `PLAN.md` só é marcado `[x]` depois de o assert do grupo ter sido executado e ter passado.
- Serviços externos (GitHub, Resend, Neon) são simulados nos testes; nenhum teste depende de rede ou de segredo.
