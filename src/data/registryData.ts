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
    materialName: "FertilizerProduct A1",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.5,
    tons: 1200,
    movementId: "MOV-2024-001",
    timestamp: "2024-12-01 09:30",
    plantOrCustomer: "Plant 1",
    complianceScheme: "Scheme Alpha",
    totalTons: 1200,
    totalEmissions: 840,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-001", type: "GoodsMovement", date: "12/01/2024 09:30 AM", description: "Plant 1" },
    ],
  },
  {
    id: "2",
    materialName: "FertilizerProduct A1",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.5,
    tons: 800,
    movementId: "MOV-2024-002",
    timestamp: "2024-12-05 14:15",
    plantOrCustomer: "Customer Alpha",
    complianceScheme: "Scheme Alpha",
    totalTons: 800,
    totalEmissions: 560,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-002", type: "GoodsMovement", date: "12/01/2024 09:30 AM", description: "Plant 1" },
      { label: "Certificate transferred", movementId: "MOV-2024-002", type: "GoodsMovement", date: "12/05/2024 02:15 PM", description: "Plant 1 to Customer Alpha" },
    ],
  },
  {
    id: "3",
    materialName: "FertilizerProduct A1",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.5,
    tons: 500,
    movementId: "MOV-2024-003",
    timestamp: "2024-12-10 11:00",
    plantOrCustomer: "Customer Alpha",
    complianceScheme: "Scheme Alpha",
    reportingGood: "Fertilizers",
    claimedPercentage: 100,
    totalTons: 500,
    totalEmissions: 350,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-003", type: "GoodsMovement", date: "11/30/2024 01:00 AM", description: "Plant 1" },
      { label: "Certificate transferred", movementId: "MOV-2024-003", type: "GoodsMovement", date: "12/05/2024 10:00 AM", description: "Plant 1 to Customer Alpha" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-003", type: "GoodsMovement", date: "12/10/2024 11:00 AM", description: "Customer Alpha — Fertilizers" },
    ],
  },
  {
    id: "4",
    materialName: "IndustrialProduct B2",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.3,
    tons: 2000,
    movementId: "MOV-2024-004",
    timestamp: "2024-11-20 08:45",
    plantOrCustomer: "Plant 2",
    complianceScheme: "Scheme Beta",
    totalTons: 2000,
    totalEmissions: 1400,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-004", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Plant 2" },
    ],
  },
  {
    id: "5",
    materialName: "IndustrialProduct B2",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.3,
    tons: 1500,
    movementId: "MOV-2024-005",
    timestamp: "2024-11-28 16:30",
    plantOrCustomer: "Customer Beta",
    complianceScheme: "Scheme Beta",
    totalTons: 1500,
    totalEmissions: 1050,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-005", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Plant 2" },
      { label: "Certificate transferred", movementId: "MOV-2024-005", type: "GoodsMovement", date: "11/28/2024 04:30 PM", description: "Plant 2 to Customer Beta" },
    ],
  },
  {
    id: "6",
    materialName: "IndustrialProduct B2",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.3,
    tons: 600,
    movementId: "MOV-2024-006",
    timestamp: "2024-12-02 13:20",
    plantOrCustomer: "Customer Beta",
    complianceScheme: "Scheme Beta",
    reportingGood: "Energy",
    claimedPercentage: 75,
    totalTons: 600,
    totalEmissions: 420,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-006", type: "GoodsMovement", date: "11/20/2024 08:45 AM", description: "Plant 2" },
      { label: "Certificate transferred", movementId: "MOV-2024-006", type: "GoodsMovement", date: "11/28/2024 04:30 PM", description: "Plant 2 to Customer Beta" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-006", type: "GoodsMovement", date: "12/02/2024 01:20 PM", description: "Customer Beta — Energy" },
    ],
  },
  {
    id: "7",
    materialName: "FertilizerProduct A1",
    status: "Issued",
    movementType: "Issued",
    conversionRate: 25.5,
    tons: 950,
    movementId: "MOV-2024-007",
    timestamp: "2024-12-15 10:00",
    plantOrCustomer: "Plant 1",
    complianceScheme: "Scheme Alpha",
    totalTons: 950,
    totalEmissions: 665,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-007", type: "GoodsMovement", date: "12/15/2024 10:00 AM", description: "Plant 1" },
    ],
  },
  {
    id: "8",
    materialName: "IndustrialProduct B2",
    status: "Claimed",
    movementType: "Claimed",
    conversionRate: 25.3,
    tons: 400,
    movementId: "MOV-2024-008",
    timestamp: "2024-11-15 09:10",
    plantOrCustomer: "Customer Gamma",
    complianceScheme: "Scheme Beta",
    reportingGood: "Industrials",
    claimedPercentage: 50,
    totalTons: 400,
    totalEmissions: 280,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/10/2024 09:00 AM", description: "Plant 2" },
      { label: "Certificate transferred", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/13/2024 02:00 PM", description: "Plant 2 to Customer Gamma" },
      { label: "Certificate retired (claimed)", movementId: "MOV-2024-008", type: "GoodsMovement", date: "11/15/2024 09:10 AM", description: "Customer Gamma — Industrials" },
    ],
  },
  {
    id: "9",
    materialName: "FertilizerProduct A1",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.5,
    tons: 350,
    movementId: "MOV-2024-009",
    timestamp: "2024-12-18 15:45",
    plantOrCustomer: "Customer Delta",
    complianceScheme: "Scheme Alpha",
    totalTons: 350,
    totalEmissions: 245,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-009", type: "GoodsMovement", date: "12/15/2024 10:00 AM", description: "Plant 1" },
      { label: "Certificate transferred", movementId: "MOV-2024-009", type: "GoodsMovement", date: "12/18/2024 03:45 PM", description: "Plant 1 to Customer Delta" },
    ],
  },
  {
    id: "10",
    materialName: "IndustrialProduct B2",
    status: "Booked",
    movementType: "Booked",
    conversionRate: 25.3,
    tons: 720,
    movementId: "MOV-2024-010",
    timestamp: "2024-12-20 11:30",
    plantOrCustomer: "Customer Epsilon",
    complianceScheme: "Scheme Beta",
    totalTons: 720,
    totalEmissions: 504,
    timeline: [
      { label: "Certificate issued", movementId: "MOV-2024-010", type: "GoodsMovement", date: "12/15/2024 08:00 AM", description: "Plant 2" },
      { label: "Certificate transferred", movementId: "MOV-2024-010", type: "GoodsMovement", date: "12/20/2024 11:30 AM", description: "Plant 2 to Customer Epsilon" },
    ],
  },
];

export const carbonDatabaseEntries: CarbonDatabaseEntry[] = [
  {
    id: "1",
    product: "FertilizerProduct A1",
    pcfValue: 2.1,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "Cert Body X",
    certificationScheme: "Scheme Alpha",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "Region EU-1",
  },
  {
    id: "2",
    product: "IndustrialProduct B2",
    pcfValue: 2.3,
    pcfUnit: "kg CO₂e / kg product",
    certificationBody: "Cert Body X",
    certificationScheme: "Scheme Beta",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    region: "Region EU-2",
  },
];
