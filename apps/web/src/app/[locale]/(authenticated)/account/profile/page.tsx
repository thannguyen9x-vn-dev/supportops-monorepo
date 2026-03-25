"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert, Button, CircularProgress } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { UserSession } from "@supportops/types";

import { EntityTabs } from "@/components/tabs/EntityTabs";
import { useEntityTabs } from "@/components/tabs/useEntityTabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/features/common/toast/useToast";
import { ContentContainer } from "@/features/layout/components/ContentContainer/ContentContainer";
import { settingsService } from "@/features/settings/services/settings.service";
import { NotificationSettingsCard } from "./components/NotificationSettingsCard";
import { OrganizationAccessCard } from "./components/OrganizationAccessCard";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileForm } from "./components/ProfileForm";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences";
import { usePasswordForm } from "./hooks/usePasswordForm";
import { useProfileForm } from "./hooks/useProfileForm";
import { useSettingsLoader } from "./hooks/useSettingsLoader";
import styles from "./profile.module.css";

type SettingsTab = "general" | "notifications" | "security" | "sessions";
const SETTINGS_TABS: SettingsTab[] = ["general", "notifications", "security", "sessions"];

function isSettingsTab(value: string | null): value is SettingsTab {
  return value !== null && SETTINGS_TABS.includes(value as SettingsTab);
}

