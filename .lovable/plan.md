

## Updated Plan: Registry Table Shows Claimed Reporting Goods

### What changes from the previous plan

The registry movements table gains a **"Reporting Good"** column. When a claim is completed via the Create Claim dialog, the claimed reporting good (selected from: **Industrials**, **Energy**, **Fertilizers**) appears in the corresponding row in the registry table.

### Specific additions

1. **Mock data (`registryData.ts`)** — Each movement record gets an optional `reportingGood` field. For movements with status "Claimed", this is pre-populated with one of the three categories (e.g., Fertilizers for PepsiCo claims, Energy for another, Industrials for a third).

2. **Movements Table (`MovementsTable.tsx`)** — Add a "Reporting Good" column that displays the value when present (for claimed movements) and shows "—" for Issued/Booked movements.

3. **Create Claim Dialog (`CreateClaimDialog.tsx`)** — The "Reporting good" dropdown offers three options: **Industrials**, **Energy**, **Fertilizers**. On "Initiate Claim", the selected reporting good is written back to the movement record in local state, the movement status flips to "Claimed", and the table re-renders showing the reporting good.

4. **State flow** — The `Index.tsx` page holds the movements array in `useState`. `MovementsTable` receives it as a prop. When a claim is initiated, a callback updates the movement's status to "Claimed" and sets its `reportingGood`, so the table reflects the change immediately.

### Technical notes
- No backend needed — all state is in-memory React state
- Three mock claimed movements in seed data demonstrate all three reporting good types
- The reporting good column uses a simple text cell (no badge needed)

