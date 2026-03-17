import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Tab item definition
// ---------------------------------------------------------------------------

export type TabItem<TKey extends string = string> = {
  /** Unique string key — used for active state, URL sync, a11y IDs. */
  key: TKey;
  label: ReactNode;
  disabled?: boolean;
  /** Optional badge/count rendered alongside the label. */
  badge?: ReactNode;
};

// ---------------------------------------------------------------------------
// Mount policy — controls when panel content is rendered
// ---------------------------------------------------------------------------

/**
 * - "lazy"   (default): Mount on first visit, keep mounted afterwards.
 *              Best for panels with async data or heavy components —
 *              avoids re-fetch on tab switch without wasting memory upfront.
 *
 * - "eager": Mount all panels immediately on load.
 *             Use when you need all panels pre-rendered (e.g. SSR snapshot).
 *
 * - "strict": Unmount when inactive, remount when active.
 *              Use when panel state must reset on every tab switch
 *              (e.g. a form that should be blank each time).
 */
export type TabPanelMountPolicy = "lazy" | "eager" | "strict";

// ---------------------------------------------------------------------------
// The object returned by useEntityTabs — shared between EntityTabs + TabPanel.
// Each useEntityTabs call creates an isolated instance, so nested tabs never
// share state accidentally.
// ---------------------------------------------------------------------------

export type EntityTabsInstance<TKey extends string = string> = {
  items: TabItem<TKey>[];
  activeKey: TKey;
  setActiveKey: (key: TKey) => void;
  mountPolicy: TabPanelMountPolicy;
  /** Stable ID used to generate aria-* attributes. Unique per hook call. */
  instanceId: string;
};

// ---------------------------------------------------------------------------
// useEntityTabs options
// ---------------------------------------------------------------------------

export type UseEntityTabsOptions<TKey extends string = string> = {
  items: TabItem<TKey>[];
  mountPolicy?: TabPanelMountPolicy;
} & (
  | {
      /** Uncontrolled: hook owns the active state. */
      defaultActiveKey?: TKey;
      activeKey?: never;
      onChange?: (key: TKey) => void;
    }
  | {
      /** Controlled: caller owns the active state. */
      activeKey: TKey;
      defaultActiveKey?: never;
      onChange?: (key: TKey) => void;
    }
);
