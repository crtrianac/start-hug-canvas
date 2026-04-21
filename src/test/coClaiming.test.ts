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
});