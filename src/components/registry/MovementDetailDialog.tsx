import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DeliveryItem } from "@/data/registryData";
import { Separator } from "@/components/ui/separator";

interface Props {
  item: DeliveryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

const dotColor: Record<string, string> = {
  "Certificate issued": "border-muted-foreground",
  "Certificate transferred": "border-status-booked",
  "Certificate retired (claimed)": "border-status-claimed",
};

function Timeline({ events }: { events: DeliveryItem["timeline"] }) {
  return (
    <div className="relative pl-5 space-y-6 mt-4">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
      {events.map((evt, i) => (
        <div key={i} className="relative">
          <div
            className={`absolute -left-5 top-1 h-[18px] w-[18px] rounded-full border-2 bg-background ${dotColor[evt.label] ?? "border-muted-foreground"}`}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{evt.label}</p>
            <p className="text-xs text-muted-foreground">Delivery: {evt.movementId}</p>
            <p className="text-xs text-muted-foreground">{evt.date}</p>
            <p className="text-xs text-muted-foreground">{evt.description}</p>
            {typeof evt.tons === "number" && (
              <p className="text-xs font-medium text-foreground">Amount: {evt.tons.toLocaleString()} t</p>
            )}
            {evt.actor && <p className="text-xs text-muted-foreground">By: {evt.actor}</p>}
            {evt.documentUrl && (
              <a
                href={evt.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-block mt-0.5"
              >
                View shared claim PDF →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MovementDetailDialog({ item, open, onOpenChange }: Props) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Delivery Item Details</DialogTitle>
          <DialogDescription className="text-xs font-mono">{item.deliveryNumber}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-0">
          <Row label="Material" value={item.materialName} />
          <Row label="Status" value={<Badge variant="outline" className="text-xs">{item.status}</Badge>} />
          <Row label="Sales Document" value={<span className="font-mono">{item.salesDocument}</span>} />
          <Row label="Delivery Number" value={<span className="font-mono">{item.deliveryNumber}</span>} />
          <Row label="Actual GI Date" value={item.actualGIDate} />
          <Row label="Tons" value={`${item.tons.toLocaleString()} t`} />
          {item.totalEmissions !== undefined && (
            <Row label="Emissions" value={`${item.totalEmissions.toLocaleString()} tCO₂e`} />
          )}
          <Row label="Customer / Climate Partner" value={item.customer} />
          <Row label="Origin Plant" value={item.originPlant} />
          <Row label="Compliance Scheme" value={item.complianceScheme} />
          {item.reportingGood && <Row label="Reporting Good" value={item.reportingGood} />}
          {item.onBehalfOf && <Row label="On behalf of" value={item.onBehalfOf} />}
          {item.claimBatchId && (
            <Row label="Batch Claim ID" value={<span className="font-mono">{item.claimBatchId}</span>} />
          )}
          {item.claimDocumentUrl && (
            <Row
              label="Shared Claim PDF"
              value={
                <a href={item.claimDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Download →
                </a>
              }
            />
          )}
        </div>
        <Separator />
        <p className="text-sm font-semibold text-foreground">Timeline</p>
        <Timeline events={item.timeline} />
      </DialogContent>
    </Dialog>
  );
}
