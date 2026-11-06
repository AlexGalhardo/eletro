# AGENTS.md

Instruções para qualquer agente de código trabalhando neste repositório. O `CLAUDE.md` importa este arquivo; edite sempre aqui.

## O que é o projeto

Template open source de CMS de blog em Astro 7.4 com ilhas Svelte 5. Os posts são Markdown (`content/posts/*.mdx`), os produtos são JSON (`content/products/*.json`) e o site público é estático no GitHub Pages. O dono publica pelo painel `/admin`, que grava o conteúdo com commits no próprio repositório. O EletroRadar (reviews de eletrodomésticos com links de afiliado) é o conteúdo de demonstração e o site em produção. O código do painel, da API, da autenticação e da newsletter continua no repositório e é coberto por testes; o GitHub Pages não executa essas rotas.

## Início de toda sessão (obrigatório)

Antes de responder ou editar qualquer coisa, nesta ordem:

1. Carregue as skills abaixo com a ferramenta de skills (em agentes sem essa ferramenta, leia o `SKILL.md` de cada uma em `.claude/skills/<nome>/`):
   - `using-agent-skills`: roteador das skills de engenharia do pacote agent-skills
   - `karpathy-guidelines`: pensar antes de codar, simplicidade, mudanças cirúrgicas, critérios verificáveis
   - `ponytail`: a solução mais simples que funciona; fica ativa a sessão inteira
2. Leia o [`PLAN.md`](PLAN.md) para saber a fase atual e o próximo item em aberto.
3. Leia o [`docs/README.md`](docs/README.md) e, dele, só a documentação do assunto em que vai mexer.
4. Leia as regras em [`.claude/rules/`](.claude/rules/).

Skills próprias deste projeto: `project-new-post` (criar ou editar um post), `project-new-product-list` (lista de produtos) e `project-release` (lançar uma versão).

Durante o trabalho, carregue a skill específica da tarefa: `interview-me` quando o pedido estiver ambíguo, `spec-driven-development` e `planning-and-task-breakdown` antes de uma feature nova, `source-driven-development` para qualquer API de framework, `test-driven-development` ao escrever lógica, `security-and-hardening` em autenticação, entrada de usuário e integrações, `git-workflow-and-versioning` e `project-release` em todo commit (cada commit é uma release).

As skills de terceiros são cópias sem alteração; origem e versão em [`.claude/skills/SOURCES.md`](.claude/skills/SOURCES.md). A `browser-testing-with-devtools` pede o MCP `chrome-devtools`, que este projeto não configura: a verificação no navegador é feita com Playwright (`.claude/rules/testing.md`).

### Grafo de conhecimento (opcional)

O graphify monta um grafo do código em `graphify-out/`, que fica fora do git: cada máquina gera o seu, e nada no projeto depende dele.

```bash
pip install graphifyy                     # uma vez por máquina (Python 3)
python -m graphify update .               # gera ou atualiza o grafo; cerca de 10 segundos, sem chave de API
python -m graphify query "<pergunta>"     # também: path "<A>" "<B>" e explain "<conceito>"
```

- Com `graphify-out/graph.json` presente, consulte o grafo antes de varrer o código e rode o `update` de novo depois de mudar código: nada o atualiza sozinho.
- Sem o arquivo, use a busca normal.
- O `update` lê só a estrutura do código; os componentes `.svelte` entram de forma parcial. A skill `graphify` (`/graphify`) faz a extração completa, com modelo de linguagem.

## Documentação (onboarding)

