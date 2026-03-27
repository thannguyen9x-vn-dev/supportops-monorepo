import { describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "../../../test-utils/render";
import { InfiniteVirtualList } from "../InfiniteVirtualList";
import { VirtualGrid } from "../VirtualGrid";
import { VirtualList } from "../VirtualList";

const items = Array.from({ length: 12 }, (_, index) => `Item ${index + 1}`);

describe("Virtual list components", () => {
  it("renders VirtualList default, empty and loading variants", () => {
    const { rerender } = render(
      <VirtualList estimateSize={20} height={200} items={items} renderItem={(item) => <div>{item}</div>} />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();

    rerender(
      <VirtualList
        emptyState={<div>Nothing here</div>}
        estimateSize={20}
        height={200}
        items={[]}
        renderItem={(item) => <div>{item}</div>}
      />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();

    rerender(
      <VirtualList
        estimateSize={20}
        height={200}
        items={items}
        loading
        loadingSkeleton={<div>Loading list</div>}
        renderItem={(item) => <div>{item}</div>}
      />
    );
    expect(screen.getByText("Loading list")).toBeInTheDocument();
  });

  it("renders VirtualGrid and empty state", () => {
    const { rerender } = render(
      <VirtualGrid columns={3} height={180} items={items} renderItem={(item) => <div>{item}</div>} rowHeight={24} />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();

    rerender(
      <VirtualGrid
        columns={3}
        emptyState={<div>No cards</div>}
        height={180}
        items={[]}
        renderItem={(item) => <div>{item}</div>}
        rowHeight={24}
      />
    );
    expect(screen.getByText("No cards")).toBeInTheDocument();
  });

  it("renders InfiniteVirtualList and triggers load more callback", async () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <InfiniteVirtualList
        estimateSize={20}
        hasMore
        height={200}
        isLoadingMore={false}
        items={items}
        loadingMoreText="Fetching"
        onLoadMore={onLoadMore}
        renderItem={(item) => <div>{item}</div>}
      />
    );

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalled();
    });

    rerender(
      <InfiniteVirtualList
        estimateSize={20}
        hasMore
        height={200}
        isLoadingMore
        items={items}
        loadingMoreText="Fetching"
        onLoadMore={onLoadMore}
        renderItem={(item) => <div>{item}</div>}
      />
    );
    expect(screen.getByText("Fetching")).toBeInTheDocument();
  });
});
