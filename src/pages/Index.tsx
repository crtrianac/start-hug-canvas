import { useState, useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";

import { FilterBar, type Filters } from "@/components/registry/FilterBar";
import { MovementsTable } from "@/components/registry/MovementsTable";
import { MovementDetailDialog } from "@/components/registry/MovementDetailDialog";
import { CreateClaimDialog } from "@/components/registry/CreateClaimDialog";
import { SendClaimDialog } from "@/components/registry/SendClaimDialog";
import { CarbonDatabaseTab } from "@/components/registry/CarbonDatabaseTab";
import { initialDeliveryItems, DeliveryItem, ReportingGood, TimelineEvent } from "@/data/registryData";
import { toast } from "@/hooks/use-toast";
import { applyBatchClaim } from "@/lib/batchClaim";

const defaultFilters: Filters = {
  customers: [],
  products: [],
  countries: [],
  movementTypes: [],
  dateRange: undefined,
};

export default function Index() {
  const [items, setItems] = useState<DeliveryItem[]>(initialDeliveryItems);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [detailItem, setDetailItem] = useState<DeliveryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [sendClaimItem, setSendClaimItem] = useState<DeliveryItem | null>(null);
  const [sendClaimOpen, setSendClaimOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleOpenSendClaim = useCallback((item: DeliveryItem) => {
    setSendClaimItem(item);
    setSendClaimOpen(true);
  }, []);

  const handleConfirmSendClaim = useCallback(
    ({ recipientEmail, recipientName, comments }: { recipientEmail: string; recipientName: string; comments: string }) => {
      if (!sendClaimItem) return;
      const target = sendClaimItem;
      const sender = "current.user@yara.com";
      const now = new Date();
      const dateStr = now.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });

      // Append the event to every delivery item that shares the same batch claim
      setItems((prev) =>
        prev.map((it) => {
          const sameBatch = target.claimBatchId && it.claimBatchId === target.claimBatchId;
          const sameItem = it.id === target.id;
          if (!sameBatch && !sameItem) return it;
          const event: TimelineEvent = {
            label: "Claim sent to customer",
            movementId: it.deliveryNumber,
            type: "ClaimSent",
            date: dateStr,
            description: `Claim ${target.claimBatchId ?? ""} sent to customer`.trim(),
            actor: sender,
            recipient: `${recipientName} <${recipientEmail}>`,
            comments: comments || undefined,
            documentUrl: it.claimDocumentUrl,
          };
          return { ...it, timeline: [...it.timeline, event] };
        })
      );

      // Keep dialog state in sync so detail view reflects the new event
      setDetailItem((curr) => {
        if (!curr) return curr;
        const sameBatch = target.claimBatchId && curr.claimBatchId === target.claimBatchId;
        if (!sameBatch && curr.id !== target.id) return curr;
        const event: TimelineEvent = {
          label: "Claim sent to customer",
          movementId: curr.deliveryNumber,
          type: "ClaimSent",
          date: dateStr,
          description: `Claim ${target.claimBatchId ?? ""} sent to customer`.trim(),
          actor: sender,
          recipient: `${recipientName} <${recipientEmail}>`,
          comments: comments || undefined,
          documentUrl: curr.claimDocumentUrl,
        };
        return { ...curr, timeline: [...curr.timeline, event] };
      });

      toast({
        title: "Claim sent",
        description: `Claim ${target.claimBatchId ?? ""} sent to ${recipientName} (${recipientEmail}).`,
      });
    },
    [sendClaimItem]
  );
  

  const handleFilterChange = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const customers = useMemo(
    () => Array.from(new Set(items.filter((i) => i.status !== "Issued").map((i) => i.customer))).sort(),
    [items]
  );

  const plants = useMemo(
    () => Array.from(new Set(items.map((i) => i.originPlant))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => items.filter((m) => {
    if (filters.customers.length > 0) {
      const match = filters.customers.some((v) =>
        v.startsWith("plant:") ? m.originPlant === v.slice(6) : m.customer === v
      );
      if (!match) return false;
    }
    if (filters.products.length > 0) {
      const match = filters.products.some((p) =>
        p === "nitromag" ? m.materialName.includes("Nitromag") :
        p === "axan" ? m.materialName.includes("Axan") : false
      );
      if (!match) return false;
    }
    if (filters.movementTypes.length > 0 && !filters.movementTypes.includes(m.status)) return false;
    if (filters.countries.length > 0 && !filters.countries.includes(m.country)) return false;
    if (filters.dateRange?.from) {
      const d = new Date(m.actualGIDate);
      const from = new Date(filters.dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = filters.dateRange.to ? new Date(filters.dateRange.to) : from;
      to.setHours(23, 59, 59, 999);
      if (d < from || d > to) return false;
    }
    return true;
  }), [items, filters]);

  const filteredClaimableIds = useMemo(
    () => filteredItems.filter((i) => i.status === "Booked").map((i) => i.id),
    [filteredItems]
  );

  const handleViewDetails = useCallback((item: DeliveryItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectGroup = useCallback((ids: string[], shouldSelect: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (shouldSelect ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds(new Set(filteredClaimableIds));
  }, [filteredClaimableIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const openClaimConfirm = useCallback(() => {
    if (selectedIds.size === 0) return;
    setClaimOpen(true);
  }, [selectedIds]);

  const handleConfirmClaim = useCallback(
    (reportingGood: ReportingGood, onBehalfOf?: string) => {
      const ids = Array.from(selectedIds);
      setItems((prev) => applyBatchClaim(prev, { deliveryItemIds: ids, reportingGood, onBehalfOf }));
      setSelectedIds(new Set());
      toast({
        title: "Batch claim initiated",
        description: `${ids.length} delivery item(s) claimed as ${reportingGood}. One shared PDF generated.`,
      });
    },
    [selectedIds]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["Customer", "Sales Document", "Delivery Number", "Actual GI Date", "Country", "Delivery Address", "Material", "Status", "Tons", "Reporting Good", "Claim Batch ID"];
    const rows = filteredItems.map((m) => [
      m.customer, m.salesDocument, m.deliveryNumber, m.actualGIDate, m.country, m.deliveryAddress,
      m.materialName, m.status, m.tons, m.reportingGood ?? "", m.claimBatchId ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registry_delivery_items.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: "Registry delivery items exported." });
  }, [filteredItems]);

  const itemsToClaim = useMemo(
    () => items.filter((i) => selectedIds.has(i.id) && i.status === "Booked"),
    [items, selectedIds]
  );

  return (
    <AppLayout>
      <Tabs defaultValue="registry" className="w-full">
        <TabsContent value="registry" className="space-y-0">
          <FilterBar
            filters={filters}
            customers={customers}
            plants={plants}
            onFilterChange={handleFilterChange}
            onClearAll={() => setFilters(defaultFilters)}
          />
          <MovementsTable
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectGroup={toggleSelectGroup}
            onSelectAllFiltered={selectAllFiltered}
            onClearSelection={clearSelection}
            onViewDetails={handleViewDetails}
            onExportCSV={handleExportCSV}
            filteredClaimableIds={filteredClaimableIds}
            onClaimAllFiltered={openClaimConfirm}
          />
        </TabsContent>

        <TabsContent value="carbon">
          <CarbonDatabaseTab />
        </TabsContent>
      </Tabs>

      <MovementDetailDialog item={detailItem} open={detailOpen} onOpenChange={setDetailOpen} />
      <CreateClaimDialog
        open={claimOpen}
        onOpenChange={setClaimOpen}
        itemsToClaim={itemsToClaim}
        onConfirm={handleConfirmClaim}
      />
    </AppLayout>
  );
}
