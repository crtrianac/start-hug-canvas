import { DeliveryItem, ReportingGood, TimelineEvent } from "@/data/registryData";

export interface BatchClaimArgs {
  deliveryItemIds: string[];
  reportingGood: ReportingGood;
  onBehalfOf?: string;
  now?: Date;
}

function formatTimestamp(date: Date) {
  return date.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

let claimCounter = 100;
function nextClaimId(now: Date) {
  claimCounter += 1;
  return `CLAIM-${now.getFullYear()}-${String(claimCounter).padStart(3, "0")}`;
}

export interface BatchGroup {
  customer: string;
  salesDocument: string;
  items: DeliveryItem[];
  totalTons: number;
  totalEmissions: number;
  hasClaimable: boolean;
}

/**
 * Groups delivery items by customer + sales document so the user can pick a whole
 * sales document (and all its delivery items) at once.
 */
export function groupBySalesDocument(items: DeliveryItem[]): BatchGroup[] {
  const map = new Map<string, BatchGroup>();
  for (const item of items) {
    const key = `${item.customer}::${item.salesDocument}`;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
      existing.totalTons += item.tons;
      existing.totalEmissions += item.totalEmissions ?? 0;
      if (item.status === "Booked") existing.hasClaimable = true;
    } else {
      map.set(key, {
        customer: item.customer,
        salesDocument: item.salesDocument,
        items: [item],
        totalTons: item.tons,
        totalEmissions: item.totalEmissions ?? 0,
        hasClaimable: item.status === "Booked",
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.customer === b.customer ? a.salesDocument.localeCompare(b.salesDocument) : a.customer.localeCompare(b.customer)
  );
}

export function applyBatchClaim(items: DeliveryItem[], args: BatchClaimArgs): DeliveryItem[] {
  const targetIds = new Set(args.deliveryItemIds);
  if (targetIds.size === 0) return items;

  const now = args.now ?? new Date();
  const claimBatchId = nextClaimId(now);
  const claimDocumentUrl = `/docs/${claimBatchId}.pdf`;
  const nowStr = formatTimestamp(now);
  const itemCount = targetIds.size;

  return items.map((item) => {
    if (!targetIds.has(item.id) || item.status !== "Booked") return item;

    const actor = args.onBehalfOf
      ? `${item.customer} on behalf of ${args.onBehalfOf}`
      : item.customer;

    const claimEvent: TimelineEvent = {
      label: "Certificate retired (claimed)",
      movementId: item.deliveryNumber,
      type: "Claim",
      date: nowStr,
      description: `Batch claim ${claimBatchId} — ${args.reportingGood} (${itemCount} delivery item${itemCount > 1 ? "s" : ""}, shared PDF)`,
      actor,
      documentUrl: claimDocumentUrl,
      tons: item.tons,
    };

    return {
      ...item,
      status: "Claimed" as const,
      reportingGood: args.reportingGood,
      onBehalfOf: args.onBehalfOf,
      claimBatchId,
      claimDocumentUrl,
      timeline: [...item.timeline, claimEvent],
    };
  });
}
