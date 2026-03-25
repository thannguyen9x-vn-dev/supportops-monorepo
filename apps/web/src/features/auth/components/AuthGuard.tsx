"use client";

import type { ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import type { UserRole } from "@supportops/types";

import { useAuth } from "@/features/auth/hooks/useAuth";

type AuthGuardProps = {
  children: ReactNode;
};

const routeRoleAccess: Array<{ pathPrefix: string; roles: UserRole[]; redirectTo?: string }> = [
  { pathPrefix: "/dashboard", roles: ["TENANT_ADMIN", "OPS_COORDINATOR", "TECHNICIAN"], redirectTo: "/requests/list" },
  { pathPrefix: "/admin/user", roles: ["TENANT_ADMIN"] },
  { pathPrefix: "/reports", roles: ["OPS_COORDINATOR", "TENANT_ADMIN"] },
  { pathPrefix: "/settings/workflow", roles: ["TENANT_ADMIN"] },
  { pathPrefix: "/settings/sla", roles: ["TENANT_ADMIN"] },
  { pathPrefix: "/settings/service-types", roles: ["TENANT_ADMIN"] },
];

function getPathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(en|vi)/, "") || "/";
}

function canAccessPath(pathWithoutLocale: string, role?: UserRole): boolean {
  const rule = routeRoleAccess.find(({ pathPrefix }) =>
    pathWithoutLocale === pathPrefix || pathWithoutLocale.startsWith(`${pathPrefix}/`)
  );

  if (!rule) {
    return true;
  }

  if (!role) {
    return false;
  }

  return rule.roles.includes(role);
}

function getDeniedRedirect(pathWithoutLocale: string): string {
  const rule = routeRoleAccess.find(({ pathPrefix }) =>
    pathWithoutLocale === pathPrefix || pathWithoutLocale.startsWith(`${pathPrefix}/`)
  );

  return rule?.redirectTo ?? "/access-denied";
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const pathWithoutLocale = getPathWithoutLocale(pathname);

    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(pathWithoutLocale);
      router.replace(`/${locale}/login?next=${nextPath}`);
      return;
    }

    if (!canAccessPath(pathWithoutLocale, user?.role)) {
      router.replace(`/${locale}${getDeniedRedirect(pathWithoutLocale)}`);
    }
  }, [isAuthenticated, isLoading, locale, pathname, router, user?.role]);

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress size={28} />
      </main>
    );
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname);
  if (!isAuthenticated || !canAccessPath(pathWithoutLocale, user?.role)) {
    return null;
  }

  return <>{children}</>;
}
