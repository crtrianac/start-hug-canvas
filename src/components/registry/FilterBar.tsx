import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: {
    customer: string;
    product: string;
    country: string;
    movementType: string;
    dateRange: DateRange | undefined;
  };
  customers: string[];
  onFilterChange: (key: string, value: string | DateRange | undefined) => void;
  onClearAll: () => void;
}

export function FilterBar({ filters, onFilterChange, onClearAll }: FilterBarProps) {
  const hasFilters =
    filters.product !== "all" ||
    filters.country !== "all" ||
    filters.movementType !== "all" ||
    !!filters.dateRange?.from;

  const dateLabel = filters.dateRange?.from
    ? filters.dateRange.to
      ? `${format(filters.dateRange.from, "d MMM yyyy")} → ${format(filters.dateRange.to, "d MMM yyyy")}`
      : format(filters.dateRange.from, "d MMM yyyy")
    : "Date range";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Select value={filters.product} onValueChange={(v) => onFilterChange("product", v)}>
        <SelectTrigger className="w-[180px] h-9 text-xs">
          <SelectValue placeholder="Finish product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All products</SelectItem>
          <SelectItem value="nitromag">YaraBela Nitromag (FR)</SelectItem>
          <SelectItem value="axan">YaraBela Axan (UK)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.country} onValueChange={(v) => onFilterChange("country", v)}>
        <SelectTrigger className="w-[170px] h-9 text-xs">
          <SelectValue placeholder="Delivery country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All countries</SelectItem>
          <SelectItem value="France">France</SelectItem>
          <SelectItem value="Spain">Spain</SelectItem>
          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
          <SelectItem value="Germany">Germany</SelectItem>
          <SelectItem value="Netherlands">Netherlands</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.movementType} onValueChange={(v) => onFilterChange("movementType", v)}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Movement type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="Issued">Issued</SelectItem>
          <SelectItem value="Booked">Booked</SelectItem>
          <SelectItem value="Claimed">Claimed</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-xs justify-start font-normal",
              !filters.dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
            {dateLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={filters.dateRange}
            onSelect={(range) => onFilterChange("dateRange", range)}
            numberOfMonths={2}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs text-muted-foreground">
          <X className="h-3 w-3 mr-1" /> Clear all
        </Button>
      )}
    </div>
  );
}
