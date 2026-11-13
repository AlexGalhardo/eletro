# Origem das skills

Skills de terceiros copiadas para este repositório em 2026-10-06, sem alteração de conteúdo. Para atualizar, copie de novo a partir da origem e ajuste a tabela. As três `project-*` são deste projeto e não entram aqui.

| Skills | Origem | Commit | Licença |
|---|---|---|---|
| `using-agent-skills`, `interview-me` e as outras 23 de engenharia; agentes em `.agents/agents/`; checklists em `.agents/references/` | <https://github.com/addyosmani/agent-skills> | `1401c8b` | MIT |
| `karpathy-guidelines` | <https://github.com/multica-ai/andrej-karpathy-skills> | `2c60614` | MIT |
| `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review` | <https://github.com/dietrichgebert/ponytail> | `552acd5` | MIT |
| `graphify` | <https://github.com/Graphify-Labs/graphify>, instalada com `python -m graphify install --project` (pacote `graphifyy`) | versão em `graphify/.graphify_version` | ver repositório |

O que o projeto usa de cada pacote está no [`AGENTS.md`](../../AGENTS.md). O graphify é opcional: o grafo (`graphify-out/`) fica fora do git e o projeto não instala os hooks dele, nem os do Claude Code nem os do git.
