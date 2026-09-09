# Skills, tools and agent boundaries

Six slides, about eight minutes. Uses the shared Zure theme and deck-local
diagrams. Most slides have two grouped reveals. The context-window animation
has five clicks, covering skill loading, tool use, growing history, compaction
and continued work. Explanations and caveats are in speaker notes.

The animation follows Slidev's next and previous controls. It also supports
direct click-state links, static export and reduced-motion preferences.

```bash
npm run dev:agent-building-blocks
npm run build:agent-building-blocks
```

## Scope

This complements **How I develop with coding agents**. It covers configuration
responsibilities, reusable skills and primary/subagent context boundaries.
It does not repeat QRSPI, model choices, implementation slices, browser
verification, review loops or project parallelism.

The September 2026 update is explicit. Reusable roles, procedures and output
contracts should usually be skills. Agent configuration remains useful for
execution settings such as model, tool access, permissions and isolation.
This is Pasi's preference, not a claim that skills replace runtime controls.

## Sources

- [A mental model for LLM tooling primitives](https://www.huuhka.net/a-mental-model-for-llm-tooling-primitives/), 23 November 2025.
- [Primary vs Subagents in LLM harnesses](https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/), 15 January 2026.
- [Agent Skills overview](https://agentskills.io/home).
- [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture).
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents).
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works), for the tool loop, context and compaction.

The docs-check examples and final decision matrix are illustrative. The slides
distinguish the original posts from the updated recommendation.
