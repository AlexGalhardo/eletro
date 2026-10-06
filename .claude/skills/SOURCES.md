# Origem das skills

Skills de terceiros copiadas para este repositório em 2026-10-06. Para atualizar, copie de novo a partir da origem e ajuste a tabela.

| Skills | Origem | Commit | Licença |
|---|---|---|---|
| `using-agent-skills`, `interview-me` e as outras 23 de engenharia; agentes em `.claude/agents/`; checklists em `.claude/references/` | <https://github.com/addyosmani/agent-skills> | `1401c8b` | MIT |
| `karpathy-guidelines` | <https://github.com/multica-ai/andrej-karpathy-skills> | `2c60614` | MIT |
| `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review` | <https://github.com/dietrichgebert/ponytail> | `552acd5` | MIT |
| `graphify` | <https://github.com/Graphify-Labs/graphify>, instalada com `python -m graphify install --project` (pacote `graphifyy`) | versão em `graphify/.graphify_version` | ver repositório |

Os hooks do graphify estão em `.claude/settings.json` e chamam `python -m graphify`, o que exige `pip install graphifyy` na máquina.
