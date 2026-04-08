# UBUYBOX Business Bootstrap

This folder is the repo-tracked source of truth for the three `UBUYBOX` service businesses created on `2026-04-08`:

- `UBUYBOX Formation Services`
- `UBUYBOX Compliance and Operator Services`
- `UBUYBOX Deal, Capital, and SPV Services`

It tracks:

- company names and descriptions
- CEO and COO role definitions
- capability blurbs
- managed directive text used for their instruction bundles

Use the bootstrap script to preview or apply these records to a Paperclip instance:

```bash
pnpm ubuybox:bootstrap-businesses
pnpm ubuybox:bootstrap-businesses -- --apply
```

Expected environment:

- `DATABASE_URL` must point at the target Paperclip database
- the script should run from the repo root
- the instance should already have a source company named `UBUYBOX` unless you override the source company name in the JSON or with `--source-company`
