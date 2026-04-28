export type DeliveryStatus = "Issued" | "Booked" | "Claimed";
export type ReportingGood = "Industrials" | "Energy" | "Fertilizers";

export interface TimelineEvent {
  label: string;
  movementId: string;
  type: string;
  date: string;
  description: string;
  actor?: string;
  documentUrl?: string;
  tons?: number;
}

export interface DeliveryItem {
  id: string;
  materialName: string;
  status: DeliveryStatus;
  tons: number;
  totalEmissions?: number;
  /** Sales document number — multiple delivery items can share one */
  salesDocument: string;
  /** Unique delivery item number */
  deliveryNumber: string;
  /** Actual goods-issued date (ISO yyyy-mm-dd) */
  actualGIDate: string;
  /** Customer (climate partner) or originating plant */
  customer: string;
  originPlant: string;
  /** Country where the delivery item was delivered (ISO country name) */
  country: string;
  /** Full delivery address (street, city, postal code, country) */
  deliveryAddress: string;
  complianceScheme: string;
  reportingGood?: ReportingGood;
  onBehalfOf?: string;
  /** When part of a batch claim, all delivery items in the batch share the same id */
  claimBatchId?: string;
  /** Single PDF shared by every item in the batch claim */
  claimDocumentUrl?: string;
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

const PEPSI = "PepsiCo Europe";
const FRITO = "FRITO LAY TRADING COMPANY (EUROPE)";
const NESTLE = "Nestlé UK";
const BASF = "BASF SE";
const CARGILL = "Cargill Germany";

function tl(events: Omit<TimelineEvent, "movementId">[], movementId: string): TimelineEvent[] {
  return events.map((e) => ({ ...e, movementId }));
}

export const initialDeliveryItems: DeliveryItem[] = [
  // FRITO LAY — Sales doc SO-1001 (2 delivery items, France)
  {
    id: "DI-001",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    tons: 1200,
    totalEmissions: 840,
    salesDocument: "SO-1001",
    deliveryNumber: "DL-001",
    actualGIDate: "2026-03-24",
    customer: FRITO,
    originPlant: "Brunsbüttel",
    country: "France",
    deliveryAddress: "ZI de Vatry, Rue des Vignes, 51320 Bussy-Lettrée, France",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-20 09:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 1200 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-24 14:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — A. Müller", tons: 1200 },
      ],
      "DL-001"
    ),
  },
  {
    id: "DI-002",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    tons: 400,
    totalEmissions: 280,
    salesDocument: "SO-1001",
    deliveryNumber: "DL-002",
    actualGIDate: "2026-03-24",
    customer: FRITO,
    originPlant: "Brunsbüttel",
    country: "France",
    deliveryAddress: "ZI de Vatry, Rue des Vignes, 51320 Bussy-Lettrée, France",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-20 09:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 400 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-24 14:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — A. Müller", tons: 400 },
      ],
      "DL-002"
    ),
  },
  // FRITO LAY — Sales doc SO-1002 (2 delivery items, Spain)
  {
    id: "DI-003",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    tons: 500,
    totalEmissions: 350,
    salesDocument: "SO-1002",
    deliveryNumber: "DL-003",
    actualGIDate: "2026-03-27",
    customer: FRITO,
    originPlant: "Brunsbüttel",
    country: "Spain",
    deliveryAddress: "Pol. Ind. El Plano, Calle B-2, 50430 María de Huerva, Zaragoza, Spain",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-22 10:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 500 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-27 11:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — A. Müller", tons: 500 },
      ],
      "DL-003"
    ),
  },
  {
    id: "DI-004",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    tons: 350,
    totalEmissions: 245,
    salesDocument: "SO-1002",
    deliveryNumber: "DL-004",
    actualGIDate: "2026-03-27",
    customer: FRITO,
    originPlant: "Brunsbüttel",
    country: "Spain",
    deliveryAddress: "Pol. Ind. El Plano, Calle B-2, 50430 María de Huerva, Zaragoza, Spain",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-22 10:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 350 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-27 11:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — A. Müller", tons: 350 },
      ],
      "DL-004"
    ),
  },
  // FRITO LAY — Sales doc SO-1003 (2 delivery items, different GI dates, UK)
  {
    id: "DI-005",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Booked",
    tons: 2400,
    totalEmissions: 1680,
    salesDocument: "SO-1003",
    deliveryNumber: "DL-005",
    actualGIDate: "2026-03-24",
    customer: FRITO,
    originPlant: "Hull",
    country: "United Kingdom",
    deliveryAddress: "Frito Lay Plant, Coventry Rd, Leicester LE3 1PL, United Kingdom",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-19 08:00", description: "Issued at Hull", actor: "Plant Operator (Hull)", tons: 2400 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-24 09:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — J. Smith", tons: 2400 },
      ],
      "DL-005"
    ),
  },
  {
    id: "DI-006",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Booked",
    tons: 680,
    totalEmissions: 476,
    salesDocument: "SO-1003",
    deliveryNumber: "DL-006",
    actualGIDate: "2026-03-26",
    customer: FRITO,
    originPlant: "Hull",
    country: "United Kingdom",
    deliveryAddress: "Frito Lay Plant, Coventry Rd, Leicester LE3 1PL, United Kingdom",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2026-03-19 08:00", description: "Issued at Hull", actor: "Plant Operator (Hull)", tons: 680 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2026-03-26 09:00", description: `Booked to ${FRITO}`, actor: "Sales Desk — J. Smith", tons: 680 },
      ],
      "DL-006"
    ),
  },
  // PepsiCo — already-claimed batch (2 items share one PDF)
  {
    id: "DI-007",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Claimed",
    tons: 500,
    totalEmissions: 350,
    salesDocument: "SO-1004",
    deliveryNumber: "DL-007",
    actualGIDate: "2024-12-10",
    customer: PEPSI,
    originPlant: "Brunsbüttel",
    country: "Netherlands",
    deliveryAddress: "PepsiCo Europe HQ, Zonnebaan 35, 3542 EB Utrecht, Netherlands",
    complianceScheme: "REL",
    reportingGood: "Fertilizers",
    claimBatchId: "CLAIM-2024-001",
    claimDocumentUrl: "/docs/CLAIM-2024-001.pdf",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2024-11-30 01:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 500 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2024-12-05 10:00", description: `Booked to ${PEPSI}`, actor: "Sales Desk — A. Müller", tons: 500 },
        { label: "Certificate retired (claimed)", type: "Claim", date: "2024-12-10 11:00", description: "Batch claim CLAIM-2024-001 — Fertilizers (2 delivery items, shared PDF)", actor: "PepsiCo Sustainability Team", documentUrl: "/docs/CLAIM-2024-001.pdf", tons: 500 },
      ],
      "DL-007"
    ),
  },
  {
    id: "DI-008",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Claimed",
    tons: 300,
    totalEmissions: 210,
    salesDocument: "SO-1004",
    deliveryNumber: "DL-008",
    actualGIDate: "2024-12-10",
    customer: PEPSI,
    originPlant: "Brunsbüttel",
    country: "Netherlands",
    deliveryAddress: "PepsiCo Europe HQ, Zonnebaan 35, 3542 EB Utrecht, Netherlands",
    complianceScheme: "REL",
    reportingGood: "Fertilizers",
    claimBatchId: "CLAIM-2024-001",
    claimDocumentUrl: "/docs/CLAIM-2024-001.pdf",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2024-11-30 01:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 300 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2024-12-05 10:00", description: `Booked to ${PEPSI}`, actor: "Sales Desk — A. Müller", tons: 300 },
        { label: "Certificate retired (claimed)", type: "Claim", date: "2024-12-10 11:00", description: "Batch claim CLAIM-2024-001 — Fertilizers (2 delivery items, shared PDF)", actor: "PepsiCo Sustainability Team", documentUrl: "/docs/CLAIM-2024-001.pdf", tons: 300 },
      ],
      "DL-008"
    ),
  },
  // Nestlé UK — Booked
  {
    id: "DI-009",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Booked",
    tons: 3200,
    totalEmissions: 2240,
    salesDocument: "SO-1005",
    deliveryNumber: "DL-009",
    actualGIDate: "2024-11-28",
    customer: NESTLE,
    originPlant: "Hull",
    country: "United Kingdom",
    deliveryAddress: "Nestlé UK Ltd, 1 City Place, Gatwick RH6 0PA, United Kingdom",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2024-11-20 08:45", description: "Issued at Hull", actor: "Plant Operator (Hull)", tons: 3200 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2024-11-28 16:30", description: `Booked to ${NESTLE}`, actor: "Sales Desk — J. Smith", tons: 3200 },
      ],
      "DL-009"
    ),
  },
  // BASF — Issued (no customer yet)
  {
    id: "DI-010",
    materialName: "YaraBela Axan 27-0-0 (UK)",
    status: "Issued",
    tons: 5000,
    totalEmissions: 3500,
    salesDocument: "SO-1006",
    deliveryNumber: "DL-010",
    actualGIDate: "2024-11-20",
    customer: BASF,
    originPlant: "Hull",
    country: "Germany",
    deliveryAddress: "BASF SE, Carl-Bosch-Straße 38, 67056 Ludwigshafen am Rhein, Germany",
    complianceScheme: "REL",
    timeline: tl(
      [{ label: "Certificate issued", type: "GoodsMovement", date: "2024-11-20 08:45", description: "Issued at Hull", actor: "Plant Operator (Hull)", tons: 5000 }],
      "DL-010"
    ),
  },
  // Cargill — Booked
  {
    id: "DI-011",
    materialName: "YaraBela Nitromag 27-0-0 (FR)",
    status: "Booked",
    tons: 350,
    totalEmissions: 245,
    salesDocument: "SO-1007",
    deliveryNumber: "DL-011",
    actualGIDate: "2024-12-18",
    customer: CARGILL,
    originPlant: "Brunsbüttel",
    country: "Germany",
    deliveryAddress: "Cargill GmbH, Cerestarstraße 2, 47809 Krefeld, Germany",
    complianceScheme: "REL",
    timeline: tl(
      [
        { label: "Certificate issued", type: "GoodsMovement", date: "2024-12-15 10:00", description: "Issued at Brunsbüttel", actor: "Plant Operator (Brunsbüttel)", tons: 350 },
        { label: "Certificate transferred", type: "GoodsMovement", date: "2024-12-18 15:45", description: `Booked to ${CARGILL}`, actor: "Sales Desk — A. Müller", tons: 350 },
      ],
      "DL-011"
    ),
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