export default function AccountProfilePage() {
  const locale = useLocale();
  const t = useTranslations("pages.settings");
  const tRoles = useTranslations("pages.teamAdmin.roles");
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionState, setSessionState] = useState<"idle" | "loading" | "error">("idle");
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const skipNextFormSyncRef = useRef(false);
  const canEditDepartment = useMemo(() => {
    const role = String(user?.role ?? "");
    return role === "TENANT_ADMIN" || role === "SUPER_ADMIN";
  }, [user?.role]);

  const settings = useSettingsLoader();
  const notifications = useNotificationPreferences({ t });

  const profile = useProfileForm({
    canEditDepartment,
    onSaved: (values) => {
      skipNextFormSyncRef.current = true;
      settings.setData((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                ...values,
              },
            }
          : prev,
      );
      updateUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
    },
    t,
  });

  const password = usePasswordForm({ t });
  const { data: settingsData } = settings;
  const { reset: resetProfileForm } = profile;
  const { setPreferences } = notifications;

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    if (skipNextFormSyncRef.current) {
      skipNextFormSyncRef.current = false;
      return;
    }

    resetProfileForm(settingsData.profile);
    setPreferences(settingsData.notifications);
  }, [resetProfileForm, setPreferences, settingsData]);
  const loadSessions = useCallback(async () => {
    setSessionState("loading");
    try {
      const { data } = await settingsService.getSessions();
      const sortedSessions = [...data].sort(
        (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
      );
      setSessions(sortedSessions);
      setSessionState("idle");
    } catch {
      setSessionState("error");
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const groupedNotifications = useMemo(
    () => ({
      alerts: notifications.preferences.filter((item) => item.group === "alerts"),
      email: notifications.preferences.filter((item) => item.group === "email"),
    }),
    [notifications.preferences],
  );
  const roleLabel = useMemo(() => {
    const roleKey = user?.role;
    if (!roleKey) {
      return t("profile.systemRoleFallback");
    }
    const roleMap: Record<string, string> = {
      EMPLOYEE: tRoles("EMPLOYEE"),
      OPS_COORDINATOR: tRoles("OPS_COORDINATOR"),
      TECHNICIAN: tRoles("TECHNICIAN"),
      TENANT_ADMIN: tRoles("TENANT_ADMIN"),
    };
    return roleMap[roleKey] ?? roleKey;
  }, [t, tRoles, user?.role]);
  const roleKey = user?.role ?? "";
  const organizationName = user?.tenantName?.trim() || t("organizationAccess.fallback.organization");
  const departmentName = settingsData?.profile.department?.trim() || t("organizationAccess.fallback.department");
  const teamQueueLabel = settingsData?.profile.department?.trim()
    ? t("organizationAccess.teamQueueValue", { department: settingsData.profile.department.trim() })
    : t("organizationAccess.fallback.teamQueue");
  const joinedDateRaw = settingsData?.joinedAt ?? user?.joinedAt ?? null;
  const permissionSummary = useMemo(() => {
    const permissionMap: Record<string, string> = {
      EMPLOYEE: t("organizationAccess.permissionSummary.EMPLOYEE"),
      OPS_COORDINATOR: t("organizationAccess.permissionSummary.OPS_COORDINATOR"),
      TECHNICIAN: t("organizationAccess.permissionSummary.TECHNICIAN"),
      TENANT_ADMIN: t("organizationAccess.permissionSummary.TENANT_ADMIN"),
    };
    return permissionMap[roleKey] ?? t("organizationAccess.permissionSummary.default");
  }, [roleKey, t]);
  const activeSession = sessions[0] ?? null;
  const otherSessions = sessions.slice(1);
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTab = isSettingsTab(tabParam) ? tabParam : "general";

  const handleTabChange = useCallback(
    (tab: SettingsTab) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (tab === "general") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", tab);
      }

      const nextQuery = nextParams.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const settingsTabs = useEntityTabs<SettingsTab>({
    items: [
      { key: "general", label: t("tabs.general") },
      { key: "notifications", label: t("tabs.notifications") },
      { key: "security", label: t("tabs.security") },
      { key: "sessions", label: t("tabs.sessions") },
    ],
    activeKey: activeTab,
    onChange: handleTabChange,
  });

  const formatSessionDate = useCallback(
    (value: string) => {
      const timestamp = Date.parse(value);
      if (Number.isNaN(timestamp)) {
        return t("sessions.unknown");
      }

      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(timestamp));
    },
    [locale, t],
  );
  const joinedDateLabel = joinedDateRaw ? formatSessionDate(joinedDateRaw) : t("organizationAccess.fallback.joinedDate");

  const getSessionDeviceLabel = useCallback(
    (session: UserSession) => {
      const browser = session.browser?.trim() || t("sessions.unknown");
      const device = session.device?.trim() || t("sessions.unknown");
      return t("sessions.browserOnDevice", { browser, device });
    },
    [t],
  );
  const tabDescriptionByKey: Record<SettingsTab, string> = useMemo(
    () => ({
      general: t("tabs.generalDescription"),
      notifications: t("tabs.notificationsDescription"),
      security: t("tabs.securityDescription"),
      sessions: t("tabs.sessionsDescription"),
    }),
    [t],
  );

  const handleSignOutOtherSessions = useCallback(async () => {
    if (sessions.length <= 1) {
      toast.success(t("sessions.noOtherSession"));
      return;
    }

    setIsSigningOutOthers(true);
    try {
      const otherSessions = sessions.slice(1);
      await Promise.all(otherSessions.map((session) => settingsService.revokeSession(session.id)));
      toast.success(t("sessions.signOutOthersSuccess"));
      await loadSessions();
    } catch {
      toast.error(t("sessions.signOutOthersError"));
    } finally {
      setIsSigningOutOthers(false);
    }
  }, [loadSessions, sessions, t, toast]);

  if (settings.loadState === "loading") {
    return (
      <div className={styles.centeredState}>
        <CircularProgress size={28} />
        <p>{t("state.loading")}</p>
      </div>
    );
  }

  if (settings.loadState === "error") {
    return (
      <div className={styles.centeredState}>
        <Alert severity="error">{t("state.error")}</Alert>
        <Button onClick={() => void settings.reload()} size="medium" variant="contained">
          {t("action.retry")}
        </Button>
      </div>
    );
  }

  if (settings.loadState === "empty" || !settings.data) {
    return (
      <div className={styles.centeredState}>
        <Alert severity="info">{t("state.empty")}</Alert>
        <Button onClick={() => void settings.reload()} size="medium" variant="outlined">
          {t("action.reload")}
        </Button>
      </div>
    );
  }

  const data = settings.data;

  return (
    <ContentContainer>
      <ProfileCard
        avatarUrl={data.avatarUrl}
        email={data.profile.email}
        firstName={data.profile.firstName}
        lastName={data.profile.lastName}
        status={user ? "ACTIVE" : "INACTIVE"}
        onAvatarUpdated={(nextAvatarUrl) => {
          settings.setData((prev) =>
            prev
              ? {
                  ...prev,
                  avatarUrl: nextAvatarUrl,
                }
              : prev,
          );
          updateUser({ avatarUrl: nextAvatarUrl });
        }}
      />

      <section className={styles.tabCard}>
        <div className={styles.tabIntro}>
          <p className={styles.tabEyebrow}>{t("tabs.introLabel")}</p>
          <h3 className={styles.tabIntroTitle}>{t("tabs.introTitle")}</h3>
          <p className={styles.tabIntroDescription}>{tabDescriptionByKey[activeTab]}</p>
        </div>

        <EntityTabs
          instance={settingsTabs}
          slotProps={{
            className: styles.tabs,
            variant: "scrollable",
            scrollButtons: "auto",
            "aria-label": t("tabs.ariaLabel"),
          }}
        />

        <div className={styles.tabPanelContent}>
          {activeTab === "general" ? (
            <div className={styles.tabContent}>
              <OrganizationAccessCard
                department={departmentName}
                joinedDate={joinedDateLabel}
                organizationName={organizationName}
                permissionSummary={permissionSummary}
                role={roleLabel}
                teamQueue={teamQueueLabel}
              />
              <ProfileForm
                canEditDepartment={canEditDepartment}
                control={profile.control}
                handleSubmit={profile.handleSubmit}
                initialDepartment={data.profile.department}
                isDirty={profile.isDirty}
                onSubmit={profile.onSubmit}
                systemRoleLabel={roleLabel}
                systemRoleValue={data.profile.systemRole}
                submitState={profile.submitState}
              />
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div className={styles.tabContent}>
              <NotificationSettingsCard
                description={t("notifications.alertsDescription")}
                items={groupedNotifications.alerts}
                onToggle={notifications.toggle}
                title={t("notifications.alertsTitle")}
              />
              <NotificationSettingsCard
                description={t("notifications.emailDescription")}
                items={groupedNotifications.email}
                onToggle={notifications.toggle}
                title={t("notifications.emailTitle")}
              />
            </div>
          ) : null}

          {activeTab === "security" ? (
            <div className={styles.tabContent}>
              <PasswordForm
                control={password.control}
                handleSubmit={password.handleSubmit}
                onSubmit={password.onSubmit}
                submitState={password.submitState}
              />
            </div>
          ) : null}

          {activeTab === "sessions" ? (
            <div className={styles.tabContent}>
              <section className={styles.card}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{t("sessions.currentTitle")}</h3>
                </div>
                {sessionState === "error" ? <p className={styles.sessionMeta}>{t("sessions.error")}</p> : null}
                {activeSession ? (
                  <div className={styles.sessionBody}>
                    <p className={styles.sessionPrimary}>
                      {t("sessions.currentSession")}: {getSessionDeviceLabel(activeSession)}
                    </p>
                    <p className={styles.sessionMeta}>
                      {t("sessions.location")}: {activeSession.location || t("sessions.unknown")}
                    </p>
                    <p className={styles.sessionMeta}>
                      {t("sessions.lastActive")}: {formatSessionDate(activeSession.lastAccessed)}
                    </p>
                  </div>
                ) : (
                  <p className={styles.sessionMeta}>{t("sessions.empty")}</p>
                )}
              </section>

              <section className={styles.card}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{t("sessions.otherTitle")}</h3>
                  <Button
                    className={styles.signOutOthersButton}
                    disabled={isSigningOutOthers}
                    onClick={() => {
                      void handleSignOutOtherSessions();
                    }}
                    variant="contained"
                  >
                    {isSigningOutOthers ? t("action.saving") : t("sessions.signOutOthers")}
                  </Button>
                </div>
                {otherSessions.length ? (
                  <div className={styles.sessionList}>
                    {otherSessions.map((session) => (
                      <div className={styles.sessionRow} key={session.id}>
                        <p className={styles.sessionPrimary}>{getSessionDeviceLabel(session)}</p>
                        <p className={styles.sessionMeta}>
                          {t("sessions.location")}: {session.location || t("sessions.unknown")}
                        </p>
                        <p className={styles.sessionMeta}>
                          {t("sessions.lastActive")}: {formatSessionDate(session.lastAccessed)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.sessionMeta}>{t("sessions.noOtherSession")}</p>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </ContentContainer>
  );
}
