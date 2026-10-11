# Testes

Tipos de teste, pastas e comandos estão em `docs/testing.md`. As regras de trabalho:

- Lógica nova nasce com teste. Correção de bug começa por um teste que reproduz o bug.
- Teste unitário fica ao lado do código (`src/**/*.test.ts`); o dos scripts de `scripts/`, em `tests/unit/`. O que usa conteúdo real, banco (PGlite) ou endpoints vai em `tests/integration/`; rotas e fluxos do painel, em `tests/e2e/` (Playwright, contra o build de produção).
- Verificação exploratória no navegador: Playwright. Achado relevante vira teste automatizado.
- Não enfraqueça teste para ficar verde: nada de `.skip`, asserção removida ou limite afrouxado sem o dono concordar.
- Um item do `PLAN.md` só é marcado `[x]` depois de o assert do grupo ter sido executado e ter passado.
- Serviços externos (GitHub, Resend, Neon, Google, dashboard de links) são simulados nos testes; nenhum teste depende de rede ou de segredo.
