import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DeliveryItem, ReportingGood } from "@/data/registryData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** All claimable (Booked) delivery items in the registry. */
  claimableItems: DeliveryItem[];
  /** Pre-selected delivery item IDs. User can adjust before confirming. */
  initialSelectedIds: string[];
  onConfirm: (selectedIds: string[], reportingGood: ReportingGood, onBehalfOf?: string) => void;
}

export function CreateClaimDialog({ open, onOpenChange, claimableItems, initialSelectedIds, onConfirm }: Props) {
  const [onBehalf, setOnBehalf] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [reportingGood, setReportingGood] = useState<ReportingGood>("Fertilizers");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [salesDocFilter, setSalesDocFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setOnBehalf(false);
      setCompanyName("");
      setReportingGood("Fertilizers");
      setCustomerFilter("all");
      setSalesDocFilter("all");
      setSelected(new Set(initialSelectedIds));
    }
  }, [open, initialSelectedIds]);

  const customers = useMemo(
    () => Array.from(new Set(claimableItems.map((i) => i.customer))).sort(),
    [claimableItems]
  );

  const salesDocs = useMemo(() => {
    const filtered = customerFilter === "all" ? claimableItems : claimableItems.filter((i) => i.customer === customerFilter);
    return Array.from(new Set(filtered.map((i) => i.salesDocument))).sort();
  }, [claimableItems, customerFilter]);

  const visibleItems = useMemo(() => {
    return claimableItems.filter((i) => {
      if (customerFilter !== "all" && i.customer !== customerFilter) return false;
      if (salesDocFilter !== "all" && i.salesDocument !== salesDocFilter) return false;
      return true;
    });
  }, [claimableItems, customerFilter, salesDocFilter]);

  const toggleItem = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleItems.forEach((i) => next.add(i.id));
      return next;
    });
  };
  const clearVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleItems.forEach((i) => next.delete(i.id));
      return next;
    });
  };

  const selectedItems = claimableItems.filter((i) => selected.has(i.id));
  const totalTons = selectedItems.reduce((s, i) => s + i.tons, 0);
  const totalEmissions = selectedItems.reduce((s, i) => s + (i.totalEmissions ?? 0), 0);

  const handleSubmit = () => {
    if (selected.size === 0) return;
    onConfirm(Array.from(selected), reportingGood, onBehalf ? companyName : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Batch Claim</DialogTitle>
          <DialogDescription className="text-xs">
            Select delivery items to claim together. One PDF will be issued for the entire batch.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Customer / Climate Partner</Label>
              <Select value={customerFilter} onValueChange={(v) => { setCustomerFilter(v); setSalesDocFilter("all"); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  {customers.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sales Document</Label>
              <Select value={salesDocFilter} onValueChange={setSalesDocFilter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sales docs</SelectItem>
                  {salesDocs.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/40 text-xs">
              <span className="text-muted-foreground">{visibleItems.length} delivery item(s) shown · {selected.size} selected</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllVisible}>Select all</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearVisible}>Clear</Button>
              </div>
            </div>
            <ScrollArea className="h-[220px]">
              <div className="divide-y divide-border">
                {visibleItems.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30">
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1 grid grid-cols-[1fr_120px_120px_80px] gap-2 items-center text-xs">
                      <div>
                        <div className="font-medium">{item.customer}</div>
                        <div className="text-muted-foreground">{item.materialName}</div>
                      </div>
                      <div className="font-mono">{item.salesDocument}</div>
                      <div className="font-mono">{item.deliveryNumber}</div>
                      <div className="text-right font-medium">{item.tons.toLocaleString()} t</div>
                    </div>
                  </label>
                ))}
                {visibleItems.length === 0 && (
                  <div className="px-3 py-8 text-center text-xs text-muted-foreground">No claimable delivery items match the filters.</div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Reporting good</Label>
              <Select value={reportingGood} onValueChange={(v) => setReportingGood(v as ReportingGood)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Industrials">Industrials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2 text-xs flex flex-col justify-center">
              <div className="flex justify-between"><span className="text-muted-foreground">Total tons:</span><span className="font-semibold">{totalTons.toLocaleString()} t</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total emissions:</span><span className="font-semibold">{totalEmissions.toLocaleString()} tCO₂e</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Claim on behalf of another company</Label>
            <Switch checked={onBehalf} onCheckedChange={setOnBehalf} />
          </div>
          {onBehalf && (
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={selected.size === 0}>
            Initiate Batch Claim ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
