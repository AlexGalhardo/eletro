---
name: ui-sdk
description: Use os comportamentos acessíveis do UI SDK ao construir interações de interface neste projeto Astro.
---

# UI SDK no Astro

1. Leia `node_modules/@ui-sdk/core/docs/llms.txt` e procure o comportamento em `core.md` antes de usá-lo.
2. Use `@ui-sdk/core` dentro de `<script>` TypeScript em componentes Astro. Preserve o HTML renderizado pelo Astro e o visual do projeto.
3. Escolha um comportamento do UI SDK apenas quando ele resolver uma interação real de teclado, foco, seleção ou anúncio. Controles HTML nativos continuam sendo a primeira escolha para formulários simples.
4. Teste a interação com teclado e Playwright. Verifique as versões no npm antes de atualizar: a biblioteca ainda está em beta.

Referência oficial: <https://ui-sdk.dev/docs/core>.
