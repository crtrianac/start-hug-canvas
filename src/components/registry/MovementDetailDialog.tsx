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

const dotColor: Record<string, string> = {
  "Certificate issued": "border-muted-foreground",
  "Certificate transferred": "border-yellow-500",
  "Certificate retired (claimed)": "border-green-500",
};

function Timeline({ events }: { events: Movement["timeline"] }) {
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
            <p className="text-xs text-muted-foreground">{evt.type}</p>
            <p className="text-xs text-muted-foreground">{evt.date}</p>
            <p className="text-xs text-muted-foreground">{evt.description}</p>
            {evt.actor && (
              <p className="text-xs text-muted-foreground">By: {evt.actor}</p>
            )}
            {evt.documentUrl && (
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

export function MovementDetailDialog({ movement, open, onOpenChange }: Props) {
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
          <Row label="Status" value={<Badge variant="outline" className="text-xs">{movement.status}</Badge>} />
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
        </div>
        <Separator />
        <p className="text-sm font-semibold text-foreground">Certificate Timeline</p>
        <Timeline events={movement.timeline} />
      </DialogContent>
    </Dialog>
  );
}
