import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Movement } from "@/data/registryData";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { getMovementStatusLabel, hasBatchCoClaim } from "@/lib/coClaiming";

interface Props {
  movement: Movement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenMovement: (movementId: string) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

const dotColor: Record<string, string> = {
  "Certificate issued": "border-muted-foreground",
  "Certificate transferred": "border-status-booked",
  "Certificate retired (claimed)": "border-status-claimed",
  "Batch co-claimed": "border-status-coclaimed",
};

function Timeline({ events, onOpenMovement }: { events: Movement["timeline"]; onOpenMovement: (movementId: string) => void }) {
  return (
    <div className="relative pl-5 space-y-6 mt-4">
      {/* vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
      {events.map((evt, i) => (
        <div key={i} className="relative">
          {/* dot */}
          <div
            className={`absolute -left-5 top-1 h-[18px] w-[18px] rounded-full border-2 bg-background ${dotColor[evt.label] ?? "border-muted-foreground"}`}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{evt.label}</p>
            <p className="text-xs text-muted-foreground">Movement Id: {evt.movementId}</p>
            <p className="text-xs text-muted-foreground">{evt.date}</p>
            <p className="text-xs text-muted-foreground">{evt.description}</p>
            {typeof evt.tons === "number" && (
              <p className="text-xs font-medium text-foreground">Amount: {evt.tons.toLocaleString()} t</p>
            )}
            {evt.actor && (
              <p className="text-xs text-muted-foreground">By: {evt.actor}</p>
            )}
            {evt.relatedMovementId && (
              <Button
                variant="link"
                size="sm"
                className="mt-0.5 h-auto p-0 text-xs"
                onClick={() => onOpenMovement(evt.relatedMovementId!)}
              >
                <Link2 className="h-3 w-3" /> Related movement: {evt.relatedMovementId}
              </Button>
            )}
            {evt.label === "Certificate retired (claimed)" && evt.documentUrl && (
              <a
                href={evt.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-block mt-0.5"
              >
                View documentation →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MovementDetailDialog({ movement, open, onOpenChange, onOpenMovement }: Props) {
  if (!movement) return null;

  const estimatedNH3 = Math.round(movement.tons * (movement.conversionRate / 100) * 10) / 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Movement Details</DialogTitle>
          <DialogDescription className="text-xs">{movement.movementId}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-0">
          <Row label="Material" value={movement.materialName} />
          <Row label="Status" value={<Badge variant="outline" className="text-xs">{getMovementStatusLabel(movement)}</Badge>} />
          {hasBatchCoClaim(movement) && (
            <Row label="Batch" value={<Badge variant="outline" className="text-xs">Batch co-claimed</Badge>} />
          )}
          <Row label="Movement Type" value={movement.movementType} />
          <Row label="Conversion Rate" value={`${movement.conversionRate}%`} />
          <Row label="Tons" value={`${movement.tons.toLocaleString()} t`} />
          <Row label="Estimated NH₃ used" value={`${estimatedNH3.toLocaleString()} t`} />
          <Row label="Ammonia type" value={movement.complianceScheme} />
          <Row label="Original plant" value={movement.originPlant ?? "—"} />
          <Row label="Timestamp" value={movement.timestamp} />
          <Row label="Plant / Customer" value={movement.plantOrCustomer} />
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
          {movement.parentMovementId && (
            <Row label="Split from" value={movement.parentMovementId} />
          )}
          {movement.counterpartMovementId && (
            <Row
              label="Co-claimed with"
              value={
                <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={() => onOpenMovement(movement.counterpartMovementId!)}>
                  <Link2 className="h-3 w-3" />
                  {movement.counterpartMovementId}
                </Button>
              }
            />
          )}
        </div>
        <Separator />
        <p className="text-sm font-semibold text-foreground">Certificate Timeline</p>
        <Timeline events={movement.timeline} onOpenMovement={onOpenMovement} />
      </DialogContent>
    </Dialog>
  );
}
