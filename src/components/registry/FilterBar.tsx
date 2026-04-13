import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  filters: {
    product: string;
    producer: string;
    plant: string;
    movementType: string;
    scheme: string;
    timeframe: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

export function FilterBar({ filters, onFilterChange, onClearAll }: FilterBarProps) {
  const hasFilters = Object.values(filters).some((v) => v !== "all");

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

      <Select value={filters.producer} onValueChange={(v) => onFilterChange("producer", v)}>
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Producer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All producers</SelectItem>
          <SelectItem value="yara">Yara International</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.plant} onValueChange={(v) => onFilterChange("plant", v)}>
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Plant(s)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All plants</SelectItem>
          <SelectItem value="brunsbuttel">Brunsbüttel</SelectItem>
          <SelectItem value="hull">Hull</SelectItem>
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

      <Select value={filters.scheme} onValueChange={(v) => onFilterChange("scheme", v)}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Compliance scheme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All schemes</SelectItem>
          <SelectItem value="ISCC EU">ISCC EU</SelectItem>
          <SelectItem value="REDcert EU">REDcert EU</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.timeframe} onValueChange={(v) => onFilterChange("timeframe", v)}>
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs text-muted-foreground">
          <X className="h-3 w-3 mr-1" /> Clear all
        </Button>
      )}
    </div>
  );
}
