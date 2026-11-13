# AGENTS.md

Instruções para qualquer agente de código trabalhando neste repositório. O `CLAUDE.md` importa este arquivo; edite sempre aqui.

## O que é o projeto

Template open source de CMS de blog em Astro 7.4 e TypeScript. Os posts são Markdown (`content/posts/*.mdx`), os produtos são JSON (`content/products/*.json`) e o site público é estático no GitHub Pages. O dono edita pelo painel `/admin`, que grava conteúdo numa branch do repositório e abre um PR. O EletroRadar (reviews de eletrodomésticos com links de afiliado) é o conteúdo de demonstração e o site em produção. O código antigo da API, da autenticação e da newsletter continua no repositório e é coberto por testes; o GitHub Pages não executa essas rotas.

## Início de toda sessão (obrigatório)

Antes de responder ou editar qualquer coisa, nesta ordem:

1. Carregue as skills abaixo com a ferramenta de skills (em agentes sem essa ferramenta, leia o `SKILL.md` de cada uma em `.agents/skills/<nome>/`):
   - `using-agent-skills`: roteador das skills de engenharia do pacote agent-skills
   - `karpathy-guidelines`: pensar antes de codar, simplicidade, mudanças cirúrgicas, critérios verificáveis
   - `ponytail`: a solução mais simples que funciona; fica ativa a sessão inteira
2. Leia o [`PLAN.md`](PLAN.md) para saber a fase atual e o próximo item em aberto.
3. Leia o [`docs/README.md`](docs/README.md) e, dele, só a documentação do assunto em que vai mexer.
4. Leia as regras em [`.agents/rules/`](.agents/rules/).

Skills próprias deste projeto: `project-new-post` (criar ou editar um post), `project-new-product-list` (lista de produtos) e `project-release` (lançar uma versão).

