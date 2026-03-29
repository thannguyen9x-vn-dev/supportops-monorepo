import { render, screen } from "@testing-library/react";

import { KnowledgeBaseHeader } from "./KnowledgeBaseHeader";

describe("KnowledgeBaseHeader", () => {
  it("hides New Article button for EMPLOYEE", () => {
    render(<KnowledgeBaseHeader onSearch={jest.fn()} role="EMPLOYEE" search="" />);

    expect(screen.queryByRole("button", { name: "new" })).not.toBeInTheDocument();
  });

  it("shows New Article button for TECHNICIAN", () => {
    render(<KnowledgeBaseHeader onSearch={jest.fn()} role="TECHNICIAN" search="" />);

    expect(screen.getByRole("button", { name: "new" })).toBeInTheDocument();
  });
});
