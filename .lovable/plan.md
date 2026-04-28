## Goal
Visually separate the filter row (Customer/Plant, Product, Country, Movement type, Date range) from the actions/summary row (totals + Expand all / Claim / Export CSV) so the toolbar stops feeling cluttered.

## Approach
Add a horizontal divider between the two rows. The cleanest place is at the bottom of `FilterBar` (so any page that uses it gets the separation for free).

## Changes

**`src/components/registry/FilterBar.tsx`**
- Wrap the existing flex row in a parent `<div>`.
- Append a `<Separator />` (already imported) below the filter row, with a small top margin and a bottom margin so it sits cleanly between filters and the summary/actions row in `MovementsTable`.
- Reduce the filter row's `mb-4` (now redundant) and let the wrapper handle spacing: e.g. filter row `mb-3`, then `<Separator className="mb-4" />`.

No other files need to change — `MovementsTable` already starts with its own `mb-4` summary row, which will now sit cleanly under the divider.

## Visual result
```text
[ Customer/Plant ] [ Product ] [ Country ] [ Movement type ] [ Date range ]
────────────────────────────────────────────────────────────────────────────
Total: …   Issued: …   Booked: …   Claimed: …      [Expand all] [Claim] [CSV]
```

Quick, low-risk, scoped to one file.