# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/). As releases públicas recomeçaram em 0.1.0. Cada uma lista os commits que a compõem.

## [Unreleased]

### Added

- `/admin/login` (`noindex`, sem sidebar) com o campo `Password`; todas as rotas `/admin/*` redirecionam para `/admin/login?next=<rota>` quando não há sessão, por um script no `<head>` do layout. A sessão dura 4 horas: o token fica cifrado com uma chave AES-GCM não extraível no IndexedDB, e o `sessionStorage` guarda só `{ iv, ciphertext, expires }`; o botão "Sair" da sidebar apaga os dois. As páginas do admin ganham uma CSP por meta (`default-src 'self'`, `connect-src` só para o próprio site e `api.github.com`, scripts inline por hash no build). `next` só aceita caminhos `/admin/...`.
- Reviews: a coluna lateral de outras postagens vira uma lista com miniatura, categoria, "Há N dias" (atualizado no navegador) e título.
- Redesign "papel de jornal": tokens shadcn (`--background`, `--primary`, `--radius` de 4px...) em `src/app.css`, acento neutro (preto no claro, branco no escuro), tema escuro em grafite quente que segue o sistema e pode ser alternado. `docs/design-system.md` documenta tokens, contraste, componentes e como adicionar shadcn.
- `OfferButton`, o único botão de oferta do site, na cor de cada marketplace (Mercado Livre, Amazon e Shopee; demais em preto e branco) com sombra inferior sólida e efeito de afundar ao clicar; texto "Ver oferta no/na (loja)" com nome e artigo em `site.stores`.
- Evento GA4 `affiliate_click` (`product_id`, `post_slug`, `store`) em todo link de afiliado.
- `/admin` com sidebar recolhível (Produtos e links, Posts, Métricas, Flags, Newsletter) em ilhas React com shadcn/ui (`@astrojs/react`, `radix-ui`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`). Métricas explica por que o ranking não é lido no navegador e linka o GA4; Newsletter é um placeholder para o vukem-email.
- Ícone de radar monocromático, sem fundo, com arcos e raio (`static/icon.svg`), PNGs 180/192/512 (`bun scripts/make-icons.ts`) e `manifest.webmanifest`.

- `release.yml`: ao empurrar uma tag estável `vX.Y.Z`, publica o GitHub Release com as notas do CHANGELOG e a imagem multi-arquitetura em GHCR e Docker Hub (`X.Y.Z`, `X.Y`, `latest`), com SBOM, proveniência e assinatura cosign.
- No `/admin`, o post ganha campos de slug, data, título, descrição, categoria, autor, rascunho e capa, com prévia da capa, das imagens do texto e do upload.
- O painel lista as listas vinculadas ao post e os posts que usam cada JSON, e permite escolher uma capa já enviada.

### Removed

- Tabela "Comparativo rápido" e card "Veredito / Nossa escolha" dos reviews, com `pickTopProduct`, `comparisonColumns`, `formatScore` e o campo `score` dos produtos.

### Changed

- Cor padrão neutra: o acento (`--primary`, links, foco, chips, banner, barra de leitura, `/admin`) é preto no claro e branco no escuro; todo o verde saiu (inclusive mensagens de sucesso e `theme_color`). O ícone passa a ser um traço de radar sem fundo colorido, com variante clara via `prefers-color-scheme`; o logo do header, do rodapé, do menu e do `/admin` usa o ícone como máscara (`LogoMark.astro`).

- Todo o azul saiu do site (menu, links, botões, foco, cartões de autor); os botões de compartilhar e de loja deixam de usar a cor da marca de cada rede ou loja. O campo `color` dos autores em `site.config.ts` foi removido.
- O tema agora segue `prefers-color-scheme` e só guarda a escolha quando ela difere do sistema.
- `/admin/google` passa a mostrar a tela de Métricas; `/admin/newsletter` é o placeholder.
- A imagem Docker (`infra/Dockerfile`) passa a compilar o site estático e servi-lo com Caddy 2.11.9 (`infra/Caddyfile`), em vez de `astro preview`; o `docker-compose.yml` publica só em `127.0.0.1` e aceita `SITE_URL`. A imagem não executa o código de servidor (API, login, contato, newsletter).
- O domínio deixa de estar escrito nos arquivos: `site`, canonicais, sitemap e JSON-LD usam a variável `SITE_URL` (padrão `http://localhost:4321`), que o `pages.yml` lê da variável de repositório `SITE_URL`. O build não cria mais o `CNAME`; o domínio próprio fica em Settings → Pages. E-mails e textos de exemplo passam a `example.com`.
- O rodapé mostra o aviso de afiliados no lugar de "Todos os direitos reservados." e perde o bloco centralizado repetido.
- O e-mail de contato público passa a ser `contato@example.com`.
- A busca da barra seleciona o texto ao receber foco. O `/admin` alterna o tema claro e escuro.

## [0.11.0] - 2026-11-13

### Added

- Painel editorial estático no GitHub Pages, com token fine-grained, edição de MDX e JSON, upload de imagem e PR para revisão.
- Coluna de outras postagens no artigo, filtro e contagem de categorias na home, além da barra de leitura.
- CI em PR, proteção da `main` e uso do UI SDK nas interações acessíveis.

### Changed

- Entrada do `/admin` reduzida a um campo e ao botão **Login**.
- Senha longa opcional no `/admin`, com token criptografado no build do Pages a partir de segredos do GitHub Actions.
- Home e tipografia têm hierarquia mais clara; cartões e rodapé foram refinados.
- Ícone e favicon SVG próprios, marca em Space Grotesk e fundo de papel com navbar e rodapé no mesmo tom.
- Contato usa e-mail e o rodapé deixou de oferecer inscrição que não funciona no Pages.
- Instruções de agentes ficam em `.agents/`; documentação foi consolidada e releases são feitas somente a pedido.

### Commits

- [c6dfa23](https://github.com/AlexGalhardo/eletro/commit/c6dfa23) — CMS estático, redesign, CI e fluxo por PR.
- [55c62d5](https://github.com/AlexGalhardo/eletro/commit/55c62d5) — restauração dos prompts de conteúdo.
- [63bad22](https://github.com/AlexGalhardo/eletro/commit/63bad22) — entrada com senha e credencial criptografada.
- [4c6775a](https://github.com/AlexGalhardo/eletro/commit/4c6775a) — correção da URL de autenticação no GitHub.

### Fixed

- URL de consulta ao repositório no login sem barra final, evitando falha de preflight CORS no GitHub.

## [0.10.0] - 2026-11-13

Importação em lote, feature flags, home com barra lateral e rascunhos.

### Changed

- As releases públicas passam a ser estas dez. Cada commit fica linkado no fim da própria linha.
- Home: filtros de categoria numa barra lateral fixa à esquerda no desktop e posts em duas colunas; no celular e no tablet, as categorias ficam no menu.
- Busca da barra de navegação: cada resultado mostra a capa, o título e a data do post.
- Bordas menos arredondadas em todo o site, inclusive no campo de busca.
- **docs:** List what to review in the imported drafts before publishing ([44a3899](https://github.com/AlexGalhardo/eletro/commit/44a38997f36af079600aef333c6bb952ab747e99))
- **test:** Wait for the mobile menu to close before reopening it ([6bb2623](https://github.com/AlexGalhardo/eletro/commit/6bb2623e57ef27c69affe2290a9fc1a38ff46989))
- **docs:** Document batch import, post status, feature flags and the Astro-only migration plan ([0bc7706](https://github.com/AlexGalhardo/eletro/commit/0bc7706cc0644f1eb32c7fbdd696429fc705f9f1))

### Fixed

- A busca da barra de navegação mostra os 6 resultados inteiros, sem cortar os 2 últimos.
- O importador lia, em algumas páginas, a ficha técnica do produto seguinte junto com a do próprio produto.
- **fix:** Show all six search results without cutting the last two ([2df3cee](https://github.com/AlexGalhardo/eletro/commit/2df3ceeca0197f2ee6e6980a61591bd635a3d21b))
- **fix:** Add the renamed photos and covers referenced by imported drafts ([8d4853b](https://github.com/AlexGalhardo/eletro/commit/8d4853bed6161516f2cc1a45cbe3ec40a154b445))

### Added

- Flag `showDrafts` (ou `SHOW_DRAFTS=1` no build): rascunhos aparecem no site como se publicados, na home, nas categorias, na busca e em `/<slug>`, com `noindex`. Sitemap, `llms.txt`, API e dashboard de links seguem só com os publicados.
- Feature flags: `content/flags.json` (versionado) e `/admin/flags` (página estática, vale para o GitHub Pages), com override por navegador.
- Prévia dos rascunhos em `/preview/<slug>`, com `noindex`, `Disallow` no `robots.txt` e fora do sitemap, do `llms.txt`, da API e do dashboard de links.
- Flag `allStoreButtons`: os cartões mostram os botões de Mercado Livre, Shopee e Amazon mesmo sem link real.
- `docs/post-status.md`, gerado por `bun run post-status`: cada post com draft, produtos, links de afiliado reais e pendentes (`#`). Um teste falha quando o arquivo fica desatualizado.
- Coluna "Links" e filtro "Links de afiliado" em `/admin/posts`.
- Importação em lote dos posts que faltam (`bun webscrapping/batch.ts [--write] [--limit N]`): compara os sitemaps da origem com o `ref` dos posts e importa como rascunho, em sequência e com pausa, sem copiar texto.
- Categorias Banheiro, Cama, Mesa e Banho, Iluminação, Infantil e Jardim.
- **feat:** Show drafts on the site as if published behind the showDrafts flag ([6cf41cd](https://github.com/AlexGalhardo/eletro/commit/6cf41cd15823658cb83871d9a15804f748a074b1))
- **content:** Add imported review drafts (6/6) ([438dde1](https://github.com/AlexGalhardo/eletro/commit/438dde1d7363bb1290b6f1315941b1f94129bda5))
- **content:** Add imported review drafts (5/6) ([eb65985](https://github.com/AlexGalhardo/eletro/commit/eb6598580c81c1d77e3a00ea79d0614e4f2ddbba))
- **content:** Add imported review drafts (4/6) ([995a12e](https://github.com/AlexGalhardo/eletro/commit/995a12e1c28cd33b85fd521e4b15182de312cffb))
- **content:** Add imported review drafts (3/6) ([d5105e5](https://github.com/AlexGalhardo/eletro/commit/d5105e5f8f12543f43ceeb6d82707925fcdc2584))
- **content:** Add imported review drafts (2/6) ([a486f05](https://github.com/AlexGalhardo/eletro/commit/a486f051e3b5060fa8a9911fba221d892757dcf7))
- **content:** Add imported review drafts (1/6) ([fac278d](https://github.com/AlexGalhardo/eletro/commit/fac278d4116522a977a9eda9c7d246057890c117))
- **feat:** Move home filters to a sidebar, show covers in search and soften corners ([b589fc9](https://github.com/AlexGalhardo/eletro/commit/b589fc985a40ac4a6eb388f66af08be50e4c0bd6))
- **feat:** Add feature flags and noindex draft previews ([21cc153](https://github.com/AlexGalhardo/eletro/commit/21cc15378daa08d29bcd060458dfd4b6e4e3cdf3))
- **feat:** Track post status and affiliate link counts ([83070f7](https://github.com/AlexGalhardo/eletro/commit/83070f77bb252756e84ec136d90c829617353f85))
- **feat:** Import missing source posts in batch and keep one spec sheet per product ([97f4b8e](https://github.com/AlexGalhardo/eletro/commit/97f4b8e49995ebef45a68c13e17b16d0e4d3b04d))

## [0.9.0] - 2026-11-09

O site público passa a ser Astro 7.4 no GitHub Pages.

### Added

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` e `SECURITY.md` na raiz do repositório.
- **BREAKING:** **feat:** Build the public site with Astro 7.4 and host it on GitHub Pages ([b2250a1](https://github.com/AlexGalhardo/eletro/commit/b2250a1dda47f76a5988f6c76103daac08a8921f))

### Changed

- O README segue o formato de referência do workspace.
- O pacote passa a se chamar `astro-blog-cms` (antes `sveltekit-blog-cms`).
- O site público passa a ser um build estático do Astro 7.4, com as mesmas páginas, o mesmo conteúdo e as ilhas Svelte 5. SvelteKit e o adaptador da Vercel saíram do projeto. A branch `legacy-sveltekit` guarda o código anterior.
- A produção passa a ser o GitHub Pages (`.github/workflows/pages.yml`). O Pages não executa painel, API de escrita, login, contato, newsletter nem cron; esse código continua coberto pelos testes.
- O corpo dos posts é renderizado com `marked`. `<CardsTable>` continua uma ilha Svelte.
- Uma URL desconhecida responde 404.
- **docs:** Record the open source files and the package rename in the changelog ([3f84141](https://github.com/AlexGalhardo/eletro/commit/3f84141d4f8d3d93aca7d484c2abd37061fc5097))
- **docs:** Restructure the README like the workspace reference ([16e6b84](https://github.com/AlexGalhardo/eletro/commit/16e6b847e3e9deb8ed7315fe9144ab2a8924c790))
- **docs:** Add contributing, code of conduct and security policy ([f59716f](https://github.com/AlexGalhardo/eletro/commit/f59716f0b83986d7176c3d0d9eb63f31160f1e74))
- **chore:** Align the bun.lock workspace name with the package ([885256b](https://github.com/AlexGalhardo/eletro/commit/885256b339c5c710a8e8340cea1aa5632ceae6ae))
- **chore:** Rename the package to astro-blog-cms ([1664048](https://github.com/AlexGalhardo/eletro/commit/1664048a7eb5b8177e6de7822f722a1cccb6603e))

### Fixed

- A URL canônica e o sitemap usam a barra final, que é o endereço em que o GitHub Pages responde 200.
- As leituras públicas da API são publicadas como `index.json`, servidas com `Content-Type: application/json` em `/api/v1/.../`.
- A documentação de operação descreve Astro 7.4 no GitHub Pages.
- Os testes e2e conferem o site estático: 404 no lugar do redirecionamento para a home, tela de login no painel e a API em JSON.
- **fix:** Serve canonical URLs and JSON reads on GitHub Pages ([df9d589](https://github.com/AlexGalhardo/eletro/commit/df9d5895eb7cd913e0abc0608f48abd3bd6259c6))

### Removed

- `@sveltejs/kit`, `@sveltejs/adapter-vercel`, `@sveltejs/vite-plugin-svelte`, `mdsvex` e `vercel.json`.

## [0.8.0] - 2026-10-11

Links de afiliado, fotos no painel, Docker e conferência do ambiente.

### Changed

- Skills `project-new-post` e `project-new-product-list` descrevem as regras atuais dos links de afiliado: o JSON guarda o endereço real da loja, o botão passa pelo dashboard de links, `#`, vazio e `null` não são link, e o `id` do produto (com o slug do post) é a identidade no dashboard, então mudá-lo apaga os cliques e repeti-lo no mesmo post falha o build.
- Commit `content:` feito em uma sessão de trabalho é uma release; a skill `project-new-post` dizia que não era. Só os commits do painel em produção ficam sem versão.
- `.claude/rules/` sem repetição: `content.md` e `testing.md` apontam para `docs/content.md` e `docs/testing.md`, `git-and-releases.md` cita os hooks `pre-commit` e `pre-push` e deixa a regra de versão na skill `project-release`.
- graphify passou a ser opcional de fato: o `AGENTS.md` diz como gerar e atualizar o grafo (`python -m graphify update .`) e a skill saiu da carga obrigatória do início de sessão.
- `docs/content.md`: `mercadolivreUrl: "#"` mantém o botão do Mercado Livre apontando para a oferta padrão, e o `id` é único também dentro do post.
- `setups/setup-unix.sh` e `setups/setup-windows.sh` passam a se chamar `setup-unix-local.sh` e `setup-windows-local.sh`.
- Os scripts de setup não instalam mais o Bun nem encerram o processo que ocupa a porta: dizem como instalar o que falta, usam a próxima porta livre (ou param, se a porta foi pedida com `PORT=`) e aceitam `SETUP_NO_START=1` além de `--no-start`. Os segredos gerados não dependem mais do Node.
- O build se identifica no dashboard de links pelo endereço do site e usa a chave única do dashboard; o projeto é criado lá no primeiro build. `LINKS_DASHBOARD_TOKEN` passa a ser essa chave.
- Hooks do git: `pre-commit` roda a checagem de tipos e `pre-push` roda tipos, lint e testes.
- Os botões de loja, a foto e o nome do produto apontam para o redirect do dashboard de links, não mais direto para a loja.
- A oferta padrão (`site.fallbackAffiliateUrl`) também passa pelo dashboard.
- **docs:** Review .claude rules and skills and drop the graphify hooks ([e7fb71e](https://github.com/AlexGalhardo/eletro/commit/e7fb71eb3de8348e1e859eb2cc07383edfcadf07))
- **docs:** Rewrite the README for the site as it runs today ([630dcff](https://github.com/AlexGalhardo/eletro/commit/630dcffd6463370e0e875aac5268f00f2ff37374))
- **chore:** Add agent setup docs, Docker infra and the four setup scripts ([e86d8c7](https://github.com/AlexGalhardo/eletro/commit/e86d8c7444bbfdd6f4dec420d6e29156b502e49b))

### Removed

- `.claude/settings.json`: os hooks rodavam `python -m graphify hook-guard` a cada chamada de Bash, Grep, Read e Glob, falhavam em máquina sem Python e, com o grafo presente, repetiam o mesmo aviso em toda chamada.
- `.claude/CLAUDE.md` e a seção "graphify" do `CLAUDE.md`, que afirmavam a existência de um grafo que o repositório não versiona.

### Added

- Conferência das variáveis de ambiente no começo de todo build (`scripts/check-env.ts`, regras em `src/lib/env-check.ts`, com zod). Variável presente com formato errado falha o build; no build de produção (`VERCEL_ENV=production`) também falham a ausência de `LINKS_DASHBOARD_TOKEN`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_TOKEN`, `GITHUB_REPO` ou `CRON_SECRET`, a falta de um par de login completo e a falta de uma lista de admins. A mensagem traz uma linha por variável, sem valores. Build local, Docker e testes seguem sem exigir nenhuma variável.
- `bun run check-env`, para conferir as variáveis sem fazer o build.
- Testes do login social: e-mail permitido mas não verificado é recusado no fluxo completo do Google e do GitHub.
- `docs/agent-setup.md`: roteiro para um agente preparar o projeto do zero, com comando e verificação por passo (dependências, `.env`, banco, execução local, Docker, testes, conteúdo, GitHub e release, Vercel, dashboard de links). `docs/tooling.md` e `docs/workflows.md` descrevem as ferramentas e a ordem de trabalho.
- `infra/`: `Dockerfile` (`oven/bun` com tag fixa e Node 24) e `docker-compose.yml` que buildam e servem o build de produção em `http://localhost:8080`, com `.dockerignore` na raiz. O build da imagem só valida os links de afiliado, sem enviar nada ao dashboard.
- `setups/setup-unix-with-docker.sh` e `setups/setup-windows-with-docker.sh`: conferem o Docker, preparam o `.env`, buildam a imagem e sobem o container.
- Os botões de loja caem para o endereço direto da loja quando o dashboard de links não responde (consulta a `/health` ao abrir a página).
- Painel: botões "Exportar links (JSON)" e "Exportar links (CSV)" baixam todos os links de afiliado dos posts publicados no formato de importação do dashboard de links (`GET /api/v1/affiliate-links`).
- Dashboard de links: todo build registra os links de afiliado dos posts publicados no dashboard definido em `site.linksDashboardUrl` (`scripts/sync-links.ts`, variável `LINKS_DASHBOARD_TOKEN`). O build de produção falha se o registro falhar, então nenhuma página vai ao ar com link fora do dashboard. Ver `docs/affiliate-links.md`.
- Editor de post e editor de lista de produtos: a capa e a foto de cada produto aparecem renderizadas abaixo do campo do endereço. Uma imagem recém-enviada é mostrada na hora, a partir do arquivo escolhido; se o endereço não carregar, o campo avisa.
- `/admin/posts`: miniatura da capa de cada post e, na coluna "Produtos", um botão por lista que abre o editor da lista em outra aba.
- `/admin/products`: cada lista mostra as fotos dos seus produtos.
- **feat:** Validate environment variables at build time ([1960bd4](https://github.com/AlexGalhardo/eletro/commit/1960bd4ea5a24e8c1f6c30a3cd98419caea7482f))
- **feat:** Fall back to the store address when the links dashboard is down ([95d5d06](https://github.com/AlexGalhardo/eletro/commit/95d5d060c6793bfe2e7c84b2136bcb21fef61303))
- **admin:** Export the affiliate links as JSON or CSV for the links dashboard ([2d8cb01](https://github.com/AlexGalhardo/eletro/commit/2d8cb01245ba338651d0621ac34f59e2a93e8d49))
- **feat:** Route affiliate links through the links dashboard and register them on every build ([508c8eb](https://github.com/AlexGalhardo/eletro/commit/508c8ebcb2a2021838d19c87c02022351e684c77))
- **content:** Remove post melhor-aquecedor-a-oleo ([a2635cc](https://github.com/AlexGalhardo/eletro/commit/a2635ccbc082f334178fad511dd78a58e901c7a9))
- **admin:** Render the cover and the product photos in the editors ([6894ec6](https://github.com/AlexGalhardo/eletro/commit/6894ec6a45ff336496c11b5d2040ea804261aa7d))
- **admin:** Show post covers, product photos and open a post's lists in a new tab ([d563d83](https://github.com/AlexGalhardo/eletro/commit/d563d83f96745c26581d1ec53f7b352574a19440))

### Fixed

- `.env.example`: um comentário quebrado em duas linhas deixava uma linha sem `#`, e o Docker Compose recusava o `.env` criado a partir dele.
- Loja com link `#` não gera mais botão com `href="#"`; a foto e o nome de um produto sem link real apontam para a oferta padrão em vez de `#`.

## [0.7.0] - 2026-10-07

Correções da importação, da home e da gravação no GitHub.

### Fixed

- Home e rodapé: uma categoria sem nenhum post publicado (só rascunhos, só agendados ou nenhum post) não aparece mais no filtro nem na lista de categorias do rodapé. Ela volta sozinha quando o primeiro post da categoria é publicado.
- Home: com a oitava categoria, a faixa de filtros passava da largura do conteúdo no desktop. Os botões ficaram um pouco menores e ocupam a linha inteira, alinhados às bordas dos cartões; quando não cabem (telas menores ou mais categorias), a faixa rola para o lado em vez de vazar.
- Gravação pelo painel: um erro 5xx do GitHub é tentado de novo duas vezes; se persistir, a API responde 502 (`content_store_failed`) e a tela explica que a falha é do GitHub, em vez de "erro inesperado".
- Importação (`/admin/import`): quando a conta da Mistral não tem cota para o `mistral-small-latest` (resposta 429 ou 403), a reescrita do resumo e do FAQ passa para o `ministral-8b-latest` em vez de cair no texto genérico.
- Importação (`/admin/import`): fotos de produto hospedadas no servidor de imagens do Mercado Livre (`http2.mlstatic.com`) eram recusadas com "não está em um endereço permitido".
- **home:** Hide categories without a published post from the filter and the footer ([d5f9b36](https://github.com/AlexGalhardo/eletro/commit/d5f9b364e5ac0b130eaa2603b67c5e7be7ad590e))
- **home:** Keep the category filter inside the content width ([2f82f02](https://github.com/AlexGalhardo/eletro/commit/2f82f02277f5471a379efaed136335b1a20294f6))
- **cms:** Retry GitHub server errors and report them as a GitHub failure ([8b6e3f2](https://github.com/AlexGalhardo/eletro/commit/8b6e3f232cc7931675a47ffe8f23965ff7f9b1c0))
- **import:** Fall back to a smaller Mistral model when the plan has no quota ([880d590](https://github.com/AlexGalhardo/eletro/commit/880d5907d40b975035891d92316606ae941f8958))
- **import:** Accept product photos hosted on the Mercado Livre image server ([95f71de](https://github.com/AlexGalhardo/eletro/commit/95f71de5c0d869f7933cf0cd372086330bce9716))

### Added

- **content:** Add post melhor-aquecedor-a-oleo ([a861c2d](https://github.com/AlexGalhardo/eletro/commit/a861c2dfebfb057598edefd1899ee5da50b31e6c))
- **content:** Add product list melhor-aquecedor-a-oleo ([43a6f23](https://github.com/AlexGalhardo/eletro/commit/43a6f23d255242beafd6de41fa28f4e96b99de94))
- **content:** Add image melhor-aquecedor-a-oleo-cover.webp ([0e3119d](https://github.com/AlexGalhardo/eletro/commit/0e3119d618b164671f561b8a1108697b13665b69))
- **content:** Add image melhor-aquecedor-a-oleo-7.jpg ([32de69d](https://github.com/AlexGalhardo/eletro/commit/32de69d7bfb945dda4e50e3edb4561edbd4fe196))
- **content:** Add image melhor-aquecedor-a-oleo-6.jpg ([5420640](https://github.com/AlexGalhardo/eletro/commit/542064036fd1a4b679be30c56662b538076578f2))
- **content:** Add image melhor-aquecedor-a-oleo-5.jpg ([5be25ef](https://github.com/AlexGalhardo/eletro/commit/5be25ef9743c076c7af9d262cc492ed44a305305))
- **content:** Add image melhor-aquecedor-a-oleo-4.jpg ([1b86de4](https://github.com/AlexGalhardo/eletro/commit/1b86de42976db2e103cbbcd69ce309db7d301cc9))
- **content:** Add image melhor-aquecedor-a-oleo-3.jpg ([c4e3c1d](https://github.com/AlexGalhardo/eletro/commit/c4e3c1d4d2927280552cc35f8c0fbe5cc3949604))
- **content:** Add image melhor-aquecedor-a-oleo-2.jpg ([877444e](https://github.com/AlexGalhardo/eletro/commit/877444ed996e632156645f117c59cde7ab203604))
- **content:** Add image melhor-aquecedor-a-oleo-1.jpg ([ba03695](https://github.com/AlexGalhardo/eletro/commit/ba03695acf763a432f05a1d22746ddcf0bf9c616))
- **content:** Add image melhor-lanterna-vonder-7.jpg ([a98e323](https://github.com/AlexGalhardo/eletro/commit/a98e323ddaf2241bacbb26a538499535631f6207))
- **content:** Add image melhor-lanterna-vonder-6.jpg ([6c82459](https://github.com/AlexGalhardo/eletro/commit/6c82459579eed6714a32a29914ed5c2dedbbc5e3))
- **content:** Add image melhor-lanterna-vonder-5.jpg ([0966070](https://github.com/AlexGalhardo/eletro/commit/09660702599f7e193ac3ed84d52847294d46d600))
- **content:** Add image melhor-lanterna-vonder-4.jpg ([88ada80](https://github.com/AlexGalhardo/eletro/commit/88ada80fe8a31acd4ed54c445d0a31dd659a9045))
- **content:** Add image melhor-lanterna-vonder-3.jpg ([6341764](https://github.com/AlexGalhardo/eletro/commit/6341764fb211f28ca48906b753da834c6e675b7d))
- **content:** Add image melhor-lanterna-vonder-2.jpg ([d230d6f](https://github.com/AlexGalhardo/eletro/commit/d230d6f66a8b77273c2c5aabfcf2e37e5fef23d6))
- **content:** Add image melhor-lanterna-vonder-1.jpg ([8964c71](https://github.com/AlexGalhardo/eletro/commit/8964c7174d1e6a9106520883d1198d978d057929))

### Changed

- **style:** Build the closing script tag without string concatenation ([248561c](https://github.com/AlexGalhardo/eletro/commit/248561cec710ac6e6f98e43b4e6decee454c0ee6))

## [0.6.0] - 2026-10-07

Painel no celular, Search Console e a primeira versão estável.

### Changed

- Primeira versão estável: o projeto sai do release candidate. A partir daqui vale o SemVer comum (`feat` sobe a minor, `fix` e os demais tipos sobem a patch).
- Excluir uma lista de produtos não é mais recusado quando um post a usa: os posts que mostram a lista perdem o `<CardsTable>` dela e viram rascunho, e a confirmação avisa quais são.
- Painel `/admin` no celular: a navegação fica atrás de um menu hambúrguer, em vez de ocupar meia tela no topo.
- **docs:** Leave the release candidate ([014a0ef](https://github.com/AlexGalhardo/eletro/commit/014a0ef191e8a06dbc56cba387ce68f80548cec2))
- Merge pull request #4 from AlexGalhardo/ccr-3e119613-1rgj9m-admin ([2d70067](https://github.com/AlexGalhardo/eletro/commit/2d7006709c7f9dd803b1dd909244235408f2d65e))
- Merge pull request #3 from AlexGalhardo/ccr-3e119613-1rgj9m ([2924eee](https://github.com/AlexGalhardo/eletro/commit/2924eee7a1980f6718fbc1f36eb695ad9021772b))

### Added

- `robots.txt`: sinal de uso do conteúdo (`Content-Signal: search=yes, ai-input=yes, ai-train=no`) e bloqueio dos robôs de coleta em massa e de treino de IA listados em `site.blockedCrawlers`. Buscadores e assistentes que abrem a página para responder a alguém continuam liberados. A mesma regra está escrita no `llms.txt` e nos Termos de Uso (`site.contentPolicy`).
- `/admin/products` mostra em quais posts cada lista é usada, com filtro "Em uso" e "Sem uso"; `/admin/posts` ganhou a coluna "Produtos", com link para cada lista do post; o editor da lista mostra os posts que a usam.
- `/admin/media`: o botão "Copiar link" copia o endereço completo da imagem no servidor em uso (por exemplo `https://example.com/images/posts/foto.jpg`) com o clipboard.js e abre um aviso "Link copiado".
- Tela `/admin/google`: cliques, impressões, CTR e posição do Google Search Console, usuários, sessões e visualizações do Google Analytics 4 (últimos 28 dias), a lista de sitemaps e o botão "Reenviar sitemap ao Google" (`POST /api/v1/google/sitemap`). A configuração da conta de serviço está em `docs/google-console-analytics-setup.md`.
- Categoria "Cuidados Pessoais" (`cuidados-pessoais`).
- Botão "Excluir lista" no editor de produtos e `DELETE /api/v1/products/{list}`: apaga a lista inteira de uma vez. A exclusão é recusada enquanto algum post mostra a lista com `<CardsTable>`, porque o build quebraria.
- **seo:** Refuse training crawlers and state the content policy in robots.txt ([b6b107c](https://github.com/AlexGalhardo/eletro/commit/b6b107ce2985879e351d15f7a35d53d17147317d))
- **admin:** Link posts and product lists and unpublish posts of a deleted list ([d69c0c7](https://github.com/AlexGalhardo/eletro/commit/d69c0c7ece5ac81ba3b7ca649bb5d566a98e7080))
- **admin:** Copy the full image link with clipboard.js and confirm it in a dialog ([0e24d11](https://github.com/AlexGalhardo/eletro/commit/0e24d11524986dd0465349a68a3d249703cc8a6c))
- **admin:** Show Google Search Console and Analytics data and resubmit the sitemap ([aae6c94](https://github.com/AlexGalhardo/eletro/commit/aae6c949f29f0c726aa5a1f6bd467e975ef4b6b5))
- **content:** Remove post melhor-lava-loucas-portatil ([b2cb426](https://github.com/AlexGalhardo/eletro/commit/b2cb4269fe3e9e01a3f10402bc6b51ec73a4b2e2))
- **content:** Remove post melhor-fogao-dako ([2bd659b](https://github.com/AlexGalhardo/eletro/commit/2bd659b791c608b2b651c81338fe8d70b14ad84c))
- **content:** Remove product list melhor-maquina-de-sorvete ([369cee8](https://github.com/AlexGalhardo/eletro/commit/369cee807893a6a690c3a6d0359ca29ab1dbaf85))
- **admin:** Delete a whole product list at once ([4106933](https://github.com/AlexGalhardo/eletro/commit/4106933f57a797b12f7de1e3a09c771031b1b87a))
- **admin:** Collapse the dashboard navigation into a hamburger menu on phones ([8f2aa9e](https://github.com/AlexGalhardo/eletro/commit/8f2aa9ecce89c161b848277b52c5efffcd9b8058))
- **content:** Add post melhor-fogao-dako ([b2b6a92](https://github.com/AlexGalhardo/eletro/commit/b2b6a9233b1e39bc6ba9f9bc319d5492221e88ee))
- **content:** Add product list melhor-fogao-dako ([350ed59](https://github.com/AlexGalhardo/eletro/commit/350ed594c371ab85f945a12760294990055cad58))
- **content:** Add image melhor-fogao-dako-7.jpg ([ed3cdcf](https://github.com/AlexGalhardo/eletro/commit/ed3cdcfb90c67bf46fa8575aa0d5571b836218b4))
- **content:** Add image melhor-fogao-dako-6.jpg ([003d79f](https://github.com/AlexGalhardo/eletro/commit/003d79f56767ddba648d91f213d19aa5bfe2c11a))
- **content:** Add image melhor-fogao-dako-5.jpg ([2f42f57](https://github.com/AlexGalhardo/eletro/commit/2f42f579c53ac1b7040ab0d4b884687143db46d7))
- **content:** Add image melhor-fogao-dako-4.jpg ([b871b32](https://github.com/AlexGalhardo/eletro/commit/b871b3205096550c2c2124f2cd7520cf9578512e))
- **content:** Add image melhor-fogao-dako-3.jpg ([e26bac3](https://github.com/AlexGalhardo/eletro/commit/e26bac3cd802f624f3f722b4cec87348906e785b))
- **content:** Add image melhor-fogao-dako-2.jpg ([cb8465f](https://github.com/AlexGalhardo/eletro/commit/cb8465f9ee88eda464f3e349231a6480f08aca69))
- **content:** Add image melhor-fogao-dako-1.jpg ([c0d92cc](https://github.com/AlexGalhardo/eletro/commit/c0d92cc39da848bfaaecf3204aa0d88a53845b0a))
- **content:** Remove post melhor-maquina-de-sorvete ([28a58b5](https://github.com/AlexGalhardo/eletro/commit/28a58b5df05a2ccac3c35dbba5beeeb9336a5cf9))
- **content:** Remove post melhor-cafeteira-eletrica-mondial ([5bdfdb0](https://github.com/AlexGalhardo/eletro/commit/5bdfdb06a746189677d334518cdaeee8ff60835c))
- **content:** Add post melhor-maquina-de-sorvete ([7bf67ed](https://github.com/AlexGalhardo/eletro/commit/7bf67ed72ffccc213ef55a5505756bbad9a232a9))
- **content:** Add product list melhor-maquina-de-sorvete ([d9246e3](https://github.com/AlexGalhardo/eletro/commit/d9246e39f42bb371da2cdcd40791da5536f42dea))
- **content:** Add image melhor-maquina-de-sorvete-7.jpg ([55575ba](https://github.com/AlexGalhardo/eletro/commit/55575bae001ec9ca2e4e15d1fbf9c5766fb30684))
- **content:** Add image melhor-maquina-de-sorvete-6.jpg ([58de667](https://github.com/AlexGalhardo/eletro/commit/58de66779610829286f1d769d8cc2850083750dd))
- **content:** Add image melhor-maquina-de-sorvete-5.jpg ([148e946](https://github.com/AlexGalhardo/eletro/commit/148e946abbfa29c1cb53aeef93c24069660e1625))
- **content:** Add image melhor-maquina-de-sorvete-4.jpg ([aa809d5](https://github.com/AlexGalhardo/eletro/commit/aa809d5891d8b3138506ebe2dafbd5c528317ed8))
- **content:** Add image melhor-maquina-de-sorvete-3.jpg ([46960ec](https://github.com/AlexGalhardo/eletro/commit/46960ecbb148541c81539202d864badfc47b8a8c))
- **content:** Add image melhor-maquina-de-sorvete-2.jpg ([c548cf8](https://github.com/AlexGalhardo/eletro/commit/c548cf8d86ba6c8a9a979dac90710e13faf16790))
- **content:** Add image melhor-maquina-de-sorvete-1.jpg ([fa25e8f](https://github.com/AlexGalhardo/eletro/commit/fa25e8f1dbac3483e6d8ea412ed33afd6ec77fec))

### Fixed

- Importação (`/admin/import`): reviews da seção `cuidados-pessoais` da origem eram recusadas porque o site não tinha a categoria.
- Teste de integração da importação no Windows: a capa era aberta pelo caminho e ficava travada na limpeza.
- Build na Vercel: o `opentype.js` (capa da importação) passou a ser importado pelo export padrão, porque o Node carrega a versão CommonJS do pacote, que não tem exports nomeados.
- **import:** Accept the cuidados-pessoais category of the source site ([1c49b00](https://github.com/AlexGalhardo/eletro/commit/1c49b00b1f5432717a73e40e6b1863976502b60b))
- **import:** Load opentype.js through its default export ([38cf5c8](https://github.com/AlexGalhardo/eletro/commit/38cf5c8d29f89c5ddcfcba22ea385712735d5157))

## [0.5.0] - 2026-10-07

A importação reescreve o texto com a Mistral e monta a capa do post.

### Changed

- Capa gerada na importação: os produtos aparecem recortados, sem o fundo branco das fotos e sem os cartões brancos, ocupando mais espaço.
- Merge pull request #2 from AlexGalhardo/ccr-3e119613-1rgj9m-cover ([6776df3](https://github.com/AlexGalhardo/eletro/commit/6776df3d0ca801211af19dcd094e40061419270b))
- Merge pull request #1 from AlexGalhardo/ccr-3e119613-1rgj9m ([8bd7577](https://github.com/AlexGalhardo/eletro/commit/8bd7577a3477ffe5404172ac4a3a70053916a47b))

### Added

- Importação (`/admin/import`): o rascunho já sai com capa, montada com 3 fotos dos produtos sobre um fundo de cor clara aleatória e o endereço do site em negrito no canto inferior direito.
- Importação (`/admin/import`): o resumo e o FAQ da página de origem são reescritos pela API da Mistral (`MISTRAL_API_KEY`) e viram a descrição, a introdução e o FAQ do rascunho. Sem a chave, ou com falha da API, o rascunho fica com o texto genérico e a tela mostra o motivo.
- **import:** Cut product photos out of their white background on the cover ([65560c0](https://github.com/AlexGalhardo/eletro/commit/65560c0c1347c199af574f54d706bc5b2036385d))
- **import:** Generate the post cover from three product photos ([72b9edf](https://github.com/AlexGalhardo/eletro/commit/72b9edf40ac2e820550d2fd29f59df19d75fe9c7))
- **import:** Rewrite source summary and FAQ with Mistral ([40492e1](https://github.com/AlexGalhardo/eletro/commit/40492e1036170e636db30649c9a187b512b484ec))
- **content:** Add post melhor-cafeteira-eletrica-mondial ([0f699de](https://github.com/AlexGalhardo/eletro/commit/0f699dea307ee18d1c1dbd283c33dc496bb1c16a))
- **content:** Add product list melhor-cafeteira-eletrica-mondial ([0ef337a](https://github.com/AlexGalhardo/eletro/commit/0ef337a752bc5476ef0719ae556cc7b093b7ca78))
- **content:** Add image melhor-cafeteira-eletrica-mondial-7.jpg ([f2a700c](https://github.com/AlexGalhardo/eletro/commit/f2a700cf5f8f41b998d00a0490990d6f7ded4282))
- **content:** Add image melhor-cafeteira-eletrica-mondial-6.jpg ([e2c0f84](https://github.com/AlexGalhardo/eletro/commit/e2c0f843f7cce38012ed131e280814132b3140f1))
- **content:** Add image melhor-cafeteira-eletrica-mondial-5.jpg ([469cec4](https://github.com/AlexGalhardo/eletro/commit/469cec44757e1cefe9a79850d305b853964d026e))
- **content:** Add image melhor-cafeteira-eletrica-mondial-4.jpg ([4e6ee78](https://github.com/AlexGalhardo/eletro/commit/4e6ee78205b0bad87303dbcbb35ed4a60325e2a7))
- **content:** Add image melhor-cafeteira-eletrica-mondial-3.jpg ([94d43e2](https://github.com/AlexGalhardo/eletro/commit/94d43e2d0b95653da707fcdb34e45bb3013d0283))
- **content:** Add image melhor-cafeteira-eletrica-mondial-2.jpg ([3dffdbe](https://github.com/AlexGalhardo/eletro/commit/3dffdbe17f405aef2bdbced0bcfeb5363ddc28a8))
- **content:** Add image melhor-cafeteira-eletrica-mondial-1.jpg ([11b60a9](https://github.com/AlexGalhardo/eletro/commit/11b60a9acf74acba30cccc9320f74b2b9e8d48af))

## [0.4.0] - 2026-10-06

Login com Google, tema do painel e o registro do deploy de produção.

### Added

- Botão de tema claro/escuro no cabeçalho do painel, com a mesma preferência do site público.
- Login do painel pelo Google, ao lado do GitHub. `ADMIN_EMAILS` lista os e-mails permitidos; só vale e-mail verificado pelo provedor.
- **feat:** Add the light and dark theme toggle to the admin header ([54369b6](https://github.com/AlexGalhardo/eletro/commit/54369b66c6d68f58fb64c75f6f9ae4fa6ad2e043))
- **feat:** Add Google sign-in to the admin ([9f9105d](https://github.com/AlexGalhardo/eletro/commit/9f9105d46eeb574729ec4d32fc8696273e0a82fa))

### Fixed

- Salvar, enviar imagem ou importar em um deploy sem `GITHUB_TOKEN` respondia erro 500 genérico. Agora responde 503 `content_store_unavailable` e o painel diz quais variáveis faltam.
- **fix:** Answer 503 with the missing variables when the content store cannot write ([46f0bf6](https://github.com/AlexGalhardo/eletro/commit/46f0bf67d402ac45263178a251923aaf382b40d1))

### Changed

- **docs:** Record the production deploy on Vercel in the plan ([f504f4c](https://github.com/AlexGalhardo/eletro/commit/f504f4c496cac827f6a34192b53c8038cd902683))
- **test:** Keep the e2e server away from the services of a local .env ([f7c6b48](https://github.com/AlexGalhardo/eletro/commit/f7c6b488fa0ade73e920c85e563deb864fec0e9f))

## [0.3.0] - 2026-10-06

Deploy na Vercel, scripts de setup e uma release por commit.

### Changed

- Todo commit passa a ser uma release: versão no `package.json`, seção no `CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release. Commits `content:` feitos pelo painel ficam de fora. O processo está em `docs/ci-cd.md`.
- `scripts/release.ts` calcula a versão pela mensagem do commit (`--message`), conta `rc.N` enquanto a versão é um release candidate e devolve as notas de uma versão (`--section`).
- Releases retroativas criadas para os 30 commits anteriores, de `v0.1.0` a `v1.0.0-rc.10`.
- Cards de produto: o valor de cada especificação fica alinhado à direita e o rótulo não tem mais largura fixa, então rótulos longos não invadem o valor.
- `.gitignore` ignora os arquivos de skills que a integração do Neon na Vercel CLI grava no projeto.
- Página inexistente redireciona para a home (302) em vez de mostrar a tela de 404. Arquivos (endereços com extensão) e a API continuam respondendo 404.
- Adaptador trocado de `@sveltejs/adapter-auto` para `@sveltejs/adapter-vercel` 7.0.0, usado só no build da Vercel. Publicar na Netlify passa a exigir a troca do adaptador.
- `engines.node` fixado em `24.x` (era `>=22.17`); os scripts de setup exigem Node 24.
- Documentação: achados do Lighthouse corrigidos e execução dos testes e2e em contêiner registrada.
- **chore:** Ignore the agent skills installed by the Neon integration ([afe261b](https://github.com/AlexGalhardo/eletro/commit/afe261baa9ab8f7f17975fff6f06219708d82d66))
- **docs:** Correct the Lighthouse findings and record the container e2e run ([304a3ca](https://github.com/AlexGalhardo/eletro/commit/304a3cae8ef64511ce9ff64707eb9f8ad979956e))

### Fixed

- Login pelo GitHub recusava todo mundo com `unable_to_create_user`: o `better-auth` descartava o login do perfil antes da conferência da lista de administradores.
- Segundo build na Vercel falhava com `ERR_PACKAGE_PATH_NOT_EXPORTED` em `estree-walker`: o `adapter-auto` instalava o adaptador durante o build, por cima do cache.
- `vercel.json` tinha um bloco de cabeçalhos aninhado fora do schema, que faria a Vercel recusar o deploy.
- **fix:** Let GitHub sign-in create the admin account ([2b9bc76](https://github.com/AlexGalhardo/eletro/commit/2b9bc76f8f93a80ffeb7fb002cab563473e883ca))
- **fix:** Keep long product spec labels from overlapping their values ([946e4e7](https://github.com/AlexGalhardo/eletro/commit/946e4e76c437cd67ff1b121565d6cbad76e84458))
- **fix:** Build on Vercel with adapter-vercel and pin Node 24 ([041f61c](https://github.com/AlexGalhardo/eletro/commit/041f61c5a1104de3544bba5f20f04ce2ca421c88))
- **fix:** Remove the nested header block that made vercel.json invalid ([e19911f](https://github.com/AlexGalhardo/eletro/commit/e19911f09aea82e25794c622fe1f23aa9823738f))

### Added

- Cron da Vercel em `vercel.json`: a fila da newsletter roda a cada 15 minutos (exige plano Pro e `CRON_SECRET`).
- `.vercelignore`: `vercel deploy` a partir da pasta de trabalho não envia mais `.env`, `.data` nem pastas geradas.
- Scripts `setups/setup-unix.sh` e `setups/setup-windows.sh`: conferem Node e Bun, instalam as dependências, criam o `.env` com os padrões do painel, liberam a porta e sobem o servidor de desenvolvimento.
- `docs/setup-vercel.md`: passo a passo do deploy na Vercel, com conferência e problemas comuns.
- **feat:** Make every commit a release ([96f4a0c](https://github.com/AlexGalhardo/eletro/commit/96f4a0c3a606a06720342b5cbc4a10800fc44488))
- **feat:** Run the newsletter queue every 15 minutes with a Vercel cron ([939ec8f](https://github.com/AlexGalhardo/eletro/commit/939ec8f33b408b666eecf49cc822a4840b780f56))
- **feat:** Redirect unknown pages to the home page ([814960d](https://github.com/AlexGalhardo/eletro/commit/814960d2dcfe552dce0c8b5fd30a90d3184a5888))
- **feat:** Add setup scripts and the Vercel setup guide ([48e6d8b](https://github.com/AlexGalhardo/eletro/commit/48e6d8ba87be223e206d03c2f1590e5eefa83f95))

## [0.2.0] - 2026-10-06

Base do CMS: banco, autenticação, API, painel, newsletter, importação e segurança.

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
- **feat:** Import a draft post from the source site by web scraping ([d5673d2](https://github.com/AlexGalhardo/eletro/commit/d5673d2a7c5313262be978a67ac4e14238ba8726))
- **feat:** Add post import by web scraping to the admin ([b570b7d](https://github.com/AlexGalhardo/eletro/commit/b570b7d44c66990d8adf8c843207b20741173ebb))
- **content:** Add draft post melhor-lava-loucas-portatil ([a6cf2c6](https://github.com/AlexGalhardo/eletro/commit/a6cf2c62f6636fae8bc3ca39bd4a664f32cfe26a))
- **feat:** Add the newsletter with double opt-in and post announcements ([fd69444](https://github.com/AlexGalhardo/eletro/commit/fd694443525451a23d5f1bf48ab46939ba6fd382))
- **feat:** Add the admin dashboard for posts, products and media ([0ee71cf](https://github.com/AlexGalhardo/eletro/commit/0ee71cf608a4305c5c3e8246c394bc62e7836093))
- **feat:** Add the /api/v1 REST API for posts, products and media ([443d836](https://github.com/AlexGalhardo/eletro/commit/443d836413ebe9d045fbd52d1b58f041967be393))
- **feat:** Add the admin login, panel layout and test login ([6a43c33](https://github.com/AlexGalhardo/eletro/commit/6a43c338fd056a0b5e2ffc0b66c5cf70b0e8fdc1))
- **feat:** Add the server foundation for the admin CMS ([7f84859](https://github.com/AlexGalhardo/eletro/commit/7f84859db7f93b7ecbb04a8a93cc4567f57c4abb))

### Changed

- Verde e cinza do tema claro um tom mais escuros no logotipo, nos botões e nos títulos do rodapé, para atender ao contraste AA.
- Produto ainda sem foto (imagem `#`) não mostra mais uma imagem quebrada.
- A Política de Privacidade passa a dizer que o e-mail é guardado para quem se inscreve na newsletter.
- Páginas do painel não carregam os scripts de analytics.
- **release:** V1.0.0-rc.1 ([17e3293](https://github.com/AlexGalhardo/eletro/commit/17e3293d56d7069263b0860787c85af264e8080b))
- **docs:** Record the release candidate checks and what is left for 1.0.0 ([dc67c79](https://github.com/AlexGalhardo/eletro/commit/dc67c79aac43719efacc0dfb290ae0f730ef5c93))
- **docs:** Use headings for the README feature groups ([3764b43](https://github.com/AlexGalhardo/eletro/commit/3764b43ac2fe78c352449f310d4b3ef2fb2fef57))
- **docs:** Write the README, the deploy guide and the project skills ([6b0209c](https://github.com/AlexGalhardo/eletro/commit/6b0209c0023195848c2dcaf8f09f3181e7419bae))
- **perf:** Serve covers in three widths and meet AA contrast ([0916722](https://github.com/AlexGalhardo/eletro/commit/09167221c4b3e533254c892cbfd2a701268c69c2))
- **docs:** Record the local simulation of the CI and release workflows ([f85b411](https://github.com/AlexGalhardo/eletro/commit/f85b411b1f5428c9b76ad1ce7f8fc7fc7f2384dd))
- **test:** Serve the e2e build on an explicit IPv4 address ([1069ed7](https://github.com/AlexGalhardo/eletro/commit/1069ed7f40cc5ba289b7d68f8140c0d02202716b))
- **ci:** Add the CI and release workflows, still disabled ([c57b4c5](https://github.com/AlexGalhardo/eletro/commit/c57b4c5e9017ece0cea273e0a34447ccf28e4e1d))
- **chore:** Stop tracking agent worktrees ([7a3cc69](https://github.com/AlexGalhardo/eletro/commit/7a3cc69b5d3509e220253db33019c5e47b6a0376))
- **docs:** Check the current OWASP Top Ten in the security skill ([5abbfb4](https://github.com/AlexGalhardo/eletro/commit/5abbfb4531cbfd62d67c2ae4adeeee700696237e))

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
- **fix:** Close the post body gate bypass and harden the admin and newsletter ([f5c28aa](https://github.com/AlexGalhardo/eletro/commit/f5c28aaccef5722f1ed2930259f077c8f3ed3630))
- **fix:** Load more posts after a jump to the end of the home page ([bb49da5](https://github.com/AlexGalhardo/eletro/commit/bb49da5dcb20b8ef1e948aeefb459608c642c6ca))

## [0.1.0] - 2026-10-06

Site público em SvelteKit, com o visual e as URLs do projeto anterior.

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
- **feat:** Rewrite the public site in SvelteKit 3 ([32e672f](https://github.com/AlexGalhardo/eletro/commit/32e672ffac58a28a94d18d8a3a7ef97113a64641))

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

[Unreleased]: https://github.com/AlexGalhardo/eletro/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/AlexGalhardo/eletro/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/AlexGalhardo/eletro/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/AlexGalhardo/eletro/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/AlexGalhardo/eletro/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/AlexGalhardo/eletro/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/AlexGalhardo/eletro/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/AlexGalhardo/eletro/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/AlexGalhardo/eletro/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/AlexGalhardo/eletro/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/AlexGalhardo/eletro/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AlexGalhardo/eletro/releases/tag/v0.1.0
