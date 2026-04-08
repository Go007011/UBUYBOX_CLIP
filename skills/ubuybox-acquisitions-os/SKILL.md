---
name: ubuybox-acquisitions-os
description: Coordinate the UBUYBOX acquisitions operating system across market selection, the absentee-owner "honey hole" list, lead stacking, skip tracing, calling, offer logic, KPI review, and reinvestment planning. Use when Codex needs to turn the acquisitions checklist into an execution plan, choose the right stage-specific skill, sequence work, or audit whether a lead-generation workflow is complete.
---

# UBUYBOX Acquisitions OS

## Overview

Use this skill as the control layer for the full acquisitions workflow. Start here when the request spans multiple stages, when the next action is unclear, or when you need to check whether the operation is moving in the right order.

Read `references/source-playbook.md` when you need the raw checklist that these skills were derived from.

## Core Sequence

1. Define the target market with `$ubuybox-market-selection`.
2. Build the raw absentee-owner "honey hole" list with `$ubuybox-seller-list-building`.
3. Tighten and prioritize the list with `$ubuybox-lead-stacking`.
4. Prepare and review contact data with `$ubuybox-skip-trace-qa`.
5. Execute outbound calling with `$ubuybox-acquisitions-calling`.
6. Evaluate pricing discipline with `$ubuybox-offer-logic`.
7. Review operating performance with `$ubuybox-kpi-review`.
8. Allocate wins back into growth with `$ubuybox-reinvestment-planning`.

## Stage Objectives

- `Market selection`: Pick a metro where deals can move fast because the buyer pool is already there.
- `Seller list building`: Pull a clean absentee-owner list that is easy to work at scale.
- `Lead stacking`: Shrink the list until motivation and buy-box fit are strong enough to justify outreach.
- `Skip trace QA`: Turn the filtered list into contact data that has a real chance of connecting.
- `Calling`: Produce conversations, appointments, and opportunities through daily outbound work.
- `Offer logic`: Keep pricing tied to seller equity room and what buyers really buy.
- `KPI review`: Run the operation like a scoreboard, not a guessing game.
- `Reinvestment`: Feed results back into marketing, systems, training, and support.

## Operating Rules

- Keep each stage separate. Do not jump from "find a market" straight to "start calling."
- Stop weak workflows early. If the buyer pool is soft, the list is dirty, or the contact data is weak, do not pretend the next stage will fix it.
- Ask for missing inputs only when the stage cannot move without them. Otherwise, make the next best assumption and state it plainly.
- Prefer operator outputs over essays: market scorecard, sourcing criteria, filter stack, call queue, KPI review, or reinvestment plan.
- Treat the playbook as a feedback loop. Tighten filters, price discipline, and market choice from real results, not theory.
- Keep the language practical. Speak in terms of buyer pools, tired landlords, equity room, connect rates, and conversion, not generic strategy talk.

## Handoff Rules

- Hand off to `$ubuybox-market-selection` when the team is still deciding where to hunt.
- Hand off to `$ubuybox-seller-list-building` when the market is chosen but the source list is not defined.
- Hand off to `$ubuybox-lead-stacking` when a raw list exists but it is too wide or too weak.
- Hand off to `$ubuybox-skip-trace-qa` when the list is ready for contact enrichment.
- Hand off to `$ubuybox-acquisitions-calling` when the contact data is ready for daily outreach.
- Hand off to `$ubuybox-offer-logic` when a seller looks real enough to price.
- Hand off to `$ubuybox-kpi-review` when the question is about throughput, bottlenecks, or monthly adjustments.
- Hand off to `$ubuybox-reinvestment-planning` when early wins need to be turned into scale.

## Outputs

Prefer one of these output shapes:

- stage-by-stage execution plan
- current-stage diagnosis with the next skill to use
- blocker list showing why the workflow should not advance yet
- audit summary comparing the current process to the UBUYBOX playbook
