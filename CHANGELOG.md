# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [2.4.4] - 2026-11-10

- content: add imported review drafts (2/6)

## [2.4.3] - 2026-11-10

- content: add imported review drafts (1/6)

## [2.4.2] - 2026-11-10

- test: wait for the mobile menu to close before reopening it

## [2.4.1] - 2026-11-10

- docs: document batch import, post status, feature flags and the Astro-only migration plan

## [2.4.0] - 2026-11-10

### Changed

- Home: filtros de categoria numa barra lateral fixa à esquerda no desktop e posts em duas colunas; no celular e no tablet, as categorias ficam no menu.
- Busca da barra de navegação: cada resultado mostra a capa, o título e a data do post.
- Bordas menos arredondadas em todo o site, inclusive no campo de busca.

## [2.3.0] - 2026-11-10

### Added

- Feature flags: `content/flags.json` (versionado) e `/admin/flags` (página estática, vale para o GitHub Pages), com override por navegador.
- Prévia dos rascunhos em `/preview/<slug>`, com `noindex`, `Disallow` no `robots.txt` e fora do sitemap, do `llms.txt`, da API e do dashboard de links.
- Flag `allStoreButtons`: os cartões mostram os botões de Mercado Livre, Shopee e Amazon mesmo sem link real.

## [2.2.0] - 2026-11-10

### Added

- `docs/post-status.md`, gerado por `bun run post-status`: cada post com draft, produtos, links de afiliado reais e pendentes (`#`). Um teste falha quando o arquivo fica desatualizado.
- Coluna "Links" e filtro "Links de afiliado" em `/admin/posts`.

## [2.1.0] - 2026-11-10

### Added

- Importação em lote dos posts que faltam (`bun webscrapping/batch.ts [--write] [--limit N]`): compara os sitemaps da origem com o `ref` dos posts e importa como rascunho, em sequência e com pausa, sem copiar texto.
- Categorias Banheiro, Cama, Mesa e Banho, Iluminação, Infantil e Jardim.

### Fixed

- O importador lia, em algumas páginas, a ficha técnica do produto seguinte junto com a do próprio produto.

## [2.0.2] - 2026-11-09

### Added

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` e `SECURITY.md` na raiz do repositório.

### Changed

- O README segue o formato de referência do workspace.
- O pacote passa a se chamar `astro-blog-cms` (antes `sveltekit-blog-cms`).

## [2.0.1] - 2026-11-07

### Fixed

- A URL canônica e o sitemap usam a barra final, que é o endereço em que o GitHub Pages responde 200.
- As leituras públicas da API são publicadas como `index.json`, servidas com `Content-Type: application/json` em `/api/v1/.../`.
- A documentação de operação descreve Astro 7.4 no GitHub Pages.
- Os testes e2e conferem o site estático: 404 no lugar do redirecionamento para a home, tela de login no painel e a API em JSON.

## [2.0.0] - 2026-11-06

### Changed

- O site público passa a ser um build estático do Astro 7.4, com as mesmas páginas, o mesmo conteúdo e as ilhas Svelte 5. SvelteKit e o adaptador da Vercel saíram do projeto. A branch `legacy-sveltekit` guarda o código anterior.
- A produção de `eletroradar` passa a ser o GitHub Pages (`.github/workflows/pages.yml`). O Pages não executa painel, API de escrita, login, contato, newsletter nem cron; esse código continua coberto pelos testes.
- O corpo dos posts é renderizado com `marked`. `<CardsTable>` continua uma ilha Svelte.
- Uma URL desconhecida responde 404.

### Removed

- `@sveltejs/kit`, `@sveltejs/adapter-vercel`, `@sveltejs/vite-plugin-svelte`, `mdsvex` e `vercel.json`.

## [1.6.1] - 2026-10-11

### Changed

- Skills `project-new-post` e `project-new-product-list` descrevem as regras atuais dos links de afiliado: o JSON guarda o endereço real da loja, o botão passa pelo dashboard de links, `#`, vazio e `null` não são link, e o `id` do produto (com o slug do post) é a identidade no dashboard, então mudá-lo apaga os cliques e repeti-lo no mesmo post falha o build.
- Commit `content:` feito em uma sessão de trabalho é uma release; a skill `project-new-post` dizia que não era. Só os commits do painel em produção ficam sem versão.
- `.claude/rules/` sem repetição: `content.md` e `testing.md` apontam para `docs/content.md` e `docs/testing.md`, `git-and-releases.md` cita os hooks `pre-commit` e `pre-push` e deixa a regra de versão na skill `project-release`.
- graphify passou a ser opcional de fato: o `AGENTS.md` diz como gerar e atualizar o grafo (`python -m graphify update .`) e a skill saiu da carga obrigatória do início de sessão.
- `docs/content.md`: `mercadolivreUrl: "#"` mantém o botão do Mercado Livre apontando para a oferta padrão, e o `id` é único também dentro do post.

