"use client";

import type { ReactNode } from "react";

import type { EntityTabsInstance } from "./types";

type TabPanelProps<TKey extends string> = {
  instance: EntityTabsInstance<TKey>;
  tabKey: TKey;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders the content panel for a single tab.
 * Must be paired with `<EntityTabs instance={...} />` using the same instance.
 *
 * Mount behavior is controlled by `instance.mountPolicy`:
 * - "lazy"   (default) — renders on first visit, stays mounted afterwards.
 * - "eager"  — renders immediately even before the tab is visited.
 * - "strict" — renders only while active; unmounts when tab is switched away.
 *
 * A11y: `role="tabpanel"`, `aria-labelledby` wired to matching tab button.
 * The panel uses `hidden` attribute (not CSS display) so screen readers skip
 * inactive panels without needing `aria-hidden`.
 *
 * @example
 * ```tsx
 * const tabs = useEntityTabs({ items, defaultActiveKey: "all" });
 *
 * <EntityTabs instance={tabs} />
 * <TabPanel instance={tabs} tabKey="all"><AllContent /></TabPanel>
 * <TabPanel instance={tabs} tabKey="open"><OpenContent /></TabPanel>
 * ```
 *
 * @example Nested tabs — each useEntityTabs call is isolated
 * ```tsx
 * const outerTabs = useEntityTabs({ items: outerItems, defaultActiveKey: "requests" });
 * const innerTabs = useEntityTabs({ items: innerItems, defaultActiveKey: "open" });
 *
 * <EntityTabs instance={outerTabs} />
 * <TabPanel instance={outerTabs} tabKey="requests">
 *   <EntityTabs instance={innerTabs} />
 *   <TabPanel instance={innerTabs} tabKey="open">...</TabPanel>
 * </TabPanel>
 * ```
 */
export function TabPanel<TKey extends string>({
  instance,
  tabKey,
  children,
  className,
  style,
}: TabPanelProps<TKey>) {
  const { activeKey, mountPolicy, instanceId, visitedKeys } = instance;
  const isActive = activeKey === tabKey;

  // Decide whether to render children based on mount policy
  const shouldRender =
    mountPolicy === "eager" ||
    (mountPolicy === "lazy" && visitedKeys.has(tabKey)) ||
    (mountPolicy === "strict" && isActive);

  return (
    <div
      aria-labelledby={`tabs-${instanceId}-tab-${tabKey}`}
      className={className}
      hidden={!isActive}
      id={`tabs-${instanceId}-panel-${tabKey}`}
      role="tabpanel"
      // tabIndex allows keyboard users to focus the panel after navigating tabs
      tabIndex={isActive ? 0 : -1}
      style={style}
    >
      {shouldRender ? children : null}
    </div>
  );
}
