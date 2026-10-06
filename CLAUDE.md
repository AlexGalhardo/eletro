# CLAUDE.md

@AGENTS.md

## Claude Code

- No início da sessão, invoque com a ferramenta `Skill` as quatro skills listadas em "Início de toda sessão": `using-agent-skills`, `karpathy-guidelines`, `ponytail` e `graphify`. Elas estão instaladas em `.claude/skills/`.
- Regras por assunto ficam em `.claude/rules/` e são carregadas automaticamente.
- Agentes especializados em `.claude/agents/`: `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`.
- Checklists de referência em `.claude/references/`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `python -m graphify query "<question>"` when graphify-out/graph.json exists. Use `python -m graphify path "<A>" "<B>"` for relationships and `python -m graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `python -m graphify update .` to keep the graph current (AST-only, no API cost).
