import type { Plan, Subscription } from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const billingService = {
  getPlans: () => apiClient.get<Plan[]>(ENDPOINTS.PLANS.LIST, { skipAuth: true }),

  getCurrentSubscription: () => apiClient.get<Subscription>(ENDPOINTS.SUBSCRIPTIONS.CURRENT),

  changePlan: (planId: string) => apiClient.post<void>(ENDPOINTS.SUBSCRIPTIONS.CREATE, { planId }),

  cancelSubscription: (reason?: string) => apiClient.put<void>(ENDPOINTS.SUBSCRIPTIONS.CANCEL, { reason }),

  getBillingInfo: () => apiClient.get<unknown>(ENDPOINTS.BILLING.INFO),

  updateBillingInfo: (data: unknown) => apiClient.put<unknown>(ENDPOINTS.BILLING.INFO, data),

  getPaymentMethods: () => apiClient.get<unknown>(ENDPOINTS.BILLING.PAYMENT_METHODS),

  addPaymentMethod: (data: unknown) => apiClient.post<unknown>(ENDPOINTS.BILLING.PAYMENT_METHODS, data),

  getOrderHistory: (page = 1, size = 10) =>
    apiClient.get<unknown>(ENDPOINTS.BILLING.ORDERS, {
      params: { page, size }
    })
};
