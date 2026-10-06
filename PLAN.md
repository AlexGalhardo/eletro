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
| Framework | SvelteKit 3 + Svelte 5 (runes) + Vite 8, `adapter-auto` (Vercel e Netlify) |
| Conteúdo | Arquivos no repositório: `content/posts/*.mdx` (mdsvex) e `content/products/*.json`. Site público pré-renderizado no build |
| Escrita pelo admin | Commit via API do GitHub com `GITHUB_TOKEN` (token fine-grained restrito a um repositório), assinado com o nome de quem logou; o deploy publica em 1 a 2 min. Em dev e testes, grava no disco local |
| Autenticação | better-auth com login GitHub, restrito à lista `ADMIN_GITHUB_USERS`; sessões no Postgres |
| Banco | Postgres Neon + Drizzle ORM (auth e newsletter). PGlite em dev e testes, sem Docker |
| Newsletter | Double opt-in, descadastro em um clique, e-mails com react-email enviados pelo Resend. Disparo fica pendente até a URL do post responder 200 |
| API REST | `/api/v1`: leitura pública de posts, categorias e produtos; escrita exige sessão de admin |
| Estilo | Tailwind CSS 4, mesmas classes do site atual; identidade concentrada em `src/lib/site.config.ts` |
| Qualidade | Vitest (unitário e integração), Playwright (smoke e e2e), svelte-check, Biome v2, markdownlint |
| Releases | `CHANGELOG.md` em Keep a Changelog; script de release calcula o bump pelos Conventional Commits. Commits `content:` não geram release |
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

**Assert:** e2e — visitante anônimo em `/admin` e `/admin/posts` cai em `/admin/login`; usuário fora da lista é recusado; API de escrita sem sessão responde 401. (Os dois primeiros verificados em 2026-10-06; o 401 da API de escrita será verificado em B5, quando a rota existir.)

### B3. Camada de conteúdo com escrita

- [x] `ContentStore` com implementação GitHub (commits) e disco local (dev e testes)
- [x] Criar, editar, despublicar e excluir post; criar e editar lista de produtos; upload de imagem (`src/lib/server/cms.ts`)
- [x] Validação do corpo do post contra tudo o que o mdsvex trataria como código, para um post nunca quebrar o deploy
- [x] Mensagens de commit `content: ...` e tratamento de conflito de versão (SHA)

**Assert:** testes de integração do store local cobrindo o ciclo completo; teste do store GitHub com a API simulada, incluindo conflito 409.

### B4. Dashboard `/admin`

- [ ] Painel inicial: totais de posts, rascunhos, agendados, assinantes e últimos commits de conteúdo
- [ ] Lista de posts com busca, filtro e status
- [ ] Editor de post: campos do frontmatter, Markdown com preview, FAQ, capa, seleção da lista de produtos
- [ ] Editor de produtos em formulário: dados, links de afiliado, vantagens, ficha técnica, ordem
- [ ] Biblioteca de mídia com upload
- [ ] Indicador de status do deploy após salvar

**Assert:** e2e — admin cria uma review nova (post, lista com dois produtos, capa) só pelo navegador e ela aparece na home e na URL própria após o rebuild.

### B5. API REST `/api/v1`

- [ ] `GET` posts (paginação, categoria, busca), post por slug, categorias, listas de produtos, saúde
- [ ] `POST`/`PUT`/`DELETE` de posts e produtos com sessão de admin
- [ ] Erros em formato único, validação zod, CORS de leitura, limite de requisições
- [ ] `openapi.json` e `docs/api.md`

**Assert:** testes de integração de todo endpoint (200, 400, 401, 404); `openapi.json` validado.

### B6. Newsletter

- [ ] Tabelas de assinantes e de envios
- [ ] Formulário de inscrição no site, confirmação por e-mail, descadastro em um clique
- [ ] Templates react-email: confirmação, post novo, contato
- [ ] Opção "avisar assinantes" ao publicar; envio pendente até a URL do post estar no ar; envio em lotes pelo Resend, sem duplicar
- [ ] Tela `/admin/newsletter`: assinantes, envios e reenvio manual

**Assert:** integração — inscrever, confirmar, publicar e disparar gera exatamente um e-mail por assinante confirmado (Resend simulado); descadastrado não recebe; disparo repetido não reenvia.

---

## Fase 1.0.0-rc — endurecimento e entrega (1.0.0-rc.1 → 1.0.0)

Objetivo: template pronto para outra pessoa clonar e colocar em produção.

### R1. CI/CD (inativo)

- [ ] `ci.yml`: lint, check, testes unitários e de integração, build, e2e
- [ ] `release.yml`: versão, changelog, tag e GitHub Release a cada push em `main` com `feat`/`fix`
- [ ] Arquivos em `.github/workflows-disabled/` e passo a passo de ativação em `docs/ci-cd.md`

**Assert:** `actionlint` sem erros; o script de release rodado em modo simulação produz a versão e as notas esperadas; nenhum arquivo em `.github/workflows/`.

### R2. Segurança

- [ ] Revisão com a skill `security-and-hardening`: CSRF, cabeçalhos, CSP, sanitização do Markdown, validação de upload, limite de tentativas
- [ ] Varredura de segredos no repositório e no histórico

**Assert:** relatório de segurança sem achado alto ou crítico em aberto.

### R3. Desempenho e acessibilidade

- [ ] Imagens responsivas e carregamento tardio; fontes locais
- [ ] Lighthouse em home e post; navegação por teclado e contraste

**Assert:** Lighthouse ≥ 90 em desempenho, acessibilidade, boas práticas e SEO nas duas páginas, no celular.

### R4. Documentação e template

- [ ] `README.md`: o que é, como rodar, como configurar, como publicar na Vercel e na Netlify
- [ ] `docs/` completa e linkada no `CLAUDE.md`/`AGENTS.md`
- [ ] Guia "use como template": o que trocar em `site.config.ts`, `content/` e variáveis de ambiente
- [ ] Skills próprias do projeto (novo post, nova lista de produtos, release)

**Assert:** clone limpo + `bun install` + `bun run dev` funciona seguindo só o README, sem variável obrigatória para o site público.

### R5. Release candidate

- [ ] Todos os asserts das fases anteriores reexecutados
- [ ] `1.0.0-rc.1` no changelog e tag criada
- [ ] Lista de pendências conhecidas para a `1.0.0`

**Assert:** suíte completa verde a partir de um clone limpo.

---

## Onde a sessão de 2026-10-06 parou

Fase ALPHA entregue e publicada como `v0.1.0`. Na BETA, B1, B2 e B3 estão entregues e cobertas por testes. O painel tem login, layout e uma página inicial vazia; ainda não existe tela de conteúdo nem API de conteúdo.

Próximos passos, nesta ordem:

1. Rotas `/api/v1` de posts, produtos e mídia sobre `cms.ts` (B5), com o 401 sem sessão que fecha o assert de B2.
2. Telas de posts, produtos e mídia (B4).
3. Newsletter (B6): as tabelas já estão no schema.

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

## Pendências do dono

- [ ] Revogar no Resend a chave que estava no `.env.example` antigo, caso seja real
- [ ] Criar o OAuth App no GitHub e o banco Neon (passo a passo virá em `docs/deploy.md`)
- [ ] Corrigir o billing do GitHub e ativar os workflows
