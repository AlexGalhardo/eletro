# Estilo de código

- Indentação com **tab de largura 4**; linha de até 110 colunas; aspas duplas. O Biome aplica: rode `bun run format` antes de commitar.
- Biome v2 é o único formatador e linter de código. Não adicione ESLint nem Prettier.
- Markdown é verificado pelo markdownlint (`bun run lint`).
- TypeScript estrito. Sem `any`; sem `@ts-ignore`; sem `biome-ignore` sem uma frase explicando o motivo.
- Svelte 5 com runes (`$props`, `$state`, `$derived`, `$effect`). Sem stores legadas e sem `export let`.
- Imports internos com `#lib/...` e extensão explícita (`.ts`, `.svelte`).
- Código que só pode rodar no servidor fica em `src/lib/server/` ou em arquivos `*.server.ts`.
- Comentários explicam o porquê, não o quê. Atalho consciente leva um comentário `ponytail:` dizendo o limite e quando evoluir.
- Textos de identidade do site vêm de `src/lib/site.config.ts`.
- Classes do Tailwind são copiadas do site original quando o componente já existia: o visual não deve mudar.
