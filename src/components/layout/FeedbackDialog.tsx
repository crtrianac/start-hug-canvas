import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEEDBACK_URL =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=6lOK7xwaiUG3ksgy3K6laE2nBeEBJmVJlaBd-WW94EZUQUpOQkwzT1hLUzBMRkRMN0Y3MDA3MkdZSy4u";

export function FeedbackDialog() {
  return (
    <Button asChild variant="outline" size="sm" className="gap-2">
      <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
        <MessageSquarePlus className="h-4 w-4" />
        Feedback
      </a>
    </Button>
  );
}
