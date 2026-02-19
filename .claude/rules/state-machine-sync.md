# State Machine Diagram Sync Rule

## Location

State machine diagrams live in TWO places and must stay in sync:
1. **Local (auto-loaded):** `~/.claude/state-machines/cremcp/`
2. **Repo (GitHub):** `docs/state-machines/`

## When to Update

After ANY change to:
- `src/lib/cli-runner.ts`, `src/lib/cli-check.ts`, `src/lib/output-parser.ts` → update `cli-execution.md`
- `src/index.ts`, `src/server.ts` → update `mcp-session.md`
- `src/tools/workflow.ts`, `src/tools/project.ts` → update `workflow-lifecycle.md`
- New tool modules or resources that introduce new state flows → create new diagram

## Update Process

1. Edit the diagram in `~/.claude/state-machines/cremcp/<component>.md`
2. Copy to repo: `cp ~/.claude/state-machines/cremcp/<component>.md docs/state-machines/`
3. Update the `Last Updated` timestamp in the diagram header
4. Update `Source Code Mapping` table with current line numbers
5. Include the diagram changes in the same commit as the code changes (or a follow-up commit in the same push)

## Diagram Format

Follow the format defined in `~/.claude/rules/state-machine-rules.md` — Mermaid diagrams, detailed state descriptions, transition tables, and source code mapping.
