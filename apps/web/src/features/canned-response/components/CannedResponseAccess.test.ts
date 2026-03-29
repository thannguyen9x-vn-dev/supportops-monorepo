import { navigationConfig } from "@/features/layout/config/navigation";

describe("CannedResponseAccess", () => {
  it("does not allow EMPLOYEE in settings canned responses nav", () => {
    const settingsGroup = navigationConfig.find((group) => group.groupLabel === "nav.system");
    const settingsItem = settingsGroup?.items.find((item) => item.href === "/settings");
    const cannedItem = settingsItem?.children?.find((item) => item.href === "/settings/canned-responses");

    expect(cannedItem).toBeDefined();
    expect(cannedItem?.allowedRoles).toEqual(["OPS_COORDINATOR", "TENANT_ADMIN"]);
  });
});
