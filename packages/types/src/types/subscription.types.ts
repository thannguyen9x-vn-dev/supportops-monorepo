export interface Plan {
  id: string;
  name: string;
  displayName: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeatures;
  maxUsers: number;
}

export interface PlanFeatures {
  separateBusinessPersonal: boolean;
  estimateTaxPayments: boolean;
  stockControl: boolean;
  createInvoices: boolean;
  manageBillsPayments: boolean;
  runPayroll: boolean;
  handleMultipleCurrencies: boolean;
  trackMileage: boolean;
  trackEmployeeTime: boolean;
  multiDevice: boolean;
}

export interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "PAST_DUE"
  | "TRIALING";
