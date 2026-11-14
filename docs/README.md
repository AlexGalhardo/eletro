# Documentação

Ponto de partida para pessoas e agentes que chegam ao projeto. Leia a visão geral abaixo e depois só o documento do assunto em que vai trabalhar.

## Visão geral em um minuto

- **O que é:** template de CMS de blog em Astro 7.4, no GitHub Pages. O EletroRadar é a demonstração e o site em produção.
- **Conteúdo:** arquivos no repositório. Posts em `content/posts/*.mdx`, produtos em `content/products/*.json`, imagens em `static/images/`.
- **Site público:** pré-renderizado no build. Mudanças chegam por PR e o merge dispara o deploy.
- **Identidade:** tudo o que é específico do site está em `src/lib/site.config.ts`.
- **Estado atual:** veja a fase e os itens em aberto no [`PLAN.md`](../PLAN.md).

## Índice

| Documento | Leia quando for |
|---|---|
| [architecture.md](architecture.md) | Entender as pastas, o fluxo de uma página e as decisões de projeto |
| [content.md](content.md) | Criar ou alterar posts, listas de produtos e componentes de Markdown |
| [post-status.md](post-status.md) | Ver o status de cada post (rascunho, produtos, links de afiliado e pendentes); gerado por `bun run post-status` |
| [imported-drafts-review.md](imported-drafts-review.md) | Revisar os rascunhos importados antes de publicar: fichas contraditórias, decisões de SEO e posts não importados |
| [development.md](development.md) | Instalar, configurar e rodar o projeto |
| [workflows.md](workflows.md) | Saber a ordem de uma mudança, do pedido ao deploy, e os passos próprios de cada tipo de tarefa |
| [testing.md](testing.md) | Escrever ou rodar testes |
| [cms.md](cms.md) | Trabalhar no painel: banco, autenticação, armazenamento de conteúdo, serviço do CMS |
| [api.md](api.md) | Usar ou alterar a API REST `/api/v1` |
| [performance.md](performance.md) | Mexer em imagens, fontes, carregamento ou acessibilidade; medir o Lighthouse |
| [ui.md](ui.md) | Desenvolver UI com Astro e os comportamentos do UI SDK |
| [security.md](security.md) | Mexer em autenticação, entrada de dados, conteúdo do post, cabeçalhos ou integrações |
| [deploy.md](deploy.md) | Publicar no GitHub Pages e apontar o DNS do domínio próprio |
| [google-console-analytics-setup.md](google-console-analytics-setup.md) | Ligar o painel ao Google Search Console e ao Analytics (`/admin/google`) ou mexer nessa integração |
| [ci-cd.md](ci-cd.md) | Entender os workflows, ativar o CI ou lançar uma versão |
| [affiliate-links.md](affiliate-links.md) | Entender como os links de afiliado são registrados no dashboard de links e renderizados (`scripts/sync-links.ts`, `LINKS_DASHBOARD_TOKEN`) |
| [webscrapping-modelation.md](webscrapping-modelation.md) | Entender ou alterar a importação de posts por web scraping (`webscrapping/`, `/admin/import`) |
| [prompts/](prompts/) | Prompts usados pelo dono para gerar posts, FAQs, JSON de produtos e capas |

Skills do projeto para agentes, em `.agents/skills/`: `project-new-post`, `project-new-product-list` e `project-release`.

## Regras para manter esta pasta útil

- Cada documento cobre um assunto e cabe em uma leitura de poucos minutos.
- Mudou o comportamento, muda o documento na mesma entrega.
- Documento novo entra neste índice e na tabela do [`AGENTS.md`](../AGENTS.md).
