# CLAUDE.md

@AGENTS.md

## Claude Code

- No início da sessão, invoque com a ferramenta `Skill` as três skills de "Início de toda sessão": `using-agent-skills`, `karpathy-guidelines` e `ponytail`.
- As regras de `.claude/rules/` são carregadas automaticamente.
- Agentes especializados em `.claude/agents/`: `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`.
- `.claude/references/` guarda os checklists que as skills de engenharia consultam.
- O repositório não versiona `.claude/settings.json` nem hooks do Claude Code: nenhuma chamada de ferramenta depende de Python ou de outro programa instalado na máquina.
