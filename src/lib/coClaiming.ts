import { ClaimType, Movement, ReportingGood, TimelineEvent } from "@/data/registryData";

interface ApplyClaimArgs {
  movementId: string;
  reportingGood: ReportingGood;
  percentage: number;
  claimType: ClaimType;
  onBehalfOf?: string;
  emissionAllocationFactor?: number;
  massBalanceFactor?: number;
  now?: Date;
}

function buildClaimDocumentUrl(movementId: string) {
  return `/docs/${movementId}-claim.pdf`;
}

function formatTimestamp(date: Date) {
  return date.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function createSplitMovementIds(movementId: string) {
  const splitMatch = movementId.match(/-S(\d+)[CR]?$/);
  const baseId = movementId.replace(/-S\d+[CR]?$/, "");
  const nextSplit = (splitMatch ? parseInt(splitMatch[1], 10) : 0) + 1;

  return {
    nextSplit,
    claimedId: `${baseId}-S${nextSplit}C`,
    remainderId: `${baseId}-S${nextSplit}R`,
  };
}

function createCoClaimTimelineEvents({
  target,
  claimedId,
  remainderId,
  reportingGood,
  percentage,
  nowStr,
  actor,
}: {
  target: Movement;
  claimedId: string;
  remainderId: string;
  reportingGood: ReportingGood;
  percentage: number;
  nowStr: string;
  actor: string;
}): { claimedEvents: TimelineEvent[]; remainderEvents: TimelineEvent[] } {
  return {
    claimedEvents: [
      {
        label: "Batch co-claimed",
        movementId: claimedId,
        type: "CoClaim",
        date: nowStr,
        description: `Co-claimed ${percentage}% of the batch with remaining booked movement ${remainderId}`,
        actor,
        relatedMovementId: remainderId,
      },
      {
        label: "Certificate retired (claimed)",
        movementId: claimedId,
        type: "Claim",
        date: nowStr,
        description: `Co-claimed as ${reportingGood}. Remaining booked batch ${remainderId} stays available.`,
        actor,
        documentUrl: buildClaimDocumentUrl(claimedId),
        relatedMovementId: remainderId,
      },
    ],
    remainderEvents: [
      {
        label: "Batch co-claimed",
        movementId: remainderId,
        type: "CoClaim",
        date: nowStr,
        description: `Remaining batch stays booked after co-claim with movement ${claimedId}`,
        actor,
        relatedMovementId: claimedId,
      },
      {
        label: "Certificate retired (claimed)",
        movementId: claimedId,
        type: "Claim",
        date: nowStr,
        description: `Related co-claimed movement ${claimedId} was retired as ${reportingGood}`,
        actor,
        documentUrl: buildClaimDocumentUrl(claimedId),
        relatedMovementId: claimedId,
      },
    ],
  };
}

export function isCoClaimedMovement(movement: Movement) {
  return movement.status === "Claimed" && movement.claimType === "Allocated";
}

export function hasBatchCoClaim(movement: Movement) {
  return movement.status === "Booked" && movement.claimType === "Allocated" && Boolean(movement.counterpartMovementId);
}

export function getMovementStatusLabel(movement: Movement) {
  if (isCoClaimedMovement(movement)) return "Co-claimed";
  return movement.status;
}

export function applyClaimToMovements(movements: Movement[], args: ApplyClaimArgs): Movement[] {
  const target = movements.find((movement) => movement.id === args.movementId);

  if (!target) return movements;

  const originalTons = target.tons;
  const originalEmissions = target.totalEmissions ?? Math.round(originalTons * 0.7);
  const claimedTons = Math.round((originalTons * args.percentage) / 100);
  const claimedEmissions = Math.round(((originalEmissions * args.percentage) / 100) * 10) / 10;
  const remainderTons = originalTons - claimedTons;
  const remainderEmissions = Math.round((originalEmissions - claimedEmissions) * 10) / 10;
  const now = args.now ?? new Date();
  const nowStr = formatTimestamp(now);
  const actor = args.onBehalfOf ? `${target.plantOrCustomer} on behalf of ${args.onBehalfOf}` : target.plantOrCustomer;

  if (remainderTons <= 0) {
    const fullyClaimedMovement: Movement = {
      ...target,
      status: "Claimed",
      movementType: "Claimed",
      tons: claimedTons,
      totalTons: claimedTons,
      totalEmissions: claimedEmissions,
      reportingGood: args.reportingGood,
      claimedPercentage: args.percentage,
      claimType: args.claimType,
      onBehalfOf: args.onBehalfOf,
      emissionAllocationFactor: args.emissionAllocationFactor,
      massBalanceFactor: args.massBalanceFactor,
      timeline: [
        ...target.timeline,
        {
          label: "Certificate retired (claimed)",
          movementId: target.movementId,
          type: "Claim",
          date: nowStr,
          description: `Claimed ${args.percentage}% by ${args.onBehalfOf ?? target.plantOrCustomer} — ${args.reportingGood}`,
          actor,
          documentUrl: buildClaimDocumentUrl(target.movementId),
        },
      ],
    };

    return movements.map((movement) =>
      movement.id === args.movementId ? fullyClaimedMovement : movement
    );
  }

  const { nextSplit, claimedId, remainderId } = createSplitMovementIds(target.movementId);
  const parentRef = target.parentMovementId ?? target.movementId;
  const isAllocated = args.claimType === "Allocated";
  const timelineExtensions: { claimedEvents: TimelineEvent[]; remainderEvents: TimelineEvent[] } = isAllocated
    ? createCoClaimTimelineEvents({
        target,
        claimedId,
        remainderId,
        reportingGood: args.reportingGood,
        percentage: args.percentage,
        nowStr,
        actor,
      })
    : {
        claimedEvents: [
          {
            label: "Certificate retired (claimed)",
            movementId: claimedId,
            type: "Claim",
            date: nowStr,
            description: `Claimed ${args.percentage}% by ${args.onBehalfOf ?? target.plantOrCustomer} — ${args.reportingGood}`,
            actor,
            documentUrl: buildClaimDocumentUrl(claimedId),
            relatedMovementId: remainderId,
          },
        ],
        remainderEvents: [
          {
            label: "Certificate transferred",
            movementId: remainderId,
            type: "Transfer",
            date: nowStr,
            description: `Remaining ${remainderTons.toLocaleString()} t after partial claim of ${args.percentage}%`,
            actor: target.plantOrCustomer,
            relatedMovementId: claimedId,
          },
        ],
      };

  const claimedSplit: Movement = {
    ...target,
    id: `${target.id}-c${nextSplit}`,
    movementId: claimedId,
    parentMovementId: parentRef,
    counterpartMovementId: remainderId,
    status: "Claimed",
    movementType: "Claimed",
    tons: claimedTons,
    totalTons: claimedTons,
    totalEmissions: claimedEmissions,
    reportingGood: args.reportingGood,
    claimedPercentage: args.percentage,
    claimType: args.claimType,
    onBehalfOf: args.onBehalfOf,
    emissionAllocationFactor: args.emissionAllocationFactor,
    massBalanceFactor: args.massBalanceFactor,
    timeline: [...target.timeline, ...timelineExtensions.claimedEvents],
  };

  const remainderSplit: Movement = {
    ...target,
    id: `${target.id}-r${nextSplit}`,
    movementId: remainderId,
    parentMovementId: parentRef,
    counterpartMovementId: isAllocated ? claimedId : undefined,
    status: "Booked",
    movementType: "Booked",
    tons: remainderTons,
    totalTons: remainderTons,
    totalEmissions: remainderEmissions,
    claimType: isAllocated ? args.claimType : target.claimType,
    reportingGood: target.reportingGood,
    claimedPercentage: target.claimedPercentage,
    onBehalfOf: target.onBehalfOf,
    emissionAllocationFactor: target.emissionAllocationFactor,
    massBalanceFactor: target.massBalanceFactor,
    timeline: [...target.timeline, ...timelineExtensions.remainderEvents],
  };

  return movements.flatMap((movement) => (movement.id === args.movementId ? [claimedSplit, remainderSplit] : [movement]));
}