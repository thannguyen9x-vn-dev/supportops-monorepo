import { getHeaderActions } from "../requestActions";

describe("getHeaderActions", () => {
  it("returns requester draft actions", () => {
    const actions = getHeaderActions({
      role: "EMPLOYEE",
      status: "DRAFT",
      isRequester: true,
      isAssignee: false,
      hasAssignee: false,
    });

    expect(actions).toEqual(["EDIT_DRAFT", "SUBMIT"]);
  });

  it("returns triage actions for coordinator without duplicate ASSIGN", () => {
    const actions = getHeaderActions({
      role: "OPS_COORDINATOR",
      status: "TRIAGE",
      isRequester: false,
      isAssignee: false,
      hasAssignee: true,
    });

    expect(actions).toContain("REASSIGN");
    expect(actions).toContain("ASSIGN_TO_ME");
    expect(actions).not.toContain("ASSIGN");
  });

  it("filters REASSIGN for technician", () => {
    const actions = getHeaderActions({
      role: "TECHNICIAN",
      status: "ASSIGNED",
      isRequester: false,
      isAssignee: false,
      hasAssignee: true,
    });

    expect(actions).not.toContain("REASSIGN");
    expect(actions).toContain("ASSIGN_TO_ME");
  });

  it("allows close and reopen in resolved for requester", () => {
    const actions = getHeaderActions({
      role: "EMPLOYEE",
      status: "RESOLVED",
      isRequester: true,
      isAssignee: false,
      hasAssignee: true,
    });

    expect(actions).toContain("CLOSE");
    expect(actions).toContain("REOPEN");
  });

  it("returns admin closed actions", () => {
    const actions = getHeaderActions({
      role: "TENANT_ADMIN",
      status: "CLOSED",
      isRequester: false,
      isAssignee: false,
      hasAssignee: true,
    });

    expect(actions).toEqual(["REOPEN", "ADD_NOTE"]);
  });
});
