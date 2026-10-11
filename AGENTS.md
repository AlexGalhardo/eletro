# AGENTS.md

Instruções para qualquer agente de código trabalhando neste repositório. O `CLAUDE.md` importa este arquivo; edite sempre aqui.

## O que é o projeto

Template open source de CMS de blog em SvelteKit 3. Os posts são Markdown (`content/posts/*.mdx`, compilados com mdsvex), os produtos são JSON (`content/products/*.json`) e o site público é estático. O dono publica pelo painel `/admin`, que grava o conteúdo com commits no próprio repositório. O EletroRadar (reviews de eletrodomésticos com links de afiliado) é o conteúdo de demonstração e o site em produção.

## Início de toda sessão (obrigatório)

Antes de responder ou editar qualquer coisa, nesta ordem:

1. Carregue as skills abaixo com a ferramenta de skills (em agentes sem essa ferramenta, leia o `SKILL.md` de cada uma em `.claude/skills/<nome>/`):
   - `using-agent-skills`: roteador das skills de engenharia do pacote agent-skills
   - `karpathy-guidelines`: pensar antes de codar, simplicidade, mudanças cirúrgicas, critérios verificáveis
   - `ponytail`: a solução mais simples que funciona; fica ativa a sessão inteira
   - `graphify`: consulte o grafo (`graphify query "<pergunta>"`) antes de varrer o código, quando `graphify-out/` existir
2. Leia o [`PLAN.md`](PLAN.md) para saber a fase atual e o próximo item em aberto.
3. Leia o [`docs/README.md`](docs/README.md) e, dele, só a documentação do assunto em que vai mexer.
4. Leia as regras em [`.claude/rules/`](.claude/rules/).

Skills próprias deste projeto: `project-new-post` (criar ou editar um post), `project-new-product-list` (lista de produtos) e `project-release` (lançar uma versão).

Durante o trabalho, carregue a skill específica da tarefa: `interview-me` quando o pedido estiver ambíguo, `spec-driven-development` e `planning-and-task-breakdown` antes de uma feature nova, `source-driven-development` para qualquer API de framework, `test-driven-development` ao escrever lógica, `security-and-hardening` em autenticação, entrada de usuário e integrações, `git-workflow-and-versioning` e `project-release` em todo commit (cada commit é uma release).

## Documentação (onboarding)

| Documento | Assunto |
|---|---|
| [`PLAN.md`](PLAN.md) | Fases ALPHA, BETA e 1.0.0-rc, checklists e asserts de entrega |
| [`docs/README.md`](docs/README.md) | Índice da documentação |
| [`docs/architecture.md`](docs/architecture.md) | Visão geral, pastas, fluxo de dados, decisões |
| [`docs/content.md`](docs/content.md) | Formato de posts e produtos, componentes disponíveis no Markdown |
| [`docs/agent-setup.md`](docs/agent-setup.md) | Setup do zero para agentes: dependências, `.env`, banco, Docker, testes, GitHub, Vercel e dashboard de links, com comando e verificação por passo |
| [`docs/development.md`](docs/development.md) | Como rodar, scripts de `setups/`, Docker (`infra/`), variáveis de ambiente, convenções |
| [`docs/tooling.md`](docs/tooling.md) | Ferramentas: o que cada uma faz, onde está a configuração, hooks do git, Docker, ferramentas dos agentes |
| [`docs/workflows.md`](docs/workflows.md) | Fluxos de trabalho: ordem de toda mudança, passos por tipo de tarefa, release e deploy |
| [`docs/testing.md`](docs/testing.md) | Tipos de teste, onde ficam e como rodar |
| [`docs/cms.md`](docs/cms.md) | Banco, autenticação, armazenamento de conteúdo e serviço do CMS (fase BETA) |
| [`docs/api.md`](docs/api.md) | API REST `/api/v1`: endpoints, formato de erro, regras de escrita |
| [`docs/newsletter.md`](docs/newsletter.md) | Newsletter: inscrição com confirmação, envio de avisos de post, descadastro |
| [`docs/performance.md`](docs/performance.md) | Capas redimensionadas no build, cache, contraste, teclado e resultados do Lighthouse |
| [`docs/security.md`](docs/security.md) | Modelo de ameaças, relatório da revisão de segurança e o que segue em aberto |
| [`docs/deploy.md`](docs/deploy.md) | Vercel, Netlify, Neon, OAuth App, token de conteúdo, Resend e o que conferir depois do deploy |
| [`docs/setup-vercel.md`](docs/setup-vercel.md) | Passo a passo completo do deploy na Vercel, com conferência e problemas comuns |
| [`docs/ci-cd.md`](docs/ci-cd.md) | Workflows do GitHub Actions (inativos), regra de versão, release e como ativar |
| [`docs/google-console-analytics-setup.md`](docs/google-console-analytics-setup.md) | Google Search Console e Analytics em `/admin/google`: conta de serviço, permissões, variáveis e problemas comuns |
| [`docs/affiliate-links.md`](docs/affiliate-links.md) | Links de afiliado: registro no dashboard de links a cada build, id dos produtos, redirect nos botões |
| [`docs/webscrapping-modelation.md`](docs/webscrapping-modelation.md) | Importação de posts por web scraping: resultado do estudo, `webscrapping/`, `/admin/import`, limites |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de versões (Keep a Changelog) |

