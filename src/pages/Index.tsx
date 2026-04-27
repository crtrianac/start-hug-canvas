import { useState, useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIChatPlaceholder } from "@/components/registry/AIChatPlaceholder";
import { FilterBar } from "@/components/registry/FilterBar";
import { MovementsTable } from "@/components/registry/MovementsTable";
import { MovementDetailDialog } from "@/components/registry/MovementDetailDialog";
import { CreateClaimDialog } from "@/components/registry/CreateClaimDialog";
import { CarbonDatabaseTab } from "@/components/registry/CarbonDatabaseTab";
import { initialDeliveryItems, DeliveryItem, ReportingGood } from "@/data/registryData";
import { toast } from "@/hooks/use-toast";
import { applyBatchClaim } from "@/lib/batchClaim";

const defaultFilters = {
  customer: "all",
  product: "all",
  country: "all",
  movementType: "all",
  dateRange: undefined as DateRange | undefined,
};

export default function Index() {
  const [items, setItems] = useState<DeliveryItem[]>(initialDeliveryItems);
  const [filters, setFilters] = useState(defaultFilters);
  const [detailItem, setDetailItem] = useState<DeliveryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  

  const handleFilterChange = useCallback((key: string, value: string | DateRange | undefined) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const customers = useMemo(
    () => Array.from(new Set(items.filter((i) => i.status !== "Issued").map((i) => i.customer))).sort(),
    [items]
  );

  const plants = useMemo(
    () => Array.from(new Set(items.map((i) => i.originPlant))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => items.filter((m) => {
    if (filters.customer !== "all") {
      if (filters.customer.startsWith("plant:")) {
        if (m.originPlant !== filters.customer.slice(6)) return false;
      } else if (m.customer !== filters.customer) return false;
    }
    if (filters.product !== "all") {
      if (filters.product === "nitromag" && !m.materialName.includes("Nitromag")) return false;
      if (filters.product === "axan" && !m.materialName.includes("Axan")) return false;
    }
    if (filters.movementType !== "all" && m.status !== filters.movementType) return false;
    if (filters.country !== "all" && m.country !== filters.country) return false;
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
          <AIChatPlaceholder />
          <FilterBar
            filters={filters}
            customers={customers}
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
