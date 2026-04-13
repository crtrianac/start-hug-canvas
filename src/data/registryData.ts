export type MovementStatus = "Issued" | "Booked" | "Claimed";
export type MovementType = "Issued" | "Booked" | "Claimed";
export type ReportingGood = "Industrials" | "Energy" | "Fertilizers";
export type ClaimType = "Proportional" | "Allocated";

export interface TimelineEvent {
  label: string;
  movementId: string;
  type: string;
  date: string;
  description: string;
}

export interface Movement {
  id: string;
  materialName: string;
  status: MovementStatus;
  movementType: MovementType;
  conversionRate: number;
  tons: number;
  movementId: string;
  timestamp: string;
  plantOrCustomer: string;
  complianceScheme: string;
  reportingGood?: ReportingGood;
  totalTons?: number;
  totalEmissions?: number;
  claimedPercentage?: number;
  claimType?: ClaimType;
  emissionAllocationFactor?: number;
  massBalanceFactor?: number;
  onBehalfOf?: string;
  timeline: TimelineEvent[];
}

export interface CarbonDatabaseEntry {
  id: string;
  product: string;
  pcfValue: number;
  pcfUnit: string;
  certificationBody: string;
  certificationScheme: string;
  validFrom: string;
  validTo: string;
  region: string;
}

