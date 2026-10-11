# Arquitetura

## Stack

| Camada | Escolha |
|---|---|
| Framework | SvelteKit 3, Svelte 5 (runes), Vite 8 |
| Markdown | mdsvex (arquivos `.mdx`) |
| Estilo | Tailwind CSS 4 |
| Validação | zod |
| Banco | Postgres (Neon) com Drizzle ORM; PGlite embutido em desenvolvimento e testes |
| Autenticação | better-auth com login pelo GitHub |
| E-mail | Resend + react-email |
| Importação | `fetch` + cheerio (`webscrapping/`) |
| Imagens | sharp, só no build, para as cópias das capas |
| Hospedagem | Vercel, via `adapter-vercel` (Netlify exige trocar o adaptador) |
| Qualidade | Biome, markdownlint, svelte-check, Vitest, Playwright |

## Duas metades

- **Site público** (`src/routes/(site)/`): pré-renderizado no build a partir dos arquivos de `content/`. Não toca no banco nem em serviço externo, com duas exceções que são chamadas de API feitas pelo navegador: o formulário de contato e a newsletter.
- **Painel e API** (`src/routes/admin/`, `src/routes/api/`): rodam em função serverless. Leem e gravam o conteúdo pelo `ContentStore` (commits no GitHub em produção, disco local em desenvolvimento) e usam o banco para sessões e newsletter.

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
  sync-links.ts             valida e registra os links de afiliado, antes de todo build
  cover-variants.ts         cópias redimensionadas das capas, no build
setups/                     scripts que preparam a máquina e sobem o projeto, local ou em Docker
infra/                      Dockerfile e docker-compose do build de produção em container
.dockerignore               o que fica fora da imagem (o contexto do build é a raiz)
webscrapping/               leitura de um post de outro site (busca, parser, rascunho)
src/
  app.html, app.css         casca HTML e estilos globais
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
.github/workflows-disabled/ CI e release, inativos
vercel.json                 cabeçalhos e cache na Vercel
docs/                       esta documentação
```

## Fluxo de uma página de post

1. No build, `src/lib/server/content.ts` importa todos os `.mdx` como texto (`import.meta.glob` com `?raw`), valida o frontmatter com zod e monta a lista de posts publicados.
2. `routes/(site)/[slug]/+page.server.ts` devolve os metadados do post e as listas de produtos que o corpo referencia.
3. `routes/(site)/[slug]/+page.ts` importa o componente compilado daquele `.mdx` (um chunk por post).
4. `+page.svelte` renderiza o componente e publica as listas de produtos por contexto; o `<CardsTable>` dentro do Markdown lê esse contexto.
5. O pré-processador `injectContentComponents` insere o `import` do `CardsTable` antes de o mdsvex compilar, para o post não precisar declará-lo.

Todas as rotas em `(site)` têm `prerender = true`: o resultado é HTML estático.

## Decisões

| Decisão | Motivo |
|---|---|
| Conteúdo em arquivos, não em banco | Markdown como fonte da verdade, histórico pelo Git, site estático |
| Metadados lidos do texto bruto, componente lido do mdsvex | O servidor precisa do frontmatter e da contagem de palavras sem carregar 64 componentes; o navegador só baixa o post aberto |
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
