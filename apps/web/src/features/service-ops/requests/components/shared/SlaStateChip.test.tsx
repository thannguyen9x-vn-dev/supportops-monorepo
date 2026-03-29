import { render, screen } from "@testing-library/react";

import { SlaStateChip } from "./SlaStateChip";

describe("SlaStateChip", () => {
  it("renders ON_TRACK", () => {
    render(<SlaStateChip state="ON_TRACK" />);
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("renders NEAR_BREACH", () => {
    render(<SlaStateChip state="NEAR_BREACH" />);
    expect(screen.getByText("Near breach")).toBeInTheDocument();
  });

  it("renders PAUSED", () => {
    render(<SlaStateChip state="PAUSED" />);
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("renders BREACHED", () => {
    render(<SlaStateChip state="BREACHED" />);
    expect(screen.getByText("Breached")).toBeInTheDocument();
  });
});
