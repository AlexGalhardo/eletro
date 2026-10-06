# Documentação

Ponto de partida para pessoas e agentes que chegam ao projeto. Leia a visão geral abaixo e depois só o documento do assunto em que vai trabalhar.

## Visão geral em um minuto

- **O que é:** template de CMS de blog em SvelteKit 3. O EletroRadar é a demonstração e o site em produção.
- **Conteúdo:** arquivos no repositório. Posts em `content/posts/*.mdx`, produtos em `content/products/*.json`, imagens em `static/images/`.
- **Site público:** pré-renderizado no build. Mudou conteúdo, precisa de novo build (um commit dispara o deploy).
- **Identidade:** tudo o que é específico do site está em `src/lib/site.config.ts`.
- **Estado atual:** veja a fase e os itens em aberto no [`PLAN.md`](../PLAN.md).

## Índice

| Documento | Leia quando for |
|---|---|
| [architecture.md](architecture.md) | Entender as pastas, o fluxo de uma página e as decisões de projeto |
| [content.md](content.md) | Criar ou alterar posts, listas de produtos e componentes de Markdown |
| [development.md](development.md) | Rodar o projeto, usar os scripts, configurar variáveis de ambiente |
| [testing.md](testing.md) | Escrever ou rodar testes |
| [cms.md](cms.md) | Trabalhar no painel: banco, autenticação, armazenamento de conteúdo, serviço do CMS |
| [prompts/](prompts/) | Prompts usados pelo dono para gerar posts, FAQs, JSON de produtos e capas |

Documentos previstos para as próximas fases (ainda não existem): `api.md`, `newsletter.md`, `deploy.md`, `ci-cd.md`, `releases.md`.

## Regras para manter esta pasta útil

- Cada documento cobre um assunto e cabe em uma leitura de poucos minutos.
- Mudou o comportamento, muda o documento na mesma entrega.
- Documento novo entra neste índice e na tabela do [`AGENTS.md`](../AGENTS.md).
