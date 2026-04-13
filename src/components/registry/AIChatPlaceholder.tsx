import { MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  "start a claim",
  "check inventories",
  "tell what happened last month",
  "main clients",
  "conversion ratios",
  "create a CSV file",
];

export function AIChatPlaceholder() {
  return (
    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">AI Assistant</span>
      </div>
      <Input
        placeholder="Ask anything..."
        className="mb-3 bg-background"
        disabled
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Badge
            key={s}
            variant="outline"
            className="cursor-default text-xs text-muted-foreground hover:bg-accent"
          >
            {s}
          </Badge>
        ))}
      </div>
    </div>
  );
}
