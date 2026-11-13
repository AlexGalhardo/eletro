# PLAN.md — Astro 7.4 Blog CMS

## Plano atual — GitHub Pages e fluxo por PR (2026-11-13)

Esta seção substitui as decisões históricas abaixo quando houver conflito. A produção continua no GitHub Pages. O `/admin` estático tem uma tela com campo único e botão Login. Quando os dois segredos do Actions estão configurados, a senha desbloqueia em memória um token fine-grained criptografado no build. O painel salva MDX, JSON e imagens numa branch `cms/*` e abre PR. A `main` é protegida por ruleset e recebe mudanças só por PR com CI verde. O dono pediu a release `v0.11.0`. As instruções dos agentes ficam em `.agents/`.

- [x] Editor estático e PR para o conteúdo; teste unitário do cliente e e2e com API simulada.
- [x] Tela mínima e fluxo opcional de senha com credencial criptografada; teste unitário e e2e com API simulada.
- [x] Revisão visual das páginas principais, contato funcional no Pages, UI SDK, ícone SVG e fundo de papel integrados.
- [x] Ruleset de PR ativo no GitHub e workflow de CI em `.github/workflows/ci.yml`.
- [x] Releases e tags 0.11.x a 0.13.0 removidas; notas acumuladas em `Unreleased`.
- [x] `.claude/` migrada para `.agents/` e documentação consolidada.
- [ ] Conferir CI do PR e o deploy depois do merge. Nenhuma release será criada sem pedido.

Planejamento vivo do projeto. Toda sessão de trabalho começa lendo este arquivo e termina atualizando os checklists.

