"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { EntityTableInstance } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntityTableInstance = EntityTableInstance<any, any>;

const EntityTableContext = createContext<AnyEntityTableInstance | null>(null);

// ---------------------------------------------------------------------------
// Provider — wraps the DataTable subtree so cell renderers can access the
// form state without prop drilling through TanStack's column definitions.
// ---------------------------------------------------------------------------

type EntityTableProviderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: EntityTableInstance<any, any>;
  children: ReactNode;
};

export function EntityTableProvider({ instance, children }: EntityTableProviderProps) {
  return (
    <EntityTableContext.Provider value={instance}>{children}</EntityTableContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook — used inside editCell / editHeader renderers
// ---------------------------------------------------------------------------

/**
 * Access the EntityTable instance from inside a cell renderer.
 *
 * Usage in a column def:
 * ```tsx
 * editCell: ({ row, rowId, value, onChange }) => {
 *   // props already pre-computed by EntityTable — prefer those.
 *   // Use useEntityTableContext only for advanced access (e.g. isRowSaving).
 *   const { isRowSaving } = useEntityTableContext<MyRow, MyFilters>();
 *   return <Select disabled={isRowSaving(rowId)} ... />;
 * }
 * ```
 */
export function useEntityTableContext<
  TData extends object,
  TFilters extends object,
>(): EntityTableInstance<TData, TFilters> {
  const ctx = useContext(EntityTableContext);
  if (!ctx) {
    throw new Error("useEntityTableContext must be used inside <EntityTable>");
  }
  return ctx as EntityTableInstance<TData, TFilters>;
}
