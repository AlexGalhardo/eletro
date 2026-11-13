# Desenvolvimento local

## Preparação

Use Node 24 e Bun 1.4.4. Instale as dependências com `bun install --frozen-lockfile`. O projeto funciona para site estático sem `.env`; `.env.example` contém somente placeholders. Leia `src/env.ts` para as variáveis usadas pelas integrações de servidor preservadas no código.

| Comando | Resultado |
|---|---|
| `bun run dev` | Servidor Astro local |
| `bun run build` | Valida conteúdo, gera capas e compila `dist/` |
| `bun run preview` | Serve `dist/` localmente |
| `bun run check` | Confere TypeScript |
| `bun run lint` | Biome e Markdownlint |
| `bun run test` | Testes unitários e de integração |
| `bun run test:e2e` | Testes Playwright contra o build |
| `bun run post-status` | Regenera `docs/post-status.md` depois de editar `content/` |

Os scripts em `setups/` preparam ambientes locais com ou sem Docker. `infra/` contém os arquivos de container. `bun.lock` fixa as versões; consulte `.agents/rules/dependencies.md` antes de adicionar pacote.

## Estrutura útil

- `src/pages/`: páginas do Pages e JSON público pré-renderizado.
- `src/routes/`: componentes do site e código antigo de telas do servidor.
- `src/lib/admin/`: editor estático e cliente da API do GitHub.
- `src/lib/server/`: serviços preservados para testes e possível hospedagem com servidor.
- `content/`: posts, produtos e flags; `static/images/`: imagens publicadas.
- `.agents/`: regras, skills, agentes e referências compartilhados entre ferramentas de IA.
- `.github/workflows/`: CI em PR e publicação do Pages.

Um token de editor é inserido somente no navegador em `/admin`; não coloque tokens em `.env`, no código ou em arquivos do repositório. O workflow do Pages pode usar `LINKS_DASHBOARD_TOKEN` como secret para sincronizar links de afiliado, mas o build local valida sem ele.
