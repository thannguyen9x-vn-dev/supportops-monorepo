import {
  canAddInternalNote,
  canEditMetadata,
  canReopenRequest,
  canViewAuditSummary,
  canViewComment,
  canViewInternalNotes,
  canViewTimelineItem,
  getSectionVisibility,
  isInternalRole,
  resolveMetadataAccessLevel,
} from "../requestAccess";

describe("requestAccess", () => {
  it("detects internal roles", () => {
    expect(isInternalRole("OPS_COORDINATOR")).toBe(true);
    expect(isInternalRole("EMPLOYEE")).toBe(false);
  });

  it("guards notes and audit visibility", () => {
    expect(canViewInternalNotes("TENANT_ADMIN")).toBe(true);
    expect(canAddInternalNote("EMPLOYEE")).toBe(false);
    expect(canViewAuditSummary("TECHNICIAN")).toBe(true);
    expect(canViewAuditSummary("EMPLOYEE")).toBe(false);
  });

  it("handles metadata access", () => {
    expect(canEditMetadata("TENANT_ADMIN")).toBe(true);
    expect(resolveMetadataAccessLevel("TECHNICIAN")).toBe("LIMITED");
    expect(resolveMetadataAccessLevel("EMPLOYEE")).toBe("BASIC");
  });

  it("checks reopen permissions", () => {
    expect(canReopenRequest({ role: "EMPLOYEE", status: "RESOLVED", isRequester: true })).toBe(true);
    expect(canReopenRequest({ role: "EMPLOYEE", status: "RESOLVED", isRequester: false })).toBe(false);
    expect(canReopenRequest({ role: "TECHNICIAN", status: "CLOSED", isRequester: false })).toBe(false);
  });

  it("filters comment and timeline by visibility", () => {
    expect(canViewComment("EMPLOYEE", "PUBLIC")).toBe(true);
    expect(canViewComment("EMPLOYEE", "INTERNAL")).toBe(false);
    expect(canViewTimelineItem("TENANT_ADMIN", "INTERNAL")).toBe(true);
  });

  it("returns section visibility map", () => {
    const visibility = getSectionVisibility("OPS_COORDINATOR");
    expect(visibility.metadataEditable).toBe(true);
    expect(visibility.showSlaDetails).toBe(true);
  });
});
