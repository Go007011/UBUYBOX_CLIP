---
name: ubuybox-lead-stacking
description: Tighten and prioritize raw seller lists for UBUYBOX acquisitions. Use when Codex needs to apply equity and price filters, add motivation-based stacking rules, shrink an oversized list, or produce a ranked lead list before skip tracing and calling.
---

# UBUYBOX Lead Stacking

## Overview

Use this skill after the raw absentee-owner list is ready. The goal is to tighten the list until it contains the highest-probability sellers for the current buy box.

## Core Filters

Apply these first:

- equity between 20% and 100%
- home value under roughly $300,000 unless the market requires a different cap

## Tighten-More Filters

Use these when the list is still too large:

- years owned of at least 7
- age 45+ when demographic data exists

## Highest-Motivation Stack

Use these when the goal is a smaller, stronger list:

- absentee + vacant
- absentee + pre-foreclosure
- absentee + vacant + pre-foreclosure

## Output Format

Return:

- filters applied
- filters intentionally skipped
- ranked priority tiers
- list-size impact after each major filter
- recommendation for whether the list is ready for skip tracing

## Guardrails

- Keep market-specific caps adjustable.
- Do not stack so aggressively that volume disappears without saying so.
- Prefer a clear explanation of tradeoffs over pretending there is one perfect filter set.
