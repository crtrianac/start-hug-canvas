import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Send, Mail } from "lucide-react";
import { DeliveryItem } from "@/data/registryData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DeliveryItem | null;
  onSend: (args: { ccEmails: string[]; comments: string }) => void;
}

const SYSTEM_SENDER = "claims-noreply@yara.com";
const CUSTOMER_SYSTEM_EMAIL = "sustainability-claims@customer-system.com";
const CURRENT_USER_EMAIL = "current.user@yara.com";

export function SendClaimDialog({ open, onOpenChange, item, onSend }: Props) {
  const [ccSelf, setCcSelf] = useState(false);
  const [extraCc, setExtraCc] = useState("");
  const [comments, setComments] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open && item) {
      setCcSelf(false);
      setExtraCc("");
      setComments("");
      setShowPreview(false);
    }
  }, [open, item]);

  if (!item) return null;

  const alreadySent = item.timeline.some((e) => e.type === "ClaimSent");

  const handleSend = () => {
    const cc: string[] = [];
    if (ccSelf) cc.push(CURRENT_USER_EMAIL);
    extraCc
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && /\S+@\S+\.\S+/.test(e))
      .forEach((e) => {
        if (!cc.includes(e)) cc.push(e);
      });
    onSend({ ccEmails: cc, comments: comments.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> {alreadySent ? "Send claim again" : "Send claim to customer"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            The claim certificate will be sent to the customer's system inbox. The action is recorded on the timeline.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Batch claim ID:</span>
            <span className="font-mono font-semibold">{item.claimBatchId ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-semibold text-right max-w-[60%] truncate">{item.customer}</span>
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
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" /> System email — recipient is fixed
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From:</span>
              <span className="font-mono">{SYSTEM_SENDER}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To:</span>
              <span className="font-mono">{CUSTOMER_SYSTEM_EMAIL}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cc-self"
              checked={ccSelf}
              onCheckedChange={(v) => setCcSelf(v === true)}
            />
            <Label htmlFor="cc-self" className="text-xs cursor-pointer">
              CC me (<span className="font-mono">{CURRENT_USER_EMAIL}</span>)
            </Label>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Additional CC (optional)</Label>
            <Input
              className="mt-1"
              value={extraCc}
              onChange={(e) => setExtraCc(e.target.value)}
              placeholder="colleague@yara.com, manager@yara.com"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Separate multiple emails with commas.</p>
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
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} className="gap-2">
            <Send className="h-4 w-4" /> {alreadySent ? "Send again" : "Send claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
