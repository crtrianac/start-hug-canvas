import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIChatPlaceholder } from "@/components/registry/AIChatPlaceholder";
import { FilterBar } from "@/components/registry/FilterBar";
import { MovementsTable } from "@/components/registry/MovementsTable";
import { MovementDetailDialog } from "@/components/registry/MovementDetailDialog";
import { CreateClaimDialog } from "@/components/registry/CreateClaimDialog";
import { CarbonDatabaseTab } from "@/components/registry/CarbonDatabaseTab";
import { initialMovements, Movement, ReportingGood, ClaimType } from "@/data/registryData";
import { toast } from "@/hooks/use-toast";
import { applyClaimToMovements } from "@/lib/coClaiming";

const defaultFilters = {
  product: "all",
  plant: "all",
  movementType: "all",
  timeframe: "all",
};

export default function Index() {
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [filters, setFilters] = useState(defaultFilters);
  const [detailMovement, setDetailMovement] = useState<Movement | null>(null);
  const [claimMovement, setClaimMovement] = useState<Movement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const filteredMovements = movements.filter((m) => {
    if (filters.product !== "all") {
      if (filters.product === "nitromag" && !m.materialName.includes("Nitromag")) return false;
      if (filters.product === "axan" && !m.materialName.includes("Axan")) return false;
    }
    if (filters.movementType !== "all" && m.movementType !== filters.movementType) return false;
    if (filters.plant !== "all") {
      if (filters.plant === "brunsbuttel" && m.plantOrCustomer !== "Brunsbüttel") return false;
      if (filters.plant === "hull" && m.plantOrCustomer !== "Hull") return false;
    }
    return true;
  });

  const handleViewDetails = useCallback((m: Movement) => {
    setDetailMovement(m);
    setDetailOpen(true);
  }, []);

  const handleOpenClaim = useCallback((m: Movement) => {
    setClaimMovement(m);
    setClaimOpen(true);
  }, []);

  const handleOpenLinkedMovement = useCallback(
    (movementId: string) => {
      const linkedMovement = movements.find((movement) => movement.movementId === movementId);

      if (!linkedMovement) {
        toast({ title: "Movement not found", description: `Could not locate movement ${movementId}.` });
        return;
      }

      setDetailMovement(linkedMovement);
      setDetailOpen(true);
    },
    [movements]
  );

  const handleInitiateClaim = useCallback(
    (
      movementId: string,
      reportingGood: ReportingGood,
      percentage: number,
      claimType: ClaimType,
      onBehalfOf?: string,
      emissionAllocationFactor?: number,
      massBalanceFactor?: number
    ) => {
      setMovements((prev) =>
        applyClaimToMovements(prev, {
          movementId,
          reportingGood,
          percentage,
          claimType,
          onBehalfOf,
          emissionAllocationFactor,
          massBalanceFactor,
        })
      );

      toast({
        title:
          claimType === "Allocated"
            ? percentage < 100
              ? "Partial co-claim initiated"
              : "Co-claim initiated"
            : percentage < 100
              ? "Partial claim initiated"
              : "Claim initiated",
        description:
          claimType === "Allocated" && percentage < 100
            ? `${percentage}% is now co-claimed. The linked remainder stays Booked with a batch co-claimed reference.`
            : percentage < 100
              ? `${percentage}% claimed as "${reportingGood}". Remainder stays Booked and can still be claimed.`
              : `Movement ${movementId} has been claimed as "${reportingGood}".`,
      });
    },
    []
  );

  const handleExportCSV = useCallback(() => {
    const headers = [
      "Material Name", "Status", "Movement Type", "Conversion Rate",
      "Tons", "Movement ID", "Timestamp", "Plant/Customer", "Reporting Good",
    ];
    const rows = filteredMovements.map((m) => [
      m.materialName, m.status, m.movementType, `${m.conversionRate}%`,
      m.tons, m.movementId, m.timestamp, m.plantOrCustomer, m.reportingGood || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registry_movements.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: "Registry movements exported successfully." });
  }, [filteredMovements]);

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
            movements={filteredMovements}
            onViewDetails={handleViewDetails}
            onClaim={handleOpenClaim}
            onExportCSV={handleExportCSV}
          />
        </TabsContent>

        <TabsContent value="carbon">
          <CarbonDatabaseTab />
        </TabsContent>
      </Tabs>

      <MovementDetailDialog
        movement={detailMovement}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onOpenMovement={handleOpenLinkedMovement}
      />
      <CreateClaimDialog
        movement={claimMovement}
        open={claimOpen}
        onOpenChange={setClaimOpen}
        onInitiateClaim={handleInitiateClaim}
      />
    </AppLayout>
  );
}
