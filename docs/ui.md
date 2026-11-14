# Interface e UI SDK

O site usa Astro, TypeScript e Tailwind. O pacote `@ui-sdk/core` fornece comportamentos de acessibilidade para controles interativos sem trocar o framework. No painel estático, `announce` informa a leitores de tela quando um arquivo abre, salva ou falha.

Para uma interação nova: leia a skill `.agents/skills/ui-sdk/SKILL.md`, consulte `node_modules/@ui-sdk/core/docs/llms.txt`, procure o comportamento em `core.md` e verifique no Playwright. Use o HTML nativo para entradas simples. O UI SDK está em beta; versões novas exigem revisão da API antes da atualização.

Direção visual: papel de jornal com acento neutro (preto no claro, branco no escuro), tokens no padrão shadcn em `src/app.css`, tema que segue o sistema com botão para alternar, foco sempre visível e movimento reduzido respeitado. Tokens, contraste, componentes e como adicionar um componente shadcn estão em [`design-system.md`](design-system.md). O site público é Astro puro; o `/admin` usa ilhas React com shadcn/ui (`src/lib/admin-ui/`). A marca é o radar monocromático de `static/icon.svg`. Páginas institucionais usam títulos objetivos.

Documentação oficial: <https://ui-sdk.dev/docs/core>.
