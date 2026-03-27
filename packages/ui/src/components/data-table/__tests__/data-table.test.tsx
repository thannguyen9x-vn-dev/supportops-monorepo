import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type Column,
  type Table
} from "@tanstack/react-table";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "../../../test-utils/render";
import { DataTable } from "../DataTable";
import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { DataTablePagination } from "../DataTablePagination";
import { DataTableToolbar } from "../DataTableToolbar";

interface Row {
  id: string;
  name: string;
  status: string;
}

const data: Row[] = [
  { id: "1", name: "Request A", status: "open" },
  { id: "2", name: "Request B", status: "closed" }
];

const columnHelper = createColumnHelper<Row>();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    size: 160
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue(),
    size: 140
  })
];

function DataTableHarness({
  rows,
  onRowClick,
  rowDensity = "comfortable"
}: {
  rows: Row[];
  onRowClick?: (row: Row) => void;
  rowDensity?: "comfortable" | "compact";
}) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const table = useReactTable({
    data: rows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id
  });

  return <DataTable onRowClick={onRowClick} rowDensity={rowDensity} table={table} />;
}

function createPaginationTableMock(overrides?: Partial<Table<Row>>): Table<Row> {
  return {
    getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
    getRowCount: () => 95,
    getPageCount: () => 10,
    getCanPreviousPage: () => false,
    getCanNextPage: () => true,
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    ...overrides
  } as unknown as Table<Row>;
}

describe("DataTable", () => {
  it("renders default table and empty state", () => {
    const { rerender } = render(<DataTableHarness rows={data} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Request A")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    rerender(<DataTableHarness rows={[]} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("supports row click callback and compact state", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(<DataTableHarness onRowClick={onRowClick} rowDensity="compact" rows={data} />);

    const rowCell = screen.getByText("Request A").closest("td");
    expect(rowCell).toHaveStyle({ height: "44px" });

    await user.click(screen.getByText("Request A"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });
});

describe("DataTableToolbar", () => {
  it("renders action buttons and calls callbacks", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const onBulkDelete = vi.fn();
    const onDiscardAll = vi.fn();
    const onSaveAll = vi.fn();

    render(
      <DataTableToolbar
        dirtyRowCount={2}
        onBulkDelete={onBulkDelete}
        onDiscardAll={onDiscardAll}
        onExport={onExport}
        onSaveAll={onSaveAll}
        selectedCount={3}
        table={{} as Table<Row>}
      />
    );

    expect(screen.getByText("3 selected")).toBeInTheDocument();
    expect(screen.getByText("2 unsaved")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export" }));
    await user.click(screen.getByRole("button", { name: "Delete selected" }));
    await user.click(screen.getByRole("button", { name: "Discard all" }));
    await user.click(screen.getByRole("button", { name: "Save all" }));

    expect(onExport).toHaveBeenCalled();
    expect(onBulkDelete).toHaveBeenCalled();
    expect(onDiscardAll).toHaveBeenCalled();
    expect(onSaveAll).toHaveBeenCalled();
  });
});

describe("DataTablePagination", () => {
  it("renders accessible controls and handles pagination events", async () => {
    const user = userEvent.setup();
    const previousPage = vi.fn();
    const nextPage = vi.fn();
    const setPageIndex = vi.fn();
    const setPageSize = vi.fn();

    const table = createPaginationTableMock({ previousPage, nextPage, setPageIndex, setPageSize });

    render(<DataTablePagination table={table} />);

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeEnabled();

    await user.click(screen.getByLabelText("Next page"));
    expect(nextPage).toHaveBeenCalled();

    await user.click(screen.getByLabelText("Page 2"));
    expect(setPageIndex).toHaveBeenCalledWith(1);

    await user.selectOptions(screen.getByLabelText("Rows per page"), "20");
    expect(setPageSize).toHaveBeenCalledWith(20);
  });

  it("renders custom labels and ellipsis branch", () => {
    const table = createPaginationTableMock({
      getState: () => ({ pagination: { pageIndex: 5, pageSize: 10 } })
    });

    render(
      <DataTablePagination
        labels={{ rows: "Rows", previous: "Prev", next: "Next", showing: (from, to, total) => `${from}-${to}/${total}` }}
        table={table}
      />
    );

    expect(screen.getByText("51-60/95")).toBeInTheDocument();
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Prev")).toBeInTheDocument();
    expect(screen.getByLabelText("Next")).toBeInTheDocument();
  });
});

describe("DataTableColumnHeader", () => {
  it("renders static title when sorting is disabled", () => {
    const column = {
      getCanSort: () => false
    } as Column<Row, unknown>;

    render(<DataTableColumnHeader column={column} title="Name" />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders sortable button and invokes toggle handler", async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    const column = {
      getCanSort: () => true,
      getIsSorted: () => "asc",
      getToggleSortingHandler: () => toggle
    } as unknown as Column<Row, unknown>;

    render(<DataTableColumnHeader column={column} title="Status" />);

    const button = screen.getByRole("button", { name: /status/i });
    expect(button).toHaveTextContent("↑");
    await user.click(button);
    expect(toggle).toHaveBeenCalled();
  });
});
