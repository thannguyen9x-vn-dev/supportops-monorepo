import { render, screen } from "@testing-library/react";

import type { RequestDetail, SectionVisibility } from "../../types";
import { SlaCard } from "./SlaCard";

const visibility: SectionVisibility = {
  showSlaDetails: true,
  showEscalationRules: false,
  showAuditSummary: false,
  showInternalNotes: false,
  metadataAccess: "BASIC",
  metadataEditable: false,
};

function createRequest(status: RequestDetail["status"], resolutionTargetAt: string): RequestDetail {
  return {
    id: "r-1",
    requestCode: "SR-1",
    title: "Request",
    status,
    priority: "MEDIUM",
    updatedAtLabel: "now",
    requester: { id: "u-1", name: "Requester" },
    assignee: { id: "u-2", name: "Assignee", roleLabel: "Assignee" },
    assignment: { queueLabel: "Queue", handoffHistory: [] },
    relationship: { isRequester: false, isAssignee: true },
    canAddWorkLog: true,
    overview: {
      serviceType: "IT",
      category: "IT",
      location: "HQ",
      createdAt: "now",
      description: "desc",
    },
    attachments: [],
    sla: {
      assignmentSla: {
        targetAt: "2026-03-29T12:00:00.000Z",
        targetMinutes: 120,
        remainingSeconds: 60 * 60,
        state: "ON_TRACK",
        totalPausedSeconds: 0,
      },
      resolutionSla: {
        targetAt: resolutionTargetAt,
        targetMinutes: 60,
        remainingSeconds: 20 * 60,
        state: "ON_TRACK",
        totalPausedSeconds: 0,
      },
      escalationRules: [],
    },
    metadata: { tenantName: "Tenant", tags: [] },
    timeline: [],
    comments: [],
    auditSummary: [],
  };
}

describe("SlaCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-29T11:40:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders assignment and resolution timers", () => {
    const request = createRequest("IN_PROGRESS", "2026-03-29T12:00:00.000Z");

    render(<SlaCard request={request} visibility={visibility} />);

    expect(screen.getByText("sla.assignment")).toBeInTheDocument();
    expect(screen.getByText("sla.resolution")).toBeInTheDocument();
  });

  it("shows paused banner when waiting for customer", () => {
    const request = createRequest("WAITING_FOR_CUSTOMER", "2026-03-29T12:00:00.000Z");

    render(<SlaCard request={request} visibility={visibility} />);

    expect(screen.getByText("sla.pausedReason")).toBeInTheDocument();
    expect(screen.getAllByText("Paused").length).toBeGreaterThan(0);
  });

  it("shows near breach state when remaining <= 30 minutes", () => {
    const request = createRequest("IN_PROGRESS", "2026-03-29T12:00:00.000Z");

    render(<SlaCard request={request} visibility={visibility} />);

    expect(screen.getAllByText("Near breach").length).toBeGreaterThan(0);
  });
});