### Removed

- `.claude/settings.json`: os hooks rodavam `python -m graphify hook-guard` a cada chamada de Bash, Grep, Read e Glob, falhavam em máquina sem Python e, com o grafo presente, repetiam o mesmo aviso em toda chamada.
- `.claude/CLAUDE.md` e a seção "graphify" do `CLAUDE.md`, que afirmavam a existência de um grafo que o repositório não versiona.

## [1.6.0] - 2026-10-11

### Added

- Conferência das variáveis de ambiente no começo de todo build (`scripts/check-env.ts`, regras em `src/lib/env-check.ts`, com zod). Variável presente com formato errado falha o build; no build de produção (`VERCEL_ENV=production`) também falham a ausência de `LINKS_DASHBOARD_TOKEN`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_TOKEN`, `GITHUB_REPO` ou `CRON_SECRET`, a falta de um par de login completo e a falta de uma lista de admins. A mensagem traz uma linha por variável, sem valores. Build local, Docker e testes seguem sem exigir nenhuma variável.
- `bun run check-env`, para conferir as variáveis sem fazer o build.
- Testes do login social: e-mail permitido mas não verificado é recusado no fluxo completo do Google e do GitHub.

## [1.5.2] - 2026-10-11

- docs: rewrite the README for the site as it runs today

## [1.5.1] - 2026-10-11

### Added

- `docs/agent-setup.md`: roteiro para um agente preparar o projeto do zero, com comando e verificação por passo (dependências, `.env`, banco, execução local, Docker, testes, conteúdo, GitHub e release, Vercel, dashboard de links). `docs/tooling.md` e `docs/workflows.md` descrevem as ferramentas e a ordem de trabalho.
- `infra/`: `Dockerfile` (`oven/bun` com tag fixa e Node 24) e `docker-compose.yml` que buildam e servem o build de produção em `http://localhost:8080`, com `.dockerignore` na raiz. O build da imagem só valida os links de afiliado, sem enviar nada ao dashboard.
- `setups/setup-unix-with-docker.sh` e `setups/setup-windows-with-docker.sh`: conferem o Docker, preparam o `.env`, buildam a imagem e sobem o container.

### Changed

- `setups/setup-unix.sh` e `setups/setup-windows.sh` passam a se chamar `setup-unix-local.sh` e `setup-windows-local.sh`.
- Os scripts de setup não instalam mais o Bun nem encerram o processo que ocupa a porta: dizem como instalar o que falta, usam a próxima porta livre (ou param, se a porta foi pedida com `PORT=`) e aceitam `SETUP_NO_START=1` além de `--no-start`. Os segredos gerados não dependem mais do Node.

### Fixed

- `.env.example`: um comentário quebrado em duas linhas deixava uma linha sem `#`, e o Docker Compose recusava o `.env` criado a partir dele.

## [1.5.0] - 2026-10-11

### Added

- Os botões de loja caem para o endereço direto da loja quando o dashboard de links não responde (consulta a `/health` ao abrir a página).

### Changed

- O build se identifica no dashboard de links pelo endereço do site e usa a chave única do dashboard; o projeto é criado lá no primeiro build. `LINKS_DASHBOARD_TOKEN` passa a ser essa chave.
- Hooks do git: `pre-commit` roda a checagem de tipos e `pre-push` roda tipos, lint e testes.

## [1.4.0] - 2026-10-11

### Added

