import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardLayout } from "@/features/layout/components/DashboardLayout/DashboardLayout";
import { AuthProvider } from "@/lib/auth/AuthContext";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthGuard>
    </AuthProvider>
  );
}