export const initialMovements: Movement[] = [
  {
    id: "1",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.5,
    tons: 1200,
    movementId: "MOV-2024-001",
    timestamp: "2024-12-01 09:30",
    plantOrCustomer: "Brunsbüttel",
    complianceScheme: "ISCC EU",
    totalTons: 1200,
    totalEmissions: 840,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-001", type: "GoodsMovement", date: "12/01/2024 09:30 AM", description: "Brunsbüttel" },
    ],
  },
  {
    id: "2",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.5,
    tons: 800,
    movementId: "MOV-2024-002",
    timestamp: "2024-12-05 14:15",
    plantOrCustomer: "PepsiCo Europe",
    complianceScheme: "ISCC EU",
    totalTons: 800,
    totalEmissions: 560,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-002", type: "GoodsMovement", date: "12/01/2024 09:30 AM", description: "Brunsbüttel" },
      { label: "Certificate transferred", movementId: "MOV-2024-002", type: "GoodsMovement", date: "12/05/2024 02:15 PM", description: "Brunsbüttel to PepsiCo Europe" },
    ],
  },
  {
    id: "3",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.5,
    tons: 500,
    movementId: "MOV-2024-003",
    timestamp: "2024-12-10 11:00",
    plantOrCustomer: "PepsiCo Europe",
    complianceScheme: "ISCC EU",
    reportingGood: "Fertilizers",
    claimedPercentage: 100,
    totalTons: 500,
    totalEmissions: 350,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-003", type: "GoodsMovement", date: "11/30/2024 01:00 AM", description: "Brunsbüttel" },
      { label: "Certificate transferred", movementId: "MOV-2024-003", type: "GoodsMovement", date: "12/05/2024 10:00 AM", description: "Brunsbüttel to PepsiCo Europe" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-003", type: "GoodsMovement", date: "12/10/2024 11:00 AM", description: "PepsiCo Europe — Fertilizers" },
    ],
  },
  {
    id: "4",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.3,
    tons: 2000,
    movementId: "MOV-2024-004",
    timestamp: "2024-11-20 08:45",
    plantOrCustomer: "Hull",
    complianceScheme: "REDcert EU",
    totalTons: 2000,
    totalEmissions: 1400,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-004", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Hull" },
    ],
  },
  {
    id: "5",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.3,
    tons: 1500,
    movementId: "MOV-2024-005",
    timestamp: "2024-11-28 16:30",
    plantOrCustomer: "Nestlé UK",
    complianceScheme: "REDcert EU",
    totalTons: 1500,
    totalEmissions: 1050,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-005", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Hull" },
      { label: "Certificate transferred", movementId: "MOV-2024-005", type: "GoodsMovement", date: "11/28/2024 04:30 PM", description: "Hull to Nestlé UK" },
    ],
  },
  {
    id: "6",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.3,
    tons: 600,
    movementId: "MOV-2024-006",
    timestamp: "2024-12-02 13:20",
    plantOrCustomer: "Nestlé UK",
    complianceScheme: "REDcert EU",
    reportingGood: "Energy",
    claimedPercentage: 75,
    totalTons: 600,
    totalEmissions: 420,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-006", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Hull" },
      { label: "Certificate transferred", movementId: "MOV-2024-006", type: "GoodsMovement", date: "11/28/2024 04:30 PM", description: "Hull to Nestlé UK" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-006", type: "GoodsMovement", date: "12/02/2024 01:20 PM", description: "Nestlé UK — Energy" },
    ],
  },
  {
    id: "7",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.5,
    tons: 950,
    movementId: "MOV-2024-007",
    timestamp: "2024-12-15 10:00",
    plantOrCustomer: "Brunsbüttel",
    complianceScheme: "ISCC EU",
    totalTons: 950,
    totalEmissions: 665,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-007", type: "GoodsMovement", date: "12/15/2024 10:00 AM", description: "Brunsbüttel" },
    ],
  },
  {
    id: "8",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.3,
    tons: 400,
    movementId: "MOV-2024-008",
    timestamp: "2024-11-15 09:10",
    plantOrCustomer: "BASF SE",
    complianceScheme: "REDcert EU",
    reportingGood: "Industrials",
    claimedPercentage: 50,
    totalTons: 400,
    totalEmissions: 280,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/10/2024 09:00 AM", description: "Hull" },
      { label: "Certificate transferred", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/13/2024 02:00 PM", description: "Hull to BASF SE" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/15/2024 09:10 AM", description: "BASF SE — Industrials" },
    ],
  },
  {
    id: "9",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.5,
    tons: 350,
    movementId: "MOV-2024-009",
    timestamp: "2024-12-18 15:45",
    plantOrCustomer: "Cargill Germany",
    complianceScheme: "ISCC EU",
    totalTons: 350,
    totalEmissions: 245,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-009", type: "GoodsMovement", date: "12/15/2024 10:00 AM", description: "Brunsbüttel" },
      { label: "Certificate transferred", movementId: "MOV-2024-009", type: "GoodsMovement", date: "12/18/2024 03:45 PM", description: "Brunsbüttel to Cargill Germany" },
    ],
  },
  {
    id: "10",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.3,
    tons: 720,
    movementId: "MOV-2024-010",
    timestamp: "2024-12-20 11:30",
    plantOrCustomer: "ABF Ingredients",
    complianceScheme: "REDcert EU",
    totalTons: 720,
    totalEmissions: 504,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-010", type: "GoodsMovement", date: "12/15/2024 08:00 AM", description: "Hull" },
      { label: "Certificate transferred", movementId: "MOV-2024-010", type: "GoodsMovement", date: "12/20/2024 11:30 AM", description: "Hull to ABF Ingredients" },
    ],
  },
];

export const carbonDatabaseEntries: CarbonDatabaseEntry[] = [
  {
    id: "1",
    product: "YaraBela Nitromag 27-0-0 (FR)",
    pcfValue: 2.1,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "DNV",
    certificationScheme: "ISCC EU",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "France",
  },
  {
    id: "2",
    product: "YaraBela Axan 27-0-0 (UK)",
    pcfValue: 2.3,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "DNV",
    certificationScheme: "REDcert EU",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "United Kingdom",
  },
];

export const carbonDatabaseEntries: CarbonDatabaseEntry[] = [
  {
    id: "1",
    product: "YaraBela Nitromag 27-0-0 (FR)",
    pcfValue: 2.1,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "DNV",
    certificationScheme: "ISCC EU",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "France",
  },
  {
    id: "2",
    product: "YaraBela Axan 27-0-0 (UK)",
    pcfValue: 2.3,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "DNV",
    certificationScheme: "REDcert EU",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "United Kingdom",
  },
];
