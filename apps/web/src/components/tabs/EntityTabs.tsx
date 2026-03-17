"use client";

import { Tab, Tabs, type TabsProps } from "@mui/material";

import type { EntityTabsInstance } from "./types";

type EntityTabsProps<TKey extends string> = {
  instance: EntityTabsInstance<TKey>;
  /** Pass-through to MUI Tabs (e.g. variant="scrollable", sx, ...) */
  slotProps?: Omit<TabsProps, "value" | "onChange" | "children">;
};

/**
 * Renders the tab navigation bar (tab list).
 * Pair with `<TabPanel>` to render tab content.
 *
 * A11y: each Tab gets a stable `id` and `aria-controls` pointing to its panel.
 * The panel uses the mirrored `id` and `aria-labelledby`.
 *
 * @example
 * ```tsx
 * const tabs = useEntityTabs({ items, defaultActiveKey: "all" });
 *
 * <EntityTabs instance={tabs} slotProps={{ variant: "scrollable" }} />
 * <TabPanel instance={tabs} tabKey="all"><AllContent /></TabPanel>
 * <TabPanel instance={tabs} tabKey="open"><OpenContent /></TabPanel>
 * ```
 */
export function EntityTabs<TKey extends string>({
  instance,
  slotProps,
}: EntityTabsProps<TKey>) {
  return (
    <Tabs
      {...slotProps}
      aria-label={slotProps?.["aria-label"]}
      onChange={(_, key: TKey) => instance.setActiveKey(key)}
      value={instance.activeKey}
    >
      {instance.items.map((item) => (
        <Tab
          aria-controls={`tabs-${instance.instanceId}-panel-${item.key}`}
          disabled={item.disabled}
          id={`tabs-${instance.instanceId}-tab-${item.key}`}
          key={item.key}
          label={
            item.badge != null ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {item.label}
                {item.badge}
              </span>
            ) : (
              item.label
            )
          }
          value={item.key}
        />
      ))}
    </Tabs>
  );
}
