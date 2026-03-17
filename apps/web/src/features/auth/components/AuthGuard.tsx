"use client";

import type { ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import type { UserRole } from "@supportops/contracts";

import { useAuth } from "@/features/auth/hooks/useAuth";

type AuthGuardProps = {
  children: ReactNode;
};

const routeRoleAccess: Array<{ pathPrefix: string; roles: UserRole[] }> = [
  { pathPrefix: "/requests", roles: ["ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/team", roles: ["ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/reports", roles: ["ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/settings/workflow", roles: ["ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/settings/sla", roles: ["ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/settings/service-types", roles: ["ADMIN", "SUPER_ADMIN"] },
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
      router.replace(`/${locale}/access-denied`);
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
