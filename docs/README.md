# Documentação

Ponto de partida para pessoas e agentes que chegam ao projeto. Leia a visão geral abaixo e depois só o documento do assunto em que vai trabalhar.

## Visão geral em um minuto

- **O que é:** template de CMS de blog em Astro 7.4, no GitHub Pages. O EletroRadar é a demonstração e o site em produção.
- **Conteúdo:** arquivos no repositório. Posts em `content/posts/*.mdx`, produtos em `content/products/*.json`, imagens em `static/images/`.
- **Site público:** pré-renderizado no build. Mudou conteúdo, precisa de novo build (um commit dispara o deploy).
- **Identidade:** tudo o que é específico do site está em `src/lib/site.config.ts`.
- **Estado atual:** veja a fase e os itens em aberto no [`PLAN.md`](../PLAN.md).

## Índice

| Documento | Leia quando for |
|---|---|
| [architecture.md](architecture.md) | Entender as pastas, o fluxo de uma página e as decisões de projeto |
| [content.md](content.md) | Criar ou alterar posts, listas de produtos e componentes de Markdown |
| [post-status.md](post-status.md) | Ver o status de cada post (rascunho, produtos, links de afiliado e pendentes); gerado por `bun run post-status` |
| [feature-flags.md](feature-flags.md) | Ligar ou desligar uma flag (`content/flags.json`, `/admin/flags`), acrescentar uma flag nova ou revisar um rascunho em `/preview/<slug>` |
| [agent-setup.md](agent-setup.md) | Preparar o projeto do zero: dependências, `.env`, banco, Docker, testes, GitHub Pages e dashboard de links, com a verificação de cada passo |
| [development.md](development.md) | Rodar o projeto, usar os scripts de `setups/` e o Docker de `infra/`, configurar variáveis de ambiente |
| [tooling.md](tooling.md) | Saber o que cada ferramenta faz, onde está a configuração e o que os hooks do git rodam |
| [workflows.md](workflows.md) | Saber a ordem de uma mudança, do pedido ao deploy, e os passos próprios de cada tipo de tarefa |
| [testing.md](testing.md) | Escrever ou rodar testes |
| [cms.md](cms.md) | Trabalhar no painel: banco, autenticação, armazenamento de conteúdo, serviço do CMS |
| [api.md](api.md) | Usar ou alterar a API REST `/api/v1` |
| [newsletter.md](newsletter.md) | Mexer na inscrição, nos e-mails ou no envio de avisos de post |
| [performance.md](performance.md) | Mexer em imagens, fontes, carregamento ou acessibilidade; medir o Lighthouse |
| [security.md](security.md) | Mexer em autenticação, entrada de dados, conteúdo do post, cabeçalhos ou integrações |
| [deploy.md](deploy.md) | Publicar no GitHub Pages e apontar o DNS de `eletroradar` |
| [setup-vercel.md](setup-vercel.md) | Roteiro antigo da Vercel. A produção é o GitHub Pages |
| [google-console-analytics-setup.md](google-console-analytics-setup.md) | Ligar o painel ao Google Search Console e ao Analytics (`/admin/google`) ou mexer nessa integração |
| [ci-cd.md](ci-cd.md) | Entender os workflows, ativar o CI ou lançar uma versão |
| [affiliate-links.md](affiliate-links.md) | Entender como os links de afiliado são registrados no dashboard de links e renderizados (`scripts/sync-links.ts`, `LINKS_DASHBOARD_TOKEN`) |
| [webscrapping-modelation.md](webscrapping-modelation.md) | Entender ou alterar a importação de posts por web scraping (`webscrapping/`, `/admin/import`) |
| [prompts/](prompts/) | Prompts usados pelo dono para gerar posts, FAQs, JSON de produtos e capas |

Skills do projeto para agentes, em `.claude/skills/`: `project-new-post`, `project-new-product-list` e `project-release`.

## Regras para manter esta pasta útil

- Cada documento cobre um assunto e cabe em uma leitura de poucos minutos.
- Mudou o comportamento, muda o documento na mesma entrega.
- Documento novo entra neste índice e na tabela do [`AGENTS.md`](../AGENTS.md).