Ao entregar uma mudança que altera comportamento, atualize o documento correspondente e o `PLAN.md` na mesma entrega. Documento novo em `docs/` entra nesta tabela e no índice.

## Comandos

```bash
bash setups/setup-unix-local.sh           # prepara tudo e sobe o dev (macOS, Linux, WSL)
bash setups/setup-windows-local.sh        # o mesmo no Windows, pelo Git Bash
bash setups/setup-unix-with-docker.sh     # build de produção em Docker, com os arquivos de infra/
bash setups/setup-windows-with-docker.sh  # o mesmo no Windows, pelo Git Bash
bun install          # dependências (versões exatas)
bun run dev          # servidor de desenvolvimento
bun run build        # build de produção (valida o conteúdo e sincroniza os links de afiliado)
bun run sync-links   # só a validação e o envio dos links ao dashboard
bun run check        # svelte-check + TypeScript
bun run lint         # Biome + markdownlint
bun run format       # Biome com correção automática
bun run test         # Vitest: unitários e integração
bun run test:e2e     # Playwright: smoke e e2e
```

## Regras que não podem ser quebradas

- **SvelteKit 3 e Svelte 5 são mais novos que o conhecimento de treino da maioria dos modelos.** Consulte o MCP do Svelte (`.mcp.json`) ou <https://svelte.dev/docs/kit/llms.txt> antes de usar qualquer API. Resumo do que mudou: configuração no `vite.config.ts` (não existe `svelte.config.js`), imports com `#lib/...` e extensão explícita (não existe `$lib`), `$app/env` e `$app/state` (não existem `$app/environment` nem `$app/stores`), runes em todo componente.
- **Dependências:** sempre a última versão estável, com versão exata, sem `^` nem `~`. Confira no registry, não de memória. Ver `.claude/rules/dependencies.md`.
- **Formatação:** tab com largura 4 (Biome e `.editorconfig`). YAML e Markdown usam 2 espaços.
- **Commits:** Conventional Commits, validados pelo commitlint. Commits de conteúdo usam o tipo `content`.
- **Todo commit é uma release:** antes de commitar, `bun scripts/release.ts --message "<mensagem>"` corta a versão no `package.json` e no `CHANGELOG.md`; depois do commit, tag `vX.Y.Z`, push e `gh release create`. Sem exceção para `docs` ou `chore`; só os commits `content:` do painel em produção ficam de fora. Ver a skill `project-release` e `.claude/rules/git-and-releases.md`.
- **Segredos:** nada de chave real no repositório. `.env.example` só tem placeholders.
- **Indexação:** `/admin` e `/api` são bloqueados no `robots.txt` (`Disallow`), nunca aparecem em `sitemap.xml` ou `llms.txt` e respondem com `X-Robots-Tag: noindex`. Os robôs de coleta em massa e de treino de IA de `site.blockedCrawlers` são recusados no site inteiro; buscadores e assistentes continuam liberados.
- **CI:** os workflows ficam em `.github/workflows-disabled/`. Não mova para `.github/workflows/` sem o dono pedir.
- **Identidade do site:** nome, URL, autores, categorias e textos vêm de `src/lib/site.config.ts`. Não escreva "EletroRadar" em componentes.
- **Idioma:** código, comentários e mensagens de commit em inglês; documentação e textos de interface em português do Brasil.
