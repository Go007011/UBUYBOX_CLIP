---
name: ubuybox-acquisitions-calling
description: Execute the UBUYBOX outbound calling workflow for distressed-property acquisitions. Use when Codex needs to plan daily cold-calling execution, define call priorities, frame tired-landlord conversations, or coach the team on what to expect from seller outreach.
---

# UBUYBOX Acquisitions Calling

## Overview

Use this skill to operationalize the calling phase once contact data is ready. The source plan emphasizes daily calling discipline, consistency over perfection, and conversations tailored to tired landlords.

## Workflow

1. Start calling every day.
2. Optimize for consistency before perfect scripting.
3. Focus the conversation on tired-landlord pain points when the seller profile fits.
4. Expect early friction such as fumbled calls, rejected offers, and occasional bad contracts.
5. Keep moving. The operating assumption in the plan is that repeated calling and learning is where the money is made.

## Output Format

Return:

- call-priority order
- daily activity target
- conversation angle
- expected objections or failure modes
- next-step disposition for each lead bucket

## Guardrails

- Do not promise outcomes that the list quality cannot support.
- Treat rejected offers and weak calls as normal learning inputs.
- If the contact data is poor, route the work back to `$ubuybox-skip-trace-qa` instead of forcing more calls.
