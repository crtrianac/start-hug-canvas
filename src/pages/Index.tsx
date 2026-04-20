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
      setMovements((prev) => {
        const target = prev.find((m) => m.id === movementId);
        if (!target) return prev;

        const originalTons = target.tons;
        const originalEmissions = target.totalEmissions ?? Math.round(originalTons * 0.7);
        const claimedTons = Math.round((originalTons * percentage) / 100);
        const claimedEmissions = Math.round(((originalEmissions * percentage) / 100) * 10) / 10;
        const remainderTons = originalTons - claimedTons;
        const remainderEmissions = Math.round((originalEmissions - claimedEmissions) * 10) / 10;
        const nowStr = new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });

        const claimedMovement: Movement = {
          ...target,
          status: "Claimed",
          movementType: "Claimed",
          tons: claimedTons,
          totalTons: claimedTons,
          totalEmissions: claimedEmissions,
          reportingGood,
          claimedPercentage: percentage,
          claimType,
          onBehalfOf,
          emissionAllocationFactor,
          massBalanceFactor,
          timeline: [
            ...target.timeline,
            {
              label: "Certificate retired (claimed)",
              movementId: target.movementId,
              type: "GoodsMovement",
              date: nowStr,
              description: `Claimed ${percentage}% by ${onBehalfOf ?? target.plantOrCustomer} — ${reportingGood}`,
              actor: onBehalfOf ? `${target.plantOrCustomer} on behalf of ${onBehalfOf}` : target.plantOrCustomer,
              documentUrl: `/docs/${target.movementId}-claim.pdf`,
            },
          ],
        };

        if (remainderTons <= 0) {
          return prev.map((m) => (m.id === movementId ? claimedMovement : m));
        }

        const splitMatch = target.movementId.match(/-S(\d+)[CR]?$/);
        const baseId = target.movementId.replace(/-S\d+[CR]?$/, "");
        const nextSplit = (splitMatch ? parseInt(splitMatch[1], 10) : 0) + 1;
        const claimedId = `${baseId}-S${nextSplit}C`;
        const remainderId = `${baseId}-S${nextSplit}R`;

        const parentRef = target.parentMovementId ?? target.movementId;
        const claimedSplit: Movement = {
          ...claimedMovement,
          id: `${target.id}-c${nextSplit}`,
          movementId: claimedId,
          parentMovementId: parentRef,
        };
        const remainderSplit: Movement = {
          ...target,
          id: `${target.id}-r${nextSplit}`,
          movementId: remainderId,
          status: "Booked",
          movementType: "Booked",
          tons: remainderTons,
          totalTons: remainderTons,
          totalEmissions: remainderEmissions,
          parentMovementId: parentRef,
          timeline: [
            ...target.timeline,
            {
              label: "Certificate transferred",
              movementId: remainderId,
              type: "GoodsMovement",
              date: nowStr,
              description: `Remaining ${remainderTons.toLocaleString()} t after partial claim of ${percentage}%`,
              actor: target.plantOrCustomer,
            },
          ],
        };

        return prev.flatMap((m) =>
          m.id === movementId ? [claimedSplit, remainderSplit] : [m]
        );
      });

      toast({
        title: percentage < 100 ? "Partial claim initiated" : "Claim initiated",
        description:
          percentage < 100
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
