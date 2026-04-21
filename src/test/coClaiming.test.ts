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
    expect(claimedMovement?.tons).toBe(100);

    expect(bookedMovement?.status).toBe("Booked");
    expect(hasBatchCoClaim(bookedMovement!)).toBe(true);
    expect(bookedMovement?.counterpartMovementId).toBe("MOV-2024-008");
    expect(bookedMovement?.tons).toBe(100);

    expect(claimedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
    expect(claimedMovement?.timeline.slice(-2).map((event) => event.tons)).toEqual([100, 100]);
    expect(bookedMovement?.timeline.slice(-2).map((event) => event.label)).toEqual([
      "Batch co-claimed",
      "Certificate retired (claimed)",
    ]);
    expect(bookedMovement?.timeline.slice(-2).map((event) => event.tons)).toEqual([100, 100]);
  });

  it("preserves total tons when partially co-claiming a 200 t booked movement (no double-counting)", () => {
    const target = {
      ...initialMovements.find((m) => m.movementId === "MOV-2024-002")!,
      id: "test-200",
      movementId: "MOV-TEST-200",
      tons: 200,
      totalTons: 200,
      totalEmissions: 140,
      timeline: [],
    };

    const result = applyClaimToMovements([target], {
      movementId: target.id,
      reportingGood: "Industrials",
      percentage: 50,
      claimType: "Allocated",
      now: new Date("2025-02-01T10:00:00Z"),
    });

    // Original row is removed, replaced by two splits whose tons sum to 200
    const stillHasOriginal = result.some((m) => m.id === target.id);
    expect(stillHasOriginal).toBe(false);

    const splits = result.filter((m) => m.id.startsWith(`${target.id}-`));
    const claimed = splits.find((m) => m.status === "Claimed");
    const remainder = splits.find((m) => m.status === "Booked");

    expect(splits).toHaveLength(2);

    expect(claimed?.tons).toBe(100);
    expect(remainder?.tons).toBe(100);
    expect((claimed?.tons ?? 0) + (remainder?.tons ?? 0)).toBe(target.tons);
    expect(claimed?.timeline.slice(-2).map((event) => event.tons)).toEqual([100, 100]);
    expect(remainder?.timeline.slice(-2).map((event) => event.tons)).toEqual([100, 100]);
  });
});