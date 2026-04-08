---
name: ubuybox-skip-trace-qa
description: Prepare and quality-check skip-trace output for UBUYBOX acquisitions. Use when Codex needs to define export requirements, review returned phone records, rank contact confidence, or explain how to handle manual owner lookup for harder ownership types such as LLCs.
---

# UBUYBOX Skip Trace QA

## Overview

Use this skill once the filtered lead list is ready for contact enrichment. The goal is to produce phone numbers that are more likely to connect, not just a bigger pile of records.

## Workflow

1. Export the filtered lead list.
2. Run skip tracing in bulk.
3. Prioritize recent contact data.
4. Prioritize records with multiple phone hits.
5. Prioritize higher-confidence matches.
6. If LLCs are included, look up the owner or contact first and then skip trace one by one.

## Output Format

Return:

- export checklist
- contact-ranking logic
- manual-review queue
- readiness decision for calling

## Guardrails

- Optimize for connect rate, not just total phone count.
- Flag weak or conflicting phone records instead of passing them forward silently.
- Treat LLC workflows as exceptions, not defaults.
