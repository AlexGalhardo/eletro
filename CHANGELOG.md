# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/). As releases públicas recomeçaram em 0.1.0. Cada uma lista os commits que a compõem.

## [Unreleased]

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

## [0.10.0] - 2026-11-13

Importação em lote, feature flags, home com barra lateral e rascunhos.

### Changed

- As releases públicas passam a ser estas dez. Cada commit fica linkado no fim da própria linha.
- Home: filtros de categoria numa barra lateral fixa à esquerda no desktop e posts em duas colunas; no celular e no tablet, as categorias ficam no menu.
- Busca da barra de navegação: cada resultado mostra a capa, o título e a data do post.
- Bordas menos arredondadas em todo o site, inclusive no campo de busca.
- **docs:** List what to review in the imported drafts before publishing ([89d1d72](https://github.com/AlexGalhardo/eletro/commit/89d1d72d95020f71f96d84de25be8a3060552086))
- **test:** Wait for the mobile menu to close before reopening it ([7f8d98f](https://github.com/AlexGalhardo/eletro/commit/7f8d98f19e16bd4c6fd335fdf64a248b2fb30db6))
- **docs:** Document batch import, post status, feature flags and the Astro-only migration plan ([351ead2](https://github.com/AlexGalhardo/eletro/commit/351ead24747ee75e1e45be0bc7a15397f70f8f22))

### Fixed

- A busca da barra de navegação mostra os 6 resultados inteiros, sem cortar os 2 últimos.
- O importador lia, em algumas páginas, a ficha técnica do produto seguinte junto com a do próprio produto.
- **fix:** Show all six search results without cutting the last two ([ba7f711](https://github.com/AlexGalhardo/eletro/commit/ba7f711a718253430926f18dfc1773b8294626d2))
- **fix:** Add the renamed photos and covers referenced by imported drafts ([160b531](https://github.com/AlexGalhardo/eletro/commit/160b531d8e2a437ea0562e3dad385091a1705885))

### Added

- Flag `showDrafts` (ou `SHOW_DRAFTS=1` no build): rascunhos aparecem no site como se publicados, na home, nas categorias, na busca e em `/<slug>`, com `noindex`. Sitemap, `llms.txt`, API e dashboard de links seguem só com os publicados.
- Feature flags: `content/flags.json` (versionado) e `/admin/flags` (página estática, vale para o GitHub Pages), com override por navegador.
- Prévia dos rascunhos em `/preview/<slug>`, com `noindex`, `Disallow` no `robots.txt` e fora do sitemap, do `llms.txt`, da API e do dashboard de links.
- Flag `allStoreButtons`: os cartões mostram os botões de Mercado Livre, Shopee e Amazon mesmo sem link real.
- `docs/post-status.md`, gerado por `bun run post-status`: cada post com draft, produtos, links de afiliado reais e pendentes (`#`). Um teste falha quando o arquivo fica desatualizado.
- Coluna "Links" e filtro "Links de afiliado" em `/admin/posts`.
- Importação em lote dos posts que faltam (`bun webscrapping/batch.ts [--write] [--limit N]`): compara os sitemaps da origem com o `ref` dos posts e importa como rascunho, em sequência e com pausa, sem copiar texto.
- Categorias Banheiro, Cama, Mesa e Banho, Iluminação, Infantil e Jardim.
- **feat:** Show drafts on the site as if published behind the showDrafts flag ([dead5a7](https://github.com/AlexGalhardo/eletro/commit/dead5a725c0e19a0690ea82a84812f787130266d))
- **content:** Add imported review drafts (6/6) ([9c29814](https://github.com/AlexGalhardo/eletro/commit/9c298142f1edfb2eaf916246bc00bfab2ae63b51))
- **content:** Add imported review drafts (5/6) ([3e5f265](https://github.com/AlexGalhardo/eletro/commit/3e5f2655a65044e121229c11af1be2be0b3e1399))
- **content:** Add imported review drafts (4/6) ([2d59ffe](https://github.com/AlexGalhardo/eletro/commit/2d59ffea99cab179b412320cadc434d65e05945b))
- **content:** Add imported review drafts (3/6) ([5ea9466](https://github.com/AlexGalhardo/eletro/commit/5ea9466bfe2beff79a22a8c4aa1e1da44737898b))
- **content:** Add imported review drafts (2/6) ([4fe4a0a](https://github.com/AlexGalhardo/eletro/commit/4fe4a0a532bd390d08ecb83b6b7a5909daa3725d))
- **content:** Add imported review drafts (1/6) ([a41fc30](https://github.com/AlexGalhardo/eletro/commit/a41fc30b3ff5c9db8edc039b96abbdbd387e3ea2))
- **feat:** Move home filters to a sidebar, show covers in search and soften corners ([6bd029d](https://github.com/AlexGalhardo/eletro/commit/6bd029d96e97717b35125b1d0869a856a834d0a0))
- **feat:** Add feature flags and noindex draft previews ([c4c7149](https://github.com/AlexGalhardo/eletro/commit/c4c71498715425e278a627561b97a029f97953b1))
- **feat:** Track post status and affiliate link counts ([c09f1bc](https://github.com/AlexGalhardo/eletro/commit/c09f1bc407e7429b40add12771a06dc511d769c9))
- **feat:** Import missing source posts in batch and keep one spec sheet per product ([491c66f](https://github.com/AlexGalhardo/eletro/commit/491c66f44311bd9a2316772b1cb73e175cff2572))

## [0.9.0] - 2026-11-09

O site público passa a ser Astro 7.4 no GitHub Pages.

### Added

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` e `SECURITY.md` na raiz do repositório.
- **BREAKING:** **feat:** Build the public site with Astro 7.4 and host it on GitHub Pages ([890acb0](https://github.com/AlexGalhardo/eletro/commit/890acb063e322a6253c9c5e36c2e498358ddff59))

### Changed

- O README segue o formato de referência do workspace.
- O pacote passa a se chamar `astro-blog-cms` (antes `sveltekit-blog-cms`).
- O site público passa a ser um build estático do Astro 7.4, com as mesmas páginas, o mesmo conteúdo e as ilhas Svelte 5. SvelteKit e o adaptador da Vercel saíram do projeto. A branch `legacy-sveltekit` guarda o código anterior.
- A produção de `eletroradar.com.br` passa a ser o GitHub Pages (`.github/workflows/pages.yml`). O Pages não executa painel, API de escrita, login, contato, newsletter nem cron; esse código continua coberto pelos testes.
- O corpo dos posts é renderizado com `marked`. `<CardsTable>` continua uma ilha Svelte.
- Uma URL desconhecida responde 404.
- **docs:** Record the open source files and the package rename in the changelog ([320563a](https://github.com/AlexGalhardo/eletro/commit/320563adb9652db06cc06b4b0ab96dfdc52d5ec2))
- **docs:** Restructure the README like the workspace reference ([f930ec8](https://github.com/AlexGalhardo/eletro/commit/f930ec87549f5729f1d0893a94e22ea5ee918bc0))
- **docs:** Add contributing, code of conduct and security policy ([d5ccf6a](https://github.com/AlexGalhardo/eletro/commit/d5ccf6a6754ffd30ba7becd0f4c65fc373a791c1))
- **chore:** Align the bun.lock workspace name with the package ([92e94b8](https://github.com/AlexGalhardo/eletro/commit/92e94b839086fff3fb9ce3bae7a973519442545c))
- **chore:** Rename the package to astro-blog-cms ([66e36cb](https://github.com/AlexGalhardo/eletro/commit/66e36cb7309ed46c79bb64740112cdc993af25d9))

### Fixed

- A URL canônica e o sitemap usam a barra final, que é o endereço em que o GitHub Pages responde 200.
- As leituras públicas da API são publicadas como `index.json`, servidas com `Content-Type: application/json` em `/api/v1/.../`.
- A documentação de operação descreve Astro 7.4 no GitHub Pages.
- Os testes e2e conferem o site estático: 404 no lugar do redirecionamento para a home, tela de login no painel e a API em JSON.
- **fix:** Serve canonical URLs and JSON reads on GitHub Pages ([4c33fa8](https://github.com/AlexGalhardo/eletro/commit/4c33fa88f9193d8048bf9cb68a3d237886d59f1a))

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
- **docs:** Review .claude rules and skills and drop the graphify hooks ([7dba89a](https://github.com/AlexGalhardo/eletro/commit/7dba89ab124db5ba761f23e2f53e4f9171b43a16))
- **docs:** Rewrite the README for the site as it runs today ([2440eb8](https://github.com/AlexGalhardo/eletro/commit/2440eb8401d897ab7d24a60b4649769d36c39bec))
- **chore:** Add agent setup docs, Docker infra and the four setup scripts ([20bbf21](https://github.com/AlexGalhardo/eletro/commit/20bbf21b94c1cc374525a1410ec292f93de6e9b5))

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
- **feat:** Validate environment variables at build time ([35c7743](https://github.com/AlexGalhardo/eletro/commit/35c7743003382d569fc0790e56104dc03807019a))
- **feat:** Fall back to the store address when the links dashboard is down ([db70af3](https://github.com/AlexGalhardo/eletro/commit/db70af32a20819ba746931b42d6beb1024d6b679))
- **admin:** Export the affiliate links as JSON or CSV for the links dashboard ([7cb3c64](https://github.com/AlexGalhardo/eletro/commit/7cb3c64f2eefe486f9b5e91be29f8f0371485675))
- **feat:** Route affiliate links through the links dashboard and register them on every build ([ce36014](https://github.com/AlexGalhardo/eletro/commit/ce36014f062854e0657ef2c1d00a2ead709d7ec9))
- **content:** Remove post melhor-aquecedor-a-oleo ([3cec300](https://github.com/AlexGalhardo/eletro/commit/3cec300ce4afc5d83a3382accf950937f2d4a246))
- **admin:** Render the cover and the product photos in the editors ([6d77393](https://github.com/AlexGalhardo/eletro/commit/6d77393b3130cf5b9aa8e1c6346de8852e9e83d2))
- **admin:** Show post covers, product photos and open a post's lists in a new tab ([095632c](https://github.com/AlexGalhardo/eletro/commit/095632cf792133caa6d872bb4dcb92d65fbdb95b))

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
- **home:** Hide categories without a published post from the filter and the footer ([e812d67](https://github.com/AlexGalhardo/eletro/commit/e812d6711a66931f9161162f7448b81393153214))
- **home:** Keep the category filter inside the content width ([cd3e787](https://github.com/AlexGalhardo/eletro/commit/cd3e7871502960ea129297d0383083015c766b28))
- **cms:** Retry GitHub server errors and report them as a GitHub failure ([f4e13f3](https://github.com/AlexGalhardo/eletro/commit/f4e13f3caf74119d872e555c64deba77f79fdb02))
- **import:** Fall back to a smaller Mistral model when the plan has no quota ([83b0088](https://github.com/AlexGalhardo/eletro/commit/83b00880c8bb538d270652569d90612ba46dca0b))
- **import:** Accept product photos hosted on the Mercado Livre image server ([70c70c0](https://github.com/AlexGalhardo/eletro/commit/70c70c07ebac70da8bfd12d359d187443f2b285c))

### Added

- **content:** Add post melhor-aquecedor-a-oleo ([d238149](https://github.com/AlexGalhardo/eletro/commit/d23814965ab6641ad84038527c400edcf1736839))
- **content:** Add product list melhor-aquecedor-a-oleo ([0ba2d81](https://github.com/AlexGalhardo/eletro/commit/0ba2d8111d7129d84e4d5a579462671bed872ca5))
- **content:** Add image melhor-aquecedor-a-oleo-cover.webp ([ac1e9b8](https://github.com/AlexGalhardo/eletro/commit/ac1e9b8121b136f3272cfa0e28737bb2c02d05c1))
- **content:** Add image melhor-aquecedor-a-oleo-7.jpg ([8360251](https://github.com/AlexGalhardo/eletro/commit/8360251ffd4f78f5e9a53d60fa5fcd9b5fcefe90))
- **content:** Add image melhor-aquecedor-a-oleo-6.jpg ([73a200a](https://github.com/AlexGalhardo/eletro/commit/73a200ab68c6c95a81679cda9b6d80f06ce3c2e4))
- **content:** Add image melhor-aquecedor-a-oleo-5.jpg ([3f3a204](https://github.com/AlexGalhardo/eletro/commit/3f3a2041dcdcc35baa1dcfc5ba058f28f8a2343e))
- **content:** Add image melhor-aquecedor-a-oleo-4.jpg ([020c11c](https://github.com/AlexGalhardo/eletro/commit/020c11c721559f01aa74b38efdb56890de3b32f1))
- **content:** Add image melhor-aquecedor-a-oleo-3.jpg ([4461a8c](https://github.com/AlexGalhardo/eletro/commit/4461a8c78a082cc9894d686d3e3970238920ba54))
- **content:** Add image melhor-aquecedor-a-oleo-2.jpg ([c3a137e](https://github.com/AlexGalhardo/eletro/commit/c3a137e4e7cb56f283403fd00ea5c8ff70cced10))
- **content:** Add image melhor-aquecedor-a-oleo-1.jpg ([c1bafaf](https://github.com/AlexGalhardo/eletro/commit/c1bafaf0653c82b354eca5df7b4d959be4c67443))
- **content:** Add image melhor-lanterna-vonder-7.jpg ([c687a57](https://github.com/AlexGalhardo/eletro/commit/c687a57770d03ad5bf8c674191241121bac2fdcc))
- **content:** Add image melhor-lanterna-vonder-6.jpg ([242bf17](https://github.com/AlexGalhardo/eletro/commit/242bf175bbf773c02618fc547e60ba8cb8dd87c2))
- **content:** Add image melhor-lanterna-vonder-5.jpg ([d218eab](https://github.com/AlexGalhardo/eletro/commit/d218eab1795051b4edc30bc34d0cea722e9ca8c7))
- **content:** Add image melhor-lanterna-vonder-4.jpg ([d945f1d](https://github.com/AlexGalhardo/eletro/commit/d945f1dca3bbee035e0f003722576caa7e64271b))
- **content:** Add image melhor-lanterna-vonder-3.jpg ([a61555c](https://github.com/AlexGalhardo/eletro/commit/a61555cf607f45d44930fcbabf1d911b5feb128e))
- **content:** Add image melhor-lanterna-vonder-2.jpg ([fc9af0c](https://github.com/AlexGalhardo/eletro/commit/fc9af0c04feb77ada1a51815f45ab467892981af))
- **content:** Add image melhor-lanterna-vonder-1.jpg ([4d0cd0d](https://github.com/AlexGalhardo/eletro/commit/4d0cd0d0be3f100bddb53da64f9e67d59d0ebc7a))

### Changed

- **style:** Build the closing script tag without string concatenation ([38b7e1b](https://github.com/AlexGalhardo/eletro/commit/38b7e1b26b1cbb3bac15b5defae5ca5c3484ffc8))

## [0.6.0] - 2026-10-07

Painel no celular, Search Console e a primeira versão estável.

### Changed

- Primeira versão estável: o projeto sai do release candidate. A partir daqui vale o SemVer comum (`feat` sobe a minor, `fix` e os demais tipos sobem a patch).
- Excluir uma lista de produtos não é mais recusado quando um post a usa: os posts que mostram a lista perdem o `<CardsTable>` dela e viram rascunho, e a confirmação avisa quais são.
- Painel `/admin` no celular: a navegação fica atrás de um menu hambúrguer, em vez de ocupar meia tela no topo.
- **docs:** Leave the release candidate ([82a899c](https://github.com/AlexGalhardo/eletro/commit/82a899cf4451c41a7e85970af578137f3d6bd290))
- Merge pull request #4 from AlexGalhardo/ccr-3e119613-1rgj9m-admin ([660bc12](https://github.com/AlexGalhardo/eletro/commit/660bc1296ba5442cc5d831074c5e076c5e151a5d))
- Merge pull request #3 from AlexGalhardo/ccr-3e119613-1rgj9m ([2d2f1fb](https://github.com/AlexGalhardo/eletro/commit/2d2f1fb52a3fdb334d29afc06f755605e07f6de4))

### Added

- `robots.txt`: sinal de uso do conteúdo (`Content-Signal: search=yes, ai-input=yes, ai-train=no`) e bloqueio dos robôs de coleta em massa e de treino de IA listados em `site.blockedCrawlers`. Buscadores e assistentes que abrem a página para responder a alguém continuam liberados. A mesma regra está escrita no `llms.txt` e nos Termos de Uso (`site.contentPolicy`).
- `/admin/products` mostra em quais posts cada lista é usada, com filtro "Em uso" e "Sem uso"; `/admin/posts` ganhou a coluna "Produtos", com link para cada lista do post; o editor da lista mostra os posts que a usam.
- `/admin/media`: o botão "Copiar link" copia o endereço completo da imagem no servidor em uso (por exemplo `https://eletroradar.com.br/images/posts/foto.jpg`) com o clipboard.js e abre um aviso "Link copiado".
- Tela `/admin/google`: cliques, impressões, CTR e posição do Google Search Console, usuários, sessões e visualizações do Google Analytics 4 (últimos 28 dias), a lista de sitemaps e o botão "Reenviar sitemap ao Google" (`POST /api/v1/google/sitemap`). A configuração da conta de serviço está em `docs/google-console-analytics-setup.md`.
- Categoria "Cuidados Pessoais" (`cuidados-pessoais`).
- Botão "Excluir lista" no editor de produtos e `DELETE /api/v1/products/{list}`: apaga a lista inteira de uma vez. A exclusão é recusada enquanto algum post mostra a lista com `<CardsTable>`, porque o build quebraria.
- **seo:** Refuse training crawlers and state the content policy in robots.txt ([402238f](https://github.com/AlexGalhardo/eletro/commit/402238f5031532a80a9f7e759385af8bff8b145a))
- **admin:** Link posts and product lists and unpublish posts of a deleted list ([f5a872f](https://github.com/AlexGalhardo/eletro/commit/f5a872f1c12dd13dba740007ec81062e549c32ea))
- **admin:** Copy the full image link with clipboard.js and confirm it in a dialog ([0b08007](https://github.com/AlexGalhardo/eletro/commit/0b08007e4915a393f5f684af15e57f437d4421b8))
- **admin:** Show Google Search Console and Analytics data and resubmit the sitemap ([a0adce3](https://github.com/AlexGalhardo/eletro/commit/a0adce3146695d46c620df5d0c15651926da24da))
- **content:** Remove post melhor-lava-loucas-portatil ([f0af8c8](https://github.com/AlexGalhardo/eletro/commit/f0af8c8812e3e09e1a6d1526270426a2605b6615))
- **content:** Remove post melhor-fogao-dako ([27a0d60](https://github.com/AlexGalhardo/eletro/commit/27a0d606dc4c3ab65b008e702c3ad3bebd135fd8))
- **content:** Remove product list melhor-maquina-de-sorvete ([d683ba3](https://github.com/AlexGalhardo/eletro/commit/d683ba3ddf92bb5d39fded333439a46230e93ae4))
- **admin:** Delete a whole product list at once ([37489f9](https://github.com/AlexGalhardo/eletro/commit/37489f9cb7632fdab92d21b1a147718d8a3b3fa0))
- **admin:** Collapse the dashboard navigation into a hamburger menu on phones ([9a8cb2c](https://github.com/AlexGalhardo/eletro/commit/9a8cb2c6cc64724e7ee2aca226ae399bf58aea7f))
- **content:** Add post melhor-fogao-dako ([86e6046](https://github.com/AlexGalhardo/eletro/commit/86e60463c6a7c44ec11f9c08143faf89d782dd30))
- **content:** Add product list melhor-fogao-dako ([f55b976](https://github.com/AlexGalhardo/eletro/commit/f55b976c8c077131302cc732beab0b04cbadad2b))
- **content:** Add image melhor-fogao-dako-7.jpg ([82f54b2](https://github.com/AlexGalhardo/eletro/commit/82f54b2fd51aef0efee175552413f062c41d2bb5))
- **content:** Add image melhor-fogao-dako-6.jpg ([9d3b6ca](https://github.com/AlexGalhardo/eletro/commit/9d3b6caf76ab01da5382e45b02188cb5d8416c08))
- **content:** Add image melhor-fogao-dako-5.jpg ([9c1c970](https://github.com/AlexGalhardo/eletro/commit/9c1c9700bb0e40f3e5f1a5b6f8a5fb1ecf78649b))
- **content:** Add image melhor-fogao-dako-4.jpg ([f7d44a7](https://github.com/AlexGalhardo/eletro/commit/f7d44a75636ae8f338579cac6177bcb7f35dbbf9))
- **content:** Add image melhor-fogao-dako-3.jpg ([221673c](https://github.com/AlexGalhardo/eletro/commit/221673cab59d9acbf5f3611e6d6a328acd4bcdb5))
- **content:** Add image melhor-fogao-dako-2.jpg ([81db784](https://github.com/AlexGalhardo/eletro/commit/81db784f5cdbe3e78535d5816f0124898c2fffc4))
- **content:** Add image melhor-fogao-dako-1.jpg ([7f2b3cb](https://github.com/AlexGalhardo/eletro/commit/7f2b3cbd62bcdbdbf801671a2716fbe25e3e02d5))
- **content:** Remove post melhor-maquina-de-sorvete ([2fd10e1](https://github.com/AlexGalhardo/eletro/commit/2fd10e1ef428b74d2e16356303d92d2a0596fd00))
- **content:** Remove post melhor-cafeteira-eletrica-mondial ([698bbaf](https://github.com/AlexGalhardo/eletro/commit/698bbaf0d1b94e6de4486afcf2ddeebb1086ec8c))
- **content:** Add post melhor-maquina-de-sorvete ([4162899](https://github.com/AlexGalhardo/eletro/commit/41628992c21358cb42d8799e4648b0ae6eb31979))
- **content:** Add product list melhor-maquina-de-sorvete ([b24e39b](https://github.com/AlexGalhardo/eletro/commit/b24e39b185a9c351e54d0a1490c7e780c69e34ae))
- **content:** Add image melhor-maquina-de-sorvete-7.jpg ([05c15e4](https://github.com/AlexGalhardo/eletro/commit/05c15e4639d63bd1fa2222f6e21c4fd81d16f831))
- **content:** Add image melhor-maquina-de-sorvete-6.jpg ([09a60bc](https://github.com/AlexGalhardo/eletro/commit/09a60bc5735426cb09c3f4e31dee956624c69129))
- **content:** Add image melhor-maquina-de-sorvete-5.jpg ([2a3ae31](https://github.com/AlexGalhardo/eletro/commit/2a3ae31c5c0204c8d39475cc0a0910be630b842f))
- **content:** Add image melhor-maquina-de-sorvete-4.jpg ([bcbba78](https://github.com/AlexGalhardo/eletro/commit/bcbba78962892579f4bcc3d0430bdbb9f130ee60))
- **content:** Add image melhor-maquina-de-sorvete-3.jpg ([f8be2d7](https://github.com/AlexGalhardo/eletro/commit/f8be2d74d3fff880c9b89135afad6733503be7e7))
- **content:** Add image melhor-maquina-de-sorvete-2.jpg ([8f2ce07](https://github.com/AlexGalhardo/eletro/commit/8f2ce078d3e9372875fc542c60c96edd3ddbdeb8))
- **content:** Add image melhor-maquina-de-sorvete-1.jpg ([8a643da](https://github.com/AlexGalhardo/eletro/commit/8a643da9f1d60e22c3cb96349ea89b536b312578))

### Fixed

- Importação (`/admin/import`): reviews da seção `cuidados-pessoais` da origem eram recusadas porque o site não tinha a categoria.
- Teste de integração da importação no Windows: a capa era aberta pelo caminho e ficava travada na limpeza.
- Build na Vercel: o `opentype.js` (capa da importação) passou a ser importado pelo export padrão, porque o Node carrega a versão CommonJS do pacote, que não tem exports nomeados.
- **import:** Accept the cuidados-pessoais category of the source site ([662d39c](https://github.com/AlexGalhardo/eletro/commit/662d39c19b422357a93b917a2837c0044263feeb))
- **import:** Load opentype.js through its default export ([9ca7087](https://github.com/AlexGalhardo/eletro/commit/9ca7087b4fd5e085536e15bccf2c6dec5ea5650b))

## [0.5.0] - 2026-10-07

A importação reescreve o texto com a Mistral e monta a capa do post.

### Changed

- Capa gerada na importação: os produtos aparecem recortados, sem o fundo branco das fotos e sem os cartões brancos, ocupando mais espaço.
- Merge pull request #2 from AlexGalhardo/ccr-3e119613-1rgj9m-cover ([2ca64aa](https://github.com/AlexGalhardo/eletro/commit/2ca64aae2f6463a45616a579a81fa87e986579d7))
- Merge pull request #1 from AlexGalhardo/ccr-3e119613-1rgj9m ([4bfc714](https://github.com/AlexGalhardo/eletro/commit/4bfc714c942c3683c86ee6769a160f21d314bbc2))

### Added

- Importação (`/admin/import`): o rascunho já sai com capa, montada com 3 fotos dos produtos sobre um fundo de cor clara aleatória e o endereço do site em negrito no canto inferior direito.
- Importação (`/admin/import`): o resumo e o FAQ da página de origem são reescritos pela API da Mistral (`MISTRAL_API_KEY`) e viram a descrição, a introdução e o FAQ do rascunho. Sem a chave, ou com falha da API, o rascunho fica com o texto genérico e a tela mostra o motivo.
- **import:** Cut product photos out of their white background on the cover ([6737815](https://github.com/AlexGalhardo/eletro/commit/67378157815fe037fab158a90675295b38ebe051))
- **import:** Generate the post cover from three product photos ([b823686](https://github.com/AlexGalhardo/eletro/commit/b8236862a4afdd5a2a7364d934cea85e9d783a70))
- **import:** Rewrite source summary and FAQ with Mistral ([2fa1bef](https://github.com/AlexGalhardo/eletro/commit/2fa1bef7afe23cd3a099a9919fe86a772cf2f8eb))
- **content:** Add post melhor-cafeteira-eletrica-mondial ([73352f7](https://github.com/AlexGalhardo/eletro/commit/73352f7524a75f95dc765bdde668b83d2f4b6803))
- **content:** Add product list melhor-cafeteira-eletrica-mondial ([a8ea2ad](https://github.com/AlexGalhardo/eletro/commit/a8ea2ad205f3020a8b9618dc581df8fdceee1992))
- **content:** Add image melhor-cafeteira-eletrica-mondial-7.jpg ([34f7e2f](https://github.com/AlexGalhardo/eletro/commit/34f7e2f7cf085e67b327d29797a55f42cb280604))
- **content:** Add image melhor-cafeteira-eletrica-mondial-6.jpg ([96fa2f3](https://github.com/AlexGalhardo/eletro/commit/96fa2f32d3e1904c3f7c4076caeabc9ad12ae08f))
- **content:** Add image melhor-cafeteira-eletrica-mondial-5.jpg ([a737cac](https://github.com/AlexGalhardo/eletro/commit/a737cac5ee56566dee269f4c9fe9a6c6bfff8ea7))
- **content:** Add image melhor-cafeteira-eletrica-mondial-4.jpg ([8264d74](https://github.com/AlexGalhardo/eletro/commit/8264d7494fd5fb738135cca61315a94ff4ab1d3b))
- **content:** Add image melhor-cafeteira-eletrica-mondial-3.jpg ([a88969a](https://github.com/AlexGalhardo/eletro/commit/a88969acebe3ebb193eb531cf78cf86565c97a7d))
- **content:** Add image melhor-cafeteira-eletrica-mondial-2.jpg ([4256706](https://github.com/AlexGalhardo/eletro/commit/4256706f7f6a8e0f3399d081611f04e31b91f642))
- **content:** Add image melhor-cafeteira-eletrica-mondial-1.jpg ([6f8176d](https://github.com/AlexGalhardo/eletro/commit/6f8176d1b142eebf7216a46766d9c9c5a0f080a9))

## [0.4.0] - 2026-10-06

Login com Google, tema do painel e o registro do deploy de produção.

### Added

- Botão de tema claro/escuro no cabeçalho do painel, com a mesma preferência do site público.
- Login do painel pelo Google, ao lado do GitHub. `ADMIN_EMAILS` lista os e-mails permitidos; só vale e-mail verificado pelo provedor.
- **feat:** Add the light and dark theme toggle to the admin header ([2ec817d](https://github.com/AlexGalhardo/eletro/commit/2ec817dcfff93f3763861d2dd603dd62ff78c492))
- **feat:** Add Google sign-in to the admin ([14421e3](https://github.com/AlexGalhardo/eletro/commit/14421e3c7544c0d6db49a40ea259251b028acc29))

### Fixed

- Salvar, enviar imagem ou importar em um deploy sem `GITHUB_TOKEN` respondia erro 500 genérico. Agora responde 503 `content_store_unavailable` e o painel diz quais variáveis faltam.
- **fix:** Answer 503 with the missing variables when the content store cannot write ([6192824](https://github.com/AlexGalhardo/eletro/commit/61928245d3b98d763f9e033dc0deefb8ad805ff4))

### Changed

- **docs:** Record the production deploy on Vercel in the plan ([e39b4bd](https://github.com/AlexGalhardo/eletro/commit/e39b4bdd6f78a62f14ca5461733181783ed31a2b))
- **test:** Keep the e2e server away from the services of a local .env ([c6601af](https://github.com/AlexGalhardo/eletro/commit/c6601af05deb3d81a6bc7bb0ec30ce6ab7a2b7fa))

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
- **chore:** Ignore the agent skills installed by the Neon integration ([623e46b](https://github.com/AlexGalhardo/eletro/commit/623e46bf586a0df8cb062d486bc0770e08d415ee))
- **docs:** Correct the Lighthouse findings and record the container e2e run ([d8af296](https://github.com/AlexGalhardo/eletro/commit/d8af296e639d69ed3dbcf63bd1255c488c56292a))

### Fixed

- Login pelo GitHub recusava todo mundo com `unable_to_create_user`: o `better-auth` descartava o login do perfil antes da conferência da lista de administradores.
- Segundo build na Vercel falhava com `ERR_PACKAGE_PATH_NOT_EXPORTED` em `estree-walker`: o `adapter-auto` instalava o adaptador durante o build, por cima do cache.
- `vercel.json` tinha um bloco de cabeçalhos aninhado fora do schema, que faria a Vercel recusar o deploy.
- **fix:** Let GitHub sign-in create the admin account ([3e60d89](https://github.com/AlexGalhardo/eletro/commit/3e60d89e336bd312f41cfe6d8fb608b9ca2f4357))
- **fix:** Keep long product spec labels from overlapping their values ([d2c7497](https://github.com/AlexGalhardo/eletro/commit/d2c749725b785888111131a5b32853de8cd32361))
- **fix:** Build on Vercel with adapter-vercel and pin Node 24 ([0ade2fe](https://github.com/AlexGalhardo/eletro/commit/0ade2fe63e8f451d283629a78686c3c01aa8947d))
- **fix:** Remove the nested header block that made vercel.json invalid ([1105c63](https://github.com/AlexGalhardo/eletro/commit/1105c63ac0374ee62fa85440a2a3e2c590f1949f))

### Added

- Cron da Vercel em `vercel.json`: a fila da newsletter roda a cada 15 minutos (exige plano Pro e `CRON_SECRET`).
- `.vercelignore`: `vercel deploy` a partir da pasta de trabalho não envia mais `.env`, `.data` nem pastas geradas.
- Scripts `setups/setup-unix.sh` e `setups/setup-windows.sh`: conferem Node e Bun, instalam as dependências, criam o `.env` com os padrões do painel, liberam a porta e sobem o servidor de desenvolvimento.
- `docs/setup-vercel.md`: passo a passo do deploy na Vercel, com conferência e problemas comuns.
- **feat:** Make every commit a release ([8f68abd](https://github.com/AlexGalhardo/eletro/commit/8f68abdac81ff5461bfe0bf16639e1117d1ffa56))
- **feat:** Run the newsletter queue every 15 minutes with a Vercel cron ([20be4a1](https://github.com/AlexGalhardo/eletro/commit/20be4a1a49ef8e026a6ec1f29472385cfe8d46b3))
- **feat:** Redirect unknown pages to the home page ([a22bb56](https://github.com/AlexGalhardo/eletro/commit/a22bb56416cd1a9edff1bfe77668dc6d34fbce7d))
- **feat:** Add setup scripts and the Vercel setup guide ([83e26bd](https://github.com/AlexGalhardo/eletro/commit/83e26bd41adaf48da98262bbc757bddd60b494a2))

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
- **feat:** Import a draft post from the source site by web scraping ([4f99cc7](https://github.com/AlexGalhardo/eletro/commit/4f99cc705da9fb7fdffd733b9810550629b74813))
- **feat:** Add post import by web scraping to the admin ([82795f3](https://github.com/AlexGalhardo/eletro/commit/82795f383c3b05b5cc8f2dc35a5b3becf34b3f9a))
- **content:** Add draft post melhor-lava-loucas-portatil ([7757fff](https://github.com/AlexGalhardo/eletro/commit/7757fff5aa3adef935da865ceaaa7ba5099ce88b))
- **feat:** Add the newsletter with double opt-in and post announcements ([84d3ac8](https://github.com/AlexGalhardo/eletro/commit/84d3ac8a25c44d13acd6b468d31b15b2ef8bfdb2))
- **feat:** Add the admin dashboard for posts, products and media ([0b2e2ea](https://github.com/AlexGalhardo/eletro/commit/0b2e2eaed77119147701627d031e5a55995d7943))
- **feat:** Add the /api/v1 REST API for posts, products and media ([d443b5f](https://github.com/AlexGalhardo/eletro/commit/d443b5f5c0dd24b693d2b581ac4ccbaae866348b))
- **feat:** Add the admin login, panel layout and test login ([6639e70](https://github.com/AlexGalhardo/eletro/commit/6639e701f195229f95f65331eec2cdefe486909e))
- **feat:** Add the server foundation for the admin CMS ([8fb0a0f](https://github.com/AlexGalhardo/eletro/commit/8fb0a0ff0dea56a64d683896965583e3093a1627))

### Changed

- Verde e cinza do tema claro um tom mais escuros no logotipo, nos botões e nos títulos do rodapé, para atender ao contraste AA.
- Produto ainda sem foto (imagem `#`) não mostra mais uma imagem quebrada.
- A Política de Privacidade passa a dizer que o e-mail é guardado para quem se inscreve na newsletter.
- Páginas do painel não carregam os scripts de analytics.
- **release:** V1.0.0-rc.1 ([0d1a16e](https://github.com/AlexGalhardo/eletro/commit/0d1a16e95e58447be54ab1a7edcc758c35e4db6f))
- **docs:** Record the release candidate checks and what is left for 1.0.0 ([4ea5912](https://github.com/AlexGalhardo/eletro/commit/4ea5912ecfd367c06802ba127e9f0c67bf07d4d4))
- **docs:** Use headings for the README feature groups ([624cf32](https://github.com/AlexGalhardo/eletro/commit/624cf32bb87db33cc05c389c46566c0f1057fa64))
- **docs:** Write the README, the deploy guide and the project skills ([c85795e](https://github.com/AlexGalhardo/eletro/commit/c85795e434b76f0fa24632ff6d8a84a931b8248b))
- **perf:** Serve covers in three widths and meet AA contrast ([70b97d7](https://github.com/AlexGalhardo/eletro/commit/70b97d723f98f274434281b20b2d616090325fcf))
- **docs:** Record the local simulation of the CI and release workflows ([5d16e88](https://github.com/AlexGalhardo/eletro/commit/5d16e887d68b9c8798758709625880a74619f7af))
- **test:** Serve the e2e build on an explicit IPv4 address ([4b2d78b](https://github.com/AlexGalhardo/eletro/commit/4b2d78b54c27eb8464e8bfabd65ba1ae18c40d3d))
- **ci:** Add the CI and release workflows, still disabled ([6d090e1](https://github.com/AlexGalhardo/eletro/commit/6d090e11ad1b7a7200295c32db53d8604457bfb1))
- **chore:** Stop tracking agent worktrees ([277ef0e](https://github.com/AlexGalhardo/eletro/commit/277ef0e47351a3b9e040666ef30e2b9c5085dba7))
- **docs:** Check the current OWASP Top Ten in the security skill ([92fe8b6](https://github.com/AlexGalhardo/eletro/commit/92fe8b629063096b724281b94253475d9b7648cb))

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
- **fix:** Close the post body gate bypass and harden the admin and newsletter ([60de625](https://github.com/AlexGalhardo/eletro/commit/60de625ee2273865488083eaf60a51317730d12f))
- **fix:** Load more posts after a jump to the end of the home page ([aa52727](https://github.com/AlexGalhardo/eletro/commit/aa52727c2daa8fd38833cd2c55130ec19da4befa))

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
- **feat:** Rewrite the public site in SvelteKit 3 ([755c4aa](https://github.com/AlexGalhardo/eletro/commit/755c4aaadaa0f4bf571905a59ab4e38f92aed4f7))

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

[Unreleased]: https://github.com/AlexGalhardo/eletro/compare/v0.10.0...HEAD
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
