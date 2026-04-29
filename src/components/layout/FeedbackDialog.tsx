import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("4");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim().slice(0, 1000);
    if (!trimmed) {
      toast({
        title: "Feedback required",
        description: "Please write a short comment before submitting.",
        variant: "destructive",
      });
      return;
    }
    // Prototype: log locally, no backend
    console.log("[Prototype feedback]", {
      name: name.trim().slice(0, 100) || "Anonymous",
      rating,
      message: trimmed,
      submittedAt: new Date().toISOString(),
    });
    toast({
      title: "Thanks for your feedback!",
      description: "Your comments help shape the next iteration.",
    });
    setName("");
    setRating("4");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
          <DialogDescription>
            Help us improve this prototype. Takes less than a minute.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-name">Name (optional)</Label>
            <Input
              id="fb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label>How would you rate this prototype?</Label>
            <RadioGroup
              value={rating}
              onValueChange={setRating}
              className="flex gap-3"
            >
              {["1", "2", "3", "4", "5"].map((v) => (
                <div key={v} className="flex items-center gap-1.5">
                  <RadioGroupItem value={v} id={`fb-r-${v}`} />
                  <Label htmlFor={`fb-r-${v}`} className="cursor-pointer">
                    {v}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-message">Comments</Label>
            <Textarea
              id="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked well? What could be better?"
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send feedback</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