- Painel: botões "Exportar links (JSON)" e "Exportar links (CSV)" baixam todos os links de afiliado dos posts publicados no formato de importação do dashboard de links (`GET /api/v1/affiliate-links`).

## [1.3.0] - 2026-10-11

### Added

- Dashboard de links: todo build registra os links de afiliado dos posts publicados no dashboard definido em `site.linksDashboardUrl` (`scripts/sync-links.ts`, variável `LINKS_DASHBOARD_TOKEN`). O build de produção falha se o registro falhar, então nenhuma página vai ao ar com link fora do dashboard. Ver `docs/affiliate-links.md`.

### Changed

- Os botões de loja, a foto e o nome do produto apontam para o redirect do dashboard de links, não mais direto para a loja.
- A oferta padrão (`site.fallbackAffiliateUrl`) também passa pelo dashboard.

### Fixed

- Loja com link `#` não gera mais botão com `href="#"`; a foto e o nome de um produto sem link real apontam para a oferta padrão em vez de `#`.

## [1.2.0] - 2026-10-07

### Added

- Editor de post e editor de lista de produtos: a capa e a foto de cada produto aparecem renderizadas abaixo do campo do endereço. Uma imagem recém-enviada é mostrada na hora, a partir do arquivo escolhido; se o endereço não carregar, o campo avisa.

## [1.1.0] - 2026-10-07

### Added

- `/admin/posts`: miniatura da capa de cada post e, na coluna "Produtos", um botão por lista que abre o editor da lista em outra aba.
- `/admin/products`: cada lista mostra as fotos dos seus produtos.

## [1.0.6] - 2026-10-07

### Fixed

- Home e rodapé: uma categoria sem nenhum post publicado (só rascunhos, só agendados ou nenhum post) não aparece mais no filtro nem na lista de categorias do rodapé. Ela volta sozinha quando o primeiro post da categoria é publicado.

## [1.0.5] - 2026-10-07

### Fixed

- Home: com a oitava categoria, a faixa de filtros passava da largura do conteúdo no desktop. Os botões ficaram um pouco menores e ocupam a linha inteira, alinhados às bordas dos cartões; quando não cabem (telas menores ou mais categorias), a faixa rola para o lado em vez de vazar.

## [1.0.4] - 2026-10-07

- style: build the closing script tag without string concatenation

## [1.0.3] - 2026-10-07

### Fixed

- Gravação pelo painel: um erro 5xx do GitHub é tentado de novo duas vezes; se persistir, a API responde 502 (`content_store_failed`) e a tela explica que a falha é do GitHub, em vez de "erro inesperado".

## [1.0.2] - 2026-10-07

### Fixed

- Importação (`/admin/import`): quando a conta da Mistral não tem cota para o `mistral-small-latest` (resposta 429 ou 403), a reescrita do resumo e do FAQ passa para o `ministral-8b-latest` em vez de cair no texto genérico.

## [1.0.1] - 2026-10-07

### Fixed

- Importação (`/admin/import`): fotos de produto hospedadas no servidor de imagens do Mercado Livre (`http2.mlstatic.com`) eram recusadas com "não está em um endereço permitido".

## [1.0.0] - 2026-10-07

### Changed

- Primeira versão estável: o projeto sai do release candidate. A partir daqui vale o SemVer comum (`feat` sobe a minor, `fix` e os demais tipos sobem a patch).

## [1.0.0-rc.27] - 2026-10-07

### Added

- `robots.txt`: sinal de uso do conteúdo (`Content-Signal: search=yes, ai-input=yes, ai-train=no`) e bloqueio dos robôs de coleta em massa e de treino de IA listados em `site.blockedCrawlers`. Buscadores e assistentes que abrem a página para responder a alguém continuam liberados. A mesma regra está escrita no `llms.txt` e nos Termos de Uso (`site.contentPolicy`).

## [1.0.0-rc.26] - 2026-10-07

### Added

- `/admin/products` mostra em quais posts cada lista é usada, com filtro "Em uso" e "Sem uso"; `/admin/posts` ganhou a coluna "Produtos", com link para cada lista do post; o editor da lista mostra os posts que a usam.

### Changed

