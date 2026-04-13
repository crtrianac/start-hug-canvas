import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { carbonDatabaseEntries } from "@/data/registryData";

export function CarbonDatabaseTab() {
  return (
    <div className="rounded-lg border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold">Product</TableHead>
            <TableHead className="text-xs font-semibold">PCF Value</TableHead>
            <TableHead className="text-xs font-semibold">Unit</TableHead>
            <TableHead className="text-xs font-semibold">Certification Body</TableHead>
            <TableHead className="text-xs font-semibold">Scheme</TableHead>
            <TableHead className="text-xs font-semibold">Valid From</TableHead>
            <TableHead className="text-xs font-semibold">Valid To</TableHead>
            <TableHead className="text-xs font-semibold">Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carbonDatabaseEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-sm font-medium">{entry.product}</TableCell>
              <TableCell className="text-sm">{entry.pcfValue}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{entry.pcfUnit}</TableCell>
              <TableCell className="text-sm">{entry.certificationBody}</TableCell>
              <TableCell className="text-sm">{entry.certificationScheme}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{entry.validFrom}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{entry.validTo}</TableCell>
              <TableCell className="text-sm">{entry.region}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