| Documento | Assunto |
|---|---|
| [`PLAN.md`](PLAN.md) | Fases ALPHA, BETA e 1.0.0-rc, checklists e asserts de entrega |
| [`docs/README.md`](docs/README.md) | Índice da documentação |
| [`docs/architecture.md`](docs/architecture.md) | Visão geral, pastas, fluxo de dados, decisões |
| [`docs/content.md`](docs/content.md) | Formato de posts e produtos, componentes disponíveis no Markdown |
| [`docs/agent-setup.md`](docs/agent-setup.md) | Setup do zero para agentes: dependências, `.env`, banco, Docker, testes, GitHub Pages e dashboard de links, com comando e verificação por passo |
| [`docs/development.md`](docs/development.md) | Como rodar, scripts de `setups/`, Docker (`infra/`), variáveis de ambiente, convenções |
| [`docs/tooling.md`](docs/tooling.md) | Ferramentas: o que cada uma faz, onde está a configuração, hooks do git, Docker, ferramentas dos agentes |
| [`docs/workflows.md`](docs/workflows.md) | Fluxos de trabalho: ordem de toda mudança, passos por tipo de tarefa, release e deploy |
| [`docs/testing.md`](docs/testing.md) | Tipos de teste, onde ficam e como rodar |
| [`docs/cms.md`](docs/cms.md) | Banco, autenticação, armazenamento de conteúdo e serviço do CMS (fase BETA) |
| [`docs/api.md`](docs/api.md) | API REST `/api/v1`: endpoints, formato de erro, regras de escrita |
| [`docs/newsletter.md`](docs/newsletter.md) | Newsletter: inscrição com confirmação, envio de avisos de post, descadastro |
| [`docs/performance.md`](docs/performance.md) | Capas redimensionadas no build, cache, contraste, teclado e resultados do Lighthouse |
| [`docs/security.md`](docs/security.md) | Modelo de ameaças, relatório da revisão de segurança e o que segue em aberto |
| [`docs/deploy.md`](docs/deploy.md) | GitHub Pages, DNS de `eletroradar.com.br`, e o que o site estático não executa |
| [`docs/setup-vercel.md`](docs/setup-vercel.md) | Roteiro antigo da Vercel. A produção não usa mais esse host |
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
bun run build        # build de produção (confere as variáveis de ambiente, valida o conteúdo e sincroniza os links de afiliado)
bun run check-env    # só a conferência das variáveis de ambiente (scripts/check-env.ts)
bun run sync-links   # só a validação e o envio dos links ao dashboard
bun run check        # svelte-check + TypeScript
bun run lint         # Biome + markdownlint
bun run format       # Biome com correção automática
bun run test         # Vitest: unitários e integração
bun run test:e2e     # Playwright: smoke e e2e
```

## Regras que não podem ser quebradas

- **Astro 7.4 e Svelte 5 são mais novos que o conhecimento de treino da maioria dos modelos.** A configuração fica em `astro.config.ts`. O site público é `output: "static"` em `src/pages`. Componentes Svelte usam runes. Imports internos com `#lib/...` e extensão explícita. Código que ainda importa `$app/env`, `$app/state`, `$app/navigation` ou `@sveltejs/kit` resolve para os shims em `src/shims/` e `src/env.ts`. Consulte <https://docs.astro.build> e o MCP do Svelte antes de usar uma API que você não leu neste repositório.
- **Dependências:** sempre a última versão estável, com versão exata, sem `^` nem `~`. Confira no registry, não de memória. Ver `.claude/rules/dependencies.md`.
- **Formatação:** tab com largura 4 (Biome e `.editorconfig`); YAML e Markdown usam 2 espaços. Demais regras de código em `.claude/rules/code-style.md`.
- **Commits:** Conventional Commits, e todo commit é uma release (versão, `CHANGELOG.md`, tag e GitHub Release), sem exceção para `docs` ou `chore`. Regras em `.claude/rules/git-and-releases.md`; passo a passo na skill `project-release`.
- **Segredos:** nada de chave real no repositório. `.env.example` só tem placeholders.
- **Indexação:** `/admin` e `/api` são bloqueados no `robots.txt` (`Disallow`), nunca aparecem em `sitemap.xml` ou `llms.txt` e respondem com `X-Robots-Tag: noindex`. Os robôs de coleta em massa e de treino de IA de `site.blockedCrawlers` são recusados no site inteiro; buscadores e assistentes continuam liberados.
- **CI:** os workflows de CI e release ficam em `.github/workflows-disabled/`. A exceção já pedida é `.github/workflows/pages.yml`, que publica o site estático no GitHub Pages. Não mova os outros.
- **Identidade do site:** nome, URL, autores, categorias e textos vêm de `src/lib/site.config.ts`. Não escreva "EletroRadar" em componentes.
- **Idioma:** código, comentários e mensagens de commit em inglês; documentação e textos de interface em português do Brasil.