- Excluir uma lista de produtos não é mais recusado quando um post a usa: os posts que mostram a lista perdem o `<CardsTable>` dela e viram rascunho, e a confirmação avisa quais são.

## [1.0.0-rc.25] - 2026-10-07

### Added

- `/admin/media`: o botão "Copiar link" copia o endereço completo da imagem no servidor em uso (por exemplo `https://example.com/images/posts/foto.jpg`) com o clipboard.js e abre um aviso "Link copiado".

## [1.0.0-rc.24] - 2026-10-07

### Added

- Tela `/admin/google`: cliques, impressões, CTR e posição do Google Search Console, usuários, sessões e visualizações do Google Analytics 4 (últimos 28 dias), a lista de sitemaps e o botão "Reenviar sitemap ao Google" (`POST /api/v1/google/sitemap`). A configuração da conta de serviço está em `docs/google-console-analytics-setup.md`.

## [1.0.0-rc.23] - 2026-10-07

### Added

- Categoria "Cuidados Pessoais" (`cuidados-pessoais`).

### Fixed

- Importação (`/admin/import`): reviews da seção `cuidados-pessoais` da origem eram recusadas porque o site não tinha a categoria.
- Teste de integração da importação no Windows: a capa era aberta pelo caminho e ficava travada na limpeza.

## [1.0.0-rc.22] - 2026-10-07

### Added

- Botão "Excluir lista" no editor de produtos e `DELETE /api/v1/products/{list}`: apaga a lista inteira de uma vez. A exclusão é recusada enquanto algum post mostra a lista com `<CardsTable>`, porque o build quebraria.

## [1.0.0-rc.21] - 2026-10-07

### Changed

- Painel `/admin` no celular: a navegação fica atrás de um menu hambúrguer, em vez de ocupar meia tela no topo.

## [1.0.0-rc.20] - 2026-10-07

### Fixed

- Build na Vercel: o `opentype.js` (capa da importação) passou a ser importado pelo export padrão, porque o Node carrega a versão CommonJS do pacote, que não tem exports nomeados.

## [1.0.0-rc.19] - 2026-10-07

### Changed

- Capa gerada na importação: os produtos aparecem recortados, sem o fundo branco das fotos e sem os cartões brancos, ocupando mais espaço.

## [1.0.0-rc.18] - 2026-10-07

### Added

- Importação (`/admin/import`): o rascunho já sai com capa, montada com 3 fotos dos produtos sobre um fundo de cor clara aleatória e o endereço do site em negrito no canto inferior direito.

## [1.0.0-rc.17] - 2026-10-07

### Added

- Importação (`/admin/import`): o resumo e o FAQ da página de origem são reescritos pela API da Mistral (`MISTRAL_API_KEY`) e viram a descrição, a introdução e o FAQ do rascunho. Sem a chave, ou com falha da API, o rascunho fica com o texto genérico e a tela mostra o motivo.

## [1.0.0-rc.16] - 2026-10-07

- docs: record the production deploy on Vercel in the plan

## [1.0.0-rc.15] - 2026-10-07

- test: keep the e2e server away from the services of a local .env

## [1.0.0-rc.14] - 2026-10-07

### Added

- Botão de tema claro/escuro no cabeçalho do painel, com a mesma preferência do site público.

## [1.0.0-rc.13] - 2026-10-07

### Fixed

- Salvar, enviar imagem ou importar em um deploy sem `GITHUB_TOKEN` respondia erro 500 genérico. Agora responde 503 `content_store_unavailable` e o painel diz quais variáveis faltam.

## [1.0.0-rc.12] - 2026-10-07

### Added

- Login do painel pelo Google, ao lado do GitHub. `ADMIN_EMAILS` lista os e-mails permitidos; só vale e-mail verificado pelo provedor.

## [1.0.0-rc.11] - 2026-10-06

### Changed

