# Arquitetura

## Stack

| Camada | Escolha |
|---|---|
| Framework | Astro 7.4 (`output: "static"`) e TypeScript |
| Markdown | `marked` no build (`src/lib/content/render-body.ts`); arquivos `.mdx` |
| Estilo | Tailwind CSS 4 |
| Validação | zod |
| Banco | Postgres (Neon) com Drizzle ORM; PGlite embutido em desenvolvimento e testes |
| Autenticação | better-auth com login pelo GitHub |
| E-mail | Resend + react-email |
| Importação | `fetch` + cheerio (`webscrapping/`) |
| Imagens | sharp, só no build, para as cópias das capas |
| Hospedagem | GitHub Pages, pelo workflow `.github/workflows/pages.yml`. O Pages só serve os arquivos de `dist/` |
| Qualidade | Biome, markdownlint, TypeScript (`tsc --noEmit`), Vitest, Playwright |

## Duas metades

- **Site público** (`src/pages/` + `src/routes/(site)/`): HTML estático gerado no build a partir dos arquivos de `content/`. O formulário de contato e a newsletter chamam a API no navegador; o GitHub Pages não executa essas rotas.
- **Painel e API** (`src/routes/admin/`, `src/routes/api/`): o código segue no repositório e os testes chamam essas funções. No Pages, `/admin` entrega a tela de login estática. Leitura pública de posts e produtos sai como JSON no build. Escrita, sessão e e-mail não rodam no host.

O elo entre as duas é o Git: o painel faz um commit, a plataforma refaz o build, e o site novo sai com o conteúdo novo.

## Pastas

```text
content/
  posts/<slug>.mdx          posts; o nome do arquivo é a URL
  products/<lista>.json     listas de produtos usadas pelo <CardsTable>
static/                     imagens e arquivos servidos como estão
  _headers                  cabeçalhos das páginas estáticas na Netlify
drizzle/                    migrations SQL do banco
scripts/
  release.ts                versão e changelog a partir dos commits
  check-env.ts              confere as variáveis de ambiente, no começo de todo build
  sync-links.ts             valida e registra os links de afiliado, antes de todo build
  cover-variants.ts         cópias redimensionadas das capas, no build
setups/                     scripts que preparam a máquina e sobem o projeto, local ou em Docker
infra/                      Dockerfile e docker-compose do build de produção em container
.dockerignore               o que fica fora da imagem (o contexto do build é a raiz)
webscrapping/               leitura de um post de outro site (busca, parser, rascunho)
src/
  app.css                   estilos globais
  layouts/, pages/          HTML do Astro (o site que o Pages publica)
  env.ts                    declaração das variáveis de ambiente
  hooks.server.ts           guarda do /admin, limite de requisições, cabeçalhos
  lib/
    site.config.ts          identidade do site (nome, URL, autores, categorias)
    content/                schema, parser, validação do corpo, capas
    components/             componentes do site público
    admin/                  componentes e cliente da API usados pelo painel
    seo/                    JSON-LD e URLs absolutas
    server/                 código só de servidor
      content.ts            conteúdo empacotado no build (o que o site publica)
      cms.ts, store/        regras e armazenamento do conteúdo editável
      auth.ts, db/          autenticação e banco
      newsletter.ts, mailer.ts, emails/
      api.ts, openapi.ts    apoio à API REST e sua descrição
      post-import.ts        importação de rascunho
  routes/
    (site)/                 páginas públicas, com cabeçalho e rodapé
    admin/                  painel
    api/v1/                 API REST
    api/test/               login de testes (só com o banco local)
    sitemap.xml, robots.txt, llms.txt
tests/
  unit/, integration/       Vitest
  e2e/                      Playwright (smoke e e2e)
.github/workflows/pages.yml  deploy do site estático no GitHub Pages
.github/workflows-disabled/ CI e release, inativos
docs/                       esta documentação
```

## Fluxo de uma página de post

1. No build, `src/lib/server/content.ts` importa todos os `.mdx` como texto (`import.meta.glob` com `?raw`), valida o frontmatter com zod e monta a lista de posts publicados.
2. `src/pages/[slug].astro` gera uma página por post publicado. `renderPostBody` quebra o Markdown em HTML e em ilhas `<CardsTable>`.
3. `src/routes/(site)/[slug]/page.astro` recebe esses trechos e renderiza o `<CardsTable>` com a lista do trecho. No desktop o texto ocupa três quartos da largura e uma coluna à direita lista até cinco outras postagens, com a capa em cima e o texto embaixo (a mesma categoria primeiro). No celular essa lista fica abaixo do texto.

O resultado é HTML estático em `dist/`.

## Decisões

| Decisão | Motivo |
|---|---|
| Conteúdo em arquivos, não em banco | Markdown como fonte da verdade, histórico pelo Git, site estático |
| Metadados e corpo lidos do texto bruto | O build precisa do frontmatter, da contagem de palavras e do HTML sem compilar cada post como página |
| Produtos por contexto, não importados no componente | Render no servidor (bom para SEO) sem enviar todas as listas ao navegador |
| Ordem dos produtos embaralhada só no navegador | Mantém o rodízio do site original sem tornar o HTML do servidor instável |
| JSON-LD no HTML do servidor | No site original era injetado por JavaScript; assim os buscadores leem sem executar script |
| Ícones de marca como dados SVG em `src/lib/icons/icons.ts` | Mesmo desenho do site original sem depender de biblioteca de ícones React |
| Analytics desligado em desenvolvimento | Tráfego local não polui os relatórios |
| Variáveis de ambiente todas opcionais | Um clone novo roda sem configuração |
| Dois caminhos de leitura do conteúdo | O site lê o que foi empacotado no build (`content.ts`); o painel lê o que está no repositório agora (`cms.ts` + store). A diferença entre os dois é o que está "aguardando deploy" |
| Escrita só pela API `/api/v1` | As telas do painel não têm um caminho próprio de gravação: validação e autorização ficam em um lugar |
| Status do deploy por hash do arquivo | Funciona igual em qualquer plataforma, sem chamar a API de nenhuma |

## Limites conhecidos

- Post com data futura só aparece depois de um novo build nessa data.
- O índice de busca (título e slug de todos os posts) é enviado em toda página. Adequado até algumas centenas de posts.
- As páginas Sobre, Termos e Privacidade são rotas Svelte com texto próprio do EletroRadar; ainda não são conteúdo editável.
- O painel depende de um deploy por commit: sem integração de deploy contínuo com o repositório, o conteúdo salvo não chega ao site.
- Limites do painel, da API, da newsletter e da importação estão nos documentos de cada um.
