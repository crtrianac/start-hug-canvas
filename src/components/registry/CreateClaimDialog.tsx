import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Movement, ReportingGood, ClaimType } from "@/data/registryData";

interface Props {
  movement: Movement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInitiateClaim: (
    movementId: string,
    reportingGood: ReportingGood,
    percentage: number,
    claimType: ClaimType,
    onBehalfOf?: string,
    emissionAllocationFactor?: number,
    massBalanceFactor?: number
  ) => void;
}

export function CreateClaimDialog({ movement, open, onOpenChange, onInitiateClaim }: Props) {
  const [onBehalf, setOnBehalf] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [reportingGood, setReportingGood] = useState<ReportingGood>("Fertilizers");
  const [percentage, setPercentage] = useState(100);
  const [claimType, setClaimType] = useState<ClaimType>("Proportional");
  const [emissionFactor, setEmissionFactor] = useState(50);
  const [massFactor, setMassFactor] = useState(50);

  useEffect(() => {
    if (open) {
      setOnBehalf(false);
      setCompanyName("");
      setReportingGood("Fertilizers");
      setPercentage(100);
      setClaimType("Proportional");
      setEmissionFactor(50);
      setMassFactor(50);
    }
  }, [open]);

  if (!movement) return null;

  const totalTons = movement.totalTons || movement.tons;
  const totalEmissions = movement.totalEmissions || movement.tons * 0.7;
  const claimedTons = Math.round((totalTons * percentage) / 100);
  const claimedEmissions = Math.round(((totalEmissions * percentage) / 100) * 10) / 10;

  const handleSubmit = () => {
    onInitiateClaim(
      movement.id,
      reportingGood,
      percentage,
      claimType,
      onBehalf ? companyName : undefined,
      claimType === "Allocated" ? emissionFactor : undefined,
      claimType === "Allocated" ? massFactor : undefined
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Create Claim</DialogTitle>
          <DialogDescription className="text-xs">
            {movement.materialName} — {movement.movementId}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="space-y-4">
          {/* On behalf toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">I'm claiming on behalf of another company</Label>
            <Switch checked={onBehalf} onCheckedChange={setOnBehalf} />
          </div>
          {onBehalf && (
            <div>
              <Label className="text-xs text-muted-foreground">Company name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Wheat Farm Poland"
                className="mt-1"
              />
            </div>
          )}

          {/* Reporting good */}
          <div>
            <Label className="text-xs text-muted-foreground">Reporting good</Label>
            <Select value={reportingGood} onValueChange={(v) => setReportingGood(v as ReportingGood)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Industrials">Industrials</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount of verified goods */}
          <div>
            <Label className="text-xs text-muted-foreground">Amount of verified goods</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={claimedTons}
                readOnly
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Out of {totalTons.toLocaleString()} Tons
              </span>
            </div>
          </div>

          {/* Associated emissions */}
          <div>
            <Label className="text-xs text-muted-foreground">Associated emissions</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={claimedEmissions}
                readOnly
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Out of {totalEmissions.toLocaleString()} tCO₂e
              </span>
            </div>
          </div>

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Claim percentage</Label>
              <span className="text-sm font-medium text-foreground">{percentage}%</span>
            </div>
            <Slider
              value={[percentage]}
              onValueChange={([v]) => setPercentage(v)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          {/* Claim type */}
          <div>
            <Label className="text-xs text-muted-foreground">Claim type</Label>
            <Select value={claimType} onValueChange={(v) => setClaimType(v as ClaimType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proportional">Proportional</SelectItem>
                <SelectItem value="Allocated">Allocated (co-claiming)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allocated fields */}
          {claimType === "Allocated" && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Emission allocation factor</Label>
                  <span className="text-xs font-medium">{emissionFactor}% of 100%</span>
                </div>
                <Slider
                  value={[emissionFactor]}
                  onValueChange={([v]) => setEmissionFactor(v)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Mass balance factor</Label>
                  <span className="text-xs font-medium">{massFactor}% of 100%</span>
                </div>
                <Slider
                  value={[massFactor]}
                  onValueChange={([v]) => setMassFactor(v)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Initiate Claim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
