# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

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

- `/admin/media`: o botão "Copiar link" copia o endereço completo da imagem no servidor em uso (por exemplo `https://eletroradar.com.br/images/posts/foto.jpg`) com o clipboard.js e abre um aviso "Link copiado".

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

[Unreleased]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.6...HEAD
[1.0.6]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.27...v1.0.0
[1.0.0-rc.27]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.26...v1.0.0-rc.27
[1.0.0-rc.26]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.25...v1.0.0-rc.26
[1.0.0-rc.25]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.24...v1.0.0-rc.25
[1.0.0-rc.24]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.23...v1.0.0-rc.24
[1.0.0-rc.23]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.22...v1.0.0-rc.23
[1.0.0-rc.22]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.21...v1.0.0-rc.22
[1.0.0-rc.21]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.20...v1.0.0-rc.21
[1.0.0-rc.20]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.19...v1.0.0-rc.20
[1.0.0-rc.19]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.18...v1.0.0-rc.19
[1.0.0-rc.18]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.17...v1.0.0-rc.18
[1.0.0-rc.17]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.16...v1.0.0-rc.17
[1.0.0-rc.16]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.15...v1.0.0-rc.16
[1.0.0-rc.15]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.14...v1.0.0-rc.15
[1.0.0-rc.14]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.13...v1.0.0-rc.14
[1.0.0-rc.13]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.12...v1.0.0-rc.13
[1.0.0-rc.12]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.11...v1.0.0-rc.12
[1.0.0-rc.11]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.10...v1.0.0-rc.11
[1.0.0-rc.10]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.9...v1.0.0-rc.10
[1.0.0-rc.9]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.8...v1.0.0-rc.9
[1.0.0-rc.8]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.7...v1.0.0-rc.8
[1.0.0-rc.7]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.6...v1.0.0-rc.7
[1.0.0-rc.6]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.5...v1.0.0-rc.6
[1.0.0-rc.5]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.4...v1.0.0-rc.5
[1.0.0-rc.4]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.3...v1.0.0-rc.4
[1.0.0-rc.3]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.2...v1.0.0-rc.3
[1.0.0-rc.2]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v1.0.0-rc.1...v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/compare/v0.1.0...v1.0.0-rc.1
[0.1.0]: https://github.com/AlexGalhardo/eletroradar.com.br-cms/releases/tag/v0.1.0
