import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">Finish product registry</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          Last update: Dec 20, 2024 — 11:30 UTC
        </span>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">YA</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">Yara Admin</span>
        </div>
      </div>
    </header>
  );
}
