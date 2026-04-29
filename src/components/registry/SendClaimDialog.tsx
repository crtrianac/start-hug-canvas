import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Send } from "lucide-react";
import { DeliveryItem } from "@/data/registryData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DeliveryItem | null;
  onSend: (args: { recipientEmail: string; recipientName: string; comments: string }) => void;
}

const DEFAULT_SENDER = "current.user@yara.com";

export function SendClaimDialog({ open, onOpenChange, item, onSend }: Props) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [comments, setComments] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open && item) {
      setRecipientName(item.onBehalfOf ?? item.customer);
      setRecipientEmail("");
      setComments("");
      setShowPreview(false);
    }
  }, [open, item]);

  if (!item) return null;

  const canSend = recipientName.trim() !== "" && recipientEmail.trim() !== "";

  const handleSend = () => {
    if (!canSend) return;
    onSend({ recipientEmail: recipientEmail.trim(), recipientName: recipientName.trim(), comments: comments.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> Send claim to customer
          </DialogTitle>
          <DialogDescription className="text-xs">
            Preview the claim and send the certificate PDF directly to the customer. The action will be recorded on the timeline.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Batch claim ID:</span>
            <span className="font-mono font-semibold">{item.claimBatchId ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Material:</span>
            <span className="font-semibold text-right max-w-[60%] truncate">{item.materialName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tons:</span>
            <span className="font-semibold">{item.tons.toLocaleString()} t</span>
          </div>
          {item.totalEmissions !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emissions:</span>
              <span className="font-semibold">{item.totalEmissions.toLocaleString()} tCO₂e</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reporting good:</span>
            <span className="font-semibold">{item.reportingGood ?? "—"}</span>
          </div>
        </div>

        {item.claimDocumentUrl && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={() => setShowPreview((v) => !v)}
            >
              <FileText className="h-4 w-4" />
              {showPreview ? "Hide claim PDF preview" : "Preview claim PDF"}
            </Button>
            {showPreview && (
              <div className="mt-2 rounded-md border border-border bg-background p-4 text-xs space-y-2">
                <p className="font-semibold text-sm">Claim certificate — {item.claimBatchId}</p>
                <p className="text-muted-foreground">Issued by Yara · {item.complianceScheme}</p>
                <Separator />
                <p>Customer: <span className="font-medium">{item.customer}</span></p>
                {item.onBehalfOf && <p>On behalf of: <span className="font-medium">{item.onBehalfOf}</span></p>}
                <p>Material: <span className="font-medium">{item.materialName}</span></p>
                <p>Volume: <span className="font-medium">{item.tons.toLocaleString()} t</span></p>
                <p>Reporting good: <span className="font-medium">{item.reportingGood}</span></p>
                <p>Delivery: <span className="font-mono">{item.deliveryNumber}</span></p>
                <p className="text-muted-foreground italic">[Mock PDF preview — production version will render the actual certificate]</p>
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Recipient name / company</Label>
            <Input
              className="mt-1"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. PepsiCo Sustainability Team"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Recipient email</Label>
            <Input
              className="mt-1"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="sustainability@customer.com"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Comments (optional)</Label>
            <Textarea
              className="mt-1"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add a note to include with the claim…"
              rows={3}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            From: <span className="font-mono">{DEFAULT_SENDER}</span>
          </p>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={!canSend} className="gap-2">
            <Send className="h-4 w-4" /> Send claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