Para UI interativa, carregue também `.agents/skills/ui-sdk/SKILL.md` e leia `node_modules/@ui-sdk/core/docs/llms.txt`; use os comportamentos do [UI SDK](https://ui-sdk.dev/docs/core) em Astro/TypeScript quando forem úteis para foco, teclado, seleção ou anúncios.

Durante o trabalho, carregue a skill específica da tarefa: `interview-me` quando o pedido estiver ambíguo, `spec-driven-development` e `planning-and-task-breakdown` antes de uma feature nova, `source-driven-development` para qualquer API de framework, `test-driven-development` ao escrever lógica, `security-and-hardening` em autenticação, entrada de usuário e integrações, `git-workflow-and-versioning` em todo commit e `project-release` somente quando o dono pedir uma release.

As skills de terceiros são cópias sem alteração; origem e versão em [`.agents/skills/SOURCES.md`](.agents/skills/SOURCES.md). A `browser-testing-with-devtools` pede o MCP `chrome-devtools`, que este projeto não configura: a verificação no navegador é feita com Playwright (`.agents/rules/testing.md`).

### Grafo de conhecimento (opcional)

O graphify monta um grafo do código em `graphify-out/`, que fica fora do git: cada máquina gera o seu, e nada no projeto depende dele.

```bash
pip install graphifyy                     # uma vez por máquina (Python 3)
python -m graphify update .               # gera ou atualiza o grafo; cerca de 10 segundos, sem chave de API
python -m graphify query "<pergunta>"     # também: path "<A>" "<B>" e explain "<conceito>"
```

- Com `graphify-out/graph.json` presente, consulte o grafo antes de varrer o código e rode o `update` de novo depois de mudar código: nada o atualiza sozinho.
- Sem o arquivo, use a busca normal.
- O `update` lê só a estrutura do código; arquivos `.astro` entram de forma parcial. A skill `graphify` (`/graphify`) faz a extração completa, com modelo de linguagem.

## Documentação (onboarding)

| Documento | Assunto |
|---|---|
| [`PLAN.md`](PLAN.md) | Fases ALPHA, BETA e 1.0.0-rc, checklists e asserts de entrega |
| [`docs/README.md`](docs/README.md) | Índice da documentação |
| [`docs/architecture.md`](docs/architecture.md) | Visão geral, pastas, fluxo de dados, decisões |
| [`docs/content.md`](docs/content.md) | Formato de posts e produtos, componentes disponíveis no Markdown |
| [`docs/post-status.md`](docs/post-status.md) | Status de cada post (rascunho, produtos, links de afiliado e pendentes); gerado por `bun run post-status`, não editar à mão |
| [`docs/imported-drafts-review.md`](docs/imported-drafts-review.md) | Checklist dos 514 rascunhos importados: fichas técnicas contraditórias, decisões de SEO pendentes e posts da origem que não entraram |
| [`docs/development.md`](docs/development.md) | Instalação, configuração, comandos e ferramentas |
| [`docs/workflows.md`](docs/workflows.md) | Fluxos de trabalho: ordem de toda mudança, passos por tipo de tarefa, release e deploy |
| [`docs/testing.md`](docs/testing.md) | Tipos de teste, onde ficam e como rodar |
| [`docs/cms.md`](docs/cms.md) | Banco, autenticação, armazenamento de conteúdo e serviço do CMS (fase BETA) |
| [`docs/api.md`](docs/api.md) | API REST `/api/v1`: endpoints, formato de erro, regras de escrita |
| [`docs/performance.md`](docs/performance.md) | Capas redimensionadas no build, cache, contraste, teclado e resultados do Lighthouse |
| [`docs/ui.md`](docs/ui.md) | Direção visual e uso do UI SDK no Astro |
| [`docs/security.md`](docs/security.md) | Modelo de ameaças, relatório da revisão de segurança e o que segue em aberto |
| [`docs/deploy.md`](docs/deploy.md) | GitHub Pages, DNS de `eletroradar`, e o que o site estático não executa |
| [`docs/ci-cd.md`](docs/ci-cd.md) | CI em PR, proteção da main e release sob pedido |
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
bun run build        # build de produção (confere as variáveis de ambiente, valida o conteúdo e sincroniza os links de afiliado)
bun run check-env    # só a conferência das variáveis de ambiente (scripts/check-env.ts)
bun run sync-links   # só a validação e o envio dos links ao dashboard
bun run check        # TypeScript (`tsc --noEmit`)
bun run lint         # Biome + markdownlint
bun run format       # Biome com correção automática
bun run post-status  # regenera docs/post-status.md a partir de content/
bun webscrapping/batch.ts [--write] [--limit N]   # lista, ou importa em lote, os posts do eletrosinter que faltam
bun run test         # Vitest: unitários e integração
bun run test:e2e     # Playwright: smoke e e2e
```

## Regras que não podem ser quebradas

- **Astro 7.4 é mais novo que o conhecimento de treino da maioria dos modelos.** A configuração fica em `astro.config.ts`. O site público é `output: "static"` em `src/pages`. A interface é Astro e TypeScript, com `<script>` nos componentes interativos. Imports internos com `#lib/...` e extensão explícita. Variáveis de servidor vêm de `#env` (`src/env.ts`). Respostas JSON da API usam `#lib/server/http.ts`. Consulte <https://docs.astro.build> antes de usar uma API que você não leu neste repositório.
- **Dependências:** sempre a última versão estável, com versão exata, sem `^` nem `~`. Confira no registry, não de memória. Ver `.agents/rules/dependencies.md`.
- **Formatação:** tab com largura 4 (Biome e `.editorconfig`); YAML e Markdown usam 2 espaços. Demais regras de código em `.agents/rules/code-style.md`.
- **Commits:** Conventional Commits em branch de trabalho. Mudanças chegam à `main` somente por PR com CI verde. Versão, tag, changelog publicado e GitHub Release só mudam quando o dono pedir uma release. Regras em `.agents/rules/git-and-releases.md`.
- **Segredos:** nada de chave real no repositório. `.env.example` só tem placeholders.
- **Indexação:** `/admin` e `/api` são bloqueados no `robots.txt` (`Disallow`) e nunca aparecem em `sitemap.xml` ou `llms.txt`. As páginas de `/admin` trazem metatag `noindex`; o Pages não permite adicionar `X-Robots-Tag`. Os robôs de coleta em massa e de treino de IA de `site.blockedCrawlers` são recusados no site inteiro; buscadores e assistentes continuam liberados.
- **CI:** `.github/workflows/ci.yml` valida os PRs; `.github/workflows/pages.yml` publica a `main`. O workflow automático de release continua desativado.
- **Identidade do site:** nome, URL, autores, categorias e textos vêm de `src/lib/site.config.ts`. Não escreva "EletroRadar" em componentes.
- **Idioma:** código, comentários e mensagens de commit em inglês; documentação e textos de interface em português do Brasil.
- **Status dos posts:** depois de mudar `content/`, rode `bun run post-status` e commite `docs/post-status.md`; o teste falha se ele ficar velho.
- **Sem Svelte:** o projeto é Astro e TypeScript. Código novo usa `.astro` e `.ts`. Não adicione `svelte`, `@astrojs/svelte` nem componentes `.svelte`.
