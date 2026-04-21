import { describe, expect, it } from "vitest";

import { initialMovements } from "@/data/registryData";
import { applyClaimToMovements, getMovementStatusLabel, hasBatchCoClaim, isCoClaimedMovement } from "@/lib/coClaiming";

describe("co-claiming flow", () => {
  it("keeps the remainder booked and links both split movements during partial co-claiming", () => {
    const result = applyClaimToMovements(initialMovements, {
      movementId: "2",
      reportingGood: "Fertilizers",
      percentage: 40,
      claimType: "Allocated",
      emissionAllocationFactor: 60,
      massBalanceFactor: 40,
      now: new Date("2025-01-01T12:00:00Z"),
    });

    const claimedMovement = result.find((movement) => movement.movementId === "MOV-2024-002-S1C");
    const bookedMovement = result.find((movement) => movement.movementId === "MOV-2024-002-S1R");

    expect(claimedMovement).toBeDefined();
    expect(bookedMovement).toBeDefined();

    expect(isCoClaimedMovement(claimedMovement!)).toBe(true);
    expect(getMovementStatusLabel(claimedMovement!)).toBe("Co-claimed");
    expect(claimedMovement?.counterpartMovementId).toBe("MOV-2024-002-S1R");

    expect(bookedMovement?.status).toBe("Booked");
    expect(hasBatchCoClaim(bookedMovement!)).toBe(true);
    expect(bookedMovement?.counterpartMovementId).toBe("MOV-2024-002-S1C");

    expect(claimedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
    expect(bookedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
    expect(bookedMovement?.timeline.at(-1)?.relatedMovementId).toBe("MOV-2024-002-S1C");
  });

  it("seeds MOV-2024-008 as a co-claimed movement with a linked booked batch", () => {
    const claimedMovement = initialMovements.find((movement) => movement.movementId === "MOV-2024-008");
    const bookedMovement = initialMovements.find((movement) => movement.movementId === "MOV-2024-008-R1");

    expect(claimedMovement).toBeDefined();
    expect(bookedMovement).toBeDefined();

    expect(isCoClaimedMovement(claimedMovement!)).toBe(true);
    expect(getMovementStatusLabel(claimedMovement!)).toBe("Co-claimed");
    expect(claimedMovement?.counterpartMovementId).toBe("MOV-2024-008-R1");

    expect(bookedMovement?.status).toBe("Booked");
    expect(hasBatchCoClaim(bookedMovement!)).toBe(true);
    expect(bookedMovement?.counterpartMovementId).toBe("MOV-2024-008");

    expect(claimedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
    expect(bookedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
  });

  it("preserves total tons when partially co-claiming a 200 t booked movement (no double-counting)", () => {
    // Use the seeded booked remainder MOV-2024-008-R1 (200 t) and co-claim 50%
    const target = initialMovements.find((m) => m.movementId === "MOV-2024-008-R1")!;
    const result = applyClaimToMovements(initialMovements, {
      movementId: target.id,
      reportingGood: "Industrials",
      percentage: 50,
      claimType: "Allocated",
      now: new Date("2025-02-01T10:00:00Z"),
    });

    // Original row is removed, replaced by two splits whose tons sum to 200
    const stillHasOriginal = result.some((m) => m.id === target.id);
    expect(stillHasOriginal).toBe(false);

    const splits = result.filter((m) => m.parentMovementId === (target.parentMovementId ?? target.movementId) && m.id !== target.id);
    const claimed = splits.find((m) => m.status === "Claimed");
    const remainder = splits.find((m) => m.status === "Booked");

    expect(claimed?.tons).toBe(100);
    expect(remainder?.tons).toBe(100);
    expect((claimed?.tons ?? 0) + (remainder?.tons ?? 0)).toBe(target.tons);
  });
});