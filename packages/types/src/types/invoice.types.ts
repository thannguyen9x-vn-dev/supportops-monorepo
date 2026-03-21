export interface Invoice {
  id: string;
  invoiceNumber: string;
  sellerName: string;
  sellerAddress: string;
  sellerLogoUrl: string | null;
  invoiceDate: string;
  buyerName: string;
  buyerAddress: string;
  buyerVatCode: string | null;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  discountPercent: number;
  total: number;
}

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