- Todo commit passa a ser uma release: versão no `package.json`, seção no `CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release. Commits `content:` feitos pelo painel ficam de fora. O processo está em `docs/ci-cd.md`.
- `scripts/release.ts` calcula a versão pela mensagem do commit (`--message`), conta `rc.N` enquanto a versão é um release candidate e devolve as notas de uma versão (`--section`).
- Releases retroativas criadas para os 30 commits anteriores, de `v0.1.0` a `v1.0.0-rc.10`.

## [1.0.0-rc.10] - 2026-10-06

### Fixed

- Login pelo GitHub recusava todo mundo com `unable_to_create_user`: o `better-auth` descartava o login do perfil antes da conferência da lista de administradores.

## [1.0.0-rc.9] - 2026-10-06

### Changed

- Cards de produto: o valor de cada especificação fica alinhado à direita e o rótulo não tem mais largura fixa, então rótulos longos não invadem o valor.

## [1.0.0-rc.8] - 2026-10-06

### Changed

- `.gitignore` ignora os arquivos de skills que a integração do Neon na Vercel CLI grava no projeto.

## [1.0.0-rc.7] - 2026-10-06

### Added

- Cron da Vercel em `vercel.json`: a fila da newsletter roda a cada 15 minutos (exige plano Pro e `CRON_SECRET`).

## [1.0.0-rc.6] - 2026-10-06

### Changed

- Página inexistente redireciona para a home (302) em vez de mostrar a tela de 404. Arquivos (endereços com extensão) e a API continuam respondendo 404.

## [1.0.0-rc.5] - 2026-10-06

### Added

- `.vercelignore`: `vercel deploy` a partir da pasta de trabalho não envia mais `.env`, `.data` nem pastas geradas.

### Changed

- Adaptador trocado de `@sveltejs/adapter-auto` para `@sveltejs/adapter-vercel` 7.0.0, usado só no build da Vercel. Publicar na Netlify passa a exigir a troca do adaptador.
- `engines.node` fixado em `24.x` (era `>=22.17`); os scripts de setup exigem Node 24.

### Fixed

- Segundo build na Vercel falhava com `ERR_PACKAGE_PATH_NOT_EXPORTED` em `estree-walker`: o `adapter-auto` instalava o adaptador durante o build, por cima do cache.

## [1.0.0-rc.4] - 2026-10-06

### Added

- Scripts `setups/setup-unix.sh` e `setups/setup-windows.sh`: conferem Node e Bun, instalam as dependências, criam o `.env` com os padrões do painel, liberam a porta e sobem o servidor de desenvolvimento.
- `docs/setup-vercel.md`: passo a passo do deploy na Vercel, com conferência e problemas comuns.

## [1.0.0-rc.3] - 2026-10-06

### Fixed

- `vercel.json` tinha um bloco de cabeçalhos aninhado fora do schema, que faria a Vercel recusar o deploy.

## [1.0.0-rc.2] - 2026-10-06

### Changed

- Documentação: achados do Lighthouse corrigidos e execução dos testes e2e em contêiner registrada.

## [1.0.0-rc.1] - 2026-10-06

### Added

- Base da fase BETA, ainda sem interface: schema e migração do banco (Drizzle, Neon ou PGlite), autenticação com better-auth e GitHub restrita a `ADMIN_GITHUB_USERS`, e proteção das rotas `/admin`.
- Camada de escrita de conteúdo: `ContentStore` com commits pela API do GitHub ou gravação em disco, com detecção de conflito de versão.
- Serviço de CMS para posts, listas de produtos e imagens, com validação que impede um post de quebrar o build.
- Página `/admin/login` com entrada pelo GitHub e aviso das variáveis de ambiente que faltam; layout do painel com navegação e botão "Sair".
- Login de testes (`POST /api/test/login`), ativo só com `AUTH_TEST_LOGIN_TOKEN` e nunca em produção.
- API REST `/api/v1`: leitura pública de posts (paginação, categoria e busca), categorias e listas de produtos; escrita de posts, listas e imagens com sessão de admin; `openapi.json` e `docs/api.md`.
- Formato único de erro, CORS de leitura e limite de 60 escritas por minuto por endereço na API.
- Painel `/admin`: totais e últimas alterações, lista de posts com busca e filtros, editor de post (frontmatter, Markdown com pré-visualização, FAQ, capa, lista de produtos), editor de produtos em formulário e biblioteca de mídia com upload.
- Indicador de status do deploy no painel, comparando o conteúdo salvo com o que está no ar.
- Posts e listas que apontam para uma imagem local inexistente são recusados, porque quebrariam o build.
- Newsletter: inscrição pelo rodapé com confirmação por e-mail, descadastro pelo link de cada e-mail, opção "avisar assinantes" no editor do post e tela `/admin/newsletter` com assinantes, envios e nova tentativa.
- Envio de avisos só depois de o post estar no ar, em lotes pelo Resend, sem repetir e-mail para quem já recebeu; execução pelo painel ou por agendador com `CRON_SECRET`.
- Templates react-email de confirmação de inscrição e de post novo.
- Capas servidas em três larguras (480, 768 e 1280 px) com `srcset`: o build gera as cópias em WebP, qualquer que seja o tamanho do arquivo enviado. Na home, o LCP medido caiu de 8,4 s para 3,3 s.
- Cache de uma semana para `/images/` nas configurações de Vercel e Netlify.
- Workflows do GitHub Actions para CI (lint, tipos, testes, build, e2e) e release, escritos em `.github/workflows-disabled/` e ainda inativos; `scripts/release.ts` calcula a versão pelos Conventional Commits e corta o changelog.
- Importação de posts por web scraping: tela `/admin/import`, endpoint `POST /api/v1/imports` e pasta `webscrapping/` (cheerio 1.2.0). Cria um rascunho com os 7 primeiros produtos de uma review de um site permitido, com links de afiliado e capa para preencher; relatório em `docs/webscrapping-modelation.md`.
- Testes de integração do banco, da autenticação e da API, e testes e2e do acesso ao painel e da publicação de uma review pelo navegador.

### Changed

- Verde e cinza do tema claro um tom mais escuros no logotipo, nos botões e nos títulos do rodapé, para atender ao contraste AA.
- Produto ainda sem foto (imagem `#`) não mostra mais uma imagem quebrada.
- A Política de Privacidade passa a dizer que o e-mail é guardado para quem se inscreve na newsletter.
- Páginas do painel não carregam os scripts de analytics.

