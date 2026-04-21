import { Award, FileDown, Eye, Link2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Movement } from "@/data/registryData";
import { getMovementStatusLabel, hasBatchCoClaim } from "@/lib/coClaiming";
import { cn } from "@/lib/utils";

interface MovementsTableProps {
  movements: Movement[];
  onViewDetails: (movement: Movement) => void;
  onClaim: (movement: Movement) => void;
  onExportCSV: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Issued: "bg-primary/10 text-primary border-primary/20",
    Booked: "bg-status-booked/10 text-status-booked-foreground border-status-booked/20",
    Claimed: "bg-status-claimed/10 text-status-claimed-foreground border-status-claimed/20",
    "Co-claimed": "bg-status-coclaimed/10 text-status-coclaimed-foreground border-status-coclaimed/20",
    "Batch co-claimed": "bg-status-coclaimed/10 text-status-coclaimed-foreground border-status-coclaimed/20",
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles[status] || ""}`}>
      {status}
    </Badge>
  );
}

function BatchCoClaimBadge() {
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium bg-status-coclaimed/10 text-status-coclaimed-foreground border-status-coclaimed/20"
    >
      Batch co-claimed
    </Badge>
  );
}

export function MovementsTable({ movements, onViewDetails, onClaim, onExportCSV }: MovementsTableProps) {
  const totalTons = movements.reduce((sum, m) => sum + m.tons, 0);
  const issuedTons = movements.filter((m) => m.status === "Issued").reduce((sum, m) => sum + m.tons, 0);
  const bookedTons = movements.filter((m) => m.status === "Booked").reduce((sum, m) => sum + m.tons, 0);
  const claimedTons = movements.filter((m) => m.status === "Claimed").reduce((sum, m) => sum + m.tons, 0);

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-foreground">{totalTons.toLocaleString()} t</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Issued:</span>
          <span className="font-medium text-primary">{issuedTons.toLocaleString()} t</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Booked:</span>
          <span className="font-medium text-status-booked">{bookedTons.toLocaleString()} t</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Claimed:</span>
          <span className="font-medium text-status-claimed">{claimedTons.toLocaleString()} t</span>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={onExportCSV} className="text-xs">
            <FileDown className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold">Material Name</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Conv. Rate</TableHead>
              <TableHead className="text-xs font-semibold text-right">Tons</TableHead>
              <TableHead className="text-xs font-semibold">Movement ID</TableHead>
              <TableHead className="text-xs font-semibold">Date</TableHead>
              <TableHead className="text-xs font-semibold">Plant / Customer</TableHead>
              <TableHead className="text-xs font-semibold">Reporting Good</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => {
              const relatedMovement = m.counterpartMovementId
                ? movements.find((candidate) => candidate.movementId === m.counterpartMovementId)
                : undefined;

              return (
              <TableRow key={m.id} id={`movement-row-${m.movementId}`} className="hover:bg-muted/30">
                <TableCell className="text-sm font-medium max-w-[200px] truncate">{m.materialName}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 items-start">
                    <StatusBadge status={getMovementStatusLabel(m)} />
                    {hasBatchCoClaim(m) && <BatchCoClaimBadge />}
                    {relatedMovement && (
                      <Button
                        variant="link"
                        size="sm"
                        className={cn("h-auto p-0 text-xs text-muted-foreground", "hover:text-foreground")}
                        onClick={() => onViewDetails(relatedMovement)}
                      >
                        <Link2 className="h-3 w-3" />
                        {relatedMovement.movementId}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{m.conversionRate}%</TableCell>
                <TableCell className="text-sm text-right font-medium">{m.tons.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{m.movementId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.timestamp.split(",")[0]}</TableCell>
                <TableCell className="text-sm">{m.plantOrCustomer}</TableCell>
                <TableCell className="text-sm">{m.reportingGood || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary h-7 px-2"
                      onClick={() => onViewDetails(m)}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Details
                    </Button>
                    {m.status === "Booked" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-status-claimed-foreground h-7 px-2"
                        onClick={() => onClaim(m)}
                      >
                        <Award className="h-3 w-3 mr-1" /> Claim
                      </Button>
                    )}
                    {m.status === "Claimed" && (
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
                        <FileDown className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
