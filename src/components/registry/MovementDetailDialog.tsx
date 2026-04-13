import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Movement } from "@/data/registryData";
import { Separator } from "@/components/ui/separator";

interface Props {
  movement: Movement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function MovementDetailDialog({ movement, open, onOpenChange }: Props) {
  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Movement Details</DialogTitle>
          <DialogDescription className="text-xs">{movement.movementId}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-0">
          <Row label="Material" value={movement.materialName} />
          <Row label="Status" value={<Badge variant="outline" className="text-xs">{movement.status}</Badge>} />
          <Row label="Movement Type" value={movement.movementType} />
          <Row label="Conversion Rate" value={`${movement.conversionRate}%`} />
          <Row label="Tons" value={`${movement.tons.toLocaleString()} t`} />
          <Row label="Timestamp" value={movement.timestamp} />
          <Row label="Plant / Customer" value={movement.plantOrCustomer} />
          <Row label="Compliance Scheme" value={movement.complianceScheme} />
          {movement.reportingGood && (
            <Row label="Reporting Good" value={movement.reportingGood} />
          )}
          {movement.claimedPercentage !== undefined && (
            <Row label="Claimed %" value={`${movement.claimedPercentage}%`} />
          )}
          {movement.onBehalfOf && (
            <Row label="On behalf of" value={movement.onBehalfOf} />
          )}
          {movement.claimType && (
            <Row label="Claim Type" value={movement.claimType} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
