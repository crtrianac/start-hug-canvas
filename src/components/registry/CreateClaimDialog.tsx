import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DeliveryItem, ReportingGood } from "@/data/registryData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Delivery items that will be claimed (already chosen via filters/selection on the registry). */
  itemsToClaim: DeliveryItem[];
  onConfirm: (reportingGood: ReportingGood, onBehalfOf?: string) => void;
}

export function CreateClaimDialog({ open, onOpenChange, itemsToClaim, onConfirm }: Props) {
  const [onBehalf, setOnBehalf] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [reportingGood, setReportingGood] = useState<ReportingGood>("Fertilizers");

  useEffect(() => {
    if (open) {
      setOnBehalf(false);
      setCompanyName("");
      setReportingGood("Fertilizers");
    }
  }, [open]);

  const totalTons = itemsToClaim.reduce((s, i) => s + i.tons, 0);
  const totalEmissions = itemsToClaim.reduce((s, i) => s + (i.totalEmissions ?? 0), 0);
  const customers = Array.from(new Set(itemsToClaim.map((i) => i.customer)));
  const countries = Array.from(new Set(itemsToClaim.map((i) => i.country)));
  const salesDocs = Array.from(new Set(itemsToClaim.map((i) => i.salesDocument)));

  const handleSubmit = () => {
    if (itemsToClaim.length === 0) return;
    onConfirm(reportingGood, onBehalf ? companyName : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Confirm Batch Claim</DialogTitle>
          <DialogDescription className="text-xs">
            Review the summary below. To change the scope, close this dialog and adjust the filters or selection.
            One shared PDF will be issued for the entire batch.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery items:</span>
              <span className="font-semibold">{itemsToClaim.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales documents:</span>
              <span className="font-semibold">{salesDocs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customers:</span>
              <span className="font-semibold truncate max-w-[60%] text-right">
                {customers.length === 1 ? customers[0] : `${customers.length} customers`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Countries:</span>
              <span className="font-semibold truncate max-w-[60%] text-right">
                {countries.length <= 2 ? countries.join(", ") : `${countries.length} countries`}
              </span>
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total tons:</span>
              <span className="font-semibold">{totalTons.toLocaleString()} t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total emissions:</span>
              <span className="font-semibold">{totalEmissions.toLocaleString()} tCO₂e</span>
            </div>
          </div>

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
          <Button onClick={handleSubmit} disabled={itemsToClaim.length === 0}>
            Confirm claim ({itemsToClaim.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
