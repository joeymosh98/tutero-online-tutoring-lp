# Tutoring Marketing Brain

Central knowledge base for all Tutero marketing. Contains product-specific skills organized by market.

## Shared

- **brand-guidelines/** — Tutero brand rules (colours, logos, typography, tone). Applies across all products and markets.
- **strategy/** — Background context only. Group strategy, Florida growth strategy, and AI marketing strategy. Do NOT use these as active instructions — they exist to inform decisions when context about business direction is needed.

## Product folders

- **tutero-tutoring-australia/** — Tutero.com parent-facing 1-on-1 tutoring, Australian market
- **tutero-tutoring-florida/** — Tutero tutoring, Florida/US market
- **tutero-ai-marketing/** — Tutero.ai, school-facing AI platform

## Agents

Product folders can contain an `agents/` directory with orchestration agents. An agent uses multiple skills to produce a specific deliverable. It defines a persona, skill reading order, workflow, checkpoints, and quality gates.

Current agents:
- **tutero-tutoring-australia/agents/paid-social-ads.md** — **Zara**, creates paid social ad creatives for the Australian tutoring market