### Security

- O corpo do post recusa chaves codificadas (`&#123;`, `&lbrace;`, `%7B`), que o mdsvex transformava em código executado no build e no navegador do visitante.
- O corpo do post recusa endereços `javascript:`, `vbscript:` e `data:`, o atributo `style` e as tags `base`, `meta`, `link`, `form`, `button`, `input`, `svg` e `math`; capa, imagem de produto e links de loja aceitam só `/images/...` e `https://`.
- Cabeçalhos de segurança em toda resposta do servidor (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) e, pelas configurações de Vercel e Netlify, nas páginas estáticas.
- Newsletter: confirmação por botão em vez de ao abrir o link, uma confirmação por endereço a cada 24 horas, teto de 60 por hora e páginas com token sem scripts de analytics.
- Login de testes só existe com o banco local; limite de requisições vale para todo `POST` de `/api`; `CRON_SECRET` exige 32 caracteres.
- Commits de conteúdo usam o e-mail `noreply` do GitHub em vez do e-mail privado do admin; e-mails de assinantes saem do log.
- Relatório da revisão de segurança em `docs/security.md`.

### Fixed

- O banco local (PGlite) não iniciava em um clone novo porque a pasta `.data/` não existia.
- Na home, pular direto para o fim da página (tecla End ou rolagem rápida no celular) não carregava mais posts.

## [0.1.0] - 2026-10-06

Primeira versão em SvelteKit: o site público do EletroRadar reescrito a partir do projeto Next.js, com o mesmo visual e as mesmas URLs.

### Added

