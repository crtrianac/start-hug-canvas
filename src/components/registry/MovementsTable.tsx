import { Award, FileDown, Eye, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeliveryItem } from "@/data/registryData";

interface Props {
  items: DeliveryItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectGroup: (ids: string[], shouldSelect: boolean) => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onViewDetails: (item: DeliveryItem) => void;
  onExportCSV: () => void;
  filteredClaimableIds: string[];
  onClaimAllFiltered: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Issued: "bg-primary/10 text-primary border-primary/20",
    Booked: "bg-status-booked/10 text-status-booked-foreground border-status-booked/20",
    Claimed: "bg-status-claimed/10 text-status-claimed-foreground border-status-claimed/20",
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles[status] || ""}`}>
      {status}
    </Badge>
  );
}

interface Group {
  key: string;
  customer: string;
  salesDocument: string;
  items: DeliveryItem[];
  totalTons: number;
  status: "Booked" | "Claimed" | "Issued" | "Mixed";
  claimBatchId?: string;
  countries: Set<string>;
  dates: Set<string>;
  plants: Set<string>;
  isIssued: boolean;
}

function buildGroups(items: DeliveryItem[]): Group[] {
  const map = new Map<string, Group>();
  for (const item of items) {
    const key = `${item.customer}::${item.salesDocument}`;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
      existing.totalTons += item.tons;
      existing.countries.add(item.country);
      existing.dates.add(item.actualGIDate);
      existing.plants.add(item.originPlant);
      if (existing.status !== item.status) existing.status = "Mixed";
      if (item.status !== "Issued") existing.isIssued = false;
    } else {
      map.set(key, {
        key,
        customer: item.customer,
        salesDocument: item.salesDocument,
        items: [item],
        totalTons: item.tons,
        status: item.status,
        claimBatchId: item.claimBatchId,
        countries: new Set([item.country]),
        dates: new Set([item.actualGIDate]),
        plants: new Set([item.originPlant]),
        isIssued: item.status === "Issued",
      });
    }
  }
  return Array.from(map.values());
}

function formatPlants(plants: Set<string>): string {
  const arr = Array.from(plants);
  if (arr.length === 1) return arr[0];
  return `${arr.length} plants`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatGroupDate(dates: Set<string>): string {
  const sorted = Array.from(dates).sort();
  if (sorted.length === 1) return formatDate(sorted[0]);
  return `${formatDate(sorted[0])} → ${formatDate(sorted[sorted.length - 1])}`;
}

function formatCountries(countries: Set<string>): string {
  const arr = Array.from(countries);
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(", ");
  return `${arr.length} countries`;
}

export function MovementsTable({
  items,
  selectedIds,
  onToggleSelect,
  onToggleSelectGroup,
  onSelectAllFiltered,
  onClearSelection,
  onViewDetails,
  onExportCSV,
  filteredClaimableIds,
  onClaimAllFiltered,
}: Props) {
  const groups = useMemo(() => buildGroups(items), [items]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const allExpanded = groups.length > 0 && expanded.size === groups.length;
  const expandAll = () => setExpanded(new Set(groups.map((g) => g.key)));
  const collapseAll = () => setExpanded(new Set());

  const totalTons = items.reduce((s, i) => s + i.tons, 0);
  const issuedTons = items.filter((i) => i.status === "Issued").reduce((s, i) => s + i.tons, 0);
  const bookedTons = items.filter((i) => i.status === "Booked").reduce((s, i) => s + i.tons, 0);
  const claimedTons = items.filter((i) => i.status === "Claimed").reduce((s, i) => s + i.tons, 0);

  const selectedCount = selectedIds.size;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
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
        <div className="ml-auto flex items-center gap-2">
          {groups.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={allExpanded ? collapseAll : expandAll}
              className="text-xs"
            >
              {allExpanded ? (
                <><ChevronsDownUp className="h-3.5 w-3.5 mr-1" /> Collapse all</>
              ) : (
                <><ChevronsUpDown className="h-3.5 w-3.5 mr-1" /> Expand all</>
              )}
            </Button>
          )}
          {filteredClaimableIds.length > 0 && (
            <Button
              size="sm"
              onClick={onClaimAllFiltered}
              disabled={selectedCount === 0}
              className="text-xs"
            >
              <Award className="h-3.5 w-3.5 mr-1" /> Claim all filtered ({selectedCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onExportCSV} className="text-xs">
            <FileDown className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-xs font-semibold">Customer / Plant</TableHead>
              <TableHead className="text-xs font-semibold">Sales Document</TableHead>
              <TableHead className="text-xs font-semibold">Actual GI Date</TableHead>
              <TableHead className="text-xs font-semibold">Country</TableHead>
              <TableHead className="text-xs font-semibold">Delivery Items</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">Total Tons</TableHead>
              <TableHead className="text-xs font-semibold">Reporting Good</TableHead>
              <TableHead className="text-xs font-semibold">Claim ID</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => {
              const isOpen = expanded.has(g.key);
              const claimableIds = g.items.filter((i) => i.status === "Booked").map((i) => i.id);
              const allSelected = claimableIds.length > 0 && claimableIds.every((id) => selectedIds.has(id));
              const someSelected = claimableIds.some((id) => selectedIds.has(id));

              return (
                <>
                  <TableRow key={g.key} className="hover:bg-muted/30">
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggle(g.key)}>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {claimableIds.length > 0 && (
                        <Checkbox
                          checked={allSelected ? true : someSelected ? "indeterminate" : false}
                          onCheckedChange={(v) => onToggleSelectGroup(claimableIds, v === true)}
                          aria-label="Select sales document"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {g.isIssued ? (
                        <span>
                          {formatPlants(g.plants)}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(plant)</span>
                        </span>
                      ) : (
                        g.customer
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{g.salesDocument}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatGroupDate(g.dates)}</TableCell>
                    <TableCell className="text-xs">{formatCountries(g.countries)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{g.items.length} item{g.items.length > 1 ? "s" : ""}</TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} />
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium">{g.totalTons.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{g.items[0].reportingGood ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{g.claimBatchId ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {g.status === "Claimed" && g.items[0].claimDocumentUrl && (
                          <a
                            href={g.items[0].claimDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground inline-flex items-center px-2 h-7 hover:text-foreground"
                          >
                            <FileDown className="h-3 w-3 mr-1" /> Shared PDF
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {isOpen &&
                    g.items.map((item) => (
                      <TableRow key={item.id} className="bg-muted/10 hover:bg-muted/20">
                        <TableCell></TableCell>
                        <TableCell>
                          {item.status === "Booked" && (
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={() => onToggleSelect(item.id)}
                              aria-label={`Select delivery ${item.deliveryNumber}`}
                            />
                          )}
                        </TableCell>
                        <TableCell colSpan={2} className="text-xs text-muted-foreground pl-8">
                          ↳ Delivery <span className="font-mono">{item.deliveryNumber}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.actualGIDate)}</TableCell>
                        <TableCell className="text-xs">{item.country}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{item.materialName}</TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="text-sm text-right">{item.tons.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{item.reportingGood ?? "—"}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{item.claimBatchId ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2"
                            onClick={() => onViewDetails(item)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
