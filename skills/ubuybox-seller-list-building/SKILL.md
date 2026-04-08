---
name: ubuybox-seller-list-building
description: Build raw seller lead lists for UBUYBOX acquisitions from absentee-owner data. Use when Codex needs to define the absentee-owner "honey hole" list, specify required columns, prepare export requirements, or document which ownership types to include or exclude before lead stacking.
---

# UBUYBOX Seller List Building

## Overview

Use this skill to define the raw lead list before filters are stacked. The current playbook starts with absentee owners because that is the "honey hole" list: broad enough to produce volume and simple enough to work consistently at scale.

## Objective

Produce a raw list that is:

- easy to source
- easy to enrich
- easy to call
- clean enough to tighten later with lead stacking

## Workflow

1. Pull absentee-owner records.
2. Keep both the owner mailing address and the property address.
3. Exclude LLC-owned properties by default.
4. Exclude trust-owned properties by default.
5. Only include LLC or trust ownership when there is a clear reason to absorb the extra skip-trace effort.

## Required Fields

At minimum, capture:

- owner name
- owner mailing address
- property address
- ownership type
- market or zip

Prefer to add:

- parcel or property identifier
- city and state
- source tag for the market or list pull

## Include / Exclude Logic

- Include absentee owners by default.
- Exclude LLC-owned properties by default because they are harder to skip trace at scale.
- Exclude trust-owned properties by default for the same reason.
- Include harder ownership types only when there is a specific strategic reason and the team accepts extra manual work.

## Guardrails

- Keep the first pass simple. Do not over-filter inside the source pull.
- Default to ownership types that can be skip traced at scale.
- If the request includes LLCs or trusts, note that contact resolution becomes slower and more manual.
- Do not confuse list pulling with lead stacking. The raw list should be broad enough to filter later.

## Output Format

Return either:

- a source-list specification for operators, or
- a concise checklist for what the export must contain before lead stacking begins
