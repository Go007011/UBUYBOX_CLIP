---
name: ubuybox-offer-logic
description: Apply the UBUYBOX offer-screening logic for acquisitions. Use when Codex needs to judge whether seller equity room supports a discounted offer, align pricing to what buyers actually buy, or explain why a lead should move forward or be disqualified.
---

# UBUYBOX Offer Logic

## Overview

Use this skill to keep pricing discipline tied to actual deal economics. The current plan assumes the deal must work because the seller has enough equity room and because the target price stays aligned with real buyer behavior.

## Workflow

1. Confirm the seller has enough equity room for a discounted offer.
2. Compare the target price range to what current buyers actually buy.
3. Treat the example accepted average from the notes as a reference point, not a permanent rule.
4. Refine pricing and filters based on what really closes, not what sounds good on paper.

## Output Format

Return:

- equity-room judgment
- buyer-alignment judgment
- recommended price discipline
- pass, pursue, or reject decision

## Guardrails

- Never hard-code old target averages without fresh local validation.
- If buyer demand and seller equity do not overlap, say the lead does not work.
- Keep this skill focused on offer discipline, not full legal or underwriting review.
