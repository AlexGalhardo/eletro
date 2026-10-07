# PLAN.md — SvelteKit Blog CMS

Planejamento vivo do projeto. Toda sessão de trabalho começa lendo este arquivo e termina atualizando os checklists.

- `[ ]` pendente · `[~]` em andamento · `[x]` entregue e verificado
- Um item só vira `[x]` quando o **assert** do grupo foi verificado de verdade (comando rodado, teste verde), nunca por suposição.
- Decisões novas entram em [Decisões](#decisões) com data.

## Intenção confirmada (2026-10-06)

| Item | Definição |
|---|---|
| Resultado | Template open source de CMS de blog em SvelteKit, com posts em Markdown (mdsvex) e o EletroRadar completo como demo real e site de produção |
| Usuário | O dono do site, publicando reviews pelo `/admin` sem abrir o código; e quem clonar o template, trocando a configuração e o conteúdo |
| Sucesso | Mesmo visual e mesmas URLs do site atual, rodapé mais profissional, uma review nova criada do zero pelo navegador, testes verdes |
| Restrições | Vercel ou Netlify; dependências na última versão estável com versão exata; tab de largura 4; SemVer, Keep a Changelog, Conventional Commits |
| Fora de escopo | Múltiplos papéis de usuário, comentários, multi-idioma, redesenho além do rodapé, ativar o CI, fazer deploy |

## Arquitetura

| Assunto | Decisão |
|---|---|
| Framework | SvelteKit 3 + Svelte 5 (runes) + Vite 8, `adapter-vercel` (Vercel) |
| Conteúdo | Arquivos no repositório: `content/posts/*.mdx` (mdsvex) e `content/products/*.json`. Site público pré-renderizado no build |
| Escrita pelo admin | Commit via API do GitHub com `GITHUB_TOKEN` (token fine-grained restrito a um repositório), assinado com o nome de quem logou; o deploy publica em 1 a 2 min. Em dev e testes, grava no disco local |
| Autenticação | better-auth com login GitHub, restrito à lista `ADMIN_GITHUB_USERS`; sessões no Postgres |
| Banco | Postgres Neon + Drizzle ORM (auth e newsletter). PGlite em dev e testes, sem Docker |
| Newsletter | Double opt-in, descadastro em um clique, e-mails com react-email enviados pelo Resend. Disparo fica pendente até a URL do post responder 200 |
| API REST | `/api/v1`: leitura pública de posts, categorias e produtos; escrita exige sessão de admin |
| Estilo | Tailwind CSS 4, mesmas classes do site atual; identidade concentrada em `src/lib/site.config.ts` |
| Qualidade | Vitest (unitário e integração), Playwright (smoke e e2e), svelte-check, Biome v2, markdownlint |
| Releases | Todo commit é uma release: versão, seção no `CHANGELOG.md` (Keep a Changelog), tag e GitHub Release. `scripts/release.ts` calcula a versão pela mensagem do commit. Commits `content:` do painel ficam de fora |
| CI/CD | Workflows escritos em `.github/workflows-disabled/` (inativos até o billing do GitHub ser corrigido) |

---

## Fase ALPHA — fundação e site público (0.1.0)

Objetivo: o site atual rodando em SvelteKit, idêntico para o visitante.

### A1. Repositório e governança

- [x] Git novo com `origin` em `sveltekit-blog-cms-claude-code` (histórico antigo em backup fora do projeto)
- [x] Skills instaladas em `.claude/skills/` (agent-skills, karpathy-guidelines, ponytail, graphify)
- [x] `CLAUDE.md` e `AGENTS.md` com carga obrigatória das skills no início da sessão e links para `docs/`
- [x] `.claude/rules/` (código, commits, testes, conteúdo, dependências)
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
- [ ] Capa gerada ou escolhida na importação (hoje fica vazia)
- [ ] Parser para outros sites de origem
- [ ] Limpeza das fotos órfãs quando a importação falha no meio

**Assert:** integração — importar a página sintética grava 7 fotos, a lista e o post como rascunho, sem nenhum trecho do texto da origem, e recusa host fora da lista sem fazer requisição; execução real contra um post da origem cria um rascunho que passa em `bun run test` e não aparece no build. (Verificado em 2026-10-06: `webscrapping/webscrapping.test.ts`, `tests/integration/import.test.ts` e `tests/e2e/import.spec.ts` verdes; importação real em 3,1 s com o store local; `bun run build` com o rascunho fora de `sitemap.xml` e da API.)

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
- [ ] CSP: exige tirar os scripts embutidos de `app.html` e `+layout.svelte` e testar o analytics em um deploy real
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
- [ ] Convenção dos links `#`; uso das fotos do CDN da Amazon
- [ ] Ativar os workflows de CI e release (billing do GitHub)
- [ ] Revisar o texto da Política de Privacidade sobre a newsletter

Técnicas, sem bloqueio externo:

- [ ] Limite de requisições em armazenamento compartilhado (hoje em memória, por instância)
- [ ] Registro de eventos de segurança (login, recusa, 401, 429)
- [ ] Token próprio e com validade para o descadastro da newsletter
- [ ] Busca e paginação em `/admin/newsletter`; exclusão de lista de produtos e de imagem
- [ ] Causa da navegação que às vezes não completa nos testes e2e sob carga

---

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
| 2026-10-07 | Resumo e FAQ da importação reescritos pela Mistral (`mistral-small-latest`, plano gratuito) | Pedido do dono; a falha da API não bloqueia a importação, o rascunho cai no texto genérico |
| 2026-10-06 | Importação só de hosts listados em `site.postImport` | O servidor busca uma URL digitada pelo admin (SSRF); a lista fechada limita o alcance |

## Pendências do dono

- [ ] Revogar no Resend a chave que estava no `.env.example` antigo, caso seja real
- [ ] Revisar o texto novo da Política de Privacidade sobre o e-mail da newsletter
- [x] Fazer o primeiro deploy seguindo `docs/setup-vercel.md` (Vercel, passo a passo) ou `docs/deploy.md` (OAuth App, banco Neon, token do GitHub, Resend) e marcar a lista "Conferir depois do primeiro deploy"
- [ ] Corrigir o billing do GitHub e ativar os workflows
- [ ] Rascunho importado `melhor-lava-loucas-portatil`: trocar os links `#`, enviar a capa, reescrever o texto e decidir sobre o uso das fotos (vêm do CDN da Amazon)
- [ ] Cadastrar `MISTRAL_API_KEY` na Vercel e fazer uma importação de teste
