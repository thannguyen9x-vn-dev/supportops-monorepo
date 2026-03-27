import { eventIcon, formatRemainingTime, formatTargetMinutes, resolveScenarioByRole, resolveSlaSummaryState } from "../formatters";

describe("request formatters", () => {
  it("formats remaining time with zero padding", () => {
    expect(formatRemainingTime(3661)).toBe("01:01:01");
    expect(formatRemainingTime(-1)).toBe("00:00:00");
  });

  it("formats target minutes", () => {
    expect(formatTargetMinutes(120)).toBe("2 hours");
    expect(formatTargetMinutes(90)).toBe("90 min");
  });

  it("resolves scenario by role", () => {
    expect(resolveScenarioByRole("EMPLOYEE")).toBe("requesterResolved");
    expect(resolveScenarioByRole("TENANT_ADMIN")).toBe("coordinatorTriage");
    expect(resolveScenarioByRole()).toBe("technicianInProgress");
  });

  it("resolves SLA summary state", () => {
    expect(resolveSlaSummaryState({ assignmentSla: { state: "ON_TRACK" }, resolutionSla: { state: "AT_RISK" }, escalationRules: [] } as never)).toBe("AT_RISK");
    expect(resolveSlaSummaryState({ assignmentSla: { state: "BREACHED" }, resolutionSla: undefined, escalationRules: [] } as never)).toBe("BREACHED");
  });

  it("maps event icon", () => {
    expect(eventIcon("ESCALATED")).toEqual({ name: "report", color: "error" });
    expect(eventIcon("STATUS_CHANGED")).toEqual({ name: "chevron" });
  });
});
