# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- Scripts `setups/setup-unix.sh` e `setups/setup-windows.sh`: conferem Node e Bun, instalam as dependências, criam o `.env` com os padrões do painel, liberam a porta e sobem o servidor de desenvolvimento.
- `docs/setup-vercel.md`: passo a passo do deploy na Vercel, com conferência e problemas comuns.

### Fixed

- `vercel.json` tinha um bloco de cabeçalhos aninhado fora do schema, que faria a Vercel recusar o deploy.

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

[Unreleased]: https://github.com/AlexGalhardo/sveltekit-blog-cms-claude-code/compare/v1.0.0-rc.1...HEAD
[1.0.0-rc.1]: https://github.com/AlexGalhardo/sveltekit-blog-cms-claude-code/compare/v0.1.0...v1.0.0-rc.1
[0.1.0]: https://github.com/AlexGalhardo/sveltekit-blog-cms-claude-code/releases/tag/v0.1.0
