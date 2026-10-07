# Segurança

Relatório da revisão de 2026-10-06 (item R2 do [`PLAN.md`](../PLAN.md)) e modelo de ameaças do projeto. A revisão foi feita por um agente auditor independente, só com leitura, seguindo a skill `security-and-hardening` e a edição 2025 do [OWASP Top Ten](https://owasp.org/projects/top-ten).

**Resultado:** nenhum achado crítico. Um achado alto, corrigido. Não há achado alto ou crítico em aberto. Ficam em aberto três médios e baixos, listados abaixo com o motivo.

## Modelo de ameaças

| Fronteira | Quem escreve | Controle |
|---|---|---|
| Visitante → site público | Qualquer pessoa | Páginas estáticas; só o formulário de contato e a newsletter recebem dados |
| Visitante → `/api/v1` | Qualquer pessoa | Validação zod, limite de escritas por IP, formato único de erro, CSRF do SvelteKit |
| Admin → `/admin` e escritas da API | Quem está em `ADMIN_GITHUB_USERS` ou, com e-mail verificado, em `ADMIN_EMAILS` | Sessão do better-auth em cookie `HttpOnly`, `SameSite=Lax`; lista conferida a cada requisição |
| Conteúdo → build | O admin, pelo painel, ou um commit direto | O corpo do post vira código Svelte no build: `validateBody` e os schemas são o portão |
| Servidor → GitHub, Resend, Neon | Configuração | Segredos só em variáveis de ambiente; caminhos do store validados |

O ativo mais sensível é o build: um post malicioso que passe pelo portão executa código no deploy, lê as variáveis de ambiente e publica script para todo visitante. Por isso um admin comprometido é o cenário de maior impacto.

## Achados e situação

| Severidade | Achado | Situação |
|---|---|---|
| Alto | `validateBody` aceitava chaves codificadas (`&#123;`, `&lbrace;`, `%7B`), que o mdsvex decodifica em expressões Svelte: execução de código no build e XSS persistente | **Corrigido.** Chaves codificadas, qualquer referência numérica e entidades fora de uma lista curta são recusadas; testes em `validate-body.test.ts` |
| Médio | URLs `javascript:` e HTML perigoso (`<base>`, `<meta refresh>`, `<form>`, `style=`) no corpo, nos links de loja e na capa | **Corrigido.** Tags e atributo `style` recusados; esquemas `javascript:`, `vbscript:` e `data:` recusados em links e imagens; `cover`, `image` e links de loja aceitam só `/images/...`, `https://` e os marcadores `""` e `#` |
| Médio | Nenhum cabeçalho de segurança | **Corrigido em parte.** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e `Cache-Control: no-store` nas áreas privadas (`hooks.server.ts`); os mesmos, mais HSTS, em `vercel.json` e `static/_headers` para as páginas estáticas. **Em aberto:** CSP, e a conferência dos cabeçalhos em um deploy real |
| Médio | Newsletter: inscrição usável para encher caixas de entrada; confirmação acontecia ao abrir o link | **Corrigido.** Uma confirmação por endereço a cada 24 h, teto de 60 confirmações por hora no total, confirmação por botão (`POST`), sem rastreadores nas páginas com token |
| Baixo | `cover` com `..` fazia o store pedir outro endpoint da API do GitHub com o token | **Corrigido.** O schema recusa, e os stores recusam qualquer caminho com `..` |
| Baixo | Login de testes ativo fora de Vercel/Netlify se a variável fosse definida | **Corrigido.** Só existe com o banco PGlite local e fora de produção; entra no limite de requisições |
| Baixo | E-mail privado do admin nos commits de conteúdo | **Corrigido.** Usa `<login>@users.noreply.github.com` |
| Baixo | `CRON_SECRET` sem tamanho mínimo; rota de execução da fila sem limite | **Corrigido.** Mínimo de 32 caracteres; a rota entra no limite de requisições |
| Baixo | E-mail de assinante no log quando não há `RESEND_API_KEY` | **Corrigido** |
| Baixo | Corpo malformado (tag sem fechar) passa pelo portão e quebra o build | **Em aberto.** O site no ar não cai, mas o deploy falha até o post ser corrigido. Fechar exige compilar o corpo com mdsvex ao salvar, o que leva `mdsvex` para as dependências de produção: decisão do dono |
| Baixo | Lista de admins por nome de usuário do GitHub, não por id | **Em aberto, documentado.** Se um admin renomear ou apagar a conta, tire o nome da lista: outra pessoa pode registrá-lo |
| Baixo | Limite de requisições em memória, por instância | **Em aberto, documentado.** Em serverless cada instância conta separado. Para proteção real, use o firewall da plataforma em `/api` |
| Baixo | O token do assinante serve para confirmar e para sair, e não expira | **Em aberto.** O dano possível é cancelar a inscrição de alguém |
| Info | Sem registro de eventos de segurança (login, recusa, 401, 429) nem alertas | **Em aberto.** Os commits de conteúdo são a única trilha |

## OWASP Top Ten 2025

| Categoria | Situação |
|---|---|
| A01 Broken Access Control | Guarda em `hooks.server.ts`, `requireAdmin` em toda escrita, lista de admins conferida por requisição, caminhos do store validados |
| A02 Security Misconfiguration | Cabeçalhos aplicados; login de testes fecha por padrão. Falta CSP |
| A03 Software Supply Chain Failures | Versões exatas e lockfile; actions do CI fixadas por hash. `bun audit`: 5 avisos, todos em dependências transitivas de ferramentas de desenvolvimento (ver abaixo) |
| A04 Cryptographic Failures | Tokens com 32 bytes aleatórios, comparação em tempo constante, sem senhas, cookies assinados pelo better-auth |
| A05 Injection | Portão do corpo do post e schemas de URL (achados alto e médio corrigidos); SQL só pelo Drizzle, parametrizado; JSON-LD com `<` escapado |
| A06 Insecure Design | O conteúdo é compilado como código: o portão é por padrões, não por compilação (limite conhecido, acima) |
| A07 Authentication Failures | Só OAuth do GitHub, sem senha; lista de permitidos; limite de tentativas em todo `POST` de `/api` |
| A08 Software or Data Integrity Failures | Escrita com `sha` nunca sobrescreve; scripts de analytics de terceiros sem SRI (inerente a eles) |
| A09 Security Logging and Alerting Failures | Em aberto: só `console`, sem alertas |
| A10 Mishandling of Exceptional Conditions | `respond()` devolve 500 genérico; sem configuração de auth não existe admin |

LLM (só na importação, `webscrapping/rewrite.ts`): o resumo e o FAQ da página de origem vão para a API da Mistral. O texto da origem é tratado como não confiável (LLM01): o modelo não tem ferramentas nem acesso a nada, e a saída (LLM05) passa por schema, por `clean` (remove `{`, `}`, `<`, `>`, que o mdsvex leria como código), por limites de tamanho e pelas mesmas validações do editor. Uma chamada por importação, com `max_tokens` e tempo limite (LLM10). A chave fica só no servidor; nenhum dado de usuário vai para a Mistral.

## Segredos

Varredura da árvore de trabalho, de todo o histórico, do reflog e dos objetos soltos do Git (936 blobs) por chaves do Resend, tokens do GitHub, chaves privadas, strings de conexão e JWTs: **nada encontrado**. As duas versões de `.env.example` no histórico têm só placeholders. Os únicos valores parecidos com segredo são os de teste (`tests/e2e/env.ts`, `playwright.config.ts`, `tests/integration/`).

Limite: se o histórico antigo, de antes do reinício do repositório, chegou a existir no GitHub, commits órfãos e forks podem guardá-lo. Não há como conferir daqui: se a chave antiga do Resend era real, revogue.

## Dependências (`bun audit`, 2026-10-06)

| Pacote | Vem de | Severidade | Chega à produção? |
|---|---|---|---|
| `braces` | markdownlint-cli2 | alta (DoS) | Não, só lint |
| `esbuild` | drizzle-kit | moderada | Não, só desenvolvimento |
| `smol-toml` | markdownlint-cli2 | moderada | Não |
| `sprintf-js` | gray-matter → js-yaml → argparse | moderada (DoS) | `gray-matter` roda em produção, mas o `argparse` só é usado pela linha de comando do js-yaml |
| `katex` | markdownlint-cli2 | baixa | Não |

Nenhuma tem correção disponível subindo uma dependência direta do projeto. Rever a cada release.

## O que a revisão não verificou

- Os ataques no navegador: foi conferido o HTML gerado no servidor, não a execução.
- Um deploy real em Vercel ou Netlify: cabeçalhos da plataforma, HSTS, variáveis visíveis no build.
- O fluxo OAuth completo com o GitHub e o banco Neon.
- CSP: o SvelteKit 3 tem a opção `csp` em `sveltekit({ ... })` no `vite.config.ts`. Ligá-la exige tirar os scripts embutidos do tema e do analytics de `app.html` e de `+layout.svelte` (ou declarar o hash deles) e testar Google Analytics e Clarity no ar.

## Para quem mantém

- Tag ou atributo novo liberado no corpo do post passa por `src/lib/content/validate-body.ts` e ganha teste em `validate-body.test.ts`.
- Cabeçalho novo entra nos três lugares: `src/hooks.server.ts`, `vercel.json` e `static/_headers`.
- Endpoint novo que busca uma URL informada por alguém precisa de lista de hosts permitidos, só `https`, sem seguir redirecionamento para fora da lista, com limite de tempo e de tamanho.
