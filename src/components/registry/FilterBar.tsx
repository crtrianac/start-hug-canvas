import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export interface Filters {
  customers: string[]; // values, plants prefixed with "plant:"
  products: string[];
  countries: string[];
  movementTypes: string[];
  dateRange: DateRange | undefined;
}

interface FilterBarProps {
  filters: Filters;
  customers: string[];
  plants: string[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClearAll: () => void;
}

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  width?: string;
  selected: string[];
  groups: { label?: string; options: Option[] }[];
  onChange: (next: string[]) => void;
}

function MultiSelect({ label, width = "w-[200px]", selected, groups, onChange }: MultiSelectProps) {
  const allOptions = groups.flatMap((g) => g.options);
  const selectedSet = new Set(selected);
  const toggle = (v: string) => {
    const next = new Set(selectedSet);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange(Array.from(next));
  };

  const display =
    selected.length === 0
      ? label
      : selected.length === 1
        ? allOptions.find((o) => o.value === selected[0])?.label ?? label
        : `${label} (${selected.length})`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 text-xs justify-between font-normal",
            width,
            selected.length === 0 && "text-muted-foreground"
          )}
        >
          <span className="truncate">{display}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[260px]" align="start">
        <div className="flex items-center justify-between px-3 py-2 text-xs">
          <span className="font-medium">{label}</span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {groups.map((g, gi) => (
              <div key={gi}>
                {g.label && (
                  <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground">
                    {g.label}
                  </div>
                )}
                {g.options.map((o) => {
                  const checked = selectedSet.has(o.value);
                  return (
                    <label
                      key={o.value}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(o.value)}
                      />
                      <span className="truncate">{o.label}</span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({ filters, customers, plants, onFilterChange, onClearAll }: FilterBarProps) {
  const hasFilters =
    filters.customers.length > 0 ||
    filters.products.length > 0 ||
    filters.countries.length > 0 ||
    filters.movementTypes.length > 0 ||
    !!filters.dateRange?.from;

  const dateLabel = filters.dateRange?.from
    ? filters.dateRange.to
      ? `${format(filters.dateRange.from, "d MMM yyyy")} → ${format(filters.dateRange.to, "d MMM yyyy")}`
      : format(filters.dateRange.from, "d MMM yyyy")
    : "Date range";

  const customerGroups: { label?: string; options: Option[] }[] = [];
  if (customers.length > 0) {
    customerGroups.push({
      label: "Customers (booked or claimed)",
      options: customers.map((c) => ({ value: c, label: c })),
    });
  }
  if (plants.length > 0) {
    customerGroups.push({
      label: "Plants (issued, no customer yet)",
      options: plants.map((p) => ({ value: `plant:${p}`, label: p })),
    });
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
      <MultiSelect
        label="Customer / Plant"
        width="w-[260px]"
        selected={filters.customers}
        groups={customerGroups}
        onChange={(v) => onFilterChange("customers", v)}
      />

      <MultiSelect
        label="Finish product"
        width="w-[200px]"
        selected={filters.products}
        groups={[
          {
            options: [
              { value: "nitromag", label: "YaraBela Nitromag (FR)" },
              { value: "axan", label: "YaraBela Axan (UK)" },
            ],
          },
        ]}
        onChange={(v) => onFilterChange("products", v)}
      />

      <MultiSelect
        label="Delivery country"
        width="w-[180px]"
        selected={filters.countries}
        groups={[
          {
            options: ["France", "Spain", "United Kingdom", "Germany", "Netherlands"].map((c) => ({
              value: c,
              label: c,
            })),
          },
        ]}
        onChange={(v) => onFilterChange("countries", v)}
      />

      <MultiSelect
        label="Movement type"
        width="w-[170px]"
        selected={filters.movementTypes}
        groups={[
          {
            options: [
              { value: "Issued", label: "Issued" },
              { value: "Booked", label: "Booked" },
              { value: "Claimed", label: "Claimed" },
            ],
          },
        ]}
        onChange={(v) => onFilterChange("movementTypes", v)}
      />

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
