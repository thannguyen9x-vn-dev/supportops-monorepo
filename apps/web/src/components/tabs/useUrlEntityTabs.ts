"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEntityTabs } from "./useEntityTabs";
import type { EntityTabsInstance, TabItem, TabPanelMountPolicy } from "./types";

type UseUrlEntityTabsOptions<TKey extends string> = {
  items: TabItem<TKey>[];
  /** The URL search param key, e.g. "tab" → ?tab=allRequests */
  urlParam: string;
  /** Fallback when the URL param is absent or invalid. Defaults to first item. */
  defaultActiveKey?: TKey;
  mountPolicy?: TabPanelMountPolicy;
  /** Called after the URL is updated, e.g. to reset pagination. */
  onTabChange?: (key: TKey) => void;
};

/**
 * Like `useEntityTabs` but syncs the active tab with a URL search param.
 *
 * Uses `router.replace` (not `push`) so tab switching doesn't pollute the
 * browser history stack — back button goes to the previous *page*, not the
 * previous tab.
 *
 * ⚠️ Next.js App Router requirement:
 * This hook calls `useSearchParams()` internally. Any Server Component that
 * renders a Client Component using this hook must wrap it in a `<Suspense>`
 * boundary, otherwise Next.js will deopt the entire page to client rendering.
 *
 * @example
 * ```tsx
 * // page.tsx (Server Component)
 * export default function RequestsPage() {
 *   return (
 *     <Suspense fallback={<TabsSkeleton />}>
 *       <RequestListClient />
 *     </Suspense>
 *   );
 * }
 *
 * // RequestListClient.tsx ("use client")
 * const tabs = useUrlEntityTabs({ items, urlParam: "tab", defaultActiveKey: "allRequests" });
 * ```
 */
export function useUrlEntityTabs<TKey extends string>({
  items,
  urlParam,
  defaultActiveKey,
  mountPolicy,
  onTabChange,
}: UseUrlEntityTabsOptions<TKey>): EntityTabsInstance<TKey> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const validKeys = items.map((item) => item.key);
  const urlValue = searchParams.get(urlParam) as TKey | null;
  const resolvedKey: TKey =
    urlValue && validKeys.includes(urlValue)
      ? urlValue
      : (defaultActiveKey ?? (items[0]?.key as TKey));

  const handleChange = (key: TKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParam, key);
    // replace — not push — so back button doesn't cycle through tabs
    router.replace(`${pathname}?${params.toString()}`);
    onTabChange?.(key);
  };

  return useEntityTabs<TKey>({
    items,
    activeKey: resolvedKey,
    onChange: handleChange,
    mountPolicy,
  });
}
