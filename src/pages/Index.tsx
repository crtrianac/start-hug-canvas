import { useState, useCallback } from "react";
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
  product: "all",
  country: "all",
  movementType: "all",
  timeframe: "all",
};

export default function Index() {
  const [items, setItems] = useState<DeliveryItem[]>(initialDeliveryItems);
  const [filters, setFilters] = useState(defaultFilters);
  const [detailItem, setDetailItem] = useState<DeliveryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialClaimSelection, setInitialClaimSelection] = useState<string[]>([]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const filteredItems = items.filter((m) => {
    if (filters.product !== "all") {
      if (filters.product === "nitromag" && !m.materialName.includes("Nitromag")) return false;
      if (filters.product === "axan" && !m.materialName.includes("Axan")) return false;
    }
    if (filters.movementType !== "all" && m.status !== filters.movementType) return false;
    if (filters.plant !== "all") {
      if (filters.plant === "brunsbuttel" && m.originPlant !== "Brunsbüttel") return false;
      if (filters.plant === "hull" && m.originPlant !== "Hull") return false;
    }
    return true;
  });

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

  const openBatchClaim = useCallback(() => {
    setInitialClaimSelection(Array.from(selectedIds));
    setClaimOpen(true);
  }, [selectedIds]);

  const claimGroup = useCallback((ids: string[]) => {
    setInitialClaimSelection(ids);
    setClaimOpen(true);
  }, []);

  const handleConfirmClaim = useCallback(
    (selectedDeliveryIds: string[], reportingGood: ReportingGood, onBehalfOf?: string) => {
      setItems((prev) => applyBatchClaim(prev, { deliveryItemIds: selectedDeliveryIds, reportingGood, onBehalfOf }));
      setSelectedIds(new Set());
      toast({
        title: "Batch claim initiated",
        description: `${selectedDeliveryIds.length} delivery item(s) claimed as ${reportingGood}. One shared PDF generated.`,
      });
    },
    []
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

  const claimableItems = items.filter((i) => i.status === "Booked");

  return (
    <AppLayout>
      <Tabs defaultValue="registry" className="w-full">
        <TabsContent value="registry" className="space-y-0">
          <AIChatPlaceholder />
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={() => setFilters(defaultFilters)}
          />
          <MovementsTable
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectGroup={toggleSelectGroup}
            onViewDetails={handleViewDetails}
            onClaimGroup={claimGroup}
            onOpenBatchClaim={openBatchClaim}
            onExportCSV={handleExportCSV}
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
        claimableItems={claimableItems}
        initialSelectedIds={initialClaimSelection}
        onConfirm={handleConfirmClaim}
      />
    </AppLayout>
  );
}
