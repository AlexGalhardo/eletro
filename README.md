# SvelteKit Blog CMS

Template open source de blog com CMS, feito em SvelteKit 3. Os posts são arquivos Markdown no repositório, o site público é estático e quem publica usa um painel no navegador, que grava o conteúdo com commits no próprio repositório. O conteúdo de demonstração é o [EletroRadar](https://eletroradar.com.br), um site de reviews de eletrodomésticos com links de afiliado.

> **Estado:** release candidate da 1.0 (`v1.0.0-rc.1`). O site público, o painel, a API e a newsletter estão implementados e testados localmente. Ainda não houve deploy desta versão: o que depende de produção está listado em [`docs/deploy.md`](docs/deploy.md) e no [`PLAN.md`](PLAN.md).

## Recursos

### Site público

- Posts em Markdown (`.mdx` com mdsvex) e listas de produtos em JSON, validados no build
- Páginas pré-renderizadas, com busca, filtro por categoria, tema claro e escuro
- Capas redimensionadas no build e servidas com `srcset`
- SEO: metatags, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`
- Formulário de contato e newsletter com confirmação por e-mail (Resend e react-email)

### Painel `/admin`

- Login pelo GitHub, restrito a uma lista de usuários
- Editor de posts com pré-visualização, FAQ, capa e listas de produtos
- Editor de produtos em formulário e biblioteca de mídia com upload
- Aviso aos assinantes quando um post entra no ar
- Importação de um rascunho a partir de um post de outro site
- Indicador de quando o conteúdo salvo já está publicado

### Para quem desenvolve

- API REST `/api/v1` com descrição OpenAPI
- Identidade do site em um único arquivo de configuração
- Testes unitários, de integração e e2e; workflows de CI e release prontos para ativar

## Começando

Requisitos: [Bun](https://bun.sh) 1.4 ou mais novo e Node 22.17 ou mais novo.

```bash
git clone https://github.com/AlexGalhardo/sveltekit-blog-cms-claude-code.git
cd sveltekit-blog-cms-claude-code
bun install
bun run dev
```

Abra <http://localhost:5173>. O site público roda sem nenhuma variável de ambiente.

### Abrindo o painel na sua máquina

O painel precisa de três variáveis. Sem banco configurado ele usa um Postgres embutido (PGlite) em `.data/`, e sem token do GitHub grava o conteúdo direto nos arquivos do projeto.

```bash
cp .env.example .env
```

Preencha no `.env`:

```bash
BETTER_AUTH_SECRET=qualquer-texto-longo-e-aleatorio
ADMIN_GITHUB_USERS=seu-usuario-do-github
AUTH_TEST_LOGIN_TOKEN=um-token-so-seu
```

Reinicie o servidor, abra <http://localhost:5173/admin> e use o formulário "Entrada local" com o seu usuário e o token.

Essa entrada existe só com o banco local e nunca em produção. Para entrar com o GitHub, crie um OAuth App e preencha `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` (passo 3 de [`docs/deploy.md`](docs/deploy.md), com `http://localhost:5173` como URL).

## Scripts

| Script | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção; falha se algum post ou produto for inválido |
| `bun run preview` | Serve o build localmente |
| `bun run check` | Checagem de tipos |
| `bun run lint` | Biome e markdownlint |
| `bun run format` | Aplica as correções automáticas |
| `bun run test` | Testes unitários e de integração |
| `bun run test:e2e` | Testes smoke e e2e (rode `bun run test:e2e:install` uma vez) |
| `bun run verify` | Tudo acima em sequência |
| `bun run db:generate` | Gera a migration depois de mudar o schema do banco |
| `bun run db:migrate` | Aplica as migrations no banco de `DATABASE_URL` |

## Usando como template

1. **Identidade:** edite `src/lib/site.config.ts` (nome, URL, textos, autores, categorias, analytics, sites de origem da importação).
2. **Conteúdo:** apague `content/posts/`, `content/products/` e as imagens de `static/images/`, e crie os seus. O formato está em [`docs/content.md`](docs/content.md).
3. **Páginas institucionais:** reescreva Sobre, Contato, Termos e Privacidade em `src/routes/(site)/`. Os textos são do EletroRadar.
4. **Arquivos do site:** troque `static/logo.png` e os arquivos de verificação de buscadores em `static/`.
5. **Confira:** `bun run verify`.
6. **Publique:** siga [`docs/deploy.md`](docs/deploy.md).

Os testes de integração e e2e conferem o conteúdo de demonstração (por exemplo, que existem pelo menos 64 posts e um post chamado `melhor-airfryer-8-litros`). Ao trocar o conteúdo, ajuste esses números e nomes em `tests/`.

## Publicando

Vercel e Netlify, com banco no Neon, login pelo GitHub e e-mails pelo Resend: [`docs/deploy.md`](docs/deploy.md).

## Documentação

| Documento | Assunto |
|---|---|
| [`docs/README.md`](docs/README.md) | Índice de toda a documentação |
| [`docs/architecture.md`](docs/architecture.md) | Pastas, fluxo de dados e decisões |
| [`docs/content.md`](docs/content.md) | Formato de posts e produtos |
| [`docs/cms.md`](docs/cms.md) | Painel, banco, autenticação e armazenamento |
| [`docs/api.md`](docs/api.md) | API REST |
| [`docs/deploy.md`](docs/deploy.md) | Hospedagem e variáveis de ambiente |
| [`docs/security.md`](docs/security.md) | Modelo de ameaças e revisão de segurança |
| [`PLAN.md`](PLAN.md) | Planejamento por fases e o que falta |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de código |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de versões |

## Licença

[MIT](LICENSE). O conteúdo de demonstração em `content/` e `static/images/` pertence ao EletroRadar e não está coberto pela licença do código.