- Projeto SvelteKit 3 com Svelte 5, Vite 8, Tailwind CSS 4 e mdsvex, com todas as dependências em versão exata.
- Conteúdo em arquivos: 64 posts em `content/posts/*.mdx` e 69 listas de produtos em `content/products/*.json`, validados por schemas zod no build.
- Componente `<CardsTable list="..." />` para exibir produtos com botões de Mercado Livre, Shopee e Amazon.
- Site público pré-renderizado: home com filtro por categoria e carregamento incremental, página de post, Sobre, Contato, Política de Privacidade, Termos de Uso e página de erro.
- Busca de posts no cabeçalho, tema claro e escuro, menu lateral no celular, banner de cookies e barra de progresso de leitura.
- Formulário de contato com envio pelo Resend e template react-email (`POST /api/v1/contact`).
- SEO: metatags, Open Graph, Twitter Card, URL canônica e JSON-LD (`BlogPosting`, `FAQPage`, `WebSite`, `Organization`, `ItemList`) no HTML do servidor.
- `sitemap.xml`, `robots.txt` e `llms.txt` gerados a partir do conteúdo, sem `/admin` nem `/api`.
- Cabeçalho `X-Robots-Tag: noindex` em `/admin` e `/api`.
- Identidade do site concentrada em `src/lib/site.config.ts`, para uso do projeto como template.
- Testes unitários e de integração (Vitest) e testes smoke e e2e (Playwright, desktop e celular).
- Biome v2 e markdownlint para formatação e lint; Husky e commitlint para Conventional Commits.
- `PLAN.md`, `AGENTS.md`, `CLAUDE.md`, regras em `.claude/rules/`, skills em `.claude/skills/` e documentação de onboarding em `docs/`.

### Changed

- Rodapé redesenhado em colunas: marca e descrição, categorias, links institucionais e legais, aviso de afiliados e direitos autorais.
- Os dados estruturados (JSON-LD) passam a vir no HTML em vez de serem injetados por JavaScript.
- Os cartões de produto são renderizados no servidor; a ordem continua sendo embaralhada no navegador.
- Links de afiliado recebem `rel="sponsored"`.
- Fontes Inter e Russo One servidas pelo próprio site, sem requisição ao Google Fonts.

### Removed

- Código sem uso do projeto Next.js: tipos de produtos de outras categorias, componentes de anúncio, gráfico e modal de posts recentes.
- Mapa de redirects antigos, que nunca chegou a funcionar e apontava para slugs de outro site.

### Security

- Arquivos `.env` deixam de ser versionados; `.env.example` contém apenas placeholders.

[Unreleased]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.4.4...HEAD
[2.4.4]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.4.3...v2.4.4
[2.4.3]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.6.1...v2.0.0
[1.6.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.6...v1.1.0
[1.0.6]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.27...v1.0.0
[1.0.0-rc.27]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.26...v1.0.0-rc.27
[1.0.0-rc.26]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.25...v1.0.0-rc.26
[1.0.0-rc.25]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.24...v1.0.0-rc.25
[1.0.0-rc.24]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.23...v1.0.0-rc.24
[1.0.0-rc.23]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.22...v1.0.0-rc.23
[1.0.0-rc.22]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.21...v1.0.0-rc.22
[1.0.0-rc.21]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.20...v1.0.0-rc.21
[1.0.0-rc.20]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.19...v1.0.0-rc.20
[1.0.0-rc.19]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.18...v1.0.0-rc.19
[1.0.0-rc.18]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.17...v1.0.0-rc.18
[1.0.0-rc.17]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.16...v1.0.0-rc.17
[1.0.0-rc.16]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.15...v1.0.0-rc.16
[1.0.0-rc.15]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.14...v1.0.0-rc.15
[1.0.0-rc.14]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.13...v1.0.0-rc.14
[1.0.0-rc.13]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.12...v1.0.0-rc.13
[1.0.0-rc.12]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.11...v1.0.0-rc.12
[1.0.0-rc.11]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.10...v1.0.0-rc.11
[1.0.0-rc.10]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.9...v1.0.0-rc.10
[1.0.0-rc.9]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.8...v1.0.0-rc.9
[1.0.0-rc.8]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.7...v1.0.0-rc.8
[1.0.0-rc.7]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.6...v1.0.0-rc.7
[1.0.0-rc.6]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.5...v1.0.0-rc.6
[1.0.0-rc.5]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.4...v1.0.0-rc.5
[1.0.0-rc.4]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.3...v1.0.0-rc.4
[1.0.0-rc.3]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.2...v1.0.0-rc.3
[1.0.0-rc.2]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v1.0.0-rc.1...v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/AlexGalhardo/eletroradar-cms/compare/v0.1.0...v1.0.0-rc.1
[0.1.0]: https://github.com/AlexGalhardo/eletroradar-cms/releases/tag/v0.1.0