- `[ ]` pendente · `[~]` em andamento · `[x]` entregue e verificado
- Um item só vira `[x]` quando o **assert** do grupo foi verificado de verdade (comando rodado, teste verde), nunca por suposição.
- Decisões novas entram em [Decisões](#decisões) com data.

## Intenção confirmada (2026-10-06)

| Item | Definição |
|---|---|
| Resultado | Template open source de CMS de blog em Astro 7.4, com posts em Markdown e o EletroRadar completo como demo real e site de produção no GitHub Pages |
| Usuário | O dono do site, publicando reviews pelo `/admin` sem abrir o código; e quem clonar o template, trocando a configuração e o conteúdo |
| Sucesso | Mesmo visual e mesmas URLs do site atual, rodapé mais profissional, uma review nova criada do zero pelo navegador, testes verdes |
| Restrições | Produção no GitHub Pages (grátis); dependências na última versão estável com versão exata; tab de largura 4; SemVer, Keep a Changelog, Conventional Commits |
| Fora de escopo | Múltiplos papéis de usuário, comentários, multi-idioma, redesenho além do rodapé, ativar o CI, fazer deploy |

## Arquitetura

| Assunto | Decisão |
|---|---|
| Framework | Astro 7.4 (`output: "static"`) e TypeScript. Hospedagem: GitHub Pages. O snapshot SvelteKit está na branch `legacy-sveltekit` |
| Conteúdo | Arquivos no repositório: `content/posts/*.mdx` (mdsvex) e `content/products/*.json`. Site público pré-renderizado no build |
| Escrita pelo admin | Commit via API do GitHub com `GITHUB_TOKEN` (token fine-grained restrito a um repositório), assinado com o nome de quem logou; o deploy publica em 1 a 2 min. Em dev e testes, grava no disco local |
| Autenticação | better-auth com login GitHub, restrito à lista `ADMIN_GITHUB_USERS`; sessões no Postgres |
| Banco | Postgres Neon + Drizzle ORM (auth e newsletter). PGlite em dev e testes, sem Docker |
| Newsletter | Double opt-in, descadastro em um clique, e-mails com react-email enviados pelo Resend. Disparo fica pendente até a URL do post responder 200 |
| API REST | `/api/v1`: leitura pública de posts, categorias e produtos; escrita exige sessão de admin |
| Estilo | Tailwind CSS 4, mesmas classes do site atual; identidade concentrada em `src/lib/site.config.ts` |
| Qualidade | Vitest (unitário e integração), Playwright (smoke e e2e), TypeScript (`tsc --noEmit`), Biome v2, markdownlint |
| Releases | Todo commit é uma release: versão, seção no `CHANGELOG.md` (Keep a Changelog), tag e GitHub Release. `scripts/release.ts` calcula a versão pela mensagem do commit. Commits `content:` do painel ficam de fora |
| CI/CD | Workflows escritos em `.github/workflows-disabled/` (inativos até o billing do GitHub ser corrigido) |

---

## Fase ALPHA — fundação e site público (0.1.0)

Objetivo: o site atual rodando em SvelteKit, idêntico para o visitante.

### A1. Repositório e governança

- [x] Git novo com `origin` em `sveltekit-blog-cms-claude-code` (histórico antigo em backup fora do projeto)
- [x] Skills instaladas em `.agents/skills/` (agent-skills, karpathy-guidelines, ponytail, graphify)
- [x] `CLAUDE.md` e `AGENTS.md` com carga obrigatória das skills no início da sessão e links para `docs/`
- [x] `.agents/rules/` (código, commits, testes, conteúdo, dependências)
- [x] `.editorconfig` (tab, largura 4), Biome v2 e markdownlint alinhados
- [x] `.gitignore` cobrindo `.env*`; `.env.example` só com placeholders
- [x] Husky + commitlint (Conventional Commits)
- [x] `CHANGELOG.md` (Keep a Changelog) e `package.json` em `0.1.0`
- [x] MCP do Svelte em `.mcp.json`

**Assert:** `git status` não lista nenhum `.env` real; `git log` só tem commits no padrão convencional; um commit fora do padrão é recusado pelo hook.

### A2. Esqueleto SvelteKit

- [x] Projeto SvelteKit 3 + TypeScript + Tailwind 4 + mdsvex, dependências com versão exata
- [x] `src/lib/site.config.ts` com nome, URL, autores, categorias, textos e IDs de analytics
- [x] Scripts `dev`, `build`, `preview`, `check`, `lint`, `format`, `test`, `test:e2e`

**Assert:** `bun run check`, `bun run lint` e `bun run build` terminam com código 0; nenhuma dependência com `^` ou `~`.

### A3. Migração de conteúdo

- [x] Migração única (script descartável, não versionado): 64 posts para `content/posts/`, 69 listas para `content/products/`, `<CardsTable category>` reescrito para `<CardsTable list>`
- [x] Schemas zod de post e de produto; validação de todo o conteúdo no build
- [x] Imagens em `static/images/`
- [x] Prompts de conteúdo movidos para `docs/prompts/`

**Assert:** teste de integração confirma 64 posts válidos, todo `list` referenciado existe e toda imagem referenciada existe em `static/`.

### A4. Site público com o visual atual

- [x] Layout raiz: fontes, tema claro/escuro, barra de carregamento, analytics, banner de cookies
- [x] Cabeçalho com busca (Fuse) e menu lateral móvel
- [x] Home com filtro de categorias e carregamento incremental
- [x] Página de post: compartilhamento, capa, conteúdo, box do autor, barra de leitura, proteção de cópia
- [x] `CardsTable` com botões Mercado Livre, Shopee e Amazon
- [x] Páginas Sobre, Contato (envio pelo Resend), Política de Privacidade, Termos de Uso, 404
- [x] Redirects 301 antigos avaliados e descartados (nunca funcionaram no site Next e apontavam para slugs de outro site)
- [x] Rodapé novo, mais profissional
- [ ] Comparação visual final contra o site Next (adiada a pedido do dono em 2026-10-06; uma rodada já foi feita e corrigiu tipografia, borda dos cartões, ícone e logotipo)

**Assert:** comparação visual lado a lado (Playwright) de home, post e contato contra o site Next atual, em claro e escuro, desktop e celular, sem diferença além do rodapé.

### A5. SEO e indexação

- [x] Metatags, Open Graph, Twitter Card e canonical por página
- [x] JSON-LD no HTML do servidor (BlogPosting, FAQPage, WebSite, Organization, ItemList)
- [x] `sitemap.xml`, `robots.txt` e `llms.txt` gerados, todos sem `/admin` e sem `/api`
- [x] Arquivos de verificação (Bing, IndexNow) preservados

**Assert:** teste e2e confirma que as 64 URLs de post respondem 200 com `<title>` e JSON-LD corretos e que `robots.txt`, `sitemap.xml` e `llms.txt` não contêm `/admin`.

### A6. Base de testes

- [x] Vitest: unitários de conteúdo, datas, slug e SEO
- [x] Playwright: smoke das rotas públicas
- [x] `docs/` inicial: visão geral, arquitetura, conteúdo, testes

**Assert:** `bun run test` e `bun run test:e2e` verdes localmente; versão `0.1.0` registrada no changelog.

---

## Fase BETA — CMS, API e newsletter (0.2.0 → 0.9.0)

Objetivo: publicar e manter o blog inteiro pelo navegador.

### B1. Banco de dados

- [x] Drizzle + Neon; PGlite quando `DATABASE_URL` não está definido (PGlite coberto por teste; o caminho Neon só será exercitado quando o dono criar o banco)
- [x] Migrations versionadas (`drizzle/0000_init.sql`) e scripts `db:generate` e `db:migrate`

**Assert:** testes de integração sobem um PGlite limpo, aplicam as migrations e passam.

### B2. Autenticação

- [x] better-auth com provedor GitHub e sessões no Postgres (sessão testada pelo login de testes; o OAuth real depende do OAuth App do dono)
- [x] Lista `ADMIN_GITHUB_USERS`; quem não está na lista não cria sessão, e quem sai da lista perde a sessão
- [x] `/admin/**` redireciona para `/admin/login` sem sessão; `/admin/login` redireciona para `/admin` com sessão
- [x] Login de testes `POST /api/test/login`, só com `AUTH_TEST_LOGIN_TOKEN` e fora de produção
- [x] Cabeçalho `X-Robots-Tag: noindex` em `/admin` e `/api`

**Assert:** e2e — visitante anônimo em `/admin` e `/admin/posts` cai em `/admin/login`; usuário fora da lista é recusado; API de escrita sem sessão responde 401. (Verificado em 2026-10-06 por `tests/e2e/admin.spec.ts`.)

### B3. Camada de conteúdo com escrita

- [x] `ContentStore` com implementação GitHub (commits) e disco local (dev e testes)
- [x] Criar, editar, despublicar e excluir post; criar e editar lista de produtos; upload de imagem (`src/lib/server/cms.ts`)
- [x] Validação do corpo do post contra tudo o que o mdsvex trataria como código, para um post nunca quebrar o deploy
- [x] Mensagens de commit `content: ...` e tratamento de conflito de versão (SHA)

**Assert:** testes de integração do store local cobrindo o ciclo completo; teste do store GitHub com a API simulada, incluindo conflito 409.

### B4. Dashboard `/admin`

- [x] Painel inicial: totais de posts, rascunhos, agendados, assinantes e últimos commits de conteúdo (os commits só com o store do GitHub; esse caminho está coberto por teste com a API simulada)
- [x] Lista de posts com busca, filtro e status
- [x] Editor de post: campos do frontmatter, Markdown com preview, FAQ, capa, seleção da lista de produtos
- [x] Editor de produtos em formulário: dados, links de afiliado, vantagens, ficha técnica, ordem
- [x] Biblioteca de mídia com upload
- [x] Indicador de status do deploy após salvar (por hash do conteúdo, sem depender da plataforma)

**Assert:** e2e — admin cria uma review nova (post, lista com dois produtos, capa) só pelo navegador e ela aparece na home e na URL própria após o rebuild. (Verificado em 2026-10-06 em duas partes: `tests/e2e/cms.spec.ts` cria a review pelo navegador e confere os arquivos gravados; o rebuild foi conferido à mão com uma review gravada pelo mesmo serviço: `bun run build`, home e URL própria com 200, cartões dos dois produtos e status "No ar" no editor. O e2e não refaz o build.)

### B5. API REST `/api/v1`

- [x] `GET` posts (paginação, categoria, busca), post por slug, categorias, listas de produtos, saúde
- [x] `POST`/`PUT`/`DELETE` de posts, `POST`/`PUT` de listas de produtos e upload de mídia com sessão de admin (excluir lista ou imagem ficou de fora: o serviço `cms.ts` não tem essa operação)
- [x] Erros em formato único, validação zod, CORS de leitura, limite de requisições (em memória, por instância)
- [x] `openapi.json` e `docs/api.md`

**Assert:** testes de integração de todo endpoint (200, 400, 401, 404); `openapi.json` validado. (Verificado em 2026-10-06: `tests/integration/api.test.ts` verde e `redocly lint` sem erros.)

### B6. Newsletter

- [x] Tabelas de assinantes, de envios e de entregas (`newsletter_delivery`, migration `0001`)
- [x] Formulário de inscrição no site, confirmação por e-mail, descadastro em um clique (um clique no botão da página aberta pelo link do e-mail)
- [x] Templates react-email: confirmação, post novo, contato
- [x] Opção "avisar assinantes" ao publicar; envio pendente até o post estar no ar; envio em lotes pelo Resend, sem duplicar
- [x] Tela `/admin/newsletter`: assinantes, envios e reenvio manual
- [x] Agendador chamando `/api/v1/newsletter/dispatches/run`: cron da Vercel a cada 15 minutos em `vercel.json`, conferido nos logs de produção em 2026-10-06

**Assert:** integração — inscrever, confirmar, publicar e disparar gera exatamente um e-mail por assinante confirmado (Resend simulado); descadastrado não recebe; disparo repetido não reenvia. (Verificado em 2026-10-06: `tests/integration/newsletter.test.ts` verde, incluindo a retomada de um envio que falhou no meio sem repetir e-mail. O envio real pelo Resend não foi exercitado: depende da chave do dono.)

### B7. Importação por web scraping

- [x] Estudo de viabilidade: `robots.txt` da origem lido e respeitado, HTML estático lido com `fetch`, sem navegador e sem bloqueio (relatório em `docs/webscrapping-modelation.md`)
- [x] Dependência `cheerio` 1.2.0 (parser de HTML), versão exata
- [x] `webscrapping/parse.ts`: função pura `html + url -> dados` (nome, foto, ficha técnica, ordem)
- [x] `webscrapping/fetch.ts`: só `https`, lista de hosts, redirecionamento conferido, tempo limite e tamanho máximo
- [x] `webscrapping/build.ts`: rascunho gerado por modelos a partir dos fatos, sem copiar o texto da origem; 7 primeiros produtos; links `#`; capa vazia
- [x] `webscrapping/cli.ts`: execução manual (`bun webscrapping/cli.ts <url> [--write]`)
- [x] Hosts permitidos em `site.postImport` (`src/lib/site.config.ts`)
- [x] Serviço `importPost` (`src/lib/server/post-import.ts`) sobre `uploadImage`, `saveProductList` e `savePost`
- [x] Endpoint `POST /api/v1/imports` (admin), descrito no `openapi.json` e em `docs/api.md`
- [x] Tela `/admin/import` com link para o rascunho no editor
- [x] Testes: unitários do parser, do construtor e do `fetch` com página sintética; integração do serviço e do endpoint com store em pasta temporária e `fetch` simulado; e2e da tela (acesso e recusa de endereço)
- [x] Um rascunho real criado pelo próprio importador: `content/posts/melhor-lava-loucas-portatil.mdx`
- [ ] Medir uma importação com o store do GitHub em produção (cerca de 9 commits em sequência) e ajustar o tempo limite da função se preciso
- [x] Reescrita do resumo e do FAQ com a Mistral (`webscrapping/rewrite.ts`, `MISTRAL_API_KEY`); sem chave ou com falha, fica o texto genérico
- [ ] Testar a reescrita com a chave real em produção (a rede do ambiente de desenvolvimento bloqueou `api.mistral.ai`)
- [x] Capa gerada na importação: 3 fotos dos produtos sobre fundo claro aleatório, com o endereço do site (`webscrapping/cover.ts`)
- [ ] Parser para outros sites de origem
- [ ] Limpeza das fotos órfãs quando a importação falha no meio

**Assert:** integração — importar a página sintética grava 7 fotos, a lista e o post como rascunho, sem nenhum trecho do texto da origem, e recusa host fora da lista sem fazer requisição; execução real contra um post da origem cria um rascunho que passa em `bun run test` e não aparece no build. (Verificado em 2026-10-06: `webscrapping/webscrapping.test.ts`, `tests/integration/import.test.ts` e `tests/e2e/import.spec.ts` verdes; importação real em 3,1 s com o store local; `bun run build` com o rascunho fora de `sitemap.xml` e da API.)

### B8. Google Search Console e Analytics

- [x] Cliente `src/lib/server/google.ts`: conta de serviço (JWT assinado com `node:crypto`), relatórios do Search Console e do GA4, envio de sitemap; sem dependência nova
- [x] Variáveis `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE` e `GOOGLE_ANALYTICS_PROPERTY_ID`
- [x] Tela `/admin/google` e endpoint `POST /api/v1/google/sitemap` (admin), descrito no `openapi.json` e em `docs/api.md`
- [x] `docs/google-console-analytics-setup.md`
- [ ] Conferir com a conta de serviço real: nenhuma chamada ao Google de verdade foi feita no desenvolvimento

**Assert:** unitário — com o `fetch` simulado, o JWT é verificado com a chave pública, os relatórios são lidos, o sitemap é enviado com `PUT` e a recusa do Google vira mensagem; integração — o endpoint responde 401 sem sessão e 503 sem as variáveis. (Verificado em 2026-10-07: `src/lib/server/google.test.ts` e `tests/integration/api.test.ts` verdes.)

### B9. Painel: posts e produtos ligados, mídia e robôs

- [x] `listPosts` informa as listas de cada post; `/admin/posts` mostra a coluna "Produtos" e `/admin/products` mostra o uso de cada lista, com filtro "Em uso" e "Sem uso"
- [x] Excluir uma lista em uso leva os posts que a mostram para rascunho, sem o `<CardsTable>` dela
- [x] `/admin/media`: "Copiar link" com o clipboard.js 2.0.11, endereço completo e aviso "Link copiado"
- [x] `robots.txt` com `Content-Signal` e bloqueio dos robôs de `site.blockedCrawlers`; regra repetida no `llms.txt` e nos Termos de Uso
- [ ] Bloqueio de scraping na borda (firewall da hospedagem): o `robots.txt` é só um pedido

**Assert:** integração — excluir uma lista em uso deixa o post em rascunho sem o `<CardsTable>` dela e mantém as outras listas do post; com `sha` desatualizado nada muda. e2e — `robots.txt` traz o `Content-Signal` e o bloqueio dos robôs de treino. (Verificado em 2026-10-07: `tests/integration/cms.test.ts` verde; o e2e e as telas, conferidos como descrito no changelog da versão.)

---

## Fase 1.0.0-rc — endurecimento e entrega (1.0.0-rc.1 → 1.0.0)

Objetivo: template pronto para outra pessoa clonar e colocar em produção.

### R1. CI/CD (inativo)

- [x] `ci.yml`: lint, check, testes unitários e de integração, build, e2e
- [x] `release.yml`: versão, changelog, tag e GitHub Release depois de um CI verde em `main` com `feat`/`fix`
- [x] `scripts/release.ts`: calcula a versão pelos Conventional Commits e corta o `CHANGELOG.md`
- [x] Arquivos em `.github/workflows-disabled/` e passo a passo de ativação em `docs/ci-cd.md`

**Assert:** `actionlint` sem erros; o script de release rodado em modo simulação produz a versão e as notas esperadas; nenhum arquivo em `.github/workflows/`.

Verificado em 2026-10-06:

| Verificação | Resultado |
|---|---|
| `actionlint` 1.7.12 nos dois workflows | sem erros |
| Job `quality` no contêiner `ubuntu-24.04` com `act` 0.2.89 | passou: install, lint, check, 334 testes, build (na `v1.0.0-rc.1`) |
| Job `e2e` no contêiner com `act` | passou na `v1.0.0-rc.1`, com o antivírus da máquina desligado: Chromium instalado e 66 testes. Na primeira tentativa, com o antivírus ligado, o download do Chromium tinha falhado com `self-signed certificate in certificate chain` |
| Passos do job `e2e` em um clone limpo, com `CI=true` | passou: 64 testes, sem nova tentativa |
| Passos do `release.yml` em um clone descartável, sem push | `0.1.0 -> 0.2.0`, commit `chore(release): v0.2.0`, tag, changelog e links corretos; segunda execução e commit `content:` não geram versão |
| `.github/workflows/` | não existe |

Fica por conferir quando os workflows forem ativados: o `release.yml` de ponta a ponta (o gatilho `workflow_run`, o push do bot e o `gh release create` não têm como ser simulados localmente).

### R2. Segurança

- [x] Revisão com a skill `security-and-hardening` e o OWASP Top Ten 2025: CSRF, cabeçalhos, sanitização do Markdown, validação de upload, limite de tentativas (relatório em `docs/security.md`)
- [x] Varredura de segredos no repositório e no histórico (nada encontrado)
- [ ] CSP: exige tirar os scripts embutidos de `app.html` e `src/layouts/Root.astro` e testar o analytics em um deploy real
- [ ] Conferir em um deploy real os cabeçalhos de `static/_headers` (Netlify). Os de `vercel.json` foram conferidos em produção em 2026-10-06
- [ ] Compilar o corpo do post ao salvar, para recusar HTML malformado que quebra o build (leva `mdsvex` para produção: decisão do dono)

**Assert:** relatório de segurança sem achado alto ou crítico em aberto. (Verificado em 2026-10-06: o único achado alto, o contorno do `validateBody` por chaves codificadas, foi corrigido com teste; em aberto ficam só médios e baixos, listados em `docs/security.md`.)

### R3. Desempenho e acessibilidade

- [x] Imagens responsivas (capas em 480, 768 e 1280 px geradas no build, com `srcset`) e carregamento tardio; fontes locais
- [x] Navegação por teclado (teste e2e) e contraste AA (Lighthouse: acessibilidade 100)
- [ ] Lighthouse com 90 ou mais nas quatro categorias: com o antivírus desligado, desempenho 91 (home) e 89 (post), acessibilidade 100, SEO 100, boas práticas 77. Boas práticas reprova pelos cookies de terceiros do Microsoft Clarity, carregado antes do aceite no banner (detalhes e opções em `docs/performance.md`)

**Assert:** Lighthouse ≥ 90 em desempenho, acessibilidade, boas práticas e SEO nas duas páginas, no celular. (Em 2026-10-06, mediana de três execuções locais com o antivírus desligado: acessibilidade 100, SEO 100 e desempenho da home 91, **atendidos**; desempenho do post 89 e boas práticas 77, **não atendidos**. Boas práticas reprova pelos cookies de terceiros do Clarity. Uma medição anterior, com o antivírus ligado, tinha atribuído essa nota ao antivírus: estava errado.)

### R4. Documentação e template

- [x] `README.md`: o que é, como rodar, como abrir o painel localmente, como publicar
- [x] `docs/deploy.md`: Vercel, Netlify, Neon, OAuth App, token de conteúdo, Resend, agendador (escrito sem um deploy real: tem a lista do que conferir)
- [x] `docs/` completa e linkada no `AGENTS.md` (que o `CLAUDE.md` importa)
- [x] Guia "use como template" no `README.md`: `site.config.ts`, `content/`, páginas institucionais, arquivos de `static/`, testes que citam o conteúdo de demonstração
- [x] Skills próprias do projeto: `project-new-post`, `project-new-product-list`, `project-release`
- [x] Entrada local no `/admin/login` (só com o banco embutido), para abrir o painel sem criar um OAuth App

**Assert:** clone limpo + `bun install` + `bun run dev` funciona seguindo só o README, sem variável obrigatória para o site público. (Verificado em 2026-10-06 em um clone novo: sem nenhuma variável, a home, um post e a API respondem 200 e `/admin` leva ao login, que lista o que falta; com as três variáveis da seção "Abrindo o painel", a entrada local cria a sessão e o painel lista os 65 posts.)

### R5. Release candidate

- [x] Todos os asserts das fases anteriores reexecutados (tabela abaixo; três não fecham sem um deploy ou sem o dono)
- [x] `1.0.0-rc.1` no changelog e tag criada
- [x] Lista de pendências conhecidas para a `1.0.0` (abaixo)

**Assert:** suíte completa verde a partir de um clone limpo. (Verificado em 2026-10-06: clone novo, `bun install`, e com `CI=true`: `bun run check`, `bun run lint`, `bun run test` com 334 testes, `bun run build` e `bun run test:e2e` com 66 testes, todos com código 0.)

#### Asserts reexecutados em 2026-10-06

| Grupo | Assert | Resultado |
|---|---|---|
| A1 | Nenhum `.env` versionado; só commits convencionais; hook recusa mensagem fora do padrão | Atendido: só `.env.example`; 0 commits fora do padrão; `commitlint` devolve 1 para uma mensagem inválida e 0 para uma válida |
| A2 | `check`, `lint` e `build` com código 0; nenhuma dependência com `^` ou `~` | Atendido |
| A3 | Conteúdo válido, listas e imagens referenciadas existem | Atendido (`tests/integration/content.test.ts`; 65 posts, 70 listas) |
| A4 | Comparação visual lado a lado com o site Next | **Não executado**: adiado pelo dono. Desde então o tema claro mudou de propósito em dois tons (contraste AA) e o rodapé ganhou o formulário da newsletter |
| A5 | Toda URL de post responde com título e JSON-LD; `robots`, `sitemap` e `llms` sem `/admin` | Atendido (`tests/e2e/smoke.spec.ts`) |
| A6 | `test` e `test:e2e` verdes | Atendido |
| B1 a B7 | Testes de integração e e2e de cada grupo | Atendido |
| B4 | Review criada pelo navegador aparece no site depois do rebuild | Atendido em duas partes, como registrado no grupo; o rebuild não é automatizado |
| R1 | `actionlint` sem erros; release em simulação; nada em `.github/workflows/` | Atendido. Os dois jobs do CI passaram em contêiner com `act`; o `release.yml` de ponta a ponta só fecha com os workflows ativos |
| R2 | Nenhum achado alto ou crítico em aberto | Atendido |
| R3 | Lighthouse 90 ou mais nas quatro categorias, no celular | **Parcial**: acessibilidade 100, SEO 100, desempenho 91 na home; desempenho 89 no post e boas práticas 77. Boas práticas depende de uma decisão sobre o Clarity |
| R4 | Clone limpo roda seguindo só o README | Atendido |

#### Pendências conhecidas para a 1.0.0

A `1.0.0` saiu em 2026-10-07 por decisão do dono. Os itens abertos abaixo não a bloquearam e seguem como trabalho das próximas versões.

Dependem do primeiro deploy (lista completa em `docs/deploy.md`):

- [x] Deploy na Vercel ou na Netlify com banco Neon, OAuth App, token de conteúdo e Resend (Vercel, em 2026-10-06: `https://eletroradar.com.br`)
- [ ] Login real pelo GitHub e um post publicado pelo painel de ponta a ponta, com o commit e o deploy
- [ ] Cabeçalhos de segurança de `static/_headers` conferidos em produção (os de `vercel.json` já foram, em 2026-10-06)
- [ ] PageSpeed Insights na home e em um post (assert de R3)
- [ ] Importação de post com o store do GitHub dentro do tempo limite da função
- [ ] Um envio real da newsletter pelo Resend (o agendador já roda em produção)

Dependem de decisão do dono:

- [ ] Comparação visual final com o site Next (A4)
- [ ] Clarity só depois do aceite no banner de cookies, ou fora do site: é o que reprova boas práticas no Lighthouse
- [ ] CSP (exige mover os scripts embutidos e testar o analytics)
- [ ] Compilar o corpo do post ao salvar, para recusar HTML malformado (leva `mdsvex` para produção)
- [x] Convenção dos links `#`: não geram botão; produto sem link real usa a oferta padrão pelo dashboard de links ([`docs/affiliate-links.md`](docs/affiliate-links.md))
- [ ] Uso das fotos do CDN da Amazon
- [ ] Ativar os workflows de CI e release (billing do GitHub)
- [ ] Revisar o texto da Política de Privacidade sobre a newsletter

Técnicas, sem bloqueio externo:

- [ ] Limite de requisições em armazenamento compartilhado (hoje em memória, por instância)
- [ ] Registro de eventos de segurança (login, recusa, 401, 429)
- [ ] Token próprio e com validade para o descadastro da newsletter
- [ ] Busca e paginação em `/admin/newsletter`; exclusão de imagem
- [ ] Causa da navegação que às vezes não completa nos testes e2e sob carga

### R6. Setup do zero, scripts e Docker (1.5.1)

- [x] `docs/development.md`: roteiro de um clone novo até a produção, com comando e verificação por passo (dependências, `.env`, banco, execução local, Docker, testes, conteúdo, GitHub e release, Vercel, dashboard de links)
- [x] `docs/development.md` (ferramentas, configuração, hooks, Docker, ferramentas dos agentes) e `docs/workflows.md` (ordem de uma mudança, passos por tipo de tarefa, release, deploy), ligando aos documentos que já existiam
- [x] `setups/` com quatro scripts: `setup-unix-local.sh`, `setup-windows-local.sh`, `setup-unix-with-docker.sh`, `setup-windows-with-docker.sh`, sobre as funções de `setups/_common.sh`. Não instalam nem encerram nada por conta própria: dizem o que falta, escolhem outra porta ou param
- [x] `infra/Dockerfile` (`oven/bun:1.4.2-slim` com o Node `24.21.0`), `infra/docker-compose.yml` e `.dockerignore` na raiz
- [x] `.env.example`: comentário que quebrava em duas linhas (a segunda sem `#`) corrigido; o Docker Compose recusava o `.env` gerado a partir dele

**Assert:** os scripts passam em `bash -n`; no Windows (Git Bash), o `-local` e o `-with-docker` rodam de ponta a ponta e podem ser repetidos; `check`, `lint` e `test` verdes. (Verificado em 2026-10-11, Windows 11, Docker 29.8.1, Compose 5.5.1: `setup-windows-local.sh --no-start` cria o `.env`, preenche os dois segredos e, na segunda execução, não altera nada; com a 5173 ocupada, escolhe a 5174, e com `PORT=5173` para com código 1. `setup-windows-with-docker.sh` builda a imagem, o container fica `Healthy`, a home, um post, o sitemap e a API respondem 200, a entrada local cria a sessão e `/admin` responde 200; o processo roda como o usuário `bun` e não há `.env` na imagem. **Não executados:** os dois scripts `-unix-` fora do `bash -n` e da recusa de plataforma, por falta de uma máquina macOS ou Linux nesta sessão; `shellcheck`, que não está instalado.)

### R7. Variáveis de ambiente conferidas no build (1.6.0)

- [x] `src/lib/env-check.ts` (zod 4): formato de toda variável com formato conhecido, par de login pela metade e, só no build de produção (`VERCEL_ENV=production`), as variáveis essenciais
- [x] `scripts/check-env.ts` no começo de `bun run build`, antes do `scripts/sync-links.ts`; uma linha por problema, com o nome da variável e sem o valor
- [x] Testes de login: e-mail fora de `ADMIN_EMAILS`, e-mail não verificado (Google e GitHub) e usuário fora de `ADMIN_GITHUB_USERS` são recusados no fluxo completo
- [x] Página desconhecida segue redirecionando para `/` (já coberto por `tests/e2e/smoke.spec.ts`); conferido em produção

**Assert:** `check`, `lint` e `test` verdes; `bun run build` passa sem exigir variável; `VERCEL_ENV=production bun --no-env-file scripts/check-env.ts` sai com código 1 e lista os 9 problemas. (Verificado em 2026-10-11.)

---

### R8. Revisão de `.agents/` (1.6.1)

- [x] Regras e skills do projeto conferidas contra o código: links de afiliado pelo dashboard, id de produto, hooks do git, commit `content:` com release
- [x] Um lugar por fato: `AGENTS.md` aponta para `.agents/rules/`, as regras apontam para `docs/` e para as skills `project-*`
- [x] graphify opcional: hooks do Claude Code removidos (`.agents/settings.json`), `.agents/CLAUDE.md` removido, geração e atualização do grafo descritas no `AGENTS.md`
- [x] Skills, agentes e checklists de terceiros mantidos sem alteração: todos são citados pelo `using-agent-skills` ou por outra skill do mesmo pacote

**Assert:** `.agents/settings.json` não existe e `git grep hook-guard` só encontra o `CHANGELOG.md` e este plano; `bun run check`, `bun run lint` e `bun run test` passam.

---

## Fase 1.x — conteúdo em massa

Objetivo: publicar o acervo de posts da origem com texto original, em lotes, sem mudar o site.

### C1. Importação em lote

- [x] Categorias novas em `site.categories`: `banheiro`, `cama-mesa-banho`, `iluminacao`, `infantil` e `jardim`, com ícones em `CategoryIcon.svelte`
- [x] `webscrapping/batch.ts`: lista as URLs de posts do eletrosinter que ainda não existem aqui (campo `ref`)
- [x] `bun webscrapping/batch.ts --write [--limit N]`: importa em sequência, com pausa de 1,5 s, sem reescrita da Mistral; relatório em `.data/batch-import.json`; idempotente
- [ ] Posts com fotos no CDN da Magalu (403 a robôs) ou da Shopee: 17 ficaram de fora do lote; importar à mão com outra foto
- [ ] Reescrita dos ~550 rascunhos com agentes Haiku, usando só nome e ficha técnica (`docs/prompts/PROMPT-POSTAGEM.md`)
- [ ] Trocar os links `"#"` e publicar em lotes (`draft: false` só depois de revisado)
- [ ] Páginas com layout que o parser não entende (batedeira, cafeteira expresso, fogões de 4 e 5 bocas) e as outras recusadas no relatório

**Assert:** `webscrapping/batch.test.ts` verde; `bun webscrapping/batch.ts` sem `--write` não grava nada; uma segunda execução com `--write` não importa de novo o que já existe; `bun run build` não publica rascunho.

### C2. Status dos posts e links no admin

- [x] `bun run post-status` (`scripts/post-status.ts`, lógica em `src/lib/content/post-status.ts`) gera `docs/post-status.md`
- [x] `tests/integration/post-status.test.ts` falha quando o arquivo está desatualizado
- [x] `/admin/posts`: coluna "Links" (reais e pendentes) e filtro "Links de afiliado" (todos, com pendentes, sem pendências)

**Assert:** `src/lib/content/post-status.test.ts` e `tests/integration/post-status.test.ts` verdes; depois de `bun run post-status`, `docs/post-status.md` não muda.

### C3. Feature flags e prévia

- [x] `content/flags.json` (`previewDrafts`, `allStoreButtons`) e `src/lib/flags.ts` (`flagDefaults`, `browserFlag`, `setBrowserFlag`, override em `localStorage`)
- [x] `/admin/flags`: página Astro estática, sem Svelte, com as flags de navegador e a lista de posts
- [x] `allStoreButtons`: os cartões mostram os três botões mesmo com link `"#"`
- [x] `/preview/<slug>`: faixa "Prévia de rascunho", `noindex`, `Disallow` no `robots.txt`, fora do sitemap, do `llms.txt`, da API pública e do dashboard de links

**Assert:** `src/lib/flags.test.ts` verde; com `previewDrafts: true`, `/preview/<slug>` responde 200 com `noindex`; com `false`, o build não gera `/preview`; o rascunho segue fora do sitemap, do `llms.txt` e da API (`tests/e2e/smoke.spec.ts`, a conferir a cobertura de `/preview`).

---

## Fase Astro puro — migração sem Svelte

Objetivo: remover o Svelte do projeto e ficar só com Astro e pacotes agnósticos. O painel `/admin` vira páginas Astro com `<script>` TypeScript e endpoints Astro. Decisão do dono em 2026-11-10; código novo já evita Svelte.

### M1. Migração

- [x] Componentes do site viram `.astro` ou TypeScript; busca, filtro, tema e `CardsTable` usam `<script>`, sem runtime Svelte
- [x] Painel `/admin` (`src/routes/admin/`) em páginas Astro com `<script>` TypeScript. No GitHub Pages essas rotas continuam entregando só o login
- [x] Rotas de API (`src/routes/api/v1/`) seguem nos handlers `server.ts`, embrulhados por `src/pages/api/`, com os mesmos testes
- [x] Shims `$app/*` removidos. `src/env.ts` permanece e o servidor importa `#env`. Respostas HTTP ficam em `src/lib/server/http.ts`
- [x] Dependências `svelte`, `@astrojs/svelte`, `svelte-check` e `@lucide/svelte` removidas do `package.json` e do `bun.lock`
- [x] `bun run check` usa `tsc --noEmit`
- [x] MCP do Svelte em `.mcp.json` removido
- [x] `docs/architecture.md`, `docs/development.md`, `docs/development.md` e `.agents/rules/code-style.md` atualizados (Astro, TypeScript, `#env`)

**Assert:** nenhum `.svelte` e nenhum import de `svelte`, `@sveltejs/*` ou `$app/*` em `src/` e `tests/`; `bun run check`, `bun run lint`, `bun run test` e `bun run test:e2e` verdes; o build gera as mesmas URLs de antes.

Nesta sessão o `check` e o `test` passaram. O `lint` ainda falha em `scripts/release.ts` e `tests/unit/release.test.ts`, que já estavam alterados fora desta migração. O `test:e2e` e o `build` não rodaram.

## Onde a sessão de 2026-10-06 parou

Todas as fases do plano foram percorridas. ALPHA publicada como `v0.1.0`; BETA (B1 a B7) e a fase 1.0.0-rc (R1 a R5) entregues, com a versão `v1.0.0-rc.1` marcada. O que separa o release candidate da `1.0.0` está em "Pendências conhecidas para a 1.0.0", no grupo R5: quase tudo depende do primeiro deploy ou de uma decisão do dono.

Próximo passo: fazer o primeiro deploy seguindo `docs/deploy.md` e marcar a lista de conferência.

Problema conhecido: sob carga, uma navegação do Playwright para a home pode não completar em 30 s (cerca de 1 em 100 testes, sempre nos primeiros segundos do servidor de preview). No CI as duas novas tentativas configuradas absorvem; a causa não foi isolada.

## Decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-10-06 | Conteúdo no Git, não em banco | Markdown como fonte da verdade, histórico grátis, site estático |
| 2026-10-06 | Admin edita posts e produtos em formulário | Sem isso, criar uma review ainda exigiria abrir o código |
| 2026-10-06 | Template genérico com o EletroRadar inteiro como demo | Pedido do dono; o mesmo repositório serve de template e de produção |
| 2026-10-06 | better-auth com login GitHub | Pedido do dono; o token do login também assina os commits de conteúdo |
| 2026-10-06 | Postgres Neon para newsletter e sessões | Newsletter exige banco; com ele disponível, sessões revogáveis saem de graça |
| 2026-10-06 | Workflows em `workflows-disabled/` | CI não pode rodar até o billing do GitHub ser corrigido |
| 2026-10-06 | Biome v2 no lugar de ESLint e Prettier; markdownlint para a documentação | Pedido do dono |
| 2026-10-06 | Plugin de tipografia do Tailwind removido | As classes `prose` nunca estiveram ativas no site original; ativá-las mudava o visual |
| 2026-10-06 | Commit e push ao fim de cada grupo de tarefas | Pedido do dono, para não perder trabalho |
| 2026-10-06 | Commits de conteúdo com `GITHUB_TOKEN` fine-grained, não com o token OAuth do login | O escopo `repo` do OAuth daria acesso a todos os repositórios da conta; o login pede só identidade |
| 2026-10-06 | `types.ts` (2 mil linhas) e componentes sem uso não migram | Código morto no projeto Next |
| 2026-10-06 | Importação por scraping com `fetch` + `cheerio` 1.2.0, sem navegador | A origem entrega HTML estático; roda em função serverless da Vercel e da Netlify. Playwright não cabe nesse ambiente |
| 2026-10-06 | Texto do rascunho importado gerado por modelos, sem copiar a origem | O app não tem LLM; copiar o texto seria problema de direito autoral e conteúdo duplicado para SEO |
| 2026-10-07 | Capa da importação montada com `sharp` e `opentype.js`, sem API de imagem | Modelos de imagem alteram o produto e erram texto; montagem com código é grátis e igual toda vez |
| 2026-10-07 | Resumo e FAQ da importação reescritos pela Mistral (`mistral-small-latest`, plano gratuito) | Pedido do dono; a falha da API não bloqueia a importação, o rascunho cai no texto genérico |
| 2026-10-07 | Google pelo painel com conta de serviço, não com o OAuth do login | Sem tela de consentimento, sem token para renovar e sem escopo sensível no login; o acesso é dado ao e-mail da conta dentro do Search Console e do Analytics |
| 2026-10-07 | Excluir lista em uso despublica os posts em vez de recusar | Pedido do dono; o post vira rascunho sem o `<CardsTable>`, então nada fica no ar com os produtos faltando e toda referência continua apontando para uma lista que existe |
| 2026-10-07 | Saída do release candidate: `1.0.0` | Decisão do dono, com o site em produção. As "Pendências conhecidas para a 1.0.0" que seguem abertas passam a ser trabalho das próximas versões |
| 2026-10-11 | Docker só para rodar o build de produção na máquina (`vite preview` em `infra/`), sem container de banco | Pedido do dono. A produção segue na Vercel; o servidor só fala com o Neon ou com o PGlite embutido, então um Postgres em container não teria uso |
| 2026-10-11 | Scripts de setup não instalam o Bun nem encerram o processo que ocupa a porta | Um script que instala software ou mata processos de outra pessoa surpreende; agora ele diz o que fazer, usa a próxima porta livre ou para |
| 2026-10-11 | Variáveis essenciais só são exigidas no build de produção (`VERCEL_ENV=production`) | Pedido do dono, sem quebrar o clone novo, os testes e o Docker, que rodam sem nenhuma variável |
| 2026-10-06 | Importação só de hosts listados em `site.postImport` | O servidor busca uma URL digitada pelo admin (SSRF); a lista fechada limita o alcance |
| 2026-11-10 | Remover o Svelte: site e painel em Astro puro, com TypeScript | Decisão do dono; o projeto fica só com Astro e pacotes agnósticos (fase "Astro puro") |
| 2026-11-10 | Importação em lote copia só fatos (nomes, fichas, fotos de produto); texto sempre original, em sequência e com pausa | Mesmo critério do importador unitário; não sobrecarregar a origem |
| 2026-11-10 | Flags de navegador em `localStorage`; prévia de rascunho em `/preview/<slug>` no GitHub Pages | Pages não tem login, mas os rascunhos já são públicos no repositório: a prévia não expõe nada novo |
| 2026-11-13 | Releases públicas reagrupadas em 0.1.0 a 0.10.0, com os commits de cada uma linkados no changelog | O repositório ficou público. As tags antigas saem. O histórico de commits fica, para os links continuarem válidos |
| 2026-11-13 | Página do post: texto em 3/4 e sete outras postagens em 1/4 | Pedido do dono. No celular a lista fica abaixo do texto |

## Pendências do dono

- [ ] Revogar no Resend a chave que estava no `.env.example` antigo, caso seja real
- [ ] Revisar o texto novo da Política de Privacidade sobre o e-mail da newsletter
- [x] Fazer o primeiro deploy seguindo `docs/deploy.md` (Vercel, passo a passo) ou `docs/deploy.md` (OAuth App, banco Neon, token do GitHub, Resend) e marcar a lista "Conferir depois do primeiro deploy"
- [ ] Corrigir o billing do GitHub e ativar os workflows
- [ ] Rascunho importado `melhor-lava-loucas-portatil`: trocar os links `#`, enviar a capa, reescrever o texto e decidir sobre o uso das fotos (vêm do CDN da Amazon)
- [ ] Conferir na Vercel que `ADMIN_EMAILS` tem exatamente os e-mails que devem entrar e que `ADMIN_GITHUB_USERS` está vazia ou só com quem deve entrar (os valores não são lidos por agentes)
- [ ] Cadastrar `MISTRAL_API_KEY` na Vercel e fazer uma importação de teste
- [ ] Criar a conta de serviço do Google e cadastrar as quatro variáveis `GOOGLE_*` seguindo `docs/google-console-analytics-setup.md`; depois conferir `/admin/google`
