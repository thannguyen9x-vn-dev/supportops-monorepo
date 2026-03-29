import { render, screen } from "@testing-library/react";

import type { KnowledgeArticleSummary } from "@supportops/types";

import { KnowledgeBaseTable } from "./KnowledgeBaseTable";

describe("KnowledgeBaseTable", () => {
  it("renders status chips for draft and published", () => {
    const items: KnowledgeArticleSummary[] = [
      {
        id: "kb-1",
        title: "Draft doc",
        category: "Ops",
        tags: [],
        status: "DRAFT",
        authorName: "A",
        updatedAt: "2026-03-29T00:00:00.000Z",
      },
      {
        id: "kb-2",
        title: "Published doc",
        category: "Ops",
        tags: [],
        status: "PUBLISHED",
        authorName: "A",
        updatedAt: "2026-03-29T00:00:00.000Z",
      },
    ];

    render(<KnowledgeBaseTable items={items} onDelete={jest.fn()} role="TECHNICIAN" userId="u-1" />);

    expect(screen.getByText("status.DRAFT")).toBeInTheDocument();
    expect(screen.getByText("status.PUBLISHED")).toBeInTheDocument();
  });
});
