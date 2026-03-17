import { useCallback, useId, useState } from "react";

import type { EntityTabsInstance, UseEntityTabsOptions } from "./types";

/**
 * Core tabs hook — manages active tab state.
 * Works in both controlled and uncontrolled modes.
 * Scoped: each call produces an isolated instance, so nested tabs never
 * interfere with each other.
 *
 * For URL sync, use `useUrlEntityTabs` instead.
 *
 * @example Uncontrolled
 * ```tsx
 * const tabs = useEntityTabs({ items, defaultActiveKey: "all" });
 * <EntityTabs instance={tabs} />
 * <TabPanel instance={tabs} tabKey="all">...</TabPanel>
 * ```
 *
 * @example Controlled (e.g. driven by parent state or URL)
 * ```tsx
 * const [active, setActive] = useState<TabKey>("all");
 * const tabs = useEntityTabs({ items, activeKey: active, onChange: setActive });
 * ```
 */
export function useEntityTabs<TKey extends string>(
  options: UseEntityTabsOptions<TKey>,
): EntityTabsInstance<TKey> {
  const { items, mountPolicy = "lazy", onChange } = options;

  // React 18+ useId — stable, unique per hook call even in nested trees.
  // Strip the colon characters MUI dislikes in HTML ids.
  const rawId = useId();
  const instanceId = rawId.replace(/:/g, "");

  const isControlled = "activeKey" in options && options.activeKey !== undefined;

  const firstKey = items[0]?.key;
  const [uncontrolledKey, setUncontrolledKey] = useState<TKey>(
    // Uncontrolled default — ignored if controlled
    (!isControlled && "defaultActiveKey" in options && options.defaultActiveKey) || firstKey || ("" as TKey),
  );

  const activeKey = isControlled ? (options.activeKey as TKey) : uncontrolledKey;

  const setActiveKey = useCallback(
    (key: TKey) => {
      if (!isControlled) {
        setUncontrolledKey(key);
      }
      onChange?.(key);
    },
    [isControlled, onChange],
  );

  return {
    items,
    activeKey,
    setActiveKey,
    mountPolicy,
    instanceId,
  };
}
